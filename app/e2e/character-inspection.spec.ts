import { FEATS } from "../src/codex/entries";
import { normalizeCharacterCompanions } from "../src/pages/CharactersPage/companions";
import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect, portableSheet } from "./fixtures";

const base = "http://127.0.0.1:4176/api/v1";
const password = "Synthetic-password-847!";
async function login(api: APIRequestContext, email: string) {
  const response = await api.post(`${base}/auth/login`, { data: { email, password } });
  expect(response.status()).toBe(200);
  return (await response.json()).user;
}
async function assertReadOnly(page: Page, expectsSpells: boolean) {
  const modal = page.getByRole("dialog", { name: "Character Inspection", exact: true });
  await expect(modal).toBeVisible();
  await expect(modal.getByText("Read-only", { exact: true })).toBeVisible();
  const texture = modal.locator('[style*="--class-signature-page-texture"]').first();
  await expect(texture).toHaveCSS("background-image", /rogue/);
  const textureTop = (await texture.boundingBox())!.y;
  const portrait = modal.getByRole("button", { name: "Open portrait for Inspection Adventurer" });
  await expect(portrait).toBeVisible();
  // The normal portrait protrudes above its card and must remain visible/hit-testable there.
  expect(
    await portrait.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const card = element.closest("article")!.getBoundingClientRect();
      return (
        bounds.top < card.top &&
        element.contains(document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + 1))
      );
    })
  ).toBe(true);
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    const paper = await texture.evaluate((element) => {
      const style = getComputedStyle(element.parentElement!);
      const normal = getComputedStyle(document.body, "::before");
      return {
        image: style.backgroundImage,
        normalImage: normal.backgroundImage,
        size: style.backgroundSize,
        normalSize: normal.backgroundSize
      };
    });
    expect(paper.image).toContain(
      theme === "dark" ? "dark-paper-background.webp" : "paper-background.webp"
    );
    expect(paper.image).toBe(paper.normalImage);
    expect(paper.size).toBe(paper.normalSize);
    await expect(texture).toHaveCSS("background-image", /rogue/);
    await expect(texture).toHaveCSS("opacity", "0.9");
    for (const label of [/^(Start|End) round$/, /^(In|Out of) Combat$/]) {
      const control = modal.getByRole("button", { name: label });
      await expect(control).toBeDisabled();
      await expect(control).toHaveCSS("opacity", "0.5");
      await expect(control).toHaveCSS("cursor", "default");
      const decoration = await control.evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished));
        const style = getComputedStyle(element);
        return [style.background, style.color, style.boxShadow];
      });
      await control.hover();
      expect(
        await control.evaluate(async (element) => {
          await Promise.all(element.getAnimations().map((animation) => animation.finished));
          const style = getComputedStyle(element);
          return [style.background, style.color, style.boxShadow];
        })
      ).toEqual(decoration);
    }
    await modal
      .locator(":scope > div")
      .last()
      .evaluate((element) => {
        element.scrollTop = 0;
      });
    await page.screenshot({ path: test.info().outputPath(`character-inspection-${theme}.png`) });
  }
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  await portrait.focus();
  await page.keyboard.press("Enter");
  const images = page.getByRole("dialog", { name: "Inspection Adventurer", exact: true });
  await expect(images).toBeVisible();
  await expect(images.getByRole("button")).toHaveCount(3);
  await expect(images.locator("input")).toHaveCount(0);
  await images.getByRole("button", { name: "Background Texture", exact: true }).click();
  await expect(images.getByRole("img", { name: "Background texture preview" })).toHaveAttribute(
    "src",
    /rogue/
  );
  await expect(images.getByRole("button")).toHaveCount(3);
  await expect(images.locator("input")).toHaveCount(0);
  await page.keyboard.press("Tab");
  expect(await images.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await images.getByRole("button", { name: "Character Portrait", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(portrait).toBeFocused();
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("button", { name: "Camp", exact: true })).toBeDisabled();
  await modal.getByRole("button", { name: "Show Character Notes" }).click();
  const notes = page.getByRole("dialog", { name: "Inspection Adventurer", exact: true });
  await expect(notes.getByRole("textbox", { name: "Character notes" })).toHaveValue(
    "Private character notes visible to the GM and admin."
  );
  await expect(notes.getByRole("button", { name: /edit|save/i })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("button", { name: /refresh/i })).toHaveCount(0);
  expect(await modal.evaluate((element) => getComputedStyle(element).maxWidth)).toBe("none");
  const name = await modal
    .getByRole("heading", { name: "Inspection Adventurer", level: 2 })
    .boundingBox();
  const stats = await modal
    .getByRole("complementary", { name: "Character quick stats" })
    .boundingBox();
  if (page.viewportSize()!.width < 900) {
    expect(stats!.y).toBeGreaterThanOrEqual(name!.y + name!.height);
  } else {
    expect(stats!.x).toBeGreaterThan(name!.x + name!.width);
  }
  expect(await modal.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  // Every section control is either static or disabled, including keyboard targets.
  expect(
    await modal
      .locator("fieldset[data-read-only-sheet-section] button")
      .evaluateAll((buttons) => buttons.every((button) => button.matches(":disabled")))
  ).toBe(true);
  for (const [label, title] of [
    [/^Armor Class/, "Armor Class"],
    [/^Speed/, "Speed"],
    [/^Initiative/, "Initiative"],
    [/^Passive Perception/, "Passive Perception"],
    [/^Proficiency Bonus/, "Proficiency Bonus"],
    [/^Hit Dice/, /^Hit Dice/],
    [/^STR /, "STR"],
    [/^DEX /, "DEX"],
    [/^CON /, "CON"],
    [/^INT /, "INT"],
    [/^WIS /, "WIS"],
    [/^CHA /, "CHA"]
  ] as const) {
    const card = modal.getByRole("button", { name: label }).first();
    await card.focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: title, exact: typeof title === "string" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button")).toHaveCount(1);
    await expect(drawer.getByRole("combobox")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(card).toBeFocused();
    await expect(modal).toBeVisible();
  }
  const companion = modal.getByRole("button", { name: "Inspect Scout Owl", exact: true }).first();
  await companion.focus();
  await page.keyboard.press("Enter");
  const creature = page.getByRole("dialog", { name: "Scout Owl", exact: true });
  await expect(creature.getByText("A companion description.")).toBeVisible();
  await expect(creature.getByRole("button", { name: /edit|damage|heal|roll|save/i })).toHaveCount(
    0
  );
  await page.keyboard.press("Tab");
  expect(await creature.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(companion).toBeFocused();
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: /^Human Species/ }).click();
  const species = page.getByRole("dialog", { name: "Human", exact: true });
  await expect(species).toBeVisible();
  await species.getByRole("button", { name: "Close Human reference" }).click();
  await modal.getByRole("button", { name: /^Alert/ }).click();
  await expect(page.getByRole("dialog", { name: "Alert", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  const feature = modal.getByRole("button", { name: /^Level 1:/ }).first();
  await expect(feature).toHaveAttribute("aria-expanded", "false");
  await feature.focus();
  await page.keyboard.press("Space");
  await expect(feature).toHaveAttribute("aria-expanded", "true");
  await feature.click();
  const spell = modal.getByRole("button", { name: /^Shield/ }).filter({ hasText: "Abjuration" });
  await expect(spell).toHaveCount(expectsSpells ? 1 : 0);
  if (expectsSpells) {
    await spell.click();
    const drawer = page.getByRole("dialog", { name: "Shield", exact: true });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button", { name: /cast|prepare|edit|roll|save/i })).toHaveCount(
      0
    );
    await page.keyboard.press("Escape");
    await expect(modal).toBeVisible();
  }
  await modal.getByRole("button", { name: "Inspect Inspection Backpack", exact: true }).click();
  const backpack = page.getByRole("dialog", { name: "Inspection Backpack", exact: true });
  await expect(backpack).toBeVisible();
  await expect(
    backpack.getByRole("button", { name: /remove|equip|attune|sell|modify|manage/i })
  ).toHaveCount(0);
  await backpack.getByRole("button", { name: /Hidden Ruby/ }).click();
  await expect(page.getByRole("dialog", { name: "Hidden Ruby", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(backpack).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(backpack).toHaveCount(0);
  await expect(modal).toBeVisible();
  // Focus must stay in the remaining sheet and cycle through its controls.
  await page.keyboard.press("Tab");
  expect(await modal.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  expect((await texture.boundingBox())!.y).toBe(textureTop);
  return modal;
}

for (const mode of ["gm", "admin"] as const) {
  test(`${mode} inspects the latest cloud sheet and inventory without writing`, async ({
    page,
    playwright
  }, info) => {
    const owner = await playwright.request.newContext();
    const ownerUser = await login(owner, "inspection-owner@example.test");
    await login(page.request, `inspection-${mode}@example.test`);
    const sheet = portableSheet();
    sheet.identity.name = "Inspection Adventurer";
    sheet.summary.name = "Inspection Adventurer";
    sheet.session.roundTracker = {
      isInCombat: mode === "admin",
      turnStarted: mode === "admin",
      combatRound: mode === "admin" ? 1 : 0,
      combatRoundAdvancePending: false,
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true
    };
    sheet.companions.entries = normalizeCharacterCompanions([
      {
        id: "owl",
        name: "Scout Owl",
        description: "A companion description.",
        maxHitPoints: 12,
        currentHitPoints: 7
      }
    ]);
    sheet.features.feats = [
      { id: "alert", feat: FEATS.ALERT, source: { type: "manual" }, takenAtLevel: 1 }
    ];
    if (mode === "admin") {
      sheet.progression = { className: "Wizard", subclassId: "wizard-evoker", level: 3, xp: 900 };
      sheet.summary.className = "Wizard";
      sheet.spellcasting = {
        spellbookSpellIds: ["spell-shield"],
        preparedSpellIds: ["spell-shield"],
        spellSlotsExpended: Array(9).fill(0)
      };
    }
    sheet.origin.backgroundNotes = "Private character notes visible to the GM and admin.";
    sheet.inventory.items = [
      {
        id: "inspection-pack",
        item: {
          id: "backpack",
          key: "backpack",
          name: "Inspection Backpack",
          containerContents: []
        },
        quantity: 1,
        onHandQuantity: 0,
        worn: false,
        containerContents: [
          {
            item: { id: "ruby", key: "ruby", name: "Hidden Ruby", desc: "A red gemstone." },
            quantity: 2
          }
        ]
      }
    ];
    const clientId = `inspect-${mode}-${info.project.name}`;
    const imported = await owner.post(`${base}/characters/import`, {
      data: { records: [{ clientId, sheet }] }
    });
    expect(imported.status()).toBe(201);
    let character = (await imported.json()).characters[0];
    const background = await owner.put(`${base}/characters/${character.id}/background-texture`, {
      data: { backgroundTexture: { source: "predefined", textureId: "rogue" } }
    });
    expect(background.status()).toBe(200);
    character = (await background.json()).character;
    let partyId: string | undefined;
    try {
      if (mode === "gm") {
        const party = await page.request.post(`${base}/party-groups`, {
          data: { name: `Inspection ${info.project.name}` }
        });
        expect(party.status()).toBe(201);
        const created = (await party.json()).partyGroup;
        const record = (await (await page.request.get(`${base}/party-groups/${created.id}`)).json())
          .partyGroup;
        partyId = record.id;
        const joined = await owner.post(`${base}/party-groups/join`, {
          data: { invite: record.inviteToken, characterSheetId: character.id }
        });
        expect(joined.status()).toBe(201);
        await page.goto(`/gm-tools/party-manager/${partyId}`);
      } else {
        await page.goto("/administration");
        await page.getByRole("row").filter({ hasText: ownerUser.email }).click();
        const details = page.getByRole("dialog", { name: "User Details" });
        await expect(details).toBeVisible();
        const originalViewport = page.viewportSize()!;
        await page.setViewportSize({ ...originalViewport, height: 420 });
        await details.getByRole("combobox").selectOption("keeper");
        const save = details.getByRole("button", { name: "Save", exact: true });
        const cancel = details.getByRole("button", { name: "Cancel", exact: true });
        await expect(save).toBeInViewport();
        await expect(cancel).toBeInViewport();
        const body = details.locator("form > div").first();
        expect(await body.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
          true
        );
        await body.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        await expect(
          details.getByRole("button", { name: "Inspect Inspection Adventurer", exact: true })
        ).toBeInViewport();
        await expect(save).toBeInViewport();
        await expect(cancel).toBeInViewport();
        await page.screenshot({ path: info.outputPath("user-details-scroll.png") });
        await page.setViewportSize(originalViewport);
      }
      const writes: string[] = [];
      page.on("request", (request) => {
        if (
          ["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) &&
          /\/characters(?:\/|$)|\/party-groups(?:\/|$)/.test(new URL(request.url()).pathname)
        )
          writes.push(request.url());
      });
      await page
        .getByRole("button", { name: "Inspect Inspection Adventurer", exact: true })
        .click();
      await expect(
        page.getByRole("dialog", { name: "Character Inspection", exact: true })
      ).toBeVisible();
      await page.screenshot({ path: info.outputPath("character-inspection-top.png") });
      const modal = await assertReadOnly(page, mode === "admin");
      await page.screenshot({ path: info.outputPath("character-inspection.png") });
      const afterInspection = await owner.get(`${base}/characters/${character.id}`);
      expect((await afterInspection.json()).character.revision).toBe(character.revision);
      expect(writes).toEqual([]);
      sheet.vitals.currentHitPoints = 17;
      expect(
        (
          await owner.put(`${base}/characters/${character.id}`, {
            data: { clientId, sheet, baseRevision: character.revision }
          })
        ).status()
      ).toBe(200);
      await modal.getByRole("button", { name: "Close character inspection" }).click();
      await page
        .getByRole("button", { name: "Inspect Inspection Adventurer", exact: true })
        .click();
      await expect(modal.getByText("17/30 HP", { exact: true })).toBeVisible();
      await modal.getByRole("button", { name: "Close character inspection" }).click();
      await expect(modal).toHaveCount(0);
      if (mode === "admin") await expect(page.getByRole("combobox")).toHaveValue("keeper");
      await expect(
        page.getByRole("button", { name: "Inspect Inspection Adventurer", exact: true })
      ).toBeFocused();
      expect(writes).toEqual([]);
    } finally {
      if (partyId) await page.request.delete(`${base}/party-groups/${partyId}`);
      await owner.delete(`${base}/characters/${character.id}`);
      await owner.dispose();
    }
  });
}
