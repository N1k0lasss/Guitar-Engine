import { writable, get } from 'svelte/store';
import { CHORD_TYPES, getChordInfo } from '../theory/chords';
import { registerFrameHandler, getFreqData, getSampleRate, getFftSize } from './engine';

let smoothedChroma = new Array<number>(12).fill(0);
let candidateName: string | null = null;
let candidateFrames = 0;
let stableName: string | null = null;
let chordCooldownUntil = 0;

export const chordCurrent = writable<string | null>(null);
export const chordConfidence = writable<string>('Esperando una señal clara...');
export const chordHistory = writable<string[]>([]);
export const chordNotesList = writable<string[]>([]);
export const chordInProgress = writable(false);

export function resetChordTracking(): void {
  smoothedChroma = new Array(12).fill(0);
  candidateName = null;
  candidateFrames = 0;
  stableName = null;
  chordCooldownUntil = 0;
  chordCurrent.set(null);
  chordConfidence.set('Esperando una señal clara...');
  chordHistory.set([]);
  chordNotesList.set([]);
  chordInProgress.set(false);
}

function getChroma(data: Float32Array, sampleRate: number, fftSize: number): number[] | null {
  const chroma = new Array<number>(12).fill(0);
  const binHz = sampleRate / fftSize;
  let signalEnergy = 0;
  for (let i = Math.floor(75 / binHz); i < Math.min(Math.ceil(1600 / binHz), data.length); i++) {
    if (data[i] < -72) continue;
    const midi = Math.round(69 + 12 * Math.log2((i * binHz) / 440));
    const magnitude = Math.pow(10, data[i] / 20);
    const frequencyWeight = Math.max(0.25, 1 - (i * binHz) / 2200);
    chroma[((midi % 12) + 12) % 12] += magnitude * frequencyWeight;
    signalEnergy += magnitude;
  }
  if (signalEnergy < 0.08) return null;
  const max = Math.max(...chroma);
  return max ? chroma.map(value => value / max) : chroma;
}

function detectChord(chroma: number[]): { score: number; name: string } | null {
  const totalEnergy = chroma.reduce((sum, value) => sum + value, 0);
  if (totalEnergy < 1.25) return null;
  let best = { score: 0, name: '' };
  for (const type of Object.values(CHORD_TYPES)) {
    for (let root = 0; root < 12; root++) {
      let score = 0;
      let outside = 0;
      type.template.forEach((weight, interval) => {
        const value = chroma[(root + interval) % 12];
        score += value * (weight ? 1.3 : -0.28);
        if (!weight) outside += value;
      });
      const normalized = score / (type.intervals.length + outside * 0.75);
      if (normalized > best.score) best = { score: normalized, name: notesOfRoot(root) + type.label };
    }
  }
  return best.score > 0.36 ? best : null;
}

function notesOfRoot(root: number): string {
  return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root];
}

export function chordLoop(data: Float32Array, sampleRate: number, fftSize: number): void {
  const now = performance.now();
  if (chordCooldownUntil > now) {
    const secondsLeft = Math.ceil((chordCooldownUntil - now) / 1000);
    chordConfidence.set(`Acorde capturado · escuchando de nuevo en ${secondsLeft}s`);
    return;
  }
  if (chordCooldownUntil) {
    chordCooldownUntil = 0;
    smoothedChroma = new Array(12).fill(0);
    candidateName = null;
    candidateFrames = 0;
    stableName = null;
    chordConfidence.set('Nueva captura: toca el siguiente acorde');
  }

  const chroma = getChroma(data, sampleRate, fftSize);
  if (!chroma) {
    chordCurrent.set(null);
    chordConfidence.set('Escuchando una señal clara...');
    candidateName = null;
    candidateFrames = 0;
    chordInProgress.set(false);
    return;
  }

  smoothedChroma = smoothedChroma.map((value, index) => value * 0.82 + chroma[index] * 0.18);
  const result = detectChord(smoothedChroma);
  if (!result) return;

  chordInProgress.set(true);
  if (candidateName === result.name) candidateFrames += 1;
  else { candidateName = result.name; candidateFrames = 1; }
  stableName = candidateFrames >= 4 ? result.name : stableName;
  chordCurrent.set(stableName || result.name);
  chordConfidence.set(candidateFrames < 4
    ? 'Confirmando...'
    : `Señal estable · coincidencia ${Math.round(Math.min(result.score / 0.7, 1) * 100)}%`);

  if (stableName && get(chordHistory)[get(chordHistory).length - 1] !== stableName && !detectedSet.has(stableName)) {
    detectedSet.add(stableName);
    chordHistory.update(list => {
      let next = [...list, stableName as string];
      if (next.length > 8) next = next.slice(next.length - 8);
      return next;
    });
    const info = getChordInfo(stableName);
    chordNotesList.set(info ? info.notes : []);
    chordCooldownUntil = now + 3000;
  }
}

const detectedSet = new Set<string>();

export function clearHistory(): void {
  chordHistory.set([]);
  chordNotesList.set([]);
  detectedSet.clear();
}

export function registerChordFrameHandler(): void {
  registerFrameHandler('chords', () => {
    const data = getFreqData();
    if (data.length) chordLoop(data, getSampleRate(), getFftSize());
  });
}