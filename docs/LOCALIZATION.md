# Localization — English and Swedish (Taren 2.6)

taren.se is published in two languages. English is the default and lives at the root; Swedish lives under `/sv/`.
Every public page exists in both languages, with the same structure, the same products in the same order and the
same Ko-fi link.

| English | Swedish |
| --- | --- |
| `/` | `/sv/` |
| `/products/` | `/sv/products/` |
| `/products/lumen-capture/` | `/sv/products/lumen-capture/` |
| `/products/pdfstudio/` | `/sv/products/pdfstudio/` |
| `/products/pulse-garden/` | `/sv/products/pulse-garden/` |
| `/studio/` | `/sv/studio/` |
| `/support/` | `/sv/support/` |
| `/privacy/` | `/sv/privacy/` |
| `/terms/` | `/sv/terms/` |
| `/404.html` (unknown paths) | `/sv/404.html` (unknown paths under `/sv/`) |

`/410/` (retired legacy URLs) is a single page that says the same thing in both languages, because the retired
URLs never had a language.

## Design decisions

- **The locale comes from the URL**, never from a cookie or header, so every page is static, cacheable and
  crawlable, and a shared link always opens in the language it was shared in. Astro's built-in i18n routing is not
  used: two locales do not need it, and deriving the locale from the path keeps one code path (`i18n(Astro)`).
- **Pages are thin; views are shared.** `src/pages/<route>.astro` and `src/pages/sv/<route>.astro` each render the
  same view from `src/views/`. There is no duplicated layout or markup per language.
- **Translations fail the build, not the visitor.** A missing dictionary key is a TypeScript error; an incomplete
  product translation throws during the build; unit tests compare structure, placeholders and brand names.
- **Never translated:** Taren, Lumen Capture, PDF Studio, Pulse Garden, Ko-fi (enforced by `tests/unit/i18n.test.ts`).
  On-screen labels quoted from an app's own interface stay as they appear in that app.

## Files

```
site/src/i18n/
  locales.ts      LOCALES = ['en', 'sv'], DEFAULT_LOCALE, html lang, og:locale, Intl locale, endonyms
  paths.ts        splitLocale, localizePath, alternatePaths (pure functions, unit-tested)
  ui.ts           the interface dictionary: `en` defines the keys, `sv: UiDictionary` must have every one
  index.ts        format(), useTranslations(locale), i18n(Astro)
site/src/lib/product-i18n.ts         schema + strict merge for product translations
site/src/content/products/*.md       product source (English + all non-text data)
site/src/content/product-translations/sv/*.md   Swedish product text only
site/src/views/                      shared page views (HomeView, ProductsView, ProductView, TextPageView, NotFoundView)
site/src/views/copy/{en,sv}/         long-form copy: Studio, Support, Privacy, Terms
site/src/components/LanguageSwitcher.astro
site/src/scripts/language-preference.ts
```

### Interface text (`ui.ts`)

Use `const { t, path } = i18n(Astro)` in a component. `t('key', { name })` fills `{placeholders}` and throws on a
missing value. `path('/products/')` returns the URL in the current language and leaves external links, `mailto:`,
anchors and files untouched.

### Product text

The English product file stays the single source for everything that is not text (slug, status, order, images,
platforms, flags). The Swedish file holds only translatable fields; every list (facts, steps, gallery, features,
milestones, requirements, …) must have exactly as many items as the source, in the same order. `localizeProduct`
merges them and throws `Translation sv/<slug> is incomplete` on any mismatch, so a product cannot be published in
English only by accident. The Markdown body of the translation replaces the English body.

### Long-form pages

Studio, Support, Privacy and Terms are written per language in `src/views/copy/<locale>/`. `TextPageView` holds a
typed registry, so a missing language is a compile error. Legal pages are translations with the same meaning —
no new commitments. Changing one language means changing the other in the same commit (see `LEGAL_REVIEW.md`).

## Language switcher and preference

- "EN | SV" in the header (and in the mobile menu). Each link points to the same page in the other language; the
  current language is marked with `aria-current="true"` and a visible underline. Links carry `hreflang` and `lang`,
  their accessible names are the endonyms ("English", "Svenska"), and targets are at least 44 × 44 px. No flags.
- Without JavaScript the switcher is plain links and nothing redirects.
- With JavaScript, `language-preference.ts`:
  1. stores an explicit choice in `localStorage` (`taren-lang`) when a switcher link is used;
  2. on a page whose language differs from the stored choice, replaces the URL with the twin page
     (`location.replace`, so Back is not trapped);
  3. if there is no stored choice and the browser's first language is Swedish, shows the Swedish twin once — an
     explicit choice always wins over the browser language.
- Error pages (`data-lang-redirect="off"`) never redirect. No cookie is set, so no consent banner is needed; the
  privacy pages mention the local-storage preference (owner approval required, see below).

## SEO

Each page has `<html lang>`, a localized title and description, a self-referencing canonical, `hreflang` links for
`en`, `sv` and `x-default` (→ English) that are identical on both twins, `og:locale` plus `og:locale:alternate`, and
localized JSON-LD. `sitemap.xml` lists all 18 URLs with `xhtml:link` alternates. 404 and 410 pages are `noindex`
with no canonical or hreflang. Previews on `*.pages.dev` stay `noindex` via the host-based `X-Robots-Tag` rule.

Cloudflare Pages serves the nearest `404.html` for an unknown path. Astro writes `sv/404/index.html`, so the
`localized404` integration in `astro.config.mjs` moves it to `sv/404.html` after the build.

## Adding or changing text

1. Add the key to `en` in `ui.ts`; TypeScript then requires it in `sv`.
2. For a product field, edit both `products/<slug>.md` and `product-translations/sv/<slug>.md` with the same
   number of items.
3. Run `npm run typecheck && npm test && npm run build && npm run check:site`.
4. Check narrow screens: Swedish words are long. `npx playwright test responsive` checks every page in both
   languages for horizontal overflow; product fact values may use a soft hyphen (`­`) and wrap.

### Adding a third language

Add it to `LOCALES` and `LOCALE_META`, add a dictionary, translations under `product-translations/<locale>/`,
copy under `views/copy/<locale>/`, page files under `src/pages/<locale>/`, the 404 move in `astro.config.mjs`,
and the paths to the tests and `lighthouserc.json`. The switcher, hreflang and sitemap pick it up automatically.

## Quality guidelines (Swedish)

Natural Swedish rather than literal translation; "du"-form; Swedish typography (”citattecken”, `–` in ranges,
a space before `%`); short fact values that fit a 320 px screen. Product facts state only what the
English page states.

## Tests

- `tests/unit/i18n.test.ts` — dictionaries (keys, placeholders, brands, not copied), routes, SEO, every product
  translation (complete, structurally identical, non-text data unchanged).
- `tests/e2e/i18n.spec.ts` — every page and its twin: `lang`, canonical, reciprocal hreflang, `og:locale`,
  switcher target and current state; switching by mouse, keyboard and touch; no-JavaScript behaviour; preference
  persistence and browser-language handling without loops; Swedish product order, status and absence of downloads;
  gallery strings; Ko-fi link identical in both languages; Swedish 404; bilingual 410.
- Existing suites (routes, a11y, responsive, visual, legal) run over both languages.
- `scripts/verify-cloudflare.mjs` — `/sv/` routes, Swedish 404 via Cloudflare's nearest-404 lookup, headers and
  `noindex` per host on the real Pages runtime (wrangler).
- `lighthouserc.json` — all 18 pages, thresholds ≥ 0.95 in all four categories.

## Rollback

The localization is additive: English URLs are unchanged, so removing it breaks no existing link.

- **Whole release:** revert the merge commit of the 2.6 PR (or redeploy the previous production deployment in
  Cloudflare Pages, see `ROLLBACK.md`). `/sv/` URLs then return 404; they are new, so nothing external depends on
  them yet.
- **Swedish only, keep the rest:** not supported as a switch — the views expect both locales. Revert the release
  instead.
- **One product's Swedish text:** fix the translation file; the build refuses an incomplete one, so it cannot ship
  half-translated.

## Owner approval needed

- The privacy pages (both languages) now say that the language choice is stored in the browser's local storage
  and never sent anywhere. This is factual, but it changes legal text and needs the owner's approval like other
  legal wording (`LEGAL_REVIEW.md`).
- The Swedish legal pages are translations, not reviewed by a lawyer.
