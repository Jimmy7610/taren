import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { productSchema } from '@/lib/product-schema';

const dir = resolve(__dirname, '../../src/content/products');
const files = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
const read = (f: string) => {
  const src = readFileSync(join(dir, f), 'utf8');
  const fm = /^---\n([\s\S]*?)\n---/.exec(src)?.[1] ?? '';
  return parse(fm) as Record<string, unknown>;
};

describe('product content files', () => {
  it('exist', () => expect(files.length).toBeGreaterThan(0));

  for (const file of files) {
    describe(file, () => {
      const data = read(file);
      it('pass the schema', () => {
        const r = productSchema(z.string()).safeParse(data);
        expect(r.success ? [] : r.error.issues).toEqual([]);
      });
      it('declare a slug matching the file name', () => {
        expect(data.slug).toBe(file.replace(/\.md$/, ''));
      });
      it('reference image files that exist', () => {
        const refs = [data.icon, data.heroImage, ...((data.gallery as { image: string }[] | undefined) ?? []).map((g) => g.image)];
        for (const ref of refs.filter(Boolean) as string[]) {
          expect(existsSync(resolve(dirname(join(dir, file)), ref)), ref).toBe(true);
        }
        if (data.ogImage) expect(existsSync(resolve(__dirname, '../../public', `.${data.ogImage as string}`))).toBe(true);
      });
    });
  }

  it('keeps the template unpublished and out of the build (underscore prefix)', () => {
    expect(read('_example-product.md').published).toBe(false);
    expect(files).not.toContain('_example-product.md');
  });

  it('Taren 2.5: all three products are public information pages (gate 1); Lumen Capture and PDF Studio are beta releases', () => {
    const schema = productSchema(z.string());
    for (const file of ['lumen-capture.md', 'pdfstudio.md', 'pulse-garden.md', 'mineclone.md']) {
      const data = read(file);
      expect(data.published, file).toBe(true);
      // Lumen Capture's download comes from its release manifest (src/content/releases/), never from downloadUrl.
      expect(data.status, file).toBe(file === 'pulse-garden.md' ? 'in-development' : 'beta');
      // Publishing a page never approves distribution: no download, no release approval, no website link.
      expect(data.downloadUrl, file).toBeUndefined();
      expect(data.releaseApproval, file).toBeUndefined();
      expect(data.websiteUrl, file).toBeUndefined();
      const result = schema.safeParse(data);
      expect(result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`), file).toEqual([]);
    }
  });

  it('Taren catalog ordering: Lumen Capture, PDF Studio, Pulse Garden, MineClone', () => {
    const lumen = read('lumen-capture.md'), pdf = read('pdfstudio.md'), pulse = read('pulse-garden.md'), mine = read('mineclone.md');
    expect([lumen.order, pdf.order, pulse.order, mine.order]).toEqual([1, 2, 3, 4]);
    expect([lumen.featured, pdf.featured, pulse.featured, mine.featured]).toEqual([true, false, false, false]);
    expect(String(lumen.statusNote)).toMatch(/Public beta 2\.9\.0-beta\.2/);
    expect(String(pulse.statusNote)).toMatch(/not available on the App Store or TestFlight/);
  });

  it('PDF Studio is an honest public beta page with its own icon', () => {
    const pdf = read('pdfstudio.md');
    expect(pdf.published).toBe(true);
    expect(pdf.featured).toBe(false);
    expect(pdf.status).toBe('beta');
    expect(pdf.device).toBe('desktop');
    expect(pdf.downloadUrl).toBeUndefined();
    expect(pdf.websiteUrl).toBeUndefined();
    expect(pdf.icon).toBe('../../assets/products/pdfstudio/icon.png'); // PDF Studio's own icon, never the Taren symbol
    expect(String(pdf.iconAlt)).toMatch(/^PDF Studio app icon/);
    expect(String(pdf.statusNote)).toMatch(/Public beta 0\.9\.0-beta\.2/);
    const all = JSON.stringify(pdf);
    expect(all).not.toMatch(/taren-symbol|brand\/masters/);
    expect(all).not.toMatch(/PDF\/A compli|Acrobat|available now/i);
  });

  it("PDF Studio icon is a byte-identical copy of the app's own AppIcon256.png", async () => {
    const { createHash } = await import('node:crypto');
    const icon = readFileSync(resolve(__dirname, '../../src/assets/products/pdfstudio/icon.png'));
    expect(createHash('sha256').update(icon).digest('hex')).toBe('a981670567deddc9f0112f2cfac6776cabf980c2dcb4b44decf77f8d3503a920');
  });

  it('PDF Studio originals are byte-identical to the asset manifest and every derivative exists at 1000×660', async () => {
    const { createHash } = await import('node:crypto');
    const sharp = (await import('sharp')).default;
    const manifest = readFileSync(resolve(__dirname, '../../../docs/products/pdfstudio/ASSET_MANIFEST.md'), 'utf8');
    const rows = [...manifest.matchAll(/`screenshots\/([^`]+\.png)`.*?`([0-9a-f]{16})`/g)];
    expect(rows).toHaveLength(13);
    const imgDir = resolve(__dirname, '../../src/assets/products/pdfstudio');
    for (const [, file, hash] of rows) {
      const buf = readFileSync(resolve(imgDir, file!));
      expect(createHash('sha256').update(buf).digest('hex').slice(0, 16), file).toBe(hash);
      const m = await sharp(buf).metadata();
      expect([m.width, m.height], file).toEqual([1424, 911]);
      const d = await sharp(resolve(imgDir, file!.replace(/\.png$/, '.web.webp'))).metadata();
      expect([d.width, d.height, d.format], file).toEqual([1000, 660, 'webp']);
    }
  });

  it('desktop products use landscape captures that fit the desktop frame (1000:660)', async () => {
    const sharp = (await import('sharp')).default;
    for (const file of files) {
      const d = read(file);
      if (d.device !== 'desktop') continue;
      const imgs = [d.heroImage, ...((d.gallery as { image: string }[]) ?? []).map((g) => g.image), ...((d.steps as { image: string }[]) ?? []).map((g) => g.image)];
      for (const ref of imgs.filter(Boolean) as string[]) {
        const m = await sharp(resolve(dir, ref)).metadata();
        expect(m.width! / m.height!, `${file}: ${ref}`).toBeCloseTo(1000 / 660, 2);
      }
    }
  });

  it('has at least one published, featured product for the homepage spotlight', () => {
    expect(files.map(read).some((d) => d.published === true && d.featured === true)).toBe(true);
  });
});
