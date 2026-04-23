# Phase 4 PRD — Polish & Accessibility

## Goal

Make the site robust, accessible, and visually consistent before release. This phase does not add new features; it hardens the existing three views (search, grid, detail) so they pass Lighthouse accessibility auditing, work with screen readers, and feel polished on real devices.

## Scope

- **Fixed `aria-live` region:** Replace dynamically injected `aria-live` elements in all three view modules with a single fixed `<div aria-live="polite" aria-atomic="true">` inside `index.html` that modules write status messages into.
- **Focus-visible audit:** Ensure all interactive elements (buttons, inputs, cards) have consistent `:focus-visible` styles. Remove default browser outlines only when `:focus-visible` is supported.
- **Skip-to-content link:** Already present in `index.html` and CSS; verify it works correctly across all three views.
- **`prefers-reduced-motion`:** Add a media query that disables any CSS transitions or animations for users who prefer reduced motion.
- **Loading states:** Enhance the existing text-based loading messages with a simple CSS spinner or skeleton pulse (no external dependencies).
- **Favicon:** Add a simple favicon (e.g., a 32×32 PNG or SVG) and the corresponding `<link rel="icon">` tag in `index.html`.
- **Meta tags:** Verify `description` and `theme-color` are present and correct; add `og:title` and `og:description` for social sharing.
- **`.gitignore`:** Ensure it ignores OS files (`.DS_Store`) and editor folders (`.vscode/`).
- **Remove `test-api.html`:** Move to `archive/` or delete before deployment.
- **Color contrast audit:** Verify all text and UI labels meet WCAG AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text/UI components).

## Out of Scope

- Dark mode or theme switching.
- Service Worker / offline support.
- E2E or unit tests.
- Any new feature not listed above.

## User Flow

No new user flows are introduced in this phase. Existing flows are hardened:

1. Open the site → skip link visible on Tab.
2. Search for an artist → loading state announced by screen reader, results announced when ready.
3. Select an artist → grid loads, heading announced.
4. Select an album → detail loads, tracklist announced.
5. Navigate back → focus restored, no focus traps.

## UI States

No new UI states. Existing states are enhanced:

| State | Enhancement |
|-------|-------------|
| **Loading** | Visual spinner or pulse animation (respects `prefers-reduced-motion`). |
| **Error** | Written into fixed `aria-live` region so screen readers announce it. |
| **Results** | Written into fixed `aria-live` region so screen readers announce count. |

## Technical Notes

- **Stack:** Vanilla JavaScript (ES modules), semantic HTML5, vanilla CSS3. No framework, no build step.
- **Fixed aria-live container:** Add `<div id="status-region" aria-live="polite" aria-atomic="true" class="visually-hidden"></div>` to `index.html` inside `<main>` or `<body>`. All view modules write status text to this container instead of creating their own `aria-live` elements.
  - `search-view.js`: write "Searching…", "No artists found", "Something went wrong" to `status-region`.
  - `grid-view.js`: write "Loading albums…", "No albums found", error messages to `status-region`.
  - `detail-view.js`: write "Loading album details…", error messages to `status-region`.
- **prefers-reduced-motion:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- **Loading spinner:** Pure CSS spinner using `@keyframes rotate` on a border. Hidden when `prefers-reduced-motion: reduce` is active (show static text instead).
- **Favicon:** A simple 32×32 PNG (solid color or initial) placed in `assets/`. If no design asset is available, a data-URI SVG favicon is acceptable.
- **Color contrast:** The current palette uses `--color-text: #1a1a1a` on `--color-bg: #ffffff` (ratio ~16:1, passes). `--color-text-secondary: #666666` on white (ratio ~5.7:1, passes). `--color-primary: #2563eb` on white for buttons (ratio ~4.5:1, passes). Manual spot-check with DevTools recommended.
- **File size budget:** Current CSS + JS is well under 50 KB. Phase 4 additions (spinner CSS, meta tags, favicon) should not exceed 5 KB combined.

## Acceptance Criteria

- [ ] A single fixed `aria-live="polite"` region exists in `index.html` and is used by all view modules for status announcements.
- [ ] Lighthouse accessibility score ≥ 90 (tested in Chrome DevTools, mobile emulation).
- [ ] No horizontal scroll on any screen width ≥ 320px.
- [ ] Color contrast ratio ≥ 4.5:1 for all body text and UI labels.
- [ ] All images have `alt` text or are explicitly marked decorative (already true; verify no regressions).
- [ ] Focus indicators are clearly visible (minimum 2px outline or equivalent) on all interactive elements.
- [ ] `prefers-reduced-motion` media query disables all animations/transitions.
- [ ] Loading states have a visual indicator (spinner or pulse) that respects reduced motion.
- [ ] Favicon is present and loads without 404.
- [ ] `test-api.html` is removed from the repository root (moved to `archive/` or deleted).
- [ ] `.gitignore` ignores `.DS_Store` and `.vscode/`.
- [ ] Total size of `css/style.css` + `js/app.js` + all modules < 50 KB uncompressed.
- [ ] Zero external font requests (system font stack only; already true).

## Manual Validation

1. Run **Lighthouse** in Chrome DevTools (mobile emulation) — verify accessibility score ≥ 90.
2. Navigate the entire app with **keyboard only** — no focus traps, logical flow, skip link works.
3. Test with **macOS VoiceOver** or NVDA: search, select artist, select album, read tracklist. Verify status announcements.
4. Test on **slow 3G throttling** — loading states appear within 100ms of interaction.
5. Enable **"Reduce motion"** in OS settings — confirm no animations run, loading state is static text.
6. Resize browser to **320px** — confirm no horizontal scroll on any view.
7. Check **Network tab** for 404s — confirm favicon loads, no missing assets.
8. Verify `test-api.html` is **not in the root**.

## Risks / Open Questions

- **Lighthouse score dependency on external images:** Deezer images are hotlinked and may fail, causing accessibility penalties for missing `alt` fallbacks. The existing `onerror` handlers and placeholders should mitigate this.
- **aria-live verbosity:** Writing too frequently to the `aria-live` region can overwhelm screen reader users. Only write on state changes (loading → results, loading → error), not on every DOM update.
- **Favicon design:** If no favicon asset is provided, a simple colored square or text-based SVG is acceptable for v1.
