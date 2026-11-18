import { getCollection, type CollectionEntry } from 'astro:content';
import { featuredProducts, publicProducts } from './products';

export type Product = CollectionEntry<'products'>;
export type ProductData = Product['data'];

/** Every product that may appear on the public site, sorted for display. */
export async function getPublicProducts(): Promise<ProductData[]> {
  const all = await getCollection('products');
  for (const entry of all) {
    if (entry.id !== entry.data.slug) {
      throw new Error(`Product file "${entry.id}" must declare slug "${entry.id}" (found "${entry.data.slug}").`);
    }
  }
  return publicProducts(all.map((e) => e.data));
}

export async function getPublicEntries(): Promise<Product[]> {
  const all = await getCollection('products', (e) => e.data.published);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

export async function getFeaturedProducts(): Promise<ProductData[]> {
  return featuredProducts(await getPublicProducts());
}
