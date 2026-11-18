# PDF Studio – product assets (handoff)

Verified material for a future PDF Studio product page. Imported unchanged from the PDFStudio repository's
handoff package. PDFStudio is a local repository with no GitHub remote: branch `feature/taren-branding`,
commits `4802bd8` (branding) and `8ca2301` (docs). The package was prepared 2026-11-18.

**PDF Studio is not released.** Version 0.9.0 is an unsigned preview. Any page built from this material
must stay `published: false` (draft) until the owner approves it, use `status: in-development`, and have
no `downloadUrl`.

## Where things are
| Path | What |
|---|---|
| `site/src/assets/products/pdfstudio/*.png` | 13 authentic screenshots, 1424×911, byte-identical to the handoff package |
| `docs/products/pdfstudio/TAREN_PRODUCT_INFO.md` | Product copy, verified features, requirements, status, release blockers, what not to claim |
| `docs/products/pdfstudio/ASSET_MANIFEST.md` | Per-screenshot description, source, build/version, SHA-256, content notes |
| `docs/products/pdfstudio/HANDOFF_README.md` | The package's own README (its `screenshots/` paths = `site/src/assets/products/pdfstudio/` here) |

Nothing else in the repository changed. No product content file (`site/src/content/products/pdfstudio.md`)
exists yet, so the build, tests and site output are unaffected.

## Instructions for the session that builds the product page
1. Work on a new branch from `feature/pdfstudio-product-assets` (or after it is merged). Don't push to
   `main`, `feature/taren-2.0` or `preview/drafts` without the owner's approval.
2. Read `TAREN_PRODUCT_INFO.md` first. Use only the features under "Current features (verified)". Respect
   "Not available yet" and "What to avoid on the website". The `pdfstudio` CLI is a developer tool and is not
   shipped, so don't list it as a feature.
3. Create `site/src/content/products/pdfstudio.md` from `_example-product.md` (follow
   `docs/PRODUCT_MANAGEMENT.md`):
   - `slug: pdfstudio`, `name: PDF Studio`, `category: App`, `platforms: [Windows 10, Windows 11]`
   - `status: in-development`, an honest `statusNote` (unsigned 0.9.0 preview, not released, no download),
     `published: false`, `featured: false`, `device: desktop`
   - a source comment at the top, like `lumen-capture.md`, citing the commits above
4. **Screenshot ratio:** `device: desktop` requires 1000:660 images (unit test in
   `site/tests/unit/content.test.ts`). The handoff PNGs are 1424×911 (≈1.563), so they can't be referenced
   directly. Create derivatives (e.g. `*.webp` at 1000×660, like Lumen Capture) in the same folder **without
   altering the originals**. Preferred: pad the image top and bottom to 1424×939 with the page's dark
   background colour, then scale it down. Cropping 22 px from each side would cut the window's title-bar
   buttons. Record the method in `screenshotsNote` and in the manifest. Don't upscale.
5. Suggested images: hero `03-document-dark.png`; gallery 01, 03, 05, 06, 07/08, 09, 10; Taren credit
   `11-about-taren-dark.png`. Alt text: use the "Content" column of `ASSET_MANIFEST.md`. `screenshotsNote`:
   real captures of version 0.9.0, Swedish UI (13 is English), 100 % scaling.
6. **Icon:** added later on `feature/pdfstudio-official-icon` as `site/src/assets/products/pdfstudio/icon.png`.
   It is a byte-identical copy of PDF Studio's own `AppIcon256.png` (256 px, enough for the largest 240 px
   rendition). Never use the Taren symbol as PDF Studio's icon.
7. Update the "Current catalogue" row for PDFStudio in `docs/PRODUCT_MANAGEMENT.md`. Run `npm run check`,
   the unit tests and the e2e tests. Preview with `TAREN_SHOW_DRAFTS=1 npm run dev`.
