import { expect, test } from '@playwright/test';
import { PAGES, scrollThrough } from './helpers';

// Visual regression: first viewport of each page at a phone and a desktop size.
// Update baselines deliberately with: npx playwright test visual --update-snapshots
const slug = (path: string) => (path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

for (const width of [375, 1440]) {
  test.describe(`visual ${width}px`, () => {
    test.use({ viewport: { width, height: width < 768 ? 812 : 900 }, reducedMotion: 'reduce' });
    for (const { path } of PAGES) {
      test(`${path}`, async ({ page }) => {
        await page.goto(path);
        await scrollThrough(page);
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${slug(path)}-${width}.png`);
      });
    }
  });
}

// Wider matrix for the two most designed pages: tablet, wide, ultrawide and landscape phone.
for (const [width, height] of [[320, 640], [768, 1024], [1920, 1080], [2560, 1440], [844, 390]] as const) {
  test.describe(`visual ${width}×${height}`, () => {
    test.use({ viewport: { width, height }, reducedMotion: 'reduce' });
    for (const path of ['/', '/products/pulse-garden/']) {
      test(`${path}`, async ({ page }) => {
        await page.goto(path);
        await scrollThrough(page);
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${slug(path)}-${width}x${height}.png`);
      });
    }
  });
}

test.describe('visual mobile menu', () => {
  test.use({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  test('open menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('dialog#mobile-nav')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot('menu-375.png');
  });
});
