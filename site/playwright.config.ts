import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const DRAFTS_PORT = 4322;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' } },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    ...devices['Desktop Chrome'],
  },
  projects: [
    // The production build: unpublished products must not exist anywhere.
    { name: 'chromium', testIgnore: /drafts\.spec\.ts/ },
    // The draft-preview build (TAREN_SHOW_DRAFTS=1): drafts visible but never indexable.
    { name: 'drafts', testMatch: /drafts\.spec\.ts/, use: { baseURL: `http://127.0.0.1:${DRAFTS_PORT}` } },
  ],
  webServer: [
    {
      // Production build (served by astro preview) plus a separate draft-preview build in dist-drafts/.
      command: `npm run build && TAREN_SHOW_DRAFTS=1 npx astro build --outDir dist-drafts && npx astro preview --port ${PORT} --ignore-lock`,
      url: `http://localhost:${PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
    {
      // Playwright starts web servers in order, so the draft build above already exists here.
      command: `python3 -m http.server ${DRAFTS_PORT} --bind 127.0.0.1 -d dist-drafts`,
      url: `http://127.0.0.1:${DRAFTS_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
