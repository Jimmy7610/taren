# Taren 2.0 — Test report

Run date: 2026-11-18 · Branch `feature/taren-2.0` · Environment: Linux container, Node 22.23.5,
npm 10.9.9, Astro 7.4.12, Playwright 1.63.0 (Chromium), Vitest 5.1.0, Lighthouse 13.6 / LHCI 0.15.1.

All commands run from `site/`. Every result below was produced by an actual run; nothing was skipped.

## Summary

| Command | Result |
|---|---|
| `npm run typecheck` (`astro check`, strictest TS) | ✅ 0 errors, 0 warnings, 0 hints (52 files) |
| `npm run lint` (ESLint 10 + typescript-eslint + eslint-plugin-astro) | ✅ 0 problems |
| `npm test` (Vitest) | ✅ 51 / 51 passed, 7 files |
| `npm run build` | ✅ 9 HTML pages + sitemap.xml; 0 warnings |
| `npm run test:e2e` (Playwright, Chromium) | ✅ 123 / 123 passed (≈30 s) |
| `npx @lhci/cli@0.15.1 autorun` (5 URLs × 3 runs, mobile emulation) | ✅ all assertions passed |
| `npm run check` (all of the above except LHCI, chained) | ✅ exit 0 |

## Unit tests (51)

| File | Tests | Covers |
|---|---|---|
| `product-schema.test.ts` | 11 | slug format, https-only links, status honesty rules, alt text, featured⇒published, drafts |
| `content.test.ts` | 6 | every real product file passes the schema, slug = file name, referenced images exist, template stays unpublished, a featured product exists |
| `products.test.ts` | 6 | visibility, sorting, featured, availability (structured data gate), related products, status labels |
| `seo.test.ts` | 7 | canonical paths, titles, OG image URLs, noindex, JSON-LD escaping, sitemap XML |
| `legacy-and-config.test.ts` | 7 | 410 handler (GET/HEAD/non-matching), Ko-fi URL constant, navigation, indexable routes |
| `deploy-files.test.ts` | 6 | `_redirects` (no homepage dumping, no SPA catch-all), CSP without `unsafe-inline`, immutable caching, security headers, functions exist |
| `components.test.ts` | 5 | missing-image fallback (no `<img>`), status pill, external/internal Button behaviour, SupportCTA links |

## End-to-end tests (123)

| Spec | Tests | Covers |
|---|---|---|
| `routes.spec.ts` | 14 | 7 routes × (200, single h1, title, canonical, OG, robots, `lang`, landmarks, valid JSON-LD, no broken images, no console errors, no failed local requests); unique titles/descriptions; real 404 status; unpublished product → 404; sitemap contents; robots.txt; icons/manifest; **no old games** in text or links |
| `navigation.spec.ts` | 12 | desktop nav + `aria-current`; footer links; **every internal link and anchor on every page resolves**; mobile menu open/close/Escape/focus return/focus containment/keyboard open/44px targets; skip link; visible focus; product card via keyboard; gallery keyboard scrolling |
| `responsive.spec.ts` | 56 | 8 pages (incl. 404) × 7 viewports (320, 375, 390, 768, 1024, 1440, 1920): no horizontal overflow, no element outside the viewport, no overlapping links/buttons, no targets under 24px |
| `a11y.spec.ts` | 20 | axe-core (WCAG 2.0/2.1/2.2 A+AA + best practices) on 9 pages at 375 and 1440px, open mobile menu, heading order |
| `support.spec.ts` | 4 | all Ko-fi links exact URL + new tab + `noopener` + labelled; homepage section + nav; **zero third-party requests**, no iframes/forms; new tab opens to Ko-fi (network stubbed) |
| `motion.spec.ts` | 3 | reduced motion disables hero/orbit/page animations and never hides reveal content; full motion animates without fading the headline |
| `visual.spec.ts` | 14 | screenshot baselines of all 7 pages at 375 and 1440px (2% tolerance) |

Defects found by the suite and fixed during development: gallery list semantics (`ul[role=region]`
→ `div[role=region] > ul`), a too-short meta description on `/terms/`, an Astro 7 preview daemon lock
that served stale builds to tests (`--ignore-lock`), and a type mismatch between
`@axe-core/playwright` and the pinned Playwright version.

## Lighthouse (LHCI, median run of 3, simulated mobile, local static server)

| Page | Perf | A11y | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/products/` | 100 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/products/pulse-garden/` | 100 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/studio/` | 100 | 100 | 100 | 100 | 1.7 s | 0 ms | 0 |
| `/support/` | 100 | 100 | 100 | 100 | 1.7 s | 0 ms | 0 |

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
