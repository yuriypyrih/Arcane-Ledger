import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";

test("Warrior of the Elements has one usable Elementalism cantrip after reload", async ({
  page
}) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: {
        className: "Monk",
        subclassId: "monk-warrior-of-the-elements",
        level: 3,
        xp: 900
      },
      features: { classFeatureState: {}, feats: [] },
      spellcasting: {}
    })
  );
  const spells = page.locator("article").filter({
    has: page.getByRole("button", { name: "Open spellcasting guide" })
  });
  await expect(spells.getByText("Elementalism", { exact: true })).toHaveCount(1);
  await spells.getByText("Elementalism", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Cast", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Cast", exact: true }).click();
  await page.reload();
  await expect(spells.getByText("Elementalism", { exact: true })).toHaveCount(1);
});

test("Portent ready and used cards follow dark mode and preserve rolls", async ({ page }) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: { className: "Wizard", subclassId: "wizard-diviner", level: 3, xp: 900 },
      features: { classFeatureState: {}, feats: [] },
      spellcasting: {}
    })
  );
  await page.getByRole("button", { name: /^Portent Charges/ }).click();
  const form = page.locator("#wizard-diviner-portent-form");
  const readyCard = form
    .locator("div")
    .filter({
      has: page.getByRole("spinbutton", { name: "Portent roll 1", exact: true })
    })
    .last();
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  const lightBackground = await readyCard.evaluate(
    (card) => getComputedStyle(card).backgroundColor
  );
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const darkBackground = await readyCard.evaluate((card) => getComputedStyle(card).backgroundColor);
  expect(darkBackground).not.toBe(lightBackground);
  // Dark cards must not leave the pale title and labels on a white surface.
  expect(
    darkBackground
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .every((value) => value < 80)
  ).toBe(true);
  await page.getByRole("spinbutton", { name: "Portent roll 1", exact: true }).fill("7");
  await page.getByRole("spinbutton", { name: "Portent roll 2", exact: true }).fill("18");
  await form.getByRole("checkbox", { name: "Mark as used" }).first().check();
  await expect(readyCard.getByText("Used", { exact: true })).toBeVisible();
  const usedBackground = await readyCard.evaluate((card) => getComputedStyle(card).backgroundColor);
  expect(usedBackground).not.toBe(darkBackground);
  expect(
    usedBackground
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .every((value) => value < 80)
  ).toBe(true);
  await page.getByRole("button", { name: "Save Portent", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).features.classFeatureState?.wizard?.portentRolls)
    .toEqual([
      { value: 7, used: true },
      { value: 18, used: false }
    ]);
  await page.reload();
  await page.getByRole("button", { name: /^Portent Charges/ }).click();
  await expect(page.getByRole("spinbutton", { name: "Portent roll 1", exact: true })).toHaveValue(
    "7"
  );
  await expect(form.getByRole("checkbox", { name: "Mark as used" }).first()).toBeChecked();
});
