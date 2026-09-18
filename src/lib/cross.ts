import { writable } from 'svelte/store';

export interface CrossFields {
  harmonyRoot: string | null;
  harmonyVariant: string | null;
  tensionRoot: string | null;
  tensionQuality: string | null;
  voicingRoot: string | null;
  voicingQuality: string | null;
  scaleRoot: string | null;
  tritoneRoot: string | null;
  cartoRoot: string | null;
}

const empty: CrossFields = {
  harmonyRoot: null,
  harmonyVariant: null,
  tensionRoot: null,
  tensionQuality: null,
  voicingRoot: null,
  voicingQuality: null,
  scaleRoot: null,
  tritoneRoot: null,
  cartoRoot: null,
};

export const cross = writable<CrossFields>({ ...empty });

export function sendCross(fields: Partial<CrossFields>): void {
  cross.update(c => ({ ...c, ...fields }));
}

// Views stay mounted, so avoid init-time reads; react to a pending field
// whenever it arrives (and consume it once).
export function onCross<K extends keyof CrossFields>(
  key: K,
  fn: (value: NonNullable<CrossFields[K]>) => void,
): () => void {
  return cross.subscribe(c => {
    const value = c[key];
    if (value === null || value === undefined) return;
    fn(value as NonNullable<CrossFields[K]>);
    cross.update(x => (x[key] === value ? { ...x, [key]: null } : x));
  });
}

// React to any of several fields arriving together (they are consumed as a group).
export function onCrossAny(
  keys: (keyof CrossFields)[],
  fn: (values: Partial<CrossFields>) => void,
): () => void {
  return cross.subscribe(c => {
    const present = keys.filter(k => c[k] !== null && c[k] !== undefined);
    if (present.length === 0) return;
    const values: Partial<CrossFields> = {};
    for (const k of present) values[k] = c[k];
    fn(values);
    cross.update(x => {
      const next = { ...x };
      for (const k of present) if (next[k] === c[k]) next[k] = null;
      return next;
    });
  });
}