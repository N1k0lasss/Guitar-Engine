import { NOTES } from './notes';

export interface ModeDef {
  name: string;
  degree: string;
  offset: number;
  quality: string;
  triadQuality: string;
  tension: string;
  character: string;
  characterInterval?: number;
  description: string;
  color: string;
}

export const MODE_DATA: ModeDef[] = [
  { name: 'Jónico', degree: 'I', offset: 0, quality: 'maj7', triadQuality: '', tension: 'maj7', character: 'sin alteración', description: 'El centro mayor: abierto, estable y luminoso.', color: '#c08a43' },
  { name: 'Dórico', degree: 'II', offset: 2, quality: 'm7', triadQuality: 'm', tension: '6', character: '6 mayor', characterInterval: 9, description: 'Menor con una sexta mayor: oscuro, pero con movimiento.', color: '#6e9166' },
  { name: 'Frigio', degree: 'III', offset: 4, quality: 'm7', triadQuality: 'm', tension: '(addb9)', character: '2 menor', characterInterval: 1, description: 'Menor con segunda menor: tensión cercana y un color antiguo.', color: '#a45a46' },
  { name: 'Lidio', degree: 'IV', offset: 5, quality: 'maj7', triadQuality: '', tension: '(add#11)', character: '4 aumentada', characterInterval: 6, description: 'Mayor con cuarta aumentada: flotante, amplio y luminoso.', color: '#6e91a3' },
  { name: 'Mixolidio', degree: 'V', offset: 7, quality: '7', triadQuality: '', tension: '7', character: '7 menor', characterInterval: 10, description: 'Mayor con séptima menor: directo, cálido y terrenal. En tríada, sin la séptima: el libro lo usa así.', color: '#9b7352' },
  { name: 'Eólico', degree: 'VI', offset: 9, quality: 'm7', triadQuality: 'm', tension: 'm7', character: '6 menor', characterInterval: 8, description: 'La menor natural: introspectivo, familiar y melancólico.', color: '#806b83' },
  { name: 'Locrio', degree: 'VII', offset: 11, quality: 'm7b5', triadQuality: 'dim', tension: 'm7b5', character: '5 disminuida', characterInterval: 6, description: 'Menor con quinta disminuida: inestable y lleno de tensión.', color: '#8b625f' },
];

const MODE_NOTES = NOTES;

export function modeNote(root: string, interval: number): string {
  return MODE_NOTES[(MODE_NOTES.indexOf(root as never) + interval) % 12];
}

export function modeScale(root: string, modeIndex: number): string[] {
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  return majorIntervals.map((_, index) => modeNote(root, majorIntervals[(index + modeIndex) % 7]));
}

export function modeTensionName(root: string, mode: ModeDef): string {
  return modeNote(root, mode.offset) + mode.tension;
}

export function modeChordName(root: string, mode: ModeDef, tetrad: boolean): string {
  return modeNote(root, mode.offset) + (tetrad ? mode.quality : mode.triadQuality);
}