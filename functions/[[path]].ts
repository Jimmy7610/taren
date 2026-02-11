interface PagesContext {
  request: Request;
  env: { ASSETS: { fetch: typeof fetch } };
  next: () => Promise<Response>;
}

export async function onRequest(context: PagesContext) {
  const url = new URL(context.request.url);

  // Force /admin to serve index.html to bypass stale static files
  if (url.pathname === "/admin" || url.pathname === "/admin/" || url.pathname.startsWith("/admin/")) {
    return context.env.ASSETS.fetch(url.origin + "/index.html");
  }

  // Allow direct access to real files (assets) and API/function routes
  if (url.pathname.includes(".") || url.pathname.startsWith("/api")) {
    return context.next();
  }

  // Try to serve the requested path; if it 404s, fall back to index.html
  const res = await context.next();
  if (res.status === 404) {
    return context.env.ASSETS.fetch(new Request(new URL("/index.html", url), context.request));
  }
  return res;
}
