import { expect, test } from '@playwright/test';
import { EXTRA_SIZES, PAGES, RELEASE_SIZES, VIEWPORTS, scrollThrough } from './helpers';

// The exact release matrix plus the earlier width sweep (deduplicated).
const SIZES: ReadonlyArray<readonly [number, number]> = [
  ...new Map(
    [...RELEASE_SIZES, ...VIEWPORTS.map((w) => [w, w < 768 ? 800 : 900] as const), ...EXTRA_SIZES].map((s) => [`${s[0]}x${s[1]}`, s] as const),
  ).values(),
];

for (const [width, height] of SIZES) {
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height } });

    for (const { path } of [...PAGES, { path: '/404.html' }]) {
      test(`${path} has no overflow, overlap or tiny targets`, async ({ page }) => {
        await page.goto(path);
        await scrollThrough(page);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(0);

        // Elements wider than the viewport (excluding intentional horizontal scrollers).
        const wide = await page.evaluate(() =>
          [...document.querySelectorAll('main *, header *, footer *')]
            .filter((el) => !el.closest('.gallery') && !el.closest('svg') && !el.closest('[aria-hidden="true"]'))
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
            })
            .map((el) => `${el.tagName}.${el.className}`.slice(0, 80)),
        );
        expect(wide).toEqual([]);

        // Visible interactive elements must not overlap each other.
        const overlaps = await page.evaluate(() => {
          const els = [...document.querySelectorAll<HTMLElement>('a, button')].filter((e) => {
            const r = e.getBoundingClientRect();
            const s = getComputedStyle(e);
            return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !e.closest('dialog:not([open])') && !e.classList.contains('sr-only');
          });
          const out: string[] = [];
          for (let i = 0; i < els.length; i++)
            for (let j = i + 1; j < els.length; j++) {
              const a = els[i]!, b = els[j]!;
              if (a.contains(b) || b.contains(a)) continue;
              const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
              const x = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
              const y = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
              if (x > 2 && y > 2) out.push(`${a.textContent?.trim().slice(0, 30)} ⟷ ${b.textContent?.trim().slice(0, 30)}`);
            }
          return out;
        });
        expect(overlaps).toEqual([]);

        // Touch targets (WCAG 2.2 AA target size minimum is 24px; we aim for 44px on buttons/nav).
        const small = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('a, button')]
            .filter((e) => !e.closest('.prose-taren') && !e.closest('.text-sm') && !e.closest('dialog:not([open])') && !e.classList.contains('sr-only'))
            .map((e) => ({ t: e.textContent?.trim().slice(0, 30), r: e.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && (r.height < 24 || r.width < 24))
            .map(({ t, r }) => `${t} ${Math.round(r.width)}x${Math.round(r.height)}`),
        );
        expect(small).toEqual([]);
      });
    }
  });
}
