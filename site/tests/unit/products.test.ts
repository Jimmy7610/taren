import { describe, expect, it } from 'vitest';
import { featuredProducts, isAvailable, isPublic, publicProducts, relatedProducts, STATUS_LABELS } from '@/lib/products';
import type { ProductStatus } from '@/lib/product-schema';

const p = (slug: string, o: Partial<{ published: boolean; featured: boolean; order: number; status: ProductStatus; category: string }> = {}) => ({
  slug,
  name: slug.toUpperCase(),
  published: true,
  featured: false,
  order: 100,
  status: 'in-development' as ProductStatus,
  category: 'App',
  ...o,
});

describe('visibility rules', () => {
  const all = [p('b', { order: 2 }), p('hidden', { published: false, featured: true }), p('a', { order: 1, featured: true }), p('c', { order: 2 })];

  it('hides unpublished products', () => {
    expect(isPublic(p('x', { published: false }))).toBe(false);
    expect(publicProducts(all).map((x) => x.slug)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by order, then name', () => {
    expect(publicProducts(all).map((x) => x.slug)).toEqual(['a', 'b', 'c']);
  });

  it('only features published products', () => {
    expect(featuredProducts(all).map((x) => x.slug)).toEqual(['a']);
  });

  it('only treats released/beta products with a link as available', () => {
    expect(isAvailable({ status: 'in-development', downloadUrl: 'https://x' })).toBe(false);
    expect(isAvailable({ status: 'released' })).toBe(false);
    expect(isAvailable({ status: 'released', downloadUrl: 'https://x' })).toBe(true);
    expect(isAvailable({ status: 'beta', websiteUrl: 'https://x' })).toBe(true);
  });

  it('returns related products only from the same category, never itself or hidden ones', () => {
    const list = [p('a'), p('b'), p('g', { category: 'Game' }), p('h', { published: false })];
    expect(relatedProducts(list[0]!, list).map((x) => x.slug)).toEqual(['b']);
    expect(relatedProducts(list[2]!, list)).toEqual([]);
  });

  it('labels every status', () => {
    expect(STATUS_LABELS).toEqual({ released: 'Released', beta: 'Beta', 'in-development': 'In development', 'coming-soon': 'Coming soon' });
  });
});
