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
| PDF Studio (`pdfstudio`) | **draft** (`published: false`), in-development, desktop, version 0.9.0 preview | `docs/products/pdfstudio/` (TAREN_PRODUCT_INFO, ASSET_MANIFEST, HANDOFF_README, README) from the local PDFStudio repo, branch `feature/taren-branding`, commits `4802bd8` and `8ca2301`; imported in `5ed61a0`. See the PDF Studio section below |
| `_example-product.md` | template, never built | — |

When Pulse Garden reaches TestFlight or the App Store: set `status: beta`/`released`, add the
`downloadUrl`, update `statusNote` and `platforms`, and replace screenshots with device captures.


## PDF Studio (Taren 2.2)

**Status:** draft page on branch `feature/pdfstudio-product-page` (from `feature/pdfstudio-product-assets` @ `5ed61a0`).
`published: false`, `featured: false`, `status: in-development`, `device: desktop`, `order: 3`, no `downloadUrl` or
`websiteUrl`. The status note states that 0.9.0 is an unsigned development preview, tested on the developer's PC, and
not released (no download, beta, price or release date).

**Source material** (read in full, only "Current features (verified)" used): `docs/products/pdfstudio/TAREN_PRODUCT_INFO.md`,
`ASSET_MANIFEST.md`, `HANDOFF_README.md`, `README.md`. Respected limitations: everything under "Not available yet"
(two-page view, form designer, image replacement, find and replace, scanner, HTML → PDF, PDF → Office, PDF/A, PDF/UA,
batch UI, TSA/OCSP/LTV, local AI) is not claimed. The developer-only `pdfstudio` CLI is not listed. The visual
signature is described as not cryptographic. There are no Acrobat, AI or ARM64 claims. A test fails if the page claims a
release, "available now", PDF/A compliance, Acrobat parity, AI or the CLI.

**Product identity:** accents `#A48BFF` (violet) and `#F07AB4` (rose). They are text-safe tints (7.0:1 and 7.4:1 on
ink) of PDF Studio's own gradient (indigo `#4B3FB3` → violet `#743FB0` → rose `#B95A7D`, sampled from its start page).
The tagline "Read, edit, organise, sign, protect and print PDFs — offline." is condensed from the verified short
description.

**Icon (missing):** PDF Studio's own icon (`src/PDFStudio.App/Assets/AppIcon256.png` in the PDFStudio repo) is not in
this repository, so `icon` is left empty. The page uses the existing fallbacks: the hero shows no icon and cards use
the screenshot. The Taren symbol is never used as PDF Studio's icon, and a unit test enforces that. To add the icon,
place `site/src/assets/products/pdfstudio/icon.png` (≥ 256 px, preferably 512 px) and set `icon`/`iconAlt`.

**New optional schema fields** (available to every product, unused by Pulse Garden and Lumen Capture):
`beforeRelease` (honest pre-release list, shown with the timeline; not allowed for released products), `requirements`
(label/value rows, "What <name> needs" section), and `aboutImage` (the app's own About screen with the Taren credit,
shown in a "Made by Taren" section).

### Screenshot processing
The 13 originals (1424×911, RGB, 100 % scaling) are **unchanged**. A unit test re-hashes each one against
`ASSET_MANIFEST.md`. Derivatives were made with `site/scripts/fit-desktop-screenshots.mjs`:
1. Pad top and bottom (never crop, never stretch) to the 1000:660 frame ratio, 1424×911 → 1424×940, using each
   image's own edge colour (the median of its first and last pixel row), so the padding continues the title bar and
   status bar. The window title bar, tabs and caption buttons are intact.
2. Down-scale with Lanczos3 to 1000×660 (no upscaling). The horizontal and vertical scale factors differ by 0.02 %
   (1424×940 is 1.5149 against a 1.5152 target), which is less than one third of a pixel across the width and not
   visible.
3. Write lossless WebP (`*.web.webp`). astro:assets then serves AVIF/WebP at 480/720/1000 px.

| Source | Size | Padding top / bottom (colour) | Derivative | Size | Bytes |
|---|---|---|---|---|---|
| `01-start-dark.png` | 1424x911 | 14 / 15 px, `#0e0a00` / `#0e0a00` | `01-start-dark.web.webp` | 1000x660 | 110 kB |
| `02-start-light.png` | 1424x911 | 14 / 15 px, `#e1dacc` / `#e2d9cc` | `02-start-light.web.webp` | 1000x660 | 111 kB |
| `03-document-dark.png` | 1424x911 | 14 / 15 px, `#0d0b00` / `#0b0c00` | `03-document-dark.web.webp` | 1000x660 | 74 kB |
| `04-document-light.png` | 1424x911 | 14 / 15 px, `#e2dbc8` / `#dcdcc9` | `04-document-light.web.webp` | 1000x660 | 64 kB |
| `05-command-palette.png` | 1424x911 | 14 / 15 px, `#0e0a00` / `#0f0900` | `05-command-palette.web.webp` | 1000x660 | 77 kB |
| `06-search.png` | 1424x911 | 14 / 15 px, `#0e0a00` / `#0f0900` | `06-search.web.webp` | 1000x660 | 83 kB |
| `07-redaction-marked.png` | 1424x911 | 14 / 15 px, `#0e0a00` / `#0d0b00` | `07-redaction-marked.web.webp` | 1000x660 | 88 kB |
| `08-redaction-saved.png` | 1424x911 | 14 / 15 px, `#0e0a00` / `#0d0b00` | `08-redaction-saved.web.webp` | 1000x660 | 79 kB |
| `09-forms.png` | 1424x911 | 14 / 15 px, `#0e0a00` / `#0e0a00` | `09-forms.web.webp` | 1000x660 | 82 kB |
| `10-print-dialog.png` | 1424x911 | 14 / 15 px, `#0a0700` / `#090700` | `10-print-dialog.web.webp` | 1000x660 | 67 kB |
| `11-about-taren-dark.png` | 1424x911 | 14 / 15 px, `#090700` / `#080800` | `11-about-taren-dark.web.webp` | 1000x660 | 80 kB |
| `12-about-taren-light.png` | 1424x911 | 14 / 15 px, `#9e988c` / `#9c998d` | `12-about-taren-light.web.webp` | 1000x660 | 67 kB |
| `13-about-taren-english.png` | 1424x911 | 14 / 15 px, `#090700` / `#080800` | `13-about-taren-english.web.webp` | 1000x660 | 78 kB |

**Use on the page:** the hero is `03-document-dark`. The walkthrough uses 05 (command search), 07 (redaction marked)
and 08 (redaction saved). The gallery (10 images) uses 01, 03, 04, 05, 06, 07, 08, 09, 10 and 02. The "Made by Taren"
section uses `11-about-taren-dark`. 12 and 13 are kept for future use (light theme and English UI). The screenshots
note discloses the version, Swedish UI, 100 % scaling and synthetic test documents. Alt texts follow the manifest's
"Content" column.

### Remaining release blockers (from TAREN_PRODUCT_INFO.md)
No code signing (SmartScreen). Product name and licence not decided. Manual checks still open: printer, 125–250 %
scaling, multiple monitors, high contrast, Narrator, touch and pen, large files. PDFium is not sandboxed. Many dialogs
are Swedish-only. No distribution channel has been chosen. For the website: the official icon is missing, and the
screenshots are Swedish-only at 1×, so English and 2× captures would improve the page.

### Tests (this branch)
- Unit tests (80): PDF Studio is unpublished, not featured, has no download or website URL, no icon, no banned
  claims, and its status note mentions 0.9.0, unsigned and not released. The originals match the manifest SHA-256 and
  are 1424×911. All 13 derivatives are 1000×660 WebP. Every desktop image is at the 1000:660 ratio.
- Production e2e: `/products/pdfstudio/` returns 404. "PDF Studio" appears neither on `/`, `/products/` nor
  `/studio/`, there are no links to it, and it is not in the sitemap.
- Drafts e2e (`npm run test:e2e`, project `drafts`): the draft banner shows, `noindex` is set, there is no JSON-LD and
  no download. All sections render (8 facts, 3 steps, 6 features, 10 gallery images, timeline 6 done + next +
  planned, 5 pre-release items, 6 requirements, attribution). Every screenshot loads at the right ratio. Lightbox:
  counter, caption, arrow keys, Esc and focus return work. The accent is `#a48bff`. No overflow or off-screen content
  at 320×640, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, 2560×1440 and 844×390, and body text is ≥ 12 px.
  axe finds no WCAG 2.2 AA violations. Visual baselines at 375 and 1440.
- Lighthouse on the draft page (local): performance, accessibility and best practices 100. SEO 69 is expected:
  Lighthouse flags the intended `noindex`.

### Draft preview
Locally: `cd site && TAREN_SHOW_DRAFTS=1 npm run dev`, then open `/products/pdfstudio/`. Online (owner approval
needed): push this branch's commit to `preview/drafts` (`git push origin <sha>:preview/drafts`). Cloudflare builds it
at `https://preview-drafts.taren-2-preview.pages.dev/products/pdfstudio/`, which is noindex.
