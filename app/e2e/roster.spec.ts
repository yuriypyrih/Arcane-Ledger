import { test, expect } from "./fixtures";

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
