import { expect, test } from '@playwright/test';

// Windows download sections (src/components/DownloadPanel.astro, manifests in src/content/releases/).
// Until the owner approves the first public beta, both apps show an honest "in preparation" state: no file, no size,
// no checksum and no link to downloads.taren.se anywhere. When a beta is published, update these expectations in the
// same change (docs/WINDOWS_DOWNLOADS.md, step 6).

const APPS = [
  { slug: 'lumen-capture', name: 'Lumen Capture', version: '2.9.0-beta.1' },
  { slug: 'pdfstudio', name: 'PDF Studio', version: '0.9.0-beta.1' },
] as const;

const LANGS = [
  {
    prefix: '',
    title: 'Download for Windows',
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
  for (const app of APPS) {
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
