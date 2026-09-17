import { writable } from 'svelte/store';
import { autoCorrelate, analyzeTuner } from './autocorrelate';
import { registerFrameHandler, getTimeData, getSampleRate } from './engine';

export interface TunerFrame {
  freq: number;
  note: string;
  cents: number;
  clamped: number;
  tuned: boolean;
  active: boolean;
}

export const tunerFrame = writable<TunerFrame>({ freq: -1, note: '--', cents: 0, clamped: 0, tuned: false, active: false });

export function tunerLoop(timeData: Float32Array, sampleRate: number): void {
  const freq = autoCorrelate(timeData, sampleRate);
  const analysis = analyzeTuner(freq);
  if (!analysis) {
    tunerFrame.set({ freq: -1, note: '--', cents: 0, clamped: 0, tuned: false, active: false });
    return;
  }
  tunerFrame.set({ ...analysis, active: true });
}

export function registerTunerFrameHandler(): void {
  registerFrameHandler('tuner', () => {
    const data = getTimeData();
    if (data.length) tunerLoop(data, getSampleRate());
  });
}