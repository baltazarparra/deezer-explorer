# Phase 2 PRD — Album Grid

## Goal

Display an artist's full discography as a responsive grid of album cards after the user selects an artist from the search results. The user must be able to browse the albums and return to the search results without triggering a re-fetch.

## Scope

- **API extension (`js/modules/api.js`):** Add `getArtistAlbums(artistId)` that calls `GET /artist/{id}/albums` through the CORS proxy.
- **Grid view module (`js/modules/grid-view.js`):** Read the artist selected in Phase 1, fetch albums, and render the grid.
- **Album grid CSS:** `display: grid` with `grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))` and `gap: 1rem`.
- **Album card:** Cover image (`cover_medium`), album title, release year extracted from `release_date`. Each card is a `<button type="button">`.
- **Artist heading:** Display the artist name as a heading above the grid.
- **Back button:** A "Back to search results" button at the top of the grid section.
- **Integration with existing view-toggling:** The grid section (`#grid-section`) is already revealed by `search-view.js` when an artist is clicked. `grid-view.js` must render its content into this visible section.

## Out of Scope

- Album detail rendering (Phase 3).
- Audio playback, pagination, album sorting, filtering, or deduplication.
- Prefetching album detail data on hover.
- Any backend or state persistence beyond the current session.

## User Flow

1. User searches for an artist in Phase 1 and clicks a result.
2. The search section hides and the grid section appears (already implemented in Phase 1).
3. The grid view module detects the selected artist, shows a loading state, and fetches albums.
4. Albums render as a grid of cards.
5. User browses the grid.
6. User clicks the "Back" button.
7. The grid section hides, the search section reappears, and the previous search results are still visible without a re-fetch.

## UI States

| State | Trigger | Visual |
|-------|---------|--------|
| **Loading** | Grid section becomes visible | A loading message or spinner appears inside `#grid-section`. |
| **Results** | API returns album list | Grid of album cards with cover, title, and release year. |
| **Error** | `fetch` rejects or HTTP non-OK | An error message inside `#grid-section`. |
| **Back transition** | User clicks "Back" button | Grid section hidden, search section shown. Focus restored to previously selected artist or search input. |

## Technical Notes

- **Stack:** Vanilla JavaScript (ES modules), semantic HTML5, vanilla CSS3. No framework, no build step.
- **Reading selected artist:** `search-view.js` stores the selected artist in `window.__selectedArtist` before toggling the view. `grid-view.js` will read this global to obtain `artist.id` and `artist.name`. If the global is missing (e.g., page refreshed), the grid view should render an error state prompting the user to search again.
- **API call:** `GET ${PROXY_BASE}${DEEZER_BASE}/artist/{id}/albums`. The response shape contains `data[]` with fields: `title`, `cover_medium`, `release_date` (YYYY-MM-DD format).
- **Release year extraction:** Split `release_date` on `'-'` and take the first element, or use `new Date(release_date).getFullYear()`.
- **View toggling:** The grid view module does not manage section visibility directly. `search-view.js` shows the grid section when an artist is selected. `grid-view.js` listens for visibility (e.g., via a MutationObserver or by being called immediately after the section is shown) and renders content. The "Back" button calls a function that hides `#grid-section`, shows `#search-section`, and restores focus.
- **Focus restoration:** When navigating back, focus should return to the `<button>` of the previously selected artist result. If that element no longer exists in the DOM, fall back to the search input. The previously selected artist ID can be stored in a module-level variable inside `grid-view.js` or read from `window.__selectedArtist.id`.
- **Image handling:** Album covers use `loading="lazy"`. If `cover_medium` is missing or returns 404, the image should be hidden via `onerror` (same pattern as Phase 1 thumbnails).
- **Accessibility:**
  - Album cards must be focusable via `Tab` and activatable via `Enter`.
  - The "Back" button must be the first focusable element in the grid section.
  - The artist name should be an `<h2>` (or appropriate heading level) for screen-reader context.

## Acceptance Criteria

- [ ] `getArtistAlbums(artistId)` exists in `js/modules/api.js` and returns normalized JSON.
- [ ] Clicking an artist from Phase 1 renders the album grid with the correct artist name as heading.
- [ ] The grid lists all albums returned by the endpoint (no pagination in v1).
- [ ] Each card shows cover image, title, and release year.
- [ ] Each card is a `<button>` with `type="button"`, keyboard-focusable, and has visible title.
- [ ] Cover images have `alt=""` (decorative, because the title is already visible) or `alt="${album.title}"`.
- [ ] Images use `loading="lazy"`.
- [ ] Loading state appears while fetching albums.
- [ ] Error state appears if the request fails.
- [ ] Clicking "Back" returns to the search results section without re-fetching.
- [ ] Focus is restored to the previously selected artist item; if unavailable, focus moves to the search input.
- [ ] Grid displays 2 columns at 320px and 4–5 columns at 1440px without horizontal scroll.
- [ ] Touch targets are at least 44×44px.

## Manual Validation

1. Select **"The Beatles"** (ID `1`) — verify album grid loads with recognizable covers.
2. Confirm tab order moves left-to-right, top-to-bottom through cards.
3. Press **"Back"** — return to the same search results. Confirm the search input still contains the previous query.
4. Resize browser from **320px to 1440px** — grid adapts without horizontal scroll.
5. Test on an actual mobile device — confirm touch targets feel natural.
6. Disconnect Wi-Fi, select an artist — expect error state in the grid section.
7. Refresh the page while on the grid view — expect an error or graceful fallback (since `window.__selectedArtist` is lost).

## Risks / Open Questions

- **Duplicate albums:** The Deezer endpoint may return duplicate albums (different regions or re-releases). We will display them as-is for v1; deduplication is out of scope.
- **Missing artist data on refresh:** Because state is only in memory (`window.__selectedArtist`), refreshing the page while viewing the grid breaks the flow. This is acceptable for v1; the user simply searches again.
- **Large discographies:** Popular artists may return 50–100 albums. The grid renders all of them at once (no pagination). Performance should be monitored; if rendering becomes slow, virtual scrolling or pagination may be needed in a future version.
- **Focus restoration edge case:** If the user searches again after returning from the grid, the old artist result buttons are replaced. The "previously selected" button may no longer exist. In that case, focus should fall back to the search input.
