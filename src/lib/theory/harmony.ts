import { writable, derived, get } from 'svelte/store';
import { CHORD_TYPES, parseChordName } from './chords';
import { getChordVoicings, getChordVoicing } from './voicings';

// ===== Armonía ilustrada (Illustrated Harmony vol.1) =====

const HARMONY_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HARMONY_FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const HARMONY_CANONICAL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const HARMONY_FLAT_MAJOR_KEYS = [5, 10, 3, 8, 1];

export function harmonSignatureFor(rootPc: number, mod: 'maj' | 'min'): 'flat' | 'sharp' {
  const rel = (((rootPc + (mod === 'min' ? 3 : 0)) % 12) + 12) % 12;
  return HARMONY_FLAT_MAJOR_KEYS.includes(rel) ? 'flat' : 'sharp';
}

export function harmonSpellPc(pc: number, signature: 'flat' | 'sharp'): string {
  const idx = (((pc % 12) + 12) % 12);
  return signature === 'flat' ? HARMONY_FLAT_NAMES[idx] : HARMONY_NOTES[idx];
}

export function harmonSpellName(pc: number): string {
  return HARMONY_CANONICAL[(((pc % 12) + 12) % 12)];
}

export const HARMONY_TONIC = { maj: 'I', min: 'i' } as const;
export const HARMONY_SCALE_INTERVALS = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10] } as const;

export interface HarmonyDef {
  degree: string; quality: string; interval: number; origin: 'diatonic' | 'borrowed';
  role: string; description: string;
}

export const HARMONY_DEGREES: Record<'maj' | 'min', HarmonyDef[]> = {
  maj: [
    { degree: 'I', quality: '', interval: 0, origin: 'diatonic', role: 'Centro', description: 'El centro de la tonalidad. Desde acá podés abrir varios recorridos.' },
    { degree: 'ii', quality: 'm', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Prepara la dominante con un movimiento suave y muy usable.' },
    { degree: 'iii', quality: 'm', interval: 4, origin: 'diatonic', role: 'Puente', description: 'Conecta la tónica con otros acordes sin cerrar la frase.' },
    { degree: 'IV', quality: '', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Abre el movimiento y se aleja del centro sin perder estabilidad.' },
    { degree: 'V', quality: '', interval: 7, origin: 'diatonic', role: 'Dominante', description: 'Tensa el recorrido y pide volver al centro de la tonalidad.' },
    { degree: 'vi', quality: 'm', interval: 9, origin: 'diatonic', role: 'Relativa menor', description: 'Comparte notas con la tónica, pero cambia el color hacia una sensación más íntima.' },
    { degree: 'vii°', quality: 'dim', interval: 11, origin: 'diatonic', role: 'Sensible', description: 'El grado sensible: resuelve al centro con tensión concentrada (B°≈G7).' },
    { degree: 'iv', quality: 'm', interval: 5, origin: 'borrowed', role: 'Plagal menor', description: 'La subdominante menor de la tonalidad paralela: la cadencia "amarga" 4→4m→1.' },
    { degree: 'bVII', quality: '', interval: 10, origin: 'borrowed', role: 'Préstamo', description: 'Un color tomado de la tonalidad paralela para salir del camino esperado.' },
  ],
  min: [
    { degree: 'i', quality: 'm', interval: 0, origin: 'diatonic', role: 'Centro', description: 'El centro de la tonalidad menor. Desde acá podés abrir varios recorridos.' },
    { degree: 'ii°', quality: 'dim', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Prepara la dominante con un movimiento suave y muy usable.' },
    { degree: 'III', quality: '', interval: 3, origin: 'diatonic', role: 'Relativa mayor', description: 'Comparte notas con la tónica; el color cambia al modo relativo.' },
    { degree: 'iv', quality: 'm', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Abre el movimiento sin perder estabilidad: el color más serio.' },
    { degree: 'v', quality: 'm', interval: 7, origin: 'diatonic', role: 'Dominante menor', description: 'Tensa el recorrido; en menor natural no hay sensible.' },
    { degree: 'VI', quality: '', interval: 8, origin: 'diatonic', role: 'Sobretónica', description: 'Puerto de color: comparte dos notas con el centro.' },
    { degree: 'VII', quality: '', interval: 10, origin: 'diatonic', role: 'Puente', description: 'Subtonica: conecta hacia el subdominante sin cerrar.' },
  ],
};

export const HARMONY_EDGES: Record<'maj' | 'min', [string, string, string][]> = {
  maj: [
    ['I', 'vi', 'misma familia'], ['I', 'IV', 'abre'], ['I', 'V', 'tensiona'],
    ['vi', 'IV', 'continúa'], ['IV', 'V', 'prepara'], ['V', 'I', 'resuelve'],
    ['ii', 'V', 'prepara'], ['iii', 'vi', 'conecta'], ['IV', 'bVII', 'cambia el color'],
    ['vii°', 'I', 'resuelve'], ['vii°', 'V', 'sinónimo'], ['IV', 'I', 'plagal'],
    ['IV', 'iv', 'plagal menor'], ['iv', 'I', 'resuelve'],
  ],
  min: [
    ['i', 'VII', 'baja por grado'], ['i', 'VI', 'continúa'], ['i', 'III', 'relativa'], ['i', 'v', 'tensiona'],
    ['iv', 'i', 'plagal'], ['v', 'i', 'resuelve'], ['iv', 'v', 'prepara'],
    ['VI', 'iv', 'conecta'], ['VI', 'v', 'baja por grado'], ['v', 'iv', 'baja por grado'],
    ['VII', 'VI', 'baja por grado'], ['VII', 'iv', 'prepara'], ['III', 'i', 'relativa'],
    ['ii°', 'i', 'resuelve'], ['ii°', 'v', 'prepara'],
  ],
};

export const HARMONY_POSITIONS: Record<string, Record<string, [number, number]>> = {
  maj: { I: [50, 50], ii: [27, 76], iii: [73, 76], IV: [50, 17], V: [82, 28], vi: [18, 28], 'vii°': [84, 52], iv: [18, 52], bVII: [50, 91] },
  min: { i: [50, 50], 'ii°': [27, 76], III: [73, 76], iv: [50, 17], v: [82, 28], VI: [18, 28], VII: [50, 91] },
};

export interface HarmonyVariant {
  label: string; mod: 'maj' | 'min'; intervals: number[];
  degrees: HarmonyDef[]; edges: [string, string, string][]; positions: Record<string, [number, number]>;
}

export const HARMONY_VARIANTS: Record<string, HarmonyVariant> = {
  major: {
    label: 'Mayor', mod: 'maj', intervals: [...HARMONY_SCALE_INTERVALS.maj],
    degrees: HARMONY_DEGREES.maj, edges: HARMONY_EDGES.maj, positions: HARMONY_POSITIONS.maj,
  },
  natural: {
    label: 'Menor natural', mod: 'min', intervals: [...HARMONY_SCALE_INTERVALS.min],
    degrees: HARMONY_DEGREES.min, edges: HARMONY_EDGES.min, positions: HARMONY_POSITIONS.min,
  },
  harmonic: {
    label: 'Menor armónica', mod: 'min', intervals: [0, 2, 3, 5, 7, 8, 11] as number[],
    degrees: [
      { degree: 'i', quality: 'm', interval: 0, origin: 'diatonic', role: 'Centro', description: 'El centro menor con sensible elevada: la dominante puede resolver con fuerza.' },
      { degree: 'ii°', quality: 'dim', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Acorde disminuido que prepara la dominante.' },
      { degree: 'III+', quality: 'aug', interval: 3, origin: 'diatonic', role: 'Relativa mayor', description: 'Acorde aumentado producido por la sensible elevada.' },
      { degree: 'iv', quality: 'm', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Subdominante menor de la escala armónica.' },
      { degree: 'V', quality: '', interval: 7, origin: 'diatonic', role: 'Dominante', description: 'Dominante mayor: contiene la sensible y resuelve al centro.' },
      { degree: 'VI', quality: '', interval: 8, origin: 'diatonic', role: 'Sobretónica', description: 'Sexto grado mayor de la escala armónica.' },
      { degree: 'vii°', quality: 'dim', interval: 11, origin: 'diatonic', role: 'Sensible', description: 'La sensible forma un acorde disminuido que resuelve al centro.' },
    ] as HarmonyDef[],
    edges: [
      ['i', 'VI', 'continúa'], ['i', 'III+', 'relativa'], ['i', 'iv', 'abre'],
      ['ii°', 'V', 'prepara'], ['iv', 'V', 'prepara'], ['V', 'i', 'resuelve'],
      ['VI', 'iv', 'conecta'], ['vii°', 'i', 'resuelve'],
    ] as [string, string, string][],
    positions: { i: [50, 50], 'ii°': [27, 76], 'III+': [73, 76], iv: [50, 17], V: [82, 28], VI: [18, 28], 'vii°': [50, 91] },
  },
  melodic: {
    label: 'Menor melódica', mod: 'min', intervals: [0, 2, 3, 5, 7, 9, 11] as number[],
    degrees: [
      { degree: 'i', quality: 'm', interval: 0, origin: 'diatonic', role: 'Centro', description: 'Centro menor; la sexta y séptima elevadas favorecen el movimiento ascendente.' },
      { degree: 'ii', quality: 'm', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Preparación menor de la dominante.' },
      { degree: 'III+', quality: 'aug', interval: 3, origin: 'diatonic', role: 'Relativa mayor', description: 'Color aumentado de la escala menor melódica.' },
      { degree: 'IV', quality: '', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Subdominante mayor con sexta elevada.' },
      { degree: 'V', quality: '', interval: 7, origin: 'diatonic', role: 'Dominante', description: 'Dominante mayor con sensible.' },
      { degree: 'vi°', quality: 'dim', interval: 9, origin: 'diatonic', role: 'Paso', description: 'Sexto grado disminuido de la escala melódica ascendente.' },
      { degree: 'vii°', quality: 'dim', interval: 11, origin: 'diatonic', role: 'Sensible', description: 'Acorde de sensible que resuelve al centro.' },
    ] as HarmonyDef[],
    edges: [
      ['i', 'IV', 'asciende'], ['i', 'V', 'tensiona'], ['i', 'III+', 'color'],
      ['ii', 'V', 'prepara'], ['IV', 'V', 'prepara'], ['V', 'i', 'resuelve'],
      ['vi°', 'vii°', 'asciende'], ['vii°', 'i', 'resuelve'],
    ] as [string, string, string][],
    positions: { i: [50, 50], ii: [27, 76], 'III+': [73, 76], IV: [50, 17], V: [82, 28], 'vi°': [18, 28], 'vii°': [50, 91] },
  },
};

export type HarmonyMode = 'funciones' | 'prox' | 'cadencias' | 'dominantes' | 'puentes' | 'prog';

// ===== Estado global de la vista =====

export const harmonyKey = writable({ root: 'C', mod: 'maj' as 'maj' | 'min', variant: 'major' });
export const harmonyMode = writable<HarmonyMode>('funciones');
export const harmonyHarmonic = writable(false);
export const harmonySelected = writable('I');
export const harmonyPath = writable<string[]>(['I']);
export const harmonyProgPalette = writable('libre');
export const harmonyProgLength = writable(8);
export const harmonyProgTonic = writable(true);
export const harmonyProgMap = writable(true);
export const harmonyProgSeq = writable<ProgStep[]>([]);
export const harmonyProgLabels = writable<string[]>([]);
export const harmonyProgSummary = writable<string[]>([]);
export const harmonyProgSelected = writable(-1);
export const harmonyProgGenerated = writable(false);
export const harmonyMyProg = writable<string[]>([]);
export const harmonyMyProgSeven = writable(false);
export const harmonyMyProgSelected = writable(-1);
export const harmonySound = writable('synth');
export const harmonyStrumStyle = writable('arpeggio');
export const harmonyStrumBass = writable(false);
export const harmonyProgTempo = writable(120);

const harmonyVoicingSel = new Map<string, string>();

// ===== Derivados =====

export const harmonyVariantStore = derived(harmonyKey, $key => HARMONY_VARIANTS[$key.variant] || HARMONY_VARIANTS.major);

export function harmonyVariant(variant: string): HarmonyVariant {
  return HARMONY_VARIANTS[variant] || HARMONY_VARIANTS[variant === 'min' ? 'natural' : 'major'];
}

export function harmonyDegrees(mod: 'maj' | 'min', variant = get(harmonyKey).variant): HarmonyDef[] {
  const scale = harmonyVariant(variant);
  return scale.mod === mod ? scale.degrees : HARMONY_DEGREES[mod];
}

export function harmonyEdges(mod: 'maj' | 'min', variant = get(harmonyKey).variant): [string, string, string][] {
  const scale = harmonyVariant(variant);
  return scale.mod === mod ? scale.edges : HARMONY_EDGES[mod];
}

export function harmonyPositions(mod: 'maj' | 'min', variant = get(harmonyKey).variant): Record<string, [number, number]> {
  const scale = harmonyVariant(variant);
  return scale.mod === mod ? scale.positions : HARMONY_POSITIONS[mod];
}

export function harmonyRootIdx(root = get(harmonyKey).root): number {
  return HARMONY_NOTES.indexOf(root);
}

export function harmonChordName(mod: 'maj' | 'min', root: string, def: HarmonyDef): string {
  const rootPc = HARMONY_NOTES.indexOf(root);
  const pc = (((rootPc + def.interval) % 12) + 12) % 12;
  return harmonSpellPc(pc, harmonSignatureFor(rootPc, mod)) + def.quality;
}

export function harmonChordSet(mod: 'maj' | 'min', root: string, def: HarmonyDef): number[] {
  const base = HARMONY_NOTES.indexOf(root) + def.interval;
  return CHORD_TYPES[def.quality].intervals.map(iv => (base + iv) % 12);
}

export function harmonEdgeGlue(mod: 'maj' | 'min', root: string, from: string, to: string, variant = get(harmonyKey).variant): number {
  const defs = harmonyDegrees(mod, variant);
  const a = defs.find(d => d.degree === from);
  const b = defs.find(d => d.degree === to);
  if (!a || !b) return 0;
  return harmonChordSet(mod, root, b).filter(pc => harmonChordSet(mod, root, a).includes(pc)).length;
}

export function harmonSharedWithTonic(mod: 'maj' | 'min', root: string, def: HarmonyDef): number {
  const tonicQ = mod === 'min' ? 'm' : '';
  const tonic = CHORD_TYPES[tonicQ].intervals.map(iv => (HARMONY_NOTES.indexOf(root) + iv) % 12);
  return harmonChordSet(mod, root, def).filter(pc => tonic.includes(pc)).length;
}

export function harmonDominantName(root: string, mod: 'maj' | 'min'): string {
  const sig = harmonSignatureFor(HARMONY_NOTES.indexOf(root), mod);
  return harmonSpellPc((HARMONY_NOTES.indexOf(root) + HARMONY_SCALE_INTERVALS.maj[4]) % 12, sig) + '7';
}

export function harmonSecondaryDominant(root: string, mod: 'maj' | 'min', def: HarmonyDef): { name: string; root: string } {
  const pc = (HARMONY_NOTES.indexOf(root) + def.interval + 7) % 12;
  const sig = harmonSignatureFor(HARMONY_NOTES.indexOf(root), mod);
  return { name: harmonSpellPc(pc, sig) + '7', root: harmonSpellPc(pc, sig) };
}

export function harmonDomChain(root: string, mod: 'maj' | 'min'): string[] {
  const sig = harmonSignatureFor(HARMONY_NOTES.indexOf(root), mod);
  const start = (HARMONY_NOTES.indexOf(root) + HARMONY_SCALE_INTERVALS.maj[4]) % 12;
  const chain = [];
  let pc = start;
  do {
    chain.push(harmonSpellPc(pc, sig) + '7');
    pc = (pc + 5) % 12;
  } while (pc !== start);
  chain.push(harmonSpellPc(start, sig) + '7');
  return chain;
}

export function harmonTwoFiveOne(root: string, variant = get(harmonyKey).variant): { major: string[]; minor: string[] } {
  const get = (mod: 'maj' | 'min', deg: string) => harmonyDegrees(mod, variant).find(d => d.degree === deg);
  const major = ['ii', 'V', 'I'].map((deg, i) => {
    const q = ['m7', '7', 'maj7'][i];
    const d = get('maj', deg);
    return d ? harmonChordName('maj', root, { ...d, quality: q }) : '';
  });
  const minor = [['ii°', 'dim'], ['v', '7'], ['i', 'm']].map(([deg, q]) => {
    const d = get('min', deg);
    return d ? harmonChordName('min', root, { ...d, quality: q as string }) : '';
  });
  return { major, minor };
}

export const HARMONY_ROLE_INDEX: Record<string, number> = { i: 0, I: 0, 'ii°': 1, II: 1, iii: 2, III: 2, iv: 3, IV: 3, v: 4, V: 4, vi: 5, VI: 5, 'vii°': 6, VII: 6 };

export function harmonKeyChords(rootPc: number, modKey: 'maj' | 'min'): string[] {
  const mode = modKey === 'min' ? 'min' : 'maj';
  const sig = harmonSignatureFor(rootPc, mode);
  const base = ((rootPc % 12) + 12) % 12;
  const qs = mode === 'min' ? ['m', 'dim', '', 'm', 'm', '', ''] : ['', 'm', 'm', '', '', 'm', 'dim'];
  return HARMONY_SCALE_INTERVALS[mode].map((iv, i) => harmonSpellPc((base + iv) % 12, sig) + qs[i]);
}

export interface PivotKey { role: string; rootPc: number; modKey: 'maj' | 'min'; rootName: string; chords: string[]; }

export function harmonPivotKeys(root: string, selectedDef: HarmonyDef): PivotKey[] {
  const rootIdx = (HARMONY_NOTES.indexOf(root) + selectedDef.interval) % 12;
  const map = (keys: { role: string; rootPc: number; modKey: 'maj' | 'min' }[]) => keys.map(k => ({
    role: k.role, rootPc: k.rootPc, modKey: k.modKey,
    rootName: harmonSpellName(k.rootPc),
    chords: harmonKeyChords(k.rootPc, k.modKey),
  }));
  if (selectedDef.quality === 'm') {
    return map([
      { role: 'ii', rootPc: (rootIdx - 2 + 12) % 12, modKey: 'maj' as const },
      { role: 'iii', rootPc: (rootIdx - 4 + 12) % 12, modKey: 'maj' as const },
      { role: 'vi', rootPc: (rootIdx - 9 + 12) % 12, modKey: 'maj' as const },
      { role: 'i', rootPc: rootIdx, modKey: 'min' as const },
      { role: 'iv', rootPc: (rootIdx - 5 + 12) % 12, modKey: 'min' as const },
      { role: 'v', rootPc: (rootIdx - 7 + 12) % 12, modKey: 'min' as const },
    ]);
  }
  return map([
    { role: 'I', rootPc: rootIdx, modKey: 'maj' as const },
    { role: 'IV', rootPc: (rootIdx - 5 + 12) % 12, modKey: 'maj' as const },
    { role: 'V', rootPc: (rootIdx - 7 + 12) % 12, modKey: 'maj' as const },
  ]);
}

export function harmonDominantOptions(root: string, mod: 'maj' | 'min', selectedDef: HarmonyDef): { motion: string[]; label: string; note: string }[] {
  const rootIdx = HARMONY_NOTES.indexOf(root);
  const sig = harmonSignatureFor(rootIdx, mod);
  const selPc = (rootIdx + selectedDef.interval) % 12;
  const domPc = (selPc + 7) % 12;
  const subPc = (domPc - 6 + 12) % 12;
  const twinPc = (selPc + 11) % 12;
  const s = (pc: number) => harmonSpellPc(pc, sig);
  const domName = s(domPc) + '7';
  const target = 'C';
  return [
    { motion: [domName, target], label: `${domName} → ${harmonChordName(mod, root, selectedDef)}`, note: 'la resolución clásica (V de ' + selectedDef.degree + ')' },
    { motion: [s(subPc) + '7', target], label: `${s(subPc)}7 → ${harmonChordName(mod, root, selectedDef)}`, note: 'sustituto tritonal: mismo "tritono maldito" que ' + domName },
    { motion: [domName, s(twinPc) + 'dim', target], label: `${s(twinPc)}° ≈ ${domName}`, note: 'vii° = V7 sin la fundamental, con la 7ª disminuida como puente' },
    { motion: [domName, s(domPc) + 'aug', target], label: `${domName} → ${s(domPc)}+ → ${harmonChordName(mod, root, selectedDef)}`, note: 'pasando por el aumentado (baja la quinta al + y resuelve al centro)' },
  ];
}

export function harmonyLinePoints(from: [number, number], to: [number, number]) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const distance = Math.hypot(x2 - x1, y2 - y1) || 1;
  const inset = Math.min(11, distance / 3);
  const dx = (x2 - x1) / distance * inset;
  const dy = (y2 - y1) / distance * inset;
  return { x1: x1 + dx, y1: y1 + dy, x2: x2 - dx, y2: y2 - dy };
}

export function harmonyEdgeKind(label: string): string {
  if (/resuelve|plagal|sensible|cierre/i.test(label)) return 'cadence';
  if (/baja por grado/i.test(label)) return 'step';
  if (/prepara/i.test(label)) return 'prep';
  if (/tensiona|asciende|abre|cambia el color/i.test(label)) return 'tension';
  return 'bind';
}

// ===== Generador de progresiones =====

export interface ProgPalette { label: string; step: number; dom: number; axis: number; tritone: number; borrow: number; glueBias: number; seventh: boolean; unison: number; seed?: string[]; }

export const HARMONY_PROG_PALETTES: Record<string, ProgPalette> = {
  pop: { label: 'Pop', step: 1, dom: 0.25, axis: 0, tritone: 0, borrow: 0.05, glueBias: 0.6, seventh: false, unison: 0 },
  dominantes: { label: 'Dominantes', step: 0.5, dom: 1.5, axis: 0, tritone: 0.1, borrow: 0, glueBias: 0.3, seventh: true, unison: 0 },
  glue: { label: 'Glue / Puente', step: 1, dom: 0.6, axis: 0, tritone: 0, borrow: 0.15, glueBias: 1.8, seventh: false, unison: 0 },
  tritone: { label: 'Tritono', step: 0.4, dom: 1.0, axis: 1.0, tritone: 1.6, borrow: 0.2, glueBias: 0, seventh: true, unison: 0 },
  bartok: { label: 'Bartók', step: 0.3, dom: 0.6, axis: 2.0, tritone: 1.2, borrow: 0.1, glueBias: 0, seventh: false, unison: 0 },
  cadencias: { label: 'Cadencias 6-2-5-1', step: 0, dom: 0, axis: 0, tritone: 0, borrow: 1, glueBias: 0, seventh: true, unison: 0, seed: ['vi', 'ii', 'V', 'I'] },
  canon: { label: 'Pachelbel / Canon', step: 0, dom: 0, axis: 0, tritone: 0, borrow: 1, glueBias: 0, seventh: false, unison: 0, seed: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V', 'I'] },
  plagal: { label: 'Plagal 4-4m', step: 0, dom: 0, axis: 0, tritone: 0, borrow: 1, glueBias: 0, seventh: false, unison: 0, seed: ['IV', 'I', 'IV', 'iv', 'I', 'bVII', 'IV', 'I'] },
  libre: { label: 'Libre', step: 0.7, dom: 0.8, axis: 0.6, tritone: 0.6, borrow: 0.5, glueBias: 0.5, seventh: false, unison: 0.2 },
};

export interface ProgStep {
  degree: string; name: string; quality: string; rootPc: number; origin: 'diatonic' | 'borrowed'; notes: number[];
}

export function harmonProgQual(mod: 'maj' | 'min', degree: string, palette: string | ProgPalette): string {
  const cfg = typeof palette === 'string' ? HARMONY_PROG_PALETTES[palette] : palette;
  const up = cfg && cfg.seventh
    ? (mod === 'min' ? { v: '7', V: '7', 'ii°': 'dim', i: 'm7', iv: 'm7', III: 'maj7', IV: 'maj7' } : { ii: 'm7', iii: 'm7', vi: 'm7', V: '7', I: 'maj7', IV: 'maj7' })
    : {};
  const def = harmonyDegrees(mod).find(d => d.degree === degree);
  return (up as Record<string, string>)[degree] || (def ? def.quality : '');
}

export function harmonProgStep(name: string, mod: 'maj' | 'min', rootIdx: number, def: HarmonyDef, quality: string): ProgStep {
  const base = (rootIdx + def.interval + 12) % 12;
  return {
    degree: def.degree,
    name: harmonSpellPc(base, harmonSignatureFor(rootIdx, mod)) + quality,
    quality,
    rootPc: base,
    origin: def.origin,
    notes: CHORD_TYPES[quality].intervals.map(iv => (base + iv) % 12),
  };
}

export function harmonProgGlue(prevNotes: number[], nextNotes: number[]): number {
  return nextNotes.filter(pc => prevNotes.includes(pc)).length;
}

export function harmonGlueTension(cur: ProgStep, next: ProgStep): { shared: number[]; tension: number[] } {
  const shared = cur.notes.filter(pc => next.notes.includes(pc));
  const tension = next.notes.filter(pc => !cur.notes.includes(pc));
  return { shared, tension };
}

interface ProgCandidate { toIdx: number; kind: string; domName?: string; domRoot?: number; w: number; }

export function harmonProgCandidates(mod: 'maj' | 'min', rootIdx: number, palette: string, fromIdx: number, fromDef: HarmonyDef, fromNotes: number[]): ProgCandidate[] {
  const cfg = HARMONY_PROG_PALETTES[palette];
  const degrees = harmonyDegrees(mod);
  const tonicIdx = 0;
  const fromPc = (rootIdx + fromDef.interval) % 12;
  const candidates: ProgCandidate[] = [];
  degrees.forEach((to, toIdx) => {
    if (toIdx === fromIdx && cfg.unison <= 0) return;
    const step = harmonProgStep(to.degree, mod, rootIdx, to, harmonProgQual(mod, to.degree, palette));
    const diff = (step.rootPc - fromPc + 12) % 12;
    const tritone = diff === 6;
    const axis = diff === 3 || diff === 9;
    const fourthUp = diff === 5;
    const hasEdge = harmonyEdges(mod).some(([a, b]) => a === fromDef.degree && b === to.degree);
    const glue = harmonProgGlue(fromNotes, step.notes);
    let w = cfg.step + (hasEdge ? 1.2 : 0);
    if (toIdx === tonicIdx) w += 3.2;
    if (tritone) w += cfg.tritone * 5;
    if (axis && !tritone) w += cfg.axis * 5;
    if (fourthUp) w += cfg.dom * 4;
    w += glue * cfg.glueBias;
    if (to.origin === 'borrowed') w *= (cfg.borrow + 0.02);
    if (w > 0) candidates.push({ toIdx, kind: hasEdge ? 'edge' : 'mov', w });
  });
  if (cfg.dom > 0) {
    degrees.forEach((to, toIdx) => {
      if (toIdx === fromIdx) return;
      const domRoot = (rootIdx + to.interval + 7) % 12;
      const domName = harmonSpellPc(domRoot, harmonSignatureFor(rootIdx, mod)) + '7';
      candidates.push({ toIdx, kind: 'secdom', domName, domRoot, w: cfg.dom * 5 });
    });
  }
  return candidates;
}

export function harmonProgPick(candidates: ProgCandidate[], avoidIdx: number): ProgCandidate | undefined {
  const viable = candidates.filter(c => c.toIdx !== avoidIdx);
  const list = viable.length ? viable : candidates;
  const total = list.reduce((s, c) => s + c.w, 0);
  if (total <= 0) return list[0];
  let r = Math.random() * total;
  for (const c of list) { r -= c.w; if (r <= 0) return c; }
  return list[list.length - 1];
}

export function harmonProgDomStep(domRoot: number, domName: string): ProgStep {
  return {
    degree: 'V', name: domName, quality: '7', rootPc: domRoot, origin: 'diatonic' as const,
    notes: CHORD_TYPES['7'].intervals.map(iv => (domRoot + iv) % 12),
  };
}

export function harmonProgGenerate(len: number, mod: 'maj' | 'min', root: string, palette: string, tonicCheck: boolean): ProgStep[] {
  const rootIdx = HARMONY_NOTES.indexOf(root);
  const cfg = HARMONY_PROG_PALETTES[palette];
  if (cfg && cfg.seed && mod === 'maj') {
    const degrees = harmonyDegrees(mod);
    const tonicStep = () => harmonProgStep(degrees[0].degree, mod, rootIdx, degrees[0], harmonProgQual(mod, degrees[0].degree, palette));
    const seeded: ProgStep[] = [];
    cfg.seed.forEach(deg => {
      const def = degrees.find(d => d.degree === deg);
      if (def) seeded.push(harmonProgStep(def.degree, mod, rootIdx, def, harmonProgQual(mod, deg, palette)));
    });
    if (seeded.length) {
      const steps: ProgStep[] = [];
      for (let n = 0; n < len; n++) steps.push(seeded[n % seeded.length]);
      if (tonicCheck) steps[steps.length - 1] = tonicStep();
      return steps;
    }
  }
  const degrees = harmonyDegrees(mod);
  const tonicIdx = 0;
  const steps: ProgStep[] = [];
  const startIdx = tonicCheck ? 0 : Math.floor(Math.random() * degrees.length);
  let curIdx = startIdx;
  const pushCur = () => {
    const def = degrees[curIdx];
    steps.push(harmonProgStep(def.degree, mod, rootIdx, def, harmonProgQual(mod, def.degree, palette)));
  };
  pushCur();
  for (let i = 1; i < len; i++) {
    const fromDef = degrees[curIdx];
    const fromNotes = CHORD_TYPES[harmonProgQual(mod, fromDef.degree, palette)].intervals
      .map(iv => (rootIdx + fromDef.interval + iv) % 12);
    const cands = harmonProgCandidates(mod, rootIdx, palette, curIdx, fromDef, fromNotes);
    const picked = harmonProgPick(cands, curIdx);
    if (picked && picked.kind === 'secdom') {
      steps.push(harmonProgDomStep(picked.domRoot!, picked.domName!));
      curIdx = picked.toIdx;
    } else {
      curIdx = picked ? picked.toIdx : curIdx;
      pushCur();
    }
    if (steps.length >= len) break;
  }
  const tonicStep = () => harmonProgStep(degrees[tonicIdx].degree, mod, rootIdx, degrees[tonicIdx], harmonProgQual(mod, degrees[tonicIdx].degree, palette));
  if (tonicCheck) steps[len - 1] = tonicStep();
  while (steps.length < len) steps.push(tonicStep());
  return steps;
}

export function harmonProgLabel(mod: 'maj' | 'min', rootIdx: number, prev: ProgStep, cur: ProgStep): { t: string; kind: string; subtype?: string } {
  const tonic = mod === 'min' ? 'i' : 'I';
  const diff = (cur.rootPc - prev.rootPc + 12) % 12;
  const prevIsDom7 = prev.quality.indexOf('7') >= 0 && prev.quality.indexOf('maj') < 0 && prev.quality.indexOf('m7') < 0 && prev.quality.indexOf('maj7') < 0;
  const curIsDom7 = cur.quality.indexOf('7') >= 0 && cur.quality.indexOf('maj') < 0 && cur.quality.indexOf('m7') < 0 && cur.quality.indexOf('maj7') < 0;
  const isDomOfCur = (cur.rootPc + 7) % 12 === prev.rootPc;
  const isParallel = prev.rootPc === cur.rootPc;
  const prevIsMajor = !/m|dim/.test(prev.quality) && prev.quality.indexOf('7') < 0;
  const curIsMajor = !/m|dim/.test(cur.quality) && cur.quality.indexOf('7') < 0;
  const isRelative = (prevIsMajor && !curIsMajor && diff === 9) || (curIsMajor && !prevIsMajor && diff === 3);
  const isTritone = diff === 6;
  const isAxisMate = diff === 3 || diff === 9;
  const isFourth = diff === 5;
  const isMinorStepDown = mod === 'min' && diff === 10
    && ['i', 'III', 'VI', 'VII'].includes(prev.degree)
    && ['III', 'VI', 'VII'].includes(cur.degree);
  const prefix = cur.origin === 'borrowed' ? 'préstamo · ' : '';
  if (cur.degree === tonic) {
    const subtype = mod === 'min'
      ? (prevIsDom7 ? 'perfecta armonizada (V7→i)' : prev.degree === 'v' ? 'perfecta (v→i)' : prev.degree === 'iv' ? 'plagal (iv→i)' : 'cierre')
      : prev.degree === 'V' || prevIsDom7 ? 'perfecta (V→I)'
        : prev.degree === 'iv' ? 'amarga (4m→1)' : prev.degree === 'IV' ? 'plagal (IV→I)'
          : prev.degree === 'vii°' ? 'sensible (vii°→I)' : 'cierre';
    return { t: prefix ? prefix + subtype : subtype, kind: 'resol', subtype };
  }
  if (isParallel) return { t: 'paralela (P)', kind: 'prl' };
  if (isRelative) return { t: 'relativa (R)', kind: 'prl' };
  if (isMinorStepDown) return { t: 'bajada diatónica', kind: 'step' };
  if (prevIsDom7 && curIsDom7 && isFourth) return { t: 'cadena por cuartas', kind: 'chain' };
  if (prevIsDom7 && isDomOfCur) return { t: `${prev.name} → ${cur.name}`, kind: 'secdom' };
  if (isTritone) return { t: 'tritono · eje de Bartók', kind: 'axis' };
  if (isAxisMate) return { t: 'eje de Bartók', kind: 'axis' };
  if (isFourth && prevIsDom7) return { t: 'cadena por cuartas', kind: 'chain' };
  return { t: prefix + 'movimiento', kind: 'mov' };
}

export function harmonProgLabelsFor(steps: ProgStep[], mod: 'maj' | 'min', rootIdx: number): { labels: string[]; summary: string[] } {
  const labels = steps.slice(1).map((_, i) => harmonProgLabel(mod, rootIdx, steps[i], steps[i + 1]));
  const tonic = mod === 'min' ? 'i' : 'I';
  const is251 = (a: ProgStep, b: ProgStep, c: ProgStep) => {
    if (mod === 'min') return a.degree === 'ii°' && (b.degree === 'v' || b.degree === 'V') && c.degree === 'i';
    return a.degree === 'ii' && b.degree === 'V' && c.degree === 'I';
  };
  const summary: Record<string, boolean> = {};
  labels.forEach(l => { if (l.kind === 'resol') summary['cadencia'] = true; });
  for (let i = 0; i + 2 < steps.length; i++) {
    if (is251(steps[i], steps[i + 1], steps[i + 2])) {
      labels[i + 1] = { t: '2-5-1 (ii→V→I)', kind: '251' };
      summary['2-5-1'] = true;
    }
  }
  labels.forEach(l => {
    if (l.kind === 'secdom') summary['secdom'] = true;
    if (l.kind === 'axis') summary[l.t.includes('tritono') ? 'tritono' : 'bartok'] = true;
    if (l.kind === 'chain') summary['cuartas'] = true;
    if (l.kind === 'prl') summary['prl'] = true;
  });
  steps.forEach(s => { if (s.origin === 'borrowed') summary['prestamo'] = true; });
  for (let i = 0; i + 1 < steps.length; i++) {
    if (mod === 'maj' && steps[i].degree === 'vi' && steps[i + 1].degree === 'ii') summary['6-2-5-1'] = true;
    if (mod === 'maj' && steps[i].degree === 'IV' && steps[i + 1].degree === 'iv') summary['4-4m'] = true;
    if (mod === 'maj' && steps.length > 3 && steps[0].degree === 'I' && steps[1].degree === 'V' && steps[2].degree === 'vi' && steps[3].degree === 'iii') summary['canon'] = true;
  }
  const order = ['6-2-5-1', '4-4m', 'canon', '2-5-1', 'secdom', 'cadencia', 'cuartas', 'tritono', 'bartok', 'prl', 'prestamo'];
  return { labels: labels.map(l => l.t), summary: order.filter(k => summary[k]) };
}

export function onHarmonyGenerate(root: string, mod: 'maj' | 'min') {
  const palette = get(harmonyProgPalette);
  const len = get(harmonyProgLength);
  const tonic = get(harmonyProgTonic);
  const seq = harmonProgGenerate(len, mod, root, palette, tonic);
  const res = harmonProgLabelsFor(seq, mod, harmonyRootIdx(root));
  harmonyProgSeq.set(seq);
  harmonyProgLabels.set(res.labels);
  harmonyProgSummary.set(res.summary);
  harmonyProgSelected.set(-1);
  harmonyProgGenerated.set(true);
}

// ===== Plan auditivo =====

export const HARMONY_STRING_FREQS = [82.4068892281795, 110, 146.8323839587038, 195.99771799087463, 246.94165062806206, 329.6275569128699];
export const HARMONY_STRUM_MS = 28;
export const HARMONY_BLOCK_MS = 8;
export const HARMONY_PROG_GAP_MS = 80;
export const HARMONY_PROG_OVERLAP_S = 0.09;

export interface PlayItem { note: string; string: number; freq: number; t0: number; dur: number; gain: number; pan: number; bass?: boolean; }

export function harmonyNotesPlan(pitchClasses: number[]): PlayItem[] {
  const set = [...new Set(pitchClasses.map(pc => ((pc % 12) + 12) % 12))];
  const midis = set.map(pc => {
    let m = 57 + (((pc - 9) % 12) + 12) % 12;
    while (m < 48) m += 12;
    while (m > 72) m -= 12;
    return m;
  }).sort((a, b) => a - b);
  return midis.map((m, i) => ({
    note: '', string: -1,
    freq: 440 * Math.pow(2, (m - 69) / 12),
    t0: i * HARMONY_STRUM_MS + (i % 2 ? -2 : 2),
    dur: harmonyChordMs(),
    gain: 0.5,
    pan: (i - (midis.length - 1) / 2) * 0.12,
  }));
}

export function harmonyChordMs(tempo = get(harmonyProgTempo)): number {
  const bpm = tempo;
  return Math.min(240000 / bpm, 2400);
}

export function harmonyBeat(): number {
  return (harmonyChordMs() + HARMONY_PROG_GAP_MS) / 1000;
}

export function harmonyCurrentVoicing(chordName: string): string | null {
  const stored = harmonyVoicingSel.get(chordName);
  const list = getChordVoicings(chordName);
  return stored && list.some(v => v.id === stored) ? stored : (list[0] ? list[0].id : null);
}

export function harmonyVoicingPlan(chordName: string, voicingId?: string | null): PlayItem[] {
  const voicing = getChordVoicing(chordName, voicingId ?? harmonyCurrentVoicing(chordName));
  if (!voicing) return [];
  const plan: PlayItem[] = [];
  voicing.frets.forEach((fret, i) => {
    if (fret === null) return;
    plan.push({
      note: voicing.tones[i] || '',
      string: i,
      freq: HARMONY_STRING_FREQS[i] * Math.pow(2, fret / 12),
      t0: i * HARMONY_STRUM_MS + (i % 2 ? -2 : 2),
      dur: harmonyChordMs(),
      gain: 0.5 + i * 0.045,
      pan: (i - 2.5) * 0.09,
    });
  });
  return plan;
}

export function harmonyArrange(plan: PlayItem[], style: string, bass: boolean): PlayItem[] {
  const out = plan.map(p => Object.assign({}, p));
  if (!out.length) return out;
  if (style === 'block') {
    out.forEach((p, i) => { p.t0 = i * HARMONY_BLOCK_MS + (i % 2 ? -HARMONY_BLOCK_MS : HARMONY_BLOCK_MS); });
  }
  if (bass) {
    const low = out.reduce((a, b) => (b.freq < a.freq ? b : a));
    low.t0 = 0;
    low.gain = Math.min(1.5, low.gain + 0.35);
    low.pan = 0;
    low.bass = true;
    out.forEach(p => { if (p !== low) p.t0 += style === 'block' ? HARMONY_BLOCK_MS * 3 : HARMONY_STRUM_MS * 3; });
  }
  return out;
}

export function harmonyChordPlan(chordName: string, strumStyle = get(harmonyStrumStyle), bass = get(harmonyStrumBass)): PlayItem[] {
  return harmonyArrange(harmonyVoicingPlan(chordName, harmonyCurrentVoicing(chordName)), strumStyle, bass);
}

export function harmonyPlanForName(chordName: string, durCap?: number): PlayItem[] {
  const plan = harmonyChordPlan(chordName);
  if (plan.length) return plan.map(p => Object.assign({}, p, { dur: durCap ? Math.min(p.dur, durCap) : p.dur }));
  const parsed = parseChordName(chordName);
  if (!parsed) return [];
  const pcs = CHORD_TYPES[parsed.quality || ''].intervals.map(iv => (harmonyRootIdx() + iv) % 12);
  return harmonyNotesPlan(pcs).map(p => Object.assign({}, p, { dur: durCap ? Math.min(p.dur, durCap) : p.dur }));
}

export function harmonyMyProgSteps(root: string, mod: 'maj' | 'min', seven: boolean): ProgStep[] {
  const rootIdx = harmonyRootIdx(root);
  const degrees = harmonyDegrees(mod);
  return get(harmonyMyProg).map(deg => {
    const def = degrees.find(d => d.degree === deg);
    if (!def) return null;
    const q = harmonProgQual(mod, deg, { seventh: seven } as ProgPalette);
    return harmonProgStep(def.degree, mod, rootIdx, def, q);
  }).filter((s): s is ProgStep => !!s);
}

export function setHarmonyVoicing(chordName: string, voicingId: string) {
  harmonyVoicingSel.set(chordName, voicingId);
}