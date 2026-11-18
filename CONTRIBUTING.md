# Contributing to Taren

Taren 2.0 lives in `site/`. The legacy site at the repository root is frozen and will be retired
after the 2.0 cutover; don't add to it.

## Setup
```bash
cd site
npm ci
npm run dev          # http://localhost:4321
```
Requires Node 22.12+. End-to-end tests need Chromium for Playwright 1.63 (`npx playwright install chromium`).

## Scripts
| Script | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static production build to `dist/` |
| `npm run preview` | Serve `dist/` on port 4321 |
| `npm run typecheck` | `astro check` (TypeScript strictest) |
| `npm run lint` | ESLint (TS + Astro) |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright: routes, navigation, a11y (axe), responsive, motion, visual |
| `npm run check` | All of the above, in order |

## Rules
- Branch from `main` (or the active release branch), open a PR. Never push to `main` directly.
- `npm run check` must pass. CI (`.github/workflows/taren-2-site.yml`) runs the same checks plus Lighthouse CI.
- Products: follow `docs/PRODUCT_MANAGEMENT.md`. Only publish verified facts and real screenshots.
- Design: use tokens and components from `docs/DESIGN_SYSTEM.md`. No inline `style=""` attributes or
  inline scripts (the CSP forbids them). No third-party scripts, fonts or embeds.
- Accessibility: semantic HTML, visible focus, 44px touch targets for primary controls, alt text,
  reduced-motion support. axe must report zero violations.
- Visual changes: review screenshots, then `npx playwright test visual --update-snapshots` and commit the baselines.
- Never commit secrets or `.env` files.
