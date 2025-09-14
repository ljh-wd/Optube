# Architecture

This is a quick tour of how Optube works under the hood. It’s intentionally practical: where things live, how they talk to each other, and what patterns to follow when adding or changing behavior.

## High-level flow

- Chrome loads the content script (`content.js`) on any `https://www.youtube.com/*` page (see `public/manifest.json`).
- The content script:
  - Reads settings from `chrome.storage.sync`.
  - Applies visibility/layout changes by calling per-area utilities in `src/utils/*`.
  - Injects small CSS blocks for rules that are cheaper/safer to do in CSS.
  - Sets up a few MutationObservers to re-apply logic when YouTube re-renders the DOM.
  - Listens for `chrome.storage.onChanged` to re-apply when the user toggles settings.

The goal: prefer declarative CSS hides keyed off attributes/classes, and only fall back to small, reversible inline style changes when the DOM doesn’t expose a stable hook yet.

## Modules and responsibilities

- `src/content.ts`: orchestration. Fetches settings, calls `setXVisibility`/`applyX`, registers observers, and injects CSS helpers.
- `src/utils/*`: one file per area of the product (shorts, home, subscriptions, video page, layout, navigation, etc.). Each generally provides:
  - `setXVisibility(state: boolean)`: apply/remove attributes or classes and do any conservative DOM cleanup.
  - `observeX()`: minimal MutationObserver to re-apply cleanup when YouTube adds nodes.
  - `injectXCSS()`: a style block for attribute/class-driven CSS rules.
- `src/components/*`: React UI for the popup that sets `chrome.storage.sync` keys.
- `src/types/global.ts`: shared types for settings.

## Storage and settings

- We store all user settings in `chrome.storage.sync` under simple boolean keys (`hideShorts`, `hideHome`, etc.).
- The content script reads them on startup and wires a single `chrome.storage.onChanged` listener to re-run the `cleanYouTube` function on updates.

## CSS strategy

- Prefer applying a root attribute or body class and hiding via CSS selectors. Example: `html[hide_shorts="true"]` drives most Shorts-related hiding.
- Keep CSS selectors narrow and explicit (use `:has()` sparingly and only when it’s the best available hook). Avoid hiding container primitives like `ytd-rich-grid-renderer` to not break lazy loading.
- When the DOM doesn’t offer a reliable hook, we allow a conservative inline `display: none` in JS for specific elements and mark them with a data-attribute so we can restore them later.

## Observers

- Observers are scoped and debounced. We don’t run heavy work for every micro-change.
- The pattern is: read the single setting you care about; if enabled, observe and apply cleanup. If disabled, disconnect/skip.

## Testing

- Unit tests live under `src/utils/_tests/` and run on jsdom using Vitest.
- Prefer small, deterministic tests that:
  - Construct the minimal DOM snippet being targeted.
  - Call the utility function.
  - Assert style/attribute changes.

# Architecture


## Modules

- `src/content.ts`: orchestration (settings → apply → observe → inject CSS).
- `src/utils/*`: one file per area (shorts, home, subscriptions, video, layout, navigation…). Typical trio: `setXVisibility`, `observeX`, `injectXCSS`.
- `src/components/*`: React popup that writes `chrome.storage.sync`.

## CSS and observers

- Keep selectors narrow; avoid hiding structural containers (`ytd-rich-grid-renderer`, etc.).
- Use `:has()` only when needed and keep it specific.
- Observers are scoped and debounced. Only observe when the related setting is enabled.

## Tests

- Vitest + jsdom under `src/utils/_tests/`.
- Test the smallest DOM you can; assert both hide and restore paths where relevant.
