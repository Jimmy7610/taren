import { absoluteUrl, canonicalPath } from './seo';
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type Locale } from '@/i18n/locales';
import { localizePath } from '@/i18n/paths';

/**
 * Sitemap with every locale version of every locale-neutral path. Each <url> lists all its language versions
 * (xhtml:link hreflang, plus x-default → English), the bidirectional form Google recommends.
 */
export function buildSitemap(paths: readonly string[], origin: string, locales: readonly Locale[] = LOCALES): string {
  const unique = [...new Set(paths.map(canonicalPath))];
  const alternates = (p: string) =>
    [
      ...locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${LOCALE_META[l].htmlLang}" href="${escapeXml(absoluteUrl(localizePath(p, l), origin))}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(localizePath(p, DEFAULT_LOCALE), origin))}"/>`,
    ].join('\n');
  const urls = unique
    .flatMap((p) => locales.map((l) => `  <url>\n    <loc>${escapeXml(absoluteUrl(localizePath(p, l), origin))}</loc>\n${alternates(p)}\n  </url>`))
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
