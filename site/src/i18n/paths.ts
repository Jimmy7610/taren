import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './locales';

/** Splits a URL pathname into its locale and the locale-neutral path ("/sv/products/" → sv, "/products/"). */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const first = clean.split('/')[1] ?? '';
  if (first !== DEFAULT_LOCALE && isLocale(first)) {
    const rest = clean.slice(first.length + 1) || '/';
    return { locale: first, path: rest.startsWith('/') ? rest : `/${rest}` };
  }
  return { locale: DEFAULT_LOCALE, path: clean };
}

/** The locale of a URL pathname. */
export function localeFromPath(pathname: string): Locale {
  return splitLocale(pathname).locale;
}

/** Builds the URL of a locale-neutral path in a locale: ("/products/", "sv") → "/sv/products/". Leaves
 *  external URLs, mailto:, in-page anchors and asset files untouched. */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (/\.[a-z0-9]+(?:[?#].*)?$/i.test(path)) return path; // files such as /sitemap.xml, /og/x.png
  const { path: neutral } = splitLocale(path);
  return locale === DEFAULT_LOCALE ? neutral : `/${locale}${neutral === '/' ? '/' : neutral}`;
}

/** The same page in every locale: { en: "/studio/", sv: "/sv/studio/" }. */
export function alternatePaths(pathname: string): Record<Locale, string> {
  const { path } = splitLocale(pathname);
  return Object.fromEntries(LOCALES.map((l) => [l, localizePath(path, l)])) as Record<Locale, string>;
}
