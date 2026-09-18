import { describe, expect, it } from 'vitest';
import { CARTO_MODES, cartoEdges, cartoBFS, cartoEdgeDiff, cartoLayout, cartoNote, cartoChord, cartoFlavor } from './cartography';

describe('CARTO_MODES', () => {
  it('son 13 modos', () => {
    expect(CARTO_MODES).toHaveLength(13);
  });

  it('todos tienen 7 intervalos', () => {
    expect(CARTO_MODES.every(m => m.intervals.length === 7)).toBe(true);
  });
});

describe('cartoEdges', () => {
  it('conecta modos que difieren 1 pc', () => {
    const edges = cartoEdges();
    expect(edges.length).toBeGreaterThan(0);
    for (const [i, j] of edges) {
      const diff = cartoEdgeDiff(i, j);
      expect(diff).not.toBeNull();
      const a = CARTO_MODES[i].intervals;
      const b = CARTO_MODES[j].intervals;
      expect(a.filter(pc => !b.includes(pc))).toHaveLength(1);
      expect(b.filter(pc => !a.includes(pc))).toHaveLength(1);
    }
  });

  it('Jónico (0) y Lidio (1) difieren en el IV (5→6)', () => {
    expect(cartoEdgeDiff(0, 1)).toEqual({ removedPc: 5, addedPc: 6 });
  });
});

describe('cartoBFS', () => {
  it('desde el Jónico todos alcanzables', () => {
    const edges = cartoEdges();
    const { dist, furthest } = cartoBFS(edges, 0);
    expect(dist.every(d => d >= 0)).toBe(true);
    expect(dist[0]).toBe(0);
    expect(furthest).toBeGreaterThanOrEqual(0);
  });
});

describe('cartoLayout', () => {
  it('devuelve tantas posiciones como modos', () => {
    const pts = cartoLayout(cartoEdges());
    expect(pts).toHaveLength(CARTO_MODES.length);
    expect(pts.every(p => p.x >= 11 && p.x <= 89 && p.y >= 11 && p.y <= 89)).toBe(true);
  });
});

describe('cartoNote / cartoChord / cartoFlavor', () => {
  it('nombra notas relativas a la tónica', () => {
    expect(cartoNote(0, 2)).toBe('D');
    expect(cartoNote(9, 2)).toBe('B');
  });

  it('nombra acordes por tétrica/triada', () => {
    const jonic = CARTO_MODES[0];
    expect(cartoChord(0, jonic, true)).toBe('Cmaj7');
    expect(cartoChord(0, jonic, false)).toBe('C');
  });

  it('caracteriza sabores por pc', () => {
    expect(cartoFlavor(0, 3)).toBe('antiguo');
    expect(cartoFlavor(0, 6)).toBe('magia');
    expect(cartoFlavor(0, 1)).toBe('afilado, flamenco');
    expect(cartoFlavor(0, 4)).toBeUndefined();
  });
});