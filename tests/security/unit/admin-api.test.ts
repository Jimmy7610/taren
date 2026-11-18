import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ADMIN_DIR, ADMIN_ROUTES, callAdmin } from './helpers';
import { clearJwksCache } from '../../../functions/api/admin/_auth';

const TOKEN = 'x'.repeat(16) + '-correct-horse-battery-staple-0123456789';
const tokenEnv = { ADMIN_API_TOKEN: TOKEN };
const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

beforeEach(() => clearJwksCache());

describe('route inventory', () => {
  it('knows every admin route (new routes are covered automatically by the directory middleware)', () => {
    expect(ADMIN_ROUTES.sort()).toEqual(['games', 'live', 'overview', 'pages', 'recent', 'timeseries']);
  });

  it('has the middleware in the admin directory so Pages applies it to every route there', () => {
    const src = readFileSync(resolve(ADMIN_DIR, '_middleware.ts'), 'utf8');
    expect(src).toMatch(/export async function onRequest\b/);
  });

  it('admin route files expose only GET handlers (no write methods)', async () => {
    for (const route of ADMIN_ROUTES) {
      const mod = await import(`../../../functions/api/admin/${route}.ts`);
      const handlers = Object.keys(mod).filter((k) => k.startsWith('onRequest'));
      expect(handlers, route).toEqual(['onRequestGet']);
    }
  });

  it('helper modules export no request handlers (so Pages never routes them)', async () => {
    const mod = await import('../../../functions/api/admin/_auth');
    expect(Object.keys(mod).filter((k) => k.startsWith('onRequest'))).toEqual([]);
  });
});

describe.each(ADMIN_ROUTES)('/api/admin/%s', (route) => {
  it('fails closed when no authentication is configured, even with credentials', async () => {
    const { response, db, handlerRan } = await callAdmin(route, { headers: bearer(TOKEN) });
    expect(response.status).toBe(401);
    expect(handlerRan).toBe(false);
    expect(db.queries).toEqual([]);
  });

  it('rejects anonymous requests without touching the database', async () => {
    const { response, db, handlerRan } = await callAdmin(route, { env: tokenEnv });
    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toContain('Bearer');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ ok: false, error: 'Unauthorized' });
    expect(handlerRan).toBe(false);
    expect(db.queries).toEqual([]);
  });

  it('rejects wrong, malformed or prefix tokens', async () => {
    for (const auth of [`Bearer ${TOKEN}x`, `Bearer ${TOKEN.slice(0, -1)}`, `bearer ${TOKEN}`, `Basic ${TOKEN}`, TOKEN, `Bearer  ${TOKEN}`, 'Bearer ']) {
      const { response, db } = await callAdmin(route, { env: tokenEnv, headers: { Authorization: auth } });
      expect(response.status, auth).toBe(401);
      expect(db.queries).toEqual([]);
    }
  });

  it('rejects tokens passed in the query string', async () => {
    const { response } = await callAdmin(route, { env: tokenEnv, query: `?token=${TOKEN}&access_token=${TOKEN}` });
    expect(response.status).toBe(401);
  });

  it('denies every write method, authenticated or not', async () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const anon = await callAdmin(route, { env: tokenEnv, method, body: '{}' });
      expect(anon.response.status, method).toBe(401);
      const authed = await callAdmin(route, { env: tokenEnv, method, body: '{}', headers: bearer(TOKEN) });
      expect(authed.response.status, method).toBe(405);
      expect(authed.handlerRan).toBe(false);
      expect(authed.db.queries).toEqual([]);
    }
  });

  it('serves authenticated GET requests with no-store and no CORS', async () => {
    const { response, handlerRan, db } = await callAdmin(route, { env: tokenEnv, headers: bearer(TOKEN) });
    expect(response.status).toBe(200);
    expect(handlerRan).toBe(true);
    expect(db.queries.length).toBeGreaterThan(0);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('token configuration', () => {
  it('treats a short configured token as misconfiguration and denies (fail closed)', async () => {
    const short = 'short-token';
    const { response } = await callAdmin('overview', { env: { ADMIN_API_TOKEN: short }, headers: bearer(short) });
    expect(response.status).toBe(401);
  });

  it('treats an empty token as not configured', async () => {
    const { response } = await callAdmin('overview', { env: { ADMIN_API_TOKEN: '' }, headers: { Authorization: 'Bearer ' } });
    expect(response.status).toBe(401);
  });
});

describe('information disclosure', () => {
  it('does not leak database errors from handlers', async () => {
    for (const route of ADMIN_ROUTES) {
      const src = readFileSync(resolve(ADMIN_DIR, `${route}.ts`), 'utf8');
      expect(src, route).not.toMatch(/err(or)?\.message/);
    }
  });

  it('returns a generic 500 when a handler throws', async () => {
    const { onRequest } = await import('../../../functions/api/admin/_middleware');
    const res = await onRequest({
      request: new Request('https://taren.se/api/admin/overview', { headers: bearer(TOKEN) }),
      env: tokenEnv,
      next: async () => {
        throw new Error('D1_ERROR: no such table: events SQLITE_ERROR');
      },
    });
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain('SQLITE');
  });

  it('clamps /recent limit so negative values cannot remove the row cap', () => {
    const src = readFileSync(resolve(ADMIN_DIR, 'recent.ts'), 'utf8');
    expect(src).toMatch(/requested >= 1/);
  });
});
