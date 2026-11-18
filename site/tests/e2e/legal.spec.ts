import { expect, test } from '@playwright/test';
import { PAGES } from './helpers';

// Taren 2.3 launch copy: owner-approved contact address and copyright line.
const EMAIL = 'Jbl_76@hotmail.com';
const COPYRIGHT = '© 2026 Jimmy Eliasson · Taren';

test.describe('contact and copyright', () => {
  for (const path of ['/privacy/', '/terms/', '/studio/', '/support/']) {
    test(`${path} offers the approved address as an accessible mailto link`, async ({ page }) => {
      await page.goto(path);
      const link = page.locator('main a[href^="mailto:"]').first();
      await expect(link).toHaveAttribute('href', `mailto:${EMAIL}`);
      await expect(link).toHaveAccessibleName(EMAIL); // the visible address is the name
      expect(await link.getAttribute('target')).toBeNull(); // mail links never open a new tab
      // Every mailto on the site uses exactly this address.
      for (const href of await page.locator('a[href^="mailto:"]').evaluateAll((as) => as.map((a) => a.getAttribute('href'))))
        expect(href).toBe(`mailto:${EMAIL}`);
    });
  }

  test('privacy and terms no longer route enquiries to GitHub', async ({ page }) => {
    for (const path of ['/privacy/', '/terms/']) {
      await page.goto(path);
      await expect(page.locator('main a[href*="github.com"]')).toHaveCount(0);
    }
  });

  for (const { path } of [...PAGES, { path: '/404.html' }]) {
    test(`${path} footer carries the approved copyright line`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('footer [data-copyright]')).toHaveText(COPYRIGHT);
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(/All rights reserved/i);
      // Nothing suggests a registered company or invented registration details.
      expect(text).not.toMatch(/\b(AB|Ltd\.?|Inc\.?|GmbH|LLC)\b|org(anisation|\.)?\s*(no|nr|number)|VAT\s*(no|number)|momsreg/i);
    });
  }
});
