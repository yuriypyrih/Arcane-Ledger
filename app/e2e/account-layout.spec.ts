import { test, expect } from "./fixtures";

test(
  "signed-in account fills the header when stacked below Your Account",
  { tag: "@layout" },
  async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("browser@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Synthetic-password-847!");
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login$/);
    await page.goto("/account");
    const identity = page.getByRole("complementary", { name: "Signed in account" });
    const title = page.getByRole("heading", { name: "Your Account", exact: true });
    for (const width of [320, 599, 760, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(identity).toBeVisible();
      const box = (await identity.boundingBox())!;
      const titleBox = (await title.boundingBox())!;
      if (width <= 760) {
        expect(box.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height);
        const content = await identity.evaluate((element) => {
          const parent = element.parentElement!;
          const rect = parent.getBoundingClientRect();
          const style = getComputedStyle(parent);
          const left =
            rect.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
          const right =
            rect.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
          return { left, right };
        });
        expect(box.x).toBeCloseTo(content.left, 1);
        expect(box.x + box.width).toBeCloseTo(content.right, 1);
      } else {
        expect(box.x).toBeGreaterThanOrEqual(titleBox.x + titleBox.width);
      }
      await expect(identity.getByRole("button", { name: "Log Out", exact: true })).toBeVisible();
    }
  }
);
