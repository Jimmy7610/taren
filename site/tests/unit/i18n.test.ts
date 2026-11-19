import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { UI } from '@/i18n/ui';
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/locales';
import { alternatePaths, localizePath, splitLocale } from '@/i18n/paths';
import { format, useTranslations } from '@/i18n';
import { localizeProduct, productTranslationSchema, translationIssues } from '@/lib/product-i18n';
import { buildSeo } from '@/lib/seo';

const BRANDS = ['Taren', 'Lumen Capture', 'PDF Studio', 'Pulse Garden', 'Ko-fi'];
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('UI dictionaries', () => {
  const keys = Object.keys(UI.en);
  for (const locale of LOCALES) {
    it(`${locale}: every key, non-empty, same placeholders as English, brand names intact`, () => {
      expect(Object.keys(UI[locale]).sort()).toEqual([...keys].sort());
      for (const k of keys as (keyof typeof UI.en)[]) {
        const value = UI[locale][k];
        expect(value.trim(), `${locale} ${k}`).not.toBe('');
        expect(placeholders(value), `${locale} ${k}`).toEqual(placeholders(UI.en[k]));
        for (const brand of BRANDS) if (UI.en[k].includes(brand)) expect(value, `${locale} ${k} keeps ${brand}`).toContain(brand);
      }
    });
  }
  it('Swedish is a real translation, not a copy of English', () => {
    const same = (Object.keys(UI.en) as (keyof typeof UI.en)[]).filter((k) => UI.sv[k] === UI.en[k] && UI.en[k].length > 12);
    expect(same).toEqual([]);
  });
  it('format() fills placeholders and refuses missing values', () => {
    expect(format('{name} at a glance', { name: 'PDF Studio' })).toBe('PDF Studio at a glance');
    expect(() => format('{a} and {b}', { a: 1 })).toThrow(/\{b\}/);
    expect(useTranslations('sv').t('showcase.glance', { name: 'Lumen Capture' })).toBe('Lumen Capture i korthet');
  });
});

describe('locale routes', () => {
  it('English stays at the root, Swedish under /sv/', () => {
    expect(localizePath('/', 'en')).toBe('/');
    expect(localizePath('/', 'sv')).toBe('/sv/');
    expect(localizePath('/products/pdfstudio/', 'sv')).toBe('/sv/products/pdfstudio/');
    expect(localizePath('/sv/studio/', 'en')).toBe('/studio/');
    expect(localizePath('/sv/studio/', 'sv')).toBe('/sv/studio/'); // idempotent
  });
  it('leaves external links, anchors and files alone', () => {
    for (const p of ['https://ko-fi.com/taren', 'mailto:x@y.z', '#screenshots', '/sitemap.xml', '/og/taren.png'])
      expect(localizePath(p, 'sv')).toBe(p);
  });
  it('splits and pairs every page with its twin', () => {
    expect(splitLocale('/sv/products/')).toEqual({ locale: 'sv', path: '/products/' });
    expect(splitLocale('/sv')).toEqual({ locale: 'sv', path: '/' });
    expect(splitLocale('/svenska/')).toEqual({ locale: 'en', path: '/svenska/' }); // only an exact segment counts
    expect(alternatePaths('/sv/terms/')).toEqual({ en: '/terms/', sv: '/sv/terms/' });
    expect(alternatePaths('/terms/')).toEqual({ en: '/terms/', sv: '/sv/terms/' });
    expect(DEFAULT_LOCALE).toBe('en');
  });
});

describe('bilingual SEO metadata', () => {
  it('canonical, hreflang (both ways + x-default) and og:locale', () => {
    const sv = buildSeo({ description: 'd', path: '/sv/products/', locale: 'sv' });
    const en = buildSeo({ description: 'd', path: '/products/', locale: 'en' });
    expect(sv.canonical).toBe('https://taren.se/sv/products/');
    expect(en.canonical).toBe('https://taren.se/products/');
    const pairs = (m: typeof sv) => Object.fromEntries(m.alternates.map((a) => [a.hreflang, a.href]));
    expect(pairs(sv)).toEqual(pairs(en));
    expect(pairs(sv)).toEqual({ en: 'https://taren.se/products/', sv: 'https://taren.se/sv/products/', 'x-default': 'https://taren.se/products/' });
    expect([sv.ogLocale, sv.ogLocaleAlternates]).toEqual(['sv_SE', ['en_GB']]);
    expect([en.ogLocale, en.ogLocaleAlternates]).toEqual(['en_GB', ['sv_SE']]);
    expect(buildSeo({ description: 'd', path: '/sv/', locale: 'sv' }).title).toBe('Taren — Mjukvara byggd med nyfikenhet');
  });
  it('noindex pages get no canonical and no hreflang', () => {
    const m = buildSeo({ description: 'd', path: '/sv/404/', locale: 'sv', noindex: true });
    expect(m.canonical).toBeUndefined();
    expect(m.alternates).toEqual([]);
  });
});

describe('product translations', () => {
  const productDir = resolve(__dirname, '../../src/content/products');
  const trDir = resolve(__dirname, '../../src/content/product-translations');
  const fm = (file: string) => parse(/^---\n([\s\S]*?)\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '') as Record<string, unknown>;
  const body = (file: string) => readFileSync(file, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  const published = readdirSync(productDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => fm(join(productDir, f)))
    .filter((p) => p.published === true);

  for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
    for (const product of published) {
      const slug = String(product.slug);
      it(`${locale}/${slug}: complete, structurally identical, brand names untranslated, own body text`, () => {
        const file = join(trDir, locale, `${slug}.md`);
        const tr = productTranslationSchema.parse(fm(file));
        expect(tr.locale).toBe(locale);
        // The schema defaults are what Astro applies to the source; fill them for the structural comparison.
        const source = { steps: [], gallery: [], features: [], milestones: [], beforeRelease: [], requirements: [], facts: [], ...product };
        expect(translationIssues(source as never, tr)).toEqual([]);
        const merged = localizeProduct(source as never, tr) as unknown as Record<string, unknown>;
        // Data that is not text never changes in translation.
        for (const k of ['slug', 'name', 'status', 'published', 'featured', 'order', 'category', 'platforms', 'device', 'downloadUrl'])
          expect(merged[k], k).toEqual(product[k]);
        expect(String(tr.tagline)).not.toBe(String(product.tagline));
        expect(body(file).length).toBeGreaterThan(200);
        expect(body(file)).toContain(String(product.name));
      });
    }
  }

  it('translationIssues catches missing or extra items', () => {
    const src = { slug: 'x', tagline: 't', description: 'd', facts: [{ label: 'a', value: 'b' }], steps: [], gallery: [], features: [], milestones: [], beforeRelease: [], requirements: [] };
    const tr = productTranslationSchema.parse({ slug: 'x', locale: 'sv', tagline: 'T', description: 'D' });
    expect(translationIssues(src, tr).join()).toMatch(/facts: 0 items, source has 1/);
    expect(() => localizeProduct(src, tr)).toThrow(/incomplete/);
  });
});
