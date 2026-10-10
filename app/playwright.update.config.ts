import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= fileURLToPath(
  new URL("../.cache/playwright", import.meta.url)
);

export default defineConfig({
  testDir: "./e2e-update",
  testMatch: "*.spec.ts",
  globalSetup: "./e2e-update/build.ts",
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  outputDir: "test-results/updates",
  reporter: [["list"]],
  use: { serviceWorkers: "allow", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 13"] } }
  ]
});
