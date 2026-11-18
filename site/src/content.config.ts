import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { productSchema } from './lib/product-schema';

const products = defineCollection({
  // Files whose names start with "_" are ignored (use them for local drafts that must never build).
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/products' }),
  schema: ({ image }) => productSchema(image()),
});

export const collections = { products };
