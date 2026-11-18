import { expect, test } from '@playwright/test';
import { VIEWPORTS } from './helpers';

for (const width of VIEWPORTS) {
  test(`official logo renders crisp and undistorted at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const logo = page.locator('header.site-header img[data-brandmark="logo"]:not(dialog img)');
    await expect(logo).toBeVisible();
    const m = await logo.evaluate((img: HTMLImageElement) => ({
      complete: img.complete,
      nw: img.naturalWidth,
      nh: img.naturalHeight,
      w: img.getBoundingClientRect().width,
      h: img.getBoundingClientRect().height,
      src: img.currentSrc,
    }));
    expect(m.complete && m.nw > 0).toBe(true);
    expect(m.h).toBeCloseTo(width >= 768 ? 36 : 32, 0);
    expect(m.w / m.h).toBeCloseTo(m.nw / m.nh, 1); // aspect ratio preserved
    expect(m.src).toMatch(/\.(avif|webp)$/); // optimised format, transparency kept
    // The logo must stay clear of the navigation / menu button.
    const nav = await page.locator(width >= 768 ? 'nav[aria-label="Primary"]' : '[data-menu-open]').boundingBox();
    expect(m.w + 16).toBeLessThan(nav!.x);
  });
}

test('header, menu and footer use the official logo; no interim wordmark remains', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/studio/');
  await expect(page.locator('[data-brandmark="interim-wordmark"]')).toHaveCount(0);
  await expect(page.locator('footer img[data-brandmark="logo"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Open menu' }).click();
  const menuLogo = page.locator('dialog#mobile-nav img[data-brandmark="logo"]');
  await expect(menuLogo).toBeVisible();
  // Same image set as the header logo, so the browser reuses it instead of downloading another size.
  expect(await menuLogo.getAttribute('src')).toBe(await page.locator('header.site-header img[data-brandmark="logo"]:not(dialog img)').getAttribute('src'));
  // Home links keep their accessible name; the image itself is decorative.
  await expect(page.locator('dialog#mobile-nav').getByRole('link', { name: 'Taren — home' })).toBeVisible();
  expect(await page.locator('img[data-brandmark]').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt')))).toEqual(
    expect.arrayContaining(['']),
  );
});

test('hero shows the official symbol as decoration', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const symbol = page.locator('.orbits img[data-brandmark="symbol"]');
  await expect(symbol).toBeVisible();
  expect(await symbol.evaluate((i) => !!i.closest('[aria-hidden="true"]'))).toBe(true);
  // Never overlaps the hero text (measured on the rendered text, not the wider block boxes).
  const textRight = await page.evaluate(() =>
    Math.max(
      ...[...document.querySelectorAll('.hero h1, .hero p, .hero a')].map((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().right;
      }),
    ),
  );
  const sym = (await symbol.boundingBox())!;
  expect(sym.x).toBeGreaterThan(textRight + 24);
});

test('hero symbol is hidden (and not downloaded) below 1280px', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.orbits img[data-brandmark="symbol"]')).toBeHidden();
  expect(requested.some((u) => u.includes('taren-symbol'))).toBe(false);
});

test('favicons and social image are wired up', async ({ page, request }) => {
  await page.goto('/');
  const icons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((ls) => ls.map((l) => l.getAttribute('href')!));
  expect(icons).toEqual(['/favicon.ico', '/favicon-32.png', '/apple-touch-icon.png']);
  for (const href of icons) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    expect(res.headers()['content-type'], href).toMatch(/image\//);
  }
  expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toBe('https://taren.se/og/taren.png');
});
