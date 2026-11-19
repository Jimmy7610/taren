#!/usr/bin/env node
/**
 * Step 6 of docs/WINDOWS_DOWNLOADS.md: turn a PUBLISHED feed.json from downloads.taren.se into the site's release
 * manifest (src/content/releases/<slug>.json) — but only after downloading every file and checking its SHA-256 and
 * size against the feed. Notes and known issues are kept from the existing manifest (edit them in the same PR).
 *
 *   node scripts/import-release.mjs --feed https://downloads.taren.se/pdf-studio/beta/0.9.0-beta.1/feed.json \
 *        --approved-on 2026-12-01 [--approved-by "Jimmy Eliasson"] [--release-date 2026-12-01]
 *
 * The result is validated by the schema at build time (npm run build) and by tests/unit/releases.test.ts.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ORIGIN = 'https://downloads.taren.se';
const FOLDER_TO_SLUG = { 'lumen-capture': 'lumen-capture', 'pdf-studio': 'pdfstudio' };

/** Normalises both feed shapes (Lumen's GitHub-style updater feed and PDF Studio's manifest feed). */
export function filesFromFeed(feed) {
  if (Array.isArray(feed.downloads)) {
    return feed.downloads.map((d) => ({ type: d.type, fileName: d.fileName, url: d.url, sizeBytes: d.sizeBytes, sha256: d.sha256 }));
  }
  if (Array.isArray(feed.assets)) {
    return feed.assets
      .filter((a) => /\.(exe|zip)$/i.test(a.name))
      .map((a) => ({
        type: /setup/i.test(a.name) ? 'installer' : 'portable',
        fileName: a.name,
        url: a.browser_download_url,
        sizeBytes: a.size,
        sha256: a.sha256,
      }));
  }
  throw new Error('feed has neither "downloads" nor "assets"');
}

/**
 * Builds the published manifest. Pure (no I/O) so it can be unit-tested.
 * @param {string} feedUrl
 * @param {any} feed
 * @param {any} existing
 * @param {{ approvedOn?: string, approvedBy?: string, releaseDate?: string }} options
 */
export function manifestFromFeed(feedUrl, feed, existing, { approvedOn, approvedBy = 'Jimmy Eliasson', releaseDate }) {
  const m = new RegExp(`^${ORIGIN}/([a-z-]+)/(beta)/([^/]+)/feed\\.json$`).exec(feedUrl);
  if (!m) throw new Error(`feed URL must be ${ORIGIN}/<product>/beta/<version>/feed.json`);
  const [, folder, channel, version] = m;
  const slug = FOLDER_TO_SLUG[folder];
  if (!slug) throw new Error(`unknown product folder "${folder}"`);
  if (existing.product !== slug) throw new Error(`existing manifest is for "${existing.product}", not "${slug}"`);
  const feedVersion = feed.version ?? String(feed.tag_name ?? '').replace(/^v/, '');
  if (feedVersion !== version) throw new Error(`feed version ${feedVersion} does not match the URL (${version})`);
  const date = releaseDate ?? feed.releaseDate ?? String(feed.published_at ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) throw new Error('no release date: pass --release-date YYYY-MM-DD');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(approvedOn ?? '')) throw new Error('pass --approved-on YYYY-MM-DD (the owner approval date)');
  const rest = { ...existing };
  delete rest.withdrawnReason; // a re-published version is live again
  return {
    ...rest,
    channel,
    state: 'published',
    version,
    releaseDate: date,
    approval: { approvedBy, approvedOn },
    downloads: filesFromFeed(feed),
  };
}

async function sha256OfUrl(url) {
  const res = await fetch(url, { redirect: 'error' });
  if (!res.ok || !res.body) throw new Error(`${url}: HTTP ${res.status}`);
  const hash = createHash('sha256');
  let size = 0;
  for await (const chunk of res.body) {
    hash.update(chunk);
    size += chunk.length;
  }
  return { sha256: hash.digest('hex'), size };
}

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
  );
  if (!args.feed) throw new Error('usage: --feed <feed.json URL> --approved-on YYYY-MM-DD');
  const res = await fetch(args.feed, { redirect: 'error' });
  if (!res.ok) throw new Error(`${args.feed}: HTTP ${res.status}`);
  const feed = await res.json();
  const folder = /\/([a-z-]+)\/beta\//.exec(args.feed)?.[1];
  const slug = FOLDER_TO_SLUG[folder];
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'releases', `${slug}.json`);
  const existing = JSON.parse(readFileSync(file, 'utf8'));
  const manifest = manifestFromFeed(args.feed, feed, existing, {
    approvedOn: args['approved-on'],
    approvedBy: args['approved-by'],
    releaseDate: args['release-date'],
  });
  for (const d of manifest.downloads) {
    process.stdout.write(`verifying ${d.url} … `);
    const got = await sha256OfUrl(d.url);
    if (got.sha256 !== d.sha256 || got.size !== d.sizeBytes)
      throw new Error(`\nMISMATCH ${d.fileName}: sha256 ${got.sha256} size ${got.size}, feed says ${d.sha256} / ${d.sizeBytes}`);
    console.log('ok');
  }
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${file}. Next: product status "beta" (both languages), tests, PR (docs/WINDOWS_DOWNLOADS.md step 6).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
