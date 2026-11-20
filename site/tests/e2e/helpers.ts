import type { Page } from '@playwright/test';

export const PAGES = [
  { path: '/', h1: /Software built with curiosity/ },
  { path: '/products/', h1: /Selected work/ },
  { path: '/products/lumen-capture/', h1: /Lumen Capture/ },
  { path: '/products/pdfstudio/', h1: /PDF Studio/ },
  { path: '/products/pulse-garden/', h1: /Pulse Garden/ },
  { path: '/products/mineclone/', h1: /MineClone/ },
  { path: '/studio/', h1: /independent software studio/i },
  { path: '/support/', h1: /Enjoying what we’re building/ },
  { path: '/privacy/', h1: /Privacy/ },
  { path: '/terms/', h1: /Terms/ },
] as const;

/** The same pages in Swedish (Taren 2.6). Every English page has exactly one Swedish twin under /sv/. */
export const PAGES_SV = [
  { path: '/sv/', h1: /Mjukvara byggd med nyfikenhet/ },
  { path: '/sv/products/', h1: /Utvalda projekt/ },
  { path: '/sv/products/lumen-capture/', h1: /Lumen Capture/ },
  { path: '/sv/products/pdfstudio/', h1: /PDF Studio/ },
  { path: '/sv/products/pulse-garden/', h1: /Pulse Garden/ },
  { path: '/sv/products/mineclone/', h1: /MineClone/ },
  { path: '/sv/studio/', h1: /oberoende mjukvarustudio/i },
  { path: '/sv/support/', h1: /Gillar du det vi bygger/ },
  { path: '/sv/privacy/', h1: /Integritet/ },
  { path: '/sv/terms/', h1: /Användarvillkor/ },
] as const;

/** Every public page in every language. */
export const ALL_PAGES = [...PAGES, ...PAGES_SV] as const;

export const VIEWPORTS = [320, 375, 390, 768, 1024, 1440, 1920] as const;

/** Extra sizes beyond the required widths: ultrawide and landscape phones. */
export const EXTRA_SIZES = [
  [2560, 1440],
  [844, 390],
  [932, 430],
] as const;

/** The exact release-test matrix (Taren 2.3): phones, tablets, laptops, wide and landscape phones. */
export const RELEASE_SIZES = [
  [320, 568],
  [375, 812],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
  [844, 390],
  [932, 430],
] as const;

export const KOFI = 'https://ko-fi.com/taren';

/** Collects console errors, page errors and failed same-origin requests. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  const own = (url: string) => {
    try {
      return new URL(url).origin === new URL(page.url() || 'http://localhost').origin || url.startsWith('http://localhost');
    } catch {
      return false;
    }
  };
  page.on('requestfailed', (r) => {
    if (own(r.url())) errors.push(`requestfailed: ${r.url()}`);
  });
  page.on('response', (r) => {
    if (own(r.url()) && r.status() >= 400 && r.request().resourceType() !== 'document')
      errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return errors;
}

/** Scrolls through the page so lazy images load, then returns to the top. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(300, innerHeight / 2)) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForLoadState('networkidle');
}
