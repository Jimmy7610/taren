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

  it('keeps products the owner has not approved unpublished (Taren 2.2)', () => {
    const lumen = read('lumen-capture.md');
    expect(lumen.published).toBe(false);
    expect(lumen.featured).toBe(false);
    expect(lumen.downloadUrl).toBeUndefined();
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
