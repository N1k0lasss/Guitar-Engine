import type { Writable } from 'svelte/store';

export interface ThrottledWriter<T> {
  set: (value: T) => void;
  flushNow: (value: T) => void;
}

export function createThrottle<T>(store: Writable<T>, intervalMs = 50): ThrottledWriter<T> {
  let initialized = false;
  let last = 0;
  let pending: T | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = (value: T) => {
    store.set(value);
    last = performance.now();
    initialized = true;
    pending = null;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    set(value: T) {
      const now = performance.now();
      if (!initialized || now - last >= intervalMs) {
        flush(value);
        return;
      }
      pending = value;
      if (timer === null) {
        timer = setTimeout(() => {
          if (pending !== null) flush(pending);
        }, Math.max(1, intervalMs - (now - last)));
      }
    },
    flushNow(value: T) {
      flush(value);
    },
  };
}