import { SITE } from '@/config/site';

export interface SeoInput {
  /** Page title without the brand suffix. Omit on the home page. */
  title?: string | undefined;
  description: string;
  path: string;
  ogImage?: string | undefined;
  ogImageAlt?: string | undefined;
  ogType?: 'website' | 'article' | undefined;
  noindex?: boolean | undefined;
}

export interface SeoMeta {
  title: string;
  description: string;
  /** Absent on noindex pages (404, 410, drafts): a canonical URL there would point at a page that does not exist. */
  canonical: string | undefined;
  ogImage: string;
  ogImageAlt: string;
  ogType: 'website' | 'article';
  robots: string;
}

/** Normalises any path to the site's canonical form: leading and trailing slash, no query/hash. */
export function canonicalPath(path: string): string {
  const clean = (path.split(/[?#]/)[0] ?? '/').replace(/\/{2,}/g, '/').replace(/\/index\.html$/, '/');
  const withLead = clean.startsWith('/') ? clean : `/${clean}`;
  if (/\.[a-z0-9]+$/i.test(withLead)) return withLead; // files such as /sitemap.xml
  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}

export function absoluteUrl(path: string, origin: string = SITE.origin): string {
  return new URL(path, origin).toString();
}

export function buildSeo(input: SeoInput): SeoMeta {
  const title = input.title ? `${input.title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline.replace(/\.$/, '')}`;
  return {
    title,
    description: input.description,
    canonical: input.noindex ? undefined : absoluteUrl(canonicalPath(input.path)),
    ogImage: absoluteUrl(input.ogImage ?? SITE.defaultOgImage),
    ogImageAlt: input.ogImageAlt ?? SITE.defaultOgImageAlt,
    ogType: input.ogType ?? 'website',
    robots: input.noindex ? 'noindex, follow' : 'index, follow',
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.origin}/#organization`,
    name: 'Taren',
    url: `${SITE.origin}/`,
    slogan: SITE.tagline,
    description: SITE.description,
    founder: { '@type': 'Person', name: SITE.founder },
    location: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'SE' } },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.origin}/#website`,
    name: 'Taren',
    url: `${SITE.origin}/`,
    inLanguage: SITE.locale,
    publisher: { '@id': `${SITE.origin}/#organization` },
  };
}

export function breadcrumbJsonLd(items: ReadonlyArray<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(canonicalPath(item.path)),
    })),
  };
}

/** Safe serialisation for <script type="application/ld+json">: escapes "<" so content can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
