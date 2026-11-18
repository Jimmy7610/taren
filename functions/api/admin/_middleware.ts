/**
 * Guards every route under /api/admin/* (Pages applies a directory's _middleware to all of its
 * routes, including ones added later). Unauthenticated requests never reach a handler, so the
 * database is never queried for them. See functions/api/admin/_auth.ts and docs/SECURITY_ADMIN_API.md.
 */
import { authenticateAdmin, type AdminAuthEnv } from './_auth';

interface MiddlewareContext {
  request: Request;
  env: AdminAuthEnv;
  next: () => Promise<Response>;
}

const SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  Vary: 'Authorization, Cf-Access-Jwt-Assertion',
};

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...extra },
  });
}

function harden(res: Response): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  // Admin data must never be readable cross-origin from a browser.
  out.headers.delete('Access-Control-Allow-Origin');
  out.headers.delete('Access-Control-Allow-Credentials');
  return out;
}

export async function onRequest(context: MiddlewareContext): Promise<Response> {
  let auth;
  try {
    auth = await authenticateAdmin(context.request, context.env ?? {});
  } catch {
    auth = { ok: false as const, reason: 'auth error' };
  }

  if (!auth.ok) {
    // Log the reason server-side only; the client learns nothing about configuration.
    console.warn(`admin api denied: ${auth.reason}`);
    return json(401, { ok: false, error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer realm="taren-admin"' });
  }

  // Authorization: the admin API is read-only.
  if (context.request.method !== 'GET') {
    return json(405, { ok: false, error: 'Method not allowed' }, { Allow: 'GET' });
  }

  try {
    return harden(await context.next());
  } catch {
    return json(500, { ok: false, error: 'Internal error' });
  }
}
