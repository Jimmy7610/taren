/**
 * Supported locales. English is the default and lives at the site root; every other locale lives under
 * /<locale>/ (e.g. /sv/products/). To add a locale: add it here, add its dictionary in ui.ts (the type system
 * then lists every missing string), add product translations under src/content/product-translations/<locale>/,
 * add its legal/studio/support copy in src/views/copy/, and create the thin route files under src/pages/<locale>/.
 * See docs/LOCALIZATION.md.
 */
export const LOCALES = ['en', 'sv'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleMeta {
  /** BCP 47 tag for <html lang> and hreflang. */
  htmlLang: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** Compact label for the switcher. */
  short: string;
  /** Endonym: the language's own name, used as the accessible name of the switcher link. */
  name: string;
  /** Intl locale for dates and numbers. */
  intl: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { htmlLang: 'en', ogLocale: 'en_GB', short: 'EN', name: 'English', intl: 'en-GB' },
  sv: { htmlLang: 'sv', ogLocale: 'sv_SE', short: 'SV', name: 'Svenska', intl: 'sv-SE' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
