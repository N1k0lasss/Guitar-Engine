import { NOTES } from './notes';

// Sabores de nota (Modos Ilustrados, pp 184–188). El libro marca el sabor contra C.

export interface SaborEntry {
  interval: number;
  flavor: string | null;
  label: string;
  intervalLabel: string;
  mode: string;
  desc: string;
}

export const SABOR_DATA: SaborEntry[] = [
  { interval: 0, flavor: 'casa', label: 'Casa', intervalLabel: 'unísono', mode: 'Jónico (I)', desc: 'El centro: la nota neutra y de reposo. Todo lo demás se mide contra ella.' },
  { interval: 1, flavor: 'flamenco', label: 'Flamenco', intervalLabel: 'b9', mode: 'Frigio (III)', desc: 'La 9na bemol: filosa y rasgada. Es la nota que vuelve flamenco al Frigio.' },
  { interval: 2, flavor: null, label: '', intervalLabel: '9', mode: '', desc: '' },
  { interval: 3, flavor: 'antiguo', label: 'Antiguo', intervalLabel: 'b3', mode: 'Menor (i)', desc: 'La 3ra menor: vuelve todo menor y suena a viejo, medieval o rústico.' },
  { interval: 4, flavor: null, label: '', intervalLabel: '3', mode: '', desc: '' },
  { interval: 5, flavor: null, label: '', intervalLabel: '11', mode: '', desc: '' },
  { interval: 6, flavor: 'magia', label: 'Magia', intervalLabel: '#4', mode: 'Lidio (IV)', desc: 'La 4ta aumentada: el poder mágico del Lidio. Flotante, amplio, de película.' },
  { interval: 7, flavor: null, label: '', intervalLabel: '5', mode: '', desc: '' },
  { interval: 8, flavor: null, label: '', intervalLabel: 'b13', mode: '', desc: '' },
  { interval: 9, flavor: 'dulce', label: 'Dulce', intervalLabel: '6', mode: 'Dórico (II)', desc: 'La 6ta mayor: el color suave y cantable que define al Dórico.' },
  { interval: 10, flavor: 'epico', label: 'Épico', intervalLabel: 'b7', mode: 'Mixolidio (V)', desc: 'La 7ma menor: la épica del Mixolidio. Grande, heroica, de celebración.' },
  { interval: 11, flavor: 'dominante', label: 'Dominante', intervalLabel: '7', mode: 'Dominante V7', desc: 'La 7ma mayor: la sensible que tira hacia la tónica y arma el V7.' },
];

export function saborNote(root: string, interval: number): string {
  return NOTES[(NOTES.indexOf(root as never) + interval) % 12];
}