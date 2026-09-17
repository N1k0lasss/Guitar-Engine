import { get } from 'svelte/store';
import { ensureWav, resumeWav } from './engine';
import type { PlayItem } from '../theory/harmony';
import { harmonyProgTempo } from '../theory/harmony';

let master: GainNode | null = null;
let currentTimeouts: number[] = [];

function ensureMaster(): GainNode | null {
  const ctx = ensureWav();
  if (!ctx) return null;
  resumeWav();
  if (!master || master.context !== ctx) {
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  return master;
}

type SynthMode = 'synth' | 'pluck';

function synthVoice(ctx: AudioContext, freq: number, t0: number, dur: number, gain: number, pan: number, mode: SynthMode): void {
  const out = ensureMaster();
  if (!out) return;

  const panNode = ctx.createStereoPanner();
  panNode.pan.value = pan;
  panNode.connect(out);

  if (mode === 'pluck') {
    const partials = 12;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * Math.min(dur * 1.6, 5)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      let sample = 0;
      for (let h = 1; h <= partials; h++) {
        const decay = 1 / (h * 1.15);
        sample += Math.sin(2 * Math.PI * freq * h * t) * decay * Math.exp(-t * (2.5 + h * 1.6));
      }
      data[i] = sample * 0.28;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(panNode);
    src.start(t0);
    src.stop(t0 + dur * 1.6 + 0.05);
  } else {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(panNode);
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);
  }
}

export function playPlan(plan: PlayItem[], mode: SynthMode = 'synth'): void {
  const ctx = ensureWav();
  if (!ctx) return;
  resumeWav();
  for (const item of plan) {
    synthVoice(ctx, item.freq, ctx.currentTime + item.t0 / 1000, Math.max(item.dur / 1000, 0.15), Math.min(item.gain, 1), item.pan, mode);
  }
}

export function playChordPlan(plan: PlayItem[], mode: SynthMode = 'synth'): void {
  playPlan(plan, mode);
}

export function playProgPlan(plan: PlayItem[][], bpm = 0): void {
  const ctx = ensureWav();
  if (!ctx) return;
  resumeWav();
  const tempo = bpm || get(harmonyProgTempo);
  const start = ctx.currentTime + 0.08;
  const beat = (240000 / tempo + 80) / 1000;
  plan.forEach((items, index) => {
    for (const item of items) {
      synthVoice(ctx, item.freq, start + index * beat + item.t0 / 1000, Math.max(item.dur / 1000, 0.15), Math.min(item.gain, 1), item.pan, 'synth');
    }
  });
}

export function stopAll(): void {
  currentTimeouts.forEach(t => { clearTimeout(t); });
  currentTimeouts = [];
}