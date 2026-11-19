import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/e2e',
  testMatch: 'decoded-article.spec.ts',
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    screenshot: 'off',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 360, height: 900 } } },
  ],
  reporter: [['list']],
  outputDir: '../test-results/decoded',
});
