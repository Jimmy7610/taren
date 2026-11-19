# Taren 2.0 — Test report

## Taren 2.6 product showcase + English/Swedish localization — 2026-11-19

Branch `feature/taren-2.6-bilingual`, local runs in the cloud container (Linux, Chromium from Playwright).

| Check | Result |
|---|---|
| `astro check` (125 files) | 0 errors, 0 warnings |
| ESLint | clean |
| Vitest | 102 passed (11 files), incl. 13 new i18n tests |
| Playwright (`chromium` + `drafts`) | 668 passed, 0 failed |
| `check:site` (21 HTML pages) | OK — links, metadata, canonicals, build contents |
| `verify:cloudflare` (wrangler Pages runtime) | all checks passed, incl. `/sv/` routes, Swedish 404, noindex per host |
| Lighthouse CI, 18 pages × 3 runs (simulated mobile) | median 99–100 in all four categories on every page; all assertions passed |
| `npm audit` | 0 vulnerabilities |

Responsive: every page in both languages at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920 (and 2560) px —
no horizontal overflow. Long Swedish fact values were shortened or given soft hyphens. 18 new Swedish visual
baselines were reviewed by eye before being committed.

Not covered: real iPhone/Android devices, VoiceOver/NVDA/TalkBack by hand, the Ko-fi page itself (external), and
review of the Swedish legal text by a lawyer.

## Taren 2.3 release candidate — 2026-11-18

Branch `feature/taren-2.3-production-readiness` (from `preview/drafts` @ `f1ce1b9`). All commands run from `site/` in
the cloud session (Linux, Chromium). Every number below comes from an actual run.

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors, 0 warnings, 0 hints |
| `npm run lint` | ✅ 0 problems |
| `npm test` (Vitest) | ✅ **88 / 88**, 10 files (+7 vs 2.2: 410 security headers, header parity, no-canonical on noindex, release gate ×4, drafts publish-readiness) |
| `npm run build` (production) and draft build | ✅ both succeed; production: 9 pages, drafts: 11 pages |
| Playwright, production + drafts projects | ✅ **290 / 290** (was 221): routes, navigation, a11y (axe), brand, polish, support, motion, visual regression, responsive |
| Responsive matrix | ✅ every public page **and both drafts** at 320×568, 375×812, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, 2560×1440, 844×390, 932×430: no overflow, overlaps, off-screen elements, broken images, sub-24 px targets or console errors |
| Accessibility (axe-core, WCAG 2.0/2.1/2.2 A+AA) | ✅ 0 violations: 7 public pages + 404 + 410 at 375 and 1440 px; PDF Studio and Lumen Capture drafts |
| Visual regression | ✅ all baselines unchanged (no visual change in 2.3) |
| `npm run check:site` (new) | ✅ production 9 pages / 177 files; drafts 11 pages / 315 files: internal links + srcsets resolve, unique titles/descriptions, canonicals only on indexable pages, og:images exist, JSON-LD valid, no maps/md/ts/env/docs in output |
| `npm run verify:cloudflare` (new, wrangler 4.164.0 `pages dev`) | ✅ **55 checks**: 33 routes (200/301/404/410 incl. internal-file paths), security headers on a static page **and** on a Function 410, immutable `/_astro` caching, X-Robots-Tag absent on taren.se / www.taren.se and present on 4 `*.pages.dev` hosts |
| Lighthouse CI (`@lhci/cli@0.15.1`, 3 runs, simulated mobile, median) | ✅ all 7 public pages **100 / 100 / 100 / 100**; LCP 1.58–1.89 s; CLS 0; TBT 0 ms |
| Link check | ✅ internal: `check:site`; external: only `ko-fi.com/taren`, `github.com/Jimmy7610`, `cloudflare.com/privacypolicy/` (ko-fi.com refuses automated clients — owner check) |
| `npm audit` | ⚠️ 21 "high" = one picomatch ReDoS advisory in build tooling, no patched version — accepted (`TAREN_2_3_AUDIT.md` F10) |
| Final review sweep (drafts build, 11 pages × 390/1440 px) | ✅ 0 broken images, 0 dead links, 0 download links, no legacy games, no overflow, 0 console errors |

Lighthouse for the two draft pages (not in LHCI because they are not public): measured in 2.2 at 97 mobile / 100
desktop performance, 100 accessibility and best practices; SEO 69 only because drafts are `noindex`.

Not testable here: real devices, VoiceOver/NVDA/Narrator, forced-colors, field INP, the Ko-fi page itself, the
Cloudflare dashboard (`TAREN_2_3_AUDIT.md` §3).

## Taren 2.2 final portfolio polish — 2026-11-18

Branch `feature/taren-2.2-final-polish` from `preview/drafts` @ `2c17026`. All commands run from `site/`; every
result below comes from an actual run in the cloud session (Linux, Chromium).

| Command | Result |
|---|---|
| `npm run check` (typecheck → lint → Vitest → build → Playwright) | ✅ exit 0 |
| `npm run typecheck` | ✅ 0 errors, 0 warnings, 0 hints |
| `npm run lint` | ✅ 0 problems |
| `npm test` (Vitest) | ✅ 80 / 80, 10 files |
| Playwright, both projects (production + drafts build) | ✅ 220 / 220, incl. axe, visual regression, 8 viewports |
| New drafts e2e | hero order on phones, hero size/aspect/first-viewport at 1024/1440/1920 for both desktop apps, icon never squeezed, gallery arrows + position read-out + keyboard focus at the ends, touch swipe + lightbox, reduced motion, no-JS fallback |
| Visual baselines | Pulse Garden: **unchanged** (pixel-identical hero at 1440/834/390). PDF Studio draft 375/1440 baselines updated deliberately (new hero order). |

Lighthouse 13 (local static server; drafts build for the two apps):

| Page | Mobile perf / a11y / BP / SEO | Desktop perf / a11y / BP / SEO |
|---|---|---|
| Pulse Garden (production build) | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Lumen Capture (draft) | 97 / 100 / 100 / 69\* | 100 / 100 / 100 / 69\* |
| PDF Studio (draft) | 97 / 100 / 100 / 69\* | 100 / 100 / 100 / 69\* |

\* SEO 69 is the intentional `noindex` on unpublished drafts. CLS 0 on every page. Mobile LCP for the two apps is
now the hero screenshot (≈ 2.4–2.5 s simulated slow 4G, previously text), because it is shown in the first screen.

## Taren 2.1 release candidate — 2026-11-18

Branch `feature/taren-2.0`, implementation commit `9297785` (+ follow-up docs/headers commit). Preview:
https://taren-2-preview.pages.dev. All commands run from `site/`. Every result below comes from an actual run.

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors, 0 warnings, 0 hints |
| `npm run lint` | ✅ 0 problems |
| `npm test` (Vitest) | ✅ **69 / 69**, 9 files |
| `npm run build` | ✅ 9 pages + sitemap; one stylesheet (11.9 kB gzip), JS 0.7 kB + 1.6 kB (menu, lightbox) |
| `npm run test:e2e` — local | ✅ **186 / 186** (≈ 40 s) |
| Same suite against **the live preview** | ✅ **186 / 186** (functional, axe, responsive, motion, lightbox, 25 visual baselines) |
| `npx @lhci/cli@0.15.1 autorun` (5 pages × 3 runs, mobile) | ✅ all budgets: **100 / 100 / 100 / 100 on every page** (Pulse Garden was 99) |

### Lighthouse (median of 3, simulated mobile)

| Page | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.7 s | 0 ms | 0 |
| `/products/` | 100 | 100 | 100 | 100 | 1.9 s | 0 ms | 0 |
| `/products/pulse-garden/` | 100 | 100 | 100 | 100 | 1.9 s | 0 ms | 0 |
| `/studio/` | 100 | 100 | 100 | 100 | 1.6 s | 0 ms | 0 |
| `/support/` | 100 | 100 | 100 | 100 | 1.6 s | 0 ms | 0 |

### End-to-end coverage (186)

| Spec | Tests | Covers (new in 2.1 in **bold**) |
|---|---|---|
| `responsive.spec.ts` | 80 | 8 pages × 10 sizes: 320, 375, 390, 768, 1024, 1440, 1920, **2560×1440, 844×390, 932×430** — overflow, out-of-viewport elements, overlapping controls, target sizes |
| `a11y.spec.ts` | 20 | axe WCAG 2.0/2.1/2.2 A+AA + best practice, 9 pages at 375 and 1440, open menu, heading order |
| `visual.spec.ts` | 25 | 7 pages at 375 and 1440; **home and product page at 320×640, 768×1024, 1920×1080, 2560×1440, 844×390; open mobile menu** |
| `brand.spec.ts` | 15 | Logo at 7 widths; **hero symbol stage at 768/1024/1440/1920/2560: visible, decorative, never over the copy, never clipped; not downloaded on phones**; favicons/OG |
| `routes.spec.ts` | 14 | Metadata, JSON-LD, landmarks, rendered images, console errors, 404, sitemap, old games gone (404 local / 410 on Cloudflare) |
| `polish.spec.ts` | 13 | **Eyebrow one line at 320/360/390; phone hero teaser; showcase chips from verified facts; cross-fade animates and holds still with reduced motion; product accent colours; facts/walkthrough/timeline from verified data (no release claimed); lightbox: open, ←/→, buttons, wrap, focus containment, Escape, focus return; no-JS full-size links; accessible names; menu feature card** |
| `navigation.spec.ts` | 12 | Desktop/mobile nav, every internal link and anchor, keyboard, skip link, featured product via Enter, gallery keyboard scroll |
| `support.spec.ts` | 4 | All Ko-fi links = `https://ko-fi.com/taren`, new tab, labelled; zero third-party requests; no payment widgets |
| `motion.spec.ts` | 3 | Reduced motion disables hero/orbit/page animations and never hides content |

### Unit coverage (69)

New in 2.1 (`polish.test.ts`, 12): accent contrast rule, milestone source rule, no completed release for unreleased
products, list limits, WCAG contrast maths, **generated accent CSS in sync with content** and selector-safe,
**`_headers`: noindex only on `*.pages.dev` host rules (never a path rule that would hit taren.se)**, no double cache
rules, 1 h + SWR caching for icons/OG/manifest, subset fonts smaller than originals. `brand.test.ts`: **masters exist
in `brand/masters/` and are not under `public/`**.

### Verified on the live preview (real HTTP responses)

| Check | Result |
|---|---|
| Deployed build = local build of the commit | ✅ every page byte-identical |
| `X-Robots-Tag` on `taren-2-preview.pages.dev` (HTML, images) | ✅ `noindex, nofollow` |
| `X-Robots-Tag` on `taren.se` | ✅ **none** (production project untouched) |
| Icons/OG/manifest `Cache-Control` | ✅ `public, max-age=3600, stale-while-revalidate=86400` |
| `/branding/*.png` (old public masters) | ✅ 404 |
| Ko-fi links | ✅ all `https://ko-fi.com/taren` |

**Not covered:** Firefox/WebKit (only Chromium is installed), physical devices (viewport emulation only), manual
screen-reader pass, and real-user INP (no field data before launch). The `:version.:project.pages.dev` noindex rule
could not be exercised live because the preview project currently has no branch/commit alias URL. It is covered by
the unit test.

---

## Taren 2.0 baseline (before 2.1)

Run date: 2026-11-18 (updated after applying the official brand assets) · Branch `feature/taren-2.0` · Environment: Linux container, Node 22.23.5,
npm 10.9.9, Astro 7.4.12, Playwright 1.63.0 (Chromium), Vitest 5.1.0, Lighthouse 13.6 / LHCI 0.15.1.

All commands run from `site/`. Every result below was produced by an actual run; nothing was skipped.

## Summary

| Command | Result |
|---|---|
| `npm run typecheck` (`astro check`, strictest TS) | ✅ 0 errors, 0 warnings, 0 hints (52 files) |
| `npm run lint` (ESLint 10 + typescript-eslint + eslint-plugin-astro) | ✅ 0 problems |
| `npm test` (Vitest) | ✅ 57 / 57 passed, 8 files |
| `npm run build` | ✅ 9 HTML pages + sitemap.xml; 0 warnings |
| `npm run test:e2e` (Playwright, Chromium) | ✅ 134 / 134 passed (≈30 s) |
| `npx @lhci/cli@0.15.1 autorun` (5 URLs × 3 runs, mobile emulation) | ✅ all assertions passed |
| `npm run check` (all of the above except LHCI, chained) | ✅ exit 0 |
| GitHub Actions run [44224548551](https://github.com/Jimmy7610/taren/actions/runs/44224548551) on `f9df733` (ubuntu-latest) | ✅ success — every step passed, including visual regression and Lighthouse CI |

## Unit tests (57)

| File | Tests | Covers |
|---|---|---|
| `product-schema.test.ts` | 11 | slug format, https-only links, status honesty rules, alt text, featured⇒published, drafts |
| `content.test.ts` | 6 | every real product file passes the schema, slug = file name, referenced images exist, template stays unpublished, a featured product exists |
| `products.test.ts` | 6 | visibility, sorting, featured, availability (structured data gate), related products, status labels |
| `seo.test.ts` | 7 | canonical paths, titles, OG image URLs, noindex, JSON-LD escaping, sitemap XML |
| `legacy-and-config.test.ts` | 7 | 410 handler (GET/HEAD/non-matching), Ko-fi URL constant, navigation, indexable routes |
| `deploy-files.test.ts` | 6 | `_redirects` (no homepage dumping, no SPA catch-all), CSP without `unsafe-inline`, immutable caching, security headers, functions exist |
| `brand.test.ts` | 6 | official masters present; on-dark logo keeps alpha, full colour (no palette), master aspect ratio, and has no navy left that would vanish on the background; square symbol; favicon.ico (16/32/48) and app icon sizes; 1200×630 social image |
| `components.test.ts` | 5 | missing-image fallback (no `<img>`), status pill, external/internal Button behaviour, SupportCTA links |

## End-to-end tests (134)

| Spec | Tests | Covers |
|---|---|---|
| `routes.spec.ts` | 14 | 7 routes × (200, single h1, title, canonical, OG, robots, `lang`, landmarks, valid JSON-LD, no broken images, no console errors, no failed local requests); unique titles/descriptions; real 404 status; unpublished product → 404; sitemap contents; robots.txt; icons/manifest; **no old games** in text or links |
| `navigation.spec.ts` | 12 | desktop nav + `aria-current`; footer links; **every internal link and anchor on every page resolves**; mobile menu open/close/Escape/focus return/focus containment/keyboard open/44px targets; skip link; visible focus; product card via keyboard; gallery keyboard scrolling |
| `responsive.spec.ts` | 56 | 8 pages (incl. 404) × 7 viewports (320, 375, 390, 768, 1024, 1440, 1920): no horizontal overflow, no element outside the viewport, no overlapping links/buttons, no targets under 24px |
| `a11y.spec.ts` | 20 | axe-core (WCAG 2.0/2.1/2.2 A+AA + best practices) on 9 pages at 375 and 1440px, open mobile menu, heading order |
| `support.spec.ts` | 4 | all Ko-fi links exact URL + new tab + `noopener` + labelled; homepage section + nav; **zero third-party requests**, no iframes/forms; new tab opens to Ko-fi (network stubbed) |
| `motion.spec.ts` | 3 | reduced motion disables hero/orbit/page animations and never hides reveal content; full motion animates without fading the headline |
| `brand.spec.ts` | 11 | header logo at all 7 viewports: loaded, 32px (mobile) / 36px (≥ 768px) tall, aspect ratio preserved, AVIF/WebP, clear of nav; menu and footer use the official logo (menu reuses the header image); no interim wordmark; hero symbol decorative, clear of text at ≥ 1280px, hidden and not downloaded on phones; favicons and OG image wired |
| `visual.spec.ts` | 14 | screenshot baselines of all 7 pages at 375 and 1440px (2% tolerance) |

Defects found by the suite and fixed during development: gallery list semantics (`ul[role=region]`
→ `div[role=region] > ul`), a too-short meta description on `/terms/`, an Astro 7 preview daemon lock
that served stale builds to tests (`--ignore-lock`), and a type mismatch between
`@axe-core/playwright` and the pinned Playwright version.

## Lighthouse (LHCI, median run of 3, simulated mobile, local static server)

| Page | Perf | A11y | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/products/` | 100 | 100 | 100 | 100 | 1.9 s | 0 ms | 0 |
| `/products/pulse-garden/` | 99 | 100 | 100 | 100 | 2.0 s | 0 ms | 0 |
| `/studio/` | 100 | 100 | 100 | 100 | 1.7 s | 0 ms | 0 |
| `/support/` | 100 | 100 | 100 | 100 | 1.7 s | 0 ms | 0 |

Brand payload: header logo 2–8 kB AVIF (1×–3×), down from the 596 kB master; hero symbol 5–17 kB, only loaded at ≥ 1280px.

Desktop preset (single runs): 100 in all four categories on `/`, `/products/pulse-garden/`, `/studio/`.
An earlier run measured 93 performance (TBT 310 ms) on the mobile home page. The cause was SVG-internal
animation. Moving the orbit dots to composited HTML layers fixed it.

**Caveats:** these are lab measurements against a local server, not production. INP cannot be
measured in the lab; the site ships one 0.7 kB script and no event-heavy UI, so INP risk is minimal,
but field data (CrUX) should be checked after launch. Re-run Lighthouse against the preview and
production URLs.

## Payload

Total JavaScript: 730 bytes (one module). CSS: ≈10 kB gzipped across all pages. Fonts: Sora + Inter
variable, Latin subset preloaded (other subsets load only if used). Images: AVIF with WebP fallback,
responsive widths, lazy below the fold, explicit dimensions.

## Visual QA (manual review of screenshots)

Reviewed: home at 320, 375/390, 768, 1024, 1440, 1920; product page at 390 and 1440 (full page);
products, studio, support, privacy and terms at 375 and 1440; open mobile menu at 375; 404 at 1440.
Adjustments made after review: pillar layout on desktop, spotlight lazy-image check, orbit placement on
tablets, spacing on text pages.

## Not covered / limitations

- Browsers: Chromium only (the only browser installed here). Firefox/WebKit not run. Safari-specific
  features in use (`<dialog>`, `@starting-style`, Invoker Commands with JS fallback) are progressive.
- Physical devices: none. Responsive behaviour was tested by viewport emulation.
- Screen readers: no manual VoiceOver/NVDA pass. axe plus semantic structure only.
- Pages Functions (410) are unit-tested; they were not executed in a real Pages runtime (no Cloudflare
  credentials). Verify on the preview deployment.
- `_headers`/`_redirects` are validated statically; the preview server does not apply them.
- No Cloudflare preview deployment exists yet (see `DEPLOYMENT.md`).
