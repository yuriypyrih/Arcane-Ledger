import { characterFixture } from "../fixtures/character";
import { describe, expect, it } from "vitest";
import { subclassEntries } from "../../src/codex/subclasses";
import {
  getUnlockedSubclassFeatureRowsForCharacter,
  normalizeSubclassId
} from "../../src/pages/CharactersPage/subclasses";
import {
  getFeatureActionsForCharacter,
  getFeatureActionOptionsForCharacter
} from "../../src/pages/CharactersPage/classFeatures";
import { getSpellSlotTotalsForCharacter } from "../../src/pages/CharactersPage/spellSlots";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";

describe("expansion content contracts", () => {
  it("requires unique subclass identifiers", () => {
    expect(new Set(subclassEntries.map((s) => s.id)).size).toBe(subclassEntries.length);
  });
  it.each(subclassEntries)(
    "$className / $name unlocks at its boundaries and survives save/load",
    (subclass) => {
      expect(normalizeSubclassId(subclass.id, "invalid-class")).toBeUndefined();
      const levels = [
        ...new Set([1, 20, ...subclass.features.flatMap((f) => [f.level - 1, f.level])])
      ];
      for (const level of levels) {
        const character = characterFixture({
          className: subclass.className,
          subclassId: subclass.id,
          level,
          xp: 0
        });
        const unlocked = getUnlockedSubclassFeatureRowsForCharacter(character);
        expect(unlocked.flatMap((f) => f.classFeatures)).toEqual(
          subclass.features
            .filter((f) => f.level <= character.level)
            .sort((a, b) => a.level - b.level)
            .flatMap((f) => f.classFeatures)
        );
        const restored = normalizeCharacter(createPortableCharacterSheet(character));
        expect(restored).toMatchObject({
          className: subclass.className,
          subclassId: subclass.id,
          level: character.level
        });
        const actions = getFeatureActionsForCharacter(character);
        expect(new Set(actions.map((a) => a.key)).size).toBe(actions.length);
        expect(actions.every((a) => a.name.trim().length > 0)).toBe(true);
        const slots = getSpellSlotTotalsForCharacter(subclass.className, level, subclass.id);
        expect(slots).toHaveLength(9);
        expect(slots.every((n) => Number.isInteger(n) && n >= 0)).toBe(true);
      }
    }
  );
});

it.each([
  ["Fighter", "fighter-champion", 1, "Second Wind"],
  ["Fighter", "fighter-champion", 2, "Action Surge"],
  ["Barbarian", "barbarian-berserker", 1, "Rage"],
  ["Cleric", "cleric-life-domain", 3, "Channel Divinity"]
] as const)("%s / %s level %i exposes the %s action", (className, subclassId, level, name) => {
  const actions = getFeatureActionsForCharacter(
    characterFixture({ className, subclassId, level, xp: 0 })
  );
  expect(actions.filter((action) => action.name === name)).toHaveLength(1);
});
it("Life Domain adds Preserve Life as an executable Channel Divinity option at level three", () => {
  const cleric = characterFixture({
    className: "Cleric",
    subclassId: "cleric-life-domain",
    level: 3,
    xp: 0
  });
  const options = getFeatureActionOptionsForCharacter(cleric, "cleric-channel-divinity");
  const preserveLife = options.filter((option) => option.name === "Preserve Life");
  expect(preserveLife).toHaveLength(1);
  expect(preserveLife[0]).toMatchObject({
    key: "cleric-preserve-life",
    execute: { kind: "activate" },
    disabled: false
  });
  expect(
    getFeatureActionOptionsForCharacter(
      characterFixture({ ...cleric, level: 2, xp: 0 }),
      "cleric-channel-divinity"
    ).map((option) => option.name)
  ).not.toContain("Preserve Life");
});
it("Action Surge is absent before level two", () => {
  expect(
    getFeatureActionsForCharacter(characterFixture({ level: 1, xp: 0 })).map(
      (action) => action.name
    )
  ).not.toContain("Action Surge");
});
