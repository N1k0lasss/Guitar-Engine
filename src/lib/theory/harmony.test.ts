import { describe, expect, it } from 'vitest';
import {
  harmonSignatureFor, harmonSpellPc, harmonSpellName, HARMONY_DEGREES, HARMONY_EDGES,
  harmonChordName, harmonChordSet, harmonEdgeGlue, harmonDominantName, harmonSecondaryDominant,
  harmonDomChain, harmonKeyChords, harmonTwoFiveOne, harmonyVariant,
} from './harmony';

describe('harmonSignatureFor / spell', () => {
  it('las tonalidades con bemoles caen en flat', () => {
    expect(harmonSignatureFor(5, 'maj')).toBe('flat'); // F
    expect(harmonSignatureFor(10, 'min')).toBe('flat'); // A#m → Bbm (relativa de Db)
    expect(harmonSignatureFor(0, 'maj')).toBe('sharp'); // C
    expect(harmonSignatureFor(1, 'min')).toBe('sharp'); // C#m (relativa de E)
  });

  it('harmonSpellPc respeta la firma', () => {
    expect(harmonSpellPc(1, 'flat')).toBe('Db');
    expect(harmonSpellPc(1, 'sharp')).toBe('C#');
    expect(harmonSpellName(6)).toBe('F#');
    expect(harmonSpellName(1)).toBe('Db');
  });
});

describe('HARMONY_DEGREES', () => {
  it('mayor: 7 diatónicos + 2 préstamos = 9', () => {
    expect(HARMONY_DEGREES.maj).toHaveLength(9);
    expect(HARMONY_DEGREES.maj.filter(d => d.origin === 'borrowed')).toHaveLength(2);
  });

  it('menor natural: 7 grados', () => {
    expect(HARMONY_DEGREES.min).toHaveLength(7);
  });

  it('las aristas conectan grados existentes', () => {
    const degrees = new Set(HARMONY_DEGREES.maj.map(d => d.degree));
    for (const [a, b] of HARMONY_EDGES.maj) {
      expect(degrees.has(a)).toBe(true);
      expect(degrees.has(b)).toBe(true);
    }
  });
});

describe('harmonChordName', () => {
  it('acordes diatónicos de C mayor', () => {
    const maj = HARMONY_DEGREES.maj;
    expect(harmonChordName('maj', 'C', maj[0])).toBe('C');
    expect(harmonChordName('maj', 'C', maj[1])).toBe('Dm');
    expect(harmonChordName('maj', 'C', maj[4])).toBe('G');
    expect(harmonChordName('maj', 'C', maj[3])).toBe('F');
  });

  it('escribe el F#m de G mayor como becuadrado', () => {
    const iii = HARMONY_DEGREES.maj[2];
    expect(harmonChordName('maj', 'G', iii)).toBe('Bm');
  });

  it('grados menores de C: i, iv, v', () => {
    const min = HARMONY_DEGREES.min;
    expect(harmonChordName('min', 'C', min[0])).toBe('Cm');
    expect(harmonChordName('min', 'C', min[3])).toBe('Fm');
    expect(harmonChordName('min', 'C', min[4])).toBe('Gm');
  });
});

describe('harmonChordSet / harmonEdgeGlue', () => {
  it('sets de pc y pegamento de arista', () => {
    const maj = HARMONY_DEGREES.maj;
    expect(harmonChordSet('maj', 'C', maj[0])).toEqual([0, 4, 7]);
    expect(harmonEdgeGlue('maj', 'C', 'I', 'vi')).toBe(2);
  });
});

describe('dominantes', () => {
  it('V7 de C mayor', () => {
    expect(harmonDominantName('C', 'maj')).toBe('G7');
  });

  it('dominante secundaria del ii', () => {
    const ii = HARMONY_DEGREES.maj.find(d => d.degree === 'ii')!;
    expect(harmonSecondaryDominant('C', 'maj', ii).name).toBe('A7');
  });

  it('cadena de dominantes de C arranca en G7', () => {
    expect(harmonDomChain('C', 'maj')[0]).toBe('G7');
  });
});

describe('harmonKeyChords', () => {
  it('C mayor', () => {
    expect(harmonKeyChords(0, 'maj')).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
  });

  it('C menor natural', () => {
    expect(harmonKeyChords(0, 'min')).toEqual(['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb']);
  });
});

describe('harmonTwoFiveOne / harmonyVariant', () => {
  it('2-5-1 mayor de C', () => {
    const { major } = harmonTwoFiveOne('C');
    expect(major).toEqual(['Dm7', 'G7', 'Cmaj7']);
  });

  it('2-5-1 menor de C', () => {
    const { minor } = harmonTwoFiveOne('C');
    expect(minor).toEqual(['Ddim', 'G7', 'Cm']);
  });

  it('harmonyVariant devuelve un objeto conocido', () => {
    expect(harmonyVariant('major').mod).toBe('maj');
    expect(harmonyVariant('nope').mod).toBe('maj');
  });
});