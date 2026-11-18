/**
 * Builds every brand derivative from the official masters in brand/masters/.
 * Run from site/:  node scripts/generate-brand-images.mjs
 *
 * Masters (owner-supplied, never modified):
 *   brand/masters/taren-icon.png        T symbol, colour, transparent
 *   brand/masters/taren-logo-light.png  symbol + dark-navy wordmark — for LIGHT backgrounds
 *   brand/masters/taren-logo-dark.png   solid black logo — for LIGHT backgrounds (not used: invisible on dark)
 *
 * Derivatives:
 *   src/assets/brand/taren-logo-on-dark.png  full logo for the dark site: the navy wordmark letters are
 *                                            recoloured to the site's text colour (#F4F7FF); the symbol and
 *                                            the cyan accent are untouched. Optimised further by astro:assets.
 *   src/assets/brand/taren-symbol.png        T symbol, tightly cropped (compact branding)
 *   public/favicon.ico (16/32/48), public/favicon-32.png, public/apple-touch-icon.png,
 *   public/icon-192.png, public/icon-512.png, public/og/taren.png
 *
 * Processing: invisible stray pixels left by background removal (alpha ≤ 21, more than 4px away from
 * the artwork) are cleared; alpha and aspect ratio are otherwise preserved exactly.
 */
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const p = (rel) => `${root}${rel}`;
const NAVY_BG = { r: 10, g: 16, b: 32, alpha: 1 }; // --color-ink
const TEXT = [244, 247, 255]; // --color-text

async function loadRaw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** Clears faint pixels that are not within `radius` px of solid artwork (separable max filter). */
function clearStrays(img, radius = 4, solidAlpha = 128) {
  const { data, w, h } = img;
  const solid = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = data[i * 4 + 3] >= solidAlpha ? 1 : 0;
  const rows = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = Math.max(0, x - radius); k <= Math.min(w - 1, x + radius) && !v; k++) v = solid[y * w + k];
      rows[y * w + x] = v;
    }
  let cleared = 0;
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      let v = 0;
      for (let k = Math.max(0, y - radius); k <= Math.min(h - 1, y + radius) && !v; k++) v = rows[k * w + x];
      const i = (y * w + x) * 4;
      if (!v && data[i + 3] > 0) {
        if (data[i + 3] > 21) throw new Error(`Unexpected visible pixel outside artwork at ${x},${y}`);
        data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
        cleared++;
      }
    }
  return cleared;
}

/** Recolours low-chroma dark pixels (the navy wordmark) to the site text colour, keeping alpha. */
function recolourWordmark(img) {
  const { data } = img;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (chroma < 60 && lum < 80) {
      [data[i], data[i + 1], data[i + 2]] = TEXT;
      n++;
    }
  }
  return n;
}

function alphaBox({ data, w, h }) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > 0) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

const toSharp = ({ data, w, h }) => sharp(data, { raw: { width: w, height: h, channels: 4 } });
// Lossless, full colour (no palette quantisation: the gradients must not band).
const pngOpts = { compressionLevel: 9, adaptiveFiltering: true, palette: false };

mkdirSync(p('src/assets/brand'), { recursive: true });

// ---- Full logo for dark backgrounds
const logo = await loadRaw(p('brand/masters/taren-logo-light.png'));
const logoCleared = clearStrays(logo);
const recoloured = recolourWordmark(logo);
const logoBox = alphaBox(logo);
const pad = 8;
await toSharp(logo)
  .extract(logoBox)
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png(pngOpts)
  .toFile(p('src/assets/brand/taren-logo-on-dark.png'));

// ---- Symbol
const icon = await loadRaw(p('brand/masters/taren-icon.png'));
const iconCleared = clearStrays(icon);
const iconBox = alphaBox(icon);
const side = Math.max(iconBox.width, iconBox.height) + 2 * pad;
const symbolBuf = await toSharp(icon)
  .extract(iconBox)
  .extend({
    top: Math.floor((side - iconBox.height) / 2),
    bottom: Math.ceil((side - iconBox.height) / 2),
    left: Math.floor((side - iconBox.width) / 2),
    right: Math.ceil((side - iconBox.width) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png(pngOpts)
  .toBuffer();
writeFileSync(p('src/assets/brand/taren-symbol.png'), symbolBuf);

// ---- Favicons (transparent: the gradient reads on light and dark browser chrome)
const favicon = (size) => sharp(symbolBuf).resize(size, size, { kernel: 'lanczos3' }).png(pngOpts).toBuffer();
const ico = await Promise.all([16, 32, 48].map(favicon));
writeFileSync(p('public/favicon-32.png'), ico[1]);
const header = Buffer.alloc(6 + 16 * ico.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(ico.length, 4);
let offset = header.length;
ico.forEach((buf, i) => {
  const size = [16, 32, 48][i];
  const e = 6 + 16 * i;
  header.writeUInt8(size, e);
  header.writeUInt8(size, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(buf.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += buf.length;
});
writeFileSync(p('public/favicon.ico'), Buffer.concat([header, ...ico]));

// ---- App icons (opaque navy tile: iOS and Android fill transparency unpredictably)
async function appIcon(size, out) {
  const inner = Math.round(size * 0.74);
  const glyph = await sharp(symbolBuf).resize(inner, inner, { kernel: 'lanczos3' }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: NAVY_BG } })
    .composite([{ input: glyph, gravity: 'center' }])
    .png(pngOpts)
    .toFile(p(`public/${out}`));
}
await appIcon(180, 'apple-touch-icon.png');
await appIcon(192, 'icon-192.png');
await appIcon(512, 'icon-512.png');

// ---- Social sharing image (1200×630), rendered with the site fonts and the official logo
const font = (f) => readFileSync(p(`node_modules/@fontsource-variable/${f}`)).toString('base64');
const logoData = readFileSync(p('src/assets/brand/taren-logo-on-dark.png')).toString('base64');
const og = `<html><head><style>
@font-face{font-family:Sora;src:url(data:font/woff2;base64,${font('sora/files/sora-latin-wght-normal.woff2')}) format('woff2');font-weight:100 800}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font('inter/files/inter-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0A1020;color:#F4F7FF;font-family:Inter;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(168,179,207,.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(168,179,207,.07) 1px,transparent 1px);background-size:60px 60px;-webkit-mask-image:radial-gradient(ellipse 70% 70% at 30% 50%,#000 30%,transparent 80%)}
.glow{position:absolute;right:-180px;top:-120px;width:820px;height:820px;border-radius:50%;background:radial-gradient(circle,rgba(53,213,255,.16),rgba(141,91,255,.08) 45%,transparent 70%)}
svg{position:absolute;right:-250px;top:-150px;width:930px;height:930px}
.c{position:absolute;left:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
img{height:96px;width:auto;align-self:flex-start;margin-left:-8px}
h1{font-family:Sora;font-weight:600;font-size:76px;line-height:1.02;letter-spacing:-.045em;margin-top:52px;max-width:780px}
span.a{background:linear-gradient(100deg,#8AE6FF,#35D5FF 35%,#B394FF);-webkit-background-clip:text;color:transparent}
p{margin-top:26px;font-size:24px;color:#A8B3CF}
</style></head><body><div class="grid"></div><div class="glow"></div>
<svg viewBox="0 0 800 800"><circle cx="400" cy="400" r="210" fill="none" stroke="rgba(168,179,207,.14)"/><circle cx="400" cy="400" r="300" fill="none" stroke="rgba(53,213,255,.35)" stroke-dasharray="2 10"/><circle cx="400" cy="400" r="390" fill="none" stroke="rgba(168,179,207,.1)"/></svg>
<div class="c"><img src="data:image/png;base64,${logoData}" alt=""><h1>Software built with <span class="a">curiosity.</span></h1><p>Independent software studio · Sweden</p></div></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(og);
await page.evaluate(() => document.fonts.ready);
const ogPng = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(ogPng).png(pngOpts).toFile(p('public/og/taren.png'));

console.log(
  JSON.stringify(
    { logo: { cleared: logoCleared, recoloured, box: logoBox }, symbol: { cleared: iconCleared, box: iconBox, side } },
    null,
    1,
  ),
);
