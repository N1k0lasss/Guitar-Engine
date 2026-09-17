import { NOTES } from './notes';

export const TENSION_DATA = [
  { label: 'b9', interval: 1, kind: 'fricción', description: 'Fricción intensa. Úsala cuando quieras empujar con fuerza hacia otro acorde.' },
  { label: '9', interval: 2, kind: 'color', description: 'Color abierto y claro. Amplía el acorde sin cambiar su función principal.' },
  { label: '#9', interval: 3, kind: 'fricción', description: 'Una tensión áspera y expresiva, ideal para un dominante con carácter.' },
  { label: '11', interval: 5, kind: 'color', description: 'Aire suspendido. Deja espacio y evita cerrar demasiado pronto.' },
  { label: '#11', interval: 6, kind: 'fricción', description: 'Brillo extraño y flotante. Marca una distancia clara del acorde mayor común.' },
  { label: '13', interval: 9, kind: 'estable', description: 'Color cálido y cantable. Suma amplitud manteniendo la sensación de reposo.' },
];

export type TensionEntry = typeof TENSION_DATA[number];
export type TensionQuality = 'maj7' | 'm7' | '7';

export function tensionKind(quality: TensionQuality, tension: string): string {
  const classification: Record<TensionQuality, Record<string, string>> = {
    maj7: { b9: 'fricción', '9': 'color', '#9': 'fricción', '11': 'fricción', '#11': 'color', '13': 'estable' },
    m7: { b9: 'fricción', '9': 'color', '#9': 'fricción', '11': 'estable', '#11': 'fricción', '13': 'color' },
    '7': { b9: 'fricción', '9': 'color', '#9': 'fricción', '11': 'fricción', '#11': 'color', '13': 'estable' },
  };
  return classification[quality][tension];
}

export interface Ruling { id: string; label: string; tip: string; }

export const TENSION_RULINGS: Record<TensionQuality, Record<string, Ruling>> = {
  maj7: {
    b9: { id: 'care', label: 'Cuidado', tip: 'La b9 pega contra la raíz y arma tritono con la 5ta: solo como color pasajero.' },
    '9': { id: 'safe', label: 'Aceptada', tip: 'La 9 amplía sin fricción: el sonido "maj9" clásico.' },
    '#9': { id: 'care', label: 'Cuidado', tip: 'Pesa como 3ra ♯ contra la 3ra mayor: mejor probarla en otro acorde.' },
    '11': { id: 'avoid', label: 'Evitada', tip: 'La 11 es b9 de la 3ra y tritono de la 7ma. El libro la cruza (resuena a b11 ≈ 3ra).' },
    '#11': { id: 'accept', label: 'Aceptada (Lidia)', tip: 'Tritono con la raíz (y semitono con la 5ta): es el color Lidio, de uso constante.' },
    '13': { id: 'safe', label: 'Aceptada', tip: 'La 13 cae lejos de las otras notas: suma amplitud sin fricción.' },
  },
  m7: {
    b9: { id: 'avoid', label: 'Evitada', tip: 'La b9 choca con la raíz y arma tritono con la 5ta: el ejemplo del libro es Em(addb9), "una catástrofe".' },
    '9': { id: 'accept', label: 'Aceptada (m9)', tip: 'El semitono con la 3ra♭ es el sonido m9 de costumbre: el libro la usa.' },
    '#9': { id: 'care', label: 'Cuidado', tip: 'En m7 duplica la 3ra♭ (enarmónica): suena como color apretado.' },
    '11': { id: 'safe', label: 'Aceptada', tip: 'La 11 cae lejos de todo: el aire suspendido del m11.' },
    '#11': { id: 'care', label: 'Cuidado', tip: 'La #11 es semitono con la 3ra♭: tensión filosa dentro del m7.' },
    '13': { id: 'avoid', label: 'Evitada', tip: 'La 13 es tritono con la 3ra y semitono con la 7ma (y una subdominante no empuja como dominante).' },
  },
  '7': {
    b9: { id: 'accept', label: 'Aceptada (V7♭9)', tip: 'b9 y tritono contra la 5ta son el alma del dominante alterado: el turnaround clásico.' },
    '9': { id: 'safe', label: 'Aceptada', tip: 'La 9 extiende el dominante sin fricción: sonido estándar.' },
    '#9': { id: 'care', label: 'Cuidado', tip: 'La #9 contra la 3ra es el color del rock/blues (Hendrix): usala así, con intención.' },
    '11': { id: 'avoid', label: 'Evitada', tip: 'La 11 natural es b9 de la 3ra y tritono de la b7: en el dominante se evita, mejor la #11.' },
    '#11': { id: 'accept', label: 'Aceptada (Lidia dominante)', tip: 'Tritono con la 3ra a un lado y la b7: el color lemmy de la "Lydian dominant".' },
    '13': { id: 'accept', label: 'Aceptada', tip: 'El semitono con la b7 es el sonido "C13" de siempre: la 13 es nota de dominante.' },
  },
};

export function tensionNote(root: string, interval: number): string {
  return NOTES[(NOTES.indexOf(root as never) + interval) % 12];
}

export function tenBasePcs(root: string, quality: TensionQuality): number[] {
  const r = NOTES.indexOf(root as never);
  const qualityIntervals = quality === 'm7' ? [0, 3, 7, 10] : quality === '7' ? [0, 4, 7, 10] : [0, 4, 7, 11];
  return qualityIntervals.map(iv => (r + iv) % 12);
}

export function tenTensionCounts(root: string, basePcs: number[], interval: number): { b9: number; tri: number; pc: number } {
  const pc = (NOTES.indexOf(root as never) + interval) % 12;
  let b9 = 0, tri = 0;
  basePcs.forEach(b => {
    const d = Math.abs(pc - b);
    const dist = Math.min(d, 12 - d);
    if (dist === 1) b9++;
    if (dist === 6) tri++;
  });
  return { b9, tri, pc };
}

export function tenRuling(quality: TensionQuality, tension: string): Ruling {
  return TENSION_RULINGS[quality][tension] || { id: 'care', label: 'Cuidado', tip: '' };
}

export function tenFullNotes(root: string, quality: TensionQuality, interval: number): string[] {
  const base = tenBasePcs(root, quality);
  const pc = (NOTES.indexOf(root as never) + interval) % 12;
  const full = [...new Set([...base, pc])].sort((a, b) => a - b);
  return full.map(p => NOTES[p]);
}