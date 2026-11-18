/**
 * Server-side authentication and authorization for /api/admin/*.
 *
 * FAIL CLOSED: a request is allowed only when at least one method below is fully configured
 * AND the request proves it. Missing, partial or invalid configuration denies everything.
 *
 * Method A — Cloudflare Access (recommended)
 *   ACCESS_TEAM_DOMAIN  e.g. "yourteam.cloudflareaccess.com"
 *   ACCESS_AUD          the Access application's Audience (AUD) tag
 *   ADMIN_EMAILS        comma-separated allowlist of identities permitted to read analytics
 *   The request must carry a valid `Cf-Access-Jwt-Assertion` (RS256, signed by the team's
 *   published keys, correct issuer and audience, not expired) whose email is on the allowlist.
 *
 * Method B — Bearer token (for scripts / break-glass)
 *   ADMIN_API_TOKEN     a random secret of at least 32 characters, stored as an encrypted
 *                       Pages secret (never in the repository)
 *   The request must send `Authorization: Bearer <token>`.
 *
 * This file starts with "_" and exports no request handlers, so Pages does not route it.
 */

export interface AdminAuthEnv {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ADMIN_EMAILS?: string;
  ADMIN_API_TOKEN?: string;
}

export type AuthResult =
  | { ok: true; method: 'access' | 'token'; subject: string }
  | { ok: false; reason: string };

export const MIN_TOKEN_LENGTH = 32;
const CLOCK_SKEW_S = 60;
const JWKS_TTL_MS = 10 * 60 * 1000;

const encoder = new TextEncoder();

/* ----------------------------------------------------------------------------- helpers */

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function decodeJsonSegment(segment: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Constant-time comparison of two strings via fixed-length SHA-256 digests. */
export async function timingSafeEqualString(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const x = new Uint8Array(da);
  const y = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i]! ^ y[i]!;
  return diff === 0;
}

export function normaliseIssuer(teamDomain: string): string | null {
  const host = teamDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  // Only Cloudflare Access team domains are accepted, so a misconfiguration cannot point key
  // discovery at an arbitrary host.
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(host)) return null;
  return `https://${host.toLowerCase()}`;
}

export function parseAllowlist(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/* ----------------------------------------------------------------------------- JWKS */

interface Jwk {
  kid?: string;
  kty?: string;
  alg?: string;
  n?: string;
  e?: string;
}

type Fetcher = (input: string) => Promise<Response>;

const jwksCache = new Map<string, { keys: Jwk[]; expires: number }>();

/** Exposed for tests. */
export function clearJwksCache() {
  jwksCache.clear();
}

async function getJwks(issuer: string, fetcher: Fetcher, forceRefresh = false): Promise<Jwk[]> {
  const cached = jwksCache.get(issuer);
  if (!forceRefresh && cached && cached.expires > Date.now()) return cached.keys;
  const res = await fetcher(`${issuer}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const body = (await res.json()) as { keys?: unknown };
  const keys = Array.isArray(body.keys) ? (body.keys as Jwk[]) : [];
  jwksCache.set(issuer, { keys, expires: Date.now() + JWKS_TTL_MS });
  return keys;
}

/* ----------------------------------------------------------------------------- Access JWT */

export async function verifyAccessJwt(
  token: string,
  opts: { issuer: string; audience: string; fetcher: Fetcher; nowS?: number },
): Promise<{ ok: true; claims: Record<string, unknown> } | { ok: false; reason: string }> {
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((p) => !/^[A-Za-z0-9_-]+$/.test(p))) return { ok: false, reason: 'malformed token' };
  const [h, p, s] = parts as [string, string, string];

  const header = decodeJsonSegment(h);
  const claims = decodeJsonSegment(p);
  if (!header || !claims) return { ok: false, reason: 'malformed token' };
  // Pin the algorithm: rejects "none", HS256 key-confusion and anything else.
  if (header.alg !== 'RS256') return { ok: false, reason: 'unsupported alg' };
  if (typeof header.kid !== 'string' || !header.kid) return { ok: false, reason: 'missing kid' };

  let keys = await getJwks(opts.issuer, opts.fetcher);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    keys = await getJwks(opts.issuer, opts.fetcher, true); // key rotation
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk || jwk.kty !== 'RSA' || !jwk.n || !jwk.e) return { ok: false, reason: 'unknown key' };

  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, base64UrlToBytes(s), encoder.encode(`${h}.${p}`));
  if (!valid) return { ok: false, reason: 'bad signature' };

  const now = opts.nowS ?? Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_S < now) return { ok: false, reason: 'expired' };
  if (typeof claims.nbf === 'number' && claims.nbf - CLOCK_SKEW_S > now) return { ok: false, reason: 'not yet valid' };
  if (typeof claims.iat === 'number' && claims.iat - CLOCK_SKEW_S > now) return { ok: false, reason: 'issued in the future' };
  if (claims.iss !== opts.issuer) return { ok: false, reason: 'wrong issuer' };
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(opts.audience)) return { ok: false, reason: 'wrong audience' };

  return { ok: true, claims };
}

/* ----------------------------------------------------------------------------- entry point */

export async function authenticateAdmin(
  request: Request,
  env: AdminAuthEnv,
  fetcher: Fetcher = (u) => fetch(u),
): Promise<AuthResult> {
  const reasons: string[] = [];

  // Method A: Cloudflare Access
  const issuer = env.ACCESS_TEAM_DOMAIN ? normaliseIssuer(env.ACCESS_TEAM_DOMAIN) : null;
  const audience = env.ACCESS_AUD?.trim();
  const allowlist = parseAllowlist(env.ADMIN_EMAILS);
  const accessConfigured = Boolean(issuer && audience && allowlist.size > 0);
  const assertion = request.headers.get('Cf-Access-Jwt-Assertion');

  if (accessConfigured && assertion) {
    try {
      const result = await verifyAccessJwt(assertion, { issuer: issuer!, audience: audience!, fetcher });
      if (result.ok) {
        const email = typeof result.claims.email === 'string' ? result.claims.email.toLowerCase() : '';
        if (email && allowlist.has(email)) return { ok: true, method: 'access', subject: email };
        reasons.push('access: identity not allowed');
      } else {
        reasons.push(`access: ${result.reason}`);
      }
    } catch {
      reasons.push('access: verification error'); // e.g. key endpoint unreachable → deny
    }
  } else if (!accessConfigured) {
    reasons.push('access: not configured');
  } else {
    reasons.push('access: no assertion');
  }

  // Method B: bearer token
  const configuredToken = env.ADMIN_API_TOKEN ?? '';
  const auth = request.headers.get('Authorization') ?? '';
  const match = /^Bearer ([^\s]+)$/.exec(auth);
  if (configuredToken.length >= MIN_TOKEN_LENGTH) {
    if (match && (await timingSafeEqualString(match[1]!, configuredToken))) {
      return { ok: true, method: 'token', subject: 'token' };
    }
    reasons.push(match ? 'token: mismatch' : 'token: missing');
  } else {
    reasons.push(configuredToken ? 'token: configured value too short' : 'token: not configured');
  }

  return { ok: false, reason: reasons.join('; ') };
}
