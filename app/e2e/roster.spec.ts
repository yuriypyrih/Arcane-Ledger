import { test, expect } from "./fixtures";

test(
  "join party stays compact in the roster's top right corner",
  { tag: "@layout" },
  async ({ page }) => {
    await page.goto("/characters");
    const join = page.getByRole("button", { name: "Join Party Group", exact: true });
    const heading = page.getByRole("heading", { name: "Your Characters", exact: true, level: 2 });
    await expect(heading).toHaveCount(1);
    for (const width of [320, 390, 599, 600, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(join).toBeVisible();
      const newCharacter = page.getByRole("button", { name: /^New(?: Character)?$/ });
      for (const property of ["font-size", "padding-left", "padding-right", "min-height"]) {
        const value = await newCharacter.evaluate(
          (button, cssProperty) => getComputedStyle(button).getPropertyValue(cssProperty),
          property
        );
        await expect(join).toHaveCSS(property, value);
      }
      const buttonBox = (await join.boundingBox())!;
      const labelBox = (await heading.boundingBox())!;
      expect(buttonBox.x).toBeGreaterThan(labelBox.x + labelBox.width);
      expect(buttonBox.y).toBeLessThan(labelBox.y + labelBox.height);
      expect(buttonBox.y + buttonBox.height).toBeGreaterThan(labelBox.y);
      expect(buttonBox.width).toBeLessThan(220);
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(width);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      await expect(join).toHaveText(width < 600 ? /Join Party/ : /Join Party Group/);
    }
  }
);

test("create a recommended character through the builder and reopen it from the roster", async ({
  page
}) => {
  await page.goto("/characters/new");
  const create = page.getByRole("button", { name: "Create with recommended build", exact: true });
  await expect(create).toBeDisabled();
  await page.getByLabel("Character name", { exact: true }).fill("New Test Hero");
  await page.getByLabel("Class", { exact: true }).selectOption({ label: "Fighter" });
  await page.getByLabel("Species", { exact: true }).selectOption({ label: "Human" });
  await page.getByLabel("Background", { exact: true }).selectOption({ label: "Soldier" });
  await create.click();
  await expect(page.getByRole("heading", { name: "New Test Hero", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Characters", exact: true }).click();
  await page.getByRole("link", { name: "View New Test Hero" }).click();
  await expect(page.getByRole("heading", { name: "New Test Hero", exact: true })).toBeVisible();
});
