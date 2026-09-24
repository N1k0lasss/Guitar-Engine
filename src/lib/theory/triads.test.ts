import { describe, expect, it } from 'vitest';
import { triadOf, triadShapes, splitChords, FRET_COUNT, MAX_TRIAD_SPAN } from './triads';

describe('triadOf', () => {
  it('tríadas base', () => {
    expect(triadOf('C')?.pcs).toEqual([0, 4, 7]);
    expect(triadOf('Cm')?.pcs).toEqual([0, 3, 7]);
    expect(triadOf('Bdim')?.pcs).toEqual([11, 2, 5]);
    expect(triadOf('Caug')?.pcs).toEqual([0, 4, 8]);
    expect(triadOf('Csus2')?.pcs).toEqual([0, 2, 7]);
    expect(triadOf('Csus4')?.pcs).toEqual([0, 5, 7]);
  });

  it('tétradas colapsan a su tríada base', () => {
    expect(triadOf('G7')?.pcs).toEqual([7, 11, 2]);  // G B D
    expect(triadOf('Cmaj7')?.pcs).toEqual([0, 4, 7]); // C E G
    expect(triadOf('Cm7')?.pcs).toEqual([0, 3, 7]);   // C Eb G
  });

  it('rechaza nombres inválidos', () => {
    expect(triadOf('')).toBeNull();
    expect(triadOf('H7')).toBeNull();
    expect(triadOf('Am7b5')).toBeNull();
    expect(triadOf('x')).toBeNull();
  });

  it('mantiene el nombre y roles', () => {
    const t = triadOf('Csus4')!;
    expect(t.name).toBe('Csus4');
    expect(t.roles).toEqual(['root', 'third', 'fifth']);
  });
});

describe('triadShapes', () => {
  it('todas las formas son tríadas válidas del acorde', () => {
    for (const chord of ['C', 'G', 'Am', 'F', 'Dm7', 'Bdim']) {
      const triad = triadOf(chord)!;
      const shapes = triadShapes(chord);
      expect(shapes.length).toBeGreaterThanOrEqual(8);
      for (const s of shapes) {
        expect(s.dots).toHaveLength(3);
        const pcs = s.dots.map(d => d.pc).sort((a, b) => a - b);
        const target = [...triad.pcs].sort((a, b) => a - b);
        expect(pcs).toEqual(target);
        for (const d of s.dots) {
          expect(d.fret).toBeGreaterThanOrEqual(0);
          expect(d.fret).toBeLessThan(FRET_COUNT);
        }
        expect(s.span).toBeLessThanOrEqual(MAX_TRIAD_SPAN);
      }
    }
  });

  it('C mayor genera 11 formas canónicas (solo la 1ª inv. de E-A-D queda fuera por stretch)', () => {
    const shapes = triadShapes('C');
    expect(shapes).toHaveLength(11);
    expect(new Set(shapes.map(s => s.id)).size).toBe(11);
  });

  it('G mayor: 11 formas (el cruce abierto G-B-e queda excluido)', () => {
    expect(triadShapes('G')).toHaveLength(11);
    expect(triadShapes('G').some(s => s.id === 'G·E-A-D·0' && s.frets.join('-') === '3-2-0')).toBe(true);
  });

  it('ID por clave: la forma raíz en A-D-G de C es 3-2-0', () => {
    const shape = triadShapes('C').find(s => s.id === 'C·A-D-G·0');
    expect(shape?.frets).toEqual([3, 2, 0]);
    expect(shape?.bassRole).toBe('root');
    expect(shape?.stringNames).toEqual(['A', 'D', 'G']);
  });

  it('la raíz siempre es la nota grave en inversión 0', () => {
    for (const chord of ['C', 'Db', 'Eb', 'F#', 'Ab', 'B']) {
      for (const s of triadShapes(chord)) {
        expect(s.dots[0].role).toBe(s.rotation === 0 ? 'root' : s.rotation === 1 ? 'third' : 'fifth');
      }
    }
  });

  it('respeta la ortografía del acorde (bemoles)', () => {
    const shapes = triadShapes('Ab');
    const names = new Set(shapes.flatMap(s => s.tones));
    expect(names.has('Ab')).toBe(true);
    expect(names.has('Eb')).toBe(true);
    expect(names.has('C')).toBe(true);
    expect([...names].some(n => n === 'G#')).toBe(false);
  });
});

describe('splitChords', () => {
  it('separa por espacios y comas', () => {
    expect(splitChords('C G Am F')).toEqual(['C', 'G', 'Am', 'F']);
    expect(splitChords('C, G Am,   F')).toEqual(['C', 'G', 'Am', 'F']);
    expect(splitChords('')).toEqual([]);
  });
});