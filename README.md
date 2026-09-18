# GuitarTool · Atlas armónico

Herramienta de estudio de guitarra basada en el navegador: detecta acordes por el
micrófono y explora teoría armónica de forma visual e interactiva (en español,
diseño "field-recorder" oscuro).

## Stack

- Svelte 5 (runes) + Vite 6 + Tailwind CSS v4
- TypeScript estricto
- Audio: Web Audio API, autocorrelación, cuerdas Karplus-Strong
- Tests: Vitest (teoría, audio y throttling con fake timers)
- CI: GitHub Actions (check + build + test)

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | `svelte-check` + typecheck estricto |
| `npm run build` | Compilación de producción |
| `npm test` | Suite Vitest |
| `npm run capture` | Capturas de las 15 vistas en `docs/screenshots` (Playwright + build local) |

## Vistas

Acordes (detección por micrófono), Afinador (meter con zona ±5 cent), Armonía
(redes funcionales), Círculo de quintas, Escalas, Modos, Cartografía modal,
Sabores, Tensiones, Policordios, Voicings, Ejes Bartók, Transformaciones P/R/L,
Tritono y Vecindad armónica.

## Arquitectura

- `src/lib/theory/` — modelos puros y testeables de teoría (acordes, modos,
  proximidad, tensions, prl, voicings, polychords, cartografía, armonía).
- `src/lib/audio/` — motor de audio, detección (`autocorrelate`), stores con
  throttling (`throttle.ts`) y síntesis.
- `src/lib/ui/` — primitivas de interfaz (tabs accesibles, chips, campos,
  paneles, insignias).
- `src/views/` — una vista por modo, lazy-loaded.