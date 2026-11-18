/**
 * Creates website derivatives of desktop screenshots at the 1000:660 frame ratio WITHOUT cropping,
 * stretching or altering the originals:
 *   1. pad the shorter dimension symmetrically to reach exactly 1000:660, using the screenshot's own
 *      edge colour (median of the outermost pixel row/column on that side), so the padding reads as a
 *      continuation of the window's title bar / status bar;
 *   2. downscale (never upscale) to 1000×660 with Lanczos3;
 *   3. write lossless WebP next to the original as <name>.web.webp.
 *
 * Usage (from site/): node scripts/fit-desktop-screenshots.mjs src/assets/products/pdfstudio
 * Prints a JSON report of every file (source size, padding, output size and bytes).
 */
import sharp from 'sharp';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TARGET_W = 1000;
const TARGET_H = 660;
const RATIO = TARGET_W / TARGET_H;

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function edgeColour(file, side, w, h) {
  const region =
    side === 'top' ? { left: 0, top: 0, width: w, height: 1 }
    : side === 'bottom' ? { left: 0, top: h - 1, width: w, height: 1 }
    : side === 'left' ? { left: 0, top: 0, width: 1, height: h }
    : { left: w - 1, top: 0, width: 1, height: h };
  const { data, info } = await sharp(file).extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const ch = (c) => median(Array.from({ length: n }, (_, i) => data[i * 3 + c]));
  return { r: ch(0), g: ch(1), b: ch(2), alpha: 1 };
}

const dir = process.argv[2];
if (!dir) throw new Error('usage: node scripts/fit-desktop-screenshots.mjs <dir>');
const report = [];
for (const name of readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
  const src = join(dir, name);
  const { width: w, height: h } = await sharp(src).metadata();
  if (w < TARGET_W) throw new Error(`${name}: ${w}px wide — would need upscaling`);
  let pad = { top: 0, bottom: 0, left: 0, right: 0 };
  let colours = {};
  if (w / h > RATIO) {
    const total = Math.round(w / RATIO) - h; // add height
    pad.top = Math.floor(total / 2);
    pad.bottom = total - pad.top;
    colours = { top: await edgeColour(src, 'top', w, h), bottom: await edgeColour(src, 'bottom', w, h) };
  } else if (w / h < RATIO) {
    const total = Math.round(h * RATIO) - w; // add width
    pad.left = Math.floor(total / 2);
    pad.right = total - pad.left;
    colours = { left: await edgeColour(src, 'left', w, h), right: await edgeColour(src, 'right', w, h) };
  }
  // Pad each side with its own edge colour (two extend passes keep the colours independent).
  let img = sharp(src).removeAlpha();
  let buf = await img.toBuffer();
  for (const side of ['top', 'bottom', 'left', 'right']) {
    if (!pad[side]) continue;
    buf = await sharp(buf).extend({ [side]: pad[side], background: colours[side] }).toBuffer();
  }
  const out = join(dir, name.replace(/\.png$/, '.web.webp'));
  await sharp(buf).resize(TARGET_W, TARGET_H, { kernel: 'lanczos3', fit: 'fill' }).webp({ lossless: true, effort: 6 }).toFile(out);
  const padded = await sharp(buf).metadata();
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  report.push({
    source: name,
    sourceSize: `${w}x${h}`,
    padding: pad,
    padColours: Object.fromEntries(Object.entries(colours).map(([k, v]) => [k, hex(v)])),
    padded: `${padded.width}x${padded.height}`,
    paddedRatio: +(padded.width / padded.height).toFixed(4),
    output: name.replace(/\.png$/, '.web.webp'),
    outputSize: `${TARGET_W}x${TARGET_H}`,
    bytes: statSync(out).size,
  });
}
console.log(JSON.stringify(report, null, 1));
