import { expect, test } from '@playwright/test';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('decorative and entry animations are disabled', async ({ page }) => {
    await page.goto('/');
    const durations = await page.evaluate(() =>
      ['.orbit-a', '.hero-title', '.page-enter'].map((s) => {
        const cs = getComputedStyle(document.querySelector(s)!);
        return { s, name: cs.animationName, dur: parseFloat(cs.animationDuration) };
      }),
    );
    for (const d of durations) expect(d.name === 'none' || d.dur <= 0.001, JSON.stringify(d)).toBe(true);
  });

  test('scroll reveals never hide content', async ({ page }) => {
    await page.goto('/');
    const hidden = await page.locator('[data-reveal]').evaluateAll((els) => els.filter((e) => Number(getComputedStyle(e).opacity) < 1).length);
    expect(hidden).toBe(0);
  });
});

test.describe('full motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the hero orbit animates and content is visible after load', async ({ page }) => {
    await page.goto('/');
    const name = await page.locator('.orbit-a').evaluate((e) => getComputedStyle(e).animationName);
    expect(name).not.toBe('none');
    await expect(page.locator('h1')).toBeVisible();
    // The headline is never faded out (good for LCP and for users).
    expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  });
});
