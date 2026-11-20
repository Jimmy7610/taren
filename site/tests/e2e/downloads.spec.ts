import { expect, test } from '@playwright/test';

// Windows download sections (src/components/DownloadPanel.astro, manifests in src/content/releases/).
// Lumen Capture 2.9.0-beta.2 and PDF Studio 0.9.0-beta.2 are published (owner approval 2026-11-20).
// When a release changes, update these expectations in the same change (docs/WINDOWS_DOWNLOADS.md, step 6).

const APPS = [
  { slug: 'lumen-capture', name: 'Lumen Capture', version: '2.9.0-beta.2' },
  { slug: 'pdfstudio', name: 'PDF Studio', version: '0.9.0-beta.2' },
] as const;

const LUMEN_BASE = 'https://downloads.taren.se/lumen-capture/beta/2.9.0-beta.2';
const LUMEN_FILES = {
  installer: { name: 'LumenCapture-2.9.0-beta.2-Setup.exe', sha256: '40b568302ebdc28ee2b15761df0fa79ef9f522818727816506da30075c8bdc1e' },
  portable: { name: 'LumenCapture-2.9.0-beta.2-portable.zip', sha256: 'f754174df1ee14a2b40262a66b27e5e95fd0bda9fb569b5a6e336a469f7c2712' },
} as const;

const PDF_BASE = 'https://downloads.taren.se/pdf-studio/beta/0.9.0-beta.2';
const PDF_FILES = {
  installer: { name: 'PDFStudio-Setup-0.9.0-beta.2-x64.exe', sha256: '66519badd53186fcf25e9255af9ee683c1604c5a93db7bb0d9e3d42b2b9d55cd' },
  portable: { name: 'PDFStudio-0.9.0-beta.2-win-x64-portable.zip', sha256: '4b7face399c0e05f60c01321a9e4774e01a4bee9c56f1e57fa3e2f712b6a98f2' },
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

  test(`${lang.prefix || '/en'} PDF Studio: published beta with installer and portable ZIP`, async ({ page }) => {
    await page.goto(`${lang.prefix}/products/pdfstudio/`);
    const panel = page.locator('[data-download-panel]');
    await expect(panel).toHaveAttribute('data-release-state', 'published');
    await expect(panel.getByRole('heading', { level: 2, name: lang.title })).toBeVisible();
    await expect(panel.locator('[data-release-pill]')).toHaveText(lang.eyebrow);
    await expect(panel.locator('[data-release-version]')).toContainText('0.9.0-beta.2');
    await expect(panel.locator('[data-preparing]')).toHaveCount(0);
    const installer = panel.locator('[data-download-installer]');
    await expect(installer).toBeVisible();
    await expect(installer).toContainText(lang.button);
    await expect(installer).toHaveAttribute('href', `${PDF_BASE}/${PDF_FILES.installer.name}`);
    await expect(installer).toHaveAttribute('download', PDF_FILES.installer.name);
    const portable = panel.locator('[data-download-portable]');
    await expect(portable).toBeVisible();
    await expect(portable).toHaveText(lang.portable);
    await expect(portable).toHaveAttribute('href', `${PDF_BASE}/${PDF_FILES.portable.name}`);
    await expect(portable).toHaveAttribute('download', PDF_FILES.portable.name);
    for (const file of Object.values(PDF_FILES)) {
      await expect(panel.locator(`[data-sha256="${file.name}"]`)).toHaveText(file.sha256);
    }
    const hrefs = await page.locator('a[href*="downloads.taren.se"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(new Set(hrefs)).toEqual(new Set([`${PDF_BASE}/${PDF_FILES.installer.name}`, `${PDF_BASE}/${PDF_FILES.portable.name}`]));
    for (const h of [lang.notes, lang.issues, lang.guide]) await expect(panel.getByRole('heading', { level: 3, name: h })).toBeVisible();
  });

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
