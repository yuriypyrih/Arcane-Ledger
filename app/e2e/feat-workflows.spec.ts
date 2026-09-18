import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";
import type { Page } from "@playwright/test";

async function editFeats(page: Page) {
  await page
    .getByRole("region", { name: "Feats", exact: true })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Edit Feats", exact: true });
}

test("adding and removing Tough updates sheet HP and survives a reload", async ({ page }) => {
  await openLocalSheet(page);
  await expect(page.getByText("30/30 HP", { exact: true })).toBeVisible();
  let editor = await editFeats(page);
  await editor.getByRole("tab", { name: "Origin", exact: true }).click();
  const tough = editor.locator("article").filter({ has: page.getByText("Tough", { exact: true }) });
  await tough.getByRole("button", { name: "Add", exact: true }).click();
  await expect(tough.getByRole("button", { name: "Remove", exact: true })).toBeEnabled();
  await editor.getByRole("button", { name: "Close feat editor" }).click();
  await expect(page.getByText("30/36 HP", { exact: true })).toBeVisible();
  await expect.poll(async () => (await savedSheet(page)).features.feats?.length).toBe(1);
  await page.reload();
  await expect(page.getByText("30/36 HP", { exact: true })).toBeVisible();
  editor = await editFeats(page);
  await editor.getByRole("tab", { name: "Origin", exact: true }).click();
  await editor
    .locator("article")
    .filter({ has: page.getByText("Tough", { exact: true }) })
    .getByRole("button", { name: "Remove", exact: true })
    .click();
  await editor.getByRole("button", { name: "Close feat editor" }).click();
  await expect(page.getByText("30/30 HP", { exact: true })).toBeVisible();
  await expect.poll(async () => (await savedSheet(page)).features.feats).toEqual([]);
});

test("Skill Expert choices grant expertise, persist, and disappear when the feat is removed", async ({
  page
}) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: { className: "Fighter", subclassId: "fighter-champion", level: 4, xp: 2700 }
    })
  );
  let editor = await editFeats(page);
  await editor.getByRole("tab", { name: "General", exact: true }).click();
  let card = editor
    .locator("article")
    .filter({ has: page.getByText("Skill Expert", { exact: true }) });
  await card.getByRole("button", { name: "Add", exact: true }).click();
  await expect(card.getByRole("button", { name: "Add Feat", exact: true })).toBeDisabled();
  await card.getByRole("combobox", { name: "Ability", exact: true }).selectOption("INT");
  await card
    .getByRole("combobox", { name: "Skill Proficiency", exact: true })
    .selectOption("Arcana");
  await card.getByRole("combobox", { name: "Expertise", exact: true }).selectOption("Arcana");
  await card.getByRole("button", { name: "Add Feat", exact: true }).click();
  await editor.getByRole("button", { name: "Close feat editor" }).click();
  await expect
    .poll(async () => (await savedSheet(page)).features.feats?.[0]?.skillExpert)
    .toEqual({ ability: "INT", skillProficiency: "Arcana", skillExpertise: "Arcana" });
  await page.getByRole("button", { name: "Edit skills", exact: true }).click();
  await expect(page.getByLabel("Arcana proficiency")).toHaveValue("EXPERT");
  await expect(
    page.getByLabel("Arcana proficiency").getByRole("option", { name: "None", exact: true })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Close skill editor" }).click();
  await page.reload();
  editor = await editFeats(page);
  await editor.getByRole("tab", { name: "General", exact: true }).click();
  card = editor.locator("article").filter({ has: page.getByText("Skill Expert", { exact: true }) });
  await card.getByRole("button", { name: "Remove", exact: true }).click();
  await editor.getByRole("button", { name: "Close feat editor" }).click();
  await page.getByRole("button", { name: "Edit skills", exact: true }).click();
  await expect(page.getByLabel("Arcana proficiency")).toHaveValue("NONE");
});

test("feat prerequisites disable unavailable additions", async ({ page }) => {
  await openLocalSheet(page);
  const editor = await editFeats(page);
  await editor.getByRole("tab", { name: "General", exact: true }).click();
  for (const name of ["Skill Expert", "War Caster"]) {
    await expect(
      editor
        .locator("article")
        .filter({ has: page.getByText(name, { exact: true }) })
        .getByRole("button", { name: "Add", exact: true })
    ).toBeDisabled();
  }
  await editor.getByRole("button", { name: "Close feat editor" }).click();
  expect((await savedSheet(page)).features.feats).toEqual([]);
});
