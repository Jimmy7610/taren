import { SITE } from '@/config/site';
import { UI } from '@/i18n/ui';
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type Locale } from '@/i18n/locales';
import { alternatePaths } from '@/i18n/paths';

export interface SeoInput {
  /** Page title without the brand suffix. Omit on the home page. */
  title?: string | undefined;
  description: string;
  path: string;
  ogImage?: string | undefined;
  ogImageAlt?: string | undefined;
  ogType?: 'website' | 'article' | undefined;
  noindex?: boolean | undefined;
  /** Page language; defaults to English. */
  locale?: Locale | undefined;
}

export interface SeoAlternate {
  hreflang: string;
  href: string;
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
  /** hreflang links to every language version plus x-default (English). Empty on noindex pages. */
  alternates: SeoAlternate[];
  ogLocale: string;
  ogLocaleAlternates: string[];
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
  const locale = input.locale ?? DEFAULT_LOCALE;
  const ui = UI[locale];
  const title = input.title ? `${input.title} — ${SITE.name}` : `${SITE.name} — ${ui['site.tagline'].replace(/\.$/, '')}`;
  const twins = alternatePaths(canonicalPath(input.path));
  const alternates: SeoAlternate[] = input.noindex
    ? []
    : [
        ...LOCALES.map((l) => ({ hreflang: LOCALE_META[l].htmlLang, href: absoluteUrl(twins[l]) })),
        { hreflang: 'x-default', href: absoluteUrl(twins[DEFAULT_LOCALE]) },
      ];
  return {
    title,
    description: input.description,
    canonical: input.noindex ? undefined : absoluteUrl(canonicalPath(input.path)),
    ogImage: absoluteUrl(input.ogImage ?? SITE.defaultOgImage),
    ogImageAlt: input.ogImageAlt ?? ui['site.ogImageAlt'],
    ogType: input.ogType ?? 'website',
    robots: input.noindex ? 'noindex, follow' : 'index, follow',
    alternates,
    ogLocale: LOCALE_META[locale].ogLocale,
    ogLocaleAlternates: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
  };
}

export function organizationJsonLd(locale: Locale = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.origin}/#organization`,
    name: 'Taren',
    url: `${SITE.origin}/`,
    slogan: UI[locale]['site.tagline'],
    description: UI[locale]['site.description'],
    founder: { '@type': 'Person', name: SITE.founder },
    location: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'SE' } },
  };
}

export function websiteJsonLd(locale: Locale = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.origin}/#website`,
    name: 'Taren',
    url: `${SITE.origin}/`,
    description: UI[locale]['site.description'],
    inLanguage: LOCALES.map((l) => LOCALE_META[l].htmlLang),
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
