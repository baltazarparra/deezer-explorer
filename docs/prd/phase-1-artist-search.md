# Phase 1 PRD — Artist Search

## Goal

Implement the search input, artist results list, and the first view-transition from the search screen to the album-grid placeholder. By the end of this phase a user can open the site, search for an artist by name, see up to 10 matching results with thumbnails, and click an artist to move to the next view.

## Scope

- **Search form:** A `<form>` inside the search `<section>` containing a labeled `<input type="search">` and a submit `<button>`.
- **API module (`js/modules/api.js`):** A single exported function `searchArtists(query)` that calls the Deezer search endpoint through the CORS proxy chosen in Phase 0 and returns normalized JSON.
- **Search view module (`js/modules/search-view.js`):** Renders the form, handles the submit event, invokes `api.js`, and renders up to 10 artist results into the DOM.
- **Artist result item:** Each result displays the artist name and a thumbnail image (`picture_small`), wrapped in a clickable `<button>`.
- **View transition:** Clicking an artist result hides the search `<section>` and reveals the album-grid `<section>` (which remains empty in this phase; its content is Phase 2).
- **CSS:** Mobile-first styles for the search form, results list, and result items in `css/style.css`.

## Out of Scope

- Album grid rendering (Phase 2).
- Album detail rendering (Phase 3).
- Audio playback, pagination, favorites, artist biographies.
- Hash-based routing or browser history management.
- Auto-search while typing (debounce).
- Any backend, serverless function, or database.

## User Flow

1. User opens the site and sees the search form.
2. User types an artist name and presses Enter (or clicks the submit button).
3. The submit button disables and shows a loading indicator.
4. The app calls the Deezer API via the CORS proxy.
5. The app renders the results list:
   - If results exist: up to 10 artist items.
   - If no results: an empty-state message.
   - If the request fails: an error-state message.
6. User clicks an artist result.
7. The search section is hidden and the album-grid section is shown.

## UI States

| State | Trigger | Visual |
|-------|---------|--------|
| **Initial** | Page load | Search form visible, no results below it. |
| **Loading** | Form submit | Submit button disabled, text changed to "Searching…" or spinner shown. |
| **Results** | API returns `data` with items | List of artist cards below the form. Each card shows thumbnail + name. |
| **Empty** | API returns `data` with zero items | Message: "No artists found." |
| **Error** | `fetch` rejects or HTTP non-OK | Message: "Something went wrong. Try again." |
| **Transition** | User clicks an artist card | Search section hidden (`display: none`), album-grid section visible. |

## Technical Notes

- **Stack:** Vanilla JavaScript (ES modules), semantic HTML5, vanilla CSS3 with CSS Custom Properties. No framework, no build step.
- **Navigation strategy:** View-toggling (show/hide `<section>` elements) as decided in `PLAN.md`. The album-grid section is present in `index.html` as an empty placeholder and is revealed by removing a hidden class.
- **API call:** `GET https://<cors-proxy>/<deezer-api>/search/artist?q=<query>`. The exact proxy base URL is the output of Phase 0 and must be abstracted into a single constant (e.g., `API_BASE`).
- **Request policy:** Search triggers on explicit submit only. No auto-search while typing, to avoid rate-limiting the public CORS proxy.
- **State persistence:** Search results are stored in a module-level variable inside `search-view.js` (or passed to a lightweight state object) so that navigating back from the album grid in Phase 2 does not re-fetch.
- **Accessibility:**
  - The search input must have an associated `<label>` (visible or visually hidden). Do not rely solely on `placeholder`.
  - Artist result buttons must be focusable via `Tab` and activatable via `Enter`.
  - Focus management: when results appear, focus should remain natural (stay on the submit button or move to the first result depending on UX decision).
- **Error handling:** All `fetch` calls must include a `.catch()` path that renders the error state in the UI. Never leave the user with a blank screen or an unhandled console error.
- **Paths:** All internal paths are relative (`./css/style.css`, `./js/modules/api.js`) so they work both locally and on GitHub Pages.

## Acceptance Criteria

- [ ] Typing an artist name and pressing Enter (or clicking the button) triggers exactly one API request.
- [ ] Results render within 200 ms of the response arriving.
- [ ] Up to 10 artist results display, each with name and thumbnail.
- [ ] Empty state: if `data.length === 0`, show "No artists found."
- [ ] Error state: if `fetch` rejects or returns a non-OK status, show "Something went wrong. Try again."
- [ ] Loading state: button is disabled and visually marked while fetching.
- [ ] Input has an associated `<label>` (visually hidden or explicit), not just a `placeholder`.
- [ ] Search results are stored in a module-level variable so navigating back from the album grid does not re-fetch.
- [ ] Clicking an artist result hides the search section and shows the album-grid section.
- [ ] No framework, bundler, or build file is added to the repository.

## Manual Validation

1. Search for **"Radiohead"** — expect results including artist ID `959`.
2. Search for gibberish (**"xyz123abc"**) — expect the empty state with the message "No artists found."
3. Disconnect Wi-Fi and search — expect the error state with the message "Something went wrong. Try again."
4. Search for **"Björk"** and **"Caetano Veloso"** — verify diacritics do not break the request or the proxy.
5. Navigate the entire flow using only **Tab** and **Enter**.
6. Throttle to **"Slow 3G"** in DevTools — confirm the loading state appears before data renders.
7. Click an artist result — confirm the search section disappears and the album-grid section appears.

## Risks / Open Questions

- **CORS proxy reliability:** The public proxy chosen in Phase 0 may rate-limit or reject requests. If it fails during this phase, test the fallback proxy immediately. Do not add a backend component without explicit user approval.
- **Diacritics / URL encoding:** The API handles UTF-8, but the proxy might not URL-encode correctly. Validation with "Björk" and "Mötorhead" is required.
- **Image failures:** Deezer thumbnails may return 404. The UI must handle missing `picture_small` gracefully (e.g., omit the image or show a colored placeholder div).
- **Focus management on transition:** When the user clicks an artist and the view switches, where should focus land? Decision needed: either move focus to the album-grid heading or leave it natural. Document the choice in the code.
