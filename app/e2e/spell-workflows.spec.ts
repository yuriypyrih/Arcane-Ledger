import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";
import { magicInitiateFeat } from "../tests/fixtures/feats";
import type { Page } from "@playwright/test";

const spellSection = (page: Page) =>
  page
    .locator("article")
    .filter({ has: page.getByRole("button", { name: "Open spellcasting guide" }) });
async function spellOptions(page: Page) {
  await spellSection(page).getByRole("button", { name: "Edit", exact: true }).click();
  return page.getByRole("dialog");
}
const wizard = () =>
  portableSheet({
    progression: { className: "Wizard", subclassId: "wizard-evoker", level: 3, xp: 900 },
    spellcasting: {
      spellbookSpellIds: ["spell-shield", "spell-mage-armor", "spell-detect-magic"],
      preparedSpellIds: ["spell-shield"],
      spellSlotsExpended: Array(9).fill(0)
    }
  });

test("wizard spellbook and preparation edits persist and removing a spell unprepares it", async ({
  page
}) => {
  await openLocalSheet(page, wizard());
  let editor = await spellOptions(page);
  await editor.getByRole("button", { name: /Manage spellbook & prepare spells/ }).click();
  await editor.getByRole("checkbox", { name: "Prepare Mage Armor", exact: true }).click();
  await editor.getByRole("checkbox", { name: "Unprepare Shield", exact: true }).click();
  await editor.getByRole("button", { name: "Close spell options" }).click();
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.preparedSpellIds)
    .toEqual(["spell-mage-armor"]);
  await page.reload();
  editor = await spellOptions(page);
  await editor.getByRole("button", { name: /Manage spellbook & prepare spells/ }).click();
  await expect(
    editor.getByRole("checkbox", { name: "Unprepare Mage Armor", exact: true })
  ).toBeChecked();
  await editor.getByRole("checkbox", { name: /Remove Mage Armor from spellbook/ }).click();
  await editor.getByRole("button", { name: "Close spell options" }).click();
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.spellbookSpellIds)
    .not.toContain("spell-mage-armor");
  expect((await savedSheet(page)).spellcasting.preparedSpellIds).not.toContain("spell-mage-armor");
});

test("Life Domain grants are locked prepared, leave room for choices, and spend ordinary slots", async ({
  page
}) => {
  const initialChoices = [
    "spell-bane",
    "spell-command",
    "spell-create-or-destroy-water",
    "spell-detect-evil-and-good",
    "spell-detect-magic"
  ];
  await openLocalSheet(
    page,
    portableSheet({
      progression: { className: "Cleric", subclassId: "cleric-life-domain", level: 3, xp: 900 },
      spellcasting: { preparedSpellIds: initialChoices, spellSlotsExpended: Array(9).fill(0) }
    })
  );
  const editor = await spellOptions(page);
  await editor.getByRole("button", { name: /^Prepare spells/ }).click();
  await expect(editor.getByRole("checkbox", { name: "Deselect Bless", exact: true })).toBeChecked();
  await expect(
    editor.getByRole("checkbox", { name: "Deselect Bless", exact: true })
  ).toBeDisabled();
  // Five manual choices plus four domain grants still leave one of the six
  // preparation slots available. The domain grants must not consume that slot.
  await expect(
    editor.getByRole("checkbox", { name: "Select Guiding Bolt", exact: true })
  ).toBeEnabled();
  await editor.getByRole("checkbox", { name: "Select Guiding Bolt", exact: true }).click();
  await expect(
    editor.getByRole("checkbox", { name: "Select Healing Word", exact: true })
  ).toBeDisabled();
  await editor.getByRole("button", { name: "Close spell options" }).click();
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.preparedSpellIds)
    .toEqual([...initialChoices, "spell-guiding-bolt"]);
  await spellSection(page).getByText("Bless", { exact: true }).click();
  await page.getByRole("button", { name: "Cast", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.spellSlotsExpended?.[0])
    .toBe(1);
  await expect
    .poll(async () =>
      (await savedSheet(page)).session.statusEntries
        ?.filter((e) => e.value === "Concentration")
        .map((e) => e.source)
    )
    .toEqual(["Bless"]);
});

test("a caster without remaining slots cannot cast an ordinary prepared spell", async ({
  page
}) => {
  const sheet = wizard();
  sheet.spellcasting.preparedSpellIds = ["spell-mage-armor"];
  sheet.spellcasting.spellSlotsExpended = [4, 2, 0, 0, 0, 0, 0, 0, 0];
  await openLocalSheet(page, sheet);
  await spellSection(page).getByText("Mage Armor", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Cast", exact: true })).toBeDisabled();
  expect((await savedSheet(page)).spellcasting.spellSlotsExpended).toEqual([
    4, 2, 0, 0, 0, 0, 0, 0, 0
  ]);
});

test("Magic Initiate free casting works on a noncaster, exhausts, and recovers at camp", async ({
  page
}) => {
  await openLocalSheet(
    page,
    portableSheet({ features: { classFeatureState: {}, feats: [magicInitiateFeat()] } })
  );
  await spellSection(page).getByText("Shield", { exact: true }).click();
  await page.getByRole("checkbox", { name: /Magic Initiate/ }).check();
  await page.getByRole("button", { name: "Cast", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).features.feats?.[0]?.magicInitiate?.freeCastExpended)
    .toBe(true);
  expect((await savedSheet(page)).spellcasting.spellSlotsExpended).toEqual(Array(9).fill(0));
  await page.reload();
  await spellSection(page).getByText("Shield", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Cast", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  const camp = page.getByRole("dialog", { name: "Choose your rest" });
  await camp.getByText("Long Rest", { exact: true }).click();
  await expect(camp.getByText(/Magic Initiate/)).toBeVisible();
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).features.feats?.[0]?.magicInitiate?.freeCastExpended ?? false
    )
    .toBe(false);
  await spellSection(page).getByText("Shield", { exact: true }).click();
  await page.getByRole("checkbox", { name: /Magic Initiate/ }).check();
  await expect(page.getByRole("button", { name: "Cast", exact: true })).toBeEnabled();
});

test("preparation capacity blocks an extra spell until another is unprepared", async ({ page }) => {
  const prepared = [
    "spell-shield",
    "spell-mage-armor",
    "spell-magic-missile",
    "spell-detect-magic"
  ];
  await openLocalSheet(
    page,
    portableSheet({
      progression: { className: "Wizard", level: 1, xp: 0 },
      spellcasting: {
        spellbookSpellIds: [...prepared, "spell-sleep"],
        preparedSpellIds: prepared,
        spellSlotsExpended: Array(9).fill(0)
      }
    })
  );
  const editor = await spellOptions(page);
  await editor.getByRole("button", { name: /Manage spellbook & prepare spells/ }).click();
  await expect(editor.getByRole("checkbox", { name: "Prepare Sleep", exact: true })).toBeDisabled();
  await editor.getByRole("checkbox", { name: "Unprepare Shield", exact: true }).click();
  await expect(editor.getByRole("checkbox", { name: "Prepare Sleep", exact: true })).toBeEnabled();
  await editor.getByRole("checkbox", { name: "Prepare Sleep", exact: true }).click();
  await expect(
    editor.getByRole("checkbox", { name: "Prepare Shield", exact: true })
  ).toBeDisabled();
  await editor.getByRole("button", { name: "Close spell options" }).click();
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.preparedSpellIds)
    .toEqual(["spell-mage-armor", "spell-magic-missile", "spell-detect-magic", "spell-sleep"]);
});
