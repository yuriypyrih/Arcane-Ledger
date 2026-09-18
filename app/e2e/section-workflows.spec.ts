import { STATUS_DURATION_KIND } from "../src/types/traits";
import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";

test("profile name validation, cancelling a draft, and saving notes preserve other edits", async ({
  page
}) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Show Character Notes", exact: true }).click();
  const notes = page.getByRole("dialog");
  const nameField = notes
    .locator("section")
    .filter({ has: page.getByLabel("Character name", { exact: true }) });
  await nameField.getByRole("button", { name: "Edit", exact: true }).click();
  await notes.getByLabel("Character name", { exact: true }).fill("");
  await expect(notes.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await nameField.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(notes.getByLabel("Character name", { exact: true })).toHaveValue("Test Adventurer");
  await nameField.getByRole("button", { name: "Edit", exact: true }).click();
  await notes.getByLabel("Character name", { exact: true }).fill("Renamed Adventurer");
  const textField = notes
    .locator("section")
    .filter({ has: page.getByLabel("Character notes", { exact: true }) });
  await textField.getByRole("button", { name: "Edit", exact: true }).click();
  await notes
    .getByLabel("Character notes", { exact: true })
    .fill("Remember the hidden gate.\nCarry the silver key.");
  await notes.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Renamed Adventurer", exact: true })
  ).toBeVisible();
  await expect.poll(async () => (await savedSheet(page)).identity.name).toBe("Renamed Adventurer");
  await page.reload();
  await page.getByRole("button", { name: "Show Character Notes", exact: true }).click();
  await expect(page.getByLabel("Character notes", { exact: true })).toHaveValue(
    "Remember the hidden gate.\nCarry the silver key."
  );
  expect((await savedSheet(page)).vitals.currentHitPoints).toBe(30);
});

test("editing Dexterity updates ability, AC and skills, and persists across reload", async ({
  page
}) => {
  await openLocalSheet(page);
  const stats = page
    .locator("article")
    .filter({ has: page.getByRole("button", { name: "Open character stats guide" }) });
  await stats.getByRole("button", { name: "Edit", exact: true }).click();
  const editor = page.getByRole("dialog");
  await editor.getByRole("spinbutton", { name: /^DEX/ }).fill("20");
  await editor.getByRole("button", { name: /Save/ }).click();
  await expect(page.getByLabel("DEX score 20", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Armor Class 15", exact: true })).toBeVisible();
  await expect(
    page
      .getByRole("listitem")
      .filter({ has: page.getByRole("button", { name: "Acrobatics", exact: true }) })
  ).toContainText("+5");
  await expect.poll(async () => (await savedSheet(page)).abilities.scores.DEX).toBe(20);
  await page.reload();
  await expect(page.getByLabel("DEX score 20", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Armor Class 15", exact: true })).toBeVisible();
});

test("donning and doffing armor changes AC and saves the worn state", async ({ page }) => {
  const sheet = portableSheet();
  sheet.inventory.items = [
    {
      id: "chain",
      item: {
        id: "test-chain",
        key: "test-chain",
        name: "Test Chain Mail",
        category: { key: "heavy-armor", name: "Heavy Armor" },
        armor: {
          category: "heavy",
          ac_base: 16,
          ac_display: "16",
          ac_add_dexmod: false,
          ac_cap_dexmod: 0,
          grants_stealth_disadvantage: true,
          strength_score_required: 13
        }
      },
      quantity: 1,
      onHandQuantity: 0,
      worn: false
    }
  ];
  await openLocalSheet(page, sheet);
  await expect(page.getByRole("button", { name: "Armor Class 12", exact: true })).toBeVisible();
  await page.getByText("Test Chain Mail", { exact: true }).click();
  await page.getByRole("button", { name: "DON", exact: true }).click();
  await page.getByRole("button", { name: "Close item inspection" }).click();
  await expect(page.getByRole("button", { name: "Armor Class 16", exact: true })).toBeVisible();
  await expect.poll(async () => (await savedSheet(page)).inventory.items[0].worn).toBe(true);
  await page.reload();
  await expect(page.getByRole("button", { name: "Armor Class 16", exact: true })).toBeVisible();
  await page.getByText("Test Chain Mail", { exact: true }).click();
  await page.getByRole("button", { name: "DOFF", exact: true }).click();
  await page.getByRole("button", { name: "Close item inspection" }).click();
  await expect(page.getByRole("button", { name: "Armor Class 12", exact: true })).toBeVisible();
  await expect.poll(async () => (await savedSheet(page)).inventory.items[0].worn).toBe(false);
});

test("a long rest preserves health recovery that the player deselects", async ({ page }) => {
  const sheet = portableSheet();
  sheet.vitals.currentHitPoints = 8;
  sheet.vitals.hitDiceRemaining = 0;
  await openLocalSheet(page, sheet);
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  const camp = page.getByRole("dialog", { name: "Choose your rest" });
  await camp.getByText("Long Rest", { exact: true }).click();
  await camp.getByRole("checkbox", { name: "Restore full HP", exact: true }).uncheck();
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).vitals.hitDiceRemaining).toBe(3);
  expect((await savedSheet(page)).vitals.currentHitPoints).toBe(8);
  await expect(page.getByText("8/30 HP", { exact: true })).toBeVisible();
});

test("companion duplication is independent and deletion requires confirmation", async ({
  page
}) => {
  const sheet = portableSheet();
  sheet.companions.entries = [
    {
      id: "owl",
      name: "Scout Owl",
      description: "",
      type: "Beast",
      source: "Manual",
      separateInitiative: false,
      maxHitPoints: 12,
      currentHitPoints: 7,
      temporaryHitPoints: 2,
      duration: { kind: STATUS_DURATION_KIND.INFINITE }
    }
  ];
  await openLocalSheet(page, sheet);
  await page.getByRole("button", { name: "Duplicate Scout Owl", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).companions.entries.length).toBe(2);
  const companions = (await savedSheet(page)).companions.entries;
  expect(new Set(companions.map((c) => c.id)).size).toBe(2);
  expect(companions.map((c) => c.currentHitPoints)).toEqual([7, 7]);
  await page.getByRole("button", { name: "Remove Scout Owl", exact: true }).first().click();
  const confirmation = page.getByRole("dialog", { name: "Delete companion?" });
  await confirmation.getByRole("button", { name: "Cancel", exact: true }).click();
  expect((await savedSheet(page)).companions.entries).toHaveLength(2);
  await page.getByRole("button", { name: "Remove Scout Owl", exact: true }).first().click();
  await confirmation.getByRole("button", { name: "Delete", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).companions.entries.length).toBe(1);
  await page.reload();
  await expect(page.getByRole("button", { name: /^Inspect Scout Owl/ }).first()).toBeVisible();
  expect((await savedSheet(page)).companions.entries[0].currentHitPoints).toBe(7);
});
