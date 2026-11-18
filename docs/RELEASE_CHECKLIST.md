# Taren 2.0 — Release checklist

Status legend: ✅ done & verified on this branch · ⬜ owner action required · ⚠️ decision needed

## Blockers before production

- ✅ Taren 2.1 visual polish implemented (see `TAREN_2_1_POLISH_PLAN.md` §8). ⬜ Owner: final visual approval on the preview.
- ✅ Preview kept out of search engines (`X-Robots-Tag` on `*.pages.dev` only).
- ⬜ After cutover: confirm `https://taren.se/` sends **no** `X-Robots-Tag`.
- ✅ **Official brand assets** applied (header, menu, footer, hero symbol, favicons, app icons, social image).
  ✅ Owner approved the white-wordmark recolour for dark backgrounds. Masters moved to `site/brand/masters/`.
- ⚠️ **Parakollen and Ninefold.** They are live at `/public/parakollen/` and `/public/ninefold/` and
  will stop being served at cutover. Decide: move to their own Pages projects (Parakollen has its own
  repo), keep them (copy into `site/public/` + port `functions/parakollen`), or retire them.
- ⚠️ **Legacy analytics** (`/api/event`, `/api/admin/*`, D1). Retired at cutover. Note that
  `/api/admin/*` is currently publicly readable without authentication.
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
