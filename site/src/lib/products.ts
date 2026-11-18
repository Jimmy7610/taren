import type { ProductStatus } from './product-schema';

/** The subset of product data the visibility and sorting rules need. */
export interface ProductLike {
  published: boolean;
  featured: boolean;
  order: number;
  name: string;
  status: ProductStatus;
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  released: 'Released',
  beta: 'Beta',
  'in-development': 'In development',
  'coming-soon': 'Coming soon',
};

export function isPublic<T extends { published: boolean }>(p: T): boolean {
  return p.published === true;
}

export function sortProducts<T extends ProductLike>(products: readonly T[]): T[] {
  return [...products].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function publicProducts<T extends ProductLike>(products: readonly T[]): T[] {
  return sortProducts(products.filter(isPublic));
}

export function featuredProducts<T extends ProductLike>(products: readonly T[]): T[] {
  return publicProducts(products).filter((p) => p.featured);
}

/** Structured data claiming a software product only makes sense for something people can get. */
export function isAvailable(p: { status: ProductStatus; downloadUrl?: string | undefined; websiteUrl?: string | undefined }) {
  return (p.status === 'released' || p.status === 'beta') && Boolean(p.downloadUrl || p.websiteUrl);
}

/** Related products: other public products in the same category. Empty when nothing is meaningful. */
export function relatedProducts<T extends ProductLike & { slug: string; category: string }>(
  current: T,
  all: readonly T[],
  limit = 2,
): T[] {
  return publicProducts(all)
    .filter((p) => p.slug !== current.slug && p.category === current.category)
    .slice(0, limit);
}
