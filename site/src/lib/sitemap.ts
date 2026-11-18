import { absoluteUrl, canonicalPath } from './seo';

export function buildSitemap(paths: readonly string[], origin: string): string {
  const unique = [...new Set(paths.map(canonicalPath))];
  const urls = unique
    .map((p) => `  <url>\n    <loc>${escapeXml(absoluteUrl(p, origin))}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
