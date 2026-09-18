import { describe, expect, it } from 'vitest';
import { SCALE_TYPES, SCALE_GROUPS, CAGED_POSITIONS, scaleNotes, fretboardCells } from './scales';

describe('SCALE_TYPES', () => {
  it('mayor = [0,2,4,5,7,9,11]', () => {
    expect(SCALE_TYPES.major.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('agrupa las diatónicas', () => {
    expect(SCALE_GROUPS).toContain('Diatónicas');
    expect(SCALE_GROUPS).toContain('Simétricas');
  });

  it('CAGED_POSITIONS arranca en traste 0', () => {
    expect(CAGED_POSITIONS[0]).toEqual({ label: 'Todo el mástil', start: 0, end: 15 });
  });
});

describe('scaleNotes', () => {
  it('C mayor', () => {
    expect(scaleNotes('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('G mayor lleva F#', () => {
    expect(scaleNotes('G', 'major')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
  });

  it('C menor natural usa la notación sostenida de NOTES', () => {
    expect(scaleNotes('C', 'minor')).toEqual(['C', 'D', 'D#', 'F', 'G', 'G#', 'A#']);
  });

  it('pentatónica mayor tiene 5 notas', () => {
    expect(scaleNotes('C', 'pentatonic')).toEqual(['C', 'D', 'E', 'G', 'A']);
  });

  it('root o escala inválidos → []', () => {
    expect(scaleNotes('H', 'major')).toEqual([]);
    expect(scaleNotes('C', 'nope')).toEqual([]);
  });
});

describe('fretboardCells', () => {
  it('cubre strings × trastes', () => {
    const cells = fretboardCells('C', 'major', 0, 4);
    expect(cells).toHaveLength(6 * 5);
  });

  it('marca tónicas y notas en escala', () => {
    const cells = fretboardCells('C', 'major', 0, 4);
    const openE = cells.find(c => c.string === 0 && c.fret === 0);
    expect(openE?.note).toBe('E');
    expect(openE?.inScale).toBe(true);
    const roots = cells.filter(c => c.isRoot);
    expect(roots.length).toBeGreaterThan(0);
    expect(roots.every(r => r.note === 'C')).toBe(true);
  });
});