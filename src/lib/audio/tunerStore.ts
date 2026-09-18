import { writable } from 'svelte/store';
import { autoCorrelate, analyzeTuner } from './autocorrelate';
import { registerFrameHandler, getTimeData, getSampleRate } from './engine';
import { createThrottle } from './throttle';

export interface TunerFrame {
  freq: number;
  note: string;
  cents: number;
  clamped: number;
  tuned: boolean;
  active: boolean;
}

export const tunerFrame = writable<TunerFrame>({ freq: -1, note: '--', cents: 0, clamped: 0, tuned: false, active: false });

const throttleFrame = createThrottle(tunerFrame);
let lastActive = false;

export function tunerLoop(timeData: Float32Array, sampleRate: number): void {
  const freq = autoCorrelate(timeData, sampleRate);
  const analysis = analyzeTuner(freq);
  if (!analysis) {
    const silent: TunerFrame = { freq: -1, note: '--', cents: 0, clamped: 0, tuned: false, active: false };
    if (lastActive) { throttleFrame.flushNow(silent); lastActive = false; }
    else throttleFrame.set(silent);
    return;
  }
  const frame: TunerFrame = { ...analysis, active: true };
  if (!lastActive) { throttleFrame.flushNow(frame); lastActive = true; }
  else throttleFrame.set(frame);
}

export function registerTunerFrameHandler(): void {
  registerFrameHandler('tuner', () => {
    const data = getTimeData();
    if (data.length) tunerLoop(data, getSampleRate());
  });
}