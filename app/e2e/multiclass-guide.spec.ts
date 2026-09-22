import { test, expect, openLocalSheet } from "./fixtures";

test("the multiclass guide preserves the creation form without creating a character", async ({
  page
}) => {
  await page.goto("/characters/new");
  await page.getByLabel("Character name", { exact: true }).fill("Multiclass Guide Hero");
  await page.getByLabel("Class", { exact: true }).selectOption("Wizard");
  await page.getByLabel("Level", { exact: true }).fill("5");
  await page.getByLabel("Species", { exact: true }).selectOption("Human");
  await page.getByLabel("Background", { exact: true }).selectOption("Sage");
  const subclass = await page.getByLabel("Subclass", { exact: true }).inputValue();
  const savedBefore = await page.evaluate(() => localStorage.getItem("arcane-ledger.characters"));
  const openGuide = page.getByRole("button", { name: "Open multiclass guide", exact: true });
  const guide = page.getByRole("dialog", { name: "Multiclass Guide", exact: true });

  await expect(page.getByText("Want to multiclass?", { exact: true })).toBeVisible();
  await openGuide.click();
  await expect(guide).toBeVisible();
  await expect(guide).toContainText("Arcane Ledger now supports proper multiclassing!");
  await expect(guide.getByRole("listitem")).toHaveCount(3);
  await expect(guide.getByRole("listitem").nth(1)).toContainText(
    "Build Section and press Edit"
  );
  await expect(guide.getByRole("listitem").nth(2)).toContainText("Distribute your levels.");
  await expect(guide).not.toContainText("emulate");
  await page.screenshot({ path: test.info().outputPath("multiclass-guide.png") });
  await guide.getByRole("button", { name: "Close multiclass guide" }).click();
  await expect(guide).not.toBeVisible();
  await openGuide.click();
  await expect(guide).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(guide).not.toBeVisible();

  await expect(page).toHaveURL(/\/characters\/new$/);
  await expect(page.getByLabel("Character name", { exact: true })).toHaveValue(
    "Multiclass Guide Hero"
  );
  await expect(page.getByLabel("Level", { exact: true })).toHaveValue("5");
  await expect(page.getByLabel("Class", { exact: true })).toHaveValue("Wizard");
  await expect(page.getByLabel("Subclass", { exact: true })).toHaveValue(subclass);
  await expect(page.getByLabel("Species", { exact: true })).toHaveValue("Human");
  await expect(page.getByLabel("Background", { exact: true })).toHaveValue("Sage");
  expect(await page.evaluate(() => localStorage.getItem("arcane-ledger.characters"))).toBe(
    savedBefore
  );
});

test("the creation guide stays out of existing-character profile editing", async ({ page }) => {
  await openLocalSheet(page);
  const id = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcane-ledger.characters")!)[0].identity.localId as string
  );
  await page.goto(`/characters/${id}/edit`);
  await expect(page.getByLabel("Character name", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open multiclass guide" })).toHaveCount(0);
});
