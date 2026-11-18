# Security: `/api/admin/*` analytics endpoints

Branch `security/admin-api-auth` · based on `main` @ `b4b001d` · 2026-11-18

## 1. Findings (production, verified read-only)

Verification method: GET requests that read **only the status line and headers** and close the
connection without reading the body, plus HEAD/OPTIONS. No analytics records were downloaded,
stored or displayed. The write endpoint was **not** exercised on production (it would insert a row);
its behaviour is established from source.

| # | Severity | Route / issue | Evidence |
|---|---|---|---|
| F1 | **High** | `GET /api/admin/recent?limit≤200` returns raw per-event rows: timestamp, event type, page path, game, duration, score, **device**, **country** | `200 application/json`, no auth challenge |
| F2 | **High** | `/recent` row cap bypass: `limit=-1` → SQL `LIMIT -1` = **unlimited** (entire table) | Source (`Math.min(Number(x) \|\| 50, 200)`); reproduced locally against a seeded D1 |
| F3 | Medium | `GET /api/admin/overview`, `/live`, `/games`, `/pages`, `/timeseries` expose aggregates (unique sessions, page views, top pages/games, activity time series, live visitor count) | `200 application/json`, no auth |
| F4 | Medium | `POST /api/event` accepts unauthenticated writes from any origin (data poisoning, storage abuse). No first-party page currently sends events. | Source |
| F5 | Low | Handlers return raw database error messages (`err.message`) | Source |
| F6 | Low | Admin responses carry no `Cache-Control: no-store` | Response headers |
| F7 | Info | Cloudflare Access (described in `workers/taren-analytics/README.md`) is **not** in front of these Pages routes: no Access redirect, no `Cf-Access-*` challenge | Response headers |

Data held in D1 `events` (from `migrations/0001_init.sql` and `functions/api/event.ts`): `ts, type,
path, game, session_id, duration_ms, score, moves, device, country`. No IP address or user agent is
stored. `session_id` is a client-generated identifier. It is not returned by any admin route but
is used for unique-visitor counts. Device + country + timestamp per event is still personal-data-adjacent
under GDPR and must not be public.

Routes inventoried from source: `functions/api/admin/{overview,live,games,pages,recent,timeseries}.ts`
(all `onRequestGet` only) and `functions/api/event.ts` (`onRequestPost`, `onRequestGet`→405).
Unknown `/api/admin/*` paths fall through to the existing catch-all (`index.html`) and expose nothing.

## 2. Fix

| Change | File |
|---|---|
| Directory middleware guarding **every** current and future `/api/admin/*` route; unauthenticated requests never reach a handler or the database | `functions/api/admin/_middleware.ts` |
| Authentication: Cloudflare Access JWT (RS256, team keys, issuer, audience, expiry, email allowlist) **or** bearer token (≥ 32 chars, constant-time compare) | `functions/api/admin/_auth.ts` |
| **Fail closed:** no/partial/invalid configuration ⇒ every request 401; key endpoint unreachable ⇒ deny | `_auth.ts` |
| Authorization: admin API is read-only — any non-GET ⇒ 405 (after auth; anonymous ⇒ 401) | `_middleware.ts` |
| `Cache-Control: no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer`, no CORS on admin responses | `_middleware.ts` |
| Generic error bodies; no DB error text | all six handlers, `event.ts` |
| `/recent` limit clamped to 1–200 | `recent.ts` |
| Ingestion **off by default** (`ANALYTICS_INGEST=on` to enable); when on: origin allowlist, JSON only, 4 KB cap, timestamp freshness, field validation | `functions/api/event.ts` |

Unchanged: `functions/[[path]].ts`, `functions/parakollen/**`, all static files, `public/**`,
`workers/**`, and Cloudflare settings. No `wrangler.toml` was added to the project.

## 3. Configuration (Cloudflare Pages → taren → Settings → Variables and Secrets, *Production*)

| Name | Type | Required | Value |
|---|---|---|---|
| `ACCESS_TEAM_DOMAIN` | Plain text | for Access | `<team>.cloudflareaccess.com` |
| `ACCESS_AUD` | Plain text | for Access | Application Audience (AUD) tag |
| `ADMIN_EMAILS` | Plain text | for Access | `you@example.com` (comma-separated) |
| `ADMIN_API_TOKEN` | **Secret (encrypt)** | optional | `openssl rand -base64 48` — never commit |
| `ANALYTICS_INGEST` | Plain text | optional | `on` only if you want `/api/event` to accept events |
| `ANALYTICS_ALLOWED_ORIGINS` | Plain text | optional | defaults to `https://taren.se` |

With none of these set, the admin API is simply closed. That is safe, and it is the state after merging if you do nothing.

## 4. Deployment (owner, after approval)

1. **Recommended: Cloudflare Access.** Zero Trust → Access → Applications → *Add* → Self-hosted:
   domain `taren.se`, paths `/api/admin/*` and `/admin*`. Policy: *Allow* → Emails → your address.
   Copy the **Application Audience (AUD) tag**.
2. Set the Pages variables from §3 for **Production** (and Preview if you test there).
3. Merge the PR into `main`. Pages builds and deploys automatically (no build command, as today).
4. Verify (status codes only):
   ```bash
   for r in overview live games pages recent timeseries; do
     curl -s -o /dev/null -w "%{http_code} /api/admin/$r\n" "https://taren.se/api/admin/$r"
   done
   # expect 302 (Access login) or 401 for every line — never 200
   curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'content-type: application/json' \
     -H 'origin: https://evil.example' --data '{}' https://taren.se/api/event   # expect 403
   curl -s -o /dev/null -w "%{http_code}\n" https://taren.se/                   # expect 200
   curl -s -o /dev/null -w "%{http_code}\n" https://taren.se/public/parakollen/  # expect 200
   ```
   Authorised check with a token (prints status only):
   `curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $ADMIN_API_TOKEN" https://taren.se/api/admin/live` → `200`.
5. Optional hardening: add a WAF rate-limiting rule for `POST /api/event` if ingestion is turned on.

## 5. Rollback

Cloudflare Pages → Deployments → previous deployment → *Rollback*. **Warning: rolling back
re-exposes the data (F1–F3).** If you need to roll back, first add the Access application from
step 4.1. Access blocks unauthenticated requests at the edge, independently of this code.

## 6. Tests

`tests/security/` (run from that directory; CI: `.github/workflows/functions-security.yml`)

| Command | What |
|---|---|
| `npm run typecheck` | strict TypeScript for `_auth.ts`, `_middleware.ts`, `event.ts` |
| `npm test` | 72 Vitest regression tests: route inventory, fail-closed, anonymous/wrong/malformed tokens, query-string tokens, write methods, headers, error leakage, JWT (valid, allowlist, expired, nbf, aud, iss, alg none/HS256, unknown kid, forged key, tampered payload, garbage, key endpoint down, partial config, key caching), ingestion rules |
| `npm run test:integration` | 53 checks in the real Pages runtime (`wrangler pages dev`, local D1 with **synthetic** rows only): fail closed, token auth, 405 on writes, path-variant bypass attempts, `/recent` cap against 300 rows, ingestion on/off/origin, unrelated routes unaffected |

Mutation check: replacing the middleware with a pass-through makes 39 unit tests fail. Restoring the
old `event.ts` makes 6 fail.

## 7. Out of scope / follow-ups

- `workers/taren-analytics` (separate Worker) contains its own unauthenticated `/api/admin/*`. It is
  **not** serving taren.se (production responses match the Pages handlers), but if it is deployed on
  a `*.workers.dev` URL or another route it is exposed too. Check Workers & Pages in the dashboard and
  delete it or put Access in front of it.
- Cloudflare Access end-to-end (real Access JWT) can only be verified after step 4.1.
- Data minimisation: consider dropping `country`/`device` or deleting old rows; the current site sends no events.
