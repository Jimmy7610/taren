# Taren 2.0 — Deployment

> **Production has not been deployed.** Nothing in this branch changes taren.se until the owner
> performs the cutover below.

## Current production (verified 2026-11-18)

Cloudflare Pages project serving taren.se from `main`, repository root as output, no build command,
Pages Functions in `/functions` (analytics on D1 binding `DB`, Parakollen API, catch-all soft 404).

## Build settings for Taren 2.0

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `site` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Node version | Environment variable `NODE_VERSION=22` |
| Functions | Picked up automatically from `site/functions` |
| Bindings / secrets | None needed |

## Step 1 — Preview (safe)

Option A (recommended, zero risk to production): create a **separate** Pages project, e.g.
`taren-2-preview`, connected to this repository with the settings above and production branch
`feature/taren-2.0`. It deploys to `taren-2-preview.pages.dev` only. Do **not** add a custom domain.

Option B: Direct upload from a machine with Wrangler and the owner's Cloudflare login:
```bash
cd site && npm ci && npm run build
npx wrangler pages deploy dist --project-name taren-2-preview --branch feature-taren-2-0
```
(Uploading `dist` alone omits the 410 functions; use Option A to test those.)

Note: pushing `feature/taren-2.0` to the **existing** project creates a branch preview built with
the *legacy* settings, so it shows the old site. That is expected and harmless.

### Preview verification
```bash
BASE=https://<preview>.pages.dev
for p in / /products/ /products/pulse-garden/ /studio/ /support/ /privacy/ /terms/ /sitemap.xml /robots.txt; do curl -s -o /dev/null -w "%{http_code} $p\n" "$BASE$p"; done   # all 200
curl -s -o /dev/null -w "%{http_code}\n" $BASE/nope/                    # 404
curl -s -o /dev/null -w "%{http_code}\n" $BASE/games/ashveil/           # 410
curl -sI $BASE/about/ | grep -i -E "^(HTTP|location)"                   # 301 → /studio/
curl -sI $BASE/ | grep -i content-security-policy                         # present
```
Then walk `docs/RELEASE_CHECKLIST.md` on a phone and a desktop.

### Search engines and the preview
`site/public/_headers` sends `X-Robots-Tag: noindex, nofollow` for `https://:project.pages.dev/*` and
`https://:version.:project.pages.dev/*`. These host-specific rules never match `taren.se`. After cutover, verify:
```bash
curl -sI https://taren.se/ | grep -i x-robots-tag                    # expect: nothing
curl -sI https://taren-2-preview.pages.dev/ | grep -i x-robots-tag   # expect: noindex, nofollow
```

## Step 2 — Production cutover (owner only, after approval)

1. Resolve the open decisions in `RELEASE_CHECKLIST.md` (brand assets, Parakollen/Ninefold, legal review).
2. Then, in this order:
   1. In Cloudflare → Pages → *taren project* → Settings → Builds & deployments, note the current settings (screenshot) for rollback.
   2. Change: Root directory `site`, Build command `npm ci && npm run build`, Output `dist`, add `NODE_VERSION=22`.
   3. Merge the PR into `main`. The merge triggers the first production build with the new settings.
3. Watch the build log; on success run the verification commands above against `https://taren.se`.
4. Submit `https://taren.se/sitemap.xml` in Google Search Console / Bing Webmaster Tools.

If the build fails, production keeps serving the previous deployment (Pages only promotes successful
builds). Revert the settings or follow `ROLLBACK.md`.

## What stops working at cutover (decide first)

- `/public/parakollen/` (+ `/parakollen/api/*`), `/public/ninefold/` — unrelated apps, see audit.
- `/api/event`, `/api/admin/*` analytics endpoints and the D1 binding usage.
- The `workers/taren-analytics` Worker is a separate deployment and is unaffected.
