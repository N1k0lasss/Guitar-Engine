import { preview } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const PORT = 4173;
const OUT = 'docs/screenshots';

const GROUPS = {
  chords: 'Detectar', tuner: 'Detectar',
  harmony: 'Explorar', triads: 'Explorar', circle: 'Explorar', scales: 'Explorar',
  modes: 'Explorar', cartography: 'Explorar', sabores: 'Explorar',
  tensions: 'Color', polychords: 'Color', voicings: 'Color', ejes: 'Color',
  prl: 'Vínculos', tritone: 'Vínculos', proximity: 'Vínculos',
};

const VIEWS = [
  ['chords', 'Acordes'],
  ['tuner', 'Afinador'],
  ['harmony', 'Armonía'],
  ['triads', 'Triadas'],
  ['circle', 'Círculo 5tas'],
  ['scales', 'Escalas'],
  ['modes', 'Modos'],
  ['cartography', 'Cartografía'],
  ['sabores', 'Sabores'],
  ['tensions', 'Tensiones'],
  ['polychords', 'Policordios'],
  ['voicings', 'Voicings'],
  ['ejes', 'Ejes Bartók'],
  ['prl', 'P / R / L'],
  ['tritone', 'Tritono'],
  ['proximity', 'Vecindad'],
];

mkdirSync(OUT, { recursive: true });

const server = await preview({ preview: { port: PORT }, server: { port: PORT } });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  for (const [id, label] of VIEWS) {
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    const group = GROUPS[id];
    if (group !== 'Explorar') {
      const groupBtn = page.locator('.nav-group-btn', { hasText: group });
      if ((await groupBtn.getAttribute('aria-expanded')) !== 'true') await groupBtn.click();
    }
    await page.locator('.nav-btn', { hasText: label }).first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${id}.png`, fullPage: true });
    console.log(`✓ ${id} (${label})`);
  }
} finally {
  await browser.close();
  await server.close();
}