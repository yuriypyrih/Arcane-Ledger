import type { Page } from "@playwright/test";
import { test, expect, openLocalSheet, savedSheet, portableSheet } from "./fixtures";

async function openClassEditor(page: Page) {
  await page
    .getByRole("region", { name: "Class Features", exact: true })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Edit Class and Subclass", exact: true });
}

test("one shared rules checkbox controls existing and newly added classes and cancels cleanly", async ({
  page
}) => {
  await openLocalSheet(page, allocationSheet());
  const original = await savedSheet(page);
  let editor = await openClassEditor(page);
  let checkbox = editor.getByRole("checkbox", { name: /Class rules enforcement/ });
  await expect(checkbox).toHaveCount(1);
  await expect(checkbox).toBeChecked();
  await expect(editor.getByRole("region").getByRole("checkbox")).toHaveCount(0);
  const add = await editor
    .getByRole("button", { name: "Add Multiclass", exact: true })
    .boundingBox();
  const divider = await editor.getByRole("separator").boundingBox();
  const label = await editor.getByText("Class rules enforcement", { exact: true }).boundingBox();
  expect(add!.y + add!.height).toBeLessThan(divider!.y);
  expect(divider!.y).toBeLessThan(label!.y);
  await checkbox.uncheck();
  await editor.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await savedSheet(page)).toEqual(original);
  editor = await openClassEditor(page);
  checkbox = editor.getByRole("checkbox", { name: /Class rules enforcement/ });
  await checkbox.uncheck();
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await editor.getByLabel("Multiclass 2 class").selectOption("Bard");
  await expect(checkbox).not.toBeChecked();
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.reload();
  expect(
    (await savedSheet(page)).progression.multiclass!.classes.map(
      (entry) => entry.classRules?.classRulesEnforced
    )
  ).toEqual([false, false, false]);
  editor = await openClassEditor(page);
  await editor.getByRole("checkbox", { name: /Class rules enforcement/ }).check();
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await editor.getByLabel("Multiclass 3 class").selectOption("Custom");
  await expect(editor.getByRole("checkbox", { name: /Class rules enforcement/ })).toBeChecked();
  await editor.getByRole("separator").scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath("shared-class-rules.png") });
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.reload();
  expect(
    (await savedSheet(page)).progression.multiclass!.classes.map(
      (entry) => entry.classRules?.classRulesEnforced
    )
  ).toEqual([true, true, true, false]);
});

for (const multiclass of [false, true]) {
  test(`${multiclass ? "multiclass" : "single-class"} progression requires the explicit Level beyond 20 button`, async ({
    page
  }) => {
    const sheet = multiclass ? allocationSheet() : portableSheet();
    sheet.progression.level = 19;
    sheet.progression.xp = 305000;
    if (sheet.progression.multiclass) {
      sheet.progression.multiclass.classes[0].level = 17;
      sheet.progression.multiclass.classes[1].level = 2;
    }
    await openLocalSheet(page, sheet);
    await page.getByRole("button", { name: "Level 19", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Experience & classes" });
    await expect(dialog.getByRole("button", { name: "Level beyond 20", exact: true })).toHaveCount(
      0
    );
    await dialog.getByRole("button", { name: "Level Up", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Level Up", exact: true })).toBeDisabled();
    await dialog.getByRole("button", { name: "Level beyond 20", exact: true }).click();
    const primary = multiclass ? "Wizard" : "Fighter";
    if (multiclass) {
      await expect(dialog.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
      await dialog.getByLabel(`${primary} class level`).fill("19");
    } else {
      await expect(dialog.getByLabel("Fighter class level")).toHaveValue("21");
    }
    await page.screenshot({ path: test.info().outputPath("level-beyond-20.png") });
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await page.reload();
    expect((await savedSheet(page)).progression.level).toBe(21);
    await page.getByRole("button", { name: "Level 21", exact: true }).click();
    await dialog.getByRole("button", { name: "Level beyond 20", exact: true }).click();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    expect((await savedSheet(page)).progression.level).toBe(21);
  });
}

test("level editing hides the beyond-20 button while XP changes still require the opt-in", async ({
  page
}) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Level 3", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Experience & classes" });
  await dialog.getByRole("button", { name: "Edit level", exact: true }).click();
  await dialog.getByRole("spinbutton", { name: "Total character level", exact: true }).fill("21");
  await expect(dialog.getByRole("button", { name: "Level beyond 20", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await dialog.getByRole("button", { name: "Confirm level", exact: true }).click();
  await expect(dialog.getByLabel("Fighter class level")).toHaveValue("21");
  await expect(dialog.getByRole("button", { name: "Level beyond 20", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Edit level", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Level beyond 20", exact: true })).toHaveCount(0);
  await dialog.getByRole("spinbutton", { name: "Total character level", exact: true }).fill("22");
  await dialog.getByRole("button", { name: "Cancel level", exact: true }).click();
  await expect(dialog.getByLabel("Fighter class level")).toHaveValue("21");
  await expect(dialog.getByRole("button", { name: "Level beyond 20", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Level 3", exact: true }).click();
  await dialog.getByRole("button", { name: "Edit XP", exact: true }).click();
  await dialog.getByLabel("Experience points", { exact: true }).fill("385000");
  await dialog.getByRole("button", { name: "Confirm XP", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Level beyond 20");
  await dialog.getByRole("button", { name: "Level beyond 20", exact: true }).click();
  await dialog.getByRole("button", { name: "Confirm XP", exact: true }).click();
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  expect((await savedSheet(page)).progression.level).toBe(21);
});

test("an existing character declares a class at zero, allocates levels separately, and switches builds after reload", async ({
  page
}) => {
  const original = portableSheet();
  original.vitals.maxHitPointsMode = "automatic";
  original.vitals.hitPoints = 28;
  original.vitals.currentHitPoints = 17;
  await openLocalSheet(page, original);
  await expect(page.getByText("17/28 HP", { exact: true })).toBeVisible();
  const editor = await openClassEditor(page);
  await expect(editor.getByLabel("Primary class")).toBeDisabled();
  await expect(editor.getByRole("button", { name: "Remove Fighter", exact: true })).toHaveCount(0);
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await editor.getByLabel("Multiclass 1 class").selectOption("Wizard");
  await editor.getByLabel("Wizard subclass").selectOption("wizard-diviner");
  await expect(editor.getByLabel("Wizard class level")).toHaveCount(0);
  expect((await savedSheet(page)).schemaVersion).toBe(2);
  await page.screenshot({ path: test.info().outputPath("class-definitions.png") });
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).schemaVersion).toBe(3);
  await page.reload();
  expect(
    (await savedSheet(page)).progression.multiclass?.classes.map((entry) => entry.level)
  ).toEqual([3, 0]);
  expect((await savedSheet(page)).vitals.currentHitPoints).toBe(17);
  expect((await savedSheet(page)).vitals.hitPoints).toBe(28);
  await expect(page.getByText("17/28 HP", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Class build", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open spellcasting guide" })).toHaveCount(0);
  await page.getByRole("button", { name: "Level 3", exact: true }).click();
  const progress = page.getByRole("dialog", { name: "Experience & classes" });
  await expect(progress.getByRole("combobox")).toHaveCount(0);
  await expect(progress.getByRole("button", { name: "Add Multiclass", exact: true })).toHaveCount(
    0
  );
  await expect(progress.getByRole("button", { name: /^Remove / })).toHaveCount(0);
  await expect(progress.getByLabel("Wizard class level")).toHaveValue("0");
  await progress.getByRole("button", { name: "Level Up", exact: true }).click();
  await progress.getByRole("button", { name: "Increase Wizard level", exact: true }).click();
  await progress.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).progression.level).toBe(4);
  await expect(page.getByText("17/34 HP", { exact: true })).toBeVisible();
  await page.reload();
  expect((await savedSheet(page)).vitals.hitPoints).toBe(34);
  await page.getByLabel("Class build", { exact: true }).selectOption({ label: "Wizard 1" });
  await expect(page.getByText("Arcane Recovery", { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel("Spell source", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Spell slot pool", { exact: true })).toHaveCount(0);
  const wizardId = (await savedSheet(page)).progression.multiclass!.classes[1].id;
  await page.getByRole("button", { name: "Deal 1 hit points", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).vitals.currentHitPoints).toBe(16);
  await expect(page.getByLabel("Class build", { exact: true })).toHaveValue(wizardId);
  await page.getByRole("button", { name: "Level 4", exact: true }).click();
  await progress.getByLabel("Fighter class level").fill("1");
  await progress.getByLabel("Wizard class level").fill("3");
  await progress.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("16/30 HP", { exact: true })).toBeVisible();
  await page.reload();
  expect((await savedSheet(page)).vitals).toMatchObject({ hitPoints: 30, currentHitPoints: 16 });
  await expect(page.getByText("16/30 HP", { exact: true })).toBeVisible();
});

test("multiclass short rests expose mixed Hit Dice and recover Pact slots without recovering shared slots", async ({
  page
}) => {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Wizard",
    level: 5,
    xp: 6500,
    multiclass: {
      classes: [
        { id: "wizard", className: "Wizard", level: 2 },
        { id: "warlock", className: "Warlock", level: 3 }
      ],
      startingClassId: "wizard",
      slotPoolsExpended: { "pact:warlock": [0, 2] },
      hitDiceExpended: { d6: 1, d8: 1 }
    }
  };
  sheet.spellcasting.spellSlotsExpended = [2];
  await openLocalSheet(page, sheet);
  await page.getByLabel("Spell source", { exact: true }).selectOption("warlock");
  await page.getByLabel("Spell slot pool", { exact: true }).selectOption("pact:warlock");
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  const camp = page.getByRole("dialog", { name: "Choose your rest" });
  await camp.getByText("Short Rest", { exact: true }).click();
  await expect(camp.getByRole("group", { name: "Wizard D6 Hit Dice", exact: true })).toContainText(
    "1 / 2 available"
  );
  await expect(camp.getByRole("group", { name: "Warlock D8 Hit Dice", exact: true })).toContainText(
    "2 / 3 available"
  );
  await expect(camp.getByRole("spinbutton")).toHaveCount(0);
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).progression.multiclass?.slotPoolsExpended?.["pact:warlock"]?.[1]
    )
    .toBe(0);
  expect((await savedSheet(page)).spellcasting.spellSlotsExpended?.[0]).toBe(2);
  await page.reload();
  expect((await savedSheet(page)).progression.multiclass?.classes).toHaveLength(2);
});

test("opening and cancelling class management leaves a legacy save untouched", async ({ page }) => {
  await openLocalSheet(page);
  const before = await savedSheet(page);
  const editor = await openClassEditor(page);
  await expect(editor.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await expect(editor.getByLabel("Multiclass 1 class")).toHaveValue("");
  await editor.getByLabel("Multiclass 1 class").selectOption("Bard");
  await editor.getByLabel("Bard skill proficiency").selectOption("Animal Handling");
  await editor.getByRole("button", { name: "Cancel", exact: true }).click();
  expect((await savedSheet(page)).progression).toEqual(before.progression);
  expect((await savedSheet(page)).schemaVersion).toBe(2);
});

test("three casters keep preparation separate, preserve domain grants, and can pay a Wizard spell with Pact Magic", async ({
  page
}) => {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Wizard",
    level: 9,
    xp: 48000,
    multiclass: {
      classes: [
        {
          id: "wizard",
          className: "Wizard",
          level: 3,
          spellbookSpellIds: ["spell-mage-armor", "spell-detect-magic"],
          preparedSpellIds: ["spell-mage-armor"]
        },
        {
          id: "cleric",
          className: "Cleric",
          level: 3,
          subclassId: "cleric-life-domain",
          preparedSpellIds: []
        },
        { id: "warlock", className: "Warlock", level: 3 }
      ],
      startingClassId: "wizard"
    }
  };
  sheet.spellcasting.spellSlotsExpended = [];
  await openLocalSheet(page, sheet);
  const spells = page
    .locator("article")
    .filter({ has: page.getByRole("button", { name: "Open spellcasting guide" }) });
  await expect(spells.getByLabel("Spell source", { exact: true })).toBeVisible();
  await spells.getByLabel("Spell slot pool", { exact: true }).selectOption("pact:warlock");
  await spells.screenshot({ path: test.info().outputPath("spell-sources.png") });
  await spells.getByText("Mage Armor", { exact: true }).click();
  await page.getByRole("button", { name: "Cast", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).progression.multiclass?.slotPoolsExpended?.["pact:warlock"]?.[1]
    )
    .toBe(1);
  expect(
    (await savedSheet(page)).spellcasting.spellSlotsExpended?.every((count) => count === 0)
  ).toBe(true);
  await page.reload();
  await page.getByLabel("Spell source", { exact: true }).selectOption("cleric");
  await page.getByLabel("Spell slot pool", { exact: true }).selectOption("standard");
  await spells.getByRole("button", { name: "Edit", exact: true }).click();
  const options = page.getByRole("dialog");
  await options.getByRole("button", { name: /^Prepare spells/ }).click();
  await expect(
    options.getByRole("checkbox", { name: "Deselect Bless", exact: true })
  ).toBeDisabled();
  await expect(
    options.getByRole("checkbox", { name: "Select Guiding Bolt", exact: true })
  ).toBeEnabled();
  await expect(options.getByRole("checkbox", { name: /Select Revivify/ })).toHaveCount(0);
  await options.getByRole("checkbox", { name: "Select Guiding Bolt", exact: true }).click();
  await options.getByRole("button", { name: "Close spell options" }).click();
  await spells.getByText("Bless", { exact: true }).click();
  await page.getByRole("button", { name: "Cast", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.spellSlotsExpended?.[0])
    .toBe(1);
  const saved = await savedSheet(page);
  expect(saved.progression.multiclass?.classes[0].preparedSpellIds).toEqual(["spell-mage-armor"]);
  expect(saved.progression.multiclass?.classes[1].preparedSpellIds).toEqual(["spell-guiding-bolt"]);
  expect(saved.progression.multiclass?.slotPoolsExpended?.["pact:warlock"]?.[1]).toBe(1);
});

test("five-class characters load only the selected build choice module in the page", async ({
  page
}) => {
  const requests = new Set<string>();
  page.on("request", (request) => {
    const match = request.url().match(/\/choiceModels\/(\w+)\.tsx?/);
    if (match && ["fighter", "wizard", "cleric", "rogue", "bard"].includes(match[1]))
      requests.add(match[1]);
  });
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Fighter",
    level: 15,
    xp: 165000,
    multiclass: {
      classes: ["Fighter", "Wizard", "Cleric", "Rogue", "Bard"].map((className) => ({
        id: className,
        className,
        level: 3
      })),
      startingClassId: "Fighter"
    }
  };
  await openLocalSheet(page, sheet);
  await expect.poll(() => requests.has("fighter")).toBe(true);
  expect([...requests]).toEqual(["fighter"]);
  const editor = await openClassEditor(page);
  await expect(editor.getByRole("region", { name: /class options$/ })).toHaveCount(5);
  expect([...requests]).toEqual(["fighter"]);
  await editor.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByLabel("Class build", { exact: true }).selectOption("Wizard");
  await expect(page.getByText("Arcane Recovery", { exact: true }).first()).toBeVisible();
  await expect.poll(() => requests.has("wizard")).toBe(true);
  expect([...requests].sort()).toEqual(["fighter", "wizard"]);
  await page.getByRole("button", { name: "Deal 1 hit points", exact: true }).click();
  await expect(page.getByLabel("Class build", { exact: true })).toHaveValue("Wizard");
  expect([...requests].sort()).toEqual(["fighter", "wizard"]);
});

test("a secondary Sorcerer can convert a Pact slot from the action drawer", async ({ page }) => {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Fighter",
    level: 7,
    xp: 23000,
    multiclass: {
      classes: [
        { id: "fighter", className: "Fighter", level: 1 },
        { id: "sorcerer", className: "Sorcerer", level: 3 },
        { id: "warlock", className: "Warlock", level: 3 }
      ],
      startingClassId: "fighter"
    }
  };
  sheet.features.classFeatureState = { sorcerer: { sorceryPointsExpended: 3 } };
  sheet.spellcasting.spellSlotsExpended = [];
  await openLocalSheet(page, sheet);
  await page.getByRole("button", { name: /^Font of Magic/ }).click();
  await page.getByLabel("Action spell slot pool", { exact: true }).selectOption("pact:warlock");
  await page.getByRole("radio", { name: /Level 2 Spell Slot/ }).check();
  await page.getByRole("button", { name: "Use Font of Magic", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).progression.multiclass?.slotPoolsExpended?.["pact:warlock"]?.[1]
    )
    .toBe(1);
  expect((await savedSheet(page)).features.classFeatureState?.sorcerer?.sorceryPointsExpended).toBe(
    1
  );
  expect((await savedSheet(page)).progression.className).toBe("Fighter");
  expect(
    (await savedSheet(page)).spellcasting.spellSlotsExpended?.every((count) => count === 0)
  ).toBe(true);
});

test("one shared slot pool stays implicit while both casting sources remain inside the spellcasting section", async ({
  page
}) => {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Wizard",
    level: 5,
    xp: 6500,
    multiclass: {
      classes: [
        { id: "wizard", className: "Wizard", level: 3 },
        { id: "cleric", className: "Cleric", level: 2 }
      ],
      startingClassId: "wizard"
    }
  };
  await openLocalSheet(page, sheet);
  const spells = page
    .locator("article")
    .filter({ has: page.getByRole("button", { name: "Open spellcasting guide" }) });
  await expect(spells.getByLabel("Spell source", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Spell slot pool", { exact: true })).toHaveCount(0);
  await spells.getByLabel("Spell source", { exact: true }).selectOption("cleric");
  await expect(spells.getByLabel("Spell source", { exact: true })).toHaveValue("cleric");
  await page.getByRole("button", { name: "Level 5", exact: true }).click();
  const progress = page.getByRole("dialog", { name: "Experience & classes" });
  await expect(progress.getByRole("progressbar", { name: "Experience progress" })).toBeVisible();
  await progress.getByRole("button", { name: "Add XP", exact: true }).click();
  await progress.getByLabel("XP to add", { exact: true }).fill("100");
  await progress.getByRole("button", { name: "Confirm XP" }).click();
  await progress.getByRole("button", { name: "Save" }).click();
  await expect.poll(async () => (await savedSheet(page)).progression.xp).toBe(6600);
  expect(
    (await savedSheet(page)).progression.multiclass?.classes.map((entry) => entry.level)
  ).toEqual([3, 2]);
});

test("ordinary XP and level changes use the shared modal and keep the single-class format", async ({
  page
}) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Level 3", exact: true }).click();
  const progress = page.getByRole("dialog", { name: "Experience & classes", exact: true });
  await progress.getByRole("button", { name: "Add XP", exact: true }).click();
  await progress.getByLabel("XP to add", { exact: true }).fill("100");
  await progress.getByRole("button", { name: "Confirm XP", exact: true }).click();
  await progress.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).progression.xp).toBe(1000);
  expect((await savedSheet(page)).schemaVersion).toBe(2);
  await page.getByRole("button", { name: "Level 3", exact: true }).click();
  await expect(progress.getByRole("button", { name: "Add Multiclass", exact: true })).toHaveCount(
    0
  );
  await progress.getByRole("button", { name: "Level Up", exact: true }).click();
  await expect(progress.getByLabel("Fighter class level")).toHaveValue("4");
  await progress.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).progression.level).toBe(4);
  expect((await savedSheet(page)).schemaVersion).toBe(2);
  expect((await savedSheet(page)).progression.multiclass).toBeUndefined();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).some((key) => key.startsWith("arcane-ledger.pre-multiclass."))
    )
  ).toBe(false);
  await page.reload();
  await page.getByRole("button", { name: "Level 4", exact: true }).click();
  await expect(progress.getByLabel("Fighter class level")).toHaveValue("4");
  await expect(progress.getByRole("button", { name: "Add Multiclass", exact: true })).toHaveCount(
    0
  );
});

test("creation keeps the original profile layout and multiclassing starts from the sheet", async ({
  page
}) => {
  await page.goto("/characters/new");
  await page.getByLabel("Character name", { exact: true }).fill("New Multiclass Hero");
  await page.getByLabel("Class", { exact: true }).selectOption("Wizard");
  await page.getByLabel("Level", { exact: true }).fill("5");
  await page.getByLabel("Species", { exact: true }).selectOption("Human");
  await page.getByLabel("Background", { exact: true }).selectOption("Sage");
  await expect(page.getByRole("button", { name: "Add multiclass", exact: true })).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Character classes" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open multiclass guide", exact: true })
  ).toBeVisible();
  if (test.info().project.name === "desktop") {
    const name = await page.getByLabel("Character name", { exact: true }).boundingBox();
    const level = await page.getByLabel("Level", { exact: true }).boundingBox();
    const classBox = await page.getByLabel("Class", { exact: true }).boundingBox();
    const subclass = await page.getByLabel("Subclass", { exact: true }).boundingBox();
    expect(Math.abs(name!.y - level!.y)).toBeLessThan(2);
    expect(Math.abs(classBox!.y - subclass!.y)).toBeLessThan(2);
    expect(classBox!.y).toBeGreaterThan(level!.y + level!.height);
  }
  await page.screenshot({ path: test.info().outputPath("core-profile.png"), fullPage: true });
  await page.getByRole("button", { name: "Customize based on your needs" }).click();
  await expect(page.getByRole("region", { name: "Multiclass choices" })).toHaveCount(0);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Level", { exact: true })).toHaveValue("5");
  await page.getByRole("button", { name: "Create with recommended build", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "New Multiclass Hero", exact: true })
  ).toBeVisible();
  const original = await savedSheet(page);
  expect(original.schemaVersion).toBe(2);
  expect(original.progression.level).toBe(5);
  expect(original.progression.multiclass).toBeUndefined();
  await page.getByRole("button", { name: "Deal 1 hit points", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).vitals.currentHitPoints)
    .toBe(original.vitals.currentHitPoints - 1);
  const editor = await openClassEditor(page);
  const dialog = page.getByRole("dialog", { name: "Experience & classes" });
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await editor
    .getByRole("combobox", { name: /^Multiclass \d+ class$/ })
    .last()
    .selectOption("Cleric");
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.getByRole("button", { name: "Level 5", exact: true }).click();
  await dialog.getByLabel("Wizard class level").fill("3");
  await dialog.getByLabel("Cleric class level").fill("2");
  await expect(dialog.getByRole("status", { name: "Level allocation" })).toContainText(
    "5 / 5 allocated"
  );
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect.poll(async () => (await savedSheet(page)).schemaVersion).toBe(3);
  const saved = await savedSheet(page);
  expect(
    saved.progression.multiclass?.classes.map((entry) => [entry.className, entry.level])
  ).toEqual([
    ["Wizard", 3],
    ["Cleric", 2]
  ]);
  expect(saved.progression.level).toBe(5);
  expect(saved.progression.xp).toBe(original.progression.xp);
  expect(saved.inventory).toEqual(original.inventory);
  expect(saved.vitals.currentHitPoints).toBe(original.vitals.currentHitPoints - 1);
  await page.reload();
  await page.getByLabel("Class build", { exact: true }).selectOption({ label: "Cleric 2" });
  await expect(page.getByLabel("Spell source", { exact: true })).toBeVisible();
  await page.goto(`/characters/${saved.identity.localId}/edit`);
  await expect(page.getByLabel("Level", { exact: true })).toHaveValue("5");
  await expect(page.getByLabel("Level", { exact: true })).toHaveAttribute("readonly", "");
  await expect(page.getByLabel("Class", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Cleric class level")).toHaveCount(0);
  await page.getByLabel("Character name", { exact: true }).fill("Edited Multiclass Hero");
  await page.getByRole("button", { name: "Update character", exact: true }).click();
  await expect(page).toHaveURL(/\/characters$/);
  const edited = await savedSheet(page);
  expect(edited.identity.name).toBe("Edited Multiclass Hero");
  expect(edited.progression.multiclass?.classes.map((entry) => entry.level)).toEqual([3, 2]);
  expect(edited.vitals.currentHitPoints).toBe(saved.vitals.currentHitPoints);
});

test("a saved progression with one class needs no build, source, or payment selector", async ({
  page
}) => {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Wizard",
    level: 3,
    xp: 900,
    multiclass: {
      classes: [{ id: "wizard", className: "Wizard", level: 3 }],
      startingClassId: "wizard"
    }
  };
  await openLocalSheet(page, sheet);
  await expect(page.getByRole("button", { name: "Open spellcasting guide" })).toBeVisible();
  await expect(page.getByLabel("Spell source", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Spell slot pool", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Class build", { exact: true })).toHaveCount(0);
});

test("class progression remains usable in the dark theme", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("arcane-ledger.preferences", JSON.stringify({ themeMode: "dark" }))
  );
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Fighter",
    level: 4,
    xp: 2700,
    multiclass: {
      classes: [
        { id: "fighter", className: "Fighter", level: 3 },
        { id: "wizard", className: "Wizard", level: 1 }
      ],
      startingClassId: "fighter"
    }
  };
  await openLocalSheet(page, sheet);
  await page.getByRole("button", { name: "Level 4", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Experience & classes" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(dialog.getByRole("button", { name: "Save" })).toBeDisabled();
  await expect(dialog.getByRole("progressbar", { name: "Experience progress" })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("class-progression-dark.png") });
  await expect(dialog.getByRole("button", { name: /^Level up Wizard$/i })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Level Up", exact: true }).click();
  await expect(dialog.getByRole("status", { name: "Level allocation" })).toContainText(
    "4 / 5 allocated"
  );
  await expect(dialog.getByRole("button", { name: "Save" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Increase Wizard level", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
  await page.screenshot({ path: test.info().outputPath("class-progress-edited-dark.png") });
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect((await savedSheet(page)).progression.level).toBe(4);
});

function allocationSheet() {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Wizard",
    level: 5,
    xp: 6500,
    multiclass: {
      classes: [
        { id: "wizard", className: "Wizard", level: 3 },
        { id: "fighter", className: "Fighter", level: 2 }
      ],
      startingClassId: "wizard"
    }
  };
  return sheet;
}

test("class groups preserve training and deleting a class returns its levels without granting equipment", async ({
  page
}) => {
  await openLocalSheet(page, allocationSheet());
  const original = await savedSheet(page);
  await page.getByLabel("Class build", { exact: true }).selectOption("fighter");
  const editor = await openClassEditor(page);
  await expect(editor.getByLabel("Primary class")).toHaveValue("Wizard");
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await expect(
    editor.getByLabel("Multiclass 2 class").locator('option[value="Wizard"]')
  ).toHaveJSProperty("disabled", true);
  await editor.getByLabel("Multiclass 2 class").selectOption("Bard");
  await editor.getByLabel("Bard skill proficiency").selectOption("Animal Handling");
  await editor.getByLabel("Bard instrument proficiency").selectOption("MUSICAL_INSTRUMENT_LUTE");
  await editor.getByRole("button", { name: "Remove Fighter", exact: true }).click();
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await editor.getByLabel("Multiclass 2 class").selectOption("Ranger");
  await expect(
    editor.getByLabel("Ranger skill proficiency").locator('option[value="Animal Handling"]')
  ).toHaveJSProperty("disabled", true);
  await editor.getByRole("button", { name: "Remove Ranger", exact: true }).click();
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .poll(async () =>
      (await savedSheet(page)).progression.multiclass?.classes.map((entry) => entry.level)
    )
    .toEqual([5, 0]);
  await page.getByRole("button", { name: "Level 5", exact: true }).click();
  const levels = page.getByRole("dialog", { name: "Experience & classes" });
  await levels.getByLabel("Wizard class level").fill("3");
  await levels.getByLabel("Bard class level").fill("2");
  await levels.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).progression.multiclass?.classes[1].level)
    .toBe(2);
  await page.reload();
  const saved = await savedSheet(page);
  expect(saved.progression.multiclass?.classes[1]).toMatchObject({
    className: "Bard",
    level: 2,
    skillChoices: ["Animal Handling"],
    toolChoices: ["MUSICAL_INSTRUMENT_LUTE"]
  });
  expect(saved.progression.level).toBe(5);
  expect(saved.progression.xp).toBe(6500);
  expect(saved.inventory).toEqual(original.inventory);
});

test("one central level-up creates points and XP changes require a matching allocation", async ({
  page
}) => {
  await openLocalSheet(page, allocationSheet());
  await page.getByRole("button", { name: "Level 5", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Experience & classes" });
  const save = dialog.getByRole("button", { name: "Save" });
  await dialog.getByRole("button", { name: "Level Up", exact: true }).click();
  await expect(dialog.getByLabel("Wizard class level")).toHaveValue("3");
  await expect(dialog.getByLabel("Fighter class level")).toHaveValue("2");
  await expect(dialog.getByRole("status", { name: "Level allocation" })).toContainText(
    "5 / 6 allocated"
  );
  await expect(save).toBeDisabled();
  await dialog.getByRole("button", { name: "Increase Wizard level", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Increase Fighter level", exact: true })
  ).toBeDisabled();
  await expect(save).toBeEnabled();
  await dialog.getByRole("region", { name: "Total character level" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath("level-allocation.png") });
  await dialog.getByRole("button", { name: "Edit level", exact: true }).click();
  await dialog.getByRole("spinbutton", { name: "Total character level", exact: true }).fill("0");
  await dialog.getByRole("button", { name: "Confirm level", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Enter a whole level");
  await dialog.getByRole("button", { name: "Cancel level", exact: true }).click();
  await dialog.getByRole("button", { name: "Add XP", exact: true }).click();
  await dialog.getByLabel("XP to add").fill("10000");
  await dialog.getByRole("button", { name: "Cancel XP", exact: true }).click();
  await expect(dialog.getByRole("status", { name: "Level allocation" })).toContainText(
    "6 / 6 allocated"
  );
  await dialog.getByRole("button", { name: "Edit XP", exact: true }).click();
  await dialog.getByLabel("Experience points", { exact: true }).fill("3000");
  await dialog.getByRole("button", { name: "Confirm XP", exact: true }).click();
  await expect(dialog.getByRole("status", { name: "Level allocation" })).toContainText(
    "6 / 4 allocated"
  );
  await expect(save).toBeDisabled();
  await dialog.getByLabel("Wizard class level").fill("2");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect.poll(async () => (await savedSheet(page)).progression.level).toBe(4);
  const saved = await savedSheet(page);
  expect(saved.progression.xp).toBe(3000);
  expect(saved.progression.multiclass?.classes.map((entry) => entry.level)).toEqual([2, 2]);
  await page.reload();
  await expect(page.getByRole("button", { name: "Level 4", exact: true })).toBeVisible();
});

test("removing the last secondary class gives every point to the remaining class", async ({
  page
}) => {
  await openLocalSheet(page, allocationSheet());
  const editor = await openClassEditor(page);
  await editor.getByRole("button", { name: "Remove Fighter", exact: true }).click();
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.getByRole("button", { name: "Level 5", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Experience & classes" });
  await expect(dialog.getByLabel("Wizard class level")).toHaveValue("5");
  await dialog.getByRole("button", { name: "Level Up", exact: true }).click();
  await expect(dialog.getByLabel("Wizard class level")).toHaveValue("6");
  await expect(dialog.getByRole("status", { name: "Level allocation" })).toContainText(
    "6 / 6 allocated"
  );
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect.poll(async () => (await savedSheet(page)).progression.level).toBe(6);
  expect((await savedSheet(page)).progression.multiclass?.classes).toMatchObject([
    { className: "Wizard", level: 6 }
  ]);
  await expect(page.getByLabel("Class build", { exact: true })).toHaveCount(0);
});

test("a skill becomes available again after removing the class that granted it", async ({
  page
}) => {
  const sheet = allocationSheet();
  sheet.progression.multiclass!.classes[1] = {
    id: "bard",
    className: "Bard",
    level: 2,
    skillChoices: ["Animal Handling"]
  };
  await openLocalSheet(page, sheet);
  const dialog = await openClassEditor(page);
  await dialog.getByRole("button", { name: "Remove Bard", exact: true }).click();
  await dialog.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await dialog
    .getByRole("combobox", { name: /^Multiclass \d+ class$/ })
    .last()
    .selectOption("Ranger");
  await expect(
    dialog.getByLabel("Ranger skill proficiency").locator('option[value="Animal Handling"]')
  ).toHaveJSProperty("disabled", false);
  await dialog.getByLabel("Ranger skill proficiency").selectOption("Animal Handling");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect
    .poll(async () => (await savedSheet(page)).progression.multiclass?.classes[1].className)
    .toBe("Ranger");
  expect((await savedSheet(page)).progression.multiclass?.classes[1].skillChoices).toEqual([
    "Animal Handling"
  ]);
});

test("class progression locks the starting class and keeps each compact control's hover independent", async ({
  page
}) => {
  await openLocalSheet(page, allocationSheet());
  await page.getByRole("button", { name: "Level 5", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Experience & classes" });
  await expect(dialog.getByText("Advanced options", { exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Remove Wizard", exact: true })).toHaveCount(0);
  await expect(dialog.getByText("Hit point rolls", { exact: true })).toHaveCount(0);
  await expect(dialog.getByLabel(/HP rolls/)).toHaveCount(0);
  await dialog.getByRole("button", { name: "Level Up", exact: true }).click();
  const row = dialog.getByRole("region", { name: "Wizard progression", exact: true });
  const headingBox = await row.getByRole("heading", { name: "Wizard", exact: true }).boundingBox();
  const inputBox = await row.getByLabel("Wizard class level", { exact: true }).boundingBox();
  expect(inputBox!.x).toBeGreaterThan(headingBox!.x + headingBox!.width);
  expect(
    Math.abs(inputBox!.y + inputBox!.height / 2 - headingBox!.y - headingBox!.height / 2)
  ).toBeLessThan(20);
  const minusBox = await row
    .getByRole("button", { name: "Decrease Wizard level", exact: true })
    .boundingBox();
  const plusBox = await row
    .getByRole("button", { name: "Increase Wizard level", exact: true })
    .boundingBox();
  expect(inputBox!.x - minusBox!.x - minusBox!.width).toBeGreaterThanOrEqual(7);
  expect(plusBox!.x - inputBox!.x - inputBox!.width).toBeGreaterThanOrEqual(7);
  for (const label of ["Cancel", "Save"]) {
    await expect(
      dialog.getByRole("button", { name: label, exact: true }).locator("svg")
    ).toHaveCount(1);
  }
  if (test.info().project.name === "desktop") {
    const minus = row.getByRole("button", { name: "Decrease Wizard level", exact: true });
    const plus = row.getByRole("button", { name: "Increase Wizard level", exact: true });
    await minus.hover();
    await expect
      .poll(() => minus.evaluate((element) => getComputedStyle(element, "::before").opacity))
      .toBe("1");
    await expect
      .poll(() => plus.evaluate((element) => getComputedStyle(element, "::before").opacity))
      .toBe("0");
    await plus.hover();
    await expect
      .poll(() => minus.evaluate((element) => getComputedStyle(element, "::before").opacity))
      .toBe("0");
    await expect
      .poll(() => plus.evaluate((element) => getComputedStyle(element, "::before").opacity))
      .toBe("1");
  }
  await row.scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath("compact-class-progression.png") });
});

test("compact class groups reset replaced choices and save declarations at zero", async ({
  page
}) => {
  await openLocalSheet(page, allocationSheet());
  const editor = await openClassEditor(page);
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  const newClass = editor.getByLabel("Multiclass 2 class");
  await expect(newClass).toHaveValue("");
  await expect(editor.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await newClass.selectOption("Bard");
  await editor.getByLabel("Bard subclass").selectOption("bard-college-of-lore");
  await editor.getByLabel("Bard skill proficiency").selectOption("Animal Handling");
  await editor.getByLabel("Bard instrument proficiency").selectOption("MUSICAL_INSTRUMENT_LUTE");
  await editor.getByRole("region", { name: "Bard class options" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath("class-options-compact.png") });
  await newClass.selectOption("Ranger");
  await expect(editor.getByLabel("Ranger skill proficiency")).toHaveValue("");
  await expect(editor.getByLabel("Ranger subclass")).toHaveValue("");
  await expect(editor.getByLabel("Bard instrument proficiency")).toHaveCount(0);
  await editor.getByLabel("Ranger skill proficiency").selectOption("Animal Handling");
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.reload();
  const classes = (await savedSheet(page)).progression.multiclass!.classes;
  expect(classes.map((entry) => entry.level)).toEqual([3, 2, 0]);
  expect(classes[2].skillChoices).toEqual(["Animal Handling"]);
  expect(classes[2].toolChoices ?? []).toEqual([]);
});

test("a secondary class can return to zero without deleting its definition", async ({ page }) => {
  await openLocalSheet(page, allocationSheet());
  await page.getByRole("button", { name: "Level 5", exact: true }).click();
  const levels = page.getByRole("dialog", { name: "Experience & classes" });
  await levels.getByLabel("Fighter class level").fill("0");
  await expect(levels.getByRole("status", { name: "Level allocation" })).toHaveText(
    "3 / 5 allocated"
  );
  await expect(levels.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await levels.getByLabel("Wizard class level").fill("5");
  await levels.getByRole("button", { name: "Save", exact: true }).click();
  await expect(levels).not.toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Class build", { exact: true })).toHaveCount(0);
  expect(
    (await savedSheet(page)).progression.multiclass?.classes.map((entry) => entry.level)
  ).toEqual([5, 0]);
  const editor = await openClassEditor(page);
  await expect(editor.getByLabel("Multiclass 1 class")).toHaveValue("Fighter");
  await expect(editor.getByRole("region", { name: "Fighter class options" })).toContainText(
    "Level 0"
  );
});

test("starting training and custom subclass edits retain the legacy single-class format", async ({
  page
}) => {
  await openLocalSheet(page);
  const editor = await openClassEditor(page);
  await editor.getByLabel("Fighter skill proficiency 1").selectOption("Acrobatics");
  await editor.getByLabel("Fighter skill proficiency 2").selectOption("Animal Handling");
  await editor.getByLabel("Fighter subclass").selectOption("__custom");
  await editor.getByLabel("Custom subclass name").fill("Shield Marshal");
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.reload();
  const saved = await savedSheet(page);
  expect(saved.schemaVersion).toBe(2);
  expect(saved.progression.customSubclass?.name).toBe("Shield Marshal");
  const reopened = await openClassEditor(page);
  await expect(reopened.getByLabel("Custom subclass name")).toHaveValue("Shield Marshal");
  await expect(reopened.getByLabel("Fighter skill proficiency 1")).toHaveValue("Acrobatics");
  await expect(reopened.getByLabel("Fighter skill proficiency 2")).toHaveValue("Animal Handling");
});

test("a custom class can switch from no spellcasting to manual slots after reload", async ({
  page
}) => {
  await openLocalSheet(page);
  let editor = await openClassEditor(page);
  await editor.getByRole("button", { name: "Add Multiclass", exact: true }).click();
  await editor.getByLabel("Multiclass 1 class").selectOption("Custom");
  await editor.getByLabel("Custom class name").fill("Runekeeper");
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.reload();
  editor = await openClassEditor(page);
  await editor.getByRole("combobox", { name: "Spellcasting", exact: true }).selectOption("manual");
  await editor.getByRole("combobox", { name: "Hit Die", exact: true }).selectOption("d10");
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await page.getByRole("button", { name: "Level 3", exact: true }).click();
  const levels = page.getByRole("dialog", { name: "Experience & classes" });
  await levels.getByLabel("Fighter class level").fill("2");
  await levels.getByLabel("Runekeeper class level").fill("1");
  await levels.getByRole("button", { name: "Save", exact: true }).click();
  await expect(levels).not.toBeVisible();
  await page.reload();
  const custom = (await savedSheet(page)).progression.multiclass!.classes[1];
  expect(custom.classRules?.mechanics.spellcasting.enabled).toBe(true);
  expect(custom.classRules?.hitDie).toBe("d10");
  expect(custom.customClass?.castingProgression).toBe("manual");
  await expect(page.getByRole("button", { name: "Open spellcasting guide" })).toBeVisible();
});
