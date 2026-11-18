# Taren 2.3 — Release candidate report

Date: 2026-11-18 · Branch `feature/taren-2.3-production-readiness` (based on `preview/drafts` @ `f1ce1b9`).
**Not merged, not deployed.** Production (`main` @ `7438a6a`, taren.se) and `feature/taren-2.0`, `preview/drafts` are unchanged.

Details: `TAREN_2_3_AUDIT.md` (findings) · `LEGAL_REVIEW.md` · `PUBLICATION_WORKFLOW.md` ·
`PRODUCTION_CUTOVER_PLAN.md` · `TEST_REPORT.md` · `RELEASE_CHECKLIST.md` · `DEPLOYMENT.md` · `ROLLBACK.md`.

## Implemented and tested

| Change | Tests |
|---|---|
| **Security headers on 410 responses** (F2): Function-generated pages now send the same CSP, HSTS, X-Frame-Options, nosniff, Referrer- and Permissions-Policy as static pages; one shared constant kept identical to `_headers` | unit (2), `verify:cloudflare` |
| **No canonical / og:url on noindex pages** (F3): 404, 410 and drafts | unit, e2e (404, draft), `check:site` |
| **Two-gate publication workflow** (F4): information page (`published`) separate from download release (`releaseApproval {version, approvedOn, signed}` + released/beta + `downloadUrl`); the release gate now also applies to drafts | unit (5), incl. "both drafts are publish-ready as information pages without a release" |
| Legal/studio copy corrections (F5, F6) — **owner approval required** | e2e routes/visual unchanged |
| Mobile-menu Ko-fi link marker (F9) | `support.spec.ts` |
| Test coverage (F8): exact 10-size matrix for every public page and both drafts; axe on Lumen Capture; LHCI on all 7 public pages | — |
| New release tooling: `npm run check:site` (static build audit) and `npm run verify:cloudflare` (Cloudflare runtime: routes, headers, per-host noindex) | both pass |
| Docs: stale "admin API publicly readable" statements corrected (F7); PDF Studio status updated | — |

Results: typecheck/lint clean · unit 88/88 · Playwright 290/290 · LHCI 100/100/100/100 on 7 pages · `check:site` OK
(both builds) · `verify:cloudflare` 55/55 · axe 0 violations.

## Verified on preview / production (live, read-only)

- Production admin API: `/api/admin/*` → **401** without credentials; `POST /api/event` without allowed Origin → 403 (PR #1 effective).
- Preview hosts send `X-Robots-Tag: noindex, nofollow`; taren.se sends none (live) — and in the Cloudflare runtime simulation, taren.se/www.taren.se stay indexable after cutover.
- Preview privacy facts: one host only, 0 cookies, 0 storage, no analytics beacon.
- F2 confirmed on the live preview before the fix (410 without security headers).
- F1 confirmed on production: repository files (agent configs, docs, worker source, `wrangler.toml`) are publicly readable.
- The 2.3 changes themselves are **not** on any preview yet (no push to `preview/drafts` without approval).

## Requires manual review (owner)

1. Legal texts `/privacy/`, `/terms/`, `/support/`, `/studio/` (`LEGAL_REVIEW.md` §5) and decisions L1 (contact email), L2 (footer ©), L12 (legacy data).
2. Ko-fi: tips-only vs shop/memberships, payouts/eligibility, Swedish tax position (L5–L7).
3. Cloudflare dashboard: no Web Analytics/Zaraz/Bot Fight Mode cookies on taren.se.
4. Real-device and screen-reader checks (`TAREN_2_3_AUDIT.md` §3).
5. Visual sign-off of the release candidate on the preview (after an approved push to `preview/drafts`).

## Blocked

| Item | Blocked by |
|---|---|
| Production cutover | Owner approval of the cutover plan and legal texts |
| Lumen Capture download | No public signed build; private repo/updater; real-Windows check of the branding branch |
| PDF Studio download | 0.9.0 unsigned preview; final name and licence; wider hardware/AT testing; distribution channel |
| Publishing either draft (gate 1) | Owner decision only — content is publish-ready (unit-tested) |
| Pulse Garden on App Store/TestFlight | Not available; iPhone build/testing not done (no claims made) |
| picomatch advisory | No upstream fix yet (build-time only) |

## Future enhancements (not done, not needed for launch)

- Dedicated contact address and a product-specific privacy section for Pulse Garden (App Store requirement).
- HSTS `includeSubDomains`/`preload` after a subdomain inventory.
- Clean-up PR removing legacy root folders from `main` after a stable week.
- English/2× PDF Studio screenshots; real-Windows Lumen Capture screenshots.
- Run `verify:cloudflare` and `check:site` in CI (they currently run locally; `verify:cloudflare` downloads wrangler).

## Recommended owner approval sequence

1. Read `TAREN_2_3_AUDIT.md` and `LEGAL_REVIEW.md`; approve or edit the four legal texts; decide L1/L2/L12.
2. Approve pushing the release candidate to `preview/drafts` for a visual check on a phone and desktop.
3. Approve `PRODUCTION_CUTOVER_PLAN.md`; schedule the cutover (§5) and run the smoke tests (§6).
4. After a stable week: retire legacy secrets/bindings, decide on the analytics Worker and D1 data (§7).
5. Separately and later: gate 1 (publish Lumen Capture / PDF Studio pages) and gate 2 (releases) per `PUBLICATION_WORKFLOW.md`.
