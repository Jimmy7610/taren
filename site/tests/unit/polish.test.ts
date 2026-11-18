import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'astro/zod';
import { contrastRatio, productSchema } from '@/lib/product-schema';
import { buildAccentCss, readProducts } from '../../scripts/generate-accents.mjs';

const root = resolve(__dirname, '../..');
const schema = productSchema(z.string());
const base = {
  slug: 'test-product',
  name: 'Test Product',
  tagline: 'A tagline.',
  description: 'A description that is long enough to satisfy the minimum length rule.',
  category: 'App',
  platforms: ['Web'],
  status: 'in-development',
  statusNote: 'Being built.',
  published: true,
  features: [{ title: 'Feature', description: 'Does a thing.' }],
};
const issues = (data: unknown) => {
  const r = schema.safeParse(data);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('product schema — 2.1 fields', () => {
  it('accepts accents that stand out on the page background and rejects ones that do not', () => {
    expect(issues({ ...base, accent: '#2CC3B3', accentAlt: '#FF72D0' })).toEqual([]);
    expect(issues({ ...base, accent: '#102030' }).join()).toMatch(/accent must reach 3:1/);
    expect(issues({ ...base, accent: 'teal' }).join()).toMatch(/accent/);
  });

  it('requires a source for milestones', () => {
    const milestones = [{ title: 'Playable core', state: 'done' }];
    expect(issues({ ...base, milestones }).join()).toMatch(/milestonesSource/);
    expect(issues({ ...base, milestones, milestonesSource: 'Project roadmap' })).toEqual([]);
  });

  it('never lets an unreleased product claim a completed release', () => {
    const milestones = [{ title: 'App Store release', state: 'done' }];
    expect(issues({ ...base, milestones, milestonesSource: 'x' }).join()).toMatch(/unreleased/);
  });

  it('limits facts and steps to short, presentable lists', () => {
    expect(issues({ ...base, facts: Array.from({ length: 9 }, () => ({ label: 'a', value: 'b' })) })).not.toEqual([]);
    expect(issues({ ...base, steps: [{ title: 't', description: 'd', image: 'x.webp', alt: 'short' }] })).not.toEqual([]);
  });

  it('computes WCAG contrast correctly', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
    expect(contrastRatio('#0a1020', '#0a1020')).toBeCloseTo(1, 5);
  });
});

describe('generated product accent CSS', () => {
  it('is in sync with the product content (run `npm run build` or `node scripts/generate-accents.mjs`)', () => {
    const committed = readFileSync(resolve(root, 'src/styles/product-accents.css'), 'utf8');
    expect(committed).toBe(buildAccentCss(readProducts()));
  });

  it('only emits safe selectors and colours', () => {
    const css = buildAccentCss([
      { slug: 'ok', accent: '#2CC3B3' },
      { slug: 'bad"]{}*{x', accent: '#000000' },
      { slug: 'also-bad', accent: 'red;}' },
    ]);
    expect(css).toContain("[data-accent='ok']");
    expect(css).not.toContain('bad');
  });

  it('gives Pulse Garden its own teal/pink accent', () => {
    expect(readFileSync(resolve(root, 'src/styles/product-accents.css'), 'utf8')).toMatch(/pulse-garden'\] \{\n {2}--accent: #2cc3b3;\n {2}--accent-alt: #ff72d0;/);
  });
});

describe('_headers — preview indexing and caching', () => {
  const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8');
  const blocks = headers.split(/\n(?=\S)/).map((b) => b.trim()).filter((b) => b && !b.startsWith('#'));

  it('sends noindex only for *.pages.dev hosts', () => {
    const noindex = blocks.filter((b) => /X-Robots-Tag:\s*noindex/i.test(b));
    expect(noindex.length).toBe(2);
    for (const b of noindex) {
      const rule = b.split('\n')[0]!;
      expect(rule).toMatch(/^https:\/\/(:version\.)?:project\.pages\.dev\/\*$/);
      expect(rule).not.toMatch(/taren\.se/);
    }
    // No path-only rule (which would apply to taren.se too) may carry noindex.
    const pathOnly = blocks.filter((b) => b.startsWith('/'));
    for (const b of pathOnly) expect(b).not.toMatch(/X-Robots-Tag/i);
  });

  it('does not let same-name brand files stick for a day', () => {
    for (const rule of ['/og/*', '/*.ico', '/*.png', '/site.webmanifest']) {
      const block = blocks.find((b) => b.split('\n')[0] === rule);
      expect(block, rule).toBeDefined();
      expect(block).toMatch(/max-age=3600, stale-while-revalidate=86400/);
    }
  });
});

describe('fonts', () => {
  it('ships subset variable fonts that are smaller than the originals', () => {
    for (const [subset, original] of [
      ['src/assets/fonts/inter-subset.woff2', 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'],
      ['src/assets/fonts/sora-subset.woff2', 'node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2'],
    ] as const) {
      expect(existsSync(resolve(root, subset))).toBe(true);
      expect(statSync(resolve(root, subset)).size).toBeLessThan(statSync(resolve(root, original)).size);
    }
  });
});
