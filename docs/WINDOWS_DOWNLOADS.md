# Windows app downloads — architecture and release runbook

Applies to **Lumen Capture** and **PDF Studio**, public beta channel. Source repositories stay **private**; only the
installers become public. Per-app build details: `docs/RELEASING.md` in each app repository.

> Status (2026-11-19): everything below is implemented and tested up to the **approval gate**. Nothing is public:
> no bucket, no `downloads.taren.se`, both manifests are `preparing`. Taren 2.0 itself is not yet in production
> (`DEPLOYMENT.md`), so the download sections go live with the cutover or later.

## 1. Hosting decision

| | **Cloudflare R2 + `downloads.taren.se`** (chosen) | GitHub Releases in a public binary-only repo | Cloudflare Pages assets |
|---|---|---|---|
| Fits 140 MB installers | ✅ (5 GB per upload) | ✅ (2 GiB per file) | ❌ 25 MiB per file limit |
| Cost at beta scale | $0: 10 GB-month storage, 1 M writes and 10 M reads/month free, **egress always free**; then $0.015/GB-month | $0 | — |
| Source stays private | ✅ nothing but files | ✅, but needs a new **public** repository (issues, profile visibility) | — |
| Link stability | Our own domain, versioned immutable paths | `github.com/…/releases/download/<tag>/…`, tied to tags | — |
| Release mechanics | Upload/copy objects; no git tags | Needs tags/releases, the very thing that auto-published Lumen before | — |
| Staging before public | ✅ separate private bucket | Draft releases (visible to collaborators) | — |
| Rollback | Re-point `latest.json` + site manifest; old versions stay | Edit "latest" release | — |
| Infra already in use | ✅ taren.se DNS and Pages are on Cloudflare | GitHub | ✅ |
| Operational complexity | Low: 2 buckets, 1 custom domain, 1 scoped API token | Low, but a second public repo to maintain | — |

**Decision: Cloudflare R2.** It reuses the existing Cloudflare account and DNS, keeps all links on taren.se,
has no egress cost, separates a private staging bucket from the public one, and needs no git tags.

### Layout (immutable, versioned)
```
taren-downloads-staging   (private, no public access — CI uploads here first)
taren-downloads           (public, only through https://downloads.taren.se)
  lumen-capture/beta/2.9.0-beta.2/LumenCapture-2.9.0-beta.2-Setup.exe
                                  LumenCapture-2.9.0-beta.2-portable.zip   (app + LICENSE.txt, PRIVACY.txt, licenses/)
                                  SHA256SUMS.txt   feed.json
  lumen-capture/beta/latest.json          ← read by Lumen's in-app updater (5 min cache)
  pdf-studio/beta/0.9.0-beta.1/PDFStudio-Setup-0.9.0-beta.1-x64.exe
                               PDFStudio-0.9.0-beta.1-win-x64-portable.zip
                               SHA256SUMS.txt   feed.json
  pdf-studio/beta/latest.json
```
Version folders are written once (`Cache-Control: immutable`; the workflows refuse to overwrite). Only `latest.json`
changes, and it is switched **after** the files are verified over the public URL.

## 2. One-time owner setup (needs the Cloudflare and GitHub account owner)
1. Cloudflare → R2: create buckets `taren-downloads-staging` and `taren-downloads`. Leave public access **off** on
   staging. On `taren-downloads`: Settings → Custom Domains → `downloads.taren.se` (Cloudflare creates the DNS record).
   Do not enable the `r2.dev` URL.
2. Optional hardening on the custom domain: a Cache Rule "cache everything" for `downloads.taren.se/*`, and a
   Transform Rule adding `X-Content-Type-Options: nosniff`.
3. **Two separate R2 tokens — never one token for both buckets:**
   - **Taren Staging** (long-lived, in GitHub): *Object Read & Write*, **only** `taren-downloads-staging`.
   - **Taren Production** (short-lived, never in GitHub): *Object Read & Write*, **only** `taren-downloads`, created with
     a **TTL** right before a publication and expiring/revoked afterwards. Kept in the owner's password manager or
     nowhere. Never paste either in chat, issues, commits or logs.
4. In **each** app repository (lumen-capture, PDFStudio) → Settings → Environments:
   - `downloads-staging` (deployment branches: `main` only): secrets `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
     `R2_SECRET_ACCESS_KEY` of **Taren Staging**.
   - **No production environment and no production secret.** Delete `downloads-public` if it exists.
5. Licence/terms for the apps (`LEGAL_REVIEW.md` L8) must exist before the first public download.

### Why publishing is not done by GitHub Actions
GitHub documents that on GitHub Free, Pro and Team plans, **required reviewers for environments are only available in
public repositories**, and that administrators can bypass environment protection rules. The app repositories are
private, so a production secret stored in GitHub could be used by any workflow run on `main` without a real approval.
Instead, the production token exists only on the owner's PC for the minutes of a publication, and the owner's own
action (typing the version in `Publish-Beta.ps1`) is the approval. Upgrading to GitHub Enterprise or making the app
repositories public would make required reviewers possible; neither is needed with this design.

## 3. Release runbook

| Step | Who | What |
|---|---|---|
| 1. Build | CI | Every push: `build.yml` / `ci.yml` build and test. They never publish. |
| 2. Candidate | Engineer | App repo → Actions → *release candidate (public beta)* → branch `main`, `version: X`. Builds, tests, audits the package, uploads to **staging**, downloads it back and checks SHA-256. It cannot publish. |
| 3. Verify | Engineer | Download the artifact of that run on a Windows 11 PC: install, launch, smoke test, uninstall (app `docs/RELEASING.md`). PDF Studio: run UI + installation tests locally on the same commit. |
| 4. Approve | **Owner, own PC** | Create the short-lived **Taren Production** token. `tools/release/Publish-Beta.ps1 -Product <p> -Version X -RunId <candidate run> -DryRun`, then the same without `-DryRun`: the script checks the run (release-candidate workflow, `main`, success), verifies every file, refuses to overwrite anything public, and asks the owner to **type the version** — only then it asks for the token (hidden, process only). |
| 5. Publish | Script | Uploads the verified files to the public bucket, re-downloads them from `downloads.taren.se` and checks SHA-256, then switches `latest.json`. The token expires or is revoked. |
| 6. Website | Engineer → owner review | `cd site && node scripts/import-release.mjs --feed https://downloads.taren.se/<product>/beta/<version>/feed.json --approved-on YYYY-MM-DD` (verifies every file's SHA-256 over the network), set the product's `status: beta` in both languages, remove the "approval gate" unit test and update `tests/e2e/downloads.spec.ts`; PR → owner merges → Pages deploys. |

The website never shows a download until step 6 is merged: the manifest schema forbids files in `preparing`, a
`published` manifest requires owner approval and a release date, every URL must be
`https://downloads.taren.se/<product>/<channel>/<version>/<file>`, and the build fails if a published manifest belongs
to a product page that is unpublished or not `beta`/`released`.

## 4. Rollback, revocation, broken downloads
- **Bad beta, older one is fine (rollback):** owner runs `Publish-Beta.ps1 -Product <p> -Version <previous> -Rollback`
  (typed approval, short-lived token) →
  `latest.json` points back; Lumen's updater never downgrades anyone, it only stops offering the bad version. Then
  `import-release.mjs` with the previous version's feed → PR → merge.
- **Compromised or dangerous file (revocation):** 1) set the manifest to `withdrawn` with a reason in both languages
  and deploy (buttons disappear); 2) delete the object(s) in `taren-downloads` (Cloudflare dashboard) and purge the
  cache for `downloads.taren.se/<product>/*`; 3) point `latest.json` at a safe version or delete it (Lumen then
  reports "no published release"); 4) rotate the R2 token if it may be involved; 5) tell testers by e-mail.
- **Broken download (404, wrong size):** check `curl -I https://downloads.taren.se/<path>` and the R2 object; compare
  with `SHA256SUMS.txt`. Never re-upload a different file under the same name — publish a new version instead.

## 5. Unsigned installers and SmartScreen
Neither app is Authenticode-signed (verify with `Get-AuthenticodeSignature <file>` → `NotSigned`). New, unsigned
downloads usually trigger SmartScreen's "Windows protected your PC" with publisher "Unknown". This is **not** evidence
of safety or danger. The download section says so, tells people to download only from taren.se and compare the
SHA-256, and never asks anyone to disable SmartScreen or antivirus. Manifests keep `signed: false`; `true` is only
allowed with `signatureVerifiedOn`. Signing (OV/EV certificate or Azure Trusted Signing) is a separate owner decision.

## 6. Communicating beta limitations
The download section always shows the beta warning, the known issues from the manifest (both languages) and the
unsigned-installer notice. Bug reports go to the owner-approved contact address (`SITE.contactEmail`). Lumen checks
`downloads.taren.se/lumen-capture/beta/latest.json` once a day if the user keeps "check for updates" on: this sends
an ordinary HTTPS request (IP address and `LumenCapture/<version>` user agent) to Cloudflare; mention it in the app's
privacy information before release (`LEGAL_REVIEW.md`). PDF Studio makes no network requests.

## 7. Files
| File | Purpose |
|---|---|
| `site/src/lib/release-schema.ts` | Manifest schema, gate rules, formatting |
| `site/src/content/releases/<slug>.json` | The manifests (single source of version, date, files, sizes, checksums) |
| `site/src/components/DownloadPanel.astro` | Download section (EN/SV), states, copy-checksum, installation guide |
| `site/src/lib/catalog.ts` → `getRelease()` | Build-time consistency between manifest and product page |
| `site/scripts/import-release.mjs` | Turns a published `feed.json` into a manifest after verifying every file |
| `site/tests/unit/releases.test.ts`, `site/tests/e2e/downloads.spec.ts` | Schema, gate and UI tests |
| App repos: `.github/workflows/release.yml` | Build → Test → Stage → Verify (candidate only, private staging) |
| App repos: `tools/release/Publish-Beta.ps1`, `docs/RELEASING.md` | Owner approval and publication from the owner's PC (short-lived production token) |
