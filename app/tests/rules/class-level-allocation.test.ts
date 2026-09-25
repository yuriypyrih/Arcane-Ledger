import { describe, expect, it } from "vitest";
import { CLASS_FEATURE, FEATS } from "../../src/codex/entries/enums";
import {
  allocateSingleClass,
  applyClassLevelAllocation
} from "../../src/pages/CharactersPage/classLevelAllocation";
import { createMulticlassDraft } from "../../src/pages/CharactersPage/multiclassProgression";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { getAutomaticMaxHitPointsForCharacter } from "../../src/pages/CharactersPage/gameplay";
import { getEffectiveHitPointMaximumForCharacter } from "../../src/pages/CharactersPage/traits";
import {
  applyClassDefinitions,
  createClassDefinitionsDraft,
  createDeclaredClass,
  setEntryRulesEnforced
} from "../../src/pages/CharactersPage/classDefinitions";
import { createCharacterStatusEntry } from "../../src/pages/CharactersPage/statusEntries";
import { STATUS_ENTRY_GROUP } from "../../src/types";
import { characterFixture } from "../fixtures/character";
import { multiclassFixture } from "../fixtures/multiclass";

function split() {
  const character = multiclassFixture(
    [
      { className: "Fighter", level: 3 },
      { className: "Wizard", level: 2 }
    ],
    { currentHitPoints: 12, heroicInspiration: false }
  );
  return { ...character, heroicInspiration: false };
}

describe("character level point allocation", () => {
  it.each([
    [3, 1000, false],
    [4, 2700, true]
  ])(
    "keeps ordinary progress at level %i in the single-class save format",
    (level, xp, inspiration) => {
      const character = characterFixture({ currentHitPoints: 12, heroicInspiration: false });
      const result = applyClassLevelAllocation(
        character,
        allocateSingleClass(createMulticlassDraft(character), level),
        level,
        xp
      );
      expect(result.multiclass).toBeUndefined();
      expect(result.level).toBe(level);
      expect(result.xp).toBe(xp);
      expect(result.heroicInspiration).toBe(inspiration);
      expect(result.currentHitPoints).toBe(12);
      expect(result.hitDiceRemaining).toBe(character.hitDiceRemaining);
      expect(result.equipment).toEqual(character.equipment);
      expect(result.classFeatureState).toEqual(character.classFeatureState);
      const saved = createPortableCharacterSheet(result);
      expect(saved.schemaVersion).toBe(2);
      expect(normalizeCharacter(saved)!.multiclass).toBeUndefined();
    }
  );
  it("still prunes lost class grants on an ordinary single-class level decrease", () => {
    const character = characterFixture({
      level: 4,
      xp: 2700,
      feats: [
        {
          id: "class-feat",
          feat: FEATS.ALERT,
          takenAtLevel: 4,
          source: {
            type: "class-feature",
            level: 4,
            feature: CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT
          }
        },
        { id: "manual-feat", feat: FEATS.TOUGH, takenAtLevel: 1, source: { type: "manual" } }
      ]
    });
    const result = applyClassLevelAllocation(
      character,
      allocateSingleClass(createMulticlassDraft(character), 3),
      3,
      900
    );
    expect(result.multiclass).toBeUndefined();
    expect(result.feats?.map((feat) => feat.id)).toEqual(["manual-feat"]);
    expect(character.feats).toHaveLength(2);
  });
  it("gives a single class the entire budget without mutating the saved draft", () => {
    const character = characterFixture();
    const draft = createMulticlassDraft(character);
    expect(allocateSingleClass(draft, 6).classes[0].level).toBe(6);
    expect(draft.classes[0].level).toBe(character.level);
  });
  it("does not choose which class gets newly available levels", () => {
    const draft = createMulticlassDraft(split());
    expect(allocateSingleClass(draft, 6).classes.map((entry) => entry.level)).toEqual([3, 2]);
  });
  it.each([4, 6])("rejects a split that does not use exactly the %i-point budget", (budget) => {
    const character = split();
    expect(() =>
      applyClassLevelAllocation(character, createMulticlassDraft(character), budget, 6500)
    ).toThrow(/exactly/);
  });
  it.each([-1, 1.5, NaN])("does not save an invalid class level (%s)", (level) => {
    const character = split();
    const draft = createMulticlassDraft(character);
    draft.classes[1].level = level;
    expect(() => applyClassLevelAllocation(character, draft, 5, 6500)).toThrow(/at least one/);
  });
  it.each([0, 101, 2.5])("rejects an invalid total budget (%s)", (total) => {
    const character = split();
    expect(() =>
      applyClassLevelAllocation(character, createMulticlassDraft(character), total, 6500)
    ).toThrow(/whole level/);
  });
  it("redistributes existing levels without changing XP, healing wounds, or granting equipment", () => {
    const character = { ...split(), maxHitPointsMode: "automatic" as const, hitPoints: 40 };
    const draft = createMulticlassDraft(character);
    draft.classes[0].level = 2;
    draft.classes[1].level = 3;
    const result = applyClassLevelAllocation(character, draft, 5, 7000);
    expect(result.level).toBe(5);
    expect(result.xp).toBe(7000);
    expect(result.currentHitPoints).toBe(12);
    expect(result.hitPoints).toBe(38); // Fighter 12 + 8, Wizard 3 × 6.
    expect(result.heroicInspiration).toBe(false);
    expect(result.equipment).toEqual(character.equipment);
    expect(result.inventoryItems).toEqual(character.inventoryItems);
    expect(result.currencies).toEqual(character.currencies);
    const reopened = normalizeCharacter(createPortableCharacterSheet(result))!;
    expect(reopened.multiclass?.classes.map((entry) => entry.level)).toEqual([2, 3]);
    expect(reopened.level).toBe(5);
    expect(reopened.hitPoints).toBe(38);
  });
  it("recalculates declared class Hit Dice while keeping Tough and Aid separate from base HP", () => {
    const character = characterFixture({
      maxHitPointsMode: "automatic",
      hitPoints: 28, // Fighter 3 at CON 14.
      currentHitPoints: 7,
      feats: [{ id: "tough", feat: FEATS.TOUGH, takenAtLevel: 1, source: { type: "manual" } }],
      statusEntries: [
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Aid",
          source: "Aid",
          sourceSpellId: "spell-aid",
          sourceSpellTarget: "self",
          sourceSpellSlotLevel: 2
        })
      ]
    });
    const definition = createClassDefinitionsDraft(character);
    definition.progression.classes.push(createDeclaredClass("Wizard"));
    let updated = applyClassDefinitions(character, definition);
    expect(updated.hitPoints).toBe(28);
    expect(updated.multiclass?.hitPointsAdjustment).toBe(0);

    const allocation = createMulticlassDraft(updated);
    allocation.classes[0].level = 1;
    allocation.classes[1].level = 2;
    updated = applyClassLevelAllocation(updated, allocation, 3, 900);
    expect(updated.hitPoints).toBe(24); // Fighter 12, Wizard 2 × 6.
    expect(getEffectiveHitPointMaximumForCharacter(updated)).toBe(35); // Tough +6, Aid +5.

    const changedDie = createClassDefinitionsDraft(updated);
    const wizard = setEntryRulesEnforced(updated, changedDie.progression.classes[1], false);
    changedDie.progression.classes[1] = {
      ...wizard,
      classRules: { ...wizard.classRules!, hitDie: "d12" }
    };
    updated = normalizeCharacter(
      createPortableCharacterSheet(applyClassDefinitions(updated, changedDie))
    )!;
    expect(updated.hitPoints).toBe(30); // Fighter 12, custom Wizard 2 × 9.
    expect(getEffectiveHitPointMaximumForCharacter(updated)).toBe(41);
    expect(updated.currentHitPoints).toBe(7);
    expect(updated.multiclass?.hitPointsAdjustment).toBe(0);
    expect(
      getEffectiveHitPointMaximumForCharacter({ ...updated, feats: [], statusEntries: [] })
    ).toBe(30);
  });
  it("uses the same minimum HP gain before and after declaring another class", () => {
    const character = characterFixture({
      className: "Wizard",
      maxHitPointsMode: "automatic",
      hitPoints: 4,
      abilities: { STR: 10, DEX: 10, CON: 2, INT: 16, WIS: 10, CHA: 10 }
    });
    expect(getAutomaticMaxHitPointsForCharacter(character)).toBe(4); // (6 - 4) + 1 + 1.
    const draft = createClassDefinitionsDraft(character);
    draft.progression.classes.push(createDeclaredClass("Fighter"));
    const declared = applyClassDefinitions(character, draft);
    expect(declared.hitPoints).toBe(4);
    expect(declared.multiclass?.hitPointsAdjustment).toBe(0);
  });
  it("keeps confirmed XP when decreasing the level budget", () => {
    const character = split();
    const draft = createMulticlassDraft(character);
    draft.classes[0].level = 2;
    const result = applyClassLevelAllocation(character, draft, 4, 3000);
    expect(result.level).toBe(4);
    expect(result.xp).toBe(3000);
    expect(normalizeCharacter(createPortableCharacterSheet(result))!.xp).toBe(3000);
  });
  it("rejects XP that implies another total level", () => {
    const character = split();
    expect(() =>
      applyClassLevelAllocation(character, createMulticlassDraft(character), 5, 900)
    ).toThrow(/Confirm XP/);
  });
  it("returns every point to the remaining class after removing the last secondary class", () => {
    const character = split();
    const draft = createMulticlassDraft(character);
    draft.classes.pop();
    const result = applyClassLevelAllocation(character, allocateSingleClass(draft, 5), 5, 6500);
    expect(result.multiclass?.classes.map((entry) => entry.level)).toEqual([5]);
    expect(result.level).toBe(5);
    expect(result.equipment).toEqual(character.equipment);
  });
  it.each(["switch", "remove", "replace"])("cannot %s the original starting class", (change) => {
    const character = split();
    const draft = createMulticlassDraft(character);
    if (change === "switch") draft.startingClassId = draft.classes[1].id;
    if (change === "remove") draft.classes.shift();
    if (change === "replace") draft.classes[0].className = "Bard";
    expect(() => applyClassLevelAllocation(character, draft, 5, 6500)).toThrow(
      "starting class cannot be changed or removed"
    );
  });
});
