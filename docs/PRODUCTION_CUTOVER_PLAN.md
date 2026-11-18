# Taren 2.3 — Production cutover plan

> **Not executed. Requires the owner's explicit approval before any step in §4 onwards.** Nothing in this branch
> changes taren.se, DNS or Cloudflare settings. Prepared 2026-11-18.

## 1. Starting point (verified 2026-11-18)

| Item | State |
|---|---|
| Production | Cloudflare Pages project **`taren`** (`taren.pages.dev`), custom domain **taren.se**, branch `main` @ `7438a6a` |
| Production build | Repository root served as-is, no build command; Functions from root `/functions` |
| Production Functions | `functions/[[path]].ts` (catch-all), `functions/api/event.ts` (analytics ingest), `functions/api/admin/*` (auth-protected since PR #1: 401 verified), `functions/parakollen/api/*` |
| Production env vars / secrets (names from `main` source; values unknown) | `DB` (D1 binding), `ADMIN_API_TOKEN`, `ADMIN_EMAILS`, `ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`, `ANALYTICS_ALLOWED_ORIGINS`, `ANALYTICS_INGEST` |
| Separate resources | Worker `taren-analytics` + its D1 database (`workers/taren-analytics`), repo `Jimmy7610/Parakollen` |
| `www.taren.se` | No reachable DNS record (connection fails). Nothing to migrate; optional to add later. |
| Release candidate | `feature/taren-2.3-launch-copy` (2.3 RC `f39692f` + approval docs + approved contact/copyright copy), merges into `main` without conflicts |
| Preview | `taren-2-preview` project (unchanged by cutover) |

## 2. Approach

**Recommended (A): switch the existing `taren` project to the new build.** One settings change + one merge.
Rollback is Cloudflare's one-click "Rollback to this deployment" (≈ 1 min), and the domain, certificate and DNS stay
untouched.

Alternative (B): attach taren.se to a new Pages project built from `main` with the new settings, then remove the
domain from `taren`. Cleaner separation but involves custom-domain re-provisioning (certificate, possible minutes of
errors) and is not needed. Not recommended.

## 3. Pre-cutover gates (all must be ✅)

1. Owner approves: this plan, the release candidate on the preview, and the legal texts (`LEGAL_REVIEW.md` §5).
2. Owner decisions recorded: L1 (contact email), L2 (footer ©), L12 (legacy analytics data) — or explicitly deferred.
3. CI green on the release-candidate PR (typecheck, lint, unit, build, Playwright both builds, Lighthouse CI).
4. `npm run check:site` and `npm run verify:cloudflare` pass on the merge commit's build.
5. `npm audit`: no new advisories beyond the accepted picomatch item (`TAREN_2_3_AUDIT.md` F10).
6. Cloudflare dashboard: Web Analytics, Zaraz, Bot Fight Mode, Rocket Loader, **Email Address Obfuscation** and other cookie- or script-injecting features off for taren.se (privacy page promises no cookies/analytics; the site now contains an email address).
7. Screenshot of the current `taren` project settings (Build & deployments, Environment variables, Functions bindings) saved for rollback.
8. A quiet time chosen; owner available for 30 minutes.

## 4. Exact Pages build configuration (project `taren`)

| Setting | Before (record exactly) | After |
|---|---|---|
| Production branch | `main` | `main` (unchanged) |
| Framework preset | None | None |
| Root directory | *(empty = repo root)* | `site` |
| Build command | *(empty)* | `npm ci && npm run build` |
| Build output directory | `/` (or empty) | `dist` |
| Environment variable `NODE_VERSION` | — | `22` (production **and** preview) |
| `TAREN_SHOW_DRAFTS` | — | **must not exist** (drafts would appear) |
| Functions | root `/functions` | `site/functions` (picked up automatically from the root directory) |
| Compatibility date / flags | as is | as is (the 410 Functions use only `fetch`/`Response`) |

Environment variables/secrets review: the new site uses **none**. Leave `ADMIN_API_TOKEN`, `ADMIN_EMAILS`,
`ACCESS_*`, `ANALYTICS_*` and the `DB` binding in place during cutover (harmless — no code reads them) so a rollback
works unchanged; remove them in §8 after a stable week.

## 5. Cutover steps

1. Open a PR `feature/taren-2.3-launch-copy` → `main`. Wait for CI. **Do not merge yet.**
2. In Cloudflare → Pages → `taren` → Settings → Builds & deployments: apply §4 "After". (Saving does not redeploy.)
3. Merge the PR (merge commit). Cloudflare builds `main` with the new settings.
4. Watch the build log: `npm ci`, `astro build`, "Found Functions directory at /site/functions", upload of `dist`.
   - If the build **fails**, Pages keeps serving the previous deployment. Restore §4 "Before", investigate. No user impact.
5. When the deployment is live, run §6 immediately.

## 6. Post-launch smoke tests (run from any machine)

```bash
B=https://taren.se
for p in / /products/ /products/pulse-garden/ /studio/ /support/ /privacy/ /terms/ /sitemap.xml /robots.txt; do curl -s -o /dev/null -w "%{http_code} $p\n" $B$p; done    # all 200
for p in /games/ /games/ashveil/ /experiments/ /public/parakollen/ /public/ninefold/ /parakollen/api/medals; do curl -s -o /dev/null -w "%{http_code} $p\n" $B$p; done  # all 410
for p in /nope/ /products/lumen-capture/ /products/pdfstudio/ /api/admin/overview /api/event /README.md /docs/current-status.md /workers/taren-analytics/wrangler.toml /.agent/ARCHITECTURE.md; do curl -s -o /dev/null -w "%{http_code} $p\n" $B$p; done  # all 404
curl -sI $B/about | grep -iE "^(HTTP|location)"                       # 301 → /studio/
curl -sI $B/ | grep -i x-robots-tag                                   # MUST print nothing (indexable)
curl -sI $B/ | grep -iE "content-security-policy|strict-transport"    # both present
curl -sI $B/games/ | grep -iE "content-security-policy|x-frame"       # both present (F2 fix)
curl -sI https://taren.pages.dev/ | grep -i x-robots-tag              # noindex, nofollow
curl -s $B/ | grep -o "<title>[^<]*"                                  # Taren — Software built with curiosity
curl -s $B/sitemap.xml | grep -c "<loc>"                              # 7
```
Then by hand, on a phone and a desktop: home, menu, products, Pulse Garden gallery + lightbox, Ko-fi link opens
ko-fi.com/taren in a new tab, footer links, a 404.

**Abort criteria → §10 rollback:** any 5xx; `X-Robots-Tag` present on taren.se; drafts (Lumen Capture / PDF Studio)
visible; missing CSP; broken home page.

## 7. Legacy retirement and migration checklist

| Item | At cutover | Later (owner) | Never |
|---|---|---|---|
| Legacy games `/games/*`, `/experiments/*` | 410 Gone via `site/functions` | Remove root folders from `main` in a clean-up PR after a stable week (history keeps them) | — |
| Parakollen `/public/parakollen/*`, `/parakollen/api/*` | 410 Gone | If wanted elsewhere: deploy `Jimmy7610/Parakollen` as its own Pages project | Delete the `Jimmy7610/Parakollen` repository |
| Ninefold `/public/ninefold/*` | 410 Gone | Source stays in Git history | — |
| Analytics ingest `/api/event` | 404 (no Function) | — | — |
| Admin API `/api/admin/*` | 404 (no Function) | Remove the secrets `ADMIN_API_TOKEN`, `ADMIN_EMAILS`, `ACCESS_*`, `ANALYTICS_*` and the `DB` binding from project `taren` after a stable week | — |
| Cloudflare Access app for the admin API (if configured for `ACCESS_AUD`) | Unused | Remove after the secrets | — |
| Worker `taren-analytics` | Unaffected (separate deployment) | Decide: keep, disable route, or delete — **owner only** | Delete without an export/decision |
| D1 analytics database | Unaffected | Decide retention: export (`wrangler d1 export`) then keep or delete — **owner only** (`LEGAL_REVIEW.md` L12) | Delete without a decision |
| Root-level internal files (F1) | No longer served (only `dist/`) | Optional: move `.agent/`, `.vs/` out of the repo | — |

Nothing in this column is deleted by the cutover itself.

## 8. Search indexing verification (days 0–14)

1. Day 0: `curl -sI https://taren.se/ | grep -i x-robots` → nothing. View source of `/`: `<meta name="robots" content="index, follow">`, canonical `https://taren.se/`.
2. Day 0: Google Search Console (domain property taren.se) → Sitemaps → submit `https://taren.se/sitemap.xml`; URL Inspection on `/` and `/products/pulse-garden/` → "URL is available to Google". Same in Bing Webmaster Tools.
3. Days 1–14: Pages report — old `/games/*` URLs move to "Not found (404)/410"; new pages get indexed. No action needed for 410s.
4. Check that no `*.pages.dev` URL appears in results (`site:taren.pages.dev`, `site:taren-2-preview.pages.dev`).
5. Rich results test on `/studio/` (Organization) and a product page (Breadcrumb).

## 9. Optional interim hotfix for F1 (before cutover, owner approval required)

Simplest interim option (dashboard only): a WAF custom rule on the taren.se zone blocking the internal paths
(`TAREN_2_3_GODKANNANDE.md` §4.3 M2). It does **not** cover `taren.pages.dev`, which serves the same files.

Only if cutover is far away. In a PR to `main`, add to the root `_headers`/`_redirects` (served by the legacy
project) rules returning 404 for `/.agent/*`, `/docs/*`, `/workers/*`, `/tests/*`, `/CLAUDE.md`, `/README.md`,
`/.gitignore`. Pages `_redirects` cannot return 404 directly; the reliable way is a small rule in the existing
catch-all Function. Not implemented here because it modifies production; the cutover removes the exposure anyway.

## 10. Rollback

See `ROLLBACK.md`. Summary:
1. **Instant (≈ 1 min):** Pages → `taren` → Deployments → the last deployment built *before* the cutover (from `7438a6a`) → ⋯ → *Rollback to this deployment*.
2. **Make it stick:** restore §4 "Before" settings; then either revert the merge on `main` (`git revert -m 1 <merge>` via PR) or leave it (with the old settings the repository root is served again).
3. Verify: legacy title on `/`; `/api/admin/overview` → 401 (PR #1 still in place); `/games/` → 200.

## 11. Owner sign-off

| Step | Approved | Date |
|---|---|---|
| Plan | ☐ | |
| Release candidate on preview | ☐ | |
| Legal texts | ☐ | |
| Cutover executed | ☐ | |
| Day-14 indexing check | ☐ | |
