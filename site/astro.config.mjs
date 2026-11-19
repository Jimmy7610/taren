// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Cloudflare Pages serves the nearest 404.html for unknown paths (e.g. /sv/404.html for /sv/*). Astro writes
 * src/pages/sv/404.astro to sv/404/index.html, so move every non-root localized 404 page into place.
 */
/** @type {import('astro').AstroIntegration} */
const localized404 = {
  name: 'taren-localized-404',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const out = fileURLToPath(dir);
      for (const locale of ['sv']) {
        const from = `${out}/${locale}/404/index.html`;
        if (existsSync(from)) {
          renameSync(from, `${out}/${locale}/404.html`);
          rmSync(`${out}/${locale}/404`, { recursive: true, force: true });
        }
      }
    },
  },
};

// Canonical origin. All canonical URLs, Open Graph URLs and the sitemap use it.
export const SITE_ORIGIN = 'https://taren.se';

export default defineConfig({
  site: SITE_ORIGIN,
  output: 'static',
  // Cloudflare Pages serves /path/index.html at /path/ and redirects /path → /path/.
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // External stylesheets only, so the Content-Security-Policy needs no 'unsafe-inline' for styles.
    inlineStylesheets: 'never',
  },
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
  integrations: [localized404],
  image: {
    // Only local images are optimised; no remote image domains are allowed.
    domains: [],
  },
  vite: {
    plugins: [tailwindcss()],
    // One stylesheet for the whole site (≈ 10 kB gzip): fewer render-blocking requests on slow
    // networks than per-page chunks, and it stays an external file for the CSP.
    build: { assetsInlineLimit: 0, cssCodeSplit: false },
  },
});
