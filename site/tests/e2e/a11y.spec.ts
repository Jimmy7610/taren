import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ALL_PAGES, scrollThrough } from './helpers';

// @axe-core/playwright is typed against a newer playwright-core than the pinned @playwright/test
// (pinned to the pre-installed browser build). The runtime API is identical.
type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page'];

for (const width of [375, 1440]) {
  test.describe(`axe at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const { path } of [...ALL_PAGES, { path: '/404.html' }, { path: '/sv/404.html' }, { path: '/410/' }]) {
      test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(path);
        await scrollThrough(page);
        const results = await new AxeBuilder({ page: page as unknown as AxePage }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
        const summary = results.violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`);
        expect(summary).toEqual([]);
      });
    }
  });
}

test('mobile menu passes axe while open', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const results = await new AxeBuilder({ page: page as unknown as AxePage }).include('dialog#mobile-nav').analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('heading levels never skip', async ({ page }) => {
  for (const { path } of ALL_PAGES) {
    await page.goto(path);
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((hs) =>
      hs.filter((h) => !h.closest('dialog')).map((h) => Number(h.tagName[1])),
    );
    expect(levels[0], path).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!, `${path}: ${levels.join(',')}`).toBeLessThanOrEqual(1);
  }
});
