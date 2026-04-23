# Deezer Explorer

> A static, mobile-first website for browsing artist discographies using the public Deezer API.

## Live site

🌐 [https://baltazarparra.github.io/deezer-explorer/](https://baltazarparra.github.io/deezer-explorer/)

## What this project is

Deezer Explorer is a client-side-only web application that lets you search for an artist by name, view their albums in a responsive grid, and open any album to see its full tracklist, release date, and cover art. There is no backend, no user authentication, and no database. Everything runs in the browser and fetches data directly from Deezer's public API.

## What v1 will deliver

- **Artist search:** Type a name and get a list of matching artists with thumbnails.
- **Album grid:** Select an artist to see their discography as a grid of cards with cover art, title, and release year.
- **Album detail:** Open an album to view its tracklist (track number, title, duration), a larger cover image, and the exact release date.
- **Navigation:** Move back from album detail to the grid, and from the grid back to search results.
- **Responsiveness & accessibility:** Mobile-first layout (320px and up) and full keyboard navigation support.

**Not in v1:** Audio playback, pagination, user accounts, favorites, artist biographies, or offline support.

## Main user flow

1. Open the site.
2. Type an artist name and submit the search.
3. Pick an artist from the results.
4. Browse their albums in a grid.
5. Click an album to open its detail view.
6. Review the tracklist, release date, and cover art.

## Core Deezer API endpoints

| Purpose | Endpoint |
|---------|----------|
| Search artists | `GET /search/artist?q={name}` |
| List artist albums | `GET /artist/{id}/albums` |
| Get album details | `GET /album/{id}` |

All data is read-only and comes from the public Deezer API v1.

## Stack

- **Markup:** Semantic HTML5 (no framework).
- **Styling:** Vanilla CSS3 with CSS Custom Properties, mobile-first media queries, single stylesheet.
- **Logic:** Vanilla JavaScript (ES modules, no build step).
- **Hosting:** GitHub Pages (deployed from the `main` branch root).
- **Tooling:** `[FERRAMENTA_ESCOLHIDA]`

This stack was chosen because the project is read-only, has only three API calls, and must deploy to GitHub Pages with zero backend. A framework would add dependencies and a build step without structural benefit.

## Current status

v1 is deployed and live on GitHub Pages. All three user flows (search, album grid, album detail) are implemented and functional. The site is mobile-first, keyboard-accessible, and has no build step.

## Local development

Because there is no build step, local development is straightforward:

1. Clone the repository:
   ```bash
   git clone https://github.com/[NOME_DO_REPO].git
   cd deezer-explorer
   ```

2. Serve the files with any static server. For example:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```

3. Open the local URL in your browser.

All paths in the project are relative so the site works both locally and under the GitHub Pages pathname.

## GitHub Pages deployment

The site will be published automatically from the root of the `main` branch:

1. Go to **Settings > Pages** in this repository.
2. Set **Source** to "Deploy from a branch".
3. Select the `main` branch and the `/root` folder.
4. Push changes to `main`. GitHub Pages will build and publish the site within a minute or two.

The live URL will be: `https://<user>.github.io/deezer-explorer`

All internal assets use relative paths (`./css/style.css`, `./js/app.js`) so they resolve correctly under the repository pathname. All external resources (API proxy and images) must use HTTPS to avoid mixed-content blocking.

## Known risks and limitations

- **CORS:** The Deezer API does not send CORS headers for direct browser requests. We will rely on a public CORS proxy (e.g., `corsproxy.io` or `allorigins.win`). Public proxies can be rate-limited, slow, or temporarily unavailable. If this becomes a blocker, we may need to evaluate a minimal serverless proxy, which would slightly change the "no backend" constraint.
- **Image availability:** Deezer album covers are hotlinked. Some images may fail to load due to 404s or restrictions. The UI must handle missing images gracefully.
- **API limits:** The public Deezer API is free but offers no SLA. Unexpected downtime or rate limiting would affect the site directly.
- **No state persistence:** Search history, scroll position, and navigation state are not saved. Refreshing the page returns the user to the initial search screen.
- **GitHub Pages caching:** Updates may take a few minutes to propagate after a push.

See `PLAN.md` for the full phased implementation plan, including acceptance criteria and manual validation steps for each phase.
