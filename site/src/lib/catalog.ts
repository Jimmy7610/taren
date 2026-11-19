import { getCollection, type CollectionEntry } from 'astro:content';
import { featuredProducts, publicProducts, sortProducts } from './products';
import { draftsEnabled, isVisible } from './drafts';
import { localizeProduct } from './product-i18n';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

export type Product = CollectionEntry<'products'>;
export type ProductData = Product['data'];
export type ProductTranslationEntry = CollectionEntry<'productTranslations'>;

const SHOW_DRAFTS = draftsEnabled();

async function allProducts() {
  const all = await getCollection('products');
  for (const entry of all) {
    if (entry.id !== entry.data.slug) {
      throw new Error(`Product file "${entry.id}" must declare slug "${entry.id}" (found "${entry.data.slug}").`);
    }
  }
  return all;
}

/** The translation entry of a product in a non-default locale. Throws when it is missing — a visible product must
 *  exist in every locale, so a page can never silently fall back to English. */
export async function getTranslationEntry(slug: string, locale: Locale): Promise<ProductTranslationEntry> {
  const entry = (await getCollection('productTranslations')).find((e) => e.data.slug === slug && e.data.locale === locale);
  if (!entry) throw new Error(`Missing translation: src/content/product-translations/${locale}/${slug}.md`);
  return entry;
}

/** Product data in a locale (English is the source; other locales are merged strictly, see product-i18n.ts). */
export async function localize(data: ProductData, locale: Locale): Promise<ProductData> {
  if (locale === DEFAULT_LOCALE) return data;
  return localizeProduct(data, (await getTranslationEntry(data.slug, locale)).data);
}

async function localizeAll(list: ProductData[], locale: Locale) {
  return Promise.all(list.map((p) => localize(p, locale)));
}

/** Products shown on pages: published ones (plus drafts in draft preview mode), sorted for display. */
export async function getPublicProducts(locale: Locale = DEFAULT_LOCALE): Promise<ProductData[]> {
  const all = await allProducts();
  const list = SHOW_DRAFTS ? sortProducts(all.filter((e) => isVisible(e.data, true)).map((e) => e.data)) : publicProducts(all.map((e) => e.data));
  return localizeAll(list, locale);
}

/** Strictly published products — for the sitemap and anything search engines read. Never drafts. */
export async function getIndexableProducts(locale: Locale = DEFAULT_LOCALE): Promise<ProductData[]> {
  return localizeAll(publicProducts((await allProducts()).map((e) => e.data)), locale);
}

/** Entries with a page (published, plus drafts in draft preview), in display order. */
export async function getPublicEntries(): Promise<Product[]> {
  const all = (await allProducts()).filter((e) => isVisible(e.data, SHOW_DRAFTS));
  return all.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

/** Featured products are always published ones (drafts never take over the homepage). */
export async function getFeaturedProducts(locale: Locale = DEFAULT_LOCALE): Promise<ProductData[]> {
  return featuredProducts(await getIndexableProducts(locale));
}

export type ReleaseEntry = CollectionEntry<'releases'>;

/**
 * The Windows download release of a product (src/content/releases/<slug>.json), or undefined when it has none.
 * Throws (build fails) when the manifest and the product page disagree, so a download can never appear by accident:
 * a published release needs a published product page with status "beta" or "released", and the manifest replaces the
 * product's own downloadUrl (one source of truth). See docs/WINDOWS_DOWNLOADS.md.
 */
export async function getRelease(product: Pick<ProductData, 'slug' | 'published' | 'status' | 'downloadUrl'>) {
  const entry = (await getCollection('releases')).find((e) => e.id === product.slug);
  if (!entry) return undefined;
  const r = entry.data;
  if (r.product !== product.slug) throw new Error(`Release "${entry.id}.json" must declare product "${entry.id}" (found "${r.product}").`);
  if (product.downloadUrl) throw new Error(`Product "${product.slug}" has both a downloadUrl and a release manifest; keep only the manifest.`);
  if (r.state === 'published') {
    if (!product.published) throw new Error(`Release of "${product.slug}" is published but the product page is not.`);
    if (product.status !== 'beta' && product.status !== 'released')
      throw new Error(`Release of "${product.slug}" is published but the product status is "${product.status}" (needs "beta" or "released").`);
  }
  return r;
}
