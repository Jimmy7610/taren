/** Test doubles for the Pages runtime: a recording fake D1 and a router that mimics Pages. */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { onRequest as adminMiddleware } from '../../../functions/api/admin/_middleware';

export const ADMIN_DIR = resolve(__dirname, '../../../functions/api/admin');

/** Every route file Pages would expose under /api/admin (underscore files are not routes). */
export const ADMIN_ROUTES = readdirSync(ADMIN_DIR)
  .filter((f) => f.endsWith('.ts') && !f.startsWith('_'))
  .map((f) => f.replace(/\.ts$/, ''));

export class FakeD1 {
  queries: string[] = [];
  prepare(sql: string) {
    this.queries.push(sql);
    const stmt = {
      bind: () => stmt,
      first: async () => ({ n: 0, game: null }),
      all: async () => ({ results: [] }),
      run: async () => ({ success: true }),
    };
    return stmt;
  }
}

export type Env = Record<string, unknown> & { DB: FakeD1 };

/** Runs a request through the admin middleware and then the route handler, like Pages does. */
export async function callAdmin(route: string, init: RequestInit & { env?: Partial<Env>; query?: string } = {}) {
  const db = new FakeD1();
  const env = { DB: db, ...init.env } as Env;
  const request = new Request(`https://taren.se/api/admin/${route}${init.query ?? ''}`, init);
  const mod = (await import(`../../../functions/api/admin/${route}.ts`)) as Record<string, (ctx: unknown) => Promise<Response>>;
  let handlerRan = false;
  const next = async () => {
    handlerRan = true;
    const key = `onRequest${request.method.charAt(0)}${request.method.slice(1).toLowerCase()}`;
    const handler = mod[key] ?? mod.onRequest;
    if (!handler) return new Response('Method Not Allowed', { status: 405 });
    return handler({ request, env, params: {}, data: {}, next: async () => new Response(null, { status: 404 }), waitUntil() {} });
  };
  const response = await adminMiddleware({ request, env: env as never, next });
  return { response, db, handlerRan };
}

/* ------------------------------------------------------------------ Access JWT test issuer */

const b64url = (bytes: ArrayBuffer | Uint8Array) =>
  Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)).toString('base64url');

export const TEAM = 'taren-test.cloudflareaccess.com';
export const ISSUER = `https://${TEAM}`;
export const AUD = 'aud-tag-1234567890';

export async function makeIssuer(kid = 'key-1') {
  const pair = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  const pub = (await crypto.subtle.exportKey('jwk', pair.publicKey)) as JsonWebKey;
  const jwks = { keys: [{ kid, kty: 'RSA', alg: 'RS256', n: pub.n, e: pub.e }] };
  let fetches = 0;
  const fetcher = async (url: string) => {
    fetches++;
    if (url !== `${ISSUER}/cdn-cgi/access/certs`) return new Response('nope', { status: 404 });
    return new Response(JSON.stringify(jwks), { headers: { 'content-type': 'application/json' } });
  };
  async function sign(claims: Record<string, unknown>, header: Record<string, unknown> = { alg: 'RS256', kid, typ: 'JWT' }) {
    const h = b64url(new TextEncoder().encode(JSON.stringify(header)));
    const p = b64url(new TextEncoder().encode(JSON.stringify(claims)));
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(`${h}.${p}`));
    return `${h}.${p}.${b64url(sig)}`;
  }
  const now = Math.floor(Date.now() / 1000);
  const goodClaims = (over: Record<string, unknown> = {}) => ({
    iss: ISSUER,
    aud: [AUD],
    email: 'owner@example.com',
    iat: now - 10,
    nbf: now - 10,
    exp: now + 600,
    ...over,
  });
  return { sign, fetcher, goodClaims, fetchCount: () => fetches, b64url };
}
