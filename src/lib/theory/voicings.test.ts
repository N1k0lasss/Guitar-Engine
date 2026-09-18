import { describe, expect, it } from 'vitest';
import {
  getChordVoicings, getChordVoicing, fretWindow, voiInvert, voiApplyDrop, getVoicingData,
  VOICING_QUALITIES, DROPS,
} from './voicings';

describe('getChordVoicings', () => {
  it('C mayor incluye forma abierta y barres', () => {
    const voicings = getChordVoicings('C');
    const ids = voicings.map(v => v.id);
    expect(ids).toContain('open');
    expect(ids).toContain('e');
    expect(ids).toContain('a');
  });

  it('getChordVoicing selecciona por id o la primera', () => {
    const open = getChordVoicing('C', 'open');
    expect(open?.frets).toEqual([null, 3, 2, 0, 1, 0]);
  });

  it('un nombre inválido devuelve lista vacía', () => {
    expect(getChordVoicings('Hjunk')).toEqual([]);
  });
});

describe('fretWindow', () => {
  it('detecta cuerdas al aire', () => {
    const w = fretWindow([null, 3, 2, 0, 1, 0]);
    expect(w.hasOpen).toBe(true);
    expect(w.base).toBe(0);
  });

  it('top acota a 15 trastes', () => {
    const w = fretWindow([null, 14, 16, 12, null, null]);
    expect(w.top).toBe(15);
    expect(w.base).toBe(12);
  });

  it('todo nulo → ventana unitaria', () => {
    const w = fretWindow([null, null, null, null, null, null]);
    expect(w).toEqual({ base: 1, top: 1, hasOpen: false });
  });
});

describe('voiInvert', () => {
  it('rota intervalos sumando una octava', () => {
    expect(voiInvert([0, 4, 7], 0)).toEqual([0, 4, 7]);
    const inv1 = voiInvert([0, 4, 7], 1);
    expect(inv1[0]).toBe(4);
    expect(inv1[2]).toBe(12);
  });
});

describe('voiApplyDrop', () => {
  it('close devuelve tal cual', () => {
    expect(voiApplyDrop([0, 4, 7, 11], 'close')).toEqual([0, 4, 7, 11]);
  });

  it('drop2 baja la tercera voz una octava', () => {
    expect(voiApplyDrop([0, 4, 7, 11], 'drop2')).toEqual([-5, 0, 4, 11]);
  });

  it('drop3 baja la segunda voz', () => {
    expect(voiApplyDrop([0, 4, 7, 11], 'drop3')).toEqual([-8, 0, 7, 11]);
  });
});

describe('getVoicingData', () => {
  it('maj7 de C en posición cerrada', () => {
    const d = getVoicingData('C', 'maj7', 0, 'close');
    expect(d.notes).toEqual(['C', 'E', 'G', 'B']);
    expect(d.degrees).toEqual(['R', '3', '5', '7']);
  });

  it('1a inversión reordena grados', () => {
    const d = getVoicingData('C', 'maj7', 1, 'close');
    expect(d.notes[0]).toBe('E');
    expect(d.degrees[0]).toBe('3');
  });
});

describe('catálogo', () => {
  it('VOICING_QUALITIES cubre 6 cualidades', () => {
    expect(Object.keys(VOICING_QUALITIES)).toHaveLength(6);
  });

  it('DROPS y DROP_TYPES son coherentes', () => {
    expect(DROPS.length).toBeGreaterThan(0);
    expect(DROPS[0].id).toBe('drop2');
  });
});