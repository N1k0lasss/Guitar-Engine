// ===== Voicings: Inversiones y Drops =====
// Armonía Ilustrada 2 · cap. "Inversiones y Drops" (pp 26-60).
// Tétradas en posición cerrada → Drop 2, Drop 3, Drop 4, Drop 2+4
// con sus 4 inversiones (root, 1a, 2a, 3a).
// Acordes simétricos: dim7 = 3 diagramas, aug = 2 diagramas.

const VOICING_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const VOICING_QUALITIES = {
  maj7:  { label: 'Maj7',       intervals: [0, 4, 7, 11], degrees: ['R', '3', '5', '7'],  color: '#ff526d' },
  m7:    { label: 'm7',         intervals: [0, 3, 7, 10], degrees: ['R', 'b3', '5', 'b7'], color: '#55baff' },
  '7':   { label: 'Dom 7',      intervals: [0, 4, 7, 10], degrees: ['R', '3', '5', 'b7'], color: '#c794ff' },
  m7b5:  { label: 'm7b5 (ø)',   intervals: [0, 3, 6, 10], degrees: ['R', 'b3', 'b5', 'b7'], color: '#f2c86b' },
  dim7:  { label: 'dim7 (°7)',  intervals: [0, 3, 6, 9],  degrees: ['R', 'b3', 'b5', 'bb7'], color: '#ff9b6e', symmetric: 3 },
  aug:   { label: 'aug (maj7)', intervals: [0, 4, 8, 11], degrees: ['R', '3', '#5', '7'],  color: '#86d58b', symmetric: 4 },
};

// STRING_TUNING in semitones from C: E2=4, A2=9, D3=2, G3=7, B3=11, e4=4
const VOI_TUNING = [4, 9, 2, 7, 11, 4];
// Standard 4-note drop voicings use strings 1-4 (e,B,G,D) or 2-5 (B,G,D,A), etc.
// We use a simplified fret-based approach: compute the exact fret for each voice.

const DROP_TYPES = [
  { id: 'close',  label: 'Posición cerrada', desc: 'Las 4 voces en cuerdas adyacentes: la "escalera". Base de todas las inversiones.' },
  { id: 'drop2',  label: 'Drop 2',           desc: 'La segunda voz desde arriba baja una octava. El más usado en jazz guitar.' },
  { id: 'drop3',  label: 'Drop 3',           desc: 'La tercera voz desde arriba baja una octava. Sonido más abierto.' },
  { id: 'drop4',  label: 'Drop 4',           desc: 'La cuarta voz (bajo) baja una octava. Extiende el rango.' },
  { id: 'drop24', label: 'Drop 2+4',         desc: 'Segunda y cuarta voces bajan una octava. Amplio y luminoso.' },
];

const INVERSION_LABELS = ['Posición fundamental', '1ª inversión', '2ª inversión', '3ª inversión'];

let voicingRoot = 'C';
let voicingQuality = 'maj7';
let voicingDrop = 'close';
let voicingInversion = 0;
let voicingSelectedDrop = 'drop2';

// ─── Helpers ────────────────────────────────────────────────────────────────

function voiNote(root, interval) {
  return VOICING_NOTES[(VOICING_NOTES.indexOf(root) + interval) % 12];
}

function voiChordNotes(root, quality) {
  return VOICING_QUALITIES[quality].intervals.map(iv => voiNote(root, iv));
}

// Apply an inversion: rotate the intervals array by `inv` steps
function voiInvert(intervals, inv) {
  const rotated = [...intervals];
  for (let i = 0; i < inv; i++) {
    const first = rotated.shift();
    rotated.push(first + 12);
  }
  return rotated;
}

// Apply drop voicing transformation to a 4-note interval set
function voiApplyDrop(intervals, dropId) {
  const arr = [...intervals];
  // arr[0] = lowest, arr[3] = highest (close position ascending)
  if (dropId === 'close') return arr;
  if (dropId === 'drop2') { arr[2] -= 12; return arr.sort((a, b) => a - b); }
  if (dropId === 'drop3') { arr[1] -= 12; return arr.sort((a, b) => a - b); }
  if (dropId === 'drop4') { arr[0] -= 12; return arr.sort((a, b) => a - b); }
  if (dropId === 'drop24') { arr[2] -= 12; arr[0] -= 12; return arr.sort((a, b) => a - b); }
  return arr;
}

// ─── Fretboard calculation ──────────────────────────────────────────────────
// Find the best fret position for a set of semitone pitches on 4 adjacent strings
// Returns { frets: [f1,f2,f3,f4], strings: [s1,s2,s3,s4], span: n }

function voiBestFretPosition(pitches) {
  // Try all 4-string groups (0-3, 1-4, 2-5)
  const groups = [[5, 4, 3, 2], [4, 3, 2, 1], [3, 2, 1, 0]]; // high-e to low-E string indices
  let best = null;

  for (const strGroup of groups) {
    // For each pitch, find fret on corresponding string
    const frets = pitches.map((pitch, i) => {
      const openNote = VOI_TUNING[strGroup[i]]; // string open note in semitones
      let fret = ((pitch % 12) - openNote + 12) % 12;
      // choose octave-appropriate fret (1-12 range)
      while (fret < 1) fret += 12;
      if (fret > 12) fret -= 12;
      return fret;
    });

    const span = Math.max(...frets) - Math.min(...frets);
    if (!best || span < best.span) {
      best = { frets, strings: strGroup, span };
    }
  }
  return best;
}

// ─── Render functions ────────────────────────────────────────────────────────

function renderVoicingFretboard(containerId, pitches, stringGroup, frets, highlight = []) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const minFret = Math.max(1, Math.min(...frets) - 1);
  const maxFret = Math.max(minFret + 4, Math.max(...frets) + 1);
  const STRINGS = ['E', 'A', 'D', 'G', 'B', 'e'];
  const hasOpen = frets.some(f => f === 0);

  const strHead = `<div class="voi-strhead"><span class="voi-label"></span>${STRINGS.map(n => `<i>${n}</i>`).join('')}</div>`;

  let rows = '';
  if (hasOpen) {
    const cells = STRINGS.map((_, sIdx) => {
      const ai = stringGroup.indexOf(sIdx);
      const fr = ai === -1 ? null : frets[ai];
      const m = fr === 0 ? '<i class="voi-ok">○</i>' : fr === null ? '<i class="voi-no">×</i>' : '';
      return `<span class="voi-cell">${m}</span>`;
    }).join('');
    rows += `<div class="voi-f0"><span class="voi-label"></span>${cells}</div>`;
  }
  for (let f = minFret; f <= maxFret; f++) {
    const first = f === minFret;
    let label = '';
    if (hasOpen) {
      if (f === 12) label = '<i class="voi-inlay dbl"></i>';
      else if (f === 3 || f === 5 || f === 7 || f === 9) label = '<i class="voi-inlay"></i>';
    } else if (first) {
      label = `<b class="voi-lab">${minFret}</b>`;
    }
    const cells = STRINGS.map((_, sIdx) => {
      const ai = stringGroup.indexOf(sIdx);
      let dot = '';
      if (ai !== -1 && frets[ai] === f) {
        const isRoot = highlight.includes(ai);
        const noteIndex = (VOI_TUNING[sIdx] + f) % 12;
        dot = `<b class="voi-dot${isRoot ? ' root' : ''}">${VOICING_NOTES[noteIndex]}</b>`;
      }
      return `<span class="voi-cell${dot ? ' on' : ''}">${dot}</span>`;
    }).join('');
    const cls = `voi-frow${first ? ' first' : ''}`;
    rows += `<div class="${cls}" data-fret="${f}"><span class="voi-label">${label}</span>${cells}</div>`;
  }

  el.innerHTML = `<div class="voi-fretboard"><div class="voi-body"><div class="voi-dia">${strHead}${rows}</div></div></div>`;
}

function getVoicingData(root, quality, inv, dropId) {
  const q = VOICING_QUALITIES[quality];
  const baseIntervals = voiInvert(q.intervals, inv);
  const droppedIntervals = voiApplyDrop(baseIntervals, dropId);
  const notes = droppedIntervals.map(iv => VOICING_NOTES[(VOICING_NOTES.indexOf(root) + ((iv % 12) + 12) % 12) % 12]);
  const degrees = droppedIntervals.map((iv, i) => {
    const mod = ((iv % 12) + 12) % 12;
    const origIdx = q.intervals.findIndex(x => ((x % 12) + 12) % 12 === mod);
    return origIdx !== -1 ? q.degrees[origIdx] : '?';
  });
  return { intervals: droppedIntervals, notes, degrees };
}

function renderVoicingCard(containerId, root, quality, inv, dropId, compact = false) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const { intervals, notes, degrees } = getVoicingData(root, quality, inv, dropId);
  const q = VOICING_QUALITIES[quality];

  // Find fret positions
  const pitches = intervals;
  const pos = voiBestFretPosition(pitches);
  if (!pos) { el.innerHTML = '<p class="voi-error">No se pudo calcular la posición.</p>'; return; }

  // Root index in notes
  const rootNote = root;
  const rootHighlight = notes.map((n, i) => n === rootNote ? i : -1).filter(i => i !== -1);

  if (!compact) {
    el.innerHTML = `
      <div class="voi-card-header">
        <span class="voi-card-name" style="color:${q.color}">${root}${q.label}</span>
        <span class="voi-card-inv">${INVERSION_LABELS[inv]}</span>
      </div>
      <div class="voi-card-notes">${notes.join(' · ')} <span class="voi-card-deg">(${degrees.join('-')})</span></div>
      <div id="${containerId}-fb" class="voi-fretboard-wrap"></div>
      <div class="voi-span-label">Extensión: ${pos.span} trastes</div>
    `;
    renderVoicingFretboard(`${containerId}-fb`, pitches, pos.strings, pos.frets, rootHighlight);
  } else {
    el.innerHTML = `
      <div class="voi-mini-notes">${notes.join('·')}</div>
      <div id="${containerId}-fb" class="voi-fretboard-wrap"></div>
    `;
    renderVoicingFretboard(`${containerId}-fb`, pitches, pos.strings, pos.frets, rootHighlight);
  }
}

// ─── Main render ─────────────────────────────────────────────────────────────

function renderVoicings() {
  // Update header info
  const q = VOICING_QUALITIES[voicingQuality];
  const notes = voiChordNotes(voicingRoot, voicingQuality);
  const headerEl = document.getElementById('voi-chord-title');
  if (headerEl) {
    headerEl.textContent = `${voicingRoot}${q.label}`;
    headerEl.style.color = q.color;
  }
  const notesEl = document.getElementById('voi-base-notes');
  if (notesEl) notesEl.textContent = `Notas base: ${notes.join(' · ')} (${q.degrees.join('-')})`;

  // Description of selected drop
  const dropData = DROP_TYPES.find(d => d.id === voicingSelectedDrop);
  const dropDescEl = document.getElementById('voi-drop-desc');
  if (dropDescEl && dropData) {
    dropDescEl.innerHTML = `<b>${dropData.label}</b> — ${dropData.desc}`;
  }

  // Check for symmetric chord
  const symEl = document.getElementById('voi-sym-note');
  if (symEl) {
    if (q.symmetric) {
      symEl.innerHTML = `<b>Acorde simétrico:</b> el mismo diagrama funciona para ${q.symmetric} raíces distintas — el "puente mágico" de Callipari.`;
      symEl.classList.remove('hidden');
    } else {
      symEl.classList.add('hidden');
    }
  }

  // Render all 4 inversions for the selected drop
  for (let inv = 0; inv < 4; inv++) {
    const cardId = `voi-inv-${inv}`;
    renderVoicingCard(cardId, voicingRoot, voicingQuality, inv, voicingSelectedDrop);
  }

  // Update active inversion highlight
  document.querySelectorAll('.voi-inv-card').forEach((card, i) => {
    card.classList.toggle('selected', i === voicingInversion);
  });
}

function initializeVoicings() {
  const rootSelect = document.getElementById('voi-root');
  const qualitySelect = document.getElementById('voi-quality');
  if (!rootSelect || !qualitySelect) return;

  rootSelect.innerHTML = VOICING_NOTES.map(n => `<option value="${n}">${n}</option>`).join('');
  qualitySelect.innerHTML = Object.entries(VOICING_QUALITIES)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');

  rootSelect.addEventListener('change', () => { voicingRoot = rootSelect.value; renderVoicings(); });
  qualitySelect.addEventListener('change', () => { voicingQuality = qualitySelect.value; renderVoicings(); });

  // Drop type buttons
  document.querySelectorAll('.voi-drop-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      voicingSelectedDrop = btn.dataset.drop;
      document.querySelectorAll('.voi-drop-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderVoicings();
    });
  });

  // Expose a function to pre-select from other modules
  window.openVoicings = (root, quality) => {
    voicingRoot = root || voicingRoot;
    voicingQuality = quality || voicingQuality;
    if (rootSelect) rootSelect.value = voicingRoot;
    if (qualitySelect) qualitySelect.value = voicingQuality;
    renderVoicings();
  };

  renderVoicings();
}

document.addEventListener('DOMContentLoaded', initializeVoicings);
