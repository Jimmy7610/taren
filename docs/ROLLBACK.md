# Taren — Rollback

Baseline (last legacy production commit): **`7438a6adc8657d26c2e8f50b6102be41397f9a9c`** (`main`, includes security PR #1;
re-verified 2026-11-18). Earlier baseline before PR #1: `b4b001d`. Cutover procedure: `PRODUCTION_CUTOVER_PLAN.md`.

## Before cutover
Nothing to roll back: production is unchanged. Deleting the branch or a separate preview project has
no effect on taren.se.

## After cutover — instant (≈1 minute)
1. Cloudflare → Pages → taren project → **Deployments**.
2. Find the last deployment built from the legacy settings (before the cutover, from `7438a6a`).
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
curl -s -o /dev/null -w "%{http_code}\n" https://taren.se/api/admin/overview  # 401 (PR #1 auth still in force)
```

## Rolling back a single product page
Set `published: false` in its Markdown file and deploy: the page returns 404 and leaves the sitemap. To withdraw only a
download, remove `downloadUrl` and `releaseApproval` (`PUBLICATION_WORKFLOW.md`).

## What a rollback does not undo
Nothing in the cutover deletes resources, so there is nothing to restore: the `taren-analytics` Worker, its D1 database,
the project's secrets/bindings and the Parakollen repository are untouched until the owner removes them (§7 of the plan).
