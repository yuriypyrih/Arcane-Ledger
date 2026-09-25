import { test, expect } from "./fixtures";

test(
  "GM tool tabs show only the selected label on extra-small screens",
  { tag: "@layout" },
  async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("browser@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Synthetic-password-847!");
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login$/);
    await page.goto("/gm-tools");
    const tablist = page.getByRole("tablist", { name: "GM tool sections" });
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(6);

    for (const width of [320, 599]) {
      await page.setViewportSize({ width, height: 800 });
      for (const tab of await tabs.all()) {
        await tab.click();
        await expect(tab).toHaveAttribute("aria-selected", "true");
        await expect
          .poll(() => tablist.evaluate((element) => element.scrollHeight - element.clientHeight))
          .toBe(0);
        for (const candidate of await tabs.all()) {
          await expect(candidate).toHaveAccessibleName(/\S/);
          await expect(candidate.locator("svg")).toBeVisible();
          if ((await candidate.getAttribute("aria-selected")) === "true") {
            await expect(candidate.locator("span")).toBeVisible();
          } else {
            await expect(candidate.locator("span")).toBeHidden();
            const box = await candidate.boundingBox();
            expect(box!.width).toBeGreaterThanOrEqual(44);
            expect(box!.width).toBeLessThan(60);
          }
        }
        const boxes = await tabs.evaluateAll((buttons) =>
          buttons.map((button) => {
            const box = button.getBoundingClientRect();
            return { left: box.left, right: box.right, bottom: box.bottom };
          })
        );
        for (let index = 1; index < boxes.length; index += 1) {
          expect(boxes[index].left).toBeCloseTo(boxes[index - 1].right, 1);
          expect(boxes[index].bottom).toBeCloseTo(boxes[0].bottom, 1);
        }
      }
      const bounds = await tablist.boundingBox();
      expect(bounds!.height).toBeLessThan(75);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    }

    await page.setViewportSize({ width: 600, height: 800 });
    for (const tab of await tabs.all()) {
      await expect(tab.locator("span")).toBeVisible();
    }
  }
);
