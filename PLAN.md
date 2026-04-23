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

## 5. Implementation Plan

### Phase 0 — API Validation & CORS Strategy
**Objective:** Confirm we can reliably call the three required Deezer endpoints from a browser, and decide how to handle CORS.

**Deliverables:**
- A standalone `test-api.html` file with three manual buttons that trigger the required endpoints.
- A documented CORS workaround (most likely a public CORS proxy such as `corsproxy.io` or `allorigins.win`, with a note on rate limits).
- A decision log entry in this plan.

**Acceptance criteria:**
- All three endpoints return valid JSON when called from the test file in Chrome, Firefox, and Safari.
- A fallback proxy URL is identified if the primary proxy rate-limits or blocks requests.
- Response shapes are documented (artist object, album list, album detail).

**Manual validation:**
1. Open `test-api.html` locally.
2. Search for "Daft Punk", select artist ID, fetch albums, fetch album detail.
3. Verify JSON structure matches expectations.
4. Test with mobile data (not just Wi-Fi) to confirm latency is acceptable.

**Risks & open decisions:**
- **Risk:** Public CORS proxies are unreliable or introduce latency. If a proxy fails during testing, the fallback is to evaluate a lightweight serverless wrapper (e.g., Cloudflare Worker), but that violates the "no backend" constraint and would require a decision to add a minimal proxy.
- **Decision:** Which exact proxy base URL to use, and whether to abstract it into a single `API_BASE` constant.

---

### Phase 1 — Artist Search
**Objective:** Implement the search input and artist results list.

**Deliverables:**
- `index.html` with a search form (input + submit button).
- JavaScript module to call `GET /search/artist?q=...` and render results.
- Basic CSS for the search page and results list.

**Acceptance criteria:**
- Typing an artist name and pressing Enter (or clicking the button) fetches and displays up to 10 artist results.
- Each result shows the artist name and a thumbnail image.
- Empty state: if no results, show "No artists found."
- Error state: if the request fails, show "Something went wrong. Try again."
- Input is accessible with a proper `<label>` and focus styles.

**Manual validation:**
1. Search for "Radiohead" — expect results with Thom Yorke’s band.
2. Search for gibberish ("xyz123abc") — expect empty state.
3. Disconnect Wi-Fi and search — expect error state.
4. Navigate entire flow using only Tab and Enter.

**Risks & open decisions:**
- **Risk:** Users may type diacritics or non-Latin characters; the API handles UTF-8, but the proxy might not URL-encode correctly. Must test with "Björk" and "Mötorhead".
- **Decision:** Debounce strategy for the search input (immediate on Enter vs. auto-search while typing). Decision: only search on explicit submit to avoid hitting rate limits.

---

### Phase 2 — Album Grid
**Objective:** Display an artist’s albums after selection.

**Deliverables:**
- JavaScript module to call `GET /artist/{id}/albums`.
- Album grid component (CSS Grid, 2 columns on mobile, 3–4 on desktop).
- Album card component: cover image (medium size), album title, release year.
- A "Back to search results" button.

**Acceptance criteria:**
- Clicking an artist from Phase 1 navigates to the album grid.
- The grid lists all albums returned by the endpoint (Deezer returns ~50–100 for popular artists).
- Each card is a clickable `<button>` or `<a>` for keyboard accessibility.
- Images have `alt` text (album title).
- Loading state while fetching albums.

**Manual validation:**
1. Select "The Beatles" — verify album grid loads with recognizable covers.
2. Confirm tab order moves left-to-right, top-to-bottom through cards.
3. Press "Back" — return to the same search results without re-fetching.
4. Resize browser from 320px to 1440px — grid adapts without horizontal scroll.

**Risks & open decisions:**
- **Risk:** The endpoint may return duplicate albums (different regions or re-releases). We will display them as-is for v1; deduplication is out of scope.
- **Decision:** Whether to prefetch album detail data when hovering a card. Decision: no prefetch in v1 to keep requests minimal.

---

### Phase 3 — Album Detail
**Objective:** Show full album information when a card is selected.

**Deliverables:**
- JavaScript module to call `GET /album/{id}`.
- Album detail view: large cover, title, release date (formatted as `DD/MM/YYYY` or locale-aware), tracklist table/list.
- Track display: track number, title, duration (formatted as `mm:ss`).
- A "Back to albums" button.

**Acceptance criteria:**
- Clicking an album card opens the detail view.
- Tracklist renders in correct order.
- Dates and durations are human-readable.
- The view is fully keyboard-navigable (Tab through tracks, Enter or Escape to go back).
- Loading and error states are handled.

**Manual validation:**
1. Open a well-known album (e.g., "Random Access Memories") — verify 13 tracks, correct durations, release date `17/05/2013`.
2. Open an album with 1 track (single) — verify it still renders correctly.
3. Use keyboard only: Tab to album card, Enter to open, Tab through tracks, click Back.
4. Test on actual mobile device (iOS Safari + Android Chrome) — touch targets are ≥ 44×44px.

**Risks & open decisions:**
- **Risk:** Some albums have no cover image or missing metadata. Must handle null/undefined fields gracefully (placeholder text/image).
- **Decision:** Whether to format durations on the client or trust the API. Decision: client-side formatting with a small utility function.

---

### Phase 4 — Polish & Accessibility
**Objective:** Make the site robust, accessible, and visually consistent before release.

**Deliverables:**
- Focus-visible styles for all interactive elements.
- `aria-live` region for search results and error messages.
- Skip-to-content link (optional but recommended for keyboard users).
- Reduced-motion media query support.
- A simple "loading" spinner or skeleton state for all async transitions.
- Favicon and basic meta tags (viewport, description).
- A single CSS reset/normalize block.

**Acceptance criteria:**
- Lighthouse accessibility score ≥ 90.
- No horizontal scroll on any screen width ≥ 320px.
- Color contrast ratio ≥ 4.5:1 for body text.
- All images have meaningful `alt` text or are marked decorative.
- Focus indicators are clearly visible.

**Manual validation:**
1. Run Lighthouse in Chrome DevTools (mobile emulation).
2. Navigate entire app with keyboard only — no traps, logical flow.
3. Test with macOS VoiceOver or NVDA: search, select artist, select album, read tracklist.
4. Test on slow 3G throttling in DevTools — loading states appear promptly.

**Risks & open decisions:**
- **Risk:** Deezer images may fail to load (hotlink protection, 404). Need a CSS fallback background color and an `onerror` handler to hide broken images.
- **Decision:** Final color palette and font choice. Decision: system font stack to avoid external font requests; dark/light mode optional for v1 (single theme).

---

### Phase 5 — GitHub Pages Deployment
**Objective:** Publish the site and verify it works in production.

**Deliverables:**
- Repository configured for GitHub Pages (`Settings > Pages > Source: Deploy from a branch, main, /root`).
- A `README.md` with the live URL and a one-line description.
- A final end-to-end check of all three user flows.

**Acceptance criteria:**
- Site loads over HTTPS.
- Search, album grid, and album detail work on a mobile device using the live URL.
- No mixed-content warnings (all images loaded over HTTPS).
- Repository root contains only the necessary files (`index.html`, `css/`, `js/`, `assets/`, `README.md`).

**Manual validation:**
1. Visit live URL on iPhone Safari — search for an artist, complete the flow.
2. Visit live URL on desktop Firefox — repeat, verify keyboard navigation.
3. Share URL with someone on a different network — confirm it loads (validates CORS proxy works externally).

**Risks & open decisions:**
- **Risk:** GitHub Pages caches aggressively; if we need to update the CORS proxy URL, changes may take minutes to propagate.
- **Decision:** Whether to use a custom domain. Decision: no custom domain for v1; use `https://<user>.github.io/deezer-explorer`.

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
