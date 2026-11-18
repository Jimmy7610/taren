# PDF Studio → Taren 2.2 handoff

This package contains the material for the PDF Studio product page on taren.se (Taren 2.2): verified product copy
and authentic screenshots. It was prepared 2026-11-18 from the PDFStudio repository, branch
`feature/taren-branding` (branding commit `4802bd8`, not merged to `main`).

> **PDF Studio is not released.** Version 0.9.0 is an unsigned preview. Present it on the page as
> **"In development · Preview"**, without a download button, price or release date.

## Contents
| Path | What |
|---|---|
| `TAREN_PRODUCT_INFO.md` | Listing fields, short and long description, verified features, what's missing, Windows requirements, status, release blockers, things to avoid on the site |
| `screenshots/` | 13 authentic PNG screenshots (1424×911) |
| `ASSET_MANIFEST.md` | Per-file description, resolution, size, source, build/version, SHA-256, content notes |
| `HANDOFF_README.md` | This file |

## Import into Taren 2.2 (suggested)
1. Copy `screenshots/` into the site's product image folder, e.g. `site/src/assets/products/pdfstudio/`. Let
   the image pipeline (astro:assets) create AVIF/WebP. Don't upscale: the images are 1×, captured at 100 % scaling.
2. Build the product page from `TAREN_PRODUCT_INFO.md`. Use the "Short description" for cards and the "Long
   description" for the page. List only the features under "Current features (verified)".
3. Hero: `03-document-dark.png` (or `01-start-dark.png`), which match the dark site. Feature gallery: 05–10.
   Taren credit: `11-about-taren-dark.png`.
4. Alt texts: use the "Content" column in `ASSET_MANIFEST.md`.
5. Product name **PDF Studio**, with **PDF Studio's own icon** (in the PDFStudio repo:
   `src/PDFStudio.App/Assets/AppIcon256.png`). Don't use the Taren symbol as the product icon.
6. Status badge: "In development" or "Preview". Remove it only when the release blockers below are resolved.
7. Make these changes on a branch of the Taren repo and review them before anything reaches the production
   taren.se.

## Verification done for this package
- Every file listed in the manifest exists, and its resolution, size and SHA-256 were checked.
- Every screenshot was visually reviewed. No usernames, file paths, recent files, e-mail, personal documents or
  private settings are visible. All document content is synthetic test data. The desktop that showed through the
  window's invisible border was cropped away.
- Claims were cross-checked against the code: the ribbon command list, CLI verbs, the installer and release
  outputs, and `docs/FEATURE_MATRIX.md` and `docs/KNOWN_ISSUES.md`. One correction was made: the `pdfstudio` CLI
  is not shipped in the installer or ZIP, so it is listed as a developer tool, not an end-user feature.
- The package contains only `.md` and `.png` files: no executables, installers, archives, DLLs, configuration,
  logs or secrets.
- The Taren branding in About was approved by the owner, and the taren.se link was tested manually on Windows.
  Automated: 107/107 tests passed on the branding build.

## Remaining issues
- **Release blockers** (details in `TAREN_PRODUCT_INFO.md`): no code signing (SmartScreen warning), product name
  and project licence not decided, manual checks open (physical printer, 125–250 % scaling, high contrast,
  Narrator, touch/pen), PDFium not sandboxed, many dialogs Swedish-only, no distribution channel chosen.
- **Screenshots:** Swedish UI except 13. All are 100 % scale (1×), and there are none at high DPI. 01–10 show the
  pre-branding build (ab78762); those views did not change with the branding. If the site needs English or 2×
  images, they must be captured again from the app; don't edit these.
- **About dialog:** the third-party licences box shows only its first line. This is a known bug that predates the
  branding and is listed in `docs/KNOWN_ISSUES.md`. It is visible in 11–13.
- This package lives in `artifacts/`, which git ignores. It is not committed; the source docs and screenshots are.
