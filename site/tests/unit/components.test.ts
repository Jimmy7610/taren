import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProductMedia from '@/components/ProductMedia.astro';
import ProductStatus from '@/components/ProductStatus.astro';
import Button from '@/components/Button.astro';
import SupportCTA from '@/components/SupportCTA.astro';

const render = async (c: Parameters<AstroContainer['renderToString']>[0], props = {}, slots = {}) =>
  (await AstroContainer.create()).renderToString(c, { props, slots });

describe('ProductMedia fallback', () => {
  it('renders a placeholder, not a broken image, when a product has no artwork', async () => {
    const html = await render(ProductMedia, { name: 'Nova' });
    expect(html).toContain('data-media="fallback"');
    expect(html).toContain('role="img"');
    expect(html).toContain('Nova — artwork coming later');
    expect(html).not.toContain('<img');
  });
});

describe('ProductStatus', () => {
  it('shows the human label with a screen-reader prefix', async () => {
    const html = await render(ProductStatus, { status: 'in-development' });
    expect(html).toContain('In development');
    expect(html).toContain('Status: ');
    expect(html).toContain('data-status="in-development"');
  });
});

describe('Button', () => {
  it('marks external links as new-tab with safe rel', async () => {
    const html = await render(Button, { href: 'https://ko-fi.com/taren', external: true }, { default: 'Go' });
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('(opens in a new tab)');
  });
  it('keeps internal links in the same tab', async () => {
    const html = await render(Button, { href: '/studio/' }, { default: 'Go' });
    expect(html).not.toContain('target=');
  });
});

describe('SupportCTA', () => {
  it('links only to the official Ko-fi page', async () => {
    const html = await render(SupportCTA);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toContain('https://ko-fi.com/taren');
    expect(hrefs.filter((h) => h?.includes('ko-fi')).every((h) => h === 'https://ko-fi.com/taren')).toBe(true);
    expect(html).toContain('Support on Ko-fi');
  });
});
