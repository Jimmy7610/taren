import { z } from 'astro/zod';

export const PRODUCT_STATUSES = ['released', 'beta', 'in-development', 'coming-soon'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CATEGORIES = ['Game', 'App', 'Tool', 'Experiment'] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
export const MILESTONE_STATES = ['done', 'in-progress', 'next', 'planned'] as const;
export type MilestoneState = (typeof MILESTONE_STATES)[number];

/** WCAG relative luminance contrast between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

/** Page background the accents must stand out against. */
export const INK = '#0a1020';

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
      /** An already-hosted, verified image for externally hosted browser games. */
      heroImageUrl: httpsUrl.optional(),
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
      /**
       * Gate 2 of the publication workflow (docs/PUBLICATION_WORKFLOW.md): the owner's explicit approval of a
       * downloadable release. Required for any downloadUrl, independently of `published` (gate 1, the page).
       */
      releaseApproval: z
        .object({
          /** The exact version the download link delivers, e.g. "1.0.0". */
          version: z.string().min(1).max(40),
          /** Date of the owner's approval, YYYY-MM-DD. */
          approvedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'approvedOn must be YYYY-MM-DD'),
          /** Whether the downloadable files are code-signed. Stated honestly; never assumed. */
          signed: z.boolean(),
        })
        .optional(),
      downloadLabel: z.string().max(40).optional(),
      websiteUrl: httpsUrl.optional(),
      repositoryUrl: httpsUrl.optional(),
      /** Absolute path under /public, e.g. /og/my-product.jpg (1200×630). */
      ogImage: z.string().startsWith('/').optional(),
      ogImageAlt: z.string().optional(),
      /** Screenshot form factor: portrait phone captures or landscape desktop-window captures. */
      device: z.enum(['phone', 'desktop']).default('phone'),
      /** Honest note shown with the screenshots (how/when they were captured). */
      screenshotsNote: z.string().max(240).optional(),
      /** Product accent colours (from the product's own artwork). Used for glows, rings and highlights. */
      accent: z.string().regex(HEX_PATTERN).optional(),
      accentAlt: z.string().regex(HEX_PATTERN).optional(),
      /** "At a glance" facts — short, verified label/value pairs. */
      facts: z
        .array(z.object({ label: z.string().min(1).max(24), value: z.string().min(1).max(48) }))
        .max(8)
        .default([]),
      /** Heading and eyebrow for the walkthrough section. */
      stepsEyebrow: z.string().max(32).default('How it works'),
      stepsTitle: z.string().max(60).optional(),
      /** "How it plays / how it works" walkthrough using real screenshots. */
      steps: z
        .array(
          z.object({
            title: z.string().min(1).max(48),
            description: z.string().min(1).max(220),
            image: imageSchema,
            alt: z.string().min(10),
          }),
        )
        .max(5)
        .default([]),
      /** Verified progress. Only record milestones the project's own documentation confirms. */
      milestones: z
        .array(
          z.object({
            title: z.string().min(1).max(60),
            state: z.enum(MILESTONE_STATES),
            note: z.string().max(220).optional(),
          }),
        )
        .max(10)
        .default([]),
      /** Where the milestone facts come from (repository doc, changelog…). Required with milestones. */
      milestonesSource: z.string().max(160).optional(),
      /** Honest list of what still has to happen before a public release (shown with the timeline). */
      beforeRelease: z.array(z.string().min(1).max(160)).max(8).default([]),
      /** System requirements as verified label/value rows. */
      requirements: z
        .array(z.object({ label: z.string().min(1).max(32), value: z.string().min(1).max(200) }))
        .max(10)
        .default([]),
      /** The app's own About screen showing the Taren credit ("A Taren App"). */
      aboutImage: z.object({ image: imageSchema, alt: z.string().min(10), caption: z.string().max(160).optional() }).optional(),
    })
    .superRefine((p, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });

      if (p.heroImage && !p.heroImageAlt) issue('heroImageAlt', 'heroImage needs heroImageAlt');
      if (p.icon && !p.iconAlt) issue('iconAlt', 'icon needs iconAlt');
      if (p.ogImage && !p.ogImageAlt) issue('ogImageAlt', 'ogImage needs ogImageAlt');
      if (p.featured && !p.published) issue('featured', 'An unpublished product cannot be featured');
      for (const key of ['accent', 'accentAlt'] as const) {
        const c = p[key];
        if (c && contrastRatio(c, INK) < 3) issue(key, `${key} must reach 3:1 against the page background`);
      }
      if (p.milestones.length > 0 && !p.milestonesSource) issue('milestonesSource', 'milestones need a source');
      if (p.status === 'released' && p.beforeRelease.length > 0) issue('beforeRelease', 'A released product has no pre-release items');
      if (p.status !== 'released' && p.milestones.some((m) => /release|launch/i.test(m.title) && m.state === 'done'))
        issue('milestones', 'An unreleased product cannot have a completed release milestone');

      // Release gate — applies to drafts too, so a download link can never appear even on the draft preview
      // unless the product is released or in a real beta AND the owner has approved that release.
      const downloadable = p.status === 'released' || p.status === 'beta';
      if (p.downloadUrl && !downloadable) issue('downloadUrl', 'An unreleased product cannot have a downloadUrl');
      if (p.downloadUrl && !p.releaseApproval) issue('releaseApproval', 'A downloadUrl requires releaseApproval (owner-approved release)');
      if (p.releaseApproval && !downloadable) issue('releaseApproval', 'releaseApproval only applies to released or beta products');
      if (p.releaseApproval && !p.downloadUrl) issue('releaseApproval', 'releaseApproval without a downloadUrl approves nothing');

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
          break;
        case 'coming-soon':
          if (!p.heroImage && p.gallery.length === 0)
            issue('status', '"coming-soon" requires approved visual material (heroImage or gallery)');
          break;
      }
    });
}
