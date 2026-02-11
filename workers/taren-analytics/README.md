# Taren Analytics (Cloudflare Worker + D1)

## What this is
- Public ingest: `POST /api/event` (anonymous)
- Admin stats: `GET /api/admin/*` (protect with Cloudflare Access)

## Setup steps (Cloudflare)
1. Create D1 database: `taren_analytics`
2. Apply migrations:
   - Use `wrangler d1 migrations apply taren_analytics`
3. Bind D1 to worker in `wrangler.toml`:
   - binding: `DB`
4. Deploy worker:
   - `wrangler deploy`
5. Add Worker Routes (Cloudflare dashboard):
   - `/api/*` -> `taren-analytics`

## Cloudflare Access
Create Access Applications:
- Protect `/admin*` (Self-hosted)
- Protect `/api/admin*` (Self-hosted)
Allow only your identity (email / Google / GitHub, etc).

## Privacy
This system stores no IP address and no User-Agent.
Only anonymous session events and coarse device type.
