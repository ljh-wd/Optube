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

## Shorts (example pattern)

- Attribute-driven CSS: `html[hide_shorts="true"] …` hides most cases.
- Conservative JS cleanup hides a few stray widgets and tags them with `data-optube-hidden-shorts="1"`.
- When the setting is turned off, we remove the attribute and restore anything we hid inline.

## Gotchas

- YouTube’s DOM is dynamic and A/B tested. Always guard selectors and avoid hard assumptions.
- Don’t hide parent containers that YouTube uses for virtualization/lazy load. Hide only leaf or safely-removable components.
- When using `:has()`, test both performance and correctness on search, home, channel, and watch pages.
