# Adding and managing products

Every product is one Markdown file in `site/src/content/products/`. The build validates it; if a rule
is broken, `npm run build` fails with a message that names the field.

## Add a product in five minutes

1. **Copy the template:** `cp site/src/content/products/example-product.md site/src/content/products/my-app.md`
2. **Set `slug: my-app`.** It must equal the file name (lowercase, hyphens). The page will be `/products/my-app/`.
3. **Fill in the facts** — name, tagline, description (40–300 chars), category (`Game`, `App`, `Tool`, `Experiment`), platforms, status, `statusNote`, features.
4. **Add images** (optional but recommended) to `site/src/assets/products/my-app/`:
   - `icon.png` — square, ≥ 512px.
   - Screenshots — real captures only. Portrait phone shots work best at 786×1704 (any portrait size works).
   - Point `icon`, `heroImage` and `gallery[].image` at them with relative paths, and write real alt text.
   - Optional sharing image: `site/public/og/my-app.jpg` (1200×630) → `ogImage: /og/my-app.jpg`.
5. **Preview privately:** keep `published: false`, run `npm run dev`. (Unpublished products do not build pages — temporarily set `published: true` locally to look, don't commit it.)
6. **Publish:** set `published: true` (and `featured: true` to show it on the homepage spotlight; lowest `order` wins). Run `npm run check`, commit, open a PR.

## Fields

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | Matches file name |
| `name`, `tagline`, `description` | yes | Description is used for cards, meta description and Open Graph |
| `category` | yes | `Game` \| `App` \| `Tool` \| `Experiment` |
| `platforms` | yes | e.g. `[iPhone]`, `[Windows, macOS]`, `[Web]` |
| `status` | yes | see below |
| `statusNote` | for in-development / beta | One honest sentence about where it stands |
| `published` | default `false` | `false` = no page, no navigation, no sitemap entry |
| `featured` | default `false` | Homepage spotlight. Only allowed when published |
| `order` | default `100` | Lower comes first |
| `icon` + `iconAlt` | optional | |
| `heroImage` + `heroImageAlt` | optional | Shown in a phone frame |
| `gallery[]` (`image`, `alt`, `caption?`) | optional | Real screenshots only |
| `features[]` (`title`, `description`) | optional | Verified capabilities only |
| `downloadUrl` (+ `downloadLabel`) | only released / accessible beta | https only |
| `websiteUrl` | optional | https only |
| `repositoryUrl` | optional | Public repositories only |
| `ogImage` + `ogImageAlt` | optional | Path under `public/` |

## Status rules (enforced by the schema for published products)

| Status | Allowed when |
|---|---|
| `released` | A real `downloadUrl` or `websiteUrl` exists |
| `beta` | A `downloadUrl` exists, or `statusNote` documents how the beta is accessed |
| `in-development` | There is meaningful content (features or gallery) and a `statusNote`; **no** `downloadUrl` |
| `coming-soon` | Approved visual material exists (`heroImage` or `gallery`); **no** `downloadUrl` |

Structured data (`SoftwareApplication` / `VideoGame`) is only emitted for `released`/`beta` products
with a link. Everything else gets breadcrumbs only.

## Fallbacks

- No `heroImage` → the card shows the icon; no icon either → a branded placeholder with the initial.
  A missing image never renders as a broken image.
- No gallery → the Screenshots section is omitted. No features → the Highlights section is omitted.
- Related products appear only when another published product shares the category.
- No published featured product → the homepage drops the spotlight and stays studio-focused.

## Current catalogue

| Product | Status | Source of facts |
|---|---|---|
| Pulse Garden (`pulse-garden`) | published, featured, in-development | `Jimmy7610/PulseGarden` README and docs at commit `97382d9` (2026-10-20); screenshots are the game's own Godot captures from `landing/assets/img/screens/`, icon from `assets/icon/`, OG image from `landing/assets/img/og-image.jpg` |
| Example Product (`example-product`) | template, never published | — |

When Pulse Garden reaches TestFlight or the App Store: set `status: beta`/`released`, add the
`downloadUrl`, update `statusNote` and `platforms`, and replace screenshots with device captures.
