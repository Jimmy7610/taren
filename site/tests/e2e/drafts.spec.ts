import { expect, test } from '@playwright/test';

// Runs against the draft-preview build (TAREN_SHOW_DRAFTS=1, src/lib/drafts.ts). Since Taren 2.5 every product is
// published, so draft mode must show exactly what production shows: no draft labels, no extra products.

test('draft mode adds nothing while every product is published', async ({ page, request }) => {
  await page.goto('/products/');
  await expect(page.locator('main article.showcase')).toHaveAttribute('data-accent', 'lumen-capture');
  const cards = await page.locator('main [data-product-card]').evaluateAll((els) => els.map((e) => e.getAttribute('data-product-card')));
  expect(cards).toEqual(['pdfstudio', 'pulse-garden']);
  await expect(page.locator('.draft-pill')).toHaveCount(0);
  for (const slug of ['lumen-capture', 'pdfstudio', 'pulse-garden']) {
    const res = await page.goto(`/products/${slug}/`);
    expect(res?.status(), slug).toBe(200);
    await expect(page.locator('[data-draft-banner]'), slug).toHaveCount(0);
  }
  expect((await request.get('/products/example-product/')).status()).toBe(404);
});
