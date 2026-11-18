# Taren 2.1 — Visual Polish: review findings and recommendations

Status: **proposal, not started.** Based on the verified preview at https://taren-2-preview.pages.dev
(commit `ca56776`) on 2026-11-18. Nothing here has been implemented.

## 0. Verification baseline (what 2.1 starts from)

- Preview serves `ca56776` exactly. Every page is byte-identical to a local build of that commit.
- Real-Cloudflare behaviour confirmed: `/about` → 301 `/studio/`; `/games/*` and `/experiments/*` → 410;
  unknown routes → real 404; CSP and security headers live.
- The full Playwright suite (134 tests, including visual baselines) passes against the live preview.
  GitHub Actions run 44263516817 passed.
- Official branding renders crisply at 1×/2× in the header, menu, footer, hero symbol and favicons.
- All 19 Ko-fi links across the 7 pages are exactly `https://ko-fi.com/taren`. There are zero
  third-party requests.

## 1. Issues found during verification (fix first, low risk)

| # | Issue | Evidence | Recommendation |
|---|---|---|---|
| I1 | **Hero symbol clipped at ≥ ~1600px.** The orbit system is positioned against the viewport (`right: -24%`), not the content column, so at 1920px the symbol is cut off at the right edge and drifts away from the copy. | Live screenshot at 1920×1080 | Anchor the orbit system to the 78rem container (or its right edge). Cap its size. Add 1920 and 2560 to the visual-regression matrix. |
| I2 | **Preview is indexable.** `taren-2-preview.pages.dev` sends no `X-Robots-Tag`. Canonicals point to taren.se, but that domain serves different content until cutover. | Response headers | Add a host rule in `_headers`: `https://:project.pages.dev/*` → `X-Robots-Tag: noindex`. It only affects `*.pages.dev`, never taren.se. |
| I3 | **Same-name brand files cached for 1 day** (`/*.png`, `/*.ico`, `max-age=86400`). The edge purged correctly this time, but browsers may keep old favicons or OG images for a day after a change. | `_headers`; a deleted `favicon.svg` was still served from cache (HIT, age 1436 s) | Shorten to `max-age=3600, stale-while-revalidate=86400` for icons and OG images, or fingerprint them. |
| I4 | **Mobile hero dead space.** At 390×844, about 20% of the first screen is empty below the CTAs (`min-height: 88dvh`). | Live screenshot | Reduce the min-height on small screens, or use the space for a product teaser (see P1). |
| I5 | **Brand masters are publicly downloadable** at `/branding/*.png` (1.7 MB, unreferenced). | Route check | Fine as a press kit; otherwise move the masters out of `public/` (e.g. `src/assets/brand/masters/`). Owner decision. |
| I6 | Pulse Garden mobile Lighthouse performance is 99 (LCP 2.0 s, the hero screenshot). | LHCI | Preload the hero screenshot's AVIF at the mobile width, or serve a slightly smaller first-view size. |

## 2. Product presentation

- **P1 — Homepage spotlight 2.0.** Replace the two static phones with a composed "product stage":
  one hero phone that cross-fades through 3 real captures (CSS only; static on reduced motion),
  plus an "at a glance" chip row (Game · iPhone · In development · Offline · EN/SV). On phones, put a
  compact version of this directly under the hero CTAs (fixes I4).
- **P2 — Product page structure.**
  1. Hero (as now).
  2. "At a glance" spec strip: genre, platform, status, languages, offline.
  3. "How it plays": a 3-step visual walkthrough using real screenshots with short captions
     (pick → preview → chain).
  4. Highlights.
  5. Gallery with a keyboard-accessible `<dialog>` lightbox.
  6. **Honest progress timeline** built only from verified milestones (M0–M3 done, iOS export
     prepared, not yet on iPhone/TestFlight).
  7. Support.
- **P3 — Per-product accent colour.** Add an optional `accent` field to the schema (Pulse Garden: its
  teal/pink/amber from the icon). Use it for the card glow, hero light and status ring, so every future
  product feels distinct inside the Taren frame. Validate contrast in the schema test.
- **P4 — Catalogue layout that scales.** With one product, show a full-width featured layout instead of
  a card next to a "workshop" placeholder. Switch to the grid automatically at two or more products.
- **P5 — Per-product social images** generated at build (icon + key screenshot + name) for products
  without an owner-made OG image.
- **P6 — Optional real gameplay clip** (owner capture): muted, poster-first, `preload="none"`, never on
  reduced-motion or Save-Data. Only if a real capture exists. No mock-ups.

## 3. Premium visual identity

- **V1 — Derive the accent palette from the official symbol.** The symbol runs cyan → blue → magenta;
  the current tokens are cyan/purple. Sample the exact stops from `taren-icon.png`, add a
  `--color-magenta` token and update the signature gradient (`.accent`, error codes, focus details) so
  the site and the mark share one gradient.
- **V2 — Use the swoosh arc as the recurring motif** instead of generic circles: hero orbit, section
  dividers, card hover highlight. One consistent geometric signature.
- **V3 — Surface depth.** Add a very subtle grain overlay (≈2 kB tiled PNG, 3–4% opacity) to reduce
  gradient banding on large panels. Add a 1px gradient border on card hover.
- **V4 — Brand usage page** (optional): logo on dark and light, clear-space, minimum sizes, downloads
  (ties in with I5).
- Keep: restraint, a dark-first palette, no constant glows, no particles beyond the hero.

## 4. Typography

- **T1 — Scale audit.** Formalise a modular scale (≈1.25) for title/headline/display and set measure
  limits (lead ≤ 60ch, prose ≤ 68ch).
- **T2 — Inter features.** `font-feature-settings: "cv11", "ss01"` for refined forms and `tnum` for
  numbers (scores, years, counts).
- **T3 — Display tuning.** Per-size tracking for Sora (tighter at display sizes, looser at titles) and a
  slightly heavier variable weight (~620) for headlines on dark, to offset irradiation.
- **T4 — Eyebrow wrap.** "INDEPENDENT SOFTWARE STUDIO · SWEDEN" breaks awkwardly at 320px. Use a
  controlled break (keep "· Sweden" together, or a shorter mobile string).
- **T5 — Font weight budget.** Subset Sora to the glyphs actually used (Latin basic), about −20 kB.
  Keep the preload.

## 5. Responsive design

- **R1 — Wide screens (≥ 1600px):** let hero visuals and the spotlight bleed to ~90rem while text stays
  at 78rem (fixes I1). Test 1920 and 2560.
- **R2 — Tablet (768–1279px):** design a dedicated composition. Today the hero graphic is simply dimmed;
  consider the symbol above the headline or a smaller orbit beside it.
- **R3 — Phones:** a larger single-phone spotlight, gallery snap with a peek of the next screenshot,
  48px primary CTAs, and the menu gains a compact "Featured product" card.
- **R4 — Landscape phones** (844×390, 932×430): check hero height, menu scroll and safe areas; add these
  to the test matrix.
- **R5 — Visual regression:** extend baselines to 320/768/1920 and the open menu. Keep the Lighthouse budget.

## 6. Proposed sequence

1. **2.1a — Fixes (≈½–1 day):** I1–I4, I6, R5 test matrix.
2. **2.1b — Identity & type (≈1–2 days):** V1–V3, T1–T5.
3. **2.1c — Product presentation (≈2–3 days):** P1–P4 (P5–P6 when assets exist).
4. **2.1d — Responsive QA:** R1–R4. Full test suite, Lighthouse, owner review on the preview.

## 7. Owner input needed before starting

- Approve the scope and order above (or reprioritise).
- Is there real gameplay footage for Pulse Garden (P6)? Should the brand masters stay public (I5)?
- Any additional products ready for publication (with verified facts and real assets)?
