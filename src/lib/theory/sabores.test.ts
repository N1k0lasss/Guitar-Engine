import { describe, expect, it } from 'vitest';
import { SABOR_DATA, saborNote } from './sabores';

describe('sabores', () => {
  it('cubre los 12 intervalos', () => {
    expect(SABOR_DATA).toHaveLength(12);
    expect(SABOR_DATA.map(s => s.interval)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('la casa es el unísono y el flamenco la b9', () => {
    expect(SABOR_DATA[0].flavor).toBe('casa');
    expect(SABOR_DATA[1].flavor).toBe('flamenco');
    expect(SABOR_DATA[1].intervalLabel).toBe('b9');
  });

  it('los intervalos neutros no marcan sabor', () => {
    expect(SABOR_DATA[2].flavor).toBeNull();
    expect(SABOR_DATA[4].flavor).toBeNull();
  });

  it('saborNote suma el intervalo sobre el root', () => {
    expect(saborNote('C', 6)).toBe('F#');
    expect(saborNote('C', 9)).toBe('A');
    expect(saborNote('A', 3)).toBe('C');
  });
});