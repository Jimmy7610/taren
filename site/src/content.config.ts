import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { productSchema } from './lib/product-schema';
import { productTranslationSchema } from './lib/product-i18n';

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

export const collections = { products, productTranslations };
