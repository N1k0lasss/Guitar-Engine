import { describe, expect, it } from 'vitest';
import {
  TENSION_DATA, tensionKind, tensionNote, tenBasePcs, tenTensionCounts, tenRuling, tenFullNotes,
} from './tensions';

describe('TENSION_DATA', () => {
  it('cubre las 6 tensiones', () => {
    expect(TENSION_DATA).toHaveLength(6);
    expect(TENSION_DATA.map(t => t.label)).toEqual(['b9', '9', '#9', '11', '#11', '13']);
  });
});

describe('tensionKind', () => {
  it('b9 siempre es fricción', () => {
    expect(tensionKind('maj7', 'b9')).toBe('fricción');
    expect(tensionKind('m7', 'b9')).toBe('fricción');
    expect(tensionKind('7', 'b9')).toBe('fricción');
  });

  it('la 11 en m7 es estable', () => {
    expect(tensionKind('m7', '11')).toBe('estable');
  });
});

describe('tensionNote', () => {
  it('suma el intervalo', () => {
    expect(tensionNote('C', 1)).toBe('C#');
    expect(tensionNote('C', 9)).toBe('A');
    expect(tensionNote('A', 3)).toBe('C');
  });
});

describe('tenBasePcs', () => {
  it('bases por cualidad', () => {
    expect(tenBasePcs('C', 'maj7')).toEqual([0, 4, 7, 11]);
    expect(tenBasePcs('C', 'm7')).toEqual([0, 3, 7, 10]);
    expect(tenBasePcs('C', '7')).toEqual([0, 4, 7, 10]);
  });
});

describe('tenTensionCounts / tenFullNotes', () => {
  it('la 13 en un dominante choca con la b7 (semitono)', () => {
    const base = tenBasePcs('C', '7');
    const { b9 } = tenTensionCounts('C', base, 9);
    expect(b9).toBe(1);
  });

  it('la #11 en maj7 arma tritono con la raíz', () => {
    const base = tenBasePcs('C', 'maj7');
    const { tri } = tenTensionCounts('C', base, 6);
    expect(tri).toBe(1);
  });

  it('tenFullNotes une base y tensión', () => {
    const notes = tenFullNotes('C', '7', 2);
    expect(notes).toEqual(['C', 'D', 'E', 'G', 'A#']);
  });
});

describe('tenRuling', () => {
  it('b9 en dominante es Aceptada', () => {
    expect(tenRuling('7', 'b9').id).toBe('accept');
  });

  it('11 en dominante es Evitada', () => {
    expect(tenRuling('7', '11').id).toBe('avoid');
  });

  it('tensión desconocida cae en Cuidado', () => {
    expect(tenRuling('maj7', 'nope').id).toBe('care');
  });
});