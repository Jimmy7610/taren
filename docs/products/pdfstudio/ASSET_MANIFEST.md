# Asset manifest – PDF Studio handoff for Taren 2.2

Product: **PDF Studio 0.9.0 (preview, unsigned, not released)** · branch `feature/taren-branding` · branding commit `4802bd8`.
Package prepared 2026-11-18. All images are PNG (RGB, no metadata chunks) and are authentic captures of the running app
taken by the FlaUI UI tests. The only processing was removing the window's invisible 8 px resize border (left, right,
bottom) and its top pixel row, so the desktop behind the window does not show. App content is not altered.

| File | Resolution | Size | Content | Source (repo `docs/screenshots/`) | Captured from | SHA-256 (first 16) |
|---|---|---|---|---|---|---|
| `screenshots/01-start-dark.png` | 1424×911 | 157 kB | **Start page, dark theme**: Hero, quick actions, empty recent-files list, drop zone | `ui-00-start-dark.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `1af734e2cc10c407` |
| `screenshots/02-start-light.png` | 1424×911 | 166 kB | **Start page, light theme**: Same as 01 in the light theme | `ui-00-start-light.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `b22f2e428d2d0cef` |
| `screenshots/03-document-dark.png` | 1424×911 | 110 kB | **Document workspace, dark theme**: Tabs, ribbon, thumbnails, page on canvas, properties pane, page navigator | `ui-00-document-dark.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `47eba058ecc13706` |
| `screenshots/04-document-light.png` | 1424×911 | 98 kB | **Document workspace, light theme**: Same as 03 in the light theme | `ui-00-document-light.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `4bc7189a0e5363fa` |
| `screenshots/05-command-palette.png` | 1424×911 | 125 kB | **Ctrl+K command search**: Typing "rotera hö" finds Rotera höger (Rotate right) | `ui-13-command-palette.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `473262a7eb11f2de` |
| `screenshots/06-search.png` | 1424×911 | 122 kB | **Full-text search**: Search pane with the hit highlighted on page 4; "saved and verified" banner | `ui-03-search.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `688b800b6a9d40b1` |
| `screenshots/07-redaction-marked.png` | 1424×911 | 131 kB | **Redaction: area marked**: The Protect tab with an area marked over synthetic account number SECRET-1234-5678 | `ui-07-redaction-marked.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `24c5dce72e04fdb3` |
| `screenshots/08-redaction-saved.png` | 1424×911 | 121 kB | **Redaction: applied and saved**: The account number is removed from the file, and the saved file is verified | `ui-10-redaction-saved.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `637f690e7da85917` |
| `screenshots/09-forms.png` | 1424×911 | 122 kB | **Filling in a form**: Forms pane with a text field, checkbox and list (AcroForm); fictitious name typed by the UI test | `ui-11-forms.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `ac0c4c2cb069255c` |
| `screenshots/10-print-dialog.png` | 1424×911 | 109 kB | **Print dialog with preview**: Printer, pages, copies, orientation, scaling, pages per sheet; "Microsoft Print to PDF" | `ui-12-print-dialog.png` | 0.9.0 · ab78762 (2026-11-13), Debug build, UI-test run | `b3dfae08baaa1288` |
| `screenshots/11-about-taren-dark.png` | 1424×911 | 126 kB | **About PDF Studio, dark theme**: PDF Studio's own icon/name/version, then the Taren symbol · En Taren-app · taren.se (link focused) | `ui-14-about-taren-dark.png` | 0.9.0 · 4802bd8 (2026-11-18), published Release build, UI-test run | `1b67d8ab4bed0002` |
| `screenshots/12-about-taren-light.png` | 1424×911 | 114 kB | **About PDF Studio, light theme**: Same as 11 in the light theme | `ui-14-about-taren-light.png` | 0.9.0 · 4802bd8 (2026-11-18), published Release build, UI-test run | `00c0ad840a136c3a` |
| `screenshots/13-about-taren-english.png` | 1424×911 | 123 kB | **About PDF Studio, English UI**: "A Taren App" with English UI chrome | `ui-14-about-taren-dark-en.png` | 0.9.0 · 4802bd8 (2026-11-18), published Release build, UI-test run | `d2b659e72653a494` |

Resolution: 1424×911 physical px, captured at 100 % display scaling (96 DPI). They are not retina/2× images; scale them down, not up, on the site.

## Documents
| File | Purpose |
|---|---|
| `TAREN_PRODUCT_INFO.md` | Product copy, verified features, requirements, status, release blockers (copy of `docs/TAREN_PRODUCT_INFO.md`, with paths adapted to this package) |
| `ASSET_MANIFEST.md` | This file |
| `HANDOFF_README.md` | How to import the package into Taren 2.2, rules and open issues |

## Not included (on purpose)
- Executables, installers, ZIPs, DLLs, settings, logs, recent-file lists, source code.
- The Taren symbol file. Taren 2.2 already has the official master in its own repo.
- PDF Studio's app icon. Use `src/PDFStudio.App/Assets/AppIcon256.png` from the PDFStudio repo if the page needs it.
- `ui-09-redaction-report.png`, which was captured mid-animation (semi-transparent dialog). The password and unsaved-changes dialogs were left out as less relevant.

## Content notes
- All document content is synthetic test data from the PDFStudio test suite: "Sida A–E", "LABEL-D", "SECRET-1234-5678", "Kontonummer" and "Testformulär". The name "Eva Åberg" in 09 is a fictitious value typed by the UI test (`tests/PDFStudio.UITests/SmokeTests.cs`).
- File names shown in tabs (smoke.pdf, palette.pdf, hemlig.pdf, formular.pdf, utskrift.pdf, about.pdf, mixed-orientation.pdf) are test fixtures. No paths, usernames or real recent files are visible.
- 10 shows "Microsoft Print to PDF", a built-in Windows printer, not a personal device.
- The views in 01–10 were captured on 2026-11-13 (ab78762). The Taren branding changed only the About dialog, and the views are pixel-identical to the branded build apart from the background behind the window.
