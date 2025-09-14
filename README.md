# Optube

Chrome extension to hide noisy parts of YouTube (Shorts, comments, recommendations, sidebars, etc.). A content script runs on YouTube and applies attribute-driven CSS with a few reversible DOM tweaks.

## Quick start

```zsh
npm install
npm run build
```

Load in Chrome:
- chrome://extensions → enable Developer mode → Load unpacked → pick `dist/`.

## Dev notes

- Content script: `src/content.ts` wires settings, observers, and CSS injection.
- Per-area logic lives in `src/utils/*`.
- Most hides are CSS gated by HTML attrs (e.g. `html[hide_shorts="true"]`). Inline hides are tagged so we can undo them.

## Tests

```zsh
npm test
```

Tests are under `src/utils/_tests/` (Vitest + jsdom).

## More

- Architecture notes: `ARCHITECTURE.md`
