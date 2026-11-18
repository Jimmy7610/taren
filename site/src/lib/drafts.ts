/**
 * Draft preview mode. Unpublished products are hidden everywhere by default. They become visible
 * (with a "Draft" banner, noindex, and never in the sitemap) only when either
 *   - the build runs with TAREN_SHOW_DRAFTS=1 (local review), or
 *   - Cloudflare Pages builds the dedicated branch `preview/drafts` (CF_PAGES_BRANCH).
 * Production builds of `main` and the 2.x preview branch never set either.
 */
export const DRAFTS_BRANCH = 'preview/drafts';

export function draftsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.TAREN_SHOW_DRAFTS === '1' || env.CF_PAGES_BRANCH === DRAFTS_BRANCH;
}

/** A product is shown when it is published, or when drafts are enabled. */
export function isVisible(p: { published: boolean }, showDrafts: boolean): boolean {
  return p.published === true || showDrafts;
}
