# Taren 2.0 — Rollback

Baseline (last legacy production commit): `b4b001d33e5f4347ac4c8ae9fb5850a9b56e2555`.

## Before cutover
Nothing to roll back: production is unchanged. Deleting the branch or a separate preview project has
no effect on taren.se.

## After cutover — instant (≈1 minute)
1. Cloudflare → Pages → taren project → **Deployments**.
2. Find the last deployment built from the legacy settings (before the cutover).
3. ⋯ → **Rollback to this deployment**. taren.se serves the old site immediately.

## After cutover — make it stick
Rollback alone is undone by the next push to `main`. Also:
1. Settings → Builds & deployments → restore: Root directory *(empty)*, Build command *(empty)*,
   Output directory `/` (as recorded before cutover); remove `NODE_VERSION` if it was not there.
2. Either revert the merge on `main` (`git revert -m 1 <merge-commit>` via PR), or leave it: with the
   legacy settings, the repository root is served again and `site/` is just an extra folder.

## Verify
```bash
curl -s https://taren.se/ | grep -o "<title>[^<]*"          # legacy title: "Taren — Small strange games…"
curl -s -o /dev/null -w "%{http_code}\n" https://taren.se/games/ashveil/   # 200 again
```
