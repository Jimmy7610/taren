// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

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
