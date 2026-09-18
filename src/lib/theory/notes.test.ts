import { describe, expect, it } from 'vitest';
import {
  ALIASES, NOTES, pcOf, noteOf, flatOf, spellPc, pcsFromName, notesFromPcs,
  midiOf, freqOfMidi, STRING_PCS,
} from './notes';

describe('definiciones', () => {
  it('NOTES tiene 12 nombres con sostenidos', () => {
    expect(NOTES).toHaveLength(12);
    expect(NOTES[0]).toBe('C');
    expect(NOTES[11]).toBe('B');
  });

  it('ALIASES normaliza bemoles→sostenidos', () => {
    expect(ALIASES.Db).toBe('C#');
    expect(ALIASES.Bb).toBe('A#');
    expect(ALIASES.Cb).toBe('B');
  });

  it('STRING_PCS describe el mástil estándar (E-A-D-G-B-E)', () => {
    expect(STRING_PCS).toEqual([4, 9, 2, 7, 11, 4]);
  });
});

describe('pcOf', () => {
  it('mapea nombres a pitch classes', () => {
    expect(pcOf('C')).toBe(0);
    expect(pcOf('C#')).toBe(1);
    expect(pcOf('A')).toBe(9);
    expect(pcOf('B')).toBe(11);
  });

  it('resuelve bemoles vía ALIASES', () => {
    expect(pcOf('Db')).toBe(1);
    expect(pcOf('Eb')).toBe(3);
    expect(pcOf('Bb')).toBe(10);
  });

  it('devuelve -1 para nombres inválidos', () => {
    expect(pcOf('H')).toBe(-1);
    expect(pcOf('')).toBe(-1);
  });
});

describe('noteOf / flatOf / spellPc', () => {
  it('noteOf envuelve pc fuera de rango', () => {
    expect(noteOf(0)).toBe('C');
    expect(noteOf(12)).toBe('C');
    expect(noteOf(13)).toBe('C#');
    expect(noteOf(-1)).toBe('B');
  });

  it('flatOf devuelve el nombre bemol', () => {
    expect(flatOf(1)).toBe('Db');
    expect(flatOf(6)).toBe('Gb');
    expect(flatOf(10)).toBe('Bb');
  });

  it('spellPc respeta la firma', () => {
    expect(spellPc(1, 'sharp')).toBe('C#');
    expect(spellPc(1, 'flat')).toBe('Db');
    expect(spellPc(6, 'flat')).toBe('Gb');
  });
});

describe('pcsFromName / notesFromPcs', () => {
  it('construye pcs desde un root e intervalos', () => {
    expect(pcsFromName('C', [0, 4, 7])).toEqual([0, 4, 7]);
    expect(pcsFromName('A', [0, 3, 7])).toEqual([9, 0, 4]);
  });

  it('devuelve [] para root inválido', () => {
    expect(pcsFromName('H', [0, 4, 7])).toEqual([]);
  });

  it('convierte pcs→nombres', () => {
    expect(notesFromPcs([0, 4, 7])).toEqual(['C', 'E', 'G']);
  });
});

describe('midiOf / freqOfMidi', () => {
  it('midiOf ubica la pc dentro de la ventana', () => {
    expect(midiOf(0, 60)).toBe(63);
    expect(midiOf(9, 60)).toBe(60);
    expect(midiOf(0, 48)).toBe(51);
    expect(midiOf(5, 48)).toBe(56);
  });

  it('freqOfMidi: A4 es 440 Hz', () => {
    expect(freqOfMidi(69)).toBeCloseTo(440, 3);
    expect(freqOfMidi(57)).toBeCloseTo(220, 2);
  });
});