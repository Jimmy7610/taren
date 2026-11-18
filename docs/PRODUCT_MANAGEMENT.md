# Adding and managing products

Every product is one Markdown file in `site/src/content/products/`. The build validates it; if a rule
is broken, `npm run build` fails with a message that names the field.

## Add a product in five minutes

1. **Copy the template:** `cp site/src/content/products/_example-product.md site/src/content/products/my-app.md` (files starting with `_` are never built)
2. **Set `slug: my-app`.** It must equal the file name (lowercase, hyphens). The page will be `/products/my-app/`.
3. **Fill in the facts** — name, tagline, description (40–300 chars), category (`Game`, `App`, `Tool`, `Experiment`), platforms, status, `statusNote`, features.
4. **Add images** (optional but recommended) to `site/src/assets/products/my-app/`:
   - `icon.png` — square, ≥ 512px.
   - Screenshots — real captures only. Portrait phone shots work best at 786×1704 (any portrait size works).
   - Point `icon`, `heroImage` and `gallery[].image` at them with relative paths, and write real alt text.
   - Optional sharing image: `site/public/og/my-app.jpg` (1200×630) → `ogImage: /og/my-app.jpg`.
5. **Preview privately:** keep `published: false` and use **draft preview mode** — never flip `published` just to look:
   - locally: `TAREN_SHOW_DRAFTS=1 npm run dev` (or `TAREN_SHOW_DRAFTS=1 npx astro build --outDir dist-drafts`);
   - online: push the commit to the branch **`preview/drafts`**; Cloudflare Pages builds it as a branch preview of the `taren-2-preview` project with drafts visible.
   Drafts get an amber "Draft preview" banner and a "Draft" label, `noindex`, no structured data, are never featured and never appear in the sitemap. Production builds (`main`, `feature/taren-2.0`) never show them.
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
| `device` | default `phone` | `phone` (portrait captures, e.g. 786×1704) or `desktop` (landscape window captures at a **1000:660** ratio — e.g. 1000×660 or 2000×1320; checked by a unit test). Switches every frame on the site (showcase, walkthrough, gallery, lightbox, hero, card) |
| `screenshotsNote` | optional | Honest note on how/when the screenshots were made (version, rendering), shown with the gallery |
| `accent`, `accentAlt` | optional | `#rrggbb` from the product's own artwork; must reach 3:1 on the page background. Run `npm run build` (or `node scripts/generate-accents.mjs`) to regenerate `src/styles/product-accents.css` |
| `facts[]` (`label`, `value`) | optional, ≤ 8 | "At a glance" strip. The first four also appear as chips in the showcase. Verified facts only |
| `stepsEyebrow`, `stepsTitle` | optional | Heading for the walkthrough (defaults: "How it works", "<Name> in N steps") |
| `steps[]` (`title`, `description`, `image`, `alt`) | optional, ≤ 5 | Walkthrough with real screenshots |
| `milestones[]` (`title`, `state`, `note?`) + `milestonesSource` | optional, ≤ 10 | `state`: `done` / `in-progress` / `next` / `planned`. A source is required. An unreleased product cannot mark a release/launch milestone as done |

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
- No published featured product → the homepage drops the spotlight and the hero teaser, and stays studio-focused.
- No facts / steps / milestones → those sections are omitted.
- One published product → `/products/` shows it as a full-width showcase; two or more → the card grid.

## Current catalogue

| Product | Status | Source of facts |
|---|---|---|
| Pulse Garden (`pulse-garden`) | published, featured, in-development | `Jimmy7610/PulseGarden` README and docs at commit `97382d9` (2026-10-20); screenshots are the game's own Godot captures from `landing/assets/img/screens/`, icon from `assets/icon/`, OG image from `landing/assets/img/og-image.jpg` |
| Lumen Capture (`lumen-capture`) | **draft** (`published: false`), in-development, desktop | `Jimmy7610/lumen-capture` @ `85996b5` (v2.8.0): README, build files, own website copy; screenshots: 2.8.0 captures (this session, Wine, 200 %) + project's own 2.5 English captures. See `WINDOWS_APPS_AUDIT.md` |
| PDFStudio (`pdfstudio`) | **not created** — no verified information yet (local project, see audit) | — |
| `_example-product.md` | template, never built | — |

When Pulse Garden reaches TestFlight or the App Store: set `status: beta`/`released`, add the
`downloadUrl`, update `statusNote` and `platforms`, and replace screenshots with device captures.
