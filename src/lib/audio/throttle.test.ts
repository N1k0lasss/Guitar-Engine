import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { writable, get } from 'svelte/store';
import { createThrottle } from './throttle';

describe('createThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('el primer set se emite de inmediato', () => {
    const store = writable(0);
    const t = createThrottle(store, 50);
    t.set(1);
    expect(get(store)).toBe(1);
  });

  it('sets sucesivos se aplazan hasta el intervalo (trailing)', () => {
    const store = writable(0);
    const t = createThrottle(store, 50);
    t.set(1);
    t.set(2);
    t.set(3);
    expect(get(store)).toBe(1);
    vi.advanceTimersByTime(60);
    expect(get(store)).toBe(3);
  });

  it('flushNow fuerza la escritura inmediata', () => {
    const store = writable(0);
    const t = createThrottle(store, 50);
    t.set(1);
    t.set(2);
    t.flushNow(9);
    expect(get(store)).toBe(9);
    vi.advanceTimersByTime(60);
    expect(get(store)).toBe(9);
  });
});