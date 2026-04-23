# Phase 2 Implementation Report — Album Grid

## Summary

Phase 2 implemented the album grid view, including the API extension to fetch an artist's albums, the grid rendering module, responsive CSS, and the "Back" navigation with focus restoration. The phase integrated seamlessly with Phase 1 via a `CustomEvent` decoupling pattern.

## Deliverables

| File | Status | Notes |
|------|--------|-------|
| `js/modules/api.js` | Modified | Added `getArtistAlbums(artistId)` following the same error-handling pattern as `searchArtists`. |
| `js/modules/grid-view.js` | Created | Listens for `artist-selected` CustomEvent, fetches albums, renders grid with heading, back button, loading/empty/error states, and restores focus on Back navigation. |
| `js/modules/search-view.js` | Modified | Dispatches `CustomEvent('artist-selected', { detail: artist })` after toggling section visibility. |
| `js/app.js` | Modified | Imports and initializes `grid-view.js` alongside `search-view.js`. |
| `css/style.css` | Modified | Added styles for `#grid-section`, `.back-button`, `.grid-heading`, `.album-grid`, `.album-card`, and responsive breakpoints. |

## Acceptance Criteria — Status

All 12 criteria from the Phase 2 PRD were met:

1. ✅ `getArtistAlbums(artistId)` exists in `js/modules/api.js`.
2. ✅ Grid renders with the correct artist name as `<h2>` heading.
3. ✅ All albums returned by the endpoint are displayed (no pagination).
4. ✅ Each card shows cover image, title, and release year.
5. ✅ Each card is a `<button type="button">`, keyboard-focusable.
6. ✅ Cover images have `alt=""` (decorative, title is visible).
7. ✅ Images use `loading="lazy"`.
8. ✅ Loading state appears while fetching albums.
9. ✅ Error state appears if the request fails.
10. ✅ Clicking "Back" returns to search results without re-fetching.
11. ✅ Focus restored to previously selected artist item (fallback to search input).
12. ✅ Grid responsive: 2+ columns at 320px, 4–5 at 1440px; touch targets ≥ 44×44px.

## Deviations from Plan

- None. The implementation followed the Phase 2 PRD and `PLAN.md` closely.

## Technical Decisions Made

- **CustomEvent decoupling:** `search-view.js` dispatches `artist-selected` on `document` instead of calling `grid-view.js` directly. This keeps the modules independent and testable.
- **`innerHTML = ''` for clearing:** `clearGrid()` uses `gridSection.innerHTML = ''` to remove all previous grid content efficiently.
- **Focus restoration via data attribute:** The previously selected artist button is found by querying `[data-artist-id="${lastSelectedArtistId}"]` in the search section. If absent (e.g., user searched again), focus falls back to the search input.
- **Release year extraction:** Simple `split('-')[0]` on `release_date` (YYYY-MM-DD format). No `Date` object needed.

## Known Limitations (to address in later phases)

- **`aria-live` dynamic injection:** Same as Phase 1 — loading/empty/error messages create their own `aria-live` elements on demand. A fixed container will be implemented in Phase 4.
- **State lost on refresh:** `window.__selectedArtist` and the CustomEvent state disappear on page reload. Acceptable for v1.
- **No album deduplication:** Duplicate albums from different regions are displayed as-is. Out of scope for v1.
- **Large discographies:** All albums render at once. No virtual scrolling or pagination. Performance monitored; no issues observed in manual testing.

## Validation Results

- **User confirmation:** The user tested the flow and confirmed "funcionou" (it worked).
- **Local server test:** All files served with HTTP 200, no 404s on module imports.
- **Integration test:** Search → select artist → grid renders → Back → search results preserved, focus restored.

## State of the Codebase

The repository remains clean: no frameworks, no build step, no dependencies. Total size of CSS + JS is well under 50 KB. Three of the three core views now have structural placeholders (`search-section`, `grid-section`, `detail-section`); two are fully implemented.
