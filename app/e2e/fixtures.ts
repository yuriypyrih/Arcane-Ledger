import { test as base, expect, type Page } from "@playwright/test";
import { portableSheet } from "../tests/fixtures/portable";
import type { PortableCharacterSheet } from "../src/types/characterSheets";
export const test = base.extend({
  page: async ({ page }, run) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // Test pages may talk only to the servers owned by this run.
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return ["127.0.0.1", "localhost"].includes(url.hostname) ? route.continue() : route.abort();
    });
    await run(page);
    expect(errors, "Unexpected application errors").toEqual([]);
  }
});
export { expect, portableSheet };
export async function openLocalSheet(page: Page, sheet = portableSheet()) {
  await page.addInitScript((record) => {
    if (!localStorage.getItem("arcane-ledger.characters"))
      localStorage.setItem("arcane-ledger.characters", JSON.stringify([record]));
  }, sheet);
  await page.goto(`/characters/${sheet.identity.localId}`);
  await expect(page.getByRole("button", { name: "Camp", exact: true })).toBeVisible();
}
export async function savedSheet(page: Page): Promise<PortableCharacterSheet> {
  return page.evaluate(() => JSON.parse(localStorage.getItem("arcane-ledger.characters")!)[0]);
}
