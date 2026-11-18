import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

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
  projects: [{ name: 'chromium' }],
  webServer: {
    // Tests run against the production build, served statically.
    command: `npm run build && npx astro preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
