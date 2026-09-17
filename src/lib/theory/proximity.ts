import { NOTES } from './notes';
import { CHORD_TYPES } from './chords';

export const PROX_QUALITIES = ['', 'm', 'sus2', 'sus4', 'dim', 'aug', '7', 'maj7', 'm7'];

export const PROX_QUALITY_LABELS: Record<string, string> = {
  '': 'Mayor', m: 'Menor', '7': 'Dominante 7', maj7: 'Maj7', m7: 'm7',
  sus2: 'Sus2', sus4: 'Sus4', dim: 'Disminuido', aug: 'Aumentado',
};

export const PROX_DEGREES = ['raíz', '3ra', '5ta', '7ma'];
export const PROX_MOVES: [number, string][] = [
  [-2, '2 st abajo'], [-1, 'st abajo'], [1, 'st arriba'], [2, '2 st arriba'],
];
const PROX_MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

export interface ProxChord { name: string; root: number; quality: string; set: number[]; }

export function buildProxPool(): ProxChord[] {
  const pool: ProxChord[] = [];
  NOTES.forEach((raw, root) => {
    PROX_QUALITIES.forEach(q => {
      const set = CHORD_TYPES[q].intervals.map(iv => (root + iv) % 12).sort((a, b) => a - b);
      pool.push({ name: raw + q, root, quality: q, set });
    });
  });
  return pool;
}

export const PROX_POOL = buildProxPool();

export function proxPoolMatches(set: number[]): ProxChord[] {
  return PROX_POOL.filter(chord => chord.set.length === set.length && chord.set.every((pc, i) => pc === set[i]));
}

export function proxCanonicalName(set: number[]): string | null {
  const matches = proxPoolMatches(set);
  if (!matches.length) return null;
  return matches.slice().sort((a, b) => a.root - b.root)[0].name;
}

export function proxScaleNotes(rootName: string): number[] | null {
  const root = NOTES.indexOf(rootName as never);
  if (root < 0) return null;
  return PROX_MAJOR_SCALE.map(iv => (root + iv) % 12);
}

export function proxIsDiatonic(pcs: number[], keyName: string): boolean | null {
  const scale = proxScaleNotes(keyName);
  if (!scale) return null;
  return pcs.every(pc => scale.includes(pc));
}

export function proxCommonCounts(): number[] {
  const counts = new Array(12).fill(0);
  PROX_POOL.forEach(chord => chord.set.forEach(pc => counts[pc]++));
  return counts;
}

function* proxCombinations(items: number[], k: number): Generator<number[]> {
  if (k === 0) { yield []; return; }
  for (let i = 0; i < items.length; i++) {
    for (const rest of proxCombinations(items.slice(i + 1), k - 1)) yield [items[i], ...rest];
  }
}

export interface ProxDelta { pos: number; delta: number; label: string; }

export function proxMoveVariants(baseSet: number[], combo: number[]) {
  const variants: { set: number[]; deltas: ProxDelta[] }[] = [];
  const count = Math.pow(PROX_MOVES.length, combo.length);
  for (let code = 0; code < count; code++) {
    let c = code;
    const newSet = baseSet.slice();
    const deltas: ProxDelta[] = [];
    combo.forEach(pos => {
      const move = PROX_MOVES[c % PROX_MOVES.length];
      c = Math.floor(c / PROX_MOVES.length);
      deltas.push({ pos, delta: move[0], label: move[1] });
      newSet[pos] = (newSet[pos] + move[0] + 12) % 12;
    });
    const sorted = [...new Set(newSet)].sort((a, b) => a - b);
    variants.push({ set: sorted, deltas });
  }
  return variants;
}

export interface ProxNeighbor {
  name: string;
  set: number[];
  glue: number;
  size: number;
  moves: { degree: string; label: string }[];
  moveCost: number;
}

export function findNeighbors(rootName: string, quality: string, notesToMove: number): ProxNeighbor[] {
  const root = NOTES.indexOf(rootName as never);
  if (root < 0 || !CHORD_TYPES[quality]) return [];
  const baseSet = CHORD_TYPES[quality].intervals.map(iv => (root + iv) % 12);
  const results: ProxNeighbor[] = [];
  const seen = new Set<string>();
  for (const combo of proxCombinations(baseSet.map((_, i) => i), notesToMove)) {
    proxMoveVariants(baseSet, combo).forEach(variant => {
      const key = variant.set.join(',');
      if (seen.has(key)) return;
      seen.add(key);
      const name = proxCanonicalName(variant.set);
      if (!name) return;
      const glue = baseSet.filter(pc => variant.set.includes(pc)).length;
      const moves = variant.deltas.map(d => ({ degree: PROX_DEGREES[d.pos] || 'nota', label: d.label }));
      const moveCost = variant.deltas.reduce((sum, d) => sum + Math.abs(d.delta), 0);
      results.push({ name, set: variant.set, glue, size: baseSet.length, moves, moveCost });
    });
  }
  results.sort((a, b) => (b.glue - a.glue) || (a.moveCost - b.moveCost));
  return results;
}

export interface ProxCommon { name: string; set: number[]; matched: number[]; m: number; }

export function findCommonChords(selectedPcs: number[], mode: 'any' | 'two' | 'exact'): ProxCommon[] {
  if (!selectedPcs.length) return [];
  const want = { any: (m: number) => m >= 1, two: (m: number) => m === 2, exact: (m: number) => m === selectedPcs.length }[mode];
  const results: ProxCommon[] = [];
  PROX_POOL.forEach(chord => {
    const matched = chord.set.filter(pc => selectedPcs.includes(pc));
    if (want(matched.length)) results.push({ name: chord.name, set: chord.set, matched, m: matched.length });
  });
  results.sort((a, b) => b.m - a.m);
  return results;
}

// ===== Puente / Glue Tension =====

export const GLUE_EXT: [number, string][] = [[1, 'b9'], [2, '9'], [3, '#9'], [5, '11'], [6, '#11'], [8, 'b13'], [9, '13']];

export function glueExtOf(rel: number): string | null {
  const f = GLUE_EXT.find(([e]) => e === rel);
  return f ? f[1] : null;
}

export interface GlueRow { pc: number; note: string; rel: number; ext: string; allowed: boolean; b9: number; tri: number; }

export function glueScan(originRootIdx: number, originQuality: string, foreignPcs: number[]): { rows: GlueRow[]; originPcs: number[] } {
  const originPcs = CHORD_TYPES[originQuality].intervals.map(iv => (originRootIdx + iv) % 12);
  const intervals = CHORD_TYPES[originQuality].intervals;
  const thirdRel = intervals.length > 1 && intervals[1] > 0 && intervals[1] <= 4 ? intervals[1] : null;
  const rows: GlueRow[] = [];
  foreignPcs.forEach(pc => {
    const rel = (pc - originRootIdx + 12) % 12;
    const ext = glueExtOf(rel);
    if (!ext) return;
    let b9 = 0, tri = 0;
    originPcs.forEach(b => {
      const d = Math.abs(pc - b);
      const dist = Math.min(d, 12 - d);
      if (dist === 1) b9++;
      if (dist === 6) tri++;
    });
    const clashes3rd = thirdRel !== null && Math.abs(rel - thirdRel) === 1;
    rows.push({ pc, note: NOTES[pc], rel, ext, allowed: !clashes3rd, b9, tri });
  });
  rows.sort((a, b) => a.rel - b.rel);
  return { rows, originPcs };
}

export function glueSymbol(originRootIdx: number, originQuality: string, rows: GlueRow[]): string {
  const allowed = rows.filter(r => r.allowed).sort((a, b) => a.rel - b.rel).map(r => r.ext);
  const base = NOTES[originRootIdx] + originQuality;
  return allowed.length ? base + '(add' + allowed.join(',') + ')' : base;
}

export interface ProxBridge {
  kind: 'direct' | 'via';
  label: string;
  headline: string;
  rows: GlueRow[];
  shared: number[];
  targetPcs: number[];
  via: boolean;
}

export function proxBridgeScan(originRootIdx: number, originQuality: string, targetRootIdx: number, targetQuality: string): ProxBridge[] {
  const bridges: ProxBridge[] = [];
  const targetPcs = CHORD_TYPES[targetQuality].intervals.map(iv => (targetRootIdx + iv) % 12);
  const scan = glueScan(originRootIdx, originQuality, targetPcs);
  const originPcs = scan.originPcs;
  const shared = targetPcs.filter(pc => originPcs.includes(pc));
  const domRootIdx = (targetRootIdx + 7) % 12;
  const domPcs = CHORD_TYPES['7'].intervals.map(iv => (domRootIdx + iv) % 12);
  const viaDom = glueScan(originRootIdx, originQuality, domPcs);
  const originName = NOTES[originRootIdx] + originQuality;
  const targetName = NOTES[targetRootIdx] + targetQuality;
  bridges.push({
    kind: 'direct', via: false,
    label: `${originName} → ${targetName}`,
    headline: `${originName} → ${glueSymbol(originRootIdx, originQuality, scan.rows)} → ${targetName}`,
    rows: scan.rows, shared, targetPcs,
  });
  bridges.push({
    kind: 'via', via: true,
    label: `vía V (${NOTES[domRootIdx]}7) de ${targetName}`,
    headline: `${originName} → ${glueSymbol(originRootIdx, originQuality, viaDom.rows)} → ${targetName}`,
    rows: viaDom.rows, shared: domPcs.filter(pc => originPcs.includes(pc)), targetPcs: domPcs,
  });
  return bridges;
}