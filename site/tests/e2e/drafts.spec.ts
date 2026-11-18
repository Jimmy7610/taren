import { expect, test } from '@playwright/test';

// Runs against the draft-preview build (TAREN_SHOW_DRAFTS=1). See src/lib/drafts.ts.

test('a draft product page is reviewable but clearly marked and never indexable', async ({ page }) => {
  const res = await page.goto('/products/lumen-capture/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('[data-draft-banner]')).toContainText('not published');
  expect(await page.locator('meta[name=robots]').getAttribute('content')).toBe('noindex, follow');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.locator('h1')).toHaveText('Lumen Capture');
});

test('desktop products use desktop frames everywhere', async ({ page }) => {
  await page.goto('/products/lumen-capture/');
  await expect(page.locator('.phone')).toHaveCount(0);
  expect(await page.locator('.desktop').count()).toBeGreaterThanOrEqual(1 + 3 + 8); // hero + steps + gallery
  // Screenshots load and keep their landscape aspect ratio.
  const ratios = await page.locator('#screenshots .desktop img').evaluateAll((imgs) =>
    (imgs as HTMLImageElement[]).map((i) => i.getBoundingClientRect().width / i.getBoundingClientRect().height),
  );
  for (const r of ratios) expect(r).toBeCloseTo(1000 / 660, 1);
});

test('the lightbox works for desktop screenshots', async ({ page }) => {
  await page.goto('/products/lumen-capture/');
  await page.locator('#screenshots .shot-link').nth(2).click();
  const dialog = page.locator('#screenshots dialog[data-lightbox]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lb-count]')).toHaveText('3 / 8');
  await expect(dialog.locator('[data-lb-caption]')).toContainText('2.5');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('product list shows drafts with a Draft label; cards share the grid evenly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/products/');
  const cards = page.locator('[data-product-card]');
  await expect(cards).toHaveCount(2);
  await expect(page.locator('[data-product-card="lumen-capture"] .draft-pill')).toHaveText('Draft');
  await expect(page.locator('[data-product-card="pulse-garden"] .draft-pill')).toHaveCount(0);
  const widths = await cards.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(Math.abs(widths[0]! - widths[1]!)).toBeLessThanOrEqual(1);
});

test('drafts are never featured and never reach the sitemap; any listing is labelled Draft', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('article.showcase')).toHaveCount(1);
  await expect(page.locator('article.showcase')).toHaveAttribute('data-accent', 'pulse-garden');
  await expect(page.locator('.hero [data-teaser]')).toHaveAttribute('data-teaser', 'pulse-garden');
  const lumenCards = page.locator('[data-product-card="lumen-capture"]');
  for (let i = 0; i < (await lumenCards.count()); i++) await expect(lumenCards.nth(i).locator('.draft-pill')).toHaveText('Draft');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('dialog#mobile-nav [data-teaser]')).toHaveAttribute('data-teaser', 'pulse-garden');
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).not.toContain('lumen-capture');
});
