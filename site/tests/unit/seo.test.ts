import { describe, expect, it } from 'vitest';
import { absoluteUrl, buildSeo, canonicalPath, serializeJsonLd } from '@/lib/seo';
import { buildSitemap } from '@/lib/sitemap';

describe('canonical URLs', () => {
  it('normalises paths', () => {
    expect(canonicalPath('/studio')).toBe('/studio/');
    expect(canonicalPath('/studio/?ref=x#top')).toBe('/studio/');
    expect(canonicalPath('//products//a')).toBe('/products/a/');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/sitemap.xml')).toBe('/sitemap.xml');
  });

  it('uses https://taren.se as origin', () => {
    expect(absoluteUrl('/support/')).toBe('https://taren.se/support/');
  });
});

describe('buildSeo', () => {
  it('builds the home title from the tagline', () => {
    expect(buildSeo({ description: 'd', path: '/' }).title).toBe('Taren — Software built with curiosity');
  });
  it('suffixes page titles with the brand', () => {
    const m = buildSeo({ title: 'Studio', description: 'd', path: '/studio' });
    expect(m.title).toBe('Studio — Taren');
    expect(m.canonical).toBe('https://taren.se/studio/');
    expect(m.ogImage).toBe('https://taren.se/og/taren.png');
    expect(m.robots).toBe('index, follow');
  });
  it('supports noindex and custom OG images', () => {
    const m = buildSeo({ description: 'd', path: '/404', noindex: true, ogImage: '/og/x.jpg', ogImageAlt: 'x' });
    expect(m.robots).toBe('noindex, follow');
    expect(m.ogImage).toBe('https://taren.se/og/x.jpg');
  });
  it('emits no canonical URL on noindex pages (404, 410, drafts would point at non-existent URLs)', () => {
    expect(buildSeo({ description: 'd', path: '/404', noindex: true }).canonical).toBeUndefined();
    expect(buildSeo({ description: 'd', path: '/products/pdfstudio/', noindex: true }).canonical).toBeUndefined();
  });
});

describe('JSON-LD serialisation', () => {
  it('cannot break out of the script element', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('sitemap', () => {
  it('lists absolute, unique, canonical URLs', () => {
    const xml = buildSitemap(['/', '/products', '/products/', '/a&b/'], 'https://taren.se');
    expect(xml).toContain('<loc>https://taren.se/</loc>');
    expect(xml.match(/products\/<\/loc>/g)).toHaveLength(1);
    expect(xml).toContain('a&amp;b');
    expect(xml.startsWith('<?xml')).toBe(true);
  });
});
