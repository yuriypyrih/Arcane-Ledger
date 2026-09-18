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
