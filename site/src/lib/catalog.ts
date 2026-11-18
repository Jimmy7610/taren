import { getCollection, type CollectionEntry } from 'astro:content';
import { featuredProducts, publicProducts, sortProducts } from './products';
import { draftsEnabled, isVisible } from './drafts';

export type Product = CollectionEntry<'products'>;
export type ProductData = Product['data'];

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

/** Products shown on pages: published ones (plus drafts in draft preview mode), sorted for display. */
export async function getPublicProducts(): Promise<ProductData[]> {
  const all = await allProducts();
  return SHOW_DRAFTS ? sortProducts(all.filter((e) => isVisible(e.data, true)).map((e) => e.data)) : publicProducts(all.map((e) => e.data));
}

/** Strictly published products — for the sitemap and anything search engines read. Never drafts. */
export async function getIndexableProducts(): Promise<ProductData[]> {
  return publicProducts((await allProducts()).map((e) => e.data));
}

export async function getPublicEntries(): Promise<Product[]> {
  const all = (await allProducts()).filter((e) => isVisible(e.data, SHOW_DRAFTS));
  return all.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

/** Featured products are always published ones (drafts never take over the homepage). */
export async function getFeaturedProducts(): Promise<ProductData[]> {
  return featuredProducts(await getIndexableProducts());
}
