import { test, expect, openLocalSheet, savedSheet } from "./fixtures";

for (const value of [0, 30]) {
  test(`create, edit, reload and remove a HARD SET ability score of ${value}`, async ({ page }) => {
    await openLocalSheet(page);
    await page
      .getByText("Traits & Conditions", { exact: true })
      .locator("..")
      .getByRole("button", { name: "Edit", exact: true })
      .click();
    await page.getByRole("button", { name: "Custom Trait", exact: true }).click();
    const editor = page.getByRole("dialog", { name: "Custom Feature Trait", exact: true });
    await editor.getByLabel("Name", { exact: true }).fill("Fixed Strength");
    await editor.getByRole("combobox", { name: "Target", exact: true }).selectOption("initiative");
    await editor.getByRole("combobox", { name: "Value", exact: true }).selectOption("1d6");
    await editor.getByRole("radio", { name: "DEBUFF", exact: true }).click();
    await editor.getByRole("radio", { name: "ADV", exact: true }).click();
    await editor
      .getByRole("combobox", { name: "Target", exact: true })
      .selectOption("hardSetAbilityScore:STR");
    await expect(editor.getByRole("combobox", { name: "Value", exact: true })).toHaveValue("0");
    await expect(editor.getByRole("radiogroup")).toHaveCount(0);
    await expect(
      editor.getByRole("combobox", { name: "Value", exact: true }).locator("option")
    ).toHaveCount(31);
    await editor.getByRole("combobox", { name: "Value", exact: true }).selectOption(String(value));
    await editor.getByRole("button", { name: "Create", exact: true }).click();
    await expect(page.getByLabel(`STR score ${value}`, { exact: true })).toBeVisible();
    await expect
      .poll(
        async () =>
          (await savedSheet(page)).session.statusEntries?.find(
            (entry) => entry.value === "Fixed Strength"
          )?.customEffects
      )
      .toEqual([{ type: "hardSetAbilityScore", ability: "STR", value }]);
    await page.reload();
    await expect(page.getByLabel(`STR score ${value}`, { exact: true })).toBeVisible();
    await page.getByText("Fixed Strength", { exact: true }).click();
    await expect(
      page.getByText(`HARD SET STR Ability Score: ${value}`, { exact: true })
    ).toBeVisible();
    await page.getByRole("button", { name: "Edit Trait", exact: true }).click();
    await expect(editor.getByRole("combobox", { name: "Value", exact: true })).toHaveValue(
      String(value)
    );
    await expect(editor.getByRole("combobox", { name: "Target", exact: true })).toHaveValue(
      "hardSetAbilityScore:STR"
    );
    await editor.getByRole("button", { name: "Save Trait", exact: true }).click();
    await page.getByText("Fixed Strength", { exact: true }).click();
    await page.getByRole("button", { name: "End Duration", exact: true }).click();
    await expect(page.getByLabel("STR score 16", { exact: true })).toBeVisible();
    await expect
      .poll(
        async () =>
          (await savedSheet(page)).session.statusEntries?.some(
            (entry) => entry.value === "Fixed Strength"
          ) ?? false
      )
      .toBe(false);
    await page.reload();
    await expect(page.getByLabel("STR score 16", { exact: true })).toBeVisible();
  });
}
