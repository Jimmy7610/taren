import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { productSchema } from './lib/product-schema';
import { productTranslationSchema } from './lib/product-i18n';
import { releaseSchema } from './lib/release-schema';

const products = defineCollection({
  // Files whose names start with "_" are ignored (use them for local drafts that must never build).
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/products' }),
  schema: ({ image }) => productSchema(image()),
});

// Translatable product text per locale: src/content/product-translations/<locale>/<slug>.md (see product-i18n.ts).
const productTranslations = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/product-translations' }),
  schema: productTranslationSchema,
});

// Windows download releases: one manifest per product, src/content/releases/<product-slug>.json
// (see src/lib/release-schema.ts and docs/WINDOWS_DOWNLOADS.md). The entry id is the product slug.
const releases = defineCollection({
  loader: glob({ pattern: '[^_]*.json', base: './src/content/releases' }),
  schema: releaseSchema,
});

export const collections = { products, productTranslations, releases };
