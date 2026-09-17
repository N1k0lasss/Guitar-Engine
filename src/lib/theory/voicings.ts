import { NOTES, STRING_PCS, pcOf } from './notes';
import { CHORD_TYPES, parseChordName, type ParsedChord } from './chords';

export interface Voicing {
  id: string;
  kind: string;
  label: string;
  frets: (number | null)[];
  tones: string[];
}

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

export const DROPS = [
  { id: 'drop2', label: 'Drop 2' },
  { id: 'drop3', label: 'Drop 3' },
  { id: 'drop4', label: 'Drop 4' },
  { id: 'drop24', label: 'Drop 2+4' },
];

const TETRADS = ['7', 'maj7', 'm7'];
const GROUPS = [[5, 4, 3, 2] as const, [4, 3, 2, 1] as const, [3, 2, 1, 0] as const];

function fretOn(stringIndex: number, targetPc: number): number {
  let fret = ((targetPc - STRING_PCS[stringIndex]) % 12 + 12) % 12;
  if (fret < 1) fret += 12;
  if (fret > 12) fret -= 12;
  return fret;
}

function applyDrop(intervals: number[], dropId: string): number[] {
  const arr = [...intervals];
  if (dropId === 'drop2') arr[2] -= 12;
  if (dropId === 'drop3') arr[1] -= 12;
  if (dropId === 'drop4') arr[0] -= 12;
  if (dropId === 'drop24') { arr[2] -= 12; arr[0] -= 12; }
  return arr.sort((a, b) => a - b);
}

function bestDropPosition(pitches: number[]) {
  let best: { strings: readonly number[]; frets: number[]; span: number } | null = null;
  for (const group of GROUPS) {
    const frets = pitches.map((p, i) => fretOn(group[i], ((p % 12) + 12) % 12));
    const span = Math.max(...frets) - Math.min(...frets);
    if (!best || span < best.span) best = { strings: group, frets, span };
  }
  return best;
}

function toneNames(frets: (number | null)[]): string[] {
  return (frets || []).map((fret, i) => (fret === null ? '' : NOTES[(STRING_PCS[i] + fret) % 12]));
}

function scaleShape(shape: (number | null)[], rootPc: number, formRootPc: number): (number | null)[] {
  const offset = (rootPc - formRootPc + 12) % 12;
  return shape.map(f => (f === null ? null : f + offset));
}

function dForm(rootPc: number, quality: string): (number | null)[] {
  const f = (rootPc - STRING_PCS[2] + 12) % 12;
  const isMinor = quality === 'm';
  return [null, null, f, f + 2, f + 3, isMinor ? f + 1 : f + 2];
}

function makeVoicing(id: string, kind: string, label: string, frets: (number | null)[]): Voicing {
  return { id, kind, label, frets: frets.slice(), tones: toneNames(frets) };
}

const OPEN_SHAPES: Record<string, (number | null)[]> = {
  C: [null, 3, 2, 0, 1, 0], D: [null, null, 0, 2, 3, 2], E: [0, 2, 2, 1, 0, 0],
  G: [3, 2, 0, 0, 0, 3], A: [null, 0, 2, 2, 2, 0], Am: [null, 0, 2, 2, 1, 0],
  Dm: [null, null, 0, 2, 3, 1], Em: [0, 2, 2, 0, 0, 0], A7: [null, 0, 2, 0, 2, 0],
  E7: [0, 2, 0, 1, 0, 0], D7: [null, null, 0, 2, 1, 2],
};

const MOBILE: Record<string, { E: (number | null)[]; A?: (number | null)[] }> = {
  '': { E: [0, 2, 2, 1, 0, 0], A: [null, 0, 2, 2, 2, 0] },
  m: { E: [0, 2, 2, 0, 0, 0], A: [null, 0, 2, 2, 1, 0] },
  '7': { E: [0, 2, 0, 1, 0, 0], A: [null, 0, 2, 0, 2, 0] },
  maj7: { E: [0, 2, 1, 1, 0, 0], A: [null, 0, 2, 1, 2, 0] },
  m7: { E: [0, 2, 0, 0, 3, 0], A: [null, 0, 2, 0, 1, 0] },
  sus2: { E: [0, 2, 4, 4, 0, 0], A: [null, 0, 2, 2, 0, 0] },
  sus4: { E: [0, 2, 2, 2, 0, 0], A: [null, 0, 2, 2, 3, 0] },
  aug: { E: [0, 3, 2, 1, 1, 0], A: [null, 0, 3, 2, 2, 1] },
  dim: { E: [0, 1, 2, 0, 1, 0] },
};

export function getChordVoicings(chordName: string): Voicing[] {
  const parsed: ParsedChord | null = parseChordName(chordName);
  if (!parsed) return [];
  const { root, quality } = parsed;
  const rootPc = pcOf(root);
  if (rootPc < 0) return [];
  const out: Voicing[] = [];

  const open = OPEN_SHAPES[root + quality];
  if (open) out.push(makeVoicing('open', 'open', 'Abierta', open));

  const shapes = MOBILE[quality] || MOBILE[''];
  if (shapes.E) out.push(makeVoicing('e', 'barre-e', 'Barre E · raíz 6ª', scaleShape(shapes.E, rootPc, pcOf('E'))));
  if (shapes.A) out.push(makeVoicing('a', 'barre-a', 'Barre A · raíz 5ª', scaleShape(shapes.A, rootPc, pcOf('A'))));

  if (quality === '' || quality === 'm') {
    const frets6 = dForm(rootPc, quality);
    if (Math.max(...frets6.filter((f): f is number => f !== null)) <= 15) {
      out.push(makeVoicing('d', 'caged-d', 'Forma D · raíz 4ª', frets6));
    }
  }

  if (TETRADS.includes(quality)) {
    const intervals = CHORD_TYPES[quality].intervals.slice();
    for (const drop of DROPS) {
      const dropped = applyDrop(intervals, drop.id);
      const pos = bestDropPosition(dropped);
      if (pos) {
        const frets6: (number | null)[] = [null, null, null, null, null, null];
        pos.strings.forEach((s, i) => { frets6[s] = pos.frets[i]; });
        out.push(makeVoicing(drop.id, 'drop', drop.label, frets6));
      }
    }
  }
  return out;
}

export function getChordVoicing(chordName: string, voicingId?: string | null): Voicing | null {
  const list = getChordVoicings(chordName);
  return (voicingId && list.find(v => v.id === voicingId)) || list[0] || null;
}

export function fretWindow(frets: (number | null)[]) {
  const nonNull = (frets || []).filter((f): f is number => f !== null);
  if (!nonNull.length) return { base: 1, top: 1, hasOpen: false };
  const hasOpen = nonNull.some(f => f === 0);
  const base = hasOpen ? 0 : Math.min(...nonNull);
  const top = Math.min(15, Math.max(...nonNull, base + 3));
  return { base, top, hasOpen };
}

export function stringNames(): string[] {
  return STRING_NAMES;
}

// ===== Vista Voicings: Inversiones y Drops =====

export const VOICING_QUALITIES: Record<string, { label: string; intervals: number[]; degrees: string[]; color: string; symmetric?: number }> = {
  maj7:  { label: 'Maj7', intervals: [0, 4, 7, 11], degrees: ['R', '3', '5', '7'], color: '#ff526d' },
  m7:    { label: 'm7', intervals: [0, 3, 7, 10], degrees: ['R', 'b3', '5', 'b7'], color: '#55baff' },
  '7':   { label: 'Dom 7', intervals: [0, 4, 7, 10], degrees: ['R', '3', '5', 'b7'], color: '#c794ff' },
  m7b5:  { label: 'm7b5 (ø)', intervals: [0, 3, 6, 10], degrees: ['R', 'b3', 'b5', 'b7'], color: '#f2c86b' },
  dim7:  { label: 'dim7 (°7)', intervals: [0, 3, 6, 9], degrees: ['R', 'b3', 'b5', 'bb7'], color: '#ff9b6e', symmetric: 3 },
  aug:   { label: 'aug (maj7)', intervals: [0, 4, 8, 11], degrees: ['R', '3', '#5', '7'], color: '#86d58b', symmetric: 4 },
};

export const DROP_TYPES = [
  { id: 'close', label: 'Posición cerrada', desc: 'Las 4 voces en cuerdas adyacentes: la "escalera". Base de todas las inversiones.' },
  { id: 'drop2', label: 'Drop 2', desc: 'La segunda voz desde arriba baja una octava. El más usado en jazz guitar.' },
  { id: 'drop3', label: 'Drop 3', desc: 'La tercera voz desde arriba baja una octava. Sonido más abierto.' },
  { id: 'drop4', label: 'Drop 4', desc: 'La cuarta voz (bajo) baja una octava. Extiende el rango.' },
  { id: 'drop24', label: 'Drop 2+4', desc: 'Segunda y cuarta voces bajan una octava. Amplio y luminoso.' },
];

export const INVERSION_LABELS = ['Posición fundamental', '1ª inversión', '2ª inversión', '3ª inversión'];

export function voiInvert(intervals: number[], inv: number): number[] {
  const rotated = [...intervals];
  for (let i = 0; i < inv; i++) {
    const first = rotated.shift()!;
    rotated.push(first + 12);
  }
  return rotated;
}

export function voiApplyDrop(intervals: number[], dropId: string): number[] {
  const arr = [...intervals];
  if (dropId === 'close') return arr;
  if (dropId === 'drop2') { arr[2] -= 12; return arr.sort((a, b) => a - b); }
  if (dropId === 'drop3') { arr[1] -= 12; return arr.sort((a, b) => a - b); }
  if (dropId === 'drop4') { arr[0] -= 12; return arr.sort((a, b) => a - b); }
  if (dropId === 'drop24') { arr[2] -= 12; arr[0] -= 12; return arr.sort((a, b) => a - b); }
  return arr;
}

export interface VoicingData { intervals: number[]; notes: string[]; degrees: string[]; }

export function getVoicingData(root: string, quality: string, inv: number, dropId: string): VoicingData {
  const q = VOICING_QUALITIES[quality];
  const baseIntervals = voiInvert(q.intervals, inv);
  const droppedIntervals = voiApplyDrop(baseIntervals, dropId);
  const rootIdx = NOTES.indexOf(root as never);
  const notes = droppedIntervals.map(iv => NOTES[(rootIdx + ((iv % 12) + 12) % 12) % 12]);
  const degrees = droppedIntervals.map(iv => {
    const mod = ((iv % 12) + 12) % 12;
    const origIdx = q.intervals.findIndex(x => ((x % 12) + 12) % 12 === mod);
    return origIdx !== -1 ? q.degrees[origIdx] : '?';
  });
  return { intervals: droppedIntervals, notes, degrees };
}

export interface FretPos { frets: number[]; strings: number[]; span: number; }

export function voiBestFretPosition(pitches: number[]): FretPos | null {
  const groups = [[5, 4, 3, 2], [4, 3, 2, 1], [3, 2, 1, 0]];
  let best: FretPos | null = null;
  for (const strGroup of groups) {
    const frets = pitches.map((pitch, i) => {
      const openNote = STRING_PCS[strGroup[i]] as number;
      let fret = ((pitch % 12) - openNote + 12) % 12;
      while (fret < 1) fret += 12;
      if (fret > 12) fret -= 12;
      return fret;
    });
    const span = Math.max(...frets) - Math.min(...frets);
    if (!best || span < best.span) best = { frets, strings: strGroup, span };
  }
  return best;
}