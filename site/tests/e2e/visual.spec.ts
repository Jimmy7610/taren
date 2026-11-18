import { expect, test } from '@playwright/test';
import { PAGES, scrollThrough } from './helpers';

// Visual regression: first viewport of each page at a phone and a desktop size.
// Update baselines deliberately with: npx playwright test visual --update-snapshots
for (const width of [375, 1440]) {
  test.describe(`visual ${width}px`, () => {
    test.use({ viewport: { width, height: width < 768 ? 812 : 900 }, reducedMotion: 'reduce' });
    for (const { path } of PAGES) {
      test(`${path}`, async ({ page }) => {
        await page.goto(path);
        await scrollThrough(page);
        await page.evaluate(() => document.fonts.ready);
        const name = `${path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-')}-${width}.png`;
        await expect(page).toHaveScreenshot(name);
      });
    }
  });
}
