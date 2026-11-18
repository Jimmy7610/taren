import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { productSchema } from '@/lib/product-schema';

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

const approval = { version: '1.0.0', approvedOn: '2026-12-01', signed: true };

const issues = (data: unknown) => {
  const r = schema.safeParse(data);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('product schema', () => {
  it('accepts a valid in-development product and applies defaults', () => {
    const r = schema.parse({ ...base, published: undefined, features: undefined, statusNote: undefined });
    expect(r.published).toBe(false);
    expect(r.featured).toBe(false);
    expect(r.order).toBe(100);
    expect(r.gallery).toEqual([]);
    expect(issues(base)).toEqual([]);
  });

  it('rejects malformed slugs', () => {
    for (const slug of ['Test', 'test_product', 'test product', '-test', 'test-', '']) {
      expect(issues({ ...base, slug }).join()).toMatch(/slug/);
    }
  });

  it('requires https links', () => {
    expect(issues({ ...base, websiteUrl: 'http://example.com' }).join()).toMatch(/https/);
    expect(issues({ ...base, websiteUrl: 'not a url' })).not.toEqual([]);
  });

  it('only allows "released" when a real link exists', () => {
    expect(issues({ ...base, status: 'released' }).join()).toMatch(/released/);
    expect(issues({ ...base, status: 'released', downloadUrl: 'https://example.com/get', releaseApproval: approval })).toEqual([]);
  });

  it('only allows "beta" when accessible or documented', () => {
    expect(issues({ ...base, status: 'beta', statusNote: undefined }).join()).toMatch(/beta/);
    expect(issues({ ...base, status: 'beta', statusNote: 'Public TestFlight beta.' })).toEqual([]);
  });

  it('forbids download links on unreleased products', () => {
    expect(issues({ ...base, downloadUrl: 'https://example.com/get' }).join()).toMatch(/downloadUrl/);
    expect(issues({ ...base, status: 'coming-soon', heroImage: 'x.png', heroImageAlt: 'x', downloadUrl: 'https://e.com' }).join()).toMatch(
      /downloadUrl/,
    );
  });

  it('requires meaningful content and a status note for in-development', () => {
    expect(issues({ ...base, features: [] }).join()).toMatch(/meaningful content/);
    expect(issues({ ...base, statusNote: undefined }).join()).toMatch(/statusNote/);
  });

  it('requires approved material for coming-soon', () => {
    expect(issues({ ...base, status: 'coming-soon' }).join()).toMatch(/approved visual material/);
  });

  it('does not let unpublished products be featured', () => {
    expect(issues({ ...base, published: false, featured: true }).join()).toMatch(/featured/);
  });

  it('requires alt text for every image', () => {
    expect(issues({ ...base, heroImage: 'x.webp' }).join()).toMatch(/heroImageAlt/);
    expect(issues({ ...base, icon: 'x.png' }).join()).toMatch(/iconAlt/);
    expect(issues({ ...base, gallery: [{ image: 'x.webp', alt: 'short' }] })).not.toEqual([]);
  });

  describe('publication workflow: page (gate 1) is separate from download release (gate 2)', () => {
    it('an in-development product can have a public information page without any download', () => {
      expect(issues({ ...base, published: true, status: 'in-development' })).toEqual([]);
    });
    it('a download link always needs an owner-approved release, even when published as released', () => {
      expect(issues({ ...base, status: 'released', downloadUrl: 'https://example.com/get' }).join()).toMatch(/releaseApproval/);
    });
    it('drafts cannot carry a download link either (it would show on the draft preview)', () => {
      expect(issues({ ...base, published: false, downloadUrl: 'https://example.com/get' }).join()).toMatch(/downloadUrl/);
      expect(issues({ ...base, published: false, status: 'in-development', downloadUrl: 'https://e.com/x', releaseApproval: approval }).join()).toMatch(
        /downloadUrl/,
      );
    });
    it('releaseApproval is validated and cannot exist on its own', () => {
      expect(issues({ ...base, status: 'released', websiteUrl: 'https://e.com', releaseApproval: approval }).join()).toMatch(/approves nothing/);
      expect(issues({ ...base, status: 'in-development', releaseApproval: approval }).join()).toMatch(/releaseApproval/);
      expect(
        issues({ ...base, status: 'released', downloadUrl: 'https://e.com/x', releaseApproval: { ...approval, approvedOn: 'soon' } }).join(),
      ).toMatch(/YYYY-MM-DD/);
      expect(issues({ ...base, status: 'released', downloadUrl: 'https://e.com/x', releaseApproval: { version: '1.0', approvedOn: '2026-12-01' } })).not.toEqual([]);
    });
  });

  it('skips release rules for unpublished drafts', () => {
    expect(issues({ ...base, published: false, status: 'released' })).toEqual([]);
  });
});
