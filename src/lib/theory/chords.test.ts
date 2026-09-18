import { describe, expect, it } from 'vitest';
import {
  CHORD_TYPES, chordTypeLabel, parseChordName, chordNotes, getFingering,
  getChordInfo, qualityFamily, qualityFamilyOf, qualityColor,
} from './chords';

describe('CHORD_TYPES', () => {
  it('cubre los 9 tipos básicos', () => {
    expect(Object.keys(CHORD_TYPES)).toHaveLength(9);
  });

  it('triada mayor = [0,4,7]', () => {
    expect(CHORD_TYPES[''].intervals).toEqual([0, 4, 7]);
  });

  it('dominante 7 = [0,4,7,10]', () => {
    expect(CHORD_TYPES['7'].intervals).toEqual([0, 4, 7, 10]);
  });
});

describe('chordTypeLabel', () => {
  it('traduce códigos a etiquetas', () => {
    expect(chordTypeLabel('')).toBe('Mayor');
    expect(chordTypeLabel('m')).toBe('Menor');
    expect(chordTypeLabel('7')).toBe('Dominante 7');
    expect(chordTypeLabel('nope')).toBe('nope');
  });
});

describe('parseChordName', () => {
  it('parsea triada mayor', () => {
    expect(parseChordName('C')).toEqual({ root: 'C', quality: '' });
  });

  it('parsea menor', () => {
    expect(parseChordName('Am')).toEqual({ root: 'A', quality: 'm' });
  });

  it('parsea séptimas', () => {
    expect(parseChordName('G7')).toEqual({ root: 'G', quality: '7' });
    expect(parseChordName('Dmaj7')).toEqual({ root: 'D', quality: 'maj7' });
  });

  it('acepta sostenidos y bemoles', () => {
    expect(parseChordName('F#m7')).toEqual({ root: 'F#', quality: 'm7' });
    expect(parseChordName('Bb7')?.root).toBe('Bb');
    expect(parseChordName('Bb7')?.quality).toBe('7');
  });

  it('rechaza nombres inválidos', () => {
    expect(parseChordName('')).toBeNull();
    expect(parseChordName('Hmaj7')).toBeNull();
  });
});

describe('chordNotes', () => {
  it('C mayor = C E G', () => {
    expect(chordNotes('C', '')).toEqual(['C', 'E', 'G']);
  });

  it('Am = A C E', () => {
    expect(chordNotes('A', 'm')).toEqual(['A', 'C', 'E']);
  });

  it('G7 = G B D F', () => {
    expect(chordNotes('G', '7')).toEqual(['G', 'B', 'D', 'F']);
  });

  it('root inválido → []', () => {
    expect(chordNotes('H', '')).toEqual([]);
  });
});

describe('getFingering', () => {
  it('usa la forma abierta de C cuando existe', () => {
    const f = getFingering('C', '');
    expect(f.frets).toEqual([null, 3, 2, 0, 1, 0]);
    expect(f.label).toContain('abierta');
  });

  it('traslada formas móviles por la diferencia de semitonos', () => {
    const f = getFingering('D', '');
    expect(f.frets).toEqual([null, null, 0, 2, 3, 2]);
  });

  it('la forma móvil de A para F mayor sube 8 trastes', () => {
    const f = getFingering('F', '');
    const base = [null, 0, 2, 2, 2, 0];
    expect(f.frets).toEqual(base.map(n => (n === null ? null : n + 8)));
    expect(f.label).toBe('Forma móvil de A');
  });
});

describe('getChordInfo', () => {
  it('compone notas + digitación', () => {
    const info = getChordInfo('C');
    expect(info?.notes).toEqual(['C', 'E', 'G']);
    expect(info?.fingering.frets).toHaveLength(6);
  });

  it('null para nombres inválidos', () => {
    expect(getChordInfo('Z7')).toBeNull();
  });
});

describe('qualityFamily', () => {
  it('clasifica por familia', () => {
    expect(qualityFamily('C')).toBe('major');
    expect(qualityFamily('Cm')).toBe('minor');
    expect(qualityFamily('Cm7')).toBe('minor');
    expect(qualityFamily('G7')).toBe('dominant');
    expect(qualityFamily('Bdim')).toBe('diminished');
    expect(qualityFamily('Caug')).toBe('augmented');
  });

  it('fallback mayor para inválidos y para qualityFamilyOf', () => {
    expect(qualityFamily('Z')).toBe('major');
    expect(qualityFamilyOf({ root: 'C', quality: 'sus2' })).toBe('major');
  });

  it('qualityColor mapea familias a variables CSS', () => {
    expect(qualityColor('major')).toBe('var(--q-major)');
    expect(qualityColor('augmented')).toBe('var(--q-aug)');
  });
});