import { describe, expect, it } from 'vitest';
import { FakeD1 } from './helpers';
import { onRequestGet, onRequestPost } from '../../../functions/api/event';

const ON = { ANALYTICS_INGEST: 'on' };
const valid = () => ({ type: 'game_start', game: 'x', session_id: 'abc', ts: Date.now() });

async function post(body: unknown, opts: { env?: Record<string, string>; headers?: Record<string, string>; raw?: string } = {}) {
  const db = new FakeD1();
  const request = new Request('https://taren.se/api/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://taren.se', ...opts.headers },
    body: opts.raw ?? JSON.stringify(body),
  });
  const response = await onRequestPost({ request, env: { DB: db, ...opts.env } } as never);
  return { response, db };
}

describe('/api/event ingestion', () => {
  it('is disabled by default and writes nothing (fail closed)', async () => {
    const { response, db } = await post(valid());
    expect(response.status).toBe(403);
    expect(db.queries).toEqual([]);
  });

  it('stays disabled for any value other than "on"', async () => {
    for (const v of ['true', '1', 'ON', 'yes', ' on']) {
      expect((await post(valid(), { env: { ANALYTICS_INGEST: v } })).response.status, v).toBe(403);
    }
  });

  it('rejects missing or foreign origins when enabled', async () => {
    for (const origin of ['https://evil.example', 'null', 'https://taren.se.evil.com', 'http://taren.se']) {
      const { response, db } = await post(valid(), { env: ON, headers: { origin } });
      expect(response.status, origin).toBe(403);
      expect(db.queries).toEqual([]);
    }
    const db = new FakeD1();
    const noOrigin = new Request('https://taren.se/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid()) });
    expect((await onRequestPost({ request: noOrigin, env: { DB: db, ...ON } } as never)).status).toBe(403);
    expect(db.queries).toEqual([]);
  });

  it('honours a configured origin allowlist', async () => {
    const env = { ...ON, ANALYTICS_ALLOWED_ORIGINS: 'https://taren.se, https://preview.pages.dev' };
    expect((await post(valid(), { env, headers: { origin: 'https://preview.pages.dev' } })).response.status).toBe(200);
  });

  it('rejects non-JSON, oversized and malformed bodies', async () => {
    expect((await post(valid(), { env: ON, headers: { 'content-type': 'text/plain' } })).response.status).toBe(415);
    expect((await post({ ...valid(), pad: 'x'.repeat(5000) }, { env: ON })).response.status).toBe(413);
    expect((await post(null, { env: ON, raw: '{not json' })).response.status).toBe(400);
    expect((await post(null, { env: ON, raw: '[1,2]' })).response.status).toBe(400);
  });

  it('validates type, session, timestamp and duration', async () => {
    const cases: [string, unknown][] = [
      ['bad type', { ...valid(), type: 'admin' }],
      ['no session', { ...valid(), session_id: '' }],
      ['future ts', { ...valid(), ts: Date.now() + 3600_000 }],
      ['stale ts', { ...valid(), ts: Date.now() - 2 * 3600_000 }],
      ['negative duration', { ...valid(), duration_ms: -5 }],
    ];
    for (const [name, body] of cases) {
      const { response, db } = await post(body, { env: ON });
      expect(response.status, name).toBe(400);
      expect(db.queries).toEqual([]);
    }
  });

  it('accepts a valid same-origin event and writes exactly one row with bound parameters', async () => {
    const { response, db } = await post({ ...valid(), path: "/x'); DROP TABLE events;--" }, { env: ON });
    expect(response.status).toBe(200);
    expect(db.queries).toHaveLength(1);
    expect(db.queries[0]).toMatch(/^INSERT INTO events/);
    expect(db.queries[0]).not.toContain('DROP');
  });

  it('never reveals database errors', async () => {
    const request = new Request('https://taren.se/api/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://taren.se' },
      body: JSON.stringify(valid()),
    });
    const DB = { prepare: () => ({ bind: () => ({ run: async () => { throw new Error('D1_ERROR secret detail'); } }) }) };
    const res = await onRequestPost({ request, env: { DB, ...ON } } as never);
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain('secret');
  });

  it('GET is not allowed', async () => {
    expect((await onRequestGet({} as never)).status).toBe(405);
  });
});
