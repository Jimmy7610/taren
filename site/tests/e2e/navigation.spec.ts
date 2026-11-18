import { expect, test } from '@playwright/test';

test.describe('desktop navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('primary links navigate and mark the current page', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const [label, url] of [['Products', '/products/'], ['Studio', '/studio/'], ['Support', '/support/']] as const) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    }
    await page.getByRole('link', { name: 'Taren — home' }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('the menu button is hidden on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-menu-open]')).toBeHidden();
  });

  test('footer links all resolve', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.locator('footer a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of new Set(hrefs)) expect((await request.get(href)).status(), href).toBe(200);
  });

  test('every internal link on every page resolves', async ({ page, request }) => {
    const seen = new Set<string>();
    for (const start of ['/', '/products/', '/products/pulse-garden/', '/studio/', '/support/', '/privacy/', '/terms/', '/404.html']) {
      await page.goto(start);
      const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      for (const h of hrefs) {
        expect(h, `empty link on ${start}`).not.toBe('');
        expect(h, `dead link on ${start}`).not.toBe('#');
        if (h.startsWith('/') && !seen.has(h)) {
          seen.add(h);
          expect((await request.get(h)).status(), `${h} from ${start}`).toBe(200);
        }
        if (h.startsWith('#') && h.length > 1) {
          await expect(page.locator(h), `anchor ${h} on ${start}`).toHaveCount(1);
        }
      }
    }
  });
});

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test('opens, traps focus, closes with Escape and returns focus', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Open menu' });
    const dialog = page.locator('dialog#mobile-nav');
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await expect(dialog).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    // Focus stays inside the modal dialog while tabbing.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog#mobile-nav') || document.activeElement === document.body)).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('close button and links work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(page.locator('dialog#mobile-nav')).toBeHidden();

    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Studio' }).click();
    await expect(page).toHaveURL('/studio/');
    await expect(page.locator('dialog#mobile-nav')).toBeHidden();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Studio' })).toHaveAttribute('aria-current', 'page');
  });

  test('opens from the keyboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('dialog#mobile-nav')).toBeVisible();
  });

  test('menu touch targets are at least 44px', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const sizes = await page.locator('dialog#mobile-nav a, dialog#mobile-nav button').evaluateAll((els) =>
      els.map((e) => ({ t: e.textContent?.trim(), h: e.getBoundingClientRect().height })),
    );
    for (const s of sizes) expect(s.h, s.t).toBeGreaterThanOrEqual(44);
  });
});

test.describe('keyboard', () => {
  test('first Tab reaches the skip link, which moves focus to main', async ({ page }) => {
    await page.goto('/studio/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).not.toBe('none');
  });

  test('product cards are reachable and open with Enter', async ({ page }) => {
    await page.goto('/products/');
    const link = page.locator('[data-product-card="pulse-garden"] a').first();
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/products/pulse-garden/');
  });

  test('the screenshot gallery scrolls with the keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products/pulse-garden/');
    const gallery = page.getByRole('region', { name: 'Pulse Garden screenshots' });
    await gallery.focus();
    const before = await gallery.evaluate((el) => el.scrollLeft);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => gallery.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  });
});
