import { describe, expect, it } from 'vitest';
import {
  FIFTHS, circleNoteAt, keyChords, KEY_SIGNS, MAJOR_QUALITIES, MAJOR_ROMANS,
} from './circles';

describe('círculo de quintas', () => {
  it('FIFTHS recorre las 12 quintas', () => {
    expect(FIFTHS).toHaveLength(12);
    expect(FIFTHS[0]).toBe('C');
    expect(FIFTHS[1]).toBe('G');
    expect(FIFTHS[3]).toBe('A');
    expect(FIFTHS[11]).toBe('F');
  });

  it('todas las quintas adyacentes distan 7 semitonos', () => {
    for (let i = 0; i < FIFTHS.length - 1; i++) {
      const a = circleNoteAt(FIFTHS[i], 7);
      expect(a).toBe(FIFTHS[i + 1]);
    }
  });

  it('C no tiene alteraciones y G tiene 1 sostenido', () => {
    expect(KEY_SIGNS.C).toBe('sin alteraciones');
    expect(KEY_SIGNS.G).toBe('1 sostenido');
  });
});

describe('keyChords', () => {
  it('C mayor produce la progresión diatónica', () => {
    const chords = keyChords('C');
    expect(chords.map(c => c.name)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
    expect(chords.map(c => c.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });

  it('G mayor lleva F# en el vii°', () => {
    const chords = keyChords('G');
    expect(chords[6].name).toBe('F#dim');
    expect(chords[6].roman).toBe('vii°');
  });

  it('las cualidades y romanos tienen longitud 7', () => {
    expect(MAJOR_QUALITIES).toHaveLength(7);
    expect(MAJOR_ROMANS).toHaveLength(7);
  });
});