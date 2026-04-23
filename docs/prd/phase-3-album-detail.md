# Phase 3 PRD — Album Detail

## Goal

Show full album information when a user selects an album from the grid: large cover art, title, release date, and a complete tracklist with track numbers, titles, and formatted durations. The user must be able to return to the album grid without triggering a re-fetch.

## Scope

- **API extension (`js/modules/api.js`):** Add `getAlbum(albumId)` that calls `GET /album/{id}` through the CORS proxy.
- **Utility module (`js/modules/utils.js`):** Create `formatDuration(seconds)` to convert raw seconds into `mm:ss`.
- **Detail view module (`js/modules/detail-view.js`):** Listen for album selection, fetch details, and render the full view.
- **Album detail rendering:** Large cover (`cover_big` or `cover_xl`), album title, release date formatted with `Intl.DateTimeFormat`, tracklist as an ordered list (`<ol>`).
- **Track item:** Track number, title, duration formatted as `mm:ss`.
- **Back button:** A "Back to albums" button at the top of the detail section.
- **Integration with existing view-toggling:** `grid-view.js` already reveals `#detail-section` when an album is clicked (to be added). `detail-view.js` renders content into the visible section.

## Out of Scope

- Audio preview or playback.
- Artist biography or related albums.
- Pagination of tracks (albums typically have < 30 tracks).
- Any backend or state persistence beyond the current session.

## User Flow

1. User is on the album grid (Phase 2).
2. User clicks an album card.
3. The grid section hides and the detail section appears.
4. The detail view module shows a loading state, fetches album details.
5. The app renders the album cover, title, release date, and tracklist.
6. User reviews the tracklist.
7. User clicks the "Back" button.
8. The detail section hides, the grid section reappears, and the previous album grid is still visible without a re-fetch.

## UI States

| State | Trigger | Visual |
|-------|---------|--------|
| **Loading** | Detail section becomes visible | A loading message appears inside `#detail-section`. |
| **Results** | API returns album detail | Large cover, title, formatted release date, and tracklist (`<ol>`). |
| **Error** | `fetch` rejects or HTTP non-OK | An error message inside `#detail-section`. |
| **Back transition** | User clicks "Back" button | Detail section hidden, grid section shown. Focus restored to previously selected album card. |

## Technical Notes

- **Stack:** Vanilla JavaScript (ES modules), semantic HTML5, vanilla CSS3. No framework, no build step.
- **Reading selected album:** `grid-view.js` will store the selected album ID in a module-level variable or a global (following the same pragmatic pattern as `window.__selectedArtist`). `detail-view.js` reads this to know which album to fetch. If missing, render an error state.
- **API call:** `GET ${PROXY_BASE}${DEEZER_BASE}/album/{id}`. Response contains `title`, `cover_big`, `release_date`, `tracks.data[]` with `title` and `duration` (in seconds).
- **Duration formatting:** `formatDuration(seconds)` in `js/modules/utils.js`:
  - `const mins = Math.floor(seconds / 60);`
  - `const secs = seconds % 60;`
  - `return `${mins}:${secs.toString().padStart(2, '0')}`;`
  - Handle `null`/`undefined` by returning `"—"`.
- **Release date formatting:** `new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(release_date))`. Fallback to raw string if parsing fails.
- **View toggling:** `grid-view.js` dispatches `CustomEvent('album-selected', { detail: album })` when a card is clicked. `detail-view.js` listens for this event, same decoupling pattern as Phase 2.
- **Back navigation:** The "Back" button hides `#detail-section`, shows `#grid-section`, and restores focus to the previously selected album card (queried by `[data-album-id]`). If the card is not found, focus moves to the grid's Back button or the grid heading.
- **Image handling:** Album cover uses `cover_big`. If missing or 404, show a CSS placeholder (solid background color). Use `onerror` to swap to placeholder class or hide the image.
- **Accessibility:**
  - Tracklist uses `<ol>` for semantic ordering.
  - The "Back" button is the first focusable element in the detail section.
  - Album title should be an `<h2>`.
  - Focus must be visible on all interactive elements.

## Acceptance Criteria

- [ ] `getAlbum(albumId)` exists in `js/modules/api.js`.
- [ ] `formatDuration(seconds)` exists in `js/modules/utils.js` and handles edge cases.
- [ ] Clicking an album card hides the grid section and shows the detail section.
- [ ] Tracklist renders in the exact order returned by the API.
- [ ] Release date is human-readable (locale-aware or explicit format).
- [ ] Durations are formatted as `mm:ss`.
- [ ] Loading state appears while fetching.
- [ ] Error state appears if the request fails.
- [ ] Clicking "Back" returns to the album grid section without re-fetching.
- [ ] Focus is restored to the previously selected album card; if unavailable, focus moves to the grid heading or Back button.
- [ ] Missing cover images show a CSS-generated placeholder.
- [ ] Missing track durations or titles render as "—" instead of `undefined`.

## Manual Validation

1. Open **"Random Access Memories"** (album ID `302127`) — verify tracklist, correct durations, and release date formatted.
2. Open a single-track release — verify it renders correctly.
3. Use keyboard only: Tab to album card, Enter to open, Tab to Back button, Enter to return.
4. Test on actual mobile device (iOS Safari + Android Chrome) — touch targets are ≥ 44×44px.
5. Block image requests in DevTools — verify placeholder styling appears for the album cover.
6. Disconnect Wi-Fi, open an album — expect error state in detail section.
7. Refresh the page while on the detail view — expect error or graceful fallback.

## Risks / Open Questions

- **Missing metadata:** Some albums may lack `cover_big`, `release_date`, or individual track `duration`. All fields must be guarded with fallbacks.
- **State lost on refresh:** Same limitation as Phase 2. Refreshing on the detail view breaks the flow because the selected album ID is only in memory.
- **Long tracklists:** Albums with 30+ tracks will create a long scroll. No pagination needed, but ensure the Back button remains accessible (sticky or always at the top).
- **Date parsing edge cases:** The API returns `release_date` as `YYYY-MM-DD`. `new Date()` parsing should be safe, but a fallback to raw string display is prudent.
