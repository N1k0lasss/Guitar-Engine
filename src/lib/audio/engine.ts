import { writable } from 'svelte/store';

export type AudioStatus = 'idle' | 'live' | 'error';

export const audioStatus = writable<AudioStatus>('idle');
export const audioError = writable('');

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let stream: MediaStream | null = null;
let freqData: Float32Array<ArrayBuffer> | null = null;
let timeData: Float32Array<ArrayBuffer> | null = null;
let running = false;
let rafId: number | null = null;
let mode = 'chords';

const handlers = new Map<string, () => void>();

export function registerFrameHandler(key: string, fn: () => void): void {
  handlers.set(key, fn);
}

export function engineSetMode(next: string): void {
  mode = next;
}

export function ensureWav(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Adapter = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Adapter) return null;
    ctx = new Adapter();
    return ctx;
  } catch {
    return null;
  }
}

export function resumeWav(): void {
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => undefined);
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}

export function getSampleRate(): number {
  return ctx ? ctx.sampleRate : 44100;
}

export function getFftSize(): number {
  return analyser ? analyser.fftSize : 8192;
}

export async function startAudio(): Promise<void> {
  if (running) return;
  try {
    const Adapter = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Adapter || !navigator.mediaDevices?.getUserMedia) throw new Error('Micrófono no disponible');
    if (!ctx) ctx = new Adapter();
    if (ctx.state === 'suspended') await ctx.resume();
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    source = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    freqData = new Float32Array(analyser.frequencyBinCount);
    timeData = new Float32Array(analyser.fftSize);
    running = true;
    audioStatus.set('live');
    audioError.set('');
    loop();
  } catch (error) {
    running = false;
    audioStatus.set('error');
    audioError.set(error instanceof Error ? error.message : 'Micrófono bloqueado');
    stopAudio();
  }
}

export function stopAudio(): void {
  running = false;
  stream?.getTracks().forEach(track => track.stop());
  ctx?.close().catch(() => undefined);
  ctx = null;
  analyser = null;
  source = null;
  stream = null;
  freqData = null;
  timeData = null;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  audioStatus.set('idle');
}

function loop(): void {
  if (!running) return;
  const handler = handlers.get(mode);
  if (handler) handler();
  rafId = requestAnimationFrame(loop);
}

export function getFreqData(): Float32Array<ArrayBuffer> {
  if (!analyser || !freqData) return new Float32Array(0);
  analyser.getFloatFrequencyData(freqData);
  return freqData;
}

export function getTimeData(): Float32Array<ArrayBuffer> {
  if (!analyser || !timeData) return new Float32Array(0);
  analyser.getFloatTimeDomainData(timeData);
  return timeData;
}