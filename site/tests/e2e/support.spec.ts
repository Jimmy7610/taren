import { expect, test } from '@playwright/test';
import { KOFI, PAGES } from './helpers';

test('every Ko-fi link points to the official page and is labelled as external', async ({ page }) => {
  for (const { path } of PAGES) {
    await page.goto(path);
    const links = await page.locator('a[href*="ko-fi"]').evaluateAll((as) =>
      as.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel'), text: a.textContent })),
    );
    expect(links.length, path).toBeGreaterThan(0);
    for (const l of links) {
      expect(l.href).toBe(KOFI);
      expect(l.target).toBe('_blank');
      expect(l.rel).toContain('noopener');
      expect(l.text).toContain('opens in a new tab');
    }
  }
});

test('homepage has a support section and navigation links to /support/', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Enjoying what we’re building?' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support/');
});

test('support is optional and no payment widget or third-party script is loaded', async ({ page }) => {
  const thirdParty: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost') && !r.url().startsWith('data:')) thirdParty.push(r.url());
  });
  for (const { path } of PAGES) await page.goto(path);
  expect(thirdParty).toEqual([]);
  await page.goto('/support/');
  await expect(page.getByText('Support is never required')).toBeVisible();
  expect(await page.locator('iframe, form, input').count()).toBe(0);
});

test('the Ko-fi link opens a new tab', async ({ page, context }) => {
  await page.goto('/support/');
  // Block the real network: we only check that a new tab is requested for the right URL.
  await context.route('https://ko-fi.com/**', (route) => route.fulfill({ status: 200, body: 'ok' }));
  const [popup] = await Promise.all([context.waitForEvent('page'), page.locator('main [data-kofi-link]').first().click()]);
  expect(popup.url()).toBe(KOFI);
});
