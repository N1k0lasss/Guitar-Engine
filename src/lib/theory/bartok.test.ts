import { describe, expect, it } from 'vitest';
import {
  bartokAxisOf, bartokTriad, bartokGlueBetween, bartokSharedDominants, bartokFreeScales, bartokMates,
} from './bartok';

describe('bartokAxisOf', () => {
  it('C (0), E (4) y G# (8) comparten eje', () => {
    expect(bartokAxisOf(0).poles).toEqual([0, 3, 6, 9]);
    expect(bartokAxisOf(4).poles).toEqual([1, 4, 7, 10]);
    expect(bartokAxisOf(8).poles).toEqual([2, 5, 8, 11]);
  });

  it('C y F# son tritonos (polos opuestos)', () => {
    const axis = bartokAxisOf(0);
    expect(axis.pairs).toEqual([[0, 6], [3, 9]]);
  });
});

describe('bartokTriad', () => {
  it('triada mayor sobre pc base', () => {
    expect(bartokTriad(0)).toEqual([0, 4, 7]);
    expect(bartokTriad(7)).toEqual([7, 11, 2]);
  });
});

describe('bartokGlueBetween', () => {
  it('C y G comparten 1 nota (G)', () => {
    expect(bartokGlueBetween(0, 7)).toBe(1);
  });

  it('C y E comparten 1 nota (E)', () => {
    expect(bartokGlueBetween(0, 4)).toBe(1);
  });
});

describe('bartokSharedDominants', () => {
  it('genera un V7 por término del eje', () => {
    const doms = bartokSharedDominants([0, 6]);
    expect(doms).toHaveLength(2);
    expect(doms[0].name).toBe('G7');
    expect(doms[0].pcs).toEqual([7, 11, 2, 5]);
  });
});

describe('bartokFreeScales', () => {
  it('une triadas fijas y ofrece 4 combinaciones', () => {
    const res = bartokFreeScales(0, 7);
    expect(res.fixed).toEqual([0, 4, 7, 11, 2].sort((a, b) => a - b));
    expect(res.combos).toHaveLength(4);
    expect(res.combos.every(c => new Set(c.set).size === c.set.length)).toBe(true);
  });
});

describe('bartokMates', () => {
  it('C tiene 3 compañeros de eje con su pegamento', () => {
    const mates = bartokMates(0);
    expect(mates).toHaveLength(3);
    expect(mates.map(m => m.pc)).toEqual([3, 6, 9]);
  });
});