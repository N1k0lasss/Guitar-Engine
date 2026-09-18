import { describe, expect, it } from 'vitest';
import {
  PROX_QUALITIES, buildProxPool, proxPoolMatches, proxCanonicalName, proxScaleNotes,
  proxIsDiatonic, proxMoveVariants, findNeighbors, findCommonChords, glueExtOf, glueSymbol,
  proxBridgeScan,
} from './proximity';

describe('buildProxPool', () => {
  it('construye el pool de 12 roots × 9 cualidades', () => {
    expect(PROX_QUALITIES).toHaveLength(9);
    expect(buildProxPool()).toHaveLength(12 * PROX_QUALITIES.length);
  });
});

describe('proxPoolMatches / proxCanonicalName', () => {
  it('encuentra la tríada mayor por set', () => {
    expect(proxCanonicalName([0, 4, 7])).toBe('C');
  });

  it('canoniza a la raíz más baja con set ordenado', () => {
    expect(proxCanonicalName([2, 7, 11])).toBe('G');
  });

  it('sin match → null', () => {
    expect(proxCanonicalName([0, 1, 2])).toBeNull();
  });
});

describe('proxScaleNotes / proxIsDiatonic', () => {
  it('C mayor como pc set', () => {
    expect(proxScaleNotes('C')).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('C mayor es diatónico a C', () => {
    expect(proxIsDiatonic([0, 4, 7], 'C')).toBe(true);
    expect(proxIsDiatonic([0, 3, 7], 'C')).toBe(false);
  });
});

describe('proxMoveVariants', () => {
  it('1 nota a mover produce 4 variantes con desplazamientos ±1,±2', () => {
    const variants = proxMoveVariants([0, 4, 7], [0]);
    expect(variants).toHaveLength(4);
    expect(variants.every(v => v.deltas.length === 1)).toBe(true);
    expect(variants.some(v => v.deltas[0].delta === -2)).toBe(true);
    expect(variants.some(v => v.deltas[0].delta === 2)).toBe(true);
    expect(variants.every(v => v.set.length === 3)).toBe(true);
  });
});

describe('findNeighbors', () => {
  it('C mayor tiene vecinos nombrados', () => {
    const ns = findNeighbors('C', '', 1);
    expect(ns.length).toBeGreaterThan(0);
    expect(ns.every(n => n.moves.length === 1)).toBe(true);
    expect(ns[0].glue).toBeGreaterThanOrEqual(ns[ns.length - 1].glue);
  });
});

describe('findCommonChords', () => {
  it('notas compartidas en modo any', () => {
    const found = findCommonChords([0, 4], 'any');
    expect(found.length).toBeGreaterThan(0);
    expect(found.filter(c => c.m == 2).length).toBeGreaterThan(0);
  });
});

describe('glue', () => {
  it('traduce intervalos a extensiones', () => {
    expect(glueExtOf(1)).toBe('b9');
    expect(glueExtOf(9)).toBe('13');
    expect(glueExtOf(4)).toBeNull();
  });

  it('glueSymbol de C mayor sin tensiones es C', () => {
    expect(glueSymbol(0, '', [])).toBe('C');
  });

  it('proxBridgeScan produce puente directo y vía V', () => {
    const bridges = proxBridgeScan(0, '', 9, '');
    expect(bridges).toHaveLength(2);
    expect(bridges[0].kind).toBe('direct');
    expect(bridges[1].kind).toBe('via');
  });
});