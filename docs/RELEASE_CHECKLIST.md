# Taren — Release checklist

## Taren 2.3 release candidate (2026-11-18) — owner actions

- ⬜ Approve the legal texts: `/privacy/`, `/terms/`, `/support/`, `/studio/` (`LEGAL_REVIEW.md` §5). **Blocker.**
- ⬜ Decide L1 (dedicated contact email — recommended before launch), L2 (footer ©), L12 (legacy analytics data).
- ⬜ Ko-fi: verify tips-only vs. shop/memberships, payouts, and tax position (`LEGAL_REVIEW.md` L5–L7).
- ⬜ Cloudflare: Web Analytics / Zaraz / Bot Fight Mode off for taren.se (privacy page promises no cookies).
- ⬜ Review the release candidate on the preview (see `TAREN_2_3_RELEASE_REPORT.md` for URLs) on a real phone.
- ⬜ Approve `PRODUCTION_CUTOVER_PLAN.md`, then execute it (owner only).
- ✅ Audit done, fixes tested (`TAREN_2_3_AUDIT.md`): 410 security headers, noindex canonicals, draft download gate.
- ✅ Publication workflow documented and enforced (`PUBLICATION_WORKFLOW.md`). Lumen Capture and PDF Studio remain drafts.
- ✅ Preview-only noindex verified **not** to affect taren.se (Cloudflare runtime, Host simulation).
- ✅ Production exposure of internal repository files documented (F1); removed by cutover.

# Earlier checklist (Taren 2.0–2.2)

Status legend: ✅ done & verified on this branch · ⬜ owner action required · ⚠️ decision needed

## Blockers before production

- ✅ Taren 2.1 visual polish implemented (see `TAREN_2_1_POLISH_PLAN.md` §8). ⬜ Owner: final visual approval on the preview.
- ✅ Preview kept out of search engines (`X-Robots-Tag` on `*.pages.dev` only).
- ⬜ After cutover: confirm `https://taren.se/` sends **no** `X-Robots-Tag`.
- ✅ **Official brand assets** applied (header, menu, footer, hero symbol, favicons, app icons, social image).
  ✅ Owner approved the white-wordmark recolour for dark backgrounds. Masters moved to `site/brand/masters/`.
- ✅ **Parakollen and Ninefold** — owner decided to retire both (2.2). New site answers 410; see `LEGACY_RETIREMENT.md`. (Old note follows.)
- ~~⚠️ **Parakollen and Ninefold.**~~ They are live at `/public/parakollen/` and `/public/ninefold/` and
  will stop being served at cutover. Decide: move to their own Pages projects (Parakollen has its own
  repo), keep them (copy into `site/public/` + port `functions/parakollen`), or retire them.
- ✅ **Legacy analytics admin API secured** — PR #1 merged and deployed; `/api/admin/*` → 401 without credentials
  (re-verified 2026-11-18). ⬜ Owner: decide on the D1 data and the `taren-analytics` Worker after cutover
  (`PRODUCTION_CUTOVER_PLAN.md` §7). The endpoints disappear at cutover.
- ⬜ **Legal review** of `/privacy/` and `/terms/` (no governing-law clause; contact route is GitHub).
- ⬜ **Studio facts.** Confirm you are happy to be named (Jimmy Eliasson) and with the "one-person
  studio" description and the history paragraph on `/studio/`.
- ⬜ **Pulse Garden facts.** Confirm public listing is approved, status text ("playable as a desktop
  prototype; not tested on iPhone; not on App Store/TestFlight"), feature list and screenshots.
- ⬜ **Ko-fi.** Before promoting the link: confirm the account's payout/payment eligibility (PayPal
  connected, currency EUR) and that receiving tips fits your tax/business situation. Open
  https://ko-fi.com/taren logged out and check branding, amounts and one-time default.
  (Automated check could not open ko-fi.com from the build environment: HTTP 403 to bots.)
- ⬜ **Cloudflare settings.** Confirm Web Analytics / Zaraz / other script-injecting features stay off
  for taren.se — the privacy page states no analytics and no cookies.
- ⬜ **Preview deployment** created and reviewed on a real phone (see `DEPLOYMENT.md`).

## Taren 2.2 — product expansion
- ⬜ Owner: review the **Lumen Capture** draft page (draft preview) and decide when to publish (gate 1, `PUBLICATION_WORKFLOW.md`).
- ⬜ Lumen Capture blockers before publishing a download: public release, code signing, updater vs private repo, real Windows screenshots (`WINDOWS_APPS_AUDIT.md`).
- ⬜ Lumen Capture `feature/taren-branding`: check on a real Windows PC, then merge (not merged automatically).
- ✅ **PDF Studio**: draft page with verified 0.9.0 facts, real screenshots and its official icon (deployed to the drafts preview). ⬜ Owner: publish decision (gate 1).

## Verified on the branch

- ✅ All routes render: `/`, `/products/`, `/products/pulse-garden/`, `/studio/`, `/support/`, `/privacy/`, `/terms/`, 404, 410
- ✅ Unpublished products produce no page and no sitemap entry
- ✅ All Ko-fi links = `https://ko-fi.com/taren`, new tab, labelled, `rel="noopener noreferrer"`
- ✅ Old browser games absent from all pages and links; legacy route plan implemented (301/410)
- ✅ No third-party requests, no cookies, no forms, no iframes
- ✅ Unique titles/descriptions, canonical URLs on https://taren.se, OG/Twitter metadata, JSON-LD
- ✅ axe-core: 0 violations (WCAG 2.0/2.1/2.2 A+AA + best practices) on all pages at 375 and 1440px
- ✅ No horizontal overflow/overlaps at 320, 375, 390, 768, 1024, 1440, 1920px
- ✅ Keyboard: skip link, menu focus containment, Escape, focus return, gallery scrolling
- ✅ Reduced motion respected
- ✅ Lighthouse CI: 100/100/100/100 on 5 pages (local, see `TEST_REPORT.md`)
- ✅ Strict CSP and security headers defined in `site/public/_headers`

## After launch

- ⬜ Verify headers, 301, 410 and 404 on https://taren.se (`DEPLOYMENT.md` commands)
- ⬜ Submit sitemap to Google Search Console / Bing
- ⬜ Remove legacy files from the repository root in a follow-up PR (optional, after a stable week)
- ⬜ Re-run Lighthouse against production (real network, real CDN)
