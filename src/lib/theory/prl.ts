import { NOTES } from './notes';
import { CHORD_TYPES } from './chords';

// ===== Neoriemanniano P/R/L (Armonía Ilustrada 2, p.115) =====

export const PRL_OP_INFO = {
  P: { name: 'Paralelo', desc: 'mismo tono, solo cambia la 3ra' },
  R: { name: 'Relativo', desc: 'la tónica viaja una 3ra menor' },
  L: { name: 'Leittonwechsel', desc: 'una voz se mueve un semitono' },
} as const;

export const PRL_DEGREES = ['raíz', '3ra', '5ta', '7ma'];

export function prlSplitName(name: string): { root: string; quality: string } {
  if (name.length > 1 && name.endsWith('m')) return { root: name.slice(0, -1), quality: 'm' };
  return { root: name, quality: '' };
}

export function prlChordName(root: string, quality: string): string {
  return root + quality;
}

export function prlTriadSet(rootName: string, quality: string): number[] | null {
  const root = NOTES.indexOf(rootName as never);
  if (root < 0 || (quality !== '' && quality !== 'm')) return null;
  return CHORD_TYPES[quality].intervals.map(iv => (root + iv) % 12);
}

export interface PrlTransform {
  op: 'P' | 'R' | 'L';
  name: string;
  root: string;
  quality: string;
  set: number[];
  common: number[];
  movedIdx: number;
  movedFrom: number;
  movedTo: number;
  delta: number;
}

export function prlTransformations(rootName: string, quality: string): PrlTransform[] {
  const rootIdx = NOTES.indexOf(rootName as never);
  if (rootIdx < 0 || (quality !== '' && quality !== 'm')) return [];
  const base = CHORD_TYPES[quality].intervals.map(iv => (rootIdx + iv) % 12);
  const other = quality === 'm' ? '' : 'm';
  const ops = [
    { op: 'P' as const, rel: 0 },
    { op: 'R' as const, rel: quality === 'm' ? 3 : 9 },
    { op: 'L' as const, rel: quality === 'm' ? 8 : 4 },
  ];
  return ops.map(({ op, rel }) => {
    const tRootIdx = (rootIdx + rel) % 12;
    const set = CHORD_TYPES[other].intervals.map(iv => (tRootIdx + iv) % 12);
    const movedFrom = base.find(pc => !set.includes(pc))!;
    const movedTo = set.find(pc => !base.includes(pc))!;
    const deltaRaw = (movedTo - movedFrom + 12) % 12;
    return {
      op,
      name: prlChordName(NOTES[tRootIdx], other),
      root: NOTES[tRootIdx],
      quality: other,
      set,
      common: base.filter(pc => set.includes(pc)),
      movedIdx: base.indexOf(movedFrom),
      movedFrom,
      movedTo,
      delta: deltaRaw > 6 ? deltaRaw - 12 : deltaRaw,
    };
  });
}

export function prlMoveLabel(delta: number): string {
  if (delta === 1) return 'st arriba';
  if (delta === -1) return 'st abajo';
  return `${Math.abs(delta)} st ${delta > 0 ? 'arriba' : 'abajo'}`;
}