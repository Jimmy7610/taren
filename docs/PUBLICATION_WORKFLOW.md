# Product publication workflow (Taren 2.3)

A product reaches the public in **two separate, owner-approved gates**. Passing gate 1 never implies gate 2.

| Gate | What it makes public | Switch | Who approves | Enforced by |
|---|---|---|---|---|
| **0 — Draft** | Nothing. The page exists only on the drafts preview (`preview/drafts` → `preview-drafts.taren-2-preview.pages.dev`), with a Draft banner, `noindex`, no JSON-LD, never in the sitemap or navigation. | `published: false` (default) | — | `src/lib/drafts.ts`, `catalog.ts`; e2e `drafts.spec.ts`, `routes.spec.ts` (404 in production) |
| **1 — Information page** | A product page on taren.se describing the product **as it is**, including "In development" status. No download. | `published: true` | Owner, explicitly, per product | Schema: in-development needs `statusNote` + content and **no** `downloadUrl`; `featured` needs `published` |
| **2 — Download release** | A download button and `SoftwareApplication` JSON-LD. | `status: released` or `beta` **and** `downloadUrl` **and** `releaseApproval` | Owner, explicitly, per version | Schema: `downloadUrl` requires `releaseApproval {version, approvedOn, signed}` and a released/beta status — **even for drafts**, so a download link can never appear on any preview by accident |

## Gate 1 — publish an information page

Pre-checks (owner):
1. Read the draft on the drafts preview, desktop and phone.
2. Status line and status note are accurate today (version, "not released", signing state).
3. Every claim on the page is verifiable (features exist in the current build; screenshots are real captures).
4. Branding: the product's own name and icon; the Taren credit only as "A Taren App" (see `BRAND_INTEGRATION.md`).

Change (one line, on a branch from the current release branch):
```yaml
published: true
```
Optional: `featured: true` (homepage/menu teaser) — a separate decision.

Verify before merging:
```bash
cd site && npm run check && npm run check:site
```
The unit test *"both drafts are ready to be published as information pages only"* already proves that Lumen
Capture and PDF Studio pass every public-page rule with `published: true`. After that change, update the tests that
pin them as unpublished (`content.test.ts`, `drafts.spec.ts`, production 404 checks in `routes.spec.ts`), and add
the page to the visual baselines.

Result: the page appears in `/products/`, the sitemap and search; it still shows **no download**.

## Gate 2 — approve a downloadable release

Only when a real, distributable build exists. Pre-checks (owner):
1. The file is hosted at its permanent https URL and downloads correctly on a clean machine.
2. Code signing: state it honestly in `releaseApproval.signed`. Unsigned Windows builds trigger SmartScreen;
   say so in `statusNote` if `signed: false`.
3. Licence/terms for the app exist (see `LEGAL_REVIEW.md` L8 — required before any download).
4. Privacy information for the app exists if it processes personal data.
5. If anything is sold: consumer-rights, VAT and refund questions are settled first (`LEGAL_REVIEW.md` §6).

Change:
```yaml
status: released          # or beta
downloadUrl: https://…    # the real file or store page
downloadLabel: Download for Windows
releaseApproval:
  version: 1.0.0
  approvedOn: 2026-12-01
  signed: true
```
Remove `beforeRelease` (not allowed on released products) and mark the release milestone `done`.

## Reverting
- Unpublish a page: `published: false` → the page returns 404 in production on the next deploy (consider a 410 via
  `src/lib/legacy.ts` if it was public for a long time).
- Withdraw a download: remove `downloadUrl` + `releaseApproval`, set the status back, explain in `statusNote`.

## Current state (Taren 2.5, owner-approved; branch `feature/taren-2.5-product-showcase`)

| Product | Gate | Order | Notes |
|---|---|---|---|
| Lumen Capture | 1 (published, in development, **featured**) | 1 | Homepage hero card and showcase; full-width stage first on `/products/`. No installer, no download (gate 2 not passed: no signed public build, private repo/updater) |
| PDF Studio | 1 (published, in development) | 2 | 0.9.0 unsigned development preview; no download (gate 2 blocked: signing, final name and licence) |
| Pulse Garden | 1 (published, in development) | 3 | No App Store/TestFlight availability; no download |

Publishing these information pages did **not** approve any distribution: none has `downloadUrl` or `releaseApproval`
(unit- and e2e-tested), and no page carries `SoftwareApplication` structured data.
