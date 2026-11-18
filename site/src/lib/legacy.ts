/**
 * Legacy route retirement (old taren.se browser games and experiments).
 * See docs/TAREN_2_AUDIT.md §7. Used by the Pages Functions in /functions.
 */
export const GONE_PREFIXES = [
  '/games',
  '/experiments',
  // Retired in Taren 2.2 (owner-approved): Parakollen (Paralympics tracker, own repo Jimmy7610/Parakollen)
  // and Ninefold (Sudoku browser game). Source preserved on `main` / in Git history.
  '/public/parakollen',
  '/public/ninefold',
  '/parakollen',
] as const;

export function isGone(pathname: string): boolean {
  return GONE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

interface AssetsBinding {
  fetch: (input: Request | string) => Promise<Response>;
}

/** Responds 410 Gone with the site's own "retired" page as the body. */
export async function goneResponse(request: Request, assets: AssetsBinding): Promise<Response> {
  const page = await assets.fetch(new Request(new URL('/410/', request.url), { method: 'GET' }));
  const body = page.ok && request.method !== 'HEAD' ? await page.text() : null;
  return new Response(body, {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
}

/** Pages Function handler shared by every retired prefix. Anything else falls through to the
 * static site (so unknown paths still get the normal 404 page). */
export async function onRetiredRequest(context: {
  request: Request;
  env: { ASSETS: AssetsBinding };
  next?: () => Promise<Response>;
}) {
  const { pathname } = new URL(context.request.url);
  if (!isGone(pathname)) return context.next ? context.next() : new Response('Not found', { status: 404 });
  return goneResponse(context.request, context.env.ASSETS);
}
