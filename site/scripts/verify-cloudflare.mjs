#!/usr/bin/env node
/**
 * Verifies the built site (dist/) in Cloudflare's own runtime via `wrangler pages dev`: _redirects, _headers
 * (including the host-based noindex rules), and the 410 Pages Functions. Needs network access for npx the first time.
 *
 *   npm run build && npm run verify:cloudflare
 *
 * Hostnames are simulated with the Host header. taren.se and www.taren.se must NOT get X-Robots-Tag; every
 * *.pages.dev host must.
 */
import { spawn } from 'node:child_process';
import { request } from 'node:http';

const PORT = 8790;
const BASE = `http://127.0.0.1:${PORT}`;
const WRANGLER = process.env.WRANGLER ?? 'wrangler@4.164.0';
const server = spawn('npx', ['--yes', WRANGLER, 'pages', 'dev', 'dist', '--port', String(PORT), '--ip', '127.0.0.1'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, CI: '1' },
  // Own process group, so npx, wrangler and workerd are all stopped together at the end.
  detached: true,
});
const stopServer = () => {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    /* already stopped */
  }
};
let log = '';
server.stdout.on('data', (d) => (log += d));
server.stderr.on('data', (d) => (log += d));

const failures = [];
const check = (ok, msg) => (ok ? console.log(`  ✓ ${msg}`) : (failures.push(msg), console.log(`  ✗ ${msg}`)));
const get = (path) => fetch(BASE + path, { redirect: 'manual' });
// fetch() drops a custom Host header, so hostname checks use node:http.
const headersFor = (path, host) =>
  new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: PORT, path, method: 'GET', headers: { Host: host } }, (res) => {
      res.resume();
      resolve(res.headers);
    });
    req.on('error', reject);
    req.end();
  });

try {
  for (let i = 0; ; i++) {
    try {
      await fetch(BASE + '/');
      break;
    } catch {
      if (i > 90) throw new Error('wrangler did not start:\n' + log);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log('Routes');
  const expect = {
    '/': 200, '/products/': 200, '/products/pulse-garden/': 200, '/studio/': 200, '/support/': 200,
    '/privacy/': 200, '/terms/': 200, '/sitemap.xml': 200, '/robots.txt': 200,
    '/about': 301, '/about/': 301, '/index.html': 301,
    '/games/': 410, '/games/ashveil/': 410, '/experiments/x/': 410, '/public/parakollen/': 410,
    '/public/ninefold/': 410, '/parakollen/': 410, '/parakollen/api/medals': 410,
    '/public/other/': 404, '/does-not-exist/': 404, '/products/example-product/': 404,
    // Taren 2.5: public information pages (no downloads).
    '/products/lumen-capture/': 200, '/products/pdfstudio/': 200,
    '/api/admin/overview': 404, '/api/event': 404,
    // Taren 2.6: the Swedish twin of every public page.
    '/sv/': 200, '/sv/products/': 200, '/sv/products/lumen-capture/': 200, '/sv/products/pdfstudio/': 200,
    '/sv/products/pulse-garden/': 200, '/sv/studio/': 200, '/sv/support/': 200, '/sv/privacy/': 200, '/sv/terms/': 200,
    '/sv/does-not-exist/': 404, '/sv/products/example-product/': 404,
    // Internal files the legacy site serves from the repository root (audit F1) must not exist here.
    '/README.md': 404, '/CLAUDE.md': 404, '/docs/current-status.md': 404, '/.agent/ARCHITECTURE.md': 404,
    '/workers/taren-analytics/wrangler.toml': 404, '/.gitignore': 404, '/package.json': 404, '/brand/masters/taren-icon.png': 404,
  };
  for (const [path, status] of Object.entries(expect)) {
    const res = await get(path);
    check(res.status === status, `${path} → ${res.status} (expected ${status})`);
  }
  // Unknown pages get the 404 page in their own language (Cloudflare serves the nearest 404.html).
  const html = async (path) => (await get(path)).text();
  check(/<html lang="sv"/.test(await html('/sv/does-not-exist/')), '/sv/does-not-exist/ serves the Swedish 404 page');
  check(/<html lang="en"/.test(await html('/does-not-exist/')), '/does-not-exist/ serves the English 404 page');
  const svHome = await html('/sv/');
  check(/<html lang="sv"/.test(svHome) && /hreflang="en"/.test(svHome) && /hreflang="x-default"/.test(svHome), '/sv/ is Swedish with hreflang alternates');
  const about = await get('/about');
  check(new URL(about.headers.get('location') ?? '', BASE).pathname === '/studio/', '/about redirects to /studio/');

  console.log('Security headers (static page and Function-generated 410)');
  for (const path of ['/', '/sv/', '/games/']) {
    const res = await get(path);
    for (const h of ['content-security-policy', 'x-frame-options', 'x-content-type-options', 'strict-transport-security', 'referrer-policy', 'permissions-policy'])
      check(!!res.headers.get(h), `${path} sends ${h}`);
    check(!/unsafe-inline|unsafe-eval/.test(res.headers.get('content-security-policy') ?? ''), `${path} CSP has no unsafe-*`);
  }
  const asset = (await (await get('/')).text()).match(/\/_astro\/[^"]+\.css/)?.[0];
  check(/immutable/.test((await get(asset)).headers.get('cache-control') ?? ''), `${asset} cached immutably`);

  console.log('Indexing by hostname');
  for (const host of ['taren.se', 'www.taren.se'])
    for (const path of ['/', '/sv/'])
      check(!(await headersFor(path, host))['x-robots-tag'], `${host}${path}: no X-Robots-Tag (indexable)`);
  for (const host of ['taren.pages.dev', 'taren-2-preview.pages.dev', 'preview-drafts.taren-2-preview.pages.dev', 'f1ce1b9.taren-2-preview.pages.dev', 'feature-taren-2-6-bilingual.taren-2-preview.pages.dev'])
    for (const path of ['/', '/sv/'])
      check(/noindex/.test(String((await headersFor(path, host))['x-robots-tag'] ?? '')), `${host}${path}: X-Robots-Tag noindex`);
} finally {
  stopServer();
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\nAll Cloudflare runtime checks passed');
process.exit(0);
