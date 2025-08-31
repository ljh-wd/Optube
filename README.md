# Tuboji — A YouTube UI customizer (developer README)

Tuboji is a browser extension that customizes the YouTube web UI by hiding or changing parts of the page (recommended sidebar, shorts, description, comments, etc.). The extension injects a content script (`content.js`) into YouTube pages and provides a small React-based settings UI bundled with Vite.

Key files:
- `public/manifest.json` — extension manifest (content script matches `https://www.youtube.com/*`).
- `src/utils/video.ts` — logic that shows/hides video-page elements (recommended, description, title, creator, etc.).
- `src/content.ts` — wiring that applies settings and registers observers.

Developer setup
1. Install dependencies:

```zsh
npm install
```

2 Load the extension into Chrome for development:
- Open chrome://extensions
- Enable "Developer mode"
- Click "Load unpacked" and select the project `dist`/`public` output folder. (When developing with Vite you may want to build or copy the generated assets into a folder Chrome can load — see "Build for production" below.)

Build for production

```zsh
npm run build
```

This runs TypeScript build and Vite build. The final assets (including `content.js`) will be emitted to the project's `dist` folder. Load that folder in Chrome via "Load unpacked".

How to test the content script quickly
- After building, open a YouTube video page and verify that the content script is active (it runs on match `https://www.youtube.com/*`).
- Toggle settings in the extension popup (index.html) to see UI-driven changes to the page.

Notes and troubleshooting
- The extension uses `chrome.storage.sync` for settings. When changing settings in dev, the content script watches storage changes and re-applies styling.
- If you see layout changes on non-video routes, ensure the content script's logic runs only on watch pages — the code already checks for `/watch?v=` and the presence of `ytd-watch-flexy` before applying video-only layout changes.
- If the popup/settings UI doesn't reflect changes, open DevTools for the extension popup (from chrome://extensions) to inspect any console errors.
