import { describe, expect, it } from "vitest";
import { characterFixture } from "../fixtures/character";
import { magicInitiateFeat } from "../fixtures/feats";
import { CLASS_FEATURE } from "../../src/codex/entries";
import {
  getFeatAlwaysPreparedSpellEntriesForCharacter,
  getMagicInitiateFreeCastStateForCharacter
} from "../../src/pages/CharactersPage/feats/runtime/spellcasting";
import {
  consumeMagicInitiateFreeCastForCharacter,
  restoreMagicInitiateFreeCastsForCharacter
} from "../../src/pages/CharactersPage/feats/runtime/resources";
import {
  createClassDefinitionsDraft,
  createDeclaredClass,
  applyClassDefinitions,
  removeDeclaredClass
} from "../../src/pages/CharactersPage/classDefinitions";
import { applyClassLevelAllocation } from "../../src/pages/CharactersPage/classLevelAllocation";
import { createMulticlassDraft } from "../../src/pages/CharactersPage/multiclassProgression";
import {
  getCharacterClasses,
  getDeclaredCharacterClasses,
  readMulticlass
} from "../../src/pages/CharactersPage/multiclass";
import {
  getFeatureActionsForCharacter,
  activateFeatureActionForCharacter,
  applyLongRestToFeatureState
} from "../../src/pages/CharactersPage/classFeatures";
import {
  getCharacterSpellSlotPools,
  recoverSlotPools,
  setSlotPoolExpended
} from "../../src/pages/CharactersPage/multiclassSpellcasting";
import {
  getClassHitDicePools,
  spendClassHitDice,
  restoreHitDice
} from "../../src/pages/CharactersPage/hitDice";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { getArmorClassForCharacter } from "../../src/pages/CharactersPage/armor";
import {
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  TOOL_PROFICIENCY,
  SKILL_PROFICIENCY
} from "../../src/types";

function declared(className: string) {
  const character = characterFixture({
    className: className === "Wizard" ? "Fighter" : "Wizard",
    level: 5,
    xp: 6500,
    currentHitPoints: 7
  });
  const draft = createClassDefinitionsDraft(character);
  draft.progression.classes.push(createDeclaredClass(className));
  return { character, draft };
}

function reopen(character: ReturnType<typeof characterFixture>) {
  const result = normalizeCharacter(createPortableCharacterSheet(character));
  expect(result).not.toBeNull();
  return result!;
}

describe("class definitions and inactive classes", () => {
  it.each([
    "Wizard",
    "Barbarian",
    "Bard",
    "Cleric",
    "Druid",
    "Fighter",
    "Monk",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Warlock",
    "Artificer",
    "Custom"
  ])("declaring %s at zero grants nothing through reload", (className) => {
    const { character, draft } = declared(className);
    const entry = draft.progression.classes[1];
    entry.skillChoices = ["Animal Handling"];
    entry.toolChoices = [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE];
    if (entry.customClass) entry.customClass.castingProgression = "manual";
    const result = reopen(applyClassDefinitions(character, draft));
    expect(getDeclaredCharacterClasses(result).map((item) => item.level)).toEqual([5, 0]);
    expect(getCharacterClasses(result).map((item) => item.className)).toEqual([
      character.className
    ]);
    expect(result.hitPoints).toBe(character.hitPoints);
    expect(result.currentHitPoints).toBe(7);
    expect(result.level).toBe(5);
    expect(result.xp).toBe(6500);
    expect(result.equipment).toEqual(character.equipment);
    expect(result.inventoryItems).toEqual(character.inventoryItems);
    expect(result.skillProficiencies).toEqual(character.skillProficiencies);
    expect(result.toolProficiencies).toEqual(character.toolProficiencies);
    expect(result.armorProficiencies).toEqual(character.armorProficiencies);
    expect(result.weaponProficiencies).toEqual(character.weaponProficiencies);
    expect(result.savingThrowProficiencies).toEqual(character.savingThrowProficiencies);
    expect(getArmorClassForCharacter(result)).toBe(getArmorClassForCharacter(character));
    expect(getFeatureActionsForCharacter(result).map((action) => action.name)).toEqual(
      getFeatureActionsForCharacter(character).map((action) => action.name)
    );
    expect(getClassHitDicePools(result)).toHaveLength(1);
    expect(getCharacterSpellSlotPools(result).map((pool) => pool.totals)).toEqual(
      getCharacterSpellSlotPools(character).map((pool) => pool.totals)
    );
  });
  it("keeps a dormant Fighter's choices and spending through other pools and rests", () => {
    const { character, draft } = declared("Fighter");
    draft.progression.classes[0].level = 3;
    draft.progression.classes[1].level = 2;
    draft.progression.classes[1].subclassId = "fighter-champion";
    let active = applyClassDefinitions(character, draft);
    const fighterId = active.multiclass!.classes[1].id;
    active = activateFeatureActionForCharacter(active, "fighter-second-wind");
    active = spendClassHitDice(active, fighterId, 1);
    const zero = createMulticlassDraft(active);
    zero.classes[0].level = 5;
    zero.classes[1].level = 0;
    let inactive = reopen(applyClassLevelAllocation(active, zero, 5, 6500));
    expect(inactive.classFeatureState?.fighter?.secondWindUsesExpended).toBe(1);
    expect(
      getFeatureActionsForCharacter(inactive).some((action) => action.name === "Second Wind")
    ).toBe(false);
    inactive = reopen(restoreHitDice(applyLongRestToFeatureState(inactive)));
    expect(inactive.multiclass?.hitDiceExpendedByClass?.[fighterId]).toBe(1);
    expect(inactive.classFeatureState?.fighter?.secondWindUsesExpended).toBe(1);
    const again = createMulticlassDraft(inactive);
    again.classes[0].level = 3;
    again.classes[1].level = 2;
    const restored = reopen(applyClassLevelAllocation(inactive, again, 5, 6500));
    expect(restored.multiclass?.classes[1].subclassId).toBe("fighter-champion");
    expect(restored.classFeatureState?.fighter?.secondWindUsesExpended).toBe(1);
    expect(
      getClassHitDicePools(restored).find((pool) => pool.classEntryId === fighterId)?.remaining
    ).toBe(1);
  });
  it("does not refill dormant Pact slots or discard selected spells", () => {
    const { character, draft } = declared("Warlock");
    draft.progression.classes[0].level = 2;
    draft.progression.classes[1].level = 3;
    draft.progression.classes[1].preparedSpellIds = ["spell-hex"];
    let active = applyClassDefinitions(character, draft);
    const id = active.multiclass!.classes[1].id;
    active = setSlotPoolExpended(active, `pact:${id}`, [0, 1]);
    const zero = createMulticlassDraft(active);
    zero.classes[0].level = 5;
    zero.classes[1].level = 0;
    const inactive = reopen(
      recoverSlotPools(applyClassLevelAllocation(active, zero, 5, 6500), "long-rest")
    );
    expect(getCharacterSpellSlotPools(inactive)).toHaveLength(1);
    expect(inactive.multiclass?.slotPoolsExpended?.[`pact:${id}`]?.[1]).toBe(1);
    expect(inactive.multiclass?.classes[1].preparedSpellIds).toEqual(["spell-hex"]);
    const again = createMulticlassDraft(inactive);
    again.classes[0].level = 2;
    again.classes[1].level = 3;
    expect(
      getCharacterSpellSlotPools(reopen(applyClassLevelAllocation(inactive, again, 5, 6500)))[1]
        .expended[1]
    ).toBe(1);
  });
  it("does not recover an empty shared pool belonging to an inactive Wizard", () => {
    const { character, draft } = declared("Wizard");
    draft.progression.classes[0].level = 2;
    draft.progression.classes[1].level = 3;
    let active = applyClassDefinitions(character, draft);
    active = setSlotPoolExpended(active, "standard", [2, 1]);
    const zero = createMulticlassDraft(active);
    zero.classes[0].level = 5;
    zero.classes[1].level = 0;
    const inactive = reopen(
      recoverSlotPools(applyClassLevelAllocation(active, zero, 5, 6500), "long-rest")
    );
    expect(inactive.spellSlotsExpended?.slice(0, 2)).toEqual([2, 1]);
    expect(
      getCharacterSpellSlotPools(inactive).every((pool) =>
        pool.totals.every((count) => count === 0)
      )
    ).toBe(true);
  });
  it("returns deleted levels to the primary and rejects changes to its identity", () => {
    const { character, draft } = declared("Fighter");
    character.xp = 42; // Milestone characters need not meet their level's XP threshold.
    draft.progression.classes[0].level = 3;
    draft.progression.classes[1].level = 2;
    const active = applyClassDefinitions(character, draft);
    const edit = createClassDefinitionsDraft(active);
    expect(() => removeDeclaredClass(edit.progression, edit.progression.startingClassId)).toThrow(
      /starting class/
    );
    edit.progression = removeDeclaredClass(edit.progression, edit.progression.classes[1].id);
    const result = applyClassDefinitions(active, edit);
    expect(result.multiclass?.classes.map((entry) => entry.level)).toEqual([5]);
    expect(result.xp).toBe(42);
    expect(result.currentHitPoints).toBe(7);
    edit.progression.classes[0].className = "Rogue";
    expect(() => applyClassDefinitions(active, edit)).toThrow(/starting class/);
  });
  it("suspends class-granted feat choices and spent uses without granting their spells or resting them", () => {
    const { character, draft } = declared("Fighter");
    draft.progression.classes[0].level = 1;
    draft.progression.classes[1].level = 4;
    let active = applyClassDefinitions(character, draft);
    const id = active.multiclass!.classes[1].id;
    active.feats = [
      {
        ...magicInitiateFeat(),
        source: {
          type: "class-feature",
          classEntryId: id,
          feature: CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT,
          level: 4
        }
      }
    ];
    active = consumeMagicInitiateFreeCastForCharacter(active, "spell-shield");
    const zero = createMulticlassDraft(active);
    zero.classes[0].level = 5;
    zero.classes[1].level = 0;
    const inactive = reopen(
      restoreMagicInitiateFreeCastsForCharacter(applyClassLevelAllocation(active, zero, 5, 6500))
    );
    expect(getFeatAlwaysPreparedSpellEntriesForCharacter(inactive)).toEqual([]);
    expect(inactive.feats).toEqual([]);
    expect(inactive.multiclass!.classes[1].inactiveFeats?.[0].magicInitiate?.levelOneSpellId).toBe(
      "spell-shield"
    );
    const again = createMulticlassDraft(inactive);
    again.classes[0].level = 1;
    again.classes[1].level = 4;
    const restored = reopen(applyClassLevelAllocation(inactive, again, 5, 6500));
    expect(
      getFeatAlwaysPreparedSpellEntriesForCharacter(restored).map((spell) => spell.id)
    ).toEqual(["spell-shield"]);
    expect(getMagicInitiateFreeCastStateForCharacter(restored, "spell-shield")?.available).toBe(
      false
    );
    expect(restored.multiclass!.classes[1].inactiveFeats).toBeUndefined();
    const edit = createClassDefinitionsDraft(inactive);
    edit.progression = removeDeclaredClass(edit.progression, id);
    expect(applyClassDefinitions(inactive, edit).multiclass!.classes).toHaveLength(1);
  });
  it("replacing an active secondary class clears its owned choices, effects, and counters only", () => {
    const { character, draft } = declared("Barbarian");
    draft.progression.classes[0].level = 3;
    draft.progression.classes[1].level = 2;
    let active = applyClassDefinitions(character, draft);
    const oldId = active.multiclass!.classes[1].id;
    active = activateFeatureActionForCharacter(active, "barbarian-reckless-attack");
    active = spendClassHitDice(active, oldId, 1);
    active.feats = [magicInitiateFeat()];
    expect(active.statusEntries?.some((effect) => effect.sourceClassEntryId === oldId)).toBe(true);
    const edit = createClassDefinitionsDraft(active);
    edit.progression.classes[1] = createDeclaredClass("Rogue", 2);
    const replaced = reopen(applyClassDefinitions(active, edit));
    expect(replaced.multiclass!.classes[1]).toMatchObject({ className: "Rogue", level: 2 });
    expect(replaced.multiclass!.classes[1].id).not.toBe(oldId);
    expect(replaced.multiclass!.classes[1].subclassId).toBeFalsy();
    expect(replaced.statusEntries?.some((effect) => effect.sourceClassEntryId === oldId)).toBe(
      false
    );
    expect(replaced.multiclass!.hitDiceExpendedByClass?.[oldId]).toBeUndefined();
    expect(replaced.feats?.map((feat) => feat.id)).toEqual(["magic-initiate"]);
    expect(replaced.inventoryItems).toEqual(active.inventoryItems);
    expect(replaced.currentHitPoints).toBe(active.currentHitPoints);
    expect(replaced.xp).toBe(active.xp);
  });
  it("saves starting training and subclass edits on v2 without removing independent grants", () => {
    const character = characterFixture({
      className: "Bard",
      skillProficiencies: [
        {
          proficiency: SKILL_PROFICIENCY.ARCANA,
          source: PROFICIENCY_SOURCE.MANUAL,
          proficiencyLevel: PROF_LEVEL.EXPERT
        }
      ]
    });
    const draft = createClassDefinitionsDraft(character);
    draft.startingSkills = ["Animal Handling", "Performance", "Persuasion"];
    draft.startingTools = [
      TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE,
      TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE
    ];
    draft.progression.classes[0].subclassId = "bard-college-of-lore";
    const result = reopen(applyClassDefinitions(character, draft));
    expect(createPortableCharacterSheet(result).schemaVersion).toBe(2);
    expect(result.subclassId).toBe("bard-college-of-lore");
    expect(createClassDefinitionsDraft(result).startingSkills).toEqual(draft.startingSkills);
    expect(createClassDefinitionsDraft(result).startingTools.sort()).toEqual(
      [...draft.startingTools].sort()
    );
    expect(result.skillProficiencies).toContainEqual(
      expect.objectContaining({
        proficiency: SKILL_PROFICIENCY.ARCANA,
        source: PROFICIENCY_SOURCE.MANUAL,
        proficiencyLevel: PROF_LEVEL.EXPERT
      })
    );
  });
  it("rejects a zero primary, negative secondary, and duplicate classes", () => {
    const { draft } = declared("Fighter");
    expect(readMulticlass(draft.progression)).not.toBeNull();
    draft.progression.classes[1].level = -1;
    expect(readMulticlass(draft.progression)).toBeNull();
    draft.progression.classes[1].level = 0;
    draft.progression.classes[0].level = 0;
    expect(readMulticlass(draft.progression)).toBeNull();
    draft.progression.classes[0].level = 5;
    draft.progression.classes[1].className = "Wizard";
    expect(readMulticlass(draft.progression)).toBeNull();
  });
});
