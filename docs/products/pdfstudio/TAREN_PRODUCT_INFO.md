# PDF Studio – product information for taren.se (Taren 2.2)

Prepared 2026-11-18 on branch `feature/taren-branding` from the code, tests and docs in this repository.
Every statement below refers to evidence in the PDFStudio repository (paths relative to the repo root). Nothing here is a release announcement.

> **Status for the website: in development – preview, not released.** Version 0.9.0 is an unsigned preview
> build that has only been tested on the developer's machine. Do not show a download button or price.

## Suggested listing

| Field | Value |
|---|---|
| Name | **PDF Studio** (working name; see release blockers) |
| Tagline | A Taren App |
| Status label | In development · Preview 0.9.0 |
| Platform | Windows 11 / Windows 10 (version 2004 or later), x64 |
| Category | Productivity · Documents |
| Price / licence | Not decided (LICENSE.md is a placeholder) |
| Icon | `src/PDFStudio.App/Assets/AppIcon256.png` (PDF Studio's own icon; do not replace it with the Taren symbol) |

### Short description (≈ 40 words)
PDF Studio is a native Windows app for reading, editing, organising, signing, protecting and printing PDF files.
It works fully offline, without an account. There is no telemetry, and your documents never leave your computer.

### Long description
PDF Studio is a native Windows desktop app for everyday and advanced PDF work. It is built with WinUI 3 and .NET 10
and follows Windows 11 Fluent design with Mica and light, dark and high-contrast themes. Documents open in tabs.
Ctrl+K command search finds every tool. Every change can be undone until you save. Saving is atomic, so a failed
save never damages the original file.

Rearrange, rotate, insert, extract, split and merge pages. Add text, shapes, images, highlights, notes, stamps
and freehand comments. Fill in forms. Make scanned pages searchable with offline OCR. Encrypt files with AES-256,
and remove sensitive content permanently with true redaction, which deletes the content instead of covering it.
PDF Studio can also apply and validate digital signatures.

Everything runs locally. PDF Studio makes no network calls and collects no telemetry. Logs never contain document
content or file names.

## Current features (verified)
Source: `docs/FEATURE_MATRIX.md`. "Verified" means it works end to end in the app and an
automated test checks the saved file with an independent PDF parser (PdfPig).

**Read and navigate**
- Tabs, thumbnails, go to page, zoom 25–800 %, fit width/page, continuous scrolling
- Full-text search with highlighted hits; text selection and copy (within one page)
- Bookmarks, attachments, document properties

**Organise pages**
- Rearrange (drag and drop or keyboard), rotate, insert blank or from file, duplicate, delete
- Extract, split (every N pages, every page, ranges), merge with page selection
- Crop, page numbers, Bates numbering, watermark

**Edit and comment**
- Add text, rectangles, ellipses, lines, arrows, notes and images; move, scale and delete objects
- Highlight, underline, strikeout, freehand, stamps, text boxes (saved with appearance streams)
- Edit existing text, one text object at a time. Edits are refused when the embedded font lacks the glyphs.

**Forms and signatures**
- Fill text fields, checkboxes, radio buttons and lists; flatten forms
- Visual signature (draw, type or image), clearly marked as not cryptographic
- Digital signature (CMS/SHA-256) and signature validation; warnings for modified signed documents

**Protect**
- Open password-protected files; encrypt with user/owner password (AES-256/128)
- True redaction (text, images, vector graphics, annotations, metadata and earlier revisions are removed)
- Sanitise (metadata, attachments, JavaScript, links, form data)

**Convert and OCR**
- Images ⇄ PDF, text → PDF, Office → PDF (requires Microsoft Office installed)
- Offline OCR with Windows OCR for the installed OCR languages (verified: Swedish)
- Optimise (recompress, remove unused objects)

**Print and batch**
- Print all, current, selected pages or a range, with preview, copies, orientation, fit/actual size, duplex,
  N-up and grayscale
- For developers: a command-line tool `pdfstudio` (info, text, merge, split, extract, encrypt,
  verify-signatures, and folder batches for rotate/optimise/sanitise). It is **not** included in the installer
  or the portable ZIP; you must build it from source. Don't list it as an end-user feature.

**App**
- Swedish UI (default); English covers the main interface
- Light, dark and high-contrast themes; keyboard shortcuts for the main actions
- Crash recovery for unsaved documents
- Per-user installer (no admin rights) and a portable ZIP

## Not available yet (don't list these as features)
Two-page view, form designer, image replacement, find and replace, scanner support, HTML → PDF, PDF → Office,
PDF/A and PDF/UA compliance, batch UI, timestamped/long-term signatures (TSA/OCSP/LTV), local AI. Source:
`docs/KNOWN_ISSUES.md`.

## Windows requirements
| | |
|---|---|
| OS | Windows 10 version 2004 (build 19041) or later, Windows 11 recommended (`TargetPlatformMinVersion` 10.0.19041.0) |
| Architecture | x64 only (ARM64 not built or tested) |
| Runtime | None to install: .NET 10 and the Windows App SDK are bundled (self-contained) |
| Install | Per user, no administrator rights; installer ≈ 140 MB, portable ZIP ≈ 100 MB |
| Optional | Microsoft Office (Office → PDF only); Windows OCR language packs for other OCR languages |
| Network | Not required. PDF Studio makes no network calls. The taren.se link in the About dialog opens your browser only when you click it. |

## Development status
- Version **0.9.0 – preview**. Phases 0–8 of the plan are done; phase 9 (local AI) has not started
  (`docs/STATUS.md`).
- Automated tests on this branch: 107 automated tests, all passing (41 unit, 35 integration, 11 security,
  10 rendering/print/OCR, 9 UI, 1 installation). See the verification report.
- Tested on one developer PC (Windows 11, 100 % scaling). No public beta.
- Taren branding: "A Taren App" with the official Taren symbol and a taren.se link in the About dialog
  (this branch, not merged).

## Screenshots (authentic)
All screenshots are in `screenshots/` and were captured from the running app by the automated UI tests (FlaUI).
None are mock-ups. Details are in `ASSET_MANIFEST.md`.

| File | Shows | Suggested use |
|---|---|---|
| `screenshots/01-start-dark.png` | Start page, dark theme | Hero image (dark) |
| `screenshots/02-start-light.png` | Start page, light theme | Hero image (light) |
| `screenshots/03-document-dark.png` | Document workspace, dark theme | Main product shot |
| `screenshots/04-document-light.png` | Document workspace, light theme | Main product shot (light) |
| `screenshots/05-command-palette.png` | Ctrl+K command search | Feature: command search |
| `screenshots/06-search.png` | Full-text search | Feature: search |
| `screenshots/07-redaction-marked.png` | Redaction: area marked | Feature: true redaction |
| `screenshots/08-redaction-saved.png` | Redaction: applied and saved | Feature: true redaction |
| `screenshots/09-forms.png` | Filling in a form | Feature: forms |
| `screenshots/10-print-dialog.png` | Print dialog with preview | Feature: printing |
| `screenshots/11-about-taren-dark.png` | About PDF Studio, dark theme | Taren attribution |
| `screenshots/12-about-taren-light.png` | About PDF Studio, light theme | Taren attribution (light) |
| `screenshots/13-about-taren-english.png` | About PDF Studio, English UI | Taren attribution (EN) |

The UI language is Swedish (the default), except in 13. The documents shown are synthetic test files.

## Release blockers
1. **No code signing.** `PDFStudio.exe` and the installer are unsigned, so Windows SmartScreen shows a warning.
   A certificate (OV/EV) is needed.
2. **Product name not decided.** "PDF Studio" is a working name with no trademark check
   (`docs/RELEASE_CHECKLIST.md`).
3. **Project licence not decided.** LICENSE.md is a placeholder. Full third-party licence texts must be included
   for public distribution. PDFsharp is pinned to 6.2.4 (MIT); 6.5.0+ is AGPL.
4. **Manual checks not done:** physical printer, display scaling 125–250 %, multiple monitors, high contrast,
   Narrator, touch/pen, very large files, Open with from Explorer after install.
5. **Security hardening:** PDFium runs in the UI process (no sandbox).
6. **Localisation:** many dialog texts are Swedish only.
7. **Distribution channel** not chosen (direct download, MSIX/Store or winget).

## Verification of the Taren branding (this branch)
- Automated: the About row appears in light and dark themes and in Swedish and English. The taren.se link is a
  Hyperlink control, reachable with Tab and showing a focus ring. The installer sets
  `URLInfoAbout = https://taren.se`, and the symbol file ships with the app.
- Manual, done by the owner on Windows (2026-11-18): clicking the link opens https://taren.se in the
  default browser. The About dialog was visually approved.
- Manual, still open: the About row at 150–200 % display scaling and in high contrast. The test PC runs at 100 %.

## What to avoid on the website
- Don't say "released", "available now" or "download" until blockers 1–3 are resolved.
- Don't claim Acrobat parity, PDF/A or PDF/UA compliance, AI features or ARM64 support.
- Don't present the visual signature as a legal or cryptographic signature.
