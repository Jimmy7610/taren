/**
 * Integration test in the real Cloudflare Pages runtime (wrangler pages dev / workerd).
 *
 * Copies functions/ and index.html into a temporary directory together with a throw-away
 * wrangler.toml (nothing is written to the repository and no Cloudflare account is used),
 * creates a LOCAL D1 database seeded with synthetic rows, then exercises the real routing:
 *   1. no secrets configured  → every admin route denied (fail closed)
 *   2. token configured       → anonymous/wrong token denied, correct token allowed, writes denied
 *   3. ingestion              → off by default; on + same origin accepted; foreign origin rejected
 *   4. unrelated routes still work (catch-all, parakollen function)
 *
 * Run: npm run test:integration   (from tests/security)
 */
import { spawn, execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = resolve(here, '../../..');
const wrangler = resolve(here, '../node_modules/.bin/wrangler');
const ROUTES = ['overview', 'live', 'games', 'pages', 'recent', 'timeseries'];
const TOKEN = `it-${'k'.repeat(40)}`;
const PORT = 8790;
const BASE = `http://127.0.0.1:${PORT}`;

let failures = 0;
const check = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : `  ${detail}`}`);
  if (!cond) failures++;
};

const dir = mkdtempSync(join(tmpdir(), 'taren-sec-'));
cpSync(join(repo, 'functions'), join(dir, 'functions'), { recursive: true });
cpSync(join(repo, 'index.html'), join(dir, 'index.html'));
writeFileSync(
  join(dir, 'wrangler.toml'),
  `name = "taren-security-it"\npages_build_output_dir = "."\ncompatibility_date = "2025-01-01"\n\n[[d1_databases]]\nbinding = "DB"\ndatabase_name = "taren-it"\ndatabase_id = "00000000-0000-0000-0000-000000000000"\n`,
);
const now = Date.now();
writeFileSync(
  join(dir, 'seed.sql'),
  `${'CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, type TEXT NOT NULL, path TEXT, game TEXT, session_id TEXT, duration_ms INTEGER, score INTEGER, moves INTEGER, device TEXT, country TEXT);'}
${Array.from({ length: 300 }, (_, i) => `INSERT INTO events (ts,type,path,game,session_id,duration_ms,score,device,country) VALUES (${now - i * 1000},'game_start','/games/synthetic/','synthetic','synthetic-${i}',1000,${i},'desktop','XX');`).join('\n')}
`,
);

const env = { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' };
execFileSync(wrangler, ['d1', 'execute', 'DB', '--local', '--file', 'seed.sql'], { cwd: dir, env, stdio: 'ignore' });

async function startServer(bindings) {
  const args = ['pages', 'dev', '.', '--port', String(PORT), '--ip', '127.0.0.1', '--show-interactive-dev-session=false'];
  for (const [k, v] of Object.entries(bindings)) args.push('--binding', `${k}=${v}`);
  const proc = spawn(wrangler, args, { cwd: dir, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  proc.stdout.on('data', (d) => (log += d));
  proc.stderr.on('data', (d) => (log += d));
  for (let i = 0; i < 120; i++) {
    try {
      await fetch(`${BASE}/`);
      return proc;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  proc.kill();
  throw new Error(`wrangler did not start:\n${log}`);
}
const stop = (proc) =>
  new Promise((r) => {
    proc.once('exit', r);
    proc.kill('SIGINT');
    setTimeout(() => proc.kill('SIGKILL'), 5000);
  });

const get = (path, headers = {}) => fetch(`${BASE}${path}`, { headers });

try {
  // ---------------------------------------------------------------- 1. fail closed
  let server = await startServer({});
  for (const r of ROUTES) {
    const res = await get(`/api/admin/${r}`, { Authorization: `Bearer ${TOKEN}` });
    const body = await res.text();
    check(`[no config] /api/admin/${r} → 401`, res.status === 401, `got ${res.status}`);
    check(`[no config] /api/admin/${r} returns no data`, !body.includes('synthetic'), body.slice(0, 80));
  }
  {
    const res = await fetch(`${BASE}/api/event`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:' + PORT },
      body: JSON.stringify({ type: 'game_start', session_id: 's', ts: Date.now() }),
    });
    check('[no config] /api/event ingestion disabled → 403', res.status === 403, `got ${res.status}`);
  }
  await stop(server);

  // ---------------------------------------------------------------- 2. token auth
  server = await startServer({ ADMIN_API_TOKEN: TOKEN, ANALYTICS_INGEST: 'on', ANALYTICS_ALLOWED_ORIGINS: `http://127.0.0.1:${PORT}` });
  for (const r of ROUTES) {
    const anon = await get(`/api/admin/${r}`);
    check(`[token] anonymous /api/admin/${r} → 401`, anon.status === 401, `got ${anon.status}`);
    check(`[token] anonymous /api/admin/${r} no data`, !(await anon.text()).includes('synthetic'));
    const wrong = await get(`/api/admin/${r}`, { Authorization: `Bearer ${TOKEN}x` });
    check(`[token] wrong token /api/admin/${r} → 401`, wrong.status === 401, `got ${wrong.status}`);
    await wrong.text();
    const ok = await get(`/api/admin/${r}`, { Authorization: `Bearer ${TOKEN}` });
    check(`[token] valid token /api/admin/${r} → 200 JSON no-store`, ok.status === 200 && ok.headers.get('content-type')?.includes('json') && ok.headers.get('cache-control') === 'no-store', `got ${ok.status} ${ok.headers.get('cache-control')}`);
    await ok.text();
    const post = await fetch(`${BASE}/api/admin/${r}`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: '{}' });
    check(`[token] POST /api/admin/${r} → 405`, post.status === 405, `got ${post.status}`);
    await post.text();
  }
  for (const variant of ['/api/admin/overview/', '/api/admin/recent?limit=-1', '/api/admin//overview', '/api/admin/%6fverview']) {
    const res = await get(variant);
    const body = await res.text();
    check(`[token] anonymous ${variant} leaks nothing`, res.status !== 200 || !body.trim().startsWith('{'), `got ${res.status} ${body.slice(0, 60)}`);
  }
  {
    const res = await get('/api/admin/recent?limit=-1', { Authorization: `Bearer ${TOKEN}` });
    const items = (await res.json()).items ?? [];
    check('[token] /recent?limit=-1 is capped (≤ 200 rows, seeded 300)', items.length <= 200 && items.length > 0, `got ${items.length}`);
  }
  {
    const same = await fetch(`${BASE}/api/event`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: `http://127.0.0.1:${PORT}` },
      body: JSON.stringify({ type: 'game_start', session_id: 'it', game: 'it', ts: Date.now() }),
    });
    check('[ingest on] same-origin valid event → 200', same.status === 200, `got ${same.status} ${await same.text()}`);
    const foreign = await fetch(`${BASE}/api/event`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
      body: JSON.stringify({ type: 'game_start', session_id: 'it', ts: Date.now() }),
    });
    check('[ingest on] foreign origin → 403', foreign.status === 403, `got ${foreign.status}`);
  }
  // ---------------------------------------------------------------- 4. unrelated routes
  {
    const home = await get('/');
    check('[unrelated] / still served', home.status === 200 && (await home.text()).includes('<title>'));
    const spa = await get('/some/unknown/page');
    check('[unrelated] catch-all fallback unchanged', spa.status === 200);
    await spa.text();
    const para = await get('/parakollen/api/schedule');
    check('[unrelated] parakollen function still routed (not 401)', para.status !== 401, `got ${para.status}`);
    await para.text();
  }
  await stop(server);
} catch (e) {
  console.error(e);
  failures++;
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} integration check(s) FAILED` : '\nAll integration checks passed');
process.exit(failures ? 1 : 0);
