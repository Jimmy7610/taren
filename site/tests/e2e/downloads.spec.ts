import { expect, test } from '@playwright/test';

// Windows download sections (src/components/DownloadPanel.astro, manifests in src/content/releases/).
// Lumen Capture 2.9.0-beta.2 is published (owner approval 2026-11-20): installer and portable ZIP from downloads.taren.se.
// PDF Studio is still in preparation: no file, no size, no checksum and no link to downloads.taren.se anywhere.
// When a release changes, update these expectations in the same change (docs/WINDOWS_DOWNLOADS.md, step 6).

const APPS = [
  { slug: 'lumen-capture', name: 'Lumen Capture', version: '2.9.0-beta.2' },
  { slug: 'pdfstudio', name: 'PDF Studio', version: '0.9.0-beta.1' },
] as const;
const PREPARING = APPS.filter((a) => a.slug === 'pdfstudio');

const LUMEN_BASE = 'https://downloads.taren.se/lumen-capture/beta/2.9.0-beta.2';
const LUMEN_FILES = {
  installer: { name: 'LumenCapture-2.9.0-beta.2-Setup.exe', sha256: '40b568302ebdc28ee2b15761df0fa79ef9f522818727816506da30075c8bdc1e' },
  portable: { name: 'LumenCapture-2.9.0-beta.2-portable.zip', sha256: 'f754174df1ee14a2b40262a66b27e5e95fd0bda9fb569b5a6e336a469f7c2712' },
} as const;

const LANGS = [
  {
    prefix: '',
    title: 'Download for Windows',
    button: 'Download for Windows',
    portable: /Portable version \(no installation\)/,
    eyebrow: 'Public Beta',
    status: 'In preparation',
    notAvailable: 'Not available yet',
    notes: 'Release Notes',
    issues: 'Known Issues',
    guide: 'Installation Instructions',
    verify: 'Verify the download (SHA-256)',
    requirements: 'System Requirements',
    os: /Windows 10 version 2004 or later, or Windows 11/,
  },
  {
    prefix: '/sv',
    title: 'Ladda ner för Windows',
    button: 'Ladda ner för Windows',
    portable: /Portabel version \(ingen installation\)/,
    eyebrow: 'Öppen beta',
    status: 'Förbereds',
    notAvailable: 'Inte tillgänglig än',
    notes: 'Versionsinformation',
    issues: 'Kända problem',
    guide: 'Installationsanvisningar',
    verify: 'Kontrollera nedladdningen (SHA-256)',
    requirements: 'Systemkrav',
    os: /Windows 10 version 2004 eller senare, eller Windows 11/,
  },
] as const;

for (const lang of LANGS) {
  test(`${lang.prefix || '/en'} Lumen Capture: published beta with installer and portable ZIP`, async ({ page }) => {
    await page.goto(`${lang.prefix}/products/lumen-capture/`);
    const panel = page.locator('[data-download-panel]');
    await expect(panel).toHaveAttribute('data-release-state', 'published');
    await expect(panel.getByRole('heading', { level: 2, name: lang.title })).toBeVisible();
    await expect(panel.locator('[data-release-pill]')).toHaveText(lang.eyebrow);
    await expect(panel.locator('[data-release-version]')).toContainText('2.9.0-beta.2');
    await expect(panel.locator('[data-preparing]')).toHaveCount(0);

    const installer = panel.locator('[data-download-installer]');
    await expect(installer).toBeVisible();
    await expect(installer).toContainText(lang.button);
    await expect(installer).toHaveAttribute('href', `${LUMEN_BASE}/${LUMEN_FILES.installer.name}`);
    await expect(installer).toHaveAttribute('download', LUMEN_FILES.installer.name);
    const portable = panel.locator('[data-download-portable]');
    await expect(portable).toBeVisible();
    await expect(portable).toHaveText(lang.portable);
    await expect(portable).toHaveAttribute('href', `${LUMEN_BASE}/${LUMEN_FILES.portable.name}`);
    await expect(portable).toHaveAttribute('download', LUMEN_FILES.portable.name);

    for (const f of Object.values(LUMEN_FILES)) await expect(panel.locator(`[data-sha256="${f.name}"]`)).toHaveText(f.sha256);
    // Only the two published files are linked; nothing from PDF Studio or another version.
    const hrefs = await page.locator('a[href*="downloads.taren.se"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(new Set(hrefs)).toEqual(new Set([`${LUMEN_BASE}/${LUMEN_FILES.installer.name}`, `${LUMEN_BASE}/${LUMEN_FILES.portable.name}`]));
    for (const h of [lang.notes, lang.issues, lang.guide]) await expect(panel.getByRole('heading', { level: 3, name: h })).toBeVisible();
  });

  for (const app of PREPARING) {
    test(`${lang.prefix || '/en'} ${app.name}: honest beta preparation state, no live download`, async ({ page }) => {
      await page.goto(`${lang.prefix}/products/${app.slug}/`);
      const panel = page.locator('[data-download-panel]');
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute('data-release-state', 'preparing');
      await expect(panel.getByRole('heading', { level: 2, name: lang.title })).toBeVisible();
      await expect(panel.getByText(lang.eyebrow, { exact: true })).toBeVisible();
      await expect(panel.locator('[data-release-pill]')).toHaveText(lang.status);
      await expect(panel.locator('[data-release-version]')).toContainText(app.version);
      await expect(panel.getByText(lang.notAvailable)).toBeVisible();
      await expect(panel.getByText(lang.os).first()).toBeVisible();
      for (const h of [lang.notes, lang.issues, lang.guide]) await expect(panel.getByRole('heading', { level: 3, name: h })).toBeVisible();

      // No download anywhere: no active section, no link to the file host, no download attribute, no checksum.
      await expect(panel.locator('[data-active-download]')).toHaveCount(0);
      expect(await page.locator('a[href*="downloads.taren.se"], a[download]').count()).toBe(0);
      expect(await page.locator('[data-sha256], [data-copy]').count()).toBe(0);
      expect(await page.getByRole('link', { name: /download|ladda ner|installer|installationsprogram/i }).count()).toBe(0);
      expect(await page.getByRole('button', { name: /download|ladda ner/i }).count()).toBe(0);
      // No invented file names in the instructions while nothing is published.
      await expect(panel.locator('pre')).not.toContainText(/\.exe|\.zip/);
    });
  }

  test(`${lang.prefix || '/en'} installation instructions are keyboard-operable disclosures`, async ({ page }) => {
    await page.goto(`${lang.prefix}/products/pdfstudio/`);
    const summary = page.locator('[data-install-guide] summary', { hasText: lang.verify });
    await summary.focus();
    await expect(summary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-install-guide] details[open] pre')).toContainText('Get-FileHash');
    await expect(page.locator('[data-install-guide] details[open] pre')).toContainText('-Algorithm SHA256');
  });
}

test('the panel fits a phone screen without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const app of APPS) {
    await page.goto(`/products/${app.slug}/`);
    await page.locator('[data-download-panel]').scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, app.slug).toBeLessThanOrEqual(0);
  }
});

test('products without a release manifest have no download section', async ({ page }) => {
  await page.goto('/products/pulse-garden/');
  await expect(page.locator('[data-download-panel]')).toHaveCount(0);
});

test('bug reports go to the owner-approved contact address', async ({ page }) => {
  await page.goto('/products/lumen-capture/');
  await page.locator('[data-install-guide] summary', { hasText: 'Report a bug' }).click();
  await expect(page.locator('[data-install-guide] details[open] [data-contact-email]')).toHaveAttribute('href', /^mailto:/);
});
