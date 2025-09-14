# Feature toggles

This repo follows a consistent pattern for UI toggles. If you’re adding a new one, mirror the structure below.

## Contract

A typical module in `src/utils/` exposes three pieces:

- `setXVisibility(enabled: boolean)`: primary entry point.
  - Sets/removes a root attribute or body class.
  - Performs targeted, reversible cleanup via inline styles where needed.
- `observeX()`: small MutationObserver that re-applies cleanup when YouTube re-renders. Should no-op if the toggle is off.
- `injectXCSS()`: injects a `<style>` tag with attribute/class-driven selectors.

The content script calls these in `cleanYouTube()` and at startup.

## Reversible cleanup

Inline `display: none` is a last resort. When you use it, tag the element so we can undo it:

- When hiding: set `el.style.display = 'none'` and `el.setAttribute('data-optube-hidden-<area>', '1')`.
- When showing: find `[data-optube-hidden-<area>="1"]`, clear `style.display` and remove the attribute.

Example (Shorts): `data-optube-hidden-shorts`.

## Selectors and safety

- Prefer attribute- or class-gated CSS selectors (`html[hide_foo="true"] …`).
- Avoid hiding structural containers like `ytd-rich-grid-renderer` and `ytd-item-section-renderer`. Hiding these breaks lazy loading and pagination.
- Use `:has()` only when necessary and keep it specific. Test against various YouTube surfaces (home, search, channel, watch, subscriptions).

## Observers

- Wrap in a small debounce when the work can batch.
- Only read the setting you need; don’t fetch the entire settings object on every mutation.

## Naming

- Settings keys: `hideSomething` (boolean).
- Root attributes: `hide_something` on `<html>` or a scoped class on `<body>` when it’s mode-like (e.g., cinematic mode).
- Data attribute for inline hides: `data-optube-hidden-<area>`.

## Tests

- Place tests in `src/utils/_tests/`.
- Build minimal DOM fixtures for each targeted widget.
- Assert both hide and restore paths.
