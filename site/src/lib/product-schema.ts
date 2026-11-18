import { z } from 'astro/zod';

export const PRODUCT_STATUSES = ['released', 'beta', 'in-development', 'coming-soon'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CATEGORIES = ['Game', 'App', 'Tool', 'Experiment'] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const httpsUrl = z
  .url()
  .refine((u) => u.startsWith('https://'), { message: 'Links must use https://' });

/**
 * The product schema. `imageSchema` is Astro's `image()` helper in the real collection;
 * tests pass a plain schema so the rules can be checked without the Astro runtime.
 */
export function productSchema<I extends z.ZodType>(imageSchema: I) {
  return z
    .object({
      slug: z.string().regex(SLUG_PATTERN, 'Use lowercase words separated by hyphens'),
      name: z.string().min(1).max(60),
      tagline: z.string().min(1).max(120),
      /** One or two sentences. Used for cards, meta description and Open Graph. */
      description: z.string().min(40).max(300),
      category: z.enum(PRODUCT_CATEGORIES),
      platforms: z.array(z.string().min(1)).min(1),
      status: z.enum(PRODUCT_STATUSES),
      /** Honest one-line explanation of where the product stands. Shown next to the status. */
      statusNote: z.string().min(1).max(240).optional(),
      published: z.boolean().default(false),
      featured: z.boolean().default(false),
      order: z.number().int().default(100),
      icon: imageSchema.optional(),
      iconAlt: z.string().optional(),
      heroImage: imageSchema.optional(),
      heroImageAlt: z.string().optional(),
      gallery: z
        .array(
          z.object({
            image: imageSchema,
            alt: z.string().min(10),
            caption: z.string().max(140).optional(),
          }),
        )
        .default([]),
      features: z
        .array(z.object({ title: z.string().min(1).max(60), description: z.string().min(1).max(260) }))
        .default([]),
      downloadUrl: httpsUrl.optional(),
      downloadLabel: z.string().max(40).optional(),
      websiteUrl: httpsUrl.optional(),
      repositoryUrl: httpsUrl.optional(),
      /** Absolute path under /public, e.g. /og/my-product.jpg (1200×630). */
      ogImage: z.string().startsWith('/').optional(),
      ogImageAlt: z.string().optional(),
    })
    .superRefine((p, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });

      if (p.heroImage && !p.heroImageAlt) issue('heroImageAlt', 'heroImage needs heroImageAlt');
      if (p.icon && !p.iconAlt) issue('iconAlt', 'icon needs iconAlt');
      if (p.ogImage && !p.ogImageAlt) issue('ogImageAlt', 'ogImage needs ogImageAlt');
      if (p.featured && !p.published) issue('featured', 'An unpublished product cannot be featured');

      if (!p.published) return;
      // Status honesty rules apply to everything that will be public.
      switch (p.status) {
        case 'released':
          if (!p.downloadUrl && !p.websiteUrl)
            issue('status', '"released" requires a real downloadUrl or websiteUrl');
          break;
        case 'beta':
          if (!p.downloadUrl && !p.statusNote)
            issue('status', '"beta" requires an accessible downloadUrl or a statusNote documenting the beta');
          break;
        case 'in-development':
          if (p.features.length === 0 && p.gallery.length === 0)
            issue('status', '"in-development" needs meaningful content (features or gallery)');
          if (!p.statusNote) issue('statusNote', '"in-development" requires a statusNote');
          if (p.downloadUrl) issue('downloadUrl', 'An unreleased product cannot have a downloadUrl');
          break;
        case 'coming-soon':
          if (!p.heroImage && p.gallery.length === 0)
            issue('status', '"coming-soon" requires approved visual material (heroImage or gallery)');
          if (p.downloadUrl) issue('downloadUrl', 'An unreleased product cannot have a downloadUrl');
          break;
      }
    });
}
