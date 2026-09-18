import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= fileURLToPath(
  new URL("../.cache/playwright", import.meta.url)
);
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4175",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block"
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ],
  webServer: [
    {
      command: "npm --prefix ../server run test:serve",
      url: "http://127.0.0.1:4176/api/v1/health",
      reuseExistingServer: false,
      timeout: 120000
    },
    {
      command: "npm run dev -- --config vite.e2e.config.ts",
      url: "http://127.0.0.1:4175",
      env: { VITE_API_BASE_URL: "http://127.0.0.1:4176/api/v1" },
      reuseExistingServer: false,
      timeout: 60000
    }
  ]
});
