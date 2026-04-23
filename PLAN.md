# Deezer Explorer — Product Plan v1

## 1. Product Summary

A static, mobile-first website that lets anyone search for an artist by name, browse their discography as a grid of album cards, and open an album to view its tracklist, release date, and cover art. All data comes from the public Deezer API. No backend, no authentication, and no database.

## 2. v1 Scope (Exact)

- **Search:** Type an artist name and receive a list of matching artists.
- **Artist selection:** Click an artist to view their albums.
- **Album grid:** Display albums as cards with cover image, title, and release year.
- **Album detail:** Click an album to view full tracklist (track number + title + duration), cover art (larger), and exact release date.
- **Navigation:** A way to go back from album detail to album grid, and from album grid to search results.
- **Responsiveness:** Usable on 320px up to desktop widths.
- **Keyboard accessibility:** All interactive elements reachable and operable via keyboard (Tab, Enter, Escape).
- **Error handling:** Clear UI states for network errors, empty results, and API failures.

**Out of scope for v1:** Audio playback, user accounts, favorites, pagination of albums, artist biographies, related artists, or persistent history.

## 3. Initial Stack

- **Markup:** Semantic HTML5 (no framework).
- **Styling:** Vanilla CSS3 with CSS Custom Properties, mobile-first media queries, and a single stylesheet.
- **Logic:** Vanilla JavaScript (ES modules, no build step).
- **Data:** Public Deezer API (v1 endpoints only).
- **Hosting:** GitHub Pages (deployed from `main` branch, `/root` folder).
- **Tooling:** `[FERRAMENTA_ESCOLHIDA]`

## 4. Stack Justification

The project is read-only, has three API calls total, and must live on GitHub Pages with zero backend. A framework would add dependencies and a build step for no structural benefit. Vanilla JS keeps the bundle nonexistent, the page loads fast on mobile networks, and deployment is a single `git push`. CSS custom properties handle theming without a preprocessor. The only external complexity is the Deezer CORS restriction, which we solve at the network layer rather than by adding a build tool.

**Navigation strategy:** View-toggling (show/hide `<section>` elements) rather than hash-based routing. This avoids history-state complexity, keeps the implementation framework-free, and is sufficient for three static views. The search input and results persist in memory when the user navigates to the album grid, so pressing "Back" does not trigger a re-fetch.

## 5. Implementation Plan

### Phase 0 — Project Skeleton & API Validation
**Objective:** Create the minimal project structure, confirm all three Deezer endpoints are reachable from a browser, and lock in the CORS proxy.

**Deliverables:**
- Directory structure: `css/`, `js/`, `assets/`.
- `index.html` with semantic shell (`<header>`, `<main>` with three `<section>` placeholders for search, grid, and detail), viewport meta tag, and links to `css/style.css` and `js/app.js` (as ES module).
- `css/style.css` with a minimal reset, CSS custom properties for colors/spacing, and system font stack.
- `js/app.js` as an empty ES module entry point.
- A standalone `test-api.html` with three manual buttons that trigger the required endpoints through the chosen proxy.
- A documented CORS workaround (public CORS proxy such as `corsproxy.io` or `allorigins.win`, with a note on rate limits).
- Decision log entry: proxy base URL and whether it is abstracted into a single `API_BASE` constant.

**Acceptance criteria:**
- [x] `index.html` loads without console errors in Chrome, Firefox, and Safari.
- [x] CSS custom properties render correctly at 320px and 1440px.
- [x] All three endpoints return valid JSON when called from `test-api.html` through the chosen proxy.
- [x] A fallback proxy URL is identified and documented (`api.allorigins.win`).
- [x] Response shapes are documented in `js/modules/api.js` comments.
- [x] No framework, bundler, or build file exists in the repository.

**Manual validation:**
1. Open `test-api.html` locally via static server.
2. Search for "Daft Punk", select artist ID `27`, fetch albums, fetch album detail `302127`.
3. Verify JSON contains expected fields: `name`, `picture_small` (artist); `title`, `cover_medium`, `release_date` (album list); `tracks.data[].title`, `tracks.data[].duration` (album detail).
4. Test on mobile data (not just Wi-Fi) to confirm latency is acceptable (< 3s for album detail).

**Definition of done:** `test-api.html` passes all checks, proxy URL is documented, and the project skeleton is clean.

**Risks & open decisions:**
- **Risk:** Public CORS proxies are unreliable or introduce latency. If a proxy fails during testing, the fallback is to evaluate a lightweight serverless wrapper (e.g., Cloudflare Worker), but that violates the "no backend" constraint and would require a decision to add a minimal proxy.
- **Decision:** `https://corsproxy.io/?` chosen as primary proxy. `api.allorigins.win` as fallback. Abstracted as `PROXY_BASE` constant in `js/modules/api.js`.

---

### Phase 1 — Artist Search
**Objective:** Implement the search input, artist results list, and the first view-transition.

**Deliverables:**
- `index.html` search section with a `<form>` containing a labeled `<input type="search">` and a submit `<button>`.
- `js/modules/api.js` — a module with `searchArtists(query)` that calls `GET /search/artist?q=...` and returns normalized data.
- `js/modules/search-view.js` — a module that renders the search form, handles submit, calls `api.js`, and renders up to 10 artist results.
- CSS for the search page and results list (mobile-first).
- Artist result item: name + thumbnail (`picture_small`), wrapped in a clickable `<button>`.

**Acceptance criteria:**
- [x] Typing an artist name and pressing Enter (or clicking the button) triggers exactly one API request.
- [x] Results render within 200ms of the response arriving.
- [x] Up to 10 artist results display, each with name and thumbnail.
- [x] Empty state: if `data.length === 0`, show "No artists found."
- [x] Error state: if fetch rejects or returns non-OK status, show "Something went wrong. Try again."
- [x] Loading state: button disabled and visually marked while fetching.
- [x] Input has an associated `<label>` (visually hidden or explicit), not just a `placeholder`.
- [x] Search results are stored in a module-level variable so navigating back from the album grid does not re-fetch.
- [x] Clicking an artist result hides the search section and shows the album-grid section.

**Manual validation:**
1. Search for "Radiohead" — expect results with artist ID `399`.
2. Search for gibberish ("xyz123abc") — expect empty state with message.
3. Disconnect Wi-Fi and search — expect error state with message.
4. Search for "Björk" and "Caetano Veloso" — verify diacritics do not break the request or the proxy.
5. Navigate entire flow using only Tab and Enter.
6. Throttle to "Slow 3G" in DevTools — confirm loading state appears before data.

**Definition of done:** A user can search, see results, and click an artist to move to the album grid. Empty and error states are visually distinct.

**Risks & open decisions:**
- **Risk:** Users may type diacritics or non-Latin characters; the API handles UTF-8, but the proxy might not URL-encode correctly. Test with "Björk" and "Mötorhead".
- **Decision:** Search on explicit submit only (no auto-search while typing) to avoid rate limits. Implemented in `js/modules/search-view.js`.

---

### Phase 2 — Album Grid
**Objective:** Display an artist's albums after selection, with a working "Back" button.

**Deliverables:**
- `js/modules/api.js` extended with `getArtistAlbums(artistId)` that calls `GET /artist/{id}/albums`.
- `js/modules/grid-view.js` — renders the album grid, receives an `artistId` and `artistName`.
- Album grid CSS: `display: grid` with `grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))`, gap `1rem`.
- Album card: cover image (`cover_medium`), album title, release year extracted from `release_date`. Each card is a `<button>`.
- A "Back to search results" `<button>` at the top of the grid section.

**Acceptance criteria:**
- [x] Clicking an artist from Phase 1 renders the album grid with the correct artist name as heading.
- [x] The grid lists all albums returned by the endpoint (no pagination in v1).
- [x] Each card shows cover image, title, and release year.
- [x] Each card is a `<button>` with `type="button"`, keyboard-focusable, and has visible title.
- [x] Cover images have `alt=""` (decorative, because the title is already visible).
- [x] Images use `loading="lazy"`.
- [x] Loading state appears while fetching albums.
- [x] Error state appears if the request fails.
- [x] Clicking "Back" returns to the search results section without re-fetching and restores focus to the previously selected artist item or the search input.
- [x] Grid displays 2 columns at 320px and 4–5 columns at 1440px without horizontal scroll.
- [x] Touch targets are at least 44×44px.

**Manual validation:**
1. Select "The Beatles" (ID `1`) — verify album grid loads with recognizable covers.
2. Confirm tab order moves left-to-right, top-to-bottom through cards.
3. Press "Back" — return to the same search results. Confirm the search input still contains the previous query.
4. Resize browser from 320px to 1440px — grid adapts without horizontal scroll.
5. Test on an actual mobile device — confirm touch targets feel natural.

**Definition of done:** A user can view an artist's full discography and return to search without data loss.

**Risks & open decisions:**
- **Risk:** The endpoint may return duplicate albums (different regions or re-releases). Display them as-is for v1; deduplication is out of scope.
- **Decision:** No prefetch of album detail data. Keep requests minimal. Implemented: no hover listeners or pre-fetching in `grid-view.js`.

---

### Phase 3 — Album Detail
**Objective:** Show full album information when a card is selected, with a working "Back" button.

**Deliverables:**
- `js/modules/api.js` extended with `getAlbum(albumId)` that calls `GET /album/{id}`.
- `js/modules/detail-view.js` — renders the album detail view.
- Album detail section: large cover (`cover_big` or `cover_xl`), title, release date formatted with `Intl.DateTimeFormat`, tracklist as an ordered list (`<ol>`).
- Track item: track number, title, duration formatted as `mm:ss` via a client-side utility function.
- A "Back to albums" `<button>` at the top of the detail section.

**Acceptance criteria:**
- [x] Clicking an album card hides the grid section and shows the detail section.
- [x] Tracklist renders in the exact order returned by the API.
- [x] Release date is human-readable (locale-aware via `Intl.DateTimeFormat`).
- [x] Durations are formatted as `mm:ss`.
- [x] Loading state appears while fetching.
- [x] Error state appears if the request fails.
- [x] Clicking "Back" returns to the album grid section without re-fetching albums and restores focus to the previously selected album card.
- [x] The view is fully keyboard-navigable.
- [x] Missing cover images show a CSS-generated placeholder (`detail-cover-placeholder`).
- [x] Missing track durations or titles render as "—".

**Manual validation:**
1. Open "Random Access Memories" (album ID `302127`) — verify 13 tracks, correct durations, release date formatted.
2. Open a single-track release — verify it renders correctly.
3. Use keyboard only: Tab to album card, Enter to open, Tab to Back button, Enter to return.
4. Test on actual mobile device (iOS Safari + Android Chrome) — touch targets are ≥ 44×44px.
5. Block image requests in DevTools — verify placeholder styling appears.

**Definition of done:** A user can open any album, read its tracklist, and return to the grid without data loss.

**Risks & open decisions:**
- **Risk:** Some albums have no cover image or missing metadata. Handle `null`/`undefined` fields gracefully.
- **Decision:** Client-side duration formatting with a small utility function in `js/modules/utils.js`.

---

### Phase 4 — Polish & Accessibility
**Objective:** Make the site robust, accessible, and visually consistent before release.

**Deliverables:**
- Focus-visible styles (`:focus-visible`) for all interactive elements; remove default outlines only when `focus-visible` is supported.
- An `aria-live="polite"` region inside `<main>` for search results and error messages.
- A skip-to-content link (`<a href="#main-content">`) as the first focusable element.
- `prefers-reduced-motion` media query: disable transitions/animations if the user prefers reduced motion.
- A loading spinner or skeleton state for all async transitions (search, grid, detail).
- Favicon and basic meta tags (`description`, `theme-color`).
- A `.gitignore` file ignoring OS files (`.DS_Store`) and editor folders (`.vscode/` unless committed intentionally).
- Removal of `test-api.html` if it is no longer needed.

**Acceptance criteria:**
- [ ] Lighthouse accessibility score ≥ 90 (tested in Chrome DevTools, mobile emulation).
- [ ] No horizontal scroll on any screen width ≥ 320px.
- [ ] Color contrast ratio ≥ 4.5:1 for all body text and UI labels.
- [ ] All images have `alt` text or are explicitly marked decorative.
- [ ] Focus indicators are clearly visible (minimum 2px outline or equivalent).
- [ ] Total size of `css/style.css` + `js/app.js` + all modules < 50KB uncompressed.
- [ ] Zero external font requests (system font stack only).
- [ ] `test-api.html` is removed from the deployed root (keep in a `archive/` folder or delete).

**Manual validation:**
1. Run Lighthouse in Chrome DevTools (mobile emulation) — verify accessibility score.
2. Navigate the entire app with keyboard only — no focus traps, logical flow.
3. Test with macOS VoiceOver: search, select artist, select album, read tracklist.
4. Test on slow 3G throttling — loading states appear within 100ms of interaction.
5. Enable "Reduce motion" in OS settings — confirm no animations run.

**Definition of done:** The site passes Lighthouse, works with a screen reader, and feels polished on real devices.

**Risks & open decisions:**
- **Risk:** Deezer images may fail to load (hotlink protection, 404). CSS fallback background color and an `onerror` handler hide broken images cleanly.
- **Decision:** Single light theme for v1. Dark mode is out of scope.

---

### Phase 5 — GitHub Pages Deployment
**Objective:** Publish the site and verify it works in production.

**Deliverables:**
- Repository configured for GitHub Pages (`Settings > Pages > Source: Deploy from a branch, main, /root`).
- `README.md` updated with the live URL and a one-line description.
- Final repository audit: only necessary files in root (`index.html`, `css/`, `js/`, `assets/`, `README.md`, `.gitignore`, `PLAN.md`, `AGENTS.md`).
- End-to-end validation of all three user flows on the live URL.

**Acceptance criteria:**
- [ ] Site loads over HTTPS with no mixed-content warnings.
- [ ] Search, album grid, and album detail work on a mobile device using the live URL.
- [ ] CORS proxy works from an external network (not just the developer's Wi-Fi).
- [ ] No `test-api.html` or temporary files in the deployed root.
- [ ] All internal paths are relative and resolve correctly under `/<repo-name>/`.

**Manual validation:**
1. Visit live URL on iPhone Safari — search for an artist, complete the flow.
2. Visit live URL on desktop Firefox — repeat, verify keyboard navigation.
3. Share URL with someone on a different network — confirm it loads.
4. Run Lighthouse on the live URL — confirm accessibility score still ≥ 90.

**Definition of done:** The site is live, passes all manual checks, and the repository is clean.

**Risks & open decisions:**
- **Risk:** GitHub Pages caches aggressively; proxy URL changes may take minutes to propagate.
- **Decision:** No custom domain for v1. URL: `https://<user>.github.io/deezer-explorer`.

## 6. GitHub Pages Notes

- Deployment is automatic on push to `main`.
- Because there is no build step, the repository root is the deploy root.
- Ensure all internal paths are relative (`./css/style.css`, `./js/app.js`) so they work under the repository pathname.
- The site will be served over HTTPS; ensure the CORS proxy and Deezer images also use HTTPS to avoid mixed-content blocking.
- If a custom domain is added later, update the `<base>` tag or absolute paths accordingly.

## 7. Out of Scope (For Now)

- Audio preview or full-track playback.
- Pagination, infinite scroll, or "load more" for albums.
- Searching for albums or tracks directly (artist search only).
- Artist detail page (bio, fans count, etc.).
- Favorites, playlists, or any user state.
- Service Worker / offline support.
- Unit or E2E tests (manual validation only for v1).
- Frameworks (React, Vue, Svelte) or CSS preprocessors.
- A custom backend, serverless functions, or database.
