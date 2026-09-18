import { describe, expect, it } from 'vitest';
import { MODE_DATA, modeNote, modeScale, modeTensionName, modeChordName } from './modes';

describe('MODE_DATA', () => {
  it('son 7 modos con grado', () => {
    expect(MODE_DATA).toHaveLength(7);
    expect(MODE_DATA.map(m => m.degree)).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']);
  });

  it('Jónico es el I con calidad maj7', () => {
    expect(MODE_DATA[0]).toMatchObject({ name: 'Jónico', degree: 'I', quality: 'maj7' });
  });

  it('Locrio tiene quinta disminuida', () => {
    expect(MODE_DATA[6].quality).toBe('m7b5');
  });
});

describe('modeNote', () => {
  it('cuenta intervalos sobre el root', () => {
    expect(modeNote('C', 0)).toBe('C');
    expect(modeNote('C', 7)).toBe('G');
    expect(modeNote('A', 3)).toBe('C');
  });
});

describe('modeScale', () => {
  it('modo 0 = escala mayor', () => {
    expect(modeScale('C', 0)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('modo 1 (Dórico) rota la mayor una posición', () => {
    expect(modeScale('C', 1)).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C']);
  });
});

describe('modeTensionName / modeChordName', () => {
  it('tensión nominal del grado', () => {
    expect(modeTensionName('C', MODE_DATA[0])).toBe('Cmaj7');
  });

  it('acorde de tríada vs tétrada', () => {
    const dorico = MODE_DATA[1];
    expect(modeChordName('C', dorico, false)).toBe('Dm');
    expect(modeChordName('C', dorico, true)).toBe('Dm7');
  });
});