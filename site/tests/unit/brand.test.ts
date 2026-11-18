import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(__dirname, '../..');
const meta = (p: string) => sharp(resolve(root, p)).metadata();

describe('official brand assets', () => {
  it('keeps the three owner-supplied masters', () => {
    for (const f of ['taren-icon.png', 'taren-logo-dark.png', 'taren-logo-light.png']) {
      expect(existsSync(resolve(root, 'public/branding', f)), f).toBe(true);
    }
  });

  it('derives a transparent, full-colour logo for dark backgrounds with the master aspect ratio', async () => {
    const m = await meta('src/assets/brand/taren-logo-on-dark.png');
    expect(m.hasAlpha).toBe(true);
    expect(m.channels).toBe(4);
    expect(m.isPalette).toBe(false); // no palette quantisation
    // Artwork box of the master is 1937×608 (+8px padding on each side).
    expect(m.width! / m.height!).toBeCloseTo((1937 + 16) / (608 + 16), 3);
  });

  it('the dark-background logo wordmark is light (readable on #0A1020)', async () => {
    const { data, info } = await sharp(resolve(root, 'src/assets/brand/taren-logo-on-dark.png')).raw().toBuffer({ resolveWithObject: true });
    let dark = 0;
    let opaque = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i + 3]! < 200) continue;
      opaque++;
      const lum = 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!;
      const chroma = Math.max(data[i]!, data[i + 1]!, data[i + 2]!) - Math.min(data[i]!, data[i + 1]!, data[i + 2]!);
      if (lum < 80 && chroma < 60) dark++; // navy that would vanish on the dark background
    }
    expect(dark / opaque).toBeLessThan(0.001);
  });

  it('derives a square, transparent symbol', async () => {
    const m = await meta('src/assets/brand/taren-symbol.png');
    expect(m.width).toBe(m.height);
    expect(m.hasAlpha).toBe(true);
  });

  it('ships favicons and app icons from the official symbol', async () => {
    const ico = readFileSync(resolve(root, 'public/favicon.ico'));
    expect(ico.readUInt16LE(2)).toBe(1); // icon resource
    expect(ico.readUInt16LE(4)).toBe(3); // 16, 32, 48
    for (const [f, size] of [['public/favicon-32.png', 32], ['public/apple-touch-icon.png', 180], ['public/icon-192.png', 192], ['public/icon-512.png', 512]] as const) {
      const m = await meta(f);
      expect([m.width, m.height], f).toEqual([size, size]);
    }
    expect(existsSync(resolve(root, 'public/favicon.svg'))).toBe(false); // interim icon removed
  });

  it('has a 1200×630 social image', async () => {
    const m = await meta('public/og/taren.png');
    expect([m.width, m.height]).toEqual([1200, 630]);
  });
});
