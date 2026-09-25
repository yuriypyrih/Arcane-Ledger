import { test, expect } from "./fixtures";

test(
  "campaign action labels shorten only on xs while retaining icons",
  { tag: "@layout" },
  async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("browser@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Synthetic-password-847!");
    const loginResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith("/auth/login")
    );
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    const login = await loginResponse;
    expect(login.ok()).toBe(true);
    await expect(page).not.toHaveURL(/\/login$/);
    const endpoint = new URL("/api/v1/campaigns", login.url()).href;
    const response = await page.request.post(endpoint, { data: { name: "Responsive campaign" } });
    expect(response.ok()).toBe(true);
    const { campaign } = await response.json();
    try {
      await page.goto(`/gm-tools/campaign-manager/${campaign.id}`);
      for (const width of [320, 599, 600]) {
        await page.setViewportSize({ width, height: 800 });
        for (const [short, full] of [
          ["Import", "Import Template"],
          ["Create", "Create Encounter"],
          ["Add", "Add Note"]
        ]) {
          const button = page.getByRole("button", {
            name: width < 600 ? short : full,
            exact: true
          });
          await expect(button).toBeVisible();
          await expect(button.locator("svg")).toBeVisible();
          await expect(
            page.getByRole("button", { name: width < 600 ? full : short, exact: true })
          ).toHaveCount(0);
        }
        const visibility = page.getByRole("button", {
          name: "Player Visibility Settings",
          exact: true
        });
        await expect(visibility).toBeVisible();
        await expect(visibility.locator("svg")).toBeVisible();
      }
    } finally {
      const deleted = await page.request.delete(`${endpoint}/${campaign.id}`);
      expect(deleted.ok()).toBe(true);
    }
  }
);
