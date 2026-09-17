import { NOTES } from './notes';

export const FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

export const KEY_SIGNS: Record<string, string> = {
  C: 'sin alteraciones', G: '1 sostenido', D: '2 sostenidos', A: '3 sostenidos', E: '4 sostenidos', B: '5 sostenidos',
  'F#': '6 sostenidos', 'C#': '7 sostenidos', 'G#': '4 bemoles (Ab)', 'D#': '3 bemoles (Eb)', 'A#': '2 bemoles (Bb)', F: '1 bemol',
};

export const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];
export const MAJOR_ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

export const CIRCLE_NODE_HALF = 24;
export const CIRCLE_BULGE = 16;
export const CIRCLE_FALLBACK_R = 175;

export function circleNoteAt(root: string, interval: number): string {
  return NOTES[(NOTES.indexOf(root as never) + interval) % 12];
}

export interface KeyChord { name: string; roman: string; }

export function keyChords(root: string): KeyChord[] {
  return MAJOR_INTERVALS.map((interval, index) => ({
    name: circleNoteAt(root, interval) + MAJOR_QUALITIES[index],
    roman: MAJOR_ROMANS[index],
  }));
}