# Taren 2.0 — Phase 0 audit

Date: 2026-11-18 · Branch: `feature/taren-2.0` · Baseline commit: `b4b001d33e5f4347ac4c8ae9fb5850a9b56e2555` (identical to `origin/main`, the commit live on taren.se, build 129).

## 1. Repository

| Item | Finding |
|---|---|
| Root | `/` of `Jimmy7610/taren` (public repository) |
| Default / production branch | `main` |
| Remote | `origin` → `https://github.com/Jimmy7610/taren` |
| Working tree at audit time | clean |
| Size | 397 tracked files, ~31 MB |
| Stack | Hand-written HTML/CSS/JS, no package.json, no build step |
| CI | None (`.github/` does not exist) |

### Contents

- `index.html`, `about/`, `games/` (25 browser games + gallery), `experiments/` (2), `templates/game-template/`
- `assets/` — shared CSS/JS, `build.js` build badge (build 129), 26 game thumbnails
- `public/parakollen/` — **separate application** (Paralympics 2026 tracker), served live at `https://taren.se/public/parakollen/`
- `public/ninefold/` — separate game, served at `/public/ninefold/`
- `public/_redirects` — `/* /index.html 200` (inert: it sits in `public/`, not the output root)
- `functions/` — Cloudflare Pages Functions:
  - `[[path]].ts` — catch-all that serves `/index.html` for any unknown path (soft 404) and for `/admin*`
  - `api/event.ts` + `api/admin/*` — analytics ingestion + dashboard API on a D1 binding `DB`
  - `parakollen/api/*` — API for Parakollen
- `workers/taren-analytics/` — separate Worker (`wrangler.toml`, D1 migration)
- `docs/` — game standards and audits, `.agent/` — agent tooling, `.vs/` — Visual Studio metadata

## 2. Deployment (verified read-only against the live site)

| Check | Result |
|---|---|
| Host | Cloudflare Pages (response headers `server: cloudflare`, Pages Functions present; README: "Deployed via Cloudflare Pages from the `main` branch") |
| Build output directory | Repository root (`/public/parakollen/` is served at that literal path) |
| Build command | None |
| Unknown paths | `200` with the homepage (soft 404 via `functions/[[path]].ts`) |
| Custom domain | `taren.se` (DNS/dashboard settings not accessible from this session — **not verified**) |
| Environment variables / bindings | D1 binding `DB` referenced by functions; values not in the repo and not accessible. No secrets found in tracked files. |
| Headers | `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `access-control-allow-origin: *`, `cache-control: max-age=0` |

## 3. Brand assets

The directive expects `taren-logo-dark.png`, `taren-logo-light.png`, `taren-logo-black.png`, `taren-icon.png`.
**None exist in this repository or its history.** A search of the owner's other repositories did not locate them either.

Decision: the official T symbol is **not** recreated or approximated. The new site uses an interim *typographic* wordmark (the word TAREN set in the site typeface) and an interim letter-T favicon, isolated in one component (`BrandMark`) and one folder (`site/src/assets/brand/`) so the official files can be dropped in. This is a release blocker for owner review (see `RELEASE_CHECKLIST.md`).

**Update 2026-11-18:** the owner uploaded the official files to `site/public/branding/`; they now replace the interim branding (see `DESIGN_SYSTEM.md → Brand assets`).

## 4. Product evidence

| Candidate | Evidence | Decision |
|---|---|---|
| **PulseGarden** (`Jimmy7610/PulseGarden`, private repo) | Godot 4 project, README status: M0–M3 done, playable on desktop, iOS export prepared, **not built or tested on any iPhone**, no TestFlight/App Store link. Owner-prepared landing page with **real in-game captures** (786×1704 WebP, rendered by Godot), app icon (1024²), OG image. | **Published** as `in-development`, featured. Only facts stated in its README/docs. No download link, no repository link (repo is private). |
| ZAPIO, RingOS, Lumen Capture, others | Private or unverified; no approved public material reviewed | **Not published.** Names are not committed to this public repository. |

Old browser games: **excluded** from the new site entirely (directive §1).

## 5. Selected architecture

- New site lives in **`site/`**, an isolated Astro project. Legacy files at the repo root are untouched, so `main` and production keep working exactly as today until the owner switches the Pages build settings.
- Astro 7 (static output, no SSR adapter), TypeScript strict, Tailwind CSS 4 with custom tokens, Content Collections for products, self-hosted variable fonts, `astro:assets` for AVIF/WebP.
- Zero framework hydration. Small vanilla scripts only for the mobile menu and reveal-on-scroll.
- Tests: Vitest (schema, visibility, config, sitemap, legacy-route handler, components via the Astro container API), Playwright + axe-core (routes, navigation, viewports 320–1920, keyboard, reduced motion, console errors, overflow), Lighthouse.
- CI: GitHub Actions workflow scoped to `site/**`.
- Cloudflare **Pages remains** the host; a Workers migration is not warranted (the site is fully static; only legacy-route 410 handling needs a tiny Pages Function).

## 6. Migration risks

| Risk | Impact | Mitigation |
|---|---|---|
| Cutover requires changing Pages settings (root `site`, build `npm ci && npm run build`, output `dist`) | Production build breaks if misconfigured | Documented step-by-step in `DEPLOYMENT.md`; verify on a preview deployment first |
| `public/parakollen/`, `public/ninefold/`, `functions/parakollen/*` are live, unrelated apps | They stop being served when the Pages root moves to `site/` | **Owner decision required** before cutover: move Parakollen to its own Pages project (it already has its own repo) or keep them under the new root. Not migrated silently. |
| `functions/api/*` analytics + D1 binding | Stops working at cutover | New site sends no analytics; the endpoints are unused by current client code (no caller of `/api/event` found) |
| **Security:** `/api/admin/*` returns analytics data without authentication (verified: `GET /api/admin/overview` → 200 JSON) | Data exposure (low sensitivity, aggregate counts) | Out of scope for this branch; flagged for the owner. Removed automatically at cutover. |
| Legacy URLs indexed by search engines (25 game pages, `/about/`, `/games/`) | 404s / lost link equity | Retirement map below; `410 Gone` via a Pages Function, `301` only where a relevant page exists |
| Pushing `feature/taren-2.0` may create a Pages *preview* build | Preview uses the current (legacy) settings, so it shows the old site | Harmless; production is only built from `main` |
| ~~No official logo assets~~ | Resolved: official assets supplied and applied | — |

## 7. Legacy route retirement map

| Old route | New behaviour | Reason |
|---|---|---|
| `/about/` | `301 → /studio/` | Same purpose (about the creator/studio) |
| `/games/`, `/games/*` | `410 Gone` | Collection permanently removed; no equivalent page. Not redirected to the homepage (directive §10). |
| `/experiments/*` | `410 Gone` | Removed |
| `/templates/*`, `/assets/js/build.js`, `/assets/css/*`, `/assets/images/games/*` | `404` | Internal files, never meant as pages |
| `/public/parakollen/`, `/public/ninefold/` | **Owner decision** | Unrelated apps (see risks) |
| `/admin`, `/api/*` | `404` | Legacy analytics, retired |

## 8. Rollback strategy

1. Before cutover, nothing on production changes — rollback is not needed.
2. At cutover, rollback is: Cloudflare Pages → Deployments → previous production deployment → *Rollback to this deployment* (instant), then restore the old build settings (root `/`, no build command, output `/`). Full steps in `ROLLBACK.md`.
3. Git: the legacy site remains intact at the repo root on every branch, and baseline commit `b4b001d` is recorded above.
