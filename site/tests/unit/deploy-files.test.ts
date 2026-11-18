import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('_redirects', () => {
  const rules = read('public/_redirects')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.trim().split(/\s+/));

  it('only uses 301 to genuinely relevant pages', () => {
    expect(rules).toContainEqual(['/about', '/studio/', '301']);
    expect(rules).toContainEqual(['/about/', '/studio/', '301']);
  });

  it('never sends old games to the homepage and has no SPA catch-all', () => {
    for (const [from, to] of rules) {
      expect(from!.startsWith('/games') && to === '/').toBe(false);
      expect(from).not.toBe('/*');
    }
  });
});

describe('_headers', () => {
  const headers = read('public/_headers');
  it('sends a strict CSP without unsafe-inline', () => {
    const csp = /Content-Security-Policy: (.+)/.exec(headers)?.[1] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('unsafe-eval');
  });
  it('caches hashed assets immutably', () => {
    expect(headers).toMatch(/\/_astro\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
  });
  it('sets standard security headers', () => {
    for (const h of ['X-Content-Type-Options: nosniff', 'Referrer-Policy', 'X-Frame-Options: DENY', 'Permissions-Policy', 'Strict-Transport-Security'])
      expect(headers).toContain(h);
  });
});

describe('Pages Functions', () => {
  it('retire /games and /experiments', () => {
    for (const f of ['functions/games/[[path]].ts', 'functions/experiments/[[path]].ts', 'functions/public/[[path]].ts', 'functions/parakollen/[[path]].ts']) {
      expect(existsSync(resolve(root, f)), f).toBe(true);
      expect(read(f)).toContain('onRetiredRequest as onRequest');
    }
  });
});
