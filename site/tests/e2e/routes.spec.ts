import { expect, test } from '@playwright/test';
import { PAGES, scrollThrough, watchErrors } from './helpers';

test.describe('routes', () => {
  for (const { path, h1 } of PAGES) {
    test(`${path} renders with correct metadata and no errors`, async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(h1);

      await expect(page).toHaveTitle(/Taren/);
      const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
      expect(canonical).toBe(`https://taren.se${path}`);
      expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(canonical);
      const desc = await page.locator('meta[name=description]').getAttribute('content');
      expect(desc?.length).toBeGreaterThan(50);
      expect(desc!.length).toBeLessThanOrEqual(200);
      expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toMatch(/^https:\/\/taren\.se\/og\//);
      expect(await page.locator('meta[name=robots]').getAttribute('content')).toBe('index, follow');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');

      for (const json of await page.locator('script[type="application/ld+json"]').allTextContents()) {
        expect(() => JSON.parse(json)).not.toThrow();
      }

      // Exactly one of each landmark.
      await expect(page.locator('header.site-header')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.locator('footer#site-footer')).toHaveCount(1);

      await scrollThrough(page);
      const broken = await page.locator('img').evaluateAll((imgs) =>
        (imgs as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      );
      expect(broken).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test('titles and descriptions are unique across pages', async ({ page }) => {
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const { path } of PAGES) {
      await page.goto(path);
      titles.add(await page.title());
      descs.add((await page.locator('meta[name=description]').getAttribute('content')) ?? '');
    }
    expect(titles.size).toBe(PAGES.length);
    expect(descs.size).toBe(PAGES.length);
  });

  test('unknown routes return the 404 page with a 404 status', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText(/doesn’t exist/);
    expect(await page.locator('meta[name=robots]').getAttribute('content')).toBe('noindex, follow');
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('unpublished products have no page', async ({ page }) => {
    const res = await page.goto('/products/example-product/');
    expect(res?.status()).toBe(404);
  });

  test('sitemap lists published pages only', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>(.+?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(
      expect.arrayContaining(PAGES.map((p) => `https://taren.se${p.path}`)),
    );
    expect(locs).toHaveLength(PAGES.length);
    expect(xml).not.toContain('example-product');
    expect(xml).not.toMatch(/404|410|games/);
  });

  test('robots.txt allows crawling and points to the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Sitemap: https://taren.se/sitemap.xml');
  });

  test('icons and manifest exist', async ({ request }) => {
    for (const p of ['/favicon.ico', '/favicon-32.png', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/site.webmanifest', '/og/taren.png', '/og/pulse-garden.jpg']) {
      expect((await request.get(p)).status(), p).toBe(200);
    }
  });

  test('the old browser games are gone', async ({ page, request }) => {
    const oldNames = ['Ashveil', 'Coreloom', 'Nightcoil', 'Lumen Coil', 'Signal Keeper', 'Voidbreaker', 'Tetrafall', 'Shardrift'];
    for (const { path } of PAGES) {
      await page.goto(path);
      const text = await page.locator('body').innerText();
      for (const name of oldNames) expect(text, `${name} on ${path}`).not.toContain(name);
      expect(await page.locator('a[href^="/games"], a[href^="/experiments"]').count()).toBe(0);
    }
    // In the static build these do not exist (production answers 410 via Pages Functions).
    expect((await request.get('/games/ashveil/')).status()).toBe(404);
  });
});
