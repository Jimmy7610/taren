# Taren 2.0 — website

The website of **Taren**, an independent software studio in Sweden. *Software built with curiosity.*

Static Astro 7 site · TypeScript (strictest) · Tailwind CSS 4 · Content Collections · Vitest ·
Playwright + axe-core · Lighthouse CI · Cloudflare Pages.

```bash
npm ci
npm run dev        # http://localhost:4321
npm run check      # typecheck, lint, unit tests, build, e2e
```

| Route | Source |
|---|---|
| `/` | `src/pages/index.astro` |
| `/products/` | `src/pages/products/index.astro` |
| `/products/[slug]/` | `src/pages/products/[slug].astro` + `src/content/products/*.md` |
| `/studio/`, `/support/`, `/privacy/`, `/terms/` | `src/pages/*.astro` |
| 404 / 410 | `src/pages/404.astro`, `src/pages/410.astro` (+ `functions/`) |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts` |

Ko-fi URL and site constants: `src/config/site.ts`.
Adding a product: `../docs/PRODUCT_MANAGEMENT.md`. More docs in `../docs/`.
