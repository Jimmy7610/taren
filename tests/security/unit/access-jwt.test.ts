import { beforeEach, describe, expect, it } from 'vitest';
import { authenticateAdmin, clearJwksCache, normaliseIssuer, timingSafeEqualString } from '../../../functions/api/admin/_auth';
import { AUD, TEAM, makeIssuer } from './helpers';

const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: 'owner@example.com, second@example.com' };
const req = (jwt?: string, extra: Record<string, string> = {}) =>
  new Request('https://taren.se/api/admin/overview', { headers: { ...(jwt ? { 'Cf-Access-Jwt-Assertion': jwt } : {}), ...extra } });

beforeEach(() => clearJwksCache());

describe('Cloudflare Access JWT', () => {
  it('accepts a valid token for an allowlisted identity', async () => {
    const iss = await makeIssuer();
    const r = await authenticateAdmin(req(await iss.sign(iss.goodClaims())), env, iss.fetcher);
    expect(r).toEqual({ ok: true, method: 'access', subject: 'owner@example.com' });
  });

  it('matches allowlisted emails case-insensitively', async () => {
    const iss = await makeIssuer();
    const r = await authenticateAdmin(req(await iss.sign(iss.goodClaims({ email: 'Second@Example.com' }))), env, iss.fetcher);
    expect(r.ok).toBe(true);
  });

  it.each([
    ['identity not on the allowlist', { email: 'intruder@example.com' }],
    ['no email claim', { email: undefined }],
    ['expired', { exp: Math.floor(Date.now() / 1000) - 3600 }],
    ['not yet valid', { nbf: Math.floor(Date.now() / 1000) + 3600 }],
    ['wrong audience', { aud: ['someone-elses-app'] }],
    ['wrong issuer', { iss: 'https://evil.cloudflareaccess.com' }],
    ['missing exp', { exp: undefined }],
  ])('rejects: %s', async (_name, over) => {
    const iss = await makeIssuer();
    const r = await authenticateAdmin(req(await iss.sign(iss.goodClaims(over))), env, iss.fetcher);
    expect(r.ok).toBe(false);
  });

  it('rejects alg=none, HS256 and unknown kid', async () => {
    const iss = await makeIssuer();
    const claims = iss.goodClaims();
    const enc = (o: object) => iss.b64url(new TextEncoder().encode(JSON.stringify(o)));
    const none = `${enc({ alg: 'none', typ: 'JWT' })}.${enc(claims)}.`;
    const hs = `${enc({ alg: 'HS256', kid: 'key-1' })}.${enc(claims)}.${enc({ s: 1 })}`;
    for (const t of [none, hs, await iss.sign(claims, { alg: 'RS256', kid: 'other' })]) {
      expect((await authenticateAdmin(req(t), env, iss.fetcher)).ok).toBe(false);
    }
  });

  it('rejects a token signed by a different key with the same kid', async () => {
    const real = await makeIssuer();
    const attacker = await makeIssuer();
    const forged = await attacker.sign(attacker.goodClaims());
    expect((await authenticateAdmin(req(forged), env, real.fetcher)).ok).toBe(false);
  });

  it('rejects a tampered payload', async () => {
    const iss = await makeIssuer();
    const [h, , s] = (await iss.sign(iss.goodClaims({ email: 'intruder@example.com' }))).split('.');
    const p = iss.b64url(new TextEncoder().encode(JSON.stringify(iss.goodClaims())));
    expect((await authenticateAdmin(req(`${h}.${p}.${s}`), env, iss.fetcher)).ok).toBe(false);
  });

  it('rejects garbage', async () => {
    const iss = await makeIssuer();
    for (const t of ['', 'a.b', 'a.b.c', 'x'.repeat(5000), '...', 'ey.ey.ey']) {
      expect((await authenticateAdmin(req(t), env, iss.fetcher)).ok, t.slice(0, 10)).toBe(false);
    }
  });

  it('fails closed when the key endpoint is unreachable', async () => {
    const iss = await makeIssuer();
    const token = await iss.sign(iss.goodClaims());
    const down = async () => new Response('down', { status: 503 });
    expect((await authenticateAdmin(req(token), env, down)).ok).toBe(false);
    const throws = async () => {
      throw new Error('network');
    };
    expect((await authenticateAdmin(req(token), env, throws)).ok).toBe(false);
  });

  it('fails closed when Access is only partially configured', async () => {
    const iss = await makeIssuer();
    const token = await iss.sign(iss.goodClaims());
    for (const partial of [
      { ...env, ADMIN_EMAILS: '' },
      { ...env, ACCESS_AUD: '' },
      { ...env, ACCESS_TEAM_DOMAIN: '' },
      { ...env, ACCESS_TEAM_DOMAIN: 'evil.example.com' },
    ]) {
      expect((await authenticateAdmin(req(token), partial, iss.fetcher)).ok).toBe(false);
    }
  });

  it('caches keys and refetches once on rotation', async () => {
    const iss = await makeIssuer();
    const t = await iss.sign(iss.goodClaims());
    await authenticateAdmin(req(t), env, iss.fetcher);
    await authenticateAdmin(req(t), env, iss.fetcher);
    expect(iss.fetchCount()).toBe(1);
  });

  it('only accepts *.cloudflareaccess.com team domains', () => {
    expect(normaliseIssuer('Team.cloudflareaccess.com')).toBe('https://team.cloudflareaccess.com');
    expect(normaliseIssuer('https://team.cloudflareaccess.com/')).toBe('https://team.cloudflareaccess.com');
    expect(normaliseIssuer('evil.com')).toBeNull();
    expect(normaliseIssuer('team.cloudflareaccess.com.evil.com')).toBeNull();
  });
});

describe('constant-time comparison', () => {
  it('compares correctly', async () => {
    expect(await timingSafeEqualString('abc', 'abc')).toBe(true);
    expect(await timingSafeEqualString('abc', 'abd')).toBe(false);
    expect(await timingSafeEqualString('abc', 'abcd')).toBe(false);
    expect(await timingSafeEqualString('', '')).toBe(true);
  });
});
