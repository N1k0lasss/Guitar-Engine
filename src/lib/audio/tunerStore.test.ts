import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { tunerLoop, tunerFrame } from './tunerStore';

describe('tunerLoop', () => {
  it('silencio → frame inactivo', () => {
    tunerLoop(new Float32Array(4096), 44100);
    const frame = get(tunerFrame);
    expect(frame.active).toBe(false);
    expect(frame.note).toBe('--');
  });

  it('onda senoidal de 440 Hz produce una nota activa', () => {
    const sampleRate = 44100;
    const size = 8192;
    const buf = new Float32Array(size);
    for (let i = 0; i < size; i++) buf[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
    tunerLoop(buf, sampleRate);
    const frame = get(tunerFrame);
    expect(frame.active).toBe(true);
    expect(frame.tuned).toBe(false);
    expect(frame.note).toBe('E4');
    expect(frame.freq).toBeGreaterThan(400);
    expect(frame.freq).toBeLessThan(480);
  });
});