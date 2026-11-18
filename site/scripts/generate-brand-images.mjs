/**
 * Regenerates the interim icons and the default social image from HTML using the
 * pre-installed Playwright Chromium. Run: node scripts/generate-brand-images.mjs
 * Replace with official brand exports when available (docs/DESIGN_SYSTEM.md).
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const font = (p) => readFileSync(`${root}node_modules/@fontsource-variable/${p}`).toString('base64');
const sora = font('sora/files/sora-latin-wght-normal.woff2');
const inter = font('inter/files/inter-latin-wght-normal.woff2');
const fontCss = `
@font-face{font-family:Sora;src:url(data:font/woff2;base64,${sora}) format('woff2');font-weight:100 800}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}`;

const og = `<html><head><style>${fontCss}
body{width:1200px;height:630px;background:#0A1020;color:#F4F7FF;font-family:Inter;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(168,179,207,.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(168,179,207,.07) 1px,transparent 1px);background-size:60px 60px;-webkit-mask-image:radial-gradient(ellipse 70% 70% at 30% 50%,#000 30%,transparent 80%)}
svg{position:absolute;right:-260px;top:-150px;width:930px;height:930px}
.c{position:absolute;left:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.mark{font-family:Sora;font-weight:600;letter-spacing:.32em;font-size:30px}
h1{font-family:Sora;font-weight:600;font-size:84px;line-height:1;letter-spacing:-.045em;margin-top:56px;max-width:760px}
span.a{background:linear-gradient(100deg,#8AE6FF,#35D5FF 35%,#B394FF);-webkit-background-clip:text;color:transparent}
p{margin-top:30px;font-size:24px;color:#A8B3CF}
</style></head><body><div class="grid"></div>
<svg viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#35D5FF" stop-opacity=".6"/><stop offset="1" stop-color="#8D5BFF" stop-opacity=".15"/></linearGradient><radialGradient id="r"><stop offset="0" stop-color="#35D5FF" stop-opacity=".35"/><stop offset="1" stop-color="#35D5FF" stop-opacity="0"/></radialGradient></defs>
<circle cx="400" cy="400" r="150" fill="url(#r)"/><circle cx="400" cy="400" r="120" fill="none" stroke="url(#g)"/><circle cx="400" cy="400" r="210" fill="none" stroke="rgba(168,179,207,.16)"/><circle cx="400" cy="400" r="300" fill="none" stroke="url(#g)" stroke-dasharray="2 10"/><circle cx="400" cy="400" r="390" fill="none" stroke="rgba(168,179,207,.1)"/>
<circle cx="296" cy="340" r="5" fill="#35D5FF"/><circle cx="296" cy="340" r="14" fill="#35D5FF" opacity=".18"/><circle cx="660" cy="250" r="4" fill="#B394FF"/></svg>
<div class="c"><div class="mark">TAREN</div><h1>Software built with <span class="a">curiosity.</span></h1><p>Independent software studio · Sweden</p></div></body></html>`;

const icon = (size) => `<html><head><style>${fontCss}body{width:${size}px;height:${size}px;background:transparent}</style></head><body>
${readFileSync(`${root}public/favicon.svg`, 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
async function shot(html, w, h, out, omitBackground = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'png', omitBackground });
  writeFileSync(`${root}public/${out}`, buf);
  return buf;
}
await shot(og, 1200, 630, 'og/taren.png');
await shot(icon(180), 180, 180, 'apple-touch-icon.png');
await shot(icon(192), 192, 192, 'icon-192.png');
await shot(icon(512), 512, 512, 'icon-512.png');
const png32 = await shot(icon(32), 32, 32, 'favicon-32.png', true);
await browser.close();

// favicon.ico containing a single 32×32 PNG image.
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
writeFileSync(`${root}public/favicon.ico`, Buffer.concat([header, png32]));
console.log('Brand images generated.');
