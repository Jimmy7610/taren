import { UI, type UiKey } from './ui';
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from './locales';
import { localeFromPath, localizePath } from './paths';

export { LOCALES, DEFAULT_LOCALE, LOCALE_META, isLocale, type Locale } from './locales';
export { alternatePaths, localeFromPath, localizePath, splitLocale } from './paths';
export type { UiKey } from './ui';

export type Vars = Record<string, string | number>;

/** Fills {placeholders}. Throws on a placeholder without a value so a broken string can never ship. */
export function format(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    if (!(k in vars)) throw new Error(`Missing value for {${k}} in "${template}"`);
    return String(vars[k]);
  });
}

/** Translator for one locale. */
export function useTranslations(locale: Locale) {
  const dict = UI[locale];
  const t = (key: UiKey, vars?: Vars) => format(dict[key], vars);
  const path = (p: string) => localizePath(p, locale);
  return { t, path, locale, meta: LOCALE_META[locale] };
}

/** Locale of the page being rendered (from its URL), for any .astro component: `i18n(Astro)`. */
export function i18n(astro: { url: URL }) {
  return useTranslations(localeFromPath(astro.url.pathname) ?? DEFAULT_LOCALE);
}
