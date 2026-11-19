#!/usr/bin/env node
/**
 * Spacing / scroll-depth measurement for the Taren website (UX audit, docs/TAREN_SPACING_UX_AUDIT.md).
 *
 *   node scripts/measure-spacing.mjs [baseUrl] [variant] [outDir]
 *   baseUrl: default https://taren.se · variant: A (as built) | B | C · outDir: screenshots (optional)
 *
 * Variants B, C and D (B+: B plus content order/mobile footer) are EXPERIMENTS: an override stylesheet is injected into the real pages in an isolated
 * browser (CSP bypassed only inside that browser). Nothing on the site or in the source changes.
 *
 * Method (per page × viewport, reduced motion, fonts loaded, page scrolled once so lazy images render):
 *  - pageHeight: document.scrollingElement.scrollHeight; screens = pageHeight / viewport height.
 *  - footerScreens: footer top / viewport height (how many screens of scrolling until the footer starts).
 *  - hero: first top-level <section> in <main>; heroH in px and as % of the viewport.
 *  - heroOccupancy: height of the union of visible content inside the hero ÷ hero height.
 *  - firstBelowHero: top of the first content in the next section, in viewport heights from the page top
 *    (< 1.0 means it is visible without scrolling).
 *  - gaps: empty distance between the last content of a section and the first content of the next one.
 *  - unused%: share of page-height pixel rows (between header and footer) that contain no content.
 * "Content" = text line boxes (Range.getClientRects, widened to the element's line-height), non-decorative images/pictures/videos, buttons and links,
 * form controls, and bordered/filled panels narrower than 95 % of the viewport (cards). Decorative elements
 * (aria-hidden, the background rings, swooshes, grain) and full-width section backgrounds do NOT count as
 * content: whitespace that only shows decoration is reported as unused, which is a deliberately strict measure.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'https://taren.se';
const variant = (process.argv[3] ?? 'A').toUpperCase();
const outDir = process.argv[4];
if (outDir) mkdirSync(outDir, { recursive: true });

export const VIEWPORTS = [
  [375, 812],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
];
export const PAGES = ['/', '/products/', '/products/pulse-garden/', '/studio/', '/support/', '/privacy/', '/terms/'];

/** Experimental overrides: scale large vertical paddings/gaps and the homepage hero height. */
function variantCss(v) {
  if (v === 'A') return '';
  // D ("B+") = B spacing + content changes (featured product right after the hero, 2-column mobile footer).
  if (v === 'D')
    return (
      variantCss('B') +
      '@media (max-width:47.99rem){#site-footer>.container-x:first-child{grid-template-columns:1fr 1fr;column-gap:1.5rem;row-gap:2rem}' +
      '#site-footer>.container-x:first-child>:first-child{grid-column:1/-1}}'
    );
  const f = v === 'B' ? { big: 0.7, mid: 0.8 } : { big: 0.5, mid: 0.65 };
  const bps = [
    ['', null],
    ['sm\\:', '40rem'],
    ['md\\:', '48rem'],
    ['lg\\:', '64rem'],
  ];
  const sizes = [12, 14, 16, 20, 24, 28, 32];
  let css = '';
  for (const [prefix, min] of bps) {
    let rules = '';
    for (const n of sizes) {
      const rem = n * 0.25 * (n >= 20 ? f.big : f.mid);
      const r = `${rem.toFixed(3)}rem`;
      rules += `.${prefix}py-${n}{padding-top:${r}!important;padding-bottom:${r}!important}`;
      rules += `.${prefix}pt-${n}{padding-top:${r}!important}.${prefix}pb-${n}{padding-bottom:${r}!important}`;
      if (n >= 12) {
        rules += `main .${prefix}mt-${n}{margin-top:${r}!important}main .${prefix}mb-${n}{margin-bottom:${r}!important}`;
        rules += `main .${prefix}gap-${n}{row-gap:${r}!important}`;
      }
    }
    css += min ? `@media (min-width:${min}){${rules}}` : rules;
  }
  // Homepage hero: B keeps a tall, calm first screen; C sizes it to its content.
  css += v === 'B'
    ? '@media (min-width:64rem){.hero-grid{min-height:min(70dvh,46rem)!important}}'
    : '@media (min-width:64rem){.hero-grid{min-height:0!important}}';
  return css;
}

async function measure(page, vh) {
  return page.evaluate((vh) => {
    const isDecor = (el) => !!el.closest('[aria-hidden="true"], .hero-bg-rings, .grid-field, .hero-glow');
    const visible = (r) => r.width > 0 && r.height > 0;
    const sy = scrollY;
    const rects = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim() || !n.parentElement || isDecor(n.parentElement)) continue;
      const cs = getComputedStyle(n.parentElement);
      if (cs.visibility === 'hidden' || cs.display === 'none' || n.parentElement.closest('.sr-only, dialog:not([open])')) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      // Count the whole line box (line-height), not only the glyphs, so normal leading is not "unused".
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      for (const r of range.getClientRects()) {
        if (!visible(r)) continue;
        const pad = Math.max(0, (lh - r.height) / 2);
        rects.push([r.top + sy - pad, r.bottom + sy + pad]);
      }
    }
    for (const el of document.querySelectorAll('img, video, canvas, button, input, select, textarea, a')) {
      if (isDecor(el) || el.closest('dialog:not([open])')) continue;
      const r = el.getBoundingClientRect();
      if (visible(r) && getComputedStyle(el).visibility !== 'hidden') rects.push([r.top + sy, r.bottom + sy]);
    }
    for (const el of document.querySelectorAll('main *')) {
      if (isDecor(el)) continue;
      const r = el.getBoundingClientRect();
      if (!visible(r) || r.width > innerWidth * 0.95) continue;
      const cs = getComputedStyle(el);
      const filled = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none';
      const bordered = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
      if ((filled || bordered) && r.height > 24) rects.push([r.top + sy, r.bottom + sy]);
    }
    const H = document.scrollingElement.scrollHeight;
    const headerB = (document.querySelector('header')?.getBoundingClientRect().bottom ?? 0) + sy;
    const footer = document.querySelector('footer');
    const footerTop = footer ? footer.getBoundingClientRect().top + sy : H;
    const rows = new Uint8Array(Math.ceil(H) + 1);
    for (const [a, b] of rects) for (let y = Math.max(0, Math.floor(a)); y < Math.min(H, Math.ceil(b)); y++) rows[y] = 1;
    let empty = 0;
    for (let y = Math.floor(headerB); y < Math.floor(footerTop); y++) if (!rows[y]) empty++;
    const span = Math.max(1, Math.floor(footerTop) - Math.floor(headerB));

    // Top-level sections inside <main> (not nested in another section).
    const sections = [...document.querySelectorAll('main section')].filter((s) => !s.parentElement.closest('main section'));
    const contentBox = (el) => {
      let top = Infinity, bottom = -Infinity;
      const er = el.getBoundingClientRect();
      for (const [a, b] of rects) {
        if (a >= er.top + sy - 0.5 && b <= er.bottom + sy + 0.5) {
          top = Math.min(top, a);
          bottom = Math.max(bottom, b);
        }
      }
      return { top, bottom, boxTop: er.top + sy, boxBottom: er.bottom + sy };
    };
    const secs = sections.map((s) => ({ id: s.getAttribute('aria-labelledby') ?? s.id ?? s.className.slice(0, 20), ...contentBox(s) }));
    const hero = secs[0];
    const gaps = [];
    for (let i = 0; i + 1 < secs.length; i++) {
      if (secs[i + 1].top === Infinity || secs[i].bottom === -Infinity) continue;
      gaps.push(Math.round(secs[i + 1].top - secs[i].bottom));
    }
    const landmark = (sel) => {
      const el = document.querySelector(sel);
      return el ? +((el.getBoundingClientRect().top + sy) / vh).toFixed(2) : null;
    };
    return {
      pageHeight: Math.round(H),
      screens: +(H / vh).toFixed(2),
      footerScreens: +(footerTop / vh).toFixed(2),
      heroH: hero ? Math.round(hero.boxBottom - hero.boxTop) : null,
      heroPctVh: hero ? Math.round(((hero.boxBottom - hero.boxTop) / vh) * 100) : null,
      heroOccupancy: hero && hero.top !== Infinity ? Math.round(((hero.bottom - hero.top) / (hero.boxBottom - hero.boxTop)) * 100) : null,
      firstBelowHero: secs[1] && secs[1].top !== Infinity ? +(secs[1].top / vh).toFixed(2) : null,
      gaps,
      maxGap: gaps.length ? Math.max(...gaps) : 0,
      medianGap: gaps.length ? [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 0,
      unusedPct: Math.round((empty / span) * 100),
      landmarks: {
        featured: landmark('#work-title'),
        firstProduct: landmark('main [data-product-card], main article.showcase'),
        support: landmark('#support-cta-title'),
        kofi: landmark('main [data-kofi-link]'),
      },
    };
  }, vh);
}

const browser = await chromium.launch();
const results = [];
for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', bypassCSP: variant !== 'A' });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const css = variantCss(variant);
    if (css) await page.addStyleTag({ content: css });
    if (variant === 'D' && path === '/')
      await page.evaluate(() => {
        const what = document.querySelector('section[aria-labelledby="what-title"]');
        const work = document.querySelector('section[aria-labelledby="work-title"]');
        if (what && work) what.before(work);
      });
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(250);
    const m = await measure(page, h);
    results.push({ variant, path, viewport: `${w}x${h}`, ...m });
    if (outDir && ['/', '/products/'].includes(path) && ['390x844', '1440x900'].includes(`${w}x${h}`)) {
      const name = `${variant}-${path === '/' ? 'home' : 'products'}-${w}`;
      await page.screenshot({ path: `${outDir}/${name}-full.png`, fullPage: true });
      await page.screenshot({ path: `${outDir}/${name}-first.png` });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
const out = `spacing-${variant}.json`;
writeFileSync(outDir ? `${outDir}/${out}` : out, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
