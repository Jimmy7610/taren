# Taren 2.0 — Architecture

## Overview

```
repo root (legacy site, untouched; still what production serves today)
└── site/                       ← Taren 2.0 (Cloudflare Pages "root directory" after cutover)
    ├── astro.config.mjs        static output, trailing slashes, external CSS only
    ├── functions/              Pages Functions: 410 Gone for /games/* and /experiments/*
    ├── public/                 _headers (CSP, caching), _redirects (301s), robots, icons, OG images
    ├── src/
    │   ├── config/site.ts      site constants, KOFI_URL, navigation, static routes
    │   ├── content.config.ts   "products" collection (glob loader, schema)
    │   ├── content/products/   one Markdown file per product
    │   ├── assets/             images processed by astro:assets (AVIF/WebP, responsive)
    │   ├── components/         design-system components
    │   ├── layouts/            BaseLayout, TextPage
    │   ├── lib/                pure logic: schema, visibility, SEO, sitemap, legacy routes
    │   ├── pages/              routes (file-based)
    │   └── styles/global.css   Tailwind 4 + design tokens
    ├── tests/unit/             Vitest
    ├── tests/e2e/              Playwright (+ axe-core, visual baselines)
    └── lighthouserc.json       Lighthouse CI budgets
```

## Decisions

| Decision | Why |
|---|---|
| **Separate `site/` directory** instead of replacing files at the root | Production keeps serving the legacy site from the repo root until the owner flips the Pages build settings. No accidental production change on merge; instant rollback by flipping back. |
| **Astro 7, `output: 'static'`, no adapter** | The site is content, not an app. Static HTML is fastest, cheapest and simplest to host on Pages. |
| **Cloudflare Pages, not Workers** | No server rendering is needed. The only dynamic behaviour (410 for retired routes) is two tiny Pages Functions. Migrating infrastructure is not justified. |
| **Tailwind 4 with `@theme` tokens** | Tokens live in one CSS file, utilities stay consistent; no runtime. |
| **Content Collections + Zod schema with "honesty rules"** | A product cannot be marked released without a link, cannot be featured while unpublished, needs alt text for every image, etc. Mistakes fail the build. |
| **No client framework** | Total JavaScript is one 0.7 kB module (mobile menu fallback/state). Everything else is HTML/CSS. |
| **Native `<dialog>` + Invoker Commands for the mobile menu** | Built-in focus containment, Escape handling, top layer; works without JavaScript in current browsers. |
| **CSS-only motion** (keyframes, `animation-timeline: view()`, cross-document View Transitions) | Zero JS cost, progressive enhancement, fully disabled for `prefers-reduced-motion`. Animations translate, never fade content from zero (content stays visible to users and crawlers). |
| **Self-hosted variable fonts** (Sora display, Inter text; Latin subset preloaded) | No third-party requests, which keeps the CSP strict and the privacy statement true. |
| **External CSS only** (`inlineStylesheets: 'never'`), no `style=""` attributes | Allows a CSP with no `'unsafe-inline'`. JSON-LD uses `type="application/ld+json"`, which CSP does not execute. |
| **Custom sitemap endpoint** | Generated from the same visibility rules as pages, so unpublished products can never leak into it. |

## Data flow for products

`src/content/products/*.md` → `content.config.ts` (schema validation at build) → `lib/catalog.ts`
(`getPublicProducts`, `getPublicEntries`, `getFeaturedProducts`; only `published: true`) →
pages (`/`, `/products/`, `/products/[slug]/`) and `sitemap.xml`.

Pure rules (sorting, visibility, availability, related products) live in `lib/products.ts` and are
unit-tested without Astro.

## Legacy routes

See `docs/TAREN_2_AUDIT.md` §7. `/about` → `/studio/` (301, `_redirects`). `/games*` and
`/experiments*` → 410 with the site's "retired" page (`functions/`, logic in `src/lib/legacy.ts`).
Anything else unknown → the static `404.html` with a real 404 status (Pages default once there is
no SPA catch-all).

## Known trade-offs

- `picomatch` (dev/build dependency) has an open ReDoS advisory with no patched release
  (GHSA-fc5q-39xc-vjpf). It only processes glob patterns written in this repository, never user
  input, and is not shipped to the browser.
- Visual-regression baselines are generated on Linux + Chromium (Playwright 1.63). Rendering on other
  platforms differs; CI treats them as advisory.
