export const STANDARD_TUNING = [
  { note: 'E2', freq: 82.41 },
  { note: 'A2', freq: 110.0 },
  { note: 'D3', freq: 146.83 },
  { note: 'G3', freq: 196.0 },
  { note: 'B3', freq: 246.94 },
  { note: 'E4', freq: 329.63 },
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;

  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let start = 0;
  let end = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[i]) > thres) { start = i; break; }
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[SIZE - 1 - i]) > thres) { end = SIZE - 1 - i; break; }

  const trimmed = buffer.slice(start, end);
  const n = Math.min(trimmed.length, Math.floor(sampleRate / 65));
  if (n < 2) return -1;

  const c = new Array(n).fill(0);
  for (let lag = 0; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += trimmed[i] * trimmed[i + lag];
    c[lag] = sum;
  }

  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;

  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxVal) { maxVal = c[i]; maxPos = i; }
  }
  if (maxPos <= 0 || maxPos >= n - 1) return -1;

  const x1 = c[maxPos - 1];
  const x2 = c[maxPos];
  const x3 = c[maxPos + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  const shift = a ? -b / (2 * a) : 0;
  const period = maxPos + shift;

  if (period <= 0) return -1;
  return sampleRate / period;
}

export function closestTuningNote(freq: number) {
  let best = STANDARD_TUNING[0];
  let bestDiff = Infinity;
  for (const t of STANDARD_TUNING) {
    const diff = Math.abs(t.freq - freq);
    if (diff < bestDiff) { bestDiff = diff; best = t; }
  }
  return best;
}

export function centsOff(freq: number, targetFreq: number): number {
  return 1200 * Math.log2(freq / targetFreq);
}

export interface TunerState {
  freq: number;
  note: string;
  cents: number;
  clamped: number;
  tuned: boolean;
}

export function analyzeTuner(freq: number): TunerState | null {
  if (freq < 0) return null;
  const target = closestTuningNote(freq);
  const cents = centsOff(freq, target.freq);
  const clamped = Math.max(-50, Math.min(50, cents));
  return { freq, note: target.note, cents, clamped, tuned: Math.abs(cents) < 5 };
}