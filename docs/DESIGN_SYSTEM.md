# Taren 2.0 — Design system

All tokens are defined once in `site/src/styles/global.css` (`@theme`) and used as Tailwind
utilities (`bg-surface`, `text-muted`, `text-headline`, …).

## Colour

| Token | Value | Use | Contrast on ink |
|---|---|---|---|
| `ink` | `#0A1020` | Page background | — |
| `ink-deep` | `#070B17` | Alternate bands, footer | — |
| `surface` | `#121B31` | Cards, panels | — |
| `surface-raised` | `#18233F` | Media areas | — |
| `line` / `line-strong` | `#A8B3CF` @ 14% / 28% | Hairlines, borders | — |
| `text` | `#F4F7FF` | Headings, primary text | 17.7:1 |
| `muted` | `#A8B3CF` | Body copy | 9.0:1 |
| `subtle` | `#8591B0` | Meta text, labels | 6.0:1 (4.9:1 on `surface-raised`) |
| `cyan` / `cyan-soft` | `#35D5FF` / `#8AE6FF` | Primary accent, links, focus ring | 10.9:1 / 13.4:1 |
| `purple` / `purple-soft` | `#8D5BFF` / `#B394FF` | Secondary accent, gradients only | 4.6:1 / 7.8:1 |
| `amber` | `#FFC46B` | "In development" status dot | — |

Rules: accents are used sparingly (one gradient word in the hero, hairlines, status dots, focus
ring). Purple is never used for body text. No constant glows.

### Brand colours (Taren 2.1) — sampled from the official symbol

| Token | Value | Contrast on ink | Use |
|---|---|---|---|
| `brand-cyan` | `#01E3FC` | 12.1:1 | Graphics, dots, glows |
| `brand-blue` | `#0155F6` | 3.3:1 | **Graphics only** |
| `brand-violet` | `#630CE1` | 2.4:1 | **Graphics only** |
| `brand-magenta` | `#E304FB` | 5.1:1 | Graphics, dots |
| `blue-text` / `violet-text` / `magenta-text` | `#5A9BFF` / `#A47BFF` / `#F07CFF` | 6.8 / 6.2 / 8.2:1 | Type and small UI |

- `--gradient-brand` — cyan → blue → violet → magenta (graphics: nav underline, gradient ring, swoosh).
- `--gradient-brand-text` — the same hues in text-safe tints (`.text-brand-gradient`: the hero's *curiosity.*, 404/410 codes).
- **Per-product accents** (`--accent`, `--accent-alt`) come from each product's own artwork (Pulse Garden: teal `#2CC3B3`, pink `#FF72D0`), are validated to ≥ 3:1 on ink by the schema, and are applied through `[data-accent="<slug>"]` (generated CSS — see ARCHITECTURE).

### Motif — the swoosh
`Swoosh.astro` reproduces the tapered orbit of the official T symbol: `variant="orbit"` (a tilted ring, thick cyan at
the bottom tapering to a magenta hairline — hero stage, product stage) and `variant="arc"` (a sweeping crescent —
product hero, support panel). Always decorative, always at low opacity behind content.

### Surfaces
`.surface-grain` adds a 2 kB tiled grain at 4.5% (breaks up gradient banding on large panels). `.ring-brand`
reveals a 1px brand-gradient border on hover/focus (cards, teasers, screenshots).

## Typography

- **Display:** Sora Variable — headings at weight 620 (offsets light-on-dark irradiation), h3/h4 at 600; tracking
  tightens with size (−0.022em titles → −0.048em display).
- **Text:** Inter Variable with `cv11` + `ss01` alternates, 16–17px base, 1.6–1.75 line height; `.tnum` for numbers.
- **Fluid modular scale:** ≈ 1.25 on phones → ≈ 1.333 on desktop — `text-display`, `text-headline`, `text-title`, `text-lead`.
- **Measures:** lead copy ≤ 60ch (`.measure-lead`), long prose ≤ 68ch (`.prose-taren`).
- **Eyebrow:** 11–12px uppercase, tracking 0.11–0.16em (scales with width so labels stay on one line; the hero drops
  "Independent" below 360px).
- **Fonts are subset** (`npm run brand:fonts` → `src/assets/fonts/*-subset.woff2`): Latin + Latin-1 (å ä ö), punctuation,
  arrows; weight axis and used OpenType features kept. Inter 48 → 37 kB, Sora 34 → 30 kB. Both preloaded.

## Space & layout

- Container: `container-x` — max 78rem, gutter `clamp(1rem, …, 2.5rem)` (16px at phone width).
- Section rhythm: `py-20` mobile → `py-28/32` desktop. Card radius 1.25rem, panel radius 1.75rem.
- Layouts are composed per breakpoint (e.g. hero CTAs wrap, spotlight stacks media below copy,
  feature grid 1 → 2 → 3 columns), not scaled down.

## Motion

| Motion | Where | Reduced motion |
|---|---|---|
| Hero rise (translate only, 0.9s expo-out, staggered) | Home hero | Off |
| Orbit dots (composited CSS rotation, 26–64s) | Home hero | Static |
| Page entry (10px translate) | Every page | Off |
| Cross-document View Transition (0.28s fade) | Navigation | Off |
| Scroll reveal (`animation-timeline: view()`) | Cards, features | Off; content always visible |
| Card hover lift / phone tilt | Product cards, spotlight | Transitions shortened to ~0 |
| Menu slide/fade with `@starting-style` | Mobile menu | Off |

No scroll hijacking, no parallax, no autoplaying media.

## Components (`site/src/components`)

| Component | Purpose |
|---|---|
| `Header` | Sticky header, skip link, primary nav with `aria-current` |
| `MobileNavigation` | Modal `<dialog>` menu (Invoker Commands + JS fallback), 44px+ targets |
| `Footer` | Brand, explore/legal navigation, subtle Ko-fi link |
| `Button` | Link-styled CTA (primary/secondary/ghost); `external` adds new-tab hint + safe `rel` |
| `ExternalLink` | Inline external link with the same rules |
| `Container` | Layout primitive |
| `SectionHeading` | Eyebrow + heading + optional lead |
| `ProductCard` | Whole-card link (via title link), media, category, platforms, status |
| `ProductHero` | Product identity, status note, platforms, CTAs that only appear when real |
| `ProductStatus` | Status pill with screen-reader label |
| `ProductMedia` | Screenshot in phone frame → icon → branded placeholder (never a broken image) |
| `PhoneFrame` | Device frame around a real screenshot, AVIF/WebP `<picture>` |
| `ProductGallery` | Scroll-snap screenshot row, keyboard-scrollable region |
| `FeatureGrid` | Numbered feature highlights |
| `SupportCTA` | Optional Ko-fi section |
| `BrandMark` | TAREN wordmark (interim — see below) |
| `SEOHead` | Title, description, canonical, OG/Twitter, icons, font preloads, JSON-LD |
| `PageTransition` | CSS page-entry wrapper |
| `ErrorState` | 404/410 layout |
| `Swoosh` | Brand motif (orbit ring / arc) |
| `ProductShowcase` | Featured "product stage": icon, status, verified chips, CTAs, cross-fading phone on a swoosh orbit |
| `CrossfadePhone` | Device frame cross-fading up to 3 real captures (CSS; static with reduced motion) |
| `ProductTeaser` | Compact featured-product link (phone hero, mobile menu) |
| `ProductFacts` | "At a glance" strip from verified facts |
| `ProductSteps` | "How it plays/works" walkthrough with real screenshots |
| `ProductTimeline` | Verified progress milestones with source line |
| `ProductGallery` | Scroll-snap screenshots + accessible lightbox (dialog, ←/→, swipe, no-JS fallback) |

## Brand assets

Official masters (owner-supplied, kept unmodified) in `site/brand/masters/` — **not** publicly served (moved out of `public/` in 2.1):

| File | What it is | Readable on the dark site? |
|---|---|---|
| `taren-icon.png` (1254², RGBA) | Gradient T symbol with orbit swoosh | **Yes** |
| `taren-logo-light.png` (2172×724, RGBA) | Colour symbol + **dark navy** wordmark | Symbol yes, wordmark **no** (navy on navy) |
| `taren-logo-dark.png` (2172×724, RGBA) | Solid black symbol + wordmark | **No** (black on navy). For light backgrounds/print |

The filenames describe the logo colour, not the background, so neither full logo works directly on
`#0A1020`. Derivatives (generated by `node scripts/generate-brand-images.mjs`, reproducible):

| Derivative | Source | Processing | Used for |
|---|---|---|---|
| `src/assets/brand/taren-logo-on-dark.png` | `taren-logo-light.png` | Navy wordmark letters (low-chroma dark pixels only) set to `--color-text` `#F4F7FF`. Symbol and cyan A-accent untouched. Cropped to artwork. | Header (32px mobile / 36px ≥ 768px), mobile menu, footer (44px), social image |
| `src/assets/brand/taren-symbol.png` | `taren-icon.png` | Cropped to artwork, square. Pixel-identical to the master. | Hero orbit stage (≥ 768px; never downloaded on phones), favicons, app icons |
| `public/favicon.ico` (16/32/48), `favicon-32.png` | symbol | Transparent; reads on light and dark tabs | Browser tabs |
| `public/apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | symbol | On an opaque `#0A1020` tile (platforms fill transparency unpredictably) | Home screen / manifest |
| `public/og/taren.png` (1200×630) | on-dark logo | Rendered with site fonts | Default social image |

All derivatives keep alpha and the master aspect ratio, and are lossless PNG (no palette
quantisation). Invisible stray pixels from background removal (alpha ≤ 21, more than 4px from the
artwork) are cleared. On pages, `BrandMark` serves AVIF/WebP at 1×/2×/3× density via `astro:assets`,
so the large masters are never sent to browsers.

`BrandMark` props: `variant="logo" | "symbol"`, `height`, `alt` (decorative by default, because it sits in
links labelled "Taren — home"), `eager`.

**Owner note:** the white wordmark is a mechanical recolour of your official file. If you have (or
prefer to supply) an official "logo for dark backgrounds", drop it in and point the script at it.
