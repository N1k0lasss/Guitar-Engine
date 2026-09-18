import { describe, expect, it } from 'vitest';
import {
  autoCorrelate, closestTuningNote, centsOff, analyzeTuner, STANDARD_TUNING,
} from './autocorrelate';

describe('STANDARD_TUNING', () => {
  it('afina las 6 cuerdas', () => {
    expect(STANDARD_TUNING).toHaveLength(6);
    expect(STANDARD_TUNING[0]).toEqual({ note: 'E2', freq: 82.41 });
    expect(STANDARD_TUNING[5]).toEqual({ note: 'E4', freq: 329.63 });
  });
});

describe('autoCorrelate', () => {
  it('silencio → -1', () => {
    const buf = new Float32Array(4096);
    expect(autoCorrelate(buf, 44100)).toBe(-1);
  });

  it('onda senoidal de 440 Hz se detecta cerca de 440', () => {
    const sampleRate = 44100;
    const size = 8192;
    const buf = new Float32Array(size);
    for (let i = 0; i < size; i++) buf[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
    const freq = autoCorrelate(buf, sampleRate);
    expect(freq).toBeGreaterThan(400);
    expect(freq).toBeLessThan(480);
  });

  it('onda de 220 Hz rinde la octava baja', () => {
    const sampleRate = 44100;
    const size = 8192;
    const buf = new Float32Array(size);
    for (let i = 0; i < size; i++) buf[i] = Math.sin(2 * Math.PI * 220 * i / sampleRate);
    const freq = autoCorrelate(buf, sampleRate);
    expect(freq).toBeGreaterThan(200);
    expect(freq).toBeLessThan(245);
  });
});

describe('centrado y detección', () => {
  it('closestTuningNote elige la cuerda más cercana', () => {
    expect(closestTuningNote(440).note).toBe('E4');
    expect(closestTuningNote(82.41).note).toBe('E2');
  });

  it('centsOff de 0 cent cuando está afinado', () => {
    expect(centsOff(440, 440)).toBeCloseTo(0, 6);
    expect(centsOff(441, 440)).toBeCloseTo(3.93, 1);
  });

  it('analyzeTuner: señal sin datos → null, afinado → tuned', () => {
    expect(analyzeTuner(-1)).toBeNull();
    const ok = analyzeTuner(329.63)!;
    expect(ok.note).toBe('E4');
    expect(ok.tuned).toBe(true);
    expect(ok.clamped).toBeCloseTo(0, 6);
  });

  it('analyzeTuner: 440 Hz cae en E4 pero desviado ~498 cent', () => {
    const stray = analyzeTuner(440)!;
    expect(stray.note).toBe('E4');
    expect(stray.tuned).toBe(false);
    expect(stray.clamped).toBe(50);
  });

  it('analyzeTuner: clamp a ±50 cent en la escala del meter', () => {
    const high = analyzeTuner(329.63 * Math.pow(2, 60 / 1200))!;
    expect(high.note).toBe('E4');
    expect(high.cents).toBeGreaterThan(50);
    expect(high.clamped).toBe(50);
    const low = analyzeTuner(329.63 * Math.pow(2, -60 / 1200))!;
    expect(low.note).toBe('E4');
    expect(low.cents).toBeLessThan(-50);
    expect(low.clamped).toBe(-50);
  });

  it('analyzeTuner: la zona de afinado es ±5 cent', () => {
    const flat = analyzeTuner(329.633 * Math.pow(2, -3 / 1200))!;
    expect(flat.tuned).toBe(true);
    const off = analyzeTuner(329.633 * Math.pow(2, -6 / 1200))!;
    expect(off.tuned).toBe(false);
  });
});