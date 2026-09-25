import { describe, expect, it } from "vitest";
import { FEATS } from "../../src/codex/entries/enums";
import {
  STATUS_DURATION_KIND as Kind,
  STATUS_DURATION_ROUND_TICK as Tick,
  type AbilityKey,
  type CharacterInventoryItem
} from "../../src/types";
import {
  getAbilityModifierForCharacter,
  getAbilityScoreBreakdownForCharacter,
  getAbilityScoreForCharacter
} from "../../src/pages/CharactersPage/abilities";
import {
  formatCharacterCustomTraitEffectSummary,
  normalizeCharacterCustomTraitEffects
} from "../../src/pages/CharactersPage/customTraitEffects";
import {
  activateCustomActionForCharacter,
  customActionKeyPrefix
} from "../../src/pages/CharactersPage/customActions";
import {
  advanceCharacterStatusEntries,
  removeCharacterStatusEntry
} from "../../src/pages/CharactersPage/statusEntries";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { characterFixture } from "../fixtures/character";
import { effectItem, effectStatus, hardSet } from "../fixtures/custom-effects";

const abilities: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

describe("hard-set ability scores", () => {
  it.each(abilities)("sets %s to exactly 0 or 30 without rewriting the base score", (ability) => {
    const base = characterFixture();
    for (const value of [0, 30]) {
      const character = {
        ...base,
        statusEntries: [effectStatus("Override", [hardSet(ability, value)])]
      };
      expect(getAbilityScoreForCharacter(character, ability)).toBe(value);
      expect(getAbilityModifierForCharacter(character, ability)).toBe(value === 0 ? -5 : 10);
      expect(character.abilities).toEqual(base.abilities);
    }
  });

  it("overrides feats and ordinary score buffs/debuffs but retains direct modifier bonuses", () => {
    const normal = characterFixture({
      level: 4,
      xp: 2700,
      feats: [
        {
          id: "asi",
          feat: FEATS.ABILITY_SCORE_IMPROVEMENT,
          takenAtLevel: 4,
          source: { type: "manual" },
          abilityScoreImprovement: { mode: "single", primaryAbility: "STR" }
        }
      ],
      statusEntries: [
        effectStatus("Bonuses", [
          { type: "abilityScore", ability: "STR", value: 10 },
          { type: "abilityScore", ability: "STR", value: 2, valueMode: "debuff" },
          { type: "abilityModifier", ability: "STR", value: 2 }
        ])
      ]
    });
    expect(getAbilityScoreForCharacter(normal, "STR")).toBe(26);
    const overridden = {
      ...normal,
      inventoryItems: [effectItem("Fixed Strength", [hardSet("STR", 18)])]
    };
    expect(getAbilityScoreForCharacter(overridden, "STR")).toBe(18);
    expect(getAbilityModifierForCharacter(overridden, "STR")).toBe(6);
    expect(getAbilityScoreBreakdownForCharacter(overridden, "STR").entries).toEqual([
      { label: "HARD SET: Fixed Strength", value: 18 }
    ]);
    expect(getAbilityScoreForCharacter({ ...overridden, inventoryItems: [] }, "STR")).toBe(26);
  });

  it("chooses the highest across item and status sources, independently for each ability", () => {
    const character = characterFixture({
      inventoryItems: [effectItem("Lesser", [hardSet("STR", 17), hardSet("DEX", 19)])],
      statusEntries: [effectStatus("Greater", [hardSet("STR", 23), hardSet("DEX", 12)])]
    });
    expect(getAbilityScoreForCharacter(character, "STR")).toBe(23);
    expect(getAbilityScoreForCharacter(character, "DEX")).toBe(19);
    expect(getAbilityScoreForCharacter({ ...character, statusEntries: [] }, "STR")).toBe(17);
    const tied = { ...character, inventoryItems: [effectItem("Equal", [hardSet("STR", 23)])] };
    expect(getAbilityScoreForCharacter(tied, "STR")).toBe(23);
    expect(getAbilityScoreForCharacter({ ...tied, statusEntries: [] }, "STR")).toBe(23);
  });

  it("ignores disabled and expired traits and restores the next source after removal", () => {
    const lesser = effectStatus("Lesser", [hardSet("STR", 18)]);
    const greater = {
      ...effectStatus("Greater", [hardSet("STR", 25)]),
      duration: { kind: Kind.ROUNDS, amount: 1, tickOn: Tick.ROUND_END } as const
    };
    const character = characterFixture({ statusEntries: [lesser, greater] });
    expect(getAbilityScoreForCharacter(character, "STR")).toBe(25);
    for (const statusEntries of [
      [lesser, { ...greater, disabled: true }],
      removeCharacterStatusEntry(character.statusEntries, greater.id),
      advanceCharacterStatusEntries(character.statusEntries, Tick.ROUND_END)
    ]) {
      expect(getAbilityScoreForCharacter({ ...character, statusEntries }, "STR")).toBe(18);
    }
    expect(getAbilityScoreForCharacter({ ...character, statusEntries: [] }, "STR")).toBe(16);
  });

  it("uses existing item quantity, attunement, weapon, armor, and shield activation rules", () => {
    const character = characterFixture();
    const item = effectItem("Item", [hardSet("STR", 25)]);
    const score = (stack: CharacterInventoryItem) =>
      getAbilityScoreForCharacter({ ...character, inventoryItems: [stack] }, "STR");
    expect(score(item)).toBe(25);
    expect(score({ ...item, quantity: 0 })).toBe(16);
    const attuned = { ...item, mods: { ...item.mods, requiresAttunement: true } };
    expect(score(attuned)).toBe(16);
    expect(score({ ...attuned, attuned: true })).toBe(25);
    const weapon: CharacterInventoryItem = {
      ...item,
      mods: { ...item.mods, baseCategory: "weapon" }
    };
    expect(score({ ...weapon, onHandQuantity: 0 })).toBe(16);
    expect(score({ ...weapon, onHandQuantity: 1 })).toBe(25);
    const armor: CharacterInventoryItem = {
      ...item,
      mods: { ...item.mods, baseCategory: "armor" }
    };
    expect(score({ ...armor, worn: false })).toBe(16);
    expect(score({ ...armor, worn: true })).toBe(25);
    const shield: CharacterInventoryItem = {
      ...armor,
      mods: { ...item.mods, baseCategory: "armor", armor: { armorType: "shield" } }
    };
    expect(score({ ...shield, onHandQuantity: 0 })).toBe(16);
    expect(score({ ...shield, onHandQuantity: 1 })).toBe(25);
  });

  it("activates through a custom action and survives portable save/load with item effects", () => {
    const character = characterFixture({
      inventoryItems: [effectItem("Intellect", [hardSet("INT", 30)])],
      customActions: [
        {
          id: "fixed-strength",
          name: "Fixed Strength",
          description: "Set strength to zero.",
          economy: "non_action",
          customEffects: [hardSet("STR", 0)],
          duration: { kind: Kind.INFINITE }
        }
      ]
    });
    expect(getAbilityScoreForCharacter(character, "STR")).toBe(16);
    const activated = activateCustomActionForCharacter(
      character,
      `${customActionKeyPrefix}fixed-strength`
    );
    expect(getAbilityScoreForCharacter(activated, "STR")).toBe(0);
    const restored = normalizeCharacter(createPortableCharacterSheet(activated))!;
    expect(getAbilityScoreForCharacter(restored, "STR")).toBe(0);
    expect(getAbilityScoreForCharacter(restored, "INT")).toBe(30);
    expect(restored.abilities).toEqual(character.abilities);
    expect(restored.customActions?.[0].customEffects).toEqual([hardSet("STR", 0)]);
  });
});

describe("hard-set effect data", () => {
  it("keeps zero and strips unsupported modes without changing existing additive effects", () => {
    expect(
      normalizeCharacterCustomTraitEffects([
        { ...hardSet("STR", 0), valueMode: "debuff", rollMode: "advantage" },
        { type: "abilityScore", ability: "STR", value: 30, valueMode: "debuff" },
        { type: "abilityScore", ability: "STR", value: 40 },
        { type: "armorClass", value: 0 }
      ])
    ).toEqual([
      hardSet("STR", 0),
      { type: "abilityScore", ability: "STR", value: 30, valueMode: "debuff" },
      { type: "abilityScore", ability: "STR", value: 40 }
    ]);
  });

  it.each(["STR", "1d6", "18", null, NaN, Infinity, -1, 31, 18.5])(
    "rejects invalid value %s",
    (value) => {
      expect(
        normalizeCharacterCustomTraitEffects([
          { type: "hardSetAbilityScore", ability: "STR", value }
        ])
      ).toEqual([]);
    }
  );

  it("rejects invalid abilities and formats overrides without a bonus sign", () => {
    expect(
      normalizeCharacterCustomTraitEffects([
        { type: "hardSetAbilityScore", ability: "BAD", value: 18 }
      ])
    ).toEqual([]);
    expect(formatCharacterCustomTraitEffectSummary(hardSet("STR", 0))).toBe(
      "HARD SET STR Ability Score: 0"
    );
    expect(formatCharacterCustomTraitEffectSummary(hardSet("INT", 30))).toBe(
      "HARD SET INT Ability Score: 30"
    );
  });
});
