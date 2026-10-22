import {
  STATUS_ENTRY_GROUP as Group,
  STATUS_ENTRY_SOURCE_TYPE as Source,
  STATUS_DURATION_KIND as Kind,
  STATUS_DURATION_ROUND_TICK as Tick
} from "../src/types/traits";
import { test, expect, openLocalSheet, portableSheet, savedSheet } from "./fixtures";

test("round resources persist independently and recover when the next round starts", async ({
  page
}) => {
  await openLocalSheet(page);
  await expect(
    page.getByRole("button", { name: "Action free out of combat", exact: true })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Start round", exact: true }).click();
  await page.getByRole("button", { name: "Action available", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).session.roundTracker)
    .toMatchObject({
      actionAvailable: false,
      bonusActionAvailable: true,
      reactionAvailable: true,
      combatRound: 1
    });
  await page.reload();
  await expect(page.getByRole("button", { name: "Action spent", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "End round", exact: true }).click();
  await page.getByRole("button", { name: "Start round", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).session.roundTracker)
    .toMatchObject({
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      combatRound: 2
    });
  await page.getByRole("button", { name: "In Combat", exact: true }).click();
  await page.getByRole("button", { name: "End combat", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Close combat resource management" })
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Action free out of combat", exact: true })
  ).toBeDisabled();
});

test("ending concentration from Traits and Conditions removes linked effects and preserves unrelated conditions", async ({
  page
}) => {
  const sheet = portableSheet({
    progression: { className: "Cleric", subclassId: "cleric-life-domain", level: 3, xp: 900 }
  });
  sheet.session.statusEntries = [
    {
      id: "concentration",
      group: Group.EFFECTS,
      value: "Concentration",
      source: "Bless",
      sourceType: Source.MANUAL,
      duration: { kind: Kind.ROUNDS, amount: 10, tickOn: Tick.ROUND_END }
    },
    {
      id: "linked",
      group: Group.EFFECTS,
      value: "Bless benefit",
      source: "Bless",
      sourceType: Source.MANUAL,
      duration: { kind: Kind.CONCENTRATION }
    },
    {
      id: "poison",
      group: Group.CONDITIONS,
      value: "Poisoned",
      source: "Trap",
      sourceType: Source.MANUAL,
      duration: { kind: Kind.INFINITE }
    }
  ];
  await openLocalSheet(page, sheet);
  await page.getByRole("button", { name: /^Concentration/ }).click();
  await page.getByRole("button", { name: "End Duration", exact: true }).click();
  await expect
    .poll(async () => (await savedSheet(page)).session.statusEntries?.map((e) => e.value))
    .toEqual(["Poisoned"]);
  await page.reload();
  await expect(page.getByRole("button", { name: /Poisoned/ })).toBeVisible();
  expect((await savedSheet(page)).session.statusEntries?.map((e) => e.value)).toEqual(["Poisoned"]);
});

test("Fighter Extra Attack and Action Surge provide two complete attack sequences after reload", async ({
  page
}) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: { className: "Fighter", subclassId: "fighter-champion", level: 5, xp: 0 }
    })
  );
  await page.getByRole("button", { name: "Start round", exact: true }).click();
  const openAttack = () => page.getByRole("button", { name: /^Unarmed Strike/ }).click();
  await openAttack();
  for (const remaining of [1, 0]) {
    await page.getByRole("button", { name: /^Attack/ }).click();
    await expect
      .poll(
        async () =>
          (await savedSheet(page)).features.classFeatureState?.fighter
            ?.extraAttacksRemainingThisTurn
      )
      .toBe(remaining);
    const closeDice = page.getByRole("button", { name: "Close dice roller" });
    if (await closeDice.isVisible()) await closeDice.click();
  }
  await expect(page.getByRole("button", { name: /^Attack/ })).toBeDisabled();
  await page.reload();
  await page.getByRole("button", { name: /^Action Surge Charges/ }).click();
  await page.getByRole("button", { name: "Use Action Surge", exact: true }).click();
  await openAttack();
  for (const remaining of [1, 0]) {
    await page.getByRole("button", { name: /^Attack/ }).click();
    await expect
      .poll(
        async () =>
          (await savedSheet(page)).features.classFeatureState?.fighter
            ?.extraAttacksRemainingThisTurn
      )
      .toBe(remaining);
    const closeDice = page.getByRole("button", { name: "Close dice roller" });
    if (await closeDice.isVisible()) await closeDice.click();
  }
  await expect(page.getByRole("button", { name: /^Attack/ })).toBeDisabled();
});

test("Mystic cantrip first opens one shared attack and refuses a third cantrip", async ({
  page
}) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: {
        className: "Monk",
        subclassId: "monk-warrior-of-the-mystic-arts",
        level: 6,
        xp: 0
      },
      spellcasting: { cantripIds: ["spell-mage-hand"], spellSlotsExpended: Array(9).fill(0) },
      features: { classFeatureState: {}, feats: [] }
    })
  );
  await page.getByRole("button", { name: "Start round", exact: true }).click();
  for (const remaining of [1, 0]) {
    await page.getByText("Mage Hand", { exact: true }).last().click();
    await page.getByRole("button", { name: /^Cast/ }).click();
    await expect
      .poll(
        async () =>
          (await savedSheet(page)).features.classFeatureState?.monk?.extraAttacksRemainingThisTurn
      )
      .toBe(remaining);
    await page.reload();
  }
  await page.getByText("Mage Hand", { exact: true }).last().click();
  await expect(page.getByRole("button", { name: /^Cast/ })).toBeDisabled();
});

test("Mystic Flurry spell path spends two strikes and one slot while retaining the ordinary Action", async ({
  page
}) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: {
        className: "Monk",
        subclassId: "monk-warrior-of-the-mystic-arts",
        level: 17,
        xp: 0
      },
      spellcasting: {
        preparedSpellIds: ["spell-magic-missile"],
        spellSlotsExpended: Array(9).fill(0)
      },
      features: { classFeatureState: {}, feats: [] }
    })
  );
  await page.getByRole("button", { name: "Start round", exact: true }).click();
  await page.getByText("Magic Missile", { exact: true }).last().click();
  await expect(page.getByRole("button", { name: /^Cast/ })).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /^Flurry of Blows/ }).click();
  await page.getByRole("button", { name: "Use Flurry of Blows", exact: true }).click();
  await page.getByText("Magic Missile", { exact: true }).last().click();
  const casts = page.getByRole("button", { name: /^Cast/ });
  await expect(casts).toHaveCount(2);
  await casts.nth(1).click();
  await expect
    .poll(
      async () =>
        (await savedSheet(page)).features.classFeatureState?.monk
          ?.flurryOfBlowsAttacksRemainingThisTurn
    )
    .toBe(1);
  await expect
    .poll(async () => (await savedSheet(page)).spellcasting.spellSlotsExpended?.[0])
    .toBe(1);
  expect((await savedSheet(page)).session.roundTracker?.actionAvailable).toBe(true);
  await page.reload();
  await page.getByText("Magic Missile", { exact: true }).last().click();
  await expect(casts.nth(0)).toBeEnabled();
  await expect(casts.nth(1)).toBeDisabled();
});
