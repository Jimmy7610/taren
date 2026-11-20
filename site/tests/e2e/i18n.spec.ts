import { expect, test } from '@playwright/test';
import { KOFI, PAGES, PAGES_SV } from './helpers';

// Taren 2.6: complete English/Swedish site. English at the root, Swedish under /sv/.
const twin = (p: string) => (p.startsWith('/sv/') ? p.slice(3) || '/' : `/sv${p}`);
const PRODUCTS = ['Lumen Capture', 'PDF Studio', 'Pulse Garden', 'MineClone'];

test.describe('bilingual pages', () => {
  for (const { path } of [...PAGES, ...PAGES_SV]) {
    test(`${path}: twin exists, lang, canonical and reciprocal hreflang`, async ({ page, request }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      const sv = path.startsWith('/sv/');
      await expect(page.locator('html')).toHaveAttribute('lang', sv ? 'sv' : 'en');
      expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBe(`https://taren.se${path}`);
      const alts = Object.fromEntries(
        await page.locator('link[rel=alternate][hreflang]').evaluateAll((ls) => ls.map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')])),
      );
      const enPath = sv ? twin(path) : path;
      expect(alts).toEqual({ en: `https://taren.se${enPath}`, sv: `https://taren.se${twin(enPath)}`, 'x-default': `https://taren.se${enPath}` });
      expect(await page.locator('meta[property="og:locale"]').getAttribute('content')).toBe(sv ? 'sv_SE' : 'en_GB');
      expect((await request.get(twin(path))).status()).toBe(200);
      // The switcher offers exactly this page in the other language, and marks the current one.
      const switcher = page.locator('[data-lang-switcher="header"]');
      await expect(switcher.locator(`a[data-lang-switch="${sv ? 'en' : 'sv'}"]`)).toHaveAttribute('href', twin(path));
      await expect(switcher.locator('[aria-current="true"]')).toHaveAttribute('data-lang-switch', sv ? 'sv' : 'en');
    });
  }
});

test.describe('language switcher', () => {
  test('keeps the current page in both directions and works by keyboard', async ({ page }) => {
    await page.goto('/products/pdfstudio/');
    await page.locator('[data-lang-switcher="header"] [data-lang-switch="sv"]').click();
    await expect(page).toHaveURL('/sv/products/pdfstudio/');
    await expect(page.locator('h1')).toHaveText('PDF Studio');
    await page.locator('[data-lang-switcher="header"] [data-lang-switch="en"]').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/products/pdfstudio/');
  });

  test('accessible names, language attributes and a visible current state', async ({ page }) => {
    await page.goto('/sv/privacy/');
    const nav = page.locator('[data-lang-switcher="header"]');
    await expect(nav).toHaveAttribute('aria-label', 'Språk');
    await expect(nav.getByRole('link', { name: 'English' })).toHaveAttribute('lang', 'en');
    await expect(nav.getByRole('link', { name: 'Svenska' })).toHaveAttribute('aria-current', 'true');
    const current = nav.locator('[aria-current="true"]');
    expect(await current.evaluate((a) => getComputedStyle(a).textDecorationLine)).toContain('underline');
    const box = (await nav.getByRole('link', { name: 'English' }).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('mobile: in the header and in the menu, by touch', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto('/studio/');
    await expect(page.locator('[data-lang-switcher="header"]')).toBeVisible();
    await page.getByRole('button', { name: 'Open menu' }).tap();
    const inMenu = page.locator('[data-lang-switcher="menu"] [data-lang-switch="sv"]');
    await expect(inMenu).toBeVisible();
    await inMenu.tap();
    await expect(page).toHaveURL('/sv/studio/');
    await expect(page.getByRole('button', { name: 'Öppna menyn' })).toBeVisible();
    await ctx.close();
  });

  test('works without JavaScript (plain links, no redirects)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, locale: 'sv-SE' });
    const page = await ctx.newPage();
    await page.goto('/products/');
    await expect(page).toHaveURL('/products/'); // no automatic switch without JavaScript
    await page.locator('[data-lang-switcher="header"] [data-lang-switch="sv"]').click();
    await expect(page).toHaveURL('/sv/products/');
    await expect(page.locator('h1')).toHaveText('Utvalda projekt');
    await ctx.close();
  });
});

test.describe('language preference', () => {
  test('an explicit choice is remembered across navigation and later visits, without loops', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-lang-switcher="header"] [data-lang-switch="sv"]').click();
    await expect(page).toHaveURL('/sv/');
    // A later visit to an English URL shows the Swedish twin (replace, so Back is not trapped).
    await page.goto('/support/');
    await expect(page).toHaveURL('/sv/support/');
    await page.locator('[data-lang-switcher="header"] [data-lang-switch="en"]').click();
    await expect(page).toHaveURL('/support/');
    await page.goto('/sv/terms/');
    await expect(page).toHaveURL('/terms/');
    // Stable: no further navigation happens on its own.
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/terms/');
  });

  test('first visit with a Swedish browser shows Swedish; an explicit English choice wins', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'sv-SE' });
    const page = await ctx.newPage();
    await page.goto('/products/lumen-capture/');
    await expect(page).toHaveURL('/sv/products/lumen-capture/');
    await page.locator('[data-lang-switcher="header"] [data-lang-switch="en"]').click();
    await expect(page).toHaveURL('/products/lumen-capture/');
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await ctx.close();
  });

  test('an English browser without a choice stays on the page it asked for', async ({ page }) => {
    await page.goto('/sv/studio/');
    await page.waitForTimeout(300);
    await expect(page).toHaveURL('/sv/studio/');
    await page.goto('/studio/');
    await expect(page).toHaveURL('/studio/');
  });

  test('error pages never redirect and lead to each language home', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'sv-SE' });
    const page = await ctx.newPage();
    const res = await page.goto('/this-page-does-not-exist/');
    expect(res?.status()).toBe(404);
    await page.waitForTimeout(300);
    await expect(page).toHaveURL('/this-page-does-not-exist/');
    await expect(page.locator('[data-lang-switcher="header"] [data-lang-switch="sv"]')).toHaveAttribute('href', '/sv/');
    await ctx.close();
  });
});

test.describe('Swedish content', () => {
  test('product order, featured product and unchanged product names', async ({ page }) => {
    await page.goto('/sv/');
    await expect(page.locator('.hero [data-teaser]')).toHaveAttribute('data-teaser', 'lumen-capture');
    await expect(page.locator('.hero [data-teaser]')).toContainText('Beta');
    await expect(page.locator('.hero [data-teaser]')).toHaveAttribute('href', '/sv/products/lumen-capture/');
    await expect(page.locator('main article.showcase')).toHaveAttribute('data-accent', 'lumen-capture');
    await page.goto('/sv/products/');
    const order = await page.locator('main article.showcase h2, main [data-product-card] h2').allInnerTexts();
    expect(order.map((t) => t.trim())).toEqual(PRODUCTS);
    for (const href of await page.locator('main a[href*="/products/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href'))))
      expect(href).toMatch(/^\/sv\/products\//);
  });

  test('each product page: Swedish text and honest status; both desktop betas are downloadable', async ({ page }) => {
    for (const [slug, name] of [['lumen-capture', 'Lumen Capture'], ['pdfstudio', 'PDF Studio'], ['pulse-garden', 'Pulse Garden']] as const) {
      await page.goto(`/sv/products/${slug}/`);
      await expect(page.locator('h1')).toHaveText(name);
      await expect(page.getByRole('heading', { name: `Om ${name}` })).toBeVisible();
      await expect(page.getByRole('heading', { name: `${name} i korthet` })).toBeVisible();
      const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
      if (slug === 'lumen-capture') {
        // Published public beta: Swedish download button and status (details in downloads.spec.ts).
        await expect(page.locator('.product-status').first()).toHaveText(/Beta/);
        await expect(page.getByText(/Öppen beta 2\.9\.0-beta\.2 för Windows/).first()).toBeVisible();
        await expect(page.locator('[data-download-installer]')).toContainText('Ladda ner för Windows');
        expect(ld).toContain('SoftwareApplication');
        continue;
      }
      if (slug === 'pdfstudio') {
        await expect(page.locator('.product-status').first()).toHaveText(/Beta/);
        await expect(page.getByText(/Öppen beta 0\.9\.0-beta\.2 för Windows/).first()).toBeVisible();
        await expect(page.locator('[data-download-installer]')).toContainText('Ladda ner för Windows');
        expect(ld).toContain('SoftwareApplication');
        continue;
      }
      await expect(page.locator('.product-status').first()).toHaveText(/Under utveckling/);
      expect(await page.getByRole('link', { name: /ladda ned|download|installation|app store|testflight/i }).count(), slug).toBe(0);
      expect(ld).not.toContain('SoftwareApplication');
    }
    await page.goto('/sv/products/pulse-garden/');
    await expect(page.getByText(/inte tillgängligt på App Store eller TestFlight/)).toBeVisible();
    await page.goto('/sv/products/pdfstudio/');
    await expect(page.getByText(/Öppen beta 0\.9\.0-beta\.2 för Windows/).first()).toBeVisible();
  });

  test('gallery script speaks Swedish', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/sv/products/pdfstudio/');
    const root = page.locator('#screenshots [data-gallery]');
    await root.scrollIntoViewIfNeeded();
    await expect(root.locator('[data-gallery-status]')).toHaveText('1–2 av 10');
    await root.getByRole('button', { name: 'Nästa skärmbilder' }).click();
    await expect(root.locator('[data-gallery-status]')).toHaveText('2–3 av 10');
  });

  test('Ko-fi: same official link in both languages, safe attributes', async ({ page }) => {
    for (const path of ['/support/', '/sv/support/', '/sv/']) {
      await page.goto(path);
      const links = page.locator('a[href*="ko-fi"]');
      expect(await links.count(), path).toBeGreaterThan(0);
      for (const a of await links.all()) {
        await expect(a).toHaveAttribute('href', KOFI);
        await expect(a).toHaveAttribute('target', '_blank');
        await expect(a).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
    await page.goto('/sv/support/');
    await expect(page.getByRole('heading', { name: 'Helt frivilligt' })).toBeVisible();
    await expect(page.locator('main [data-kofi-link]').first()).toContainText('Stöd på Ko-fi');
  });

  test('Swedish 404 page exists for unknown /sv/ paths', async ({ request }) => {
    const res = await request.get('/sv/404.html');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<html lang="sv"');
    expect(html).toContain('Den här sidan finns inte.');
    expect(html).toContain('noindex');
  });

  test('the 410 page says it in both languages', async ({ page }) => {
    await page.goto('/410/');
    await expect(page.getByRole('heading', { name: 'This page has been retired.' })).toBeVisible();
    await expect(page.locator('[lang="sv"]').getByRole('heading', { name: 'Den här sidan har tagits bort.' })).toBeVisible();
  });
});
