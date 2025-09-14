# Optube — YouTube UI customizer

Optube is a Chrome extension that lets you trim YouTube’s UI to just what you care about. Hide Shorts, comments, recommendations, sidebars, and more. Under the hood, a content script runs on YouTube pages and applies a mix of attribute-driven CSS and small, reversible DOM tweaks.

## What’s here

- `public/manifest.json` — Extension manifest (injects `content.js` on `https://www.youtube.com/*`).
- `src/content.ts` — Orchestrates settings application, observers, and CSS injection.
- `src/utils/*` — Per-area logic (shorts, home, subscriptions, video, layout, navigation…).
- `src/components/*` — React settings UI.

If you want the deeper dive, see ARCHITECTURE and TOGGLES below.

## Developer setup

```zsh
npm install
npm run dev
```

Load in Chrome for development:
1) Open chrome://extensions
2) Enable "Developer mode"
3) Click "Load unpacked" and select the built output folder (see Build)

## Build

```zsh
npm run build
```

This lints, type-checks, and builds with Vite. Artifacts are emitted to `dist/`. Load `dist/` via "Load unpacked".

## Test

```zsh
npm test
npm run test:coverage
```

Tests live under `src/utils/_tests/` and run on jsdom using Vitest.

## How it works (short version)

- We store user preferences in `chrome.storage.sync` (e.g., `hideShorts`).
- `src/content.ts` reads those settings, applies visibility toggles, injects CSS, and wires observers.
- CSS does most of the heavy lifting (keyed off attributes like `html[hide_shorts="true"]`).
- For stray cases, utilities do a conservative inline hide and tag elements so we can restore them when the toggle is turned off.

## Docs

- ARCHITECTURE: `ARCHITECTURE.md`
- Feature toggles: `FEATURE_TOGGLES.md`
- Contributing: `CONTRIBUTING.md`

## Troubleshooting

- Settings not applying? Check chrome://extensions → Inspect views → your content script console.
- UI not reappearing after a toggle? Most utilities now tag inline-hidden nodes with a `data-optube-hidden-*` attribute and restore them on toggle off. If something sticks, it’s likely a new DOM variant—file an issue with a minimal repro.
