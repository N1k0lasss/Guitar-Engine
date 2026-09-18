import { describe, expect, it } from 'vitest';
import {
  POLY_BASE_QUALITIES, POLY_TRIAD_QUALITIES, polyIntervals, polyFindName, polyCountDissonance,
  polyBuildAll, polyBuildStar,
} from './polychords';

describe('polyIntervals', () => {
  it('traslada intervalos por root', () => {
    expect(polyIntervals(0, [0, 4, 7])).toEqual([0, 4, 7]);
    expect(polyIntervals(9, [0, 3, 7])).toEqual([9, 0, 4]);
  });
});

describe('polyFindName', () => {
  it('reconoce una triada mayor', () => {
    expect(polyFindName(0, [0, 4, 7])).toBe('C');
  });

  it('detecta extensiones como add13', () => {
    expect(polyFindName(0, [0, 4, 7, 9])).toBe('C(add13)');
  });
});

describe('polyCountDissonance', () => {
  it('delega en countDissonancePairs', () => {
    expect(polyCountDissonance([0, 6])).toEqual({ b9: 0, tri: 1 });
  });
});

describe('polyBuildAll', () => {
  it('enumera el catalogo completo', () => {
    const all = polyBuildAll();
    expect(all).toHaveLength(POLY_BASE_QUALITIES.length * 12 * POLY_TRIAD_QUALITIES.length * 12);
    expect(all.every(r => r.notes.length === r.union.length)).toBe(true);
  });
});

describe('polyBuildStar', () => {
  it('7 nodos y todas las aristas del grafo completo', () => {
    const { nodes, edges } = polyBuildStar();
    expect(nodes).toHaveLength(7);
    expect(edges).toHaveLength(7 * 6 / 2);
  });

  it('el nodo I es C mayor', () => {
    const { nodes } = polyBuildStar();
    expect(nodes[0].name).toBe('C');
  });
});