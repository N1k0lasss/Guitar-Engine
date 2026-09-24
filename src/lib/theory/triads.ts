import { STRING_PCS, spellPc, pcOf } from './notes';
import { parseChordName } from './chords';

// ===== Tríadas en el mástil =====
// Dado un acorde (tríada o tétrada), calcula todas sus posiciones
// (formas) como tríada: 4 juegos de 3 cuerdas contiguas x 3 inversiones.

export const TRIAD_ROLES = ['root', 'third', 'fifth'] as const;
export type TriadRole = (typeof TRIAD_ROLES)[number];

export const FRET_COUNT = 15;
export const MAX_TRIAD_SPAN = 4;

const TRIAD_INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '7': [0, 4, 7],
  maj7: [0, 4, 7],
  m7: [0, 3, 7],
};

export interface TriadDef {
  name: string;
  root: string;
  quality: string;
  pcs: number[];
  intervals: number[];
  roles: TriadRole[];
}

export interface TriadDot {
  string: number;
  fret: number;
  role: TriadRole;
  pc: number;
  note: string;
}

export interface TriadShape {
  id: string;
  chord: string;
  stringSet: number[];
  stringNames: string[];
  frets: number[];
  tones: string[];
  dots: TriadDot[];
  rotation: 0 | 1 | 2;
  rotationLabel: string;
  label: string;
  span: number;
  minFret: number;
  bassRole: TriadRole;
}

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_SETS = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]];
const STRING_SET_NAMES: Record<string, string> = {
  '0,1,2': 'E-A-D', '1,2,3': 'A-D-G', '2,3,4': 'D-G-B', '3,4,5': 'G-B-e',
};
export const ROTATION_LABELS = ['raíz', '1ª inv.', '2ª inv.'] as const;
export const ROTATION_TITLES = ['Posición fundamental', '1ª inversión', '2ª inversión'] as const;

export function triadOf(chordName: string): TriadDef | null {
  const parsed = parseChordName(chordName);
  if (!parsed) return null;
  const intervals = TRIAD_INTERVALS[parsed.quality];
  const rootIdx = pcOf(parsed.root);
  if (!intervals || rootIdx < 0) return null;
  return {
    name: parsed.root + parsed.quality,
    root: parsed.root,
    quality: parsed.quality,
    intervals,
    roles: [...TRIAD_ROLES],
    pcs: intervals.map(iv => (rootIdx + iv) % 12),
  };
}

function fretOn(stringIndex: number, pc: number): number {
  return (((pc - STRING_PCS[stringIndex]) % 12) + 12) % 12;
}

export function triadShapes(chordName: string): TriadShape[] {
  const triad = triadOf(chordName);
  if (!triad) return [];
  const sig: 'flat' | 'sharp' = triad.root.includes('b') ? 'flat' : 'sharp';
  const out: TriadShape[] = [];
  for (const set of STRING_SETS) {
    for (let r = 0; r < 3; r++) {
      const order = [r, (r + 1) % 3, (r + 2) % 3];
      const pcs = order.map(i => triad.pcs[i]);
      const frets = set.map((s, i) => fretOn(s, pcs[i]));
      const span = Math.max(...frets) - Math.min(...frets);
      if (span > MAX_TRIAD_SPAN) continue;
      if (Math.max(...frets) >= FRET_COUNT) continue;
      const dots: TriadDot[] = set.map((s, i) => ({
        string: s,
        fret: frets[i],
        role: TRIAD_ROLES[order[i]],
        pc: pcs[i],
        note: spellPc(pcs[i], sig),
      }));
      const setName = STRING_SET_NAMES[set.join(',')];
      out.push({
        id: `${triad.name}·${setName}·${r}`,
        chord: triad.name,
        stringSet: [...set],
        stringNames: set.map(s => STRING_NAMES[s]),
        frets,
        tones: dots.map(d => d.note),
        dots,
        rotation: r as 0 | 1 | 2,
        rotationLabel: ROTATION_LABELS[r],
        label: `${triad.name} · ${setName} · ${ROTATION_LABELS[r]} · ${frets.join('-')}`,
        span,
        minFret: Math.min(...frets),
        bassRole: TRIAD_ROLES[order[0]],
      });
    }
  }
  const byPosition = (a: TriadShape, b: TriadShape) =>
    a.minFret - b.minFret || a.stringSet[0] - b.stringSet[0] || a.rotation - b.rotation;
  return out.sort(byPosition);
}

export function splitChords(text: string): string[] {
  return text.split(/[\s,;/]+/).filter(t => t.length > 0);
}

export const TRIAD_PRESETS: { label: string; value: string }[] = [
  { label: 'I-V-vi-IV · C', value: 'C G Am F' },
  { label: '2-5-1 jazz', value: 'Dm7 G7 Cmaj7' },
  { label: 'Porque sí · C Am F G', value: 'C Am F G' },
  { label: '12-bar blues', value: 'C7 F7 C7 C7 F7 F7 C7 C7 G7 F7 C7 G7' },
  { label: 'Menor · Am F C G', value: 'Am F C G' },
  { label: 'Canon · C G Am Em F C F G', value: 'C G Am Em F C F G' },
];