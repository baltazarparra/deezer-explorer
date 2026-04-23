# Agent Operations Guide — Deezer Explorer

## Project Overview

Deezer Explorer is a static, mobile-first website that searches for artists via the public Deezer API, displays their discography as album cards, and opens an album detail view with tracklist, release date, and cover art. It is client-side only: no backend, no authentication, no database, no build step. It deploys to GitHub Pages.

**Current state:** The repository contains `PLAN.md` and `README.md`. No implementation has started. There is no `index.html`, no CSS, no JavaScript, and no deployed site.

## v1 Objectives & Scope

- Search for artists by name and display matching results.
- Select an artist to view their albums in a responsive grid.
- Open an album to see its tracklist, release date, and cover art.
- Navigate back from album detail → album grid → search results.
- Support mobile (320px+) up to desktop, with full keyboard accessibility.
- Handle empty results, network errors, and missing API data gracefully.

**Out of scope:** Audio playback, pagination, user accounts, favorites, artist biographies, offline support, frameworks, CSS preprocessors, backend of any kind.

## Source-of-Truth Files

These files are the primary reference for all decisions. Read them before proposing changes.

| File | Purpose |
|------|---------|
| `PLAN.md` | Phased implementation plan, acceptance criteria, risks, and open decisions for each phase. |
| `README.md` | Project description, stack, local dev instructions, deployment steps, known risks, and immediate next steps. |
| `AGENTS.md` | This file. Operational rules for how the agent should work in this repository. |

**Rule:** Before writing or modifying code, check `PLAN.md` to confirm which phase is being worked on and what the acceptance criteria are. Before changing scope or stack, check `README.md` to ensure consistency with documented decisions.

## How to Use PLAN.md and README.md

1. **Before starting work:** Read the relevant phase in `PLAN.md`. Note the deliverables, acceptance criteria, and manual validation steps.
2. **Before proposing architectural changes:** Check `README.md` for the chosen stack and known risks. If a change contradicts the documented stack or scope, flag it to the user instead of silently implementing it.
3. **After completing a phase:** Update `PLAN.md` to mark decisions as resolved (e.g., proxy URL chosen, routing strategy decided). Update `README.md` if the live URL, stack, or setup instructions change.
4. **Never assume scope expansion is approved.** If a feature is not in `PLAN.md` Section 2 (v1 Scope) or `README.md` "What v1 will deliver," ask before implementing it.

## Project Commands

There is no build system, no package manager, and no test runner configured yet. The project is vanilla HTML/CSS/JS.

**Local development:**
```bash
# Serve the repository root with any static file server
npx serve .
# or
python3 -m http.server 8000
```

**Deployment:** Push to `main`. GitHub Pages deploys automatically from the repository root. There is no build command.

If a build step, package manager, or test runner is introduced later, document the commands here and update `README.md` accordingly. Do not add one without explicit user approval.

## Quality & Validation Standards

- **Mobile-first CSS:** Write base styles for the smallest viewport first. Use media queries for larger breakpoints only.
- **Semantic HTML:** Use correct elements (`<button>` for actions, `<a>` for navigation, `<form>` for search). Do not use `<div>` for interactive elements.
- **Keyboard accessibility:** Every interactive element must be reachable with `Tab` and activatable with `Enter` or `Space`. Ensure focus order is logical and visible.
- **Relative paths only:** All internal asset paths (`css/`, `js/`, `assets/`) must be relative so they work both locally and under the GitHub Pages pathname.
- **HTTPS only:** All external requests (API proxy, images) must use `https://` to avoid mixed-content blocking on GitHub Pages.
- **Error handling:** Every API call must have a `catch` path that renders a human-readable message in the UI. Never leave the user with a blank screen or an unhandled console error.
- **Image fallbacks:** Album cover images must have `alt` text and a visual fallback if the image fails to load.

## Updating PLAN.md and README.md

When a decision is made or a risk is resolved, update the source-of-truth files immediately. Do not let the documentation drift from the code.

- **Proxy URL chosen?** Update `PLAN.md` Phase 0 and `README.md` Known Risks.
- **Routing strategy decided (hash vs. view toggle)?** Update `PLAN.md` Phase 1 / Phase 3 and `README.md` Current Status / Immediate Next Steps.
- **Phase completed?** Update `PLAN.md` to mark it done and note any deviations from the original plan.
- **Stack change?** Update `README.md` Stack section and `PLAN.md` Initial Stack. This requires user confirmation first.
- **New risk discovered?** Add it to `PLAN.md` (in the relevant phase) and `README.md` Known Risks.

## Small-Phase Rule

Propose and implement work in the smallest testable unit that matches a single phase (or a subset of a phase) from `PLAN.md`. Do not jump ahead. Specifically:

- Do not build the album grid (Phase 2) before the search form works (Phase 1).
- Do not add accessibility polish (Phase 4) before the core views exist (Phases 1–3).
- Do not configure GitHub Pages deployment (Phase 5) before there is a working `index.html`.
- If a phase has multiple deliverables, it is acceptable to split them into smaller PRs or commits, but do not start a later phase until the current one meets its acceptance criteria.

After finishing a chunk of work, verify it against the manual validation steps listed in `PLAN.md` for that phase.

## What Not to Invent, Alter, or Assume

**Do not add without explicit user approval:**
- A backend, serverless function, database, or authentication system.
- A JavaScript framework (React, Vue, Svelte, etc.) or CSS preprocessor (Sass, Less).
- A build tool or bundler (Vite, Webpack, Rollup, Parcel).
- A package manager file (`package.json`, `requirements.txt`, etc.).
- Unit tests, E2E tests, or a testing framework (the plan specifies manual validation only for v1).
- Audio playback, pagination, favorites, user accounts, or any feature listed in `PLAN.md` Section 7 (Out of Scope).
- A custom domain for GitHub Pages.

**Do not assume:**
- That a CORS proxy works without testing it first. Always verify the proxy in `test-api.html` or the live site before moving to the next phase.
- That Deezer API responses are always complete. Always handle missing fields (`null` cover, empty tracklist).
- That the user wants to skip a phase. If a phase seems unnecessary, ask before skipping it.

**Do not alter:**
- The stack documented in `PLAN.md` and `README.md` without updating both files and confirming with the user.
- The scope of v1 without documenting the change in `PLAN.md` and `README.md`.

## Emergency CORS Fallback

If the primary public CORS proxy stops working during development:
1. Test the fallback proxy immediately.
2. If both fail, pause and report to the user. Do not silently add a Cloudflare Worker, serverless function, or any backend component without explicit approval.
