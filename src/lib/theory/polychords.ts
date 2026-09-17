import { NOTES, pcOf } from './notes';
import { countDissonancePairs } from './dissonance';

export const POLY_TEMPLATES = [
  { key: 'maj7', intervals: [0, 4, 7, 11] },
  { key: 'm7',   intervals: [0, 3, 7, 10] },
  { key: '7',    intervals: [0, 4, 7, 10] },
  { key: 'm',    intervals: [0, 3, 7] },
  { key: '',     intervals: [0, 4, 7] },
  { key: 'sus2', intervals: [0, 2, 7] },
  { key: 'sus4', intervals: [0, 5, 7] },
  { key: 'dim',  intervals: [0, 3, 6] },
  { key: 'aug',  intervals: [0, 4, 8] },
];

export const POLY_BASE_QUALITIES = ['', 'm', '7', 'maj7', 'm7'];
export const POLY_TRIAD_QUALITIES = ['m', '', 'dim', 'aug'];
export const POLY_TRIAD_LABELS: Record<string, string> = { '': 'Mayor', m: 'Menor', dim: 'Dim', aug: 'Aum' };
export const POLY_BASE_LABELS: Record<string, string> = { '': 'Mayor', m: 'Menor', '7': '7', maj7: 'maj7', m7: 'm7' };

export function polyIntervals(root: number, intervals: number[]): number[] {
  return intervals.map(iv => (root + iv) % 12);
}

const EXT_TABLE: [number, string][] = [[1, 'b9'], [2, '9'], [3, '#9'], [5, '11'], [6, '#11'], [8, 'b13'], [9, '13']];

export function polyFindName(rootPc: number, unionPcs: number[]): string {
  const rel = unionPcs.map(pc => (pc - rootPc + 12) % 12);
  let best = { match: 0, extras: Infinity, priority: Infinity, key: '' };
  let bestExtraInts: number[] = [];
  for (let pi = 0; pi < POLY_TEMPLATES.length; pi++) {
    const t = POLY_TEMPLATES[pi];
    if (t.intervals.length > 3 && !rel.includes(t.intervals[3])) continue;
    const tInts = new Set(t.intervals);
    const inUnion = t.intervals.filter(iv => rel.includes(iv));
    const extras = rel.filter(iv => !tInts.has(iv));
    if (inUnion.length > best.match ||
        (inUnion.length === best.match && extras.length < best.extras) ||
        (inUnion.length === best.match && extras.length === best.extras && pi < best.priority)) {
      best = { match: inUnion.length, extras: extras.length, priority: pi, key: t.key };
      bestExtraInts = extras;
    }
  }
  const names = bestExtraInts.slice().sort((a, b) => a - b)
    .map(iv => { const f = EXT_TABLE.find(([e]) => e === iv); return f ? f[1] : null; })
    .filter((n): n is string => !!n);
  const sym = NOTES[rootPc] + best.key;
  return names.length ? sym + '(add' + names.join(',') + ')' : sym;
}

export function polyCountDissonance(pcs: number[]): { b9: number; tri: number } {
  return countDissonancePairs(pcs);
}

export interface PolyRow {
  combo: string; bass: string; baseQ: string; baseRoot: number;
  triRoot: string; triQ: string; triRootPc: number;
  name: string; notes: string[]; union: number[]; b9: number; tri: number;
  isHybrid: boolean; polyName: string;
}

export function polyBuildAll(): PolyRow[] {
  const out: PolyRow[] = [];
  for (const baseQ of POLY_BASE_QUALITIES) {
    for (let br = 0; br < 12; br++) {
      for (const triQ of POLY_TRIAD_QUALITIES) {
        for (let ur = 0; ur < 12; ur++) {
          const bIv = POLY_TEMPLATES.find(t => t.key === (baseQ || ''))!.intervals;
          const tIv = POLY_TEMPLATES.find(t => t.key === (triQ || ''))!.intervals;
          const bPcs = polyIntervals(br, bIv);
          const tPcs = polyIntervals(ur, tIv);
          const union = [...new Set([...bPcs, ...tPcs])].sort((a, b) => a - b);
          const notes = union.map(pc => NOTES[pc]);
          const name = polyFindName(br, union);
          const { b9, tri } = polyCountDissonance(union);
          const bass = NOTES[br];
          const triRoot = NOTES[ur];
          const isHybrid = br !== ur;
          const polyName = isHybrid ? NOTES[ur] + (triQ || '') + '/' + bass : name;
          out.push({
            combo: bass + (baseQ || '') + ' + ' + triRoot + (triQ || ''),
            bass, baseQ, baseRoot: br, triRoot, triQ, triRootPc: ur,
            name, notes, union, b9, tri, isHybrid, polyName,
          });
        }
      }
    }
  }
  return out;
}

export interface PolyStarNode { degree: string; root: number; q: string; pcs: number[]; pos: [number, number]; name: string; notes: string; }
export interface PolyStarEdge { a: number; b: number; aName: string; bName: string; notes: string; b9: number; tri: number; }

export function polyBuildStar(): { nodes: PolyStarNode[]; edges: PolyStarEdge[] } {
  const STAR_NODES = [
    { degree: 'I',    root: 0,  q: '',    pcs: [0, 4, 7],  pos: [50, 11] as [number, number] },
    { degree: 'ii',   root: 2,  q: 'm',   pcs: [2, 5, 9],  pos: [81, 25] as [number, number] },
    { degree: 'iii',  root: 4,  q: 'm',   pcs: [4, 7, 11], pos: [87, 58] as [number, number] },
    { degree: 'IV',   root: 5,  q: '',    pcs: [5, 9, 0],  pos: [66, 85] as [number, number] },
    { degree: 'V',    root: 7,  q: '',    pcs: [7, 11, 2], pos: [34, 85] as [number, number] },
    { degree: 'vi',   root: 9,  q: 'm',   pcs: [9, 0, 4],  pos: [13, 58] as [number, number] },
    { degree: 'vii°', root: 11, q: 'dim', pcs: [11, 2, 5], pos: [19, 25] as [number, number] },
  ];
  const nodes: PolyStarNode[] = STAR_NODES.map(n => ({
    ...n,
    name: NOTES[n.root] + (n.q === 'm' ? 'm' : n.q === 'dim' ? '°' : ''),
    notes: n.pcs.map(pc => NOTES[pc]).join(' - '),
  }));
  const edges: PolyStarEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const unionPcs = [...new Set([...a.pcs, ...b.pcs])].sort((x, y) => x - y);
      const aName = polyFindName(a.root, unionPcs);
      const bName = polyFindName(b.root, unionPcs);
      const { b9, tri } = polyCountDissonance(unionPcs);
      edges.push({ a: i, b: j, aName, bName, notes: unionPcs.map(pc => NOTES[pc]).join(' · '), b9, tri });
    }
  }
  return { nodes, edges };
}