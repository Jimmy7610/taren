import { describe, expect, it } from 'vitest';
import { goneResponse, isGone, onRetiredRequest } from '@/lib/legacy';
import { KOFI_URL, PRIMARY_NAV, SITE, STATIC_ROUTES } from '@/config/site';

const assets = { fetch: async () => new Response('<html>retired</html>', { status: 200 }) };

describe('legacy route retirement', () => {
  it('marks old game and experiment routes as gone', () => {
    for (const p of ['/games', '/games/', '/games/ashveil/', '/games/ashveil/index.html', '/experiments/signal-pond/']) expect(isGone(p)).toBe(true);
    for (const p of ['/', '/gamesx', '/products/', '/studio/']) expect(isGone(p)).toBe(false);
  });

  it('retires Parakollen and Ninefold (Taren 2.2)', () => {
    for (const p of ['/public/parakollen/', '/public/parakollen/assets/js/api.js', '/public/ninefold/', '/public/ninefold/index.html', '/parakollen', '/parakollen/api/medals'])
      expect(isGone(p), p).toBe(true);
    for (const p of ['/public/', '/public/other/', '/parakollenx', '/products/parakollen/']) expect(isGone(p), p).toBe(false);
  });

  it('responds 410 with the retired page and noindex', async () => {
    const res = await goneResponse(new Request('https://taren.se/games/ashveil/'), assets);
    expect(res.status).toBe(410);
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    // Regression (2.3 audit): Function responses do not receive _headers, so the 410 page sends them itself.
    expect(res.headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('strict-transport-security')).toMatch(/max-age=\d+/);
    expect(await res.text()).toContain('retired');
  });

  it('handles HEAD without a body', async () => {
    const res = await goneResponse(new Request('https://taren.se/games/', { method: 'HEAD' }), assets);
    expect(res.status).toBe(410);
    expect(await res.text()).toBe('');
  });

  it('the function handler passes anything outside retired prefixes to the static site', async () => {
    const res = await onRetiredRequest({
      request: new Request('https://taren.se/public/other/'),
      env: { ASSETS: assets },
      next: async () => new Response('static 404', { status: 404 }),
    });
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('static 404');
    const gone = await onRetiredRequest({ request: new Request('https://taren.se/public/ninefold/'), env: { ASSETS: assets } });
    expect(gone.status).toBe(410);
  });
});

describe('site config', () => {
  it('points Ko-fi at the official page', () => {
    expect(KOFI_URL).toBe('https://ko-fi.com/taren');
  });
  it('includes Support in the primary navigation', () => {
    expect(PRIMARY_NAV.map((n) => n.href)).toEqual(['/products/', '/studio/', '/support/']);
  });
  it('does not list error pages as indexable routes', () => {
    expect(STATIC_ROUTES).not.toContain('/404/');
    expect(STATIC_ROUTES).not.toContain('/410/');
  });
});

describe('owner-approved contact and copyright (Taren 2.3)', () => {
  it('uses the approved contact address and copyright line', () => {
    expect(SITE.contactEmail).toBe('Jbl_76@hotmail.com');
    expect(SITE.copyright).toBe('© 2026 Jimmy Eliasson · Taren');
    expect(SITE.copyright).not.toMatch(/\b(AB|Ltd|Inc)\b|All rights reserved/i);
  });
});
