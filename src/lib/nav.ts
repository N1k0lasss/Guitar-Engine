import { writable } from 'svelte/store';
import { engineSetMode } from './audio/engine';

export type ViewId =
  | 'chords' | 'tuner' | 'harmony' | 'modes' | 'cartography' | 'sabores' | 'ejes'
  | 'tensions' | 'prl' | 'tritone' | 'proximity' | 'circle' | 'scales' | 'polychords' | 'voicings';

export const MODE_READOUTS: Record<ViewId, string> = {
  chords: 'CAPTURA CROMÁTICA',
  tuner: 'AFINACIÓN / DESVÍO',
  harmony: 'REDES FUNCIONALES',
  modes: 'ROTACIÓN MODAL',
  cartography: 'CARTOGRAFÍA TONAL',
  sabores: 'COLOR / CARÁCTER',
  ejes: 'EJES DE TENSIÓN',
  tensions: 'EXTENSIONES / FRICCIÓN',
  prl: 'TRANSFORMACIONES P / R / L',
  tritone: 'EQUIVALENCIA DEL TRITONO',
  proximity: 'VECINDAD ARMÓNICA',
  circle: 'CÍRCULO DE QUINTAS',
  scales: 'MAPA DE ESCALA',
  polychords: 'SUPERPOSICIÓN DE VOCES',
  voicings: 'INVERSIONES / DROPS',
};

export const activeView = writable<ViewId>('chords');

export function go(view: ViewId): void {
  activeView.set(view);
  engineSetMode(view);
}

export function readoutOf(view: ViewId): string {
  return MODE_READOUTS[view] || 'ESTUDIO ARMÓNICO';
}