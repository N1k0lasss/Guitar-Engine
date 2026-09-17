import { NOTES } from './notes';
import { CHORD_TYPES } from './chords';

// ===== Tritono sustituto (Illustrated Harmony vol.1 p.129-143) =====

export const TT_FLAT_ROOTS: Record<number, string> = {
  0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
  6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B',
};

export function ttChordSet(rootName: string, quality: string): number[] | null {
  const root = NOTES.indexOf(rootName as never);
  if (root < 0 || !CHORD_TYPES[quality]) return null;
  return CHORD_TYPES[quality].intervals.map(iv => (root + iv) % 12);
}

export function ttTritonePcs(rootName: string): number[] | null {
  const set = ttChordSet(rootName, '7');
  if (!set) return null;
  return [set[1], set[3]].sort((a, b) => a - b);
}

export function ttTritoneNames(rootName: string): string[] {
  const pcs = ttTritonePcs(rootName);
  return pcs ? pcs.map(pc => NOTES[pc]) : [];
}

export function ttWithRoot(rootIdx: number, quality: string): string {
  return NOTES[rootIdx] + quality;
}

export function ttFlatName(rootName: string, quality: string): string {
  const root = NOTES.indexOf(rootName as never);
  return TT_FLAT_ROOTS[root] + quality;
}

export function ttSubstitute(rootName: string): string {
  const root = NOTES.indexOf(rootName as never);
  return ttWithRoot((root + 6) % 12, '7');
}

export function ttTonic(rootName: string, quality: string): string {
  const root = NOTES.indexOf(rootName as never);
  return ttWithRoot((root + 5) % 12, quality);
}

export interface TtOption { id: string; arrow: string; name: string; note: string; reroot: boolean; }

export function ttOptions(rootName: string): TtOption[] {
  const root = NOTES.indexOf(rootName as never);
  if (root < 0) return [];
  const tritone = ttTritoneNames(rootName).join('·');
  const tonicMaj = ttTonic(rootName, '');
  const tonicMin = ttTonic(rootName, 'm');
  const subRoot = (root + 6) % 12;
  const pivotTonic = ttWithRoot((subRoot + 5) % 12, '');
  const pivotTonicMin = ttWithRoot((subRoot + 5) % 12, 'm');
  return [
    { id: 'resolve', arrow: '↘', name: `${tonicMaj} / ${tonicMin}`, note: 'V → I (mayor y menor)', reroot: false },
    { id: 'chain', arrow: '→', name: ttWithRoot((root + 5) % 12, '7'), note: 'cadena de dominantes (G7→C7→F7…)', reroot: true },
    { id: 'sub', arrow: '⇄', name: ttWithRoot(subRoot, '7'), note: `tritono sustituto: mismo ${tritone}`, reroot: true },
    { id: 'vii', arrow: '→', name: ttWithRoot((root + 4) % 12, 'dim'), note: 'vii°: casi el mismo acorde (B°≈G7)', reroot: false },
    { id: 'aug', arrow: '→', name: ttWithRoot(root, 'aug'), note: 'aumentado como dominante (G7→G+→C)', reroot: false },
    { id: 'pivot', arrow: '↘', name: `${pivotTonic} / ${pivotTonicMin}`, note: 'actúa como sustituto de esta tonalidad', reroot: false },
  ];
}

export const TT_FLAT_ROOT_LABELS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  NOTES.forEach(n => out[n] = TT_FLAT_ROOTS[NOTES.indexOf(n as never)]);
  return out;
})();