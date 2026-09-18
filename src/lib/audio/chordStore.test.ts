import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import {
  resetChordTracking, chordCurrent, chordConfidence, chordLoop, chordHistory, clearHistory,
} from './chordStore';

function quietFrame(bins: number): Float32Array {
  return new Float32Array(bins).fill(-200);
}

describe('chordLoop', () => {
  it('silencio limpia el estado y no lanza', () => {
    resetChordTracking();
    chordLoop(quietFrame(4096), 44100, 8192);
    expect(get(chordCurrent)).toBeNull();
  });

  it('silencio deja el mensaje de escucha', () => {
    resetChordTracking();
    chordLoop(quietFrame(4096), 44100, 8192);
    expect(get(chordConfidence)).toBe('Escuchando una señal clara...');
  });

  it('frames vacíos no rompen la historia', () => {
    resetChordTracking();
    chordLoop(quietFrame(4096), 44100, 8192);
    chordLoop(quietFrame(4096), 44100, 8192);
    expect(get(chordHistory)).toEqual([]);
  });
});

describe('resetChordTracking / clearHistory', () => {
  it('reset NO borra el historial (P0.2)', () => {
    resetChordTracking();
    chordHistory.set(['C']);
    resetChordTracking();
    expect(get(chordHistory)).toEqual(['C']);
  });

  it('clearHistory sí borra el historial', () => {
    chordHistory.set(['C', 'G']);
    clearHistory();
    expect(get(chordHistory)).toEqual([]);
  });
});