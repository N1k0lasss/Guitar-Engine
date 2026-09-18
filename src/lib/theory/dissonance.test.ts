import { describe, expect, it } from 'vitest';
import { countDissonancePairs } from './dissonance';

describe('countDissonancePairs', () => {
  it('semitono → b9', () => {
    expect(countDissonancePairs([0, 1])).toEqual({ b9: 1, tri: 0 });
  });

  it('tritono → tri', () => {
    expect(countDissonancePairs([0, 6])).toEqual({ b9: 0, tri: 1 });
  });

  it('tritono relativo (11 y 5) también cuenta', () => {
    expect(countDissonancePairs([5, 11]).tri).toBe(1);
  });

  it('acorde limpio sin fricción', () => {
    expect(countDissonancePairs([0, 4, 7])).toEqual({ b9: 0, tri: 0 });
  });

  it('dominante 7 tiene un tritono', () => {
    const { tri } = countDissonancePairs([0, 4, 7, 10]);
    expect(tri).toBe(1);
    expect(countDissonancePairs([0, 4, 7, 10]).b9).toBe(0);
  });

  it('Cuag (0,4,8) no es disonante por semitono', () => {
    expect(countDissonancePairs([0, 4, 8])).toEqual({ b9: 0, tri: 0 });
  });
});