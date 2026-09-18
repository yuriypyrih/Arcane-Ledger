import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";

test("create a companion and keep it after reload", async ({ page }) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Add Companion", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "Create companion" });
  await editor.getByLabel("Name", { exact: true }).fill("Scout Owl");
  await editor.getByLabel("Max HP", { exact: true }).fill("12");
  await editor.getByRole("button", { name: "Create Companion", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).companions.entries[0]?.name)
    .toBe("Scout Owl");
  await page.reload();
  await expect(page.getByText("Scout Owl", { exact: true })).toBeVisible();
});

test("Action Surge spends its charge and a short rest restores it", async ({ page }) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: /^Action Surge Charges/ }).click();
  await page.getByRole("button", { name: "Use Action Surge", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).features.classFeatureState?.fighter?.actionSurgeUsesExpended
    )
    .toBe(1);
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  const camp = page.getByRole("dialog", { name: "Choose your rest" });
  await camp.getByText("Short Rest", { exact: true }).click();
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).features.classFeatureState?.fighter?.actionSurgeUsesExpended
    )
    .toBe(0);
});

test("cast a prepared concentration spell, then cast it as a ritual without another slot", async ({
  page
}) => {
  const sheet = portableSheet({
    progression: { className: "Wizard", subclassId: "wizard-evoker", level: 3, xp: 900 },
    spellcasting: {
      spellbookSpellIds: ["spell-detect-magic", "spell-mage-armor"],
      preparedSpellIds: ["spell-detect-magic", "spell-mage-armor"],
      spellSlotsExpended: Array(9).fill(0)
    }
  });
  await openLocalSheet(page, sheet);
  await page.getByText("Detect Magic", { exact: true }).last().click();
  await page.getByRole("button", { name: "Cast", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.spellSlotsExpended?.[0])
    .toBe(1);
  await expect
    .poll(async () =>
      (await savedSheet(page)).session.statusEntries?.some((e) => e.value === "Concentration")
    )
    .toBe(true);
  const firstConcentrationId = (await savedSheet(page)).session.statusEntries?.find(
    (e) => e.value === "Concentration"
  )?.id;
  await page.getByText("Detect Magic", { exact: true }).last().click();
  await page.getByText("Cast as Ritual", { exact: true }).click();
  await page.getByRole("button", { name: "Cast", exact: true }).click();
  await expect
    .poll(async () => {
      const entries =
        (await savedSheet(page)).session.statusEntries?.filter(
          (e) => e.value === "Concentration"
        ) ?? [];
      return (
        entries.length === 1 &&
        Boolean(entries[0].id) &&
        entries[0].id !== firstConcentrationId &&
        entries[0].source === "Detect Magic"
      );
    })
    .toBe(true);
  expect((await savedSheet(page)).spellcasting.spellSlotsExpended?.[0]).toBe(1);
  await page.reload();
  await expect(page.getByRole("button", { name: "Camp", exact: true })).toBeVisible();
  expect(
    (await savedSheet(page)).session.statusEntries?.filter((e) => e.value === "Concentration")
  ).toHaveLength(1);
});

test("editing currency persists the new balance", async ({ page }) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "0 CP 0 SP 0 EP 20 GP 0 PP", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount (Gold)", { exact: true }).fill("25");
  await dialog.getByRole("button", { name: "Gain", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).inventory.currencies.gold).toBe(45);
});

test("a proficiency choice updates and survives reloading", async ({ page }) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Edit skills", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "Edit Skills" });
  await editor.getByLabel("Arcana proficiency", { exact: true }).selectOption("EXPERT");
  await editor.getByRole("button", { name: "Close skill editor" }).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).proficiencies.skillProficiencies?.find(
          (p) => p.proficiency === "ARCANA"
        )?.proficiencyLevel
    )
    .toBe("EXPERT");
  await page.reload();
  await page.getByRole("button", { name: "Edit skills", exact: true }).click();
  await expect(page.getByLabel("Arcana proficiency", { exact: true })).toHaveValue("EXPERT");
});
