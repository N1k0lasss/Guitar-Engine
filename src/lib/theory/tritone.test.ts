import { describe, expect, it } from 'vitest';
import {
  ttChordSet, ttTritonePcs, ttTritoneNames, ttWithRoot, ttFlatName, ttSubstitute, ttTonic, ttOptions,
} from './tritone';

describe('ttChordSet', () => {
  it('G7 = G B D F', () => {
    expect(ttChordSet('G', '7')).toEqual([7, 11, 2, 5]);
  });
});

describe('ttTritonePcs / Names', () => {
  it('el tritono de G7 es la 3ra y la 7ma (B, F)', () => {
    expect(ttTritonePcs('G')).toEqual([5, 11]);
    expect(ttTritoneNames('G')).toEqual(['F', 'B']);
  });
});

describe('ttSubstitute', () => {
  it('G7 sustituye por C#7 (media octava arriba)', () => {
    expect(ttSubstitute('G')).toBe('C#7');
  });
});

describe('ttTonic / ttFlatName', () => {
  it('la tónica de un V7 está una quinta abajo', () => {
    expect(ttTonic('G', '')).toBe('C');
  });

  it('ttFlatName usa nombres con bemoles', () => {
    expect(ttFlatName('G', '7')).toBe('G7');
    expect(ttFlatName('C#', '7')).toBe('Db7');
  });
});

describe('ttOptions', () => {
  it('G7 ofrece 6 opciones sin redondear mal', () => {
    const opts = ttOptions('G');
    expect(opts).toHaveLength(6);
    expect(opts.find(o => o.id === 'resolve')?.name).toBe('C / Cm');
    expect(opts.find(o => o.id === 'sub')?.name).toBe('C#7');
  });
});