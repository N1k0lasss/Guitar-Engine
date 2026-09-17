import { NOTES, STRING_PCS } from './notes';

export interface ScaleDef { label: string; intervals: number[]; group: string; }

export const SCALE_TYPES: Record<string, ScaleDef> = {
  major:       { label: 'Mayor (Jónico)', intervals: [0, 2, 4, 5, 7, 9, 11], group: 'Diatónicas' },
  minor:       { label: 'Menor natural (Eólico)', intervals: [0, 2, 3, 5, 7, 8, 10], group: 'Diatónicas' },
  dorian:      { label: 'Dórico', intervals: [0, 2, 3, 5, 7, 9, 10], group: 'Diatónicas' },
  phrygian:    { label: 'Frigio', intervals: [0, 1, 3, 5, 7, 8, 10], group: 'Diatónicas' },
  lydian:      { label: 'Lidio', intervals: [0, 2, 4, 6, 7, 9, 11], group: 'Diatónicas' },
  mixolydian:  { label: 'Mixolidio', intervals: [0, 2, 4, 5, 7, 9, 10], group: 'Diatónicas' },
  locrian:     { label: 'Locrio', intervals: [0, 1, 3, 5, 6, 8, 10], group: 'Diatónicas' },
  pentatonic:  { label: 'Pentatónica mayor', intervals: [0, 2, 4, 7, 9], group: 'Pentatónicas' },
  pentatonicMin: { label: 'Pentatónica menor', intervals: [0, 3, 5, 7, 10], group: 'Pentatónicas' },
  blues:       { label: 'Blues menor', intervals: [0, 3, 5, 6, 7, 10], group: 'Pentatónicas' },
  bluesMaj:    { label: 'Blues mayor', intervals: [0, 2, 3, 4, 7, 9], group: 'Pentatónicas' },
  harmonicMinor: { label: 'Menor armónica', intervals: [0, 2, 3, 5, 7, 8, 11], group: 'Menores alteradas' },
  melodicMinor: { label: 'Menor melódica (asc.)', intervals: [0, 2, 3, 5, 7, 9, 11], group: 'Menores alteradas' },
  dimWH:       { label: 'Disminuida tono-semitono', intervals: [0, 2, 3, 5, 6, 8, 9, 11], group: 'Simétricas' },
  dimHW:       { label: 'Disminuida semitono-tono', intervals: [0, 1, 3, 4, 6, 7, 9, 10], group: 'Simétricas' },
  augmented:   { label: 'Aumentada', intervals: [0, 3, 4, 7, 8, 11], group: 'Simétricas' },
  lydianDom:   { label: 'Lidio dominante (Lidio b7)', intervals: [0, 2, 4, 6, 7, 9, 10], group: 'Modos especiales' },
  altered:     { label: 'Alterada (Super Locrio)', intervals: [0, 1, 3, 4, 6, 8, 10], group: 'Modos especiales' },
  phrygianDom: { label: 'Frigio dominante', intervals: [0, 1, 4, 5, 7, 8, 10], group: 'Modos especiales' },
};

export const SCALE_GROUPS = [...new Set(Object.values(SCALE_TYPES).map(s => s.group))];
export const FRET_COUNT = 15;

export const CAGED_POSITIONS = [
  { label: 'Todo el mástil', start: 0, end: 15 },
  { label: 'Posición 1 (0-4)', start: 0, end: 4 },
  { label: 'Posición 2 (2-7)', start: 2, end: 7 },
  { label: 'Posición 3 (5-9)', start: 5, end: 9 },
  { label: 'Posición 4 (7-12)', start: 7, end: 12 },
  { label: 'Posición 5 (10-15)', start: 10, end: 15 },
];

export function scaleNotes(root: string, type: string): string[] {
  const def = SCALE_TYPES[type];
  const idx = NOTES.indexOf(root as never);
  if (!def || idx < 0) return [];
  return def.intervals.map(iv => NOTES[(idx + iv) % 12]);
}

export interface FretCell {
  note: string;
  fret: number;
  string: number;
  inScale: boolean;
  isRoot: boolean;
}

export function fretboardCells(root: string, type: string, start: number, end: number): FretCell[] {
  const notes = scaleNotes(root, type);
  const cells: FretCell[] = [];
  for (let string = 0; string < STRING_PCS.length; string++) {
    for (let fret = start; fret <= end; fret++) {
      const note = NOTES[(STRING_PCS[string] + fret) % 12];
      cells.push({ note, fret, string, inScale: notes.includes(note), isRoot: note === root });
    }
  }
  return cells;
}