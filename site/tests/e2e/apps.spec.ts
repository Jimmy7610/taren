import { expect, test } from '@playwright/test';
import { RELEASE_SIZES, scrollThrough, watchErrors } from './helpers';

// Lumen Capture and PDF Studio: public information pages since Taren 2.5 (owner-approved, docs/PUBLICATION_WORKFLOW.md
// gate 1). Runs against the production build. Neither is released: no download anywhere (gate 2 not passed).

test('Lumen Capture is a public, indexable page with an honest public-beta status and the published download', async ({ page }) => {
  const res = await page.goto('/products/lumen-capture/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Lumen Capture');
  await expect(page.locator('[data-draft-banner]')).toHaveCount(0);
  expect(await page.locator('meta[name=robots]').getAttribute('content')).toBe('index, follow');
  expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBe('https://taren.se/products/lumen-capture/');
  await expect(page.locator('.product-status').first()).toHaveText(/Beta/);
  await expect(page.getByText(/Public beta 2\.9\.0-beta\.2 for Windows/).first()).toBeVisible();
  // Every download link points at the published files on downloads.taren.se (details: downloads.spec.ts).
  for (const href of await page.locator('a[href*="downloads.taren.se"]').evaluateAll((els) => els.map((e) => e.getAttribute('href'))))
    expect(href).toMatch(/^https:\/\/downloads\.taren\.se\/lumen-capture\/beta\/2\.9\.0-beta\.2\/LumenCapture-2\.9\.0-beta\.2-(Setup\.exe|portable\.zip)$/);
  // Structured data: SoftwareApplication now that people can get it, with the installer as downloadUrl.
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
  expect(ld).toContain('SoftwareApplication');
  expect(ld).toContain('LumenCapture-2.9.0-beta.2-Setup.exe');
});

test('desktop products use desktop frames everywhere', async ({ page }) => {
  await page.goto('/products/lumen-capture/');
  await expect(page.locator('.phone')).toHaveCount(0);
  expect(await page.locator('.desktop').count()).toBeGreaterThanOrEqual(1 + 3 + 8); // hero + steps + gallery
  // Screenshots load and keep their landscape aspect ratio.
  const ratios = await page.locator('#screenshots .desktop img').evaluateAll((imgs) =>
    (imgs as HTMLImageElement[]).map((i) => i.getBoundingClientRect().width / i.getBoundingClientRect().height),
  );
  for (const r of ratios) expect(r).toBeCloseTo(1000 / 660, 1);
});

test('the lightbox works for desktop screenshots', async ({ page }) => {
  await page.goto('/products/lumen-capture/');
  await page.locator('#screenshots .shot-link').nth(2).click();
  const dialog = page.locator('#screenshots dialog[data-lightbox]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lb-count]')).toHaveText('3 / 8');
  await expect(dialog.locator('[data-lb-caption]')).toContainText('2.5');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('catalogue order: Lumen Capture first (full-width stage), then PDF Studio, then Pulse Garden', async ({ page }) => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/products/');
    const stage = page.locator('main article.showcase');
    await expect(stage).toHaveCount(1);
    await expect(stage).toHaveAttribute('data-accent', 'lumen-capture');
    const cards = await page.locator('main [data-product-card]').evaluateAll((els) => els.map((e) => e.getAttribute('data-product-card')));
    expect(cards).toEqual(['pdfstudio', 'pulse-garden']);
    // Visual order matches: the stage is above both cards, and it is the widest (most prominent) item.
    const s = (await stage.boundingBox())!;
    for (const slug of ['pdfstudio', 'pulse-garden']) {
      const c = (await page.locator(`[data-product-card="${slug}"]`).boundingBox())!;
      expect(c.y).toBeGreaterThan(s.y);
      expect(s.width).toBeGreaterThanOrEqual(c.width);
    }
    await expect(page.locator('.draft-pill')).toHaveCount(0);
  }
});

test('homepage features Lumen Capture (hero card, stage and mobile menu) and lists the other two', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const teaser = page.locator('.hero [data-teaser]');
  await expect(teaser).toHaveAttribute('data-teaser', 'lumen-capture');
  await expect(teaser).toContainText('Beta');
  await expect(teaser).toHaveAttribute('href', '/products/lumen-capture/');
  await expect(page.locator('main article.showcase')).toHaveAttribute('data-accent', 'lumen-capture');
  const cards = await page.locator('main [data-product-card]').evaluateAll((els) => els.map((e) => e.getAttribute('data-product-card')));
  expect(cards).toEqual(['pdfstudio', 'pulse-garden']);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('dialog#mobile-nav [data-teaser]')).toHaveAttribute('data-teaser', 'lumen-capture');
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const slug of ['lumen-capture', 'pdfstudio', 'pulse-garden']) expect(xml).toContain(`/products/${slug}/`);
});

test('no download or installer link anywhere except the published Lumen Capture beta', async ({ page }) => {
  // Lumen Capture's own page links exactly its two published files (downloads.spec.ts, apps.spec.ts above).
  for (const path of ['/', '/products/', '/products/pdfstudio/', '/products/pulse-garden/', '/support/']) {
    await page.goto(path);
    expect(await page.getByRole('link', { name: /download|installer|get it on|app store|testflight/i }).count(), path).toBe(0);
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    for (const h of hrefs) expect(h, path).not.toMatch(/\.(exe|msi|msix|zip|dmg|ipa|apk)(\?|$)|apps\.apple\.com|testflight|microsoft\.com\/store/i);
  }
});

test.describe('PDF Studio', () => {
  test('page is a public, indexable information page with an honest 0.9.0 preview status and no download', async ({ page }) => {
    const res = await page.goto('/products/pdfstudio/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText('PDF Studio');
    await expect(page.locator('[data-draft-banner]')).toHaveCount(0);
    expect(await page.locator('meta[name=robots]').getAttribute('content')).toBe('index, follow');
    expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBe('https://taren.se/products/pdfstudio/');
    for (const json of await page.locator('script[type="application/ld+json"]').allTextContents()) expect(json).not.toContain('SoftwareApplication');
    // Honest status, no download or release language.
    await expect(page.getByText(/0\.9\.0 is an unsigned development preview/)).toBeVisible();
    expect(await page.getByRole('link', { name: /download/i }).count()).toBe(0);
    expect(await page.getByRole('button', { name: /download/i }).count()).toBe(0);
    const text = await page.locator('main').innerText();
    // Positive release claims only — honest negations such as "has not been released" are fine.
    for (const banned of [/available now/i, /out now/i, /\bis (now )?released\b/i, /PDF\/A compliant/i, /Acrobat/i, /\bAI\b/]) expect(text).not.toMatch(banned);
    expect(text).not.toMatch(/command-line|pdfstudio CLI/i); // developer-only tool is not advertised
  });

  test('all sections render from verified data', async ({ page }) => {
    await page.goto('/products/pdfstudio/');
    await expect(page.locator('.facts dt')).toHaveCount(8);
    await expect(page.locator('.steps > li')).toHaveCount(3);
    await expect(page.locator('.feature')).toHaveCount(6);
    await expect(page.locator('#screenshots .shot-link')).toHaveCount(10);
    const states = await page.locator('.timeline > li').evaluateAll((li) => li.map((l) => (l as HTMLElement).dataset.state));
    expect(states.slice(-2)).toEqual(['next', 'planned']);
    expect(states.filter((s) => s === 'done')).toHaveLength(6);
    await expect(page.locator('[data-before-release] li')).toHaveCount(5);
    await expect(page.getByRole('heading', { name: 'What PDF Studio needs' })).toBeVisible();
    await expect(page.locator('.reqs dt')).toHaveCount(6);
    await expect(page.getByRole('heading', { name: 'Made by Taren' })).toBeVisible();
    await expect(page.locator('.attribution img[alt*="About PDF Studio"]')).toHaveCount(1);
    // PDF Studio's own app icon beside the title, visible and loaded — never the Taren symbol.
    const heroIcon = page.locator('#product-title').locator('xpath=ancestor::section[1]').locator('picture img[alt^="PDF Studio app icon"]').first();
    await expect(heroIcon).toBeVisible();
    await expect.poll(() => heroIcon.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await heroIcon.getAttribute('src')).toMatch(/\/_astro\/icon\./);
  });

  test("the product card carries PDF Studio's own icon, hidden over the desktop screenshot", async ({ page }) => {
    await page.goto('/products/');
    const card = page.locator('[data-product-card="pdfstudio"]');
    await expect(card.locator('img.media-icon')).toHaveCount(1);
    expect(await card.locator('img.media-icon').getAttribute('src')).toMatch(/\/_astro\/icon\./);
    // Desktop cards show the app screenshot; ProductMedia hides the floating icon so it never covers the capture.
    await expect(card.locator('img.media-icon')).toBeHidden();
    await expect(card.locator('.media-phone').first()).toBeVisible();
  });

  test('every screenshot loads in a desktop frame at the right ratio', async ({ page }) => {
    await page.goto('/products/pdfstudio/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    // Gallery items load lazily as the gallery is swiped; swipe through it like a visitor would.
    await page.locator('#screenshots .gallery').evaluate(async (g) => {
      g.scrollIntoView({ block: 'center', behavior: 'instant' });
      for (let x = 0; x <= g.scrollWidth; x += 300) {
        g.scrollTo({ left: x, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 80));
      }
    });
    await page.waitForLoadState('networkidle');
    const imgs = await page.locator('main .desktop img').evaluateAll((all) =>
      (all as HTMLImageElement[]).map((i) => ({ ok: i.complete && i.naturalWidth > 0, r: i.getBoundingClientRect().width / i.getBoundingClientRect().height })),
    );
    expect(imgs.length).toBeGreaterThanOrEqual(1 + 3 + 10 + 1);
    for (const i of imgs) {
      expect(i.ok).toBe(true);
      expect(i.r).toBeCloseTo(1000 / 660, 1);
    }
  });

  test('lightbox opens, navigates and returns focus', async ({ page }) => {
    await page.goto('/products/pdfstudio/');
    const links = page.locator('#screenshots .shot-link');
    await links.nth(3).click();
    const dialog = page.locator('#screenshots dialog[data-lightbox]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-lb-count]')).toHaveText('4 / 10');
    await expect(dialog.locator('[data-lb-caption]')).toHaveText('Ctrl+K command search');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[data-lb-count]')).toHaveText('5 / 10');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(links.nth(4)).toBeFocused();
  });

  test('uses its own accent colours', async ({ page }) => {
    await page.goto('/products/pdfstudio/');
    const accent = await page.locator('[data-accent="pdfstudio"]').first().evaluate((el) => getComputedStyle(el).getPropertyValue('--accent').trim());
    expect(accent).toBe('#a48bff');
  });

  for (const [w, h] of [[320, 640], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [2560, 1440], [844, 390]] as const) {
    test(`responsive at ${w}×${h}: no overflow, readable, nothing off-screen`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/products/pdfstudio/');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const offscreen = await page.evaluate(() =>
        [...document.querySelectorAll('main *')]
          .filter((el) => !el.closest('.gallery') && !el.closest('svg') && !el.closest('[aria-hidden="true"]') && !el.closest('dialog'))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
          }).length,
      );
      expect(offscreen).toBe(0);
      const minFont = await page.evaluate(() =>
        // Body copy; the 11–12 px uppercase eyebrow labels are a deliberate label style.
        Math.min(...[...document.querySelectorAll('main p:not(.eyebrow), main dd, main li')].map((e) => parseFloat(getComputedStyle(e).fontSize))),
      );
      expect(minFont).toBeGreaterThanOrEqual(12);
    });
  }

  test('passes axe (WCAG 2.2 AA)', async ({ page }) => {
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page'];
    await page.goto('/products/pdfstudio/');
    const results = await new AxeBuilder({ page: page as unknown as AxePage }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.impact} ${v.id}`)).toEqual([]);
  });
});

for (const [w, h] of [[375, 812], [1440, 900]] as const) {
  test.describe(`visual PDF Studio ${w}px`, () => {
    test.use({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    test('first screen', async ({ page }) => {
      await page.goto('/products/pdfstudio/');
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`pdfstudio-${w}.png`);
    });
  });
}

// Taren 2.2 final polish: hero prominence and gallery navigation for desktop apps.
for (const slug of ['lumen-capture', 'pdfstudio']) {
  test.describe(`${slug} hero`, () => {
    test('on phones the screenshot follows the tagline, before the description', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/products/${slug}/`);
      const order = await page.evaluate(() =>
        ['.hero-head', '.hero-media', '.hero-body'].map((s) => document.querySelector(s)!.getBoundingClientRect().top),
      );
      expect(order[0]).toBeLessThan(order[1]!);
      expect(order[1]).toBeLessThan(order[2]!);
      const shot = (await page.locator('.hero-media .desktop').boundingBox())!;
      expect(shot.x).toBeGreaterThanOrEqual(0);
      expect(shot.x + shot.width).toBeLessThanOrEqual(390);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    });

    for (const [w, h] of [[1024, 768], [1440, 900], [1920, 1080]] as const) {
      test(`at ${w}px the screenshot is large, uncropped and level with the title`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(`/products/${slug}/`);
        const img = page.locator('.hero-media .desktop img');
        const box = (await img.boundingBox())!;
        const title = (await page.locator('h1').boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(w >= 1440 ? 600 : 480);
        expect(box.width / box.height).toBeCloseTo(1000 / 660, 1); // aspect ratio preserved
        expect(box.x + box.width).toBeLessThanOrEqual(w);
        expect(box.y).toBeLessThan(title.y + title.height); // starts beside the title, not below the copy
        expect(box.y + box.height).toBeLessThanOrEqual(h); // fully in the first viewport
        // A product icon beside a long title is never squeezed.
        for (const icon of await page.locator('.hero-head picture img').all()) {
          const ib = (await icon.boundingBox())!;
          expect(ib.width).toBeCloseTo(ib.height, 0);
        }
        // The frame does not clip the image.
        expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth > 0 && i.complete)).toBe(true);
      });
    }
  });
}

test.describe('gallery navigation', () => {
  test('arrow buttons page through the screenshots and report the position', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/products/pdfstudio/');
    const root = page.locator('#screenshots [data-gallery]');
    const prev = root.getByRole('button', { name: 'Previous screenshots' });
    const next = root.getByRole('button', { name: 'Next screenshots' });
    const status = root.locator('[data-gallery-status]');
    await root.scrollIntoViewIfNeeded();
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toHaveAttribute('aria-disabled', 'false');
    await expect(status).toHaveText('1–2 of 10');
    await next.click();
    await expect(status).toHaveText('2–3 of 10');
    await expect(prev).toHaveAttribute('aria-disabled', 'false');
    // Keyboard: the buttons are reachable and keep focus at the end of the row.
    await next.focus();
    for (let i = 0; i < 12; i++) await page.keyboard.press('Enter');
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toBeFocused();
    await expect(status).toHaveText('9–10 of 10');
    await expect(root).toHaveAttribute('data-at-end', '');
    await prev.click();
    await expect(root).not.toHaveAttribute('data-at-end', '');
  });

  test('touch: swiping updates the indicator; the lightbox still opens', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto('/products/lumen-capture/');
    const root = page.locator('#screenshots [data-gallery]');
    await root.scrollIntoViewIfNeeded();
    await expect(root.locator('.hint-touch')).toBeVisible();
    await expect(root.locator('[data-gallery-status]')).toHaveText('1 of 8');
    await root.locator('.gallery').evaluate((g) => g.scrollBy({ left: g.clientWidth, behavior: 'instant' }));
    await expect(root.locator('[data-gallery-status]')).not.toHaveText('1 of 8');
    await root.locator('.shot-link').first().scrollIntoViewIfNeeded();
    await root.locator('.shot-link').first().tap();
    await expect(root.locator('dialog[data-lightbox]')).toBeVisible();
    await ctx.close();
  });

  test('reduced motion: arrows jump instantly instead of animating', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/products/pdfstudio/');
    const gallery = page.locator('#screenshots .gallery');
    await gallery.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Next screenshots' }).click();
    // Instant: scrolled on the very next frame, without waiting for a smooth-scroll animation.
    const left = await gallery.evaluate(() => new Promise<number>((r) => requestAnimationFrame(() => r(document.querySelector('#screenshots .gallery')!.scrollLeft))));
    expect(left).toBeGreaterThan(400);
    await ctx.close();
  });

  test('without JavaScript the gallery still lists every screenshot and hides the arrows', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/products/pdfstudio/');
    await expect(page.locator('#screenshots [data-gallery-status]')).toHaveText('10 screenshots');
    await expect(page.locator('#screenshots [data-gallery-nav]')).toBeHidden();
    await expect(page.locator('#screenshots .shot-link')).toHaveCount(10);
    await ctx.close();
  });
});

// Taren 2.3 release matrix: both desktop apps at every release size.
test.describe('release matrix (desktop apps)', () => {
  for (const slug of ['lumen-capture', 'pdfstudio']) {
    for (const [w, h] of RELEASE_SIZES) {
      test(`${slug} at ${w}×${h}: no overflow, broken images, tiny targets or errors`, async ({ page }) => {
        const errors = watchErrors(page);
        await page.setViewportSize({ width: w, height: h });
        await page.goto(`/products/${slug}/`);
        await scrollThrough(page);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        const broken = await page.evaluate(() =>
          [...document.images].filter((i) => !i.closest('dialog')).filter((i) => i.loading !== 'lazy' || i.getBoundingClientRect().top < innerHeight).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc),
        );
        expect(broken).toEqual([]);
        const small = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('a, button')]
            .filter((e) => !e.closest('.prose-taren') && !e.closest('.text-sm') && !e.closest('dialog:not([open])') && !e.classList.contains('sr-only'))
            .map((e) => ({ t: e.textContent?.trim().slice(0, 30), r: e.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && (r.height < 24 || r.width < 24))
            .map(({ t, r }) => `${t} ${Math.round(r.width)}x${Math.round(r.height)}`),
        );
        expect(small).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  }

  test('Lumen Capture passes axe (WCAG 2.2 AA)', async ({ page }) => {
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page'];
    await page.goto('/products/lumen-capture/');
    const results = await new AxeBuilder({ page: page as unknown as AxePage }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.impact} ${v.id}`)).toEqual([]);
  });
});
