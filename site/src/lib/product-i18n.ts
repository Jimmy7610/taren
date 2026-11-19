/**
 * Localized product content. The English product file (src/content/products/<slug>.md) holds all data; a
 * translation (src/content/product-translations/<locale>/<slug>.md) holds only translatable text plus its own
 * Markdown body. `localizeProduct` merges them strictly: every list must have the same length as the source and
 * every optional text present in the source must be translated, otherwise the build fails. A published page can
 * therefore never mix languages silently. See docs/LOCALIZATION.md.
 */
import { z } from 'astro/zod';
import { LOCALES } from '@/i18n/locales';

const text = z.string().min(1);
const opt = text.optional();

export const productTranslationSchema = z
  .object({
    slug: text,
    locale: z.enum(LOCALES),
    tagline: text,
    description: text,
    statusNote: opt,
    iconAlt: opt,
    heroImageAlt: opt,
    ogImageAlt: opt,
    screenshotsNote: opt,
    stepsEyebrow: opt,
    stepsTitle: opt,
    milestonesSource: opt,
    facts: z.array(z.object({ label: text, value: text }).strict()).default([]),
    steps: z.array(z.object({ title: text, description: text, alt: text }).strict()).default([]),
    gallery: z.array(z.object({ alt: text, caption: opt }).strict()).default([]),
    features: z.array(z.object({ title: text, description: text }).strict()).default([]),
    milestones: z.array(z.object({ title: text, note: opt }).strict()).default([]),
    beforeRelease: z.array(text).default([]),
    requirements: z.array(z.object({ label: text, value: text }).strict()).default([]),
    aboutImage: z.object({ alt: text, caption: opt }).strict().optional(),
  })
  .strict();

export type ProductTranslation = z.infer<typeof productTranslationSchema>;

/** The subset of product data a translation touches (the real type is wider). */
interface Localizable {
  slug: string;
  tagline: string;
  description: string;
  statusNote?: string | undefined;
  iconAlt?: string | undefined;
  heroImageAlt?: string | undefined;
  ogImageAlt?: string | undefined;
  screenshotsNote?: string | undefined;
  stepsEyebrow?: string | undefined;
  stepsTitle?: string | undefined;
  milestonesSource?: string | undefined;
  facts: ReadonlyArray<{ label: string; value: string }>;
  steps: ReadonlyArray<{ title: string; description: string; alt: string }>;
  gallery: ReadonlyArray<{ alt: string; caption?: string | undefined }>;
  features: ReadonlyArray<{ title: string; description: string }>;
  milestones: ReadonlyArray<{ title: string; note?: string | undefined }>;
  beforeRelease: ReadonlyArray<string>;
  requirements: ReadonlyArray<{ label: string; value: string }>;
  aboutImage?: { alt: string; caption?: string | undefined } | undefined;
}

const OPTIONAL_TEXT = [
  'statusNote',
  'iconAlt',
  'heroImageAlt',
  'ogImageAlt',
  'screenshotsNote',
  'stepsEyebrow',
  'stepsTitle',
  'milestonesSource',
] as const;
const LISTS = ['facts', 'steps', 'gallery', 'features', 'milestones', 'beforeRelease', 'requirements'] as const;

/** Problems that would make a localized page incomplete or inconsistent (empty array = valid). */
export function translationIssues(source: Localizable, tr: ProductTranslation): string[] {
  const issues: string[] = [];
  if (tr.slug !== source.slug) issues.push(`slug ${tr.slug} ≠ ${source.slug}`);
  for (const k of OPTIONAL_TEXT) {
    if (source[k] && !tr[k]) issues.push(`${k} is missing`);
    if (!source[k] && tr[k]) issues.push(`${k} has no English source`);
  }
  for (const k of LISTS) if (source[k].length !== tr[k].length) issues.push(`${k}: ${tr[k].length} items, source has ${source[k].length}`);
  source.gallery.forEach((g, i) => {
    if (Boolean(g.caption) !== Boolean(tr.gallery[i]?.caption)) issues.push(`gallery[${i}].caption must match the source`);
  });
  source.milestones.forEach((m, i) => {
    if (Boolean(m.note) !== Boolean(tr.milestones[i]?.note)) issues.push(`milestones[${i}].note must match the source`);
  });
  if (Boolean(source.aboutImage) !== Boolean(tr.aboutImage)) issues.push('aboutImage must match the source');
  if (source.aboutImage && Boolean(source.aboutImage.caption) !== Boolean(tr.aboutImage?.caption))
    issues.push('aboutImage.caption must match the source');
  return issues;
}

/** Returns the product with every translatable text replaced; images, order, status and links are untouched. */
export function localizeProduct<T extends Localizable>(source: T, tr: ProductTranslation): T {
  const issues = translationIssues(source, tr);
  if (issues.length) throw new Error(`Translation ${tr.locale}/${source.slug} is incomplete:\n  - ${issues.join('\n  - ')}`);
  const out = { ...source } as T & Record<string, unknown>;
  out.tagline = tr.tagline;
  out.description = tr.description;
  for (const k of OPTIONAL_TEXT) if (source[k]) (out as Record<string, unknown>)[k] = tr[k];
  return {
    ...out,
    facts: tr.facts,
    steps: source.steps.map((s, i) => ({ ...s, ...tr.steps[i] })),
    gallery: source.gallery.map((g, i) => ({ ...g, ...tr.gallery[i] })),
    features: tr.features,
    milestones: source.milestones.map((m, i) => ({ ...m, ...tr.milestones[i] })),
    beforeRelease: tr.beforeRelease,
    requirements: tr.requirements,
    aboutImage: source.aboutImage && tr.aboutImage ? { ...source.aboutImage, ...tr.aboutImage } : source.aboutImage,
  } as T;
}
