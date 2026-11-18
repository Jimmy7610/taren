#!/usr/bin/env node
/**
 * Static release checks over a built site (default: dist/). No network.
 *  - every internal href/src/srcset resolves to a file in the build
 *  - titles and descriptions are unique among indexable pages; descriptions 50–200 chars
 *  - og:image files exist; JSON-LD parses
 *  - indexable pages have exactly one canonical (https://taren.se/…) and noindex pages have none
 *  - no source maps, no .md/.ts/.env files and no internal docs in the output
 * Usage: node scripts/check-site.mjs [dist-dir]
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dir = process.argv[2] ?? 'dist';
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(dir);

const problems = [];
const rel = (p) => '/' + relative(dir, p).replace(/\\/g, '/');
const resolves = (url) => {
  const path = decodeURI(url.split(/[?#]/)[0]);
  if (path === '') return true;
  const candidates = [path, join(path, 'index.html'), path.endsWith('/') ? path + 'index.html' : path + '/index.html'];
  return candidates.some((c) => existsSync(join(dir, c)));
};

for (const f of files) {
  const r = rel(f);
  if (/\.(map|md|mdx|ts|tsx|env)$/.test(r) || /\/docs\//.test(r) || /\/brand\/masters/.test(r)) problems.push(`unexpected file in build: ${r}`);
}

const pages = files.filter((f) => f.endsWith('.html'));
const titles = new Map();
const descs = new Map();
for (const f of pages) {
  const html = readFileSync(f, 'utf8');
  const r = rel(f);
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
  const canon = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
  if (!title) problems.push(`${r}: no <title>`);
  if (desc.length < 50 || desc.length > 200) problems.push(`${r}: description length ${desc.length}`);
  if (noindex && canon.length) problems.push(`${r}: noindex page has a canonical`);
  if (!noindex) {
    if (canon.length !== 1 || !canon[0].startsWith('https://taren.se/')) problems.push(`${r}: canonical ${JSON.stringify(canon)}`);
    if (titles.has(title)) problems.push(`${r}: duplicate title with ${titles.get(title)}`);
    if (descs.has(desc)) problems.push(`${r}: duplicate description with ${descs.get(desc)}`);
    titles.set(title, r);
    descs.set(desc, r);
  }
  const og = /<meta property="og:image" content="https:\/\/taren\.se([^"]+)"/.exec(html)?.[1];
  if (!og || !resolves(og)) problems.push(`${r}: og:image missing (${og})`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      problems.push(`${r}: invalid JSON-LD`);
    }
  }
  const urls = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])),
  ];
  for (const u of urls) {
    if (/^(https?:|mailto:|data:|#)/.test(u)) continue;
    if (!resolves(u)) problems.push(`${r}: broken internal link ${u}`);
  }
}

console.log(`${pages.length} pages, ${files.length} files checked in ${dir}`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: links, metadata, canonicals and build contents');
