export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export const CANONICAL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const ALIASES: Record<string, string> = {
  'Cb': 'B', 'B#': 'C', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
};

export type Signature = 'sharp' | 'flat';

export function pcOf(name: string): number {
  const n = ALIASES[name] ?? name;
  const i = NOTES.indexOf(n as never);
  return i < 0 ? -1 : i;
}

export function noteOf(pc: number): string {
  return NOTES[(((pc % 12) + 12) % 12)];
}

export function flatOf(pc: number): string {
  return FLAT_NAMES[(((pc % 12) + 12) % 12)];
}

export function spellPc(pc: number, sig: Signature): string {
  return sig === 'flat' ? flatOf(pc) : noteOf(pc);
}

/** 12→6 oktava: mapa de pcs para diagramas */
export const STRING_PCS = [4, 9, 2, 7, 11, 4];

/** Intervalos → nombre de nota relativo a pc */
export function notesFromPcs(pcs: number[]): string[] {
  return pcs.map(pc => noteOf(pc));
}

export function pcsFromName(name: string, intervals: number[]): number[] {
  const r = pcOf(name);
  return r < 0 ? [] : intervals.map(iv => (r + iv) % 12);
}

export function midiOf(pc: number, low = 48): number {
  let m = 60 + (((pc - 9) % 12) + 12) % 12;
  while (m < low) m += 12;
  while (m > low + 12) m -= 12;
  return m;
}

export const freqOfMidi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);