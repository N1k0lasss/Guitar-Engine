// ===== Chord Voicings Library =====
// Catálogo de digitaciones alternativas por acorde, puro y sin DOM:
// forma abierta, barres móviles E/A, forma D de CAGED y, para tétradas,
// los drops del cap. "Inversiones y Drops" (Armonía Ilustrada 2).
// Reutiliza las globals de Chords/chord-mode.js (NOTE_NAMES, parseChordName,
// OPEN_SHAPES, MOBILE_SHAPES, CHORD_TYPES).

const CV_STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
const CV_STRING_PCS = [4, 9, 2, 7, 11, 4];

const CV_DROPS = [
  { id: 'drop2', label: 'Drop 2' },
  { id: 'drop3', label: 'Drop 3' },
  { id: 'drop4', label: 'Drop 4' },
  { id: 'drop24', label: 'Drop 2+4' },
];

const CV_TETRADS = ['7', 'maj7', 'm7'];

// grupos de 4 cuerdas adyacentes (índice low→high) para los drops
const CV_GROUPS = [
  { strings: [5, 4, 3, 2] },
  { strings: [4, 3, 2, 1] },
  { strings: [3, 2, 1, 0] },
];

function cvFretOn(stringIndex, targetPc) {
  let fret = ((targetPc - CV_STRING_PCS[stringIndex]) % 12 + 12) % 12;
  if (fret < 1) fret += 12;
  if (fret > 12) fret -= 12;
  return fret;
}

function cvApplyDrop(intervals, dropId) {
  const arr = [...intervals];
  if (dropId === 'drop2') arr[2] -= 12;
  if (dropId === 'drop3') arr[1] -= 12;
  if (dropId === 'drop4') arr[0] -= 12;
  if (dropId === 'drop24') { arr[2] -= 12; arr[0] -= 12; }
  return arr.sort((a, b) => a - b);
}

function cvBestDropPosition(pitches) {
  let best = null;
  for (const group of CV_GROUPS) {
    const frets = pitches.map((p, i) => cvFretOn(group.strings[i], ((p % 12) + 12) % 12));
    const span = Math.max(...frets) - Math.min(...frets);
    if (!best || span < best.span) best = { strings: group.strings, frets, span };
  }
  return best;
}

function cvToneNames(frets) {
  return (frets || []).map((fret, i) =>
    fret === null ? '' : NOTE_NAMES[(CV_STRING_PCS[i] + fret) % 12]);
}

function cvScaleShape(shape, rootPc, formRootPc) {
  const offset = (rootPc - formRootPc + 12) % 12;
  return shape.map(fret => (fret === null ? null : fret + offset));
}

function cvDForm(rootPc, quality) {
  const f = (rootPc - CV_STRING_PCS[2] + 12) % 12; // raíz en la 4ª cuerda (D)
  const isMinor = quality === 'm';
  return [null, null, f, f + 2, f + 3, isMinor ? f + 1 : f + 2];
}

function cvMakeVoicing(id, kind, label, frets) {
  return { id, kind, label, frets: frets.slice(), tones: cvToneNames(frets) };
}

// Catálogo completo de digitaciones para un nombre de acorde.
function getChordVoicings(chordName) {
  const parsed = parseChordName ? parseChordName(chordName) : null;
  if (!parsed) return [];
  const { root, quality } = parsed;
  const rootPc = NOTE_NAMES.indexOf(root);
  if (rootPc < 0) return [];
  const out = [];

  const open = OPEN_SHAPES[root + quality];
  if (open) out.push(cvMakeVoicing('open', 'open', 'Abierta', open.frets));

  const shapes = MOBILE_SHAPES[quality] || MOBILE_SHAPES[''];
  if (shapes.E) {
    out.push(cvMakeVoicing('e', 'barre-e', 'Barre E · raíz 6ª', cvScaleShape(shapes.E, rootPc, NOTE_NAMES.indexOf('E'))));
  }
  if (shapes.A) {
    out.push(cvMakeVoicing('a', 'barre-a', 'Barre A · raíz 5ª', cvScaleShape(shapes.A, rootPc, NOTE_NAMES.indexOf('A'))));
  }
  if (quality === '' || quality === 'm') {
    const frets6 = cvDForm(rootPc, quality);
    if (Math.max(...frets6.filter(f => f !== null)) <= 15) {
      out.push(cvMakeVoicing('d', 'caged-d', 'Forma D · raíz 4ª', frets6));
    }
  }
  if (CV_TETRADS.includes(quality)) {
    const intervals = CHORD_TYPES[quality].intervals.slice();
    for (const drop of CV_DROPS) {
      const dropped = cvApplyDrop(intervals, drop.id);
      const pos = cvBestDropPosition(dropped);
      if (pos) {
        const frets6 = [null, null, null, null, null, null];
        pos.strings.forEach((stringIndex, i) => { frets6[stringIndex] = pos.frets[i]; });
        out.push(cvMakeVoicing(drop.id, 'drop', drop.label, frets6));
      }
    }
  }
  return out;
}

function getChordVoicing(chordName, voicingId) {
  const list = getChordVoicings(chordName);
  return (voicingId && list.find(v => v.id === voicingId)) || list[0] || null;
}

// Ventana de trastes que cubre una digitación (para el mástil).
function cvFretWindow(frets) {
  const nonNull = (frets || []).filter(f => f !== null && f !== undefined);
  if (!nonNull.length) return { minFret: 1, maxFret: 1, base: 1, top: 1 };
  const hasOpen = nonNull.some(f => f === 0);
  const base = hasOpen ? 0 : Math.min(...nonNull);
  const top = Math.min(15, Math.max(...nonNull, base + 3));
  return { minFret: base, maxFret: top, base, top };
}