---
# Sources (verified 2026-11-18): docs/products/pdfstudio/TAREN_PRODUCT_INFO.md, ASSET_MANIFEST.md and
# HANDOFF_README.md — prepared from the local PDFStudio repository (no GitHub remote), branch
# feature/taren-branding, commits 4802bd8 (branding) and 8ca2301 (docs); imported in 5ed61a0.
# Screenshots: authentic FlaUI UI-test captures of 0.9.0 (1424×911, 100 % scaling; 01–10 from ab78762,
# 11–13 from 4802bd8). Web derivatives *.web.webp: padded top/bottom with each image's own edge colour to
# 1000:660, Lanczos down-scale to 1000×660, lossless WebP (scripts/fit-desktop-screenshots.mjs).
# Icon: PDF Studio's own app icon, byte-identical copy of src/PDFStudio.App/Assets/AppIcon256.png (256×256 RGBA,
# SHA-256 a981670567deddc9f0112f2cfac6776cabf980c2dcb4b44decf77f8d3503a920), not the Taren symbol.
slug: pdfstudio
name: PDF Studio
tagline: Read, edit, organise, sign, protect and print PDFs — offline.
description: >-
  A native Windows app for reading, editing, organising, signing, protecting and printing PDF files.
  It works fully offline, without an account, and your documents never leave your computer.
category: App
platforms: [Windows 10, Windows 11]
status: beta
statusNote: >-
  Public beta 0.9.0-beta.2 for Windows, released 20 November 2026. The installer is not
  code-signed, so Windows SmartScreen may show a warning.
published: true
featured: false
order: 2
device: desktop
icon: ../../assets/products/pdfstudio/icon.png
iconAlt: >-
  PDF Studio app icon — a white page with a folded corner and four violet text lines on a rounded
  square with a violet-to-pink gradient.
heroImage: ../../assets/products/pdfstudio/01-start-dark.web.webp
heroImageAlt: >-
  PDF Studio's start page in the dark theme, with quick actions, recent files and a drag-and-drop area.
accent: '#A48BFF'
accentAlt: '#F07AB4'
screenshotsNote: >-
  Real captures of PDF Studio 0.9.0 from its automated UI tests on Windows 11 at 100 % scaling. The
  interface is in Swedish, its default language; all documents are synthetic test files.
facts:
  - label: Type
    value: PDF reader and editor
  - label: Runs on
    value: Windows 10 (2004+) and 11, x64
  - label: Built with
    value: WinUI 3 · .NET 10
  - label: Connection
    value: Works fully offline
  - label: Privacy
    value: No account, no telemetry
  - label: Install
    value: Per user, no admin rights
  - label: Languages
    value: Swedish and English (main interface)
  - label: Version
    value: 0.9.0-beta.2 · public beta
stepsEyebrow: How it works
stepsTitle: Find it, change it, save it safely
steps:
  - title: Find any tool or word
    description: >-
      Press Ctrl+K and type to find any command. Full-text search highlights every hit, and documents
      open in tabs with thumbnails and zoom from 25 to 800 %.
    image: ../../assets/products/pdfstudio/05-command-palette.web.webp
    alt: The Ctrl+K command search — typing "rotera hö" finds Rotera höger (Rotate right).
  - title: Edit, fill in and protect
    description: >-
      Rearrange pages, comment, fill in forms or mark content for true redaction. Every change can be
      undone until you save.
    image: ../../assets/products/pdfstudio/07-redaction-marked.web.webp
    alt: The Protect tab with an area marked for redaction over a synthetic account number, SECRET-1234-5678.
  - title: Save without risk
    description: >-
      Saving is atomic, so a failed save never damages the original. Redacted content is removed from the
      file, not just covered.
    image: ../../assets/products/pdfstudio/08-redaction-saved.web.webp
    alt: Redaction applied and saved — the account number is removed from the file and the saved file is verified.
gallery:
  - image: ../../assets/products/pdfstudio/01-start-dark.web.webp
    alt: Start page in the dark theme with quick actions, an empty recent-files list and a drop zone.
    caption: Start page, dark theme
  - image: ../../assets/products/pdfstudio/03-document-dark.web.webp
    alt: Document workspace in the dark theme with tabs, ribbon, thumbnails, page canvas and properties pane.
    caption: Document workspace, dark theme
  - image: ../../assets/products/pdfstudio/04-document-light.web.webp
    alt: Document workspace in the light theme with tabs, ribbon, thumbnails, page canvas and properties pane.
    caption: Document workspace, light theme
  - image: ../../assets/products/pdfstudio/05-command-palette.web.webp
    alt: Ctrl+K command search finding Rotera höger (Rotate right) after typing "rotera hö".
    caption: Ctrl+K command search
  - image: ../../assets/products/pdfstudio/06-search.web.webp
    alt: Full-text search pane with a hit highlighted on page 4 and a "saved and verified" banner.
    caption: Full-text search with highlighted hits
  - image: ../../assets/products/pdfstudio/07-redaction-marked.web.webp
    alt: An area marked for redaction over the synthetic account number SECRET-1234-5678.
    caption: True redaction — area marked
  - image: ../../assets/products/pdfstudio/08-redaction-saved.web.webp
    alt: The account number removed from the saved file, with the saved file verified.
    caption: True redaction — removed and saved
  - image: ../../assets/products/pdfstudio/09-forms.web.webp
    alt: Forms pane filling in a text field, a checkbox and a list in an AcroForm, with a fictitious name.
    caption: Filling in a form
  - image: ../../assets/products/pdfstudio/10-print-dialog.web.webp
    alt: Print dialog with preview, printer, pages, copies, orientation, scaling and pages per sheet.
    caption: Printing with preview
  - image: ../../assets/products/pdfstudio/02-start-light.web.webp
    alt: Start page in the light theme with quick actions, an empty recent-files list and a drop zone.
    caption: Start page, light theme
features:
  - title: Read and navigate
    description: >-
      Tabs, thumbnails, go to page, zoom from 25 to 800 % and continuous scrolling. Full-text search
      highlights every hit; bookmarks, attachments and document properties are at hand.
  - title: Organise pages
    description: >-
      Rearrange by drag and drop or keyboard, rotate, insert, duplicate, delete, extract, split and merge.
      Add crop, page numbers, Bates numbering or a watermark.
  - title: Edit and comment
    description: >-
      Add text, shapes, images, highlights, notes, stamps and freehand ink. Existing text can be edited one
      text object at a time when the embedded font has the glyphs.
  - title: Forms and signatures
    description: >-
      Fill in and flatten forms. Apply and validate digital signatures (CMS/SHA-256). Visual signatures are
      also available and clearly marked as not cryptographic.
  - title: Protect for real
    description: >-
      Encrypt with AES-256. True redaction removes text, images, graphics, annotations, metadata and earlier
      revisions instead of covering them, and Sanitise strips hidden data.
  - title: Convert, OCR and print
    description: >-
      Images and text to PDF, and Office to PDF when Microsoft Office is installed. Offline OCR uses Windows
      OCR. Print with preview, duplex, N-up and grayscale.
milestones:
  - title: Reading, search and navigation
    state: done
    note: Tabs, thumbnails, zoom, full-text search, bookmarks and attachments.
  - title: Page organisation
    state: done
    note: Rearrange, rotate, insert, extract, split, merge, crop, page and Bates numbering, watermark.
  - title: Editing, comments and forms
    state: done
    note: Objects, annotations with appearance streams, single-object text editing, form filling.
  - title: Signatures, protection and redaction
    state: done
    note: Digital signatures with validation, AES-256 encryption, true redaction and sanitising.
  - title: Conversion, OCR, printing and installer
    state: done
    note: Offline OCR, print with preview, crash recovery, a per-user installer and a portable version.
  - title: Automated verification
    state: done
    note: 107 automated tests pass, checking saved files with an independent PDF parser.
  - title: Testing beyond one PC
    state: next
    note: Physical printers, 125–250 % display scaling, multiple monitors, high contrast, Narrator and touch.
  - title: Public beta
    state: done
    note: Version 0.9.0-beta.2 published 20 November 2026 as an unsigned beta.
milestonesSource: PDF Studio feature matrix, status and release checklist (version 0.9.0, November 2026)
beforeRelease:
  - Code signing, so Windows does not show a SmartScreen warning.
  - Review potential naming conflicts before wider distribution.
  - Manual testing on more hardware, display scaling levels and assistive technology.
  - English translations for the remaining Swedish-only dialogs.
  - Broader release and distribution beyond this public beta.
requirements:
  - label: Operating system
    value: Windows 10 version 2004 (build 19041) or later. Windows 11 recommended.
  - label: Architecture
    value: x64 only. ARM64 is not built or tested.
  - label: Runtime
    value: Nothing to install — .NET 10 and the Windows App SDK are included.
  - label: Installation
    value: Per user, without administrator rights. Installer about 140 MB; portable version about 100 MB.
  - label: Optional
    value: Microsoft Office for Office → PDF. Windows OCR language packs for OCR in more languages.
  - label: Network
    value: Not required. PDF Studio makes no network calls.
aboutImage:
  image: ../../assets/products/pdfstudio/11-about-taren-dark.web.webp
  alt: >-
    The About PDF Studio dialog in the dark theme: PDF Studio's own icon, name and version, followed by
    the Taren symbol, "En Taren-app" and a taren.se link.
  caption: About PDF Studio — PDF Studio's own identity, then the Taren credit (Swedish UI, 0.9.0).
---

PDF Studio is a native Windows desktop app for everyday and advanced PDF work. It is built with **WinUI 3
and .NET 10** and follows Windows 11 Fluent design, with Mica and light, dark and high-contrast themes.

Documents open in tabs, and **Ctrl+K** command search finds every tool. Every change can be undone until
you save, and saving is atomic, so a failed save never damages the original file.

Rearrange, rotate, insert, extract, split and merge pages. Add text, shapes, images, highlights, notes,
stamps and freehand comments, and fill in forms. Make scanned pages searchable with offline OCR. Encrypt
files with AES-256, and remove sensitive content permanently with **true redaction**, which deletes the
content instead of covering it. PDF Studio can also apply and validate digital signatures.

Everything runs locally. PDF Studio makes no network calls and collects no telemetry, and its logs never
contain document content or file names.

PDF Studio 0.9.0-beta.2 is available as a public beta for Windows. The installer is unsigned and
some features may change; keep copies of important PDFs before editing them.
