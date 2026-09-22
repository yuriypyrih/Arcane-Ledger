import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";

for (const kind of ["legacy", "declared", "multiclass"] as const) {
  test(`${kind} HP editor preserves the numeric range, formula, and manual-roll guidance`, async ({
    page
  }) => {
    const sheet = portableSheet();
    sheet.vitals.currentHitPoints = 12;
    if (kind !== "legacy") {
      sheet.schemaVersion = 3;
      sheet.progression.level = kind === "multiclass" ? 4 : 3;
      sheet.progression.xp = kind === "multiclass" ? 2700 : 900;
      sheet.progression.multiclass = {
        startingClassId: "fighter",
        hitPointsAdjustment: kind === "multiclass" ? 3 : 0,
        classes: [
          { id: "fighter", className: "Fighter", level: kind === "multiclass" ? 2 : 3 },
          { id: "wizard", className: "Wizard", level: kind === "multiclass" ? 2 : 0 },
          { id: "bard", className: "Bard", level: 0 }
        ]
      };
    }
    const formula =
      kind === "multiclass"
        ? "24~43 MAX HP = 10 Fighter D10 + 2 CON + 1 × (1d10 Fighter + 2 CON) + 2 × (1d6 Wizard + 2 CON) + 3 Adjustment"
        : "18~36 MAX HP = 10 Fighter D10 + 2 CON + 2 × (1d10 Fighter + 2 CON)";
    await openLocalSheet(page, sheet);
    const edit = page
      .locator("header")
      .filter({ has: page.getByText("Hit Points", { exact: true }) })
      .getByRole("button", { name: "Edit", exact: true });
    await edit.click();
    const dialog = page.getByRole("dialog", { name: "Hit Points", exact: true });
    await expect(dialog.getByText(formula, { exact: true })).toBeVisible();
    await expect(dialog.getByText("Roll yourself", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Auto", exact: true }).click();
    await expect(
      dialog.getByText(`[= ${kind === "multiclass" ? 35 : 28} Base HP]`, { exact: true })
    ).toBeVisible();
    await expect(dialog.getByText("Roll yourself", { exact: true })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Manual", exact: true }).click();
    await expect(dialog.getByText("Roll yourself", { exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("hit-points-formula.png") });
    await dialog.getByLabel("Max Base HP", { exact: true }).fill("37");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await page.reload();
    expect((await savedSheet(page)).vitals.hitPoints).toBe(37);
    expect((await savedSheet(page)).vitals.currentHitPoints).toBe(12);
    await edit.click();
    await expect(dialog.getByText(formula, { exact: true })).toBeVisible();
    await expect(dialog.getByText("Roll yourself", { exact: true })).toBeVisible();
  });
}
