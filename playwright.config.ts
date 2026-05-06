import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for RELDA E2E tests.
 *
 * Prerequisites for local runs:
 *   1. `.env.local` is populated (see `.env.example`).
 *   2. Local Supabase is running: `npm run db:start`.
 *   3. The dev server is started automatically by Playwright (see `webServer` below).
 *      If you already have `npm run dev` running, set `PW_REUSE_SERVER=1`.
 *
 * Run all tests:        `npm run test:e2e`
 * Open Playwright UI:   `npm run test:e2e:ui`
 * Show last HTML report: `npx playwright show-report`
 */

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // shared Supabase backend — keep tests sequential
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "de-DE",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI || !!process.env.PW_REUSE_SERVER,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
