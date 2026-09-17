import { NOTES } from './notes';
import { CHORD_TYPES } from './chords';

// Ejes de Bartók — Armonía Ilustrada 2, pp 196–214

export interface BartokAxis { seed: number; poles: number[]; pairs: [number, number][]; }

export function bartokAxisOf(pc: number): BartokAxis {
  const seed = ((pc % 3) + 3) % 3;
  return {
    seed,
    poles: [0, 1, 2, 3].map(k => (seed + 3 * k) % 12),
    pairs: [[seed, (seed + 6) % 12], [(seed + 3) % 12, (seed + 9) % 12]] as [number, number][],
  };
}

export function bartokTriad(pc: number): number[] {
  return CHORD_TYPES[''].intervals.map(iv => (pc + iv) % 12);
}

export function bartokGlueBetween(a: number, b: number): number {
  const aa = bartokTriad(a);
  const bb = bartokTriad(b);
  return aa.filter(pc => bb.includes(pc)).length;
}

export interface SharedDominant { pole: number; domRoot: number; name: string; pcs: number[]; }

export function bartokSharedDominants(poles: number[]): SharedDominant[] {
  return poles.map(p => {
    const domRoot = (p + 7) % 12;
    return {
      pole: p,
      domRoot,
      name: NOTES[domRoot] + '7',
      pcs: CHORD_TYPES['7'].intervals.map(iv => (domRoot + iv) % 12),
    };
  });
}

export interface FreeScaleCombo { fpc: number; spc: number; set: number[]; }

export function bartokFreeScales(a: number, c: number): { fixed: number[]; fixedFmt: string; v4: number; v6: number; combos: FreeScaleCombo[] } {
  const fixed = [...new Set([...bartokTriad(a), ...bartokTriad(c)])].sort((x, y) => x - y);
  const v4 = (a + 5) % 12;
  const v6 = (a + 9) % 12;
  const combos: FreeScaleCombo[] = [];
  for (const di of [0, 1]) {
    for (const si of [0, 1]) {
      let set = [...fixed, (v4 + di) % 12, (v6 + si) % 12];
      set = [...new Set(set)].sort((x, y) => x - y);
      combos.push({ fpc: (v4 + di) % 12, spc: (v6 + si) % 12, set });
    }
  }
  return { fixed, fixedFmt: fixed.map(pc => NOTES[pc]).join(', '), v4, v6, combos };
}

export function bartokMates(anchorPc: number): { pc: number; glue: number }[] {
  const axis = bartokAxisOf(anchorPc);
  return axis.poles.filter(p => p !== anchorPc).map(p => ({ pc: p, glue: bartokGlueBetween(anchorPc, p) }));
}