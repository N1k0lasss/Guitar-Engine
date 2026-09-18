import { NOTES, pcOf } from './notes';

export interface ChordType {
  label: string;
  intervals: number[];
  template: number[];
}

export const CHORD_TYPES: Record<string, ChordType> = {
  '':     { label: '', intervals: [0, 4, 7],       template: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0] },
  m:      { label: 'm', intervals: [0, 3, 7],      template: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0] },
  '7':    { label: '7', intervals: [0, 4, 7, 10],  template: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0] },
  maj7:   { label: 'maj7', intervals: [0, 4, 7, 11], template: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1] },
  m7:     { label: 'm7', intervals: [0, 3, 7, 10], template: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0] },
  sus2:   { label: 'sus2', intervals: [0, 2, 7],   template: [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0] },
  sus4:   { label: 'sus4', intervals: [0, 5, 7],   template: [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0] },
  dim:    { label: 'dim', intervals: [0, 3, 6],    template: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0] },
  aug:    { label: 'aug', intervals: [0, 4, 8],    template: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
};

const CHORD_TYPE_LABELS: Record<string, string> = {
  '': 'Mayor', m: 'Menor', '7': 'Dominante 7', maj7: 'Maj7', m7: 'm7',
  sus2: 'Sus2', sus4: 'Sus4', dim: 'Disminuido', aug: 'Aumentado',
};

export const CHORD_TYPE_KEYS = Object.keys(CHORD_TYPES);

export function chordTypeLabel(q: string): string {
  return CHORD_TYPE_LABELS[q] ?? q;
}

const OPEN_SHAPES: Record<string, { frets: (number | null)[]; label: string }> = {
  C:   { frets: [null, 3, 2, 0, 1, 0], label: 'Forma abierta de C' },
  D:   { frets: [null, null, 0, 2, 3, 2], label: 'Forma abierta de D' },
  E:   { frets: [0, 2, 2, 1, 0, 0], label: 'Forma abierta de E' },
  G:   { frets: [3, 2, 0, 0, 0, 3], label: 'Forma abierta de G' },
  A:   { frets: [null, 0, 2, 2, 2, 0], label: 'Forma abierta de A' },
  Am:  { frets: [null, 0, 2, 2, 1, 0], label: 'Forma abierta de Am' },
  Dm:  { frets: [null, null, 0, 2, 3, 1], label: 'Forma abierta de Dm' },
  Em:  { frets: [0, 2, 2, 0, 0, 0], label: 'Forma abierta de Em' },
  A7:  { frets: [null, 0, 2, 0, 2, 0], label: 'Forma abierta de A7' },
  E7:  { frets: [0, 2, 0, 1, 0, 0], label: 'Forma abierta de E7' },
  D7:  { frets: [null, null, 0, 2, 1, 2], label: 'Forma abierta de D7' },
};

const MOBILE_SHAPES: Record<string, { E: (number | null)[]; A?: (number | null)[] }> = {
  '':     { E: [0, 2, 2, 1, 0, 0], A: [null, 0, 2, 2, 2, 0] },
  m:      { E: [0, 2, 2, 0, 0, 0], A: [null, 0, 2, 2, 1, 0] },
  '7':    { E: [0, 2, 0, 1, 0, 0], A: [null, 0, 2, 0, 2, 0] },
  maj7:   { E: [0, 2, 1, 1, 0, 0], A: [null, 0, 2, 1, 2, 0] },
  m7:     { E: [0, 2, 0, 0, 3, 0], A: [null, 0, 2, 0, 1, 0] },
  sus2:   { E: [0, 2, 4, 4, 0, 0], A: [null, 0, 2, 2, 0, 0] },
  sus4:   { E: [0, 2, 2, 2, 0, 0], A: [null, 0, 2, 2, 3, 0] },
  aug:    { E: [0, 3, 2, 1, 1, 0], A: [null, 0, 3, 2, 2, 1] },
  dim:    { E: [0, 1, 2, 0, 1, 0] },
};

const BOX_ALIAS = /^([A-G])([#b]?)(m7|maj7|sus2|sus4|dim|aug|7|m)?$/;

export interface ParsedChord { root: string; quality: string; }

export function parseChordName(chordName: string): ParsedChord | null {
  const match = chordName.trim().match(BOX_ALIAS);
  if (!match) return null;
  const raw = match[1] + match[2];
  return { root: NOTES[NOTES.indexOf(raw as never)] ?? raw, quality: match[3] || '' };
}

export function chordNotes(root: string, quality: string): string[] {
  const r = pcOf(root);
  if (r < 0 || !CHORD_TYPES[quality]) return [];
  return CHORD_TYPES[quality].intervals.map(iv => NOTES[(r + iv) % 12]);
}

export interface Fingering { frets: (number | null)[]; label: string; }

export function getFingering(root: string, quality: string): Fingering {
  const open = OPEN_SHAPES[root + quality];
  if (open) return { frets: open.frets, label: open.label };

  const shapes = MOBILE_SHAPES[quality] || MOBILE_SHAPES[''];
  const rootIdx = pcOf(root);

  if (quality === 'dim') {
    const offset = (rootIdx - pcOf('E') + 12) % 12;
    return { frets: shapes.E.map(f => (f === null ? null : f + offset)), label: 'Forma móvil de E (7ª disminuida)' };
  }

  const shapeRoot = ['E', 'A'][rootIdx % 2] as 'E' | 'A';
  const offset = (rootIdx - pcOf(shapeRoot) + 12) % 12;
  const base = shapes[shapeRoot] || shapes.E;
  return { frets: base.map(f => (f === null ? null : f + offset)), label: `Forma móvil de ${shapeRoot}` };
}

export interface ChordInfo { notes: string[]; fingering: Fingering; }

export function getChordInfo(chordName: string): ChordInfo | null {
  const parsed = parseChordName(chordName);
  if (!parsed) return null;
  return { notes: chordNotes(parsed.root, parsed.quality), fingering: getFingering(parsed.root, parsed.quality) };
}

export type QualityFamily = 'major' | 'minor' | 'dominant' | 'diminished' | 'augmented';

export function qualityFamily(chordName: string): QualityFamily {
  const parsed = parseChordName(chordName);
  if (!parsed) return 'major';
  return qualityFamilyOf(parsed );
}

export function qualityFamilyOf({ quality }: ParsedChord): QualityFamily {
  if (quality === 'm' || quality === 'm7') return 'minor';
  if (quality === 'dim') return 'diminished';
  if (quality === '7') return 'dominant';
  if (quality === 'aug') return 'augmented';
  return 'major';
}

export const QUALITY_CLASS: Record<QualityFamily, string> = {
  major: 'q-major', minor: 'q-minor', dominant: 'q-dominant', diminished: 'q-dim', augmented: 'q-aug',
};

export function qualityColor(family: QualityFamily): string {
  return {
    major: 'var(--q-major)', minor: 'var(--q-minor)', dominant: 'var(--q-dominant)',
    diminished: 'var(--q-dim)', augmented: 'var(--q-aug)',
  }[family];
}