import type { Page } from "@playwright/test";
import { test, expect, openLocalSheet, portableSheet } from "./fixtures";
import { BREAKPOINTS } from "../src/styles/breakpoints";

const wizard = () =>
  portableSheet({
    progression: { className: "Wizard", subclassId: "wizard-evoker", level: 3, xp: 900 },
    spellcasting: {
      spellbookSpellIds: ["spell-shield", "spell-mage-armor", "spell-detect-magic"],
      preparedSpellIds: ["spell-shield"],
      spellSlotsExpended: Array(9).fill(0)
    }
  });

async function placeSpellcastingBelowViewport(page: Page, offset: number) {
  await page
    .getByRole("region", { name: "Spellcasting", exact: true })
    .evaluate(async (section, distance) => {
      window.scrollTo({
        top: window.scrollY + section.getBoundingClientRect().top - window.innerHeight - distance,
        behavior: "instant"
      });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    }, offset);
}

for (const themeMode of ["light", "dark"] as const) {
  test(`the Spellcasting pill sits above the dice button and navigates in ${themeMode} mode`, async ({
    page,
    isMobile
  }, testInfo) => {
    if (!isMobile) await page.setViewportSize({ width: 768, height: 900 });
    await page.addInitScript((theme) => {
      localStorage.setItem(
        "arcane-ledger.preferences",
        JSON.stringify({ themeMode: theme, broadLayout: false })
      );
    }, themeMode);
    await openLocalSheet(page, wizard());
    const shortcut = page.getByRole("button", { name: "Scroll to spellcasting", exact: true });
    const dice = page.getByRole("button", { name: "Open quick dice roller", exact: true });
    await expect(shortcut).toBeVisible();
    const buttonBounds = (await shortcut.boundingBox())!;
    const diceBounds = (await dice.boundingBox())!;
    expect(buttonBounds.width).toBeGreaterThanOrEqual(44);
    expect(buttonBounds.width).toBeLessThan(diceBounds.width);
    expect(buttonBounds.height).toBeGreaterThan(buttonBounds.width * 1.4);
    expect(buttonBounds.x + buttonBounds.width / 2).toBeCloseTo(
      diceBounds.x + diceBounds.width / 2,
      1
    );
    expect(buttonBounds.y + buttonBounds.height).toBeLessThan(diceBounds.y);
    expect(diceBounds.y - buttonBounds.y - buttonBounds.height).toBeLessThan(16);
    const viewport = page.viewportSize()!;
    if (viewport.width < BREAKPOINTS.sm) {
      expect(viewport.width - diceBounds.x - diceBounds.width).toBeGreaterThanOrEqual(16);
      expect(viewport.height - diceBounds.y - diceBounds.height).toBeGreaterThanOrEqual(16);
    }
    const icons = shortcut.locator("svg");
    await expect(icons).toHaveCount(2);
    const sparkleBounds = (await icons.first().boundingBox())!;
    const arrowBounds = (await icons.last().boundingBox())!;
    expect(sparkleBounds.y + sparkleBounds.height).toBeLessThan(arrowBounds.y);
    expect(sparkleBounds.x + sparkleBounds.width / 2).toBeCloseTo(
      buttonBounds.x + buttonBounds.width / 2,
      1
    );
    expect(arrowBounds.x + arrowBounds.width / 2).toBeCloseTo(
      buttonBounds.x + buttonBounds.width / 2,
      1
    );
    await expect(page.getByRole("button", { name: "Spellcasting", exact: true })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("thumb-buttons.png") });

    // The added button must not interfere with the existing quick-dice panel.
    await dice.click();
    await expect(page.getByRole("group", { name: "Quick roll mode" })).toBeVisible();
    const dicePanelBounds = (await page.locator("#thumb-dice-menu").boundingBox())!;
    expect(dicePanelBounds.x).toBeGreaterThanOrEqual(0);
    await expect(shortcut).toBeVisible();
    await page.getByRole("button", { name: "Close quick dice roller" }).click();

    const spellcasting = page.getByRole("region", { name: "Spellcasting", exact: true });
    const guide = spellcasting.getByRole("button", { name: "Open spellcasting guide" });
    await expect(guide).not.toBeInViewport();
    await shortcut.click();
    await expect(shortcut).toHaveCount(0);
    await expect(guide).toBeInViewport();
    await expect(spellcasting).toBeFocused();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await placeSpellcastingBelowViewport(page, 160);
    await expect(shortcut).toBeVisible();
    await shortcut.focus();
    await page.keyboard.press("Enter");
    await expect(shortcut).toHaveCount(0);
    await expect(guide).toBeInViewport();
    await expect(spellcasting).toBeFocused();
  });
}

test("Spellcasting waits for the offscreen buffer and stays until the section enters view", async ({
  page,
  isMobile
}) => {
  if (!isMobile) await page.setViewportSize({ width: 768, height: 900 });
  await openLocalSheet(page, wizard());
  const shortcut = page.getByRole("button", { name: "Scroll to spellcasting", exact: true });
  await expect(shortcut).toBeVisible();
  await placeSpellcastingBelowViewport(page, -20);
  await expect(shortcut).toHaveCount(0);
  await placeSpellcastingBelowViewport(page, 40);
  await expect(shortcut).toHaveCount(0);
  await placeSpellcastingBelowViewport(page, 120);
  await expect(shortcut).toHaveCount(0);
  await placeSpellcastingBelowViewport(page, 160);
  await expect(shortcut).toBeVisible();
  await placeSpellcastingBelowViewport(page, 40);
  await expect(shortcut).toBeVisible();
  await placeSpellcastingBelowViewport(page, -20);
  await expect(shortcut).toHaveCount(0);
  await placeSpellcastingBelowViewport(page, 40);
  await expect(shortcut).toHaveCount(0);
});

test("Spellcasting appears only at xs/sm, regardless of the broad-layout preference", async ({
  page,
  isMobile
}) => {
  test.skip(isMobile, "Desktop covers the broad-layout toggle and breakpoint transitions.");
  await page.setViewportSize({ width: BREAKPOINTS.xl, height: 900 });
  await openLocalSheet(page, wizard());
  const shortcut = page.getByRole("button", { name: "Scroll to spellcasting", exact: true });
  const broadLayout = page.getByRole("switch", { name: "Broad Layout" });
  await expect(shortcut).toHaveCount(0);
  await broadLayout.click();
  await expect(broadLayout).toBeChecked();
  await expect(shortcut).toHaveCount(0);
  await page.setViewportSize({ width: BREAKPOINTS.md, height: 900 });
  await expect(shortcut).toHaveCount(0);
  await page.setViewportSize({ width: BREAKPOINTS.md - 1, height: 900 });
  await expect(shortcut).toBeVisible();
  await page.setViewportSize({ width: BREAKPOINTS.sm, height: 900 });
  await expect(shortcut).toBeVisible();
  await page.setViewportSize({ width: BREAKPOINTS.sm - 1, height: 900 });
  await expect(shortcut).toBeVisible();
  await page.setViewportSize({ width: BREAKPOINTS.lg, height: 900 });
  await expect(shortcut).toHaveCount(0);
  await broadLayout.click();
  await expect(shortcut).toHaveCount(0);
  await page.setViewportSize({ width: BREAKPOINTS.md, height: 900 });
  await expect(shortcut).toHaveCount(0);
  await page.setViewportSize({ width: BREAKPOINTS.md - 1, height: 900 });
  await expect(shortcut).toBeVisible();
});

test("sheets without spellcasting have no Spellcasting shortcut", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 768, height: 900 });
  await openLocalSheet(page);
  await expect(page.getByRole("button", { name: "Open spellcasting guide" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Scroll to spellcasting", exact: true })
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open quick dice roller" })).toBeVisible();
});
