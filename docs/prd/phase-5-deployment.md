# Phase 5 PRD — GitHub Pages Deployment

## Goal

Publish the Deezer Explorer site to GitHub Pages and verify it works correctly in production on real devices and external networks. The repository must be clean, the README must document the live URL, and all three user flows must pass end-to-end on the deployed site.

## Scope

- **GitHub Pages configuration:** Enable Pages in repository settings (`Source: Deploy from a branch`, `main`, `/root`).
- **Git commit & push:** Stage all changes from Phases 0–4, write a descriptive commit message, and push to `origin/main`.
- **README update:** Add the live URL to `README.md`, update the "Current status" section, and remove stale references to unimplemented phases.
- **Repository audit:** Confirm only necessary files exist in the repository root.
- **Live URL validation:** Test search → grid → detail flow on the deployed site.
- **CORS proxy external network test:** Verify the proxy works from a different network than the developer's.
- **Cross-browser smoke test:** iOS Safari, Android Chrome, desktop Firefox.

## Out of Scope

- Custom domain (v1 uses the default `github.io` subdomain).
- Service Worker or offline support.
- Analytics, SEO beyond basic meta tags, or search engine indexing.
- Automated CI/CD pipeline (GitHub Pages auto-deploys on push; no additional workflow needed).

## Prerequisites (must be complete before starting)

| Item | Status | Evidence |
|------|--------|----------|
| Phase 4 criteria met | Required | All acceptance criteria from Phase 4 PRD satisfied |
| `index.html` has relative paths only | Required | `./css/style.css`, `./js/app.js`, `./assets/favicon.svg` |
| No `test-api.html` in root | Required | File removed or moved to `archive/` |
| `.gitignore` ignores temp files | Required | `.DS_Store`, `.vscode/`, `node_modules/` |
| Size budget < 50 KB | Required | `wc -c css/style.css js/app.js js/modules/*.js` |
| All assets load over HTTPS | Required | Deezer images and proxy URLs use `https://` |

## Deliverables

### 5.1 GitHub Pages Settings

1. Open the repository on GitHub.
2. Navigate to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Select branch: `main`.
5. Select folder: `/root`.
6. Click **Save**.
7. Wait for the first deployment (GitHub shows a green checkmark or the URL under the Pages settings).

**Expected live URL:** `https://<github-username>.github.io/deezer-explorer/`

### 5.2 Git Commit

Stage and commit all changes from Phases 0–4 with a single descriptive commit:

```bash
git add -A
git commit -m "feat: complete v1 — artist search, album grid, album detail, accessibility polish

- Search artists via Deezer API with loading/error/empty states
- Album grid with responsive CSS grid and back navigation
- Album detail with tracklist, formatted dates, and durations
- Fixed aria-live region, prefers-reduced-motion, focus-visible
- Favicon, meta tags, OG tags, and spinner loading states
- Remove test-api.html, update .gitignore"
```

Then push:

```bash
git push origin main
```

### 5.3 README Update

Update `README.md` with the following changes:

1. **Add live URL badge/link** near the top, under the project description:
   ```markdown
   ## Live site

   🌐 [https://<github-username>.github.io/deezer-explorer/](https://<github-username>.github.io/deezer-explorer/)
   ```

2. **Update "Current status" section** to reflect that v1 is deployed:
   ```markdown
   ## Current status

   v1 is deployed and live on GitHub Pages. All three user flows (search, album grid, album detail) are implemented and functional. The site is mobile-first, keyboard-accessible, and has no build step.
   ```

3. **Remove or update "Immediate next steps" section** — replace with a "Completed" or "Roadmap" note. For v1, simply remove the "Immediate next steps" section since all phases are done.

4. **Keep all other sections** (What this project is, What v1 will deliver, Main user flow, Core API endpoints, Stack, Local development, Known risks) unchanged unless they contain stale references.

### 5.4 Repository Audit Checklist

After commit and push, verify the repository contains **only** the following in the root:

```
✅ index.html
✅ css/
   ✅ style.css
✅ js/
   ✅ app.js
   ✅ modules/
      ✅ api.js
      ✅ search-view.js
      ✅ grid-view.js
      ✅ detail-view.js
      ✅ utils.js
✅ assets/
   ✅ favicon.svg
✅ README.md
✅ PLAN.md
✅ .gitignore
✅ LICENSE
```

**Must NOT be in root:**
- ❌ `test-api.html`
- ❌ `.DS_Store`
- ❌ `.vscode/` (unless intentionally committed)
- ❌ `node_modules/`
- ❌ Any build artifacts or temp files

### 5.5 Live URL Validation

Wait up to 2 minutes after push for GitHub Pages to deploy (first deploy may take longer). Then perform the following on the live URL:

#### Test 1 — Desktop Chrome (primary)
1. Open `https://<user>.github.io/deezer-explorer/`.
2. Verify favicon loads (no 404 in Network tab).
3. Search for **"Daft Punk"**.
4. Select the artist result.
5. Verify album grid loads with covers.
6. Select **"Random Access Memories"** (or any album with tracks).
7. Verify tracklist, release date, and cover art render.
8. Click **Back to albums** — return to grid.
9. Click **Back to search results** — return to search.
10. Run **Lighthouse** (mobile emulation) — verify accessibility score ≥ 90.

#### Test 2 — iOS Safari (mobile)
1. Open the live URL on an iPhone.
2. Search for **"The Beatles"**.
3. Complete the full flow: search → artist → album grid → album detail → back.
4. Verify no horizontal scroll.
5. Verify touch targets feel natural (≥ 44×44 px).

#### Test 3 — Android Chrome (mobile)
1. Repeat the same flow as iOS Safari.
2. Verify images load and the spinner appears briefly.

#### Test 4 — Desktop Firefox (keyboard)
1. Open the live URL in Firefox.
2. Press **Tab** — skip link should appear.
3. Tab through the entire flow without using a mouse.
4. Verify focus is restored correctly on Back navigation.

### 5.6 CORS Proxy External Network Test

The CORS proxy must work from networks other than the developer's Wi-Fi.

1. Share the live URL with someone on a different network (mobile data, different ISP, etc.).
2. Ask them to search for an artist and open an album.
3. If no one is available, test yourself by:
   - Disconnecting from Wi-Fi and using mobile data tethering.
   - Or using a VPN to change your apparent network location.
4. Confirm that all three API calls succeed and data renders.

If the proxy fails:
- Check if `corsproxy.io` is rate-limiting or down.
- Switch to the fallback proxy (`api.allorigins.win`) by updating `PROXY_BASE` in `js/modules/api.js` and pushing a fix.

## Acceptance Criteria

- [ ] GitHub Pages is enabled and the live URL is reachable over HTTPS.
- [ ] `README.md` contains the live URL and an accurate "Current status" section.
- [ ] All three user flows (search → grid → detail → back) work on the live URL.
- [ ] Lighthouse accessibility score ≥ 90 on the live URL (mobile emulation).
- [ ] CORS proxy works from an external network (mobile data or different ISP).
- [ ] No `test-api.html` or temporary files in the deployed root.
- [ ] All internal paths are relative and resolve correctly under `/<repo-name>/`.
- [ ] No mixed-content warnings (all external resources use HTTPS).
- [ ] Repository root contains only necessary files (see audit checklist).
- [ ] A descriptive commit message documents all v1 features.

## Manual Validation Summary

| Test | Device / Browser | Expected Result |
|------|-----------------|-----------------|
| Search + grid + detail | Desktop Chrome | Flow completes, no console errors |
| Search + grid + detail | iOS Safari | Flow completes, no horizontal scroll |
| Search + grid + detail | Android Chrome | Flow completes, images load |
| Keyboard navigation | Desktop Firefox | Tab order logical, no focus traps |
| Lighthouse audit | Desktop Chrome | Accessibility ≥ 90 |
| CORS proxy | External network | API calls succeed, data renders |
| Favicon | Any browser | 200 OK, no 404 |

## Risks / Open Questions

- **GitHub Pages caching:** Updates may take 1–5 minutes to propagate after push. If the site looks stale, hard-refresh or check the commit hash in the Network tab response headers.
- **CORS proxy reliability:** Public proxies (`corsproxy.io`) may change their URL structure, add rate limits, or become unavailable. The fallback proxy (`api.allorigins.win`) is documented but has not been tested in production. If both fail, the site will show error states; this is a known limitation of v1.
- **Deezer API changes:** Deezer may change response shapes or rate limits without notice. The site handles HTTP errors gracefully but cannot compensate for API downtime.
- **Repository visibility:** GitHub Pages for public repositories is free. If the repository is private, GitHub Pro or Team is required. This PRD assumes a public repository.

## Post-Deployment (Optional)

After deployment, consider:
- Adding the live URL to the repository's **About** section on GitHub.
- Pinning the repository on your GitHub profile.
- Sharing the URL for feedback.
