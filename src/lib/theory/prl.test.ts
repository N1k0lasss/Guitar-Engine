import { describe, expect, it } from 'vitest';
import {
  prlSplitName, prlTriadSet, prlTransformations, prlMoveLabel, PRL_OP_INFO,
} from './prl';

describe('prlSplitName', () => {
  it('separa m del nombre', () => {
    expect(prlSplitName('C')).toEqual({ root: 'C', quality: '' });
    expect(prlSplitName('Am')).toEqual({ root: 'A', quality: 'm' });
  });
});

describe('prlTriadSet', () => {
  it('devuelve pcs de la triada', () => {
    expect(prlTriadSet('C', '')).toEqual([0, 4, 7]);
    expect(prlTriadSet('A', 'm')).toEqual([9, 0, 4]);
  });

  it('null para cualidades no-table', () => {
    expect(prlTriadSet('C', '7')).toBeNull();
  });
});

describe('prlTransformations', () => {
  it('C mayor produce 3 transformaciones válidas', () => {
    const t = prlTransformations('C', '');
    expect(t).toHaveLength(3);
    expect(t.map(x => x.op)).toEqual(['P', 'R', 'L']);
  });

  it('P preserva raíz y cambia la 3ra', () => {
    const [p] = prlTransformations('C', '');
    expect(p.set).toEqual([0, 3, 7]);
    expect(p.common).toEqual([0, 7]);
    expect(p.movedFrom).toBe(4);
    expect(p.movedTo).toBe(3);
  });

  it('R (relativo) de C mayor es Am', () => {
    const [ , r] = prlTransformations('C', '');
    expect(r.name).toBe('Am');
    expect(r.set).toEqual([9, 0, 4]);
  });

  it('ninguna transformación para cualidad no-triada', () => {
    expect(prlTransformations('C', '7')).toEqual([]);
  });
});

describe('prlMoveLabel', () => {
  it('describe movimientos de semitonos', () => {
    expect(prlMoveLabel(1)).toBe('st arriba');
    expect(prlMoveLabel(-1)).toBe('st abajo');
    expect(prlMoveLabel(3)).toBe('3 st arriba');
    expect(prlMoveLabel(-3)).toBe('3 st abajo');
  });
});

describe('PRL_OP_INFO', () => {
  it('describe las 3 operaciones neoriemannianas', () => {
    expect(Object.keys(PRL_OP_INFO)).toEqual(['P', 'R', 'L']);
  });
});