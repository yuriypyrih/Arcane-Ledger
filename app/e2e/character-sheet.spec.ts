import { test, expect, openLocalSheet, savedSheet } from "./fixtures";

test("damage, healing, long rest and reload preserve the sheet", async ({ page }) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Deal 1 hit points", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).vitals.currentHitPoints).toBe(29);
  await page.reload();
  await expect(page.getByRole("button", { name: "Camp", exact: true })).toBeVisible();
  await expect.poll(async () => (await savedSheet(page)).vitals.currentHitPoints).toBe(29);
  await page.getByRole("button", { name: "Heal 1 hit points", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).vitals.currentHitPoints).toBe(30);
  await page.getByRole("button", { name: "Deal 1 hit points", exact: true }).click();
  await page.getByRole("button", { name: "Camp", exact: true }).click();
  await expect.poll(async () => (await savedSheet(page)).vitals.currentHitPoints).toBe(29);
  const camp = page.getByRole("dialog", { name: "Choose your rest" });
  await camp.getByText("Long Rest", { exact: true }).click();
  await camp.getByRole("button", { name: "Rest", exact: true }).click();
  await expect(camp).not.toBeVisible();
  await expect.poll(async () => (await savedSheet(page)).vitals.currentHitPoints).toBe(30);
});

test("Heroic Inspiration toggles and remains set after reload", async ({ page }) => {
  await openLocalSheet(page);
  await page.getByRole("button", { name: "Heroic Inspiration", exact: true }).click();
  const inspiration = page.getByRole("dialog");
  await inspiration.getByRole("switch").click();
  await expect.poll(async () => (await savedSheet(page)).resources.heroicInspiration).toBe(true);
  await page.reload();
  await page.getByRole("button", { name: "Heroic Inspiration", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("switch")).toBeChecked();
});

test("an unavailable local character gives a recovery path", async ({ page }) => {
  await page.goto("/characters/999999");
  await expect(page.getByRole("heading", { name: "Character not found" })).toBeVisible();
  await page.getByRole("link", { name: "Back to roster" }).click();
  await expect(page).toHaveURL(/\/characters$/);
});
