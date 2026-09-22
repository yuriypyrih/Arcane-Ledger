import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";

function mixedSheet() {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression = {
    className: "Wizard",
    level: 6,
    xp: 14000,
    multiclass: {
      startingClassId: "wizard",
      classes: [
        { id: "wizard", className: "Wizard", level: 2 },
        { id: "sorcerer", className: "Sorcerer", level: 1 },
        { id: "fighter", className: "Fighter", level: 2 },
        { id: "barbarian", className: "Barbarian", level: 1 }
      ],
      hitDiceExpended: { d6: 1, d10: 1, d12: 1 }
    }
  };
  sheet.vitals.currentHitPoints = 12;
  return sheet;
}

test("resource management spends and restores each Hit Die pool independently and persists", async ({
  page
}) => {
  await openLocalSheet(page, mixedSheet());
  await expect(page.getByRole("button", { name: /^Hit Dice / }).first()).toContainText(
    "D6 + D10 + D12"
  );
  await page
    .getByRole("button", { name: /^Hit Dice / })
    .first()
    .click();
  const modal = page.getByRole("dialog", { name: /^Hit Dice / });
  await expect(
    modal.getByRole("region", { name: "Wizard D6 Hit Dice", exact: true })
  ).toContainText("1 / 2");
  await expect(
    modal.getByRole("region", { name: "Fighter D10 Hit Dice", exact: true })
  ).toContainText("1 / 2");
  await expect(
    modal.getByRole("button", { name: "Use 1 Barbarian D12 Hit Die", exact: true })
  ).toBeDisabled();
  await modal.getByRole("button", { name: "Use 1 Wizard D6 Hit Die", exact: true }).click();
  await expect(modal.getByLabel("Sorcerer D6 remaining", { exact: true })).toHaveText(
    "1 / 1 remaining"
  );
  await modal.getByRole("button", { name: "Use 1 Sorcerer D6 Hit Die", exact: true }).click();
  await expect(
    modal.getByRole("button", { name: "Use 1 Wizard D6 Hit Die", exact: true })
  ).toBeDisabled();
  await modal.getByRole("button", { name: "Reset 1 Wizard D6 Hit Die", exact: true }).click();
  await expect(modal.getByLabel("Wizard D6 remaining", { exact: true })).toHaveText(
    "1 / 2 remaining"
  );
  await modal.getByRole("button", { name: "Reset all Wizard D6 Hit Dice", exact: true }).click();
  await expect(
    modal.getByRole("button", { name: "Reset 1 Wizard D6 Hit Die", exact: true })
  ).toBeDisabled();
  await expect(modal.getByLabel("Fighter D10 remaining", { exact: true })).toHaveText(
    "1 / 2 remaining"
  );
  await modal
    .getByRole("button", { name: "Reset all Barbarian D12 Hit Dice", exact: true })
    .click();
  await modal.getByRole("button", { name: "Use 1 Fighter D10 Hit Die", exact: true }).click();
  await page.screenshot({ path: test.info().outputPath("hit-dice-management.png") });
  await modal
    .getByRole("button", { name: "Close hit dice resource management", exact: true })
    .click();
  await expect
    .poll(async () => (await savedSheet(page)).progression.multiclass?.hitDiceExpendedByClass)
    .toMatchObject({ wizard: 0, sorcerer: 1, fighter: 2, barbarian: 0 });
  await page.reload();
  expect((await savedSheet(page)).vitals.currentHitPoints).toBe(12);
  await page
    .getByRole("button", { name: /^Hit Dice / })
    .first()
    .click();
  await expect(modal.getByLabel("Wizard D6 remaining", { exact: true })).toHaveText(
    "2 / 2 remaining"
  );
  await expect(modal.getByLabel("Sorcerer D6 remaining", { exact: true })).toHaveText(
    "0 / 1 remaining"
  );
  await expect(modal.getByLabel("Fighter D10 remaining", { exact: true })).toHaveText(
    "0 / 2 remaining"
  );
  await expect(modal.getByLabel("Barbarian D12 remaining", { exact: true })).toHaveText(
    "1 / 1 remaining"
  );
});

test("short rest counters clamp each pool, cancel cleanly, spend only selected dice, and recover on a long rest", async ({
  page
}) => {
  // Manual dice mode deliberately leaves healing to the player; spending is still persisted.
  await page.addInitScript(() =>
    localStorage.setItem(
      "arcane-ledger.preferences",
      JSON.stringify({ diceRollerBehavior: "full_manual" })
    )
  );
  await openLocalSheet(page, mixedSheet());
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  const camp = page.getByRole("dialog", { name: "Choose your rest" });
  await camp.getByText("Short Rest", { exact: true }).click();
  await expect(camp.getByRole("spinbutton")).toHaveCount(0);
  await expect(
    camp.getByRole("button", { name: "Spend one fewer Wizard D6 Hit Die", exact: true })
  ).toBeDisabled();
  await expect(
    camp.getByRole("button", { name: "Spend one more Barbarian D12 Hit Die", exact: true })
  ).toBeDisabled();
  await camp.getByRole("button", { name: "Spend one more Wizard D6 Hit Die", exact: true }).click();
  await expect(
    camp.getByRole("button", { name: "Spend one more Wizard D6 Hit Die", exact: true })
  ).toBeDisabled();
  await camp
    .getByRole("button", { name: "Spend one fewer Wizard D6 Hit Die", exact: true })
    .click();
  await camp.getByRole("button", { name: "Spend one more Wizard D6 Hit Die", exact: true }).click();
  await expect(camp.getByLabel("Sorcerer D6 Hit Dice to spend", { exact: true })).toHaveText("0");
  await camp
    .getByRole("button", { name: "Spend one more Fighter D10 Hit Die", exact: true })
    .click();
  await expect(camp.getByLabel("Wizard D6 Hit Dice to spend", { exact: true })).toHaveText("1");
  await expect(camp.getByLabel("Fighter D10 Hit Dice to spend", { exact: true })).toHaveText("1");
  await expect(camp).toContainText("1d6 + 1d10");
  const poolRow = await camp
    .getByRole("group", { name: "Wizard D6 Hit Dice", exact: true })
    .boundingBox();
  expect(poolRow!.height).toBeLessThan(72);
  const lastRestEffect = await camp.getByRole("checkbox").last().boundingBox();
  expect(poolRow!.y).toBeGreaterThanOrEqual(lastRestEffect!.y + lastRestEffect!.height + 8);
  await camp
    .getByRole("group", { name: "Hit Dice to spend", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath("short-rest-pools.png") });
  await camp.getByRole("button", { name: "Close rest options", exact: true }).click();
  expect((await savedSheet(page)).progression.multiclass?.hitDiceExpended).toMatchObject({
    d6: 1,
    d10: 1,
    d12: 1
  });
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  await camp.getByText("Short Rest", { exact: true }).click();
  await expect(camp.getByLabel("Wizard D6 Hit Dice to spend", { exact: true })).toHaveText("0");
  await camp.getByRole("button", { name: "Spend one more Wizard D6 Hit Die", exact: true }).click();
  await camp
    .getByRole("button", { name: "Spend one more Fighter D10 Hit Die", exact: true })
    .click();
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).progression.multiclass?.hitDiceExpendedByClass)
    .toMatchObject({ wizard: 2, sorcerer: 0, fighter: 2, barbarian: 1 });
  expect((await savedSheet(page)).vitals.currentHitPoints).toBe(12);
  await page.reload();
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  await camp.getByText("Long Rest", { exact: true }).click();
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).progression.multiclass?.hitDiceExpendedByClass)
    .toEqual({ wizard: 0, sorcerer: 0, fighter: 0, barbarian: 0 });
});

test("single-class characters use the same compact counters without changing save format", async ({
  page
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "arcane-ledger.preferences",
      JSON.stringify({ diceRollerBehavior: "full_manual" })
    )
  );
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  const camp = page.getByRole("dialog", { name: "Choose your rest" });
  await camp.getByText("Short Rest", { exact: true }).click();
  await expect(
    camp.getByRole("group", { name: "Fighter D10 Hit Dice", exact: true })
  ).toBeVisible();
  await expect(camp.getByRole("spinbutton")).toHaveCount(0);
  await camp
    .getByRole("button", { name: "Spend one more Fighter D10 Hit Die", exact: true })
    .click();
  await camp
    .getByRole("button", { name: "Spend one more Fighter D10 Hit Die", exact: true })
    .click();
  await camp
    .getByRole("button", { name: "Spend one fewer Fighter D10 Hit Die", exact: true })
    .click();
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).vitals.hitDiceRemaining).toBe(2);
  await page
    .getByRole("button", { name: /^Hit Dice / })
    .first()
    .click();
  const modal = page.getByRole("dialog", { name: /^Hit Dice / });
  await modal.getByRole("button", { name: "Use 1 Fighter D10 Hit Die", exact: true }).click();
  await expect(modal.getByLabel("Fighter D10 remaining", { exact: true })).toHaveText(
    "1 / 3 remaining"
  );
  await modal.getByRole("button", { name: "Reset all Fighter D10 Hit Dice", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).vitals.hitDiceRemaining).toBe(3);
  await page.reload();
  expect((await savedSheet(page)).schemaVersion).toBe(2);
  expect((await savedSheet(page)).progression.multiclass).toBeUndefined();
});
