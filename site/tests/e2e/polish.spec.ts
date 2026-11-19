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

  test('phones get the featured product teaser instead of empty space', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const teaser = page.locator('.hero [data-teaser="lumen-capture"]');
    await expect(teaser).toBeVisible();
    // The teaser starts inside the first screen.
    expect((await teaser.boundingBox())!.y).toBeLessThan(844);
    await teaser.click();
    await expect(page).toHaveURL('/products/lumen-capture/');
  });

  // Taren 2.4 B+ (docs/TAREN_SPACING_UX_AUDIT.md): the featured product is visible in the first desktop screen too.
  for (const [w, h] of [[1024, 768], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440]] as const) {
    test(`desktop ${w}×${h}: the featured product card is fully in the first screen, clear of the stage`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const teaser = page.locator('.hero [data-teaser="lumen-capture"]');
      await expect(teaser).toBeVisible();
      // Measure the resting layout: wait for the finite entrance animations (the orbits loop forever).
      await page.evaluate(() =>
        Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished)),
      );
      const t = (await teaser.boundingBox())!;
      expect(t.y + t.height, 'card below the fold').toBeLessThanOrEqual(h);
      const stage = (await page.locator('.hero-stage').boundingBox())!;
      const overlaps = !(t.x + t.width < stage.x || t.x > stage.x + stage.width || t.y + t.height < stage.y || t.y > stage.y + stage.height);
      expect(overlaps, 'card overlaps the symbol stage').toBe(false);
      // The card is a single link in the hero, named after the product.
      await expect(page.locator('.hero a[href="/products/lumen-capture/"]')).toHaveCount(1);
      await expect(teaser).toHaveAccessibleName(/Lumen Capture/);
    });
  }

  test('the desktop hero is about 70 % of the screen and never clips its content', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    const hero = (await page.locator('.hero').boundingBox())!;
    expect(hero.height).toBeLessThanOrEqual(1080 * 0.8);
    const overflow = await page.locator('.hero-grid').evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('product showcase', () => {
  test('homepage and products page show the featured stage with verified chips', async ({ page }) => {
    for (const path of ['/', '/products/']) {
      await page.goto(path);
      // Taren 2.5: Lumen Capture is the featured product (homepage) and first in the catalogue (stage).
      const showcase = page.locator('article.showcase[data-accent="lumen-capture"]');
      await expect(showcase).toBeVisible();
      const chips = (await showcase.locator('ul[aria-label$="at a glance"] li').allInnerTexts()).map((t) => t.split('\n').pop()!.trim());
      expect(chips).toEqual(['Screen recorder and editor', 'Windows 10 (2004+) and 11, x64', 'None — runs on your PC', 'Six built in']);
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
  const teaser = page.locator('dialog#mobile-nav [data-teaser="lumen-capture"]');
  await expect(teaser).toBeVisible();
  await teaser.click();
  await expect(page).toHaveURL('/products/lumen-capture/');
});
