import { expect, test } from '@playwright/test';

test.describe('hero', () => {
  for (const width of [320, 360, 390]) {
    test(`eyebrow stays on one line at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      const lines = await page.locator('.hero .eyebrow').evaluate((el) => {
        const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.6;
        return Math.round(el.getBoundingClientRect().height / lh);
      });
      expect(lines).toBe(1);
      const right = await page.locator('.hero .eyebrow').evaluate((el) => el.getBoundingClientRect().right);
      expect(right).toBeLessThanOrEqual(width);
    });
  }

  test('phones get a product teaser instead of empty space', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const teaser = page.locator('.hero [data-teaser="pulse-garden"]');
    await expect(teaser).toBeVisible();
    // The teaser starts inside the first screen.
    expect((await teaser.boundingBox())!.y).toBeLessThan(844);
    await teaser.click();
    await expect(page).toHaveURL('/products/pulse-garden/');
  });

  test('desktop has no teaser (the showcase follows)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('.hero [data-teaser]')).toBeHidden();
  });
});

test.describe('product showcase', () => {
  test('homepage and products page show the featured stage with verified chips', async ({ page }) => {
    for (const path of ['/', '/products/']) {
      await page.goto(path);
      const showcase = page.locator('article.showcase[data-accent="pulse-garden"]');
      await expect(showcase).toBeVisible();
      const chips = (await showcase.locator('ul[aria-label$="at a glance"] li').allInnerTexts()).map((t) => t.split('\n').pop()!.trim());
      expect(chips).toEqual(['Strategy puzzle', 'iPhone, portrait', 'Plays fully offline', 'English, Swedish']);
      await expect(showcase.locator('.xphone img')).toHaveCount(3);
    }
  });

  test('cross-fade animates, and holds still with reduced motion', async ({ browser }) => {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      const page = await browser.newPage({ reducedMotion });
      await page.goto('/products/');
      const names = await page.locator('.showcase .xphone img').evaluateAll((imgs) => imgs.map((i) => getComputedStyle(i).animationName));
      if (reducedMotion === 'reduce') {
        expect(names.every((n) => n === 'none' || n.includes('xfade'))).toBe(true);
        const opacities = await page.locator('.showcase .xphone img').evaluateAll((imgs) => imgs.map((i) => getComputedStyle(i).opacity));
        expect(opacities).toEqual(['1', '0', '0']);
      } else {
        expect(names.slice(1).every((n) => n.startsWith('xfade'))).toBe(true);
      }
      await page.close();
    }
  });
});

test.describe('product page', () => {
  test('accent colours come from the product', async ({ page }) => {
    await page.goto('/products/pulse-garden/');
    const accent = await page.locator('[data-accent="pulse-garden"]').first().evaluate((el) => getComputedStyle(el).getPropertyValue('--accent').trim());
    expect(accent).toBe('#2cc3b3');
  });

  test('at a glance, walkthrough and progress render from verified data', async ({ page }) => {
    await page.goto('/products/pulse-garden/');
    await expect(page.getByRole('heading', { name: 'Pulse Garden at a glance' })).toBeVisible();
    await expect(page.locator('.facts dt')).toHaveCount(8);
    await expect(page.locator('.facts dd').filter({ hasText: 'Plays fully offline' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'From one tap to a whole-garden pulse' })).toBeVisible();
    await expect(page.locator('.steps > li')).toHaveCount(3);

    const states = await page.locator('.timeline > li').evaluateAll((li) => li.map((l) => (l as HTMLElement).dataset.state));
    expect(states).toEqual(['done', 'done', 'in-progress', 'done', 'in-progress', 'next', 'planned']);
    await expect(page.getByText(/Not yet built on a Mac or tested on an iPhone/)).toBeVisible();
    await expect(page.getByText(/^Source: Pulse Garden project roadmap/)).toBeVisible();
    // Nothing claims a release.
    await expect(page.locator('.timeline .is-done').filter({ hasText: /TestFlight|App Store|release/i })).toHaveCount(0);
  });
});

test.describe('gallery lightbox', () => {
  test('opens, navigates with keys and buttons, wraps, and returns focus', async ({ page }) => {
    await page.goto('/products/pulse-garden/');
    const links = page.locator('#screenshots .shot-link');
    await expect(links).toHaveCount(7);
    const dialog = page.locator('#screenshots dialog[data-lightbox]');

    await links.nth(1).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-lb-count]')).toHaveText('2 / 7');
    await expect(dialog.locator('[data-lb-img]')).toHaveAttribute('alt', /CALMING/);
    await expect(dialog.locator('[data-lb-caption]')).toHaveText('Preview every move before you commit.');
    await expect.poll(() => dialog.locator('[data-lb-img]').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);

    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[data-lb-count]')).toHaveText('3 / 7');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.locator('[data-lb-count]')).toHaveText('7 / 7');
    await dialog.getByRole('button', { name: 'Next screenshot' }).click();
    await expect(dialog.locator('[data-lb-count]')).toHaveText('1 / 7');

    // Focus stays inside while open.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[data-lightbox]') || document.activeElement === document.body)).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(links.nth(0)).toBeFocused();
  });

  test('works without JavaScript: every screenshot links to its full-size image', async ({ page, request }) => {
    await page.goto('/products/pulse-garden/');
    const hrefs = await page.locator('#screenshots .shot-link').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs).toHaveLength(7);
    for (const h of hrefs) {
      const res = await request.get(h);
      expect(res.status(), h).toBe(200);
      expect(res.headers()['content-type']).toBe('image/webp');
    }
  });

  test('screenshot links have descriptive accessible names', async ({ page }) => {
    await page.goto('/products/pulse-garden/');
    const first = page.locator('#screenshots .shot-link').first();
    await expect(first).toHaveAccessibleName(/main menu.*open larger view/i);
  });
});

test('mobile menu features the product', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/studio/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const teaser = page.locator('dialog#mobile-nav [data-teaser="pulse-garden"]');
  await expect(teaser).toBeVisible();
  await teaser.click();
  await expect(page).toHaveURL('/products/pulse-garden/');
});
