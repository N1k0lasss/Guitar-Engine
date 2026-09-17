import { NOTES } from './notes';

export interface CartoMode {
  name: string;
  key: string;
  intervals: number[];
  triad: string;
  tetrad: string;
  tension: string;
  char: string;
  charPc?: number;
  color: string;
}

export const CARTO_MODES: CartoMode[] = [
  { name: 'Jónico',        key: 'ionian',   intervals: [0, 2, 4, 5, 7, 9, 11], triad: '',  tetrad: 'maj7', tension: 'maj7',           char: 'sin alteración', color: '#c08a43' },
  { name: 'Lidio',         key: 'lydian',   intervals: [0, 2, 4, 6, 7, 9, 11], triad: '',  tetrad: 'maj7', tension: 'maj7(add#11)',   char: '#4',      charPc: 6,  color: '#6e91a3' },
  { name: 'Mixolidio',     key: 'mixo',     intervals: [0, 2, 4, 5, 7, 9, 10], triad: '',  tetrad: '7',    tension: '7',              char: 'b7',      charPc: 10, color: '#9b7352' },
  { name: 'Lidio b7',      key: 'lydianb7', intervals: [0, 2, 4, 6, 7, 9, 10], triad: '',  tetrad: '7',    tension: '7(add#11)',      char: '#4 y b7', charPc: 10, color: '#7c91a3' },
  { name: 'Dórico #4',     key: 'dorian4',  intervals: [0, 2, 3, 6, 7, 9, 10], triad: 'm', tetrad: 'm7',   tension: 'm6(add#11)',     char: '#4',      charPc: 6,  color: '#6e9166' },
  { name: 'Dórico',        key: 'dorian',   intervals: [0, 2, 3, 5, 7, 9, 10], triad: 'm', tetrad: 'm7',   tension: 'm6',             char: '6 mayor', charPc: 9,  color: '#6e9166' },
  { name: 'Eólico',        key: 'aeolian',  intervals: [0, 2, 3, 5, 7, 8, 10], triad: 'm', tetrad: 'm7',   tension: 'm7',             char: 'b6',      charPc: 8,  color: '#806b83' },
  { name: 'Armónico',      key: 'harmonic', intervals: [0, 2, 3, 5, 7, 8, 11], triad: 'm', tetrad: 'mM7',  tension: 'mM7',            char: '#7',      charPc: 11, color: '#a2546a' },
  { name: 'Melódico',      key: 'melodic',  intervals: [0, 2, 3, 5, 7, 9, 11], triad: 'm', tetrad: 'mM7',  tension: 'mM7',            char: '6 y #7',  charPc: 11, color: '#8a6d9e' },
  { name: 'Mixolidio b13', key: 'mixo13',   intervals: [0, 2, 4, 5, 7, 8, 10], triad: '',  tetrad: '7',    tension: '7(b13)',         char: 'b13',     charPc: 8,  color: '#9b7352' },
  { name: 'Frigio',        key: 'phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], triad: 'm', tetrad: 'm7',   tension: 'm7(addb9)',      char: 'b2',      charPc: 1,  color: '#a45a46' },
  { name: 'Dórico b2',     key: 'dorianb2', intervals: [0, 1, 3, 5, 7, 9, 10], triad: 'm', tetrad: 'm7',   tension: 'm6(addb9)',      char: 'b2',      charPc: 1,  color: '#a45a46' },
  { name: 'Lidio #2',      key: 'lydian2',  intervals: [0, 3, 4, 6, 7, 9, 11], triad: '',  tetrad: 'maj7', tension: 'maj7(add9,#11)', char: '#2',      charPc: 3,  color: '#6e91a3' },
];

export const CARTO_FLAVORS: Record<number, string> = {
  1: 'afilado, flamenco', 3: 'antiguo', 6: 'magia', 9: 'dulce', 10: 'épico', 11: 'dominante',
};

export type CartoEdge = [number, number];

export function cartoEdges(modes: CartoMode[] = CARTO_MODES): CartoEdge[] {
  const edges: CartoEdge[] = [];
  for (let i = 0; i < modes.length; i++) {
    for (let j = i + 1; j < modes.length; j++) {
      const a = modes[i].intervals, b = modes[j].intervals;
      const rem = a.filter(pc => !b.includes(pc));
      const add = b.filter(pc => !a.includes(pc));
      if (rem.length === 1 && add.length === 1) edges.push([i, j]);
    }
  }
  return edges;
}

export function cartoBFS(edges: CartoEdge[], rootMode: number, count: number = CARTO_MODES.length): { dist: number[]; furthest: number } {
  const dist = new Array(count).fill(-1);
  dist[rootMode] = 0;
  const queue = [rootMode];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const [i, j] of edges) {
      const next = i === cur ? j : j === cur ? i : -1;
      if (next >= 0 && dist[next] < 0) { dist[next] = dist[cur] + 1; queue.push(next); }
    }
  }
  let far = 0;
  dist.forEach((d, idx) => { if (d > dist[far] || (d === dist[far] && idx > far)) far = idx; });
  return { dist, furthest: far };
}

export function cartoEdgeDiff(i: number, j: number, modes: CartoMode[] = CARTO_MODES): { removedPc: number; addedPc: number } | null {
  const a = modes[i].intervals, b = modes[j].intervals;
  const rem = a.filter(pc => !b.includes(pc))[0];
  const add = b.filter(pc => !a.includes(pc))[0];
  return rem === undefined || add === undefined ? null : { removedPc: rem, addedPc: add };
}

export interface Pt { x: number; y: number; }

export function cartoLayout(edges: CartoEdge[], count: number = CARTO_MODES.length): Pt[] {
  const pts: Pt[] = Array.from({ length: count }, (_, i) => {
    const ang = i * (Math.PI * 2 / count) - Math.PI / 2;
    return { x: 50 + 46 * Math.cos(ang), y: 50 + 46 * Math.sin(ang) };
  });
  for (let iter = 0; iter < 200; iter++) {
    const f = pts.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.5;
        const rep = 1400 / (d * d);
        const ux = dx / d, uy = dy / d;
        f[i].x -= ux * rep; f[i].y -= uy * rep;
        f[j].x += ux * rep; f[j].y += uy * rep;
      }
    }
    for (const [a, b] of edges) {
      const dx = pts[b].x - pts[a].x, dy = pts[b].y - pts[a].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.5;
      const spring = (d - 17) * 0.06;
      const ux = dx / d, uy = dy / d;
      f[a].x += ux * spring; f[a].y += uy * spring;
      f[b].x -= ux * spring; f[b].y -= uy * spring;
    }
    pts.forEach((p, i) => {
      const gx = 50 - p.x, gy = 50 - p.y;
      const gl = Math.sqrt(gx * gx + gy * gy) || 1;
      f[i].x += (gx / gl) * 0.12;
      f[i].y += (gy / gl) * 0.12;
    });
    pts.forEach((p, i) => { p.x += f[i].x * 0.15; p.y += f[i].y * 0.15; });
  }
  pts.forEach(p => { p.x = Math.max(11, Math.min(89, p.x)); p.y = Math.max(11, Math.min(89, p.y)); });
  return pts;
}

export function cartoNote(tonic: number, pc: number): string {
  return NOTES[(tonic + pc) % 12];
}

export function cartoChord(tonic: number, m: CartoMode, tetrad: boolean): string {
  return NOTES[tonic] + (tetrad ? m.tetrad : m.triad);
}

export function cartoFlavor(tonic: number, pc: number): string | undefined {
  return CARTO_FLAVORS[(tonic + pc) % 12];
}