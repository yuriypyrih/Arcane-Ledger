import { describe, expect, it } from "vitest";
import {
  ARMOR_PROFICIENCY as Armor,
  TOOL_PROFICIENCY as Tool,
  SKILL_PROFICIENCY as Skill,
  WEAPON_PROFICIENCY as Weapon,
  type CharacterClassEntry
} from "../../src/types";
import {
  applyClassProgression,
  createMulticlassDraft
} from "../../src/pages/CharactersPage/multiclassProgression";
import { expandWeaponProficiencies } from "../../src/pages/CharactersPage/proficiencyWeaponLabels";
import { characterFixture } from "../fixtures/character";

const training = [
  { className: "Barbarian", armor: [Armor.SHIELD], martial: true },
  {
    className: "Bard",
    armor: [Armor.LIGHT],
    skill: Skill.ANIMAL_HANDLING,
    tools: [Tool.MUSICAL_INSTRUMENT_LUTE]
  },
  { className: "Cleric", armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD] },
  { className: "Druid", armor: [Armor.LIGHT, Armor.SHIELD] },
  { className: "Fighter", armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD], martial: true },
  { className: "Monk", armor: [] },
  { className: "Paladin", armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD], martial: true },
  {
    className: "Ranger",
    armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD],
    martial: true,
    skill: Skill.ANIMAL_HANDLING
  },
  { className: "Rogue", armor: [Armor.LIGHT], skill: Skill.STEALTH, tools: [Tool.THIEVES_TOOLKIT] },
  { className: "Sorcerer", armor: [] },
  { className: "Warlock", armor: [Armor.LIGHT] },
  { className: "Wizard", armor: [] }
];

describe("secondary-class starting training", () => {
  it.each(training)(
    "$className grants only its multiclass training and no starting equipment",
    (expected) => {
      const character = characterFixture({
        className: expected.className === "Wizard" ? "Sorcerer" : "Wizard",
        level: 3,
        xp: 900
      });
      const draft = createMulticlassDraft(character);
      const entry: CharacterClassEntry = {
        id: "secondary",
        className: expected.className,
        level: 1,
        skillChoices: expected.className === "Rogue" ? ["Stealth"] : ["Animal Handling"],
        toolChoices: [Tool.MUSICAL_INSTRUMENT_LUTE]
      };
      draft.classes.push(entry);
      const result = applyClassProgression(character, draft);
      const sourced = <T extends { sourceStr?: string; proficiency: string }>(entries: T[]) =>
        entries
          .filter((item) => item.sourceStr === `${expected.className} (multiclass)`)
          .map((item) => item.proficiency)
          .sort();
      expect(sourced(result.armorProficiencies)).toEqual([...expected.armor].sort());
      expect(sourced(result.weaponProficiencies)).toEqual(
        expected.martial ? expandWeaponProficiencies([Weapon.MARTIAL]).sort() : []
      );
      expect(sourced(result.skillProficiencies)).toEqual(expected.skill ? [expected.skill] : []);
      expect(sourced(result.toolProficiencies)).toEqual([...(expected.tools ?? [])].sort());
      expect(result.savingThrowProficiencies).toEqual(character.savingThrowProficiencies);
      expect(result.equipment).toEqual(character.equipment);
      expect(result.inventoryItems).toEqual(character.inventoryItems);
      expect(result.currencies).toEqual(character.currencies);
    }
  );
  it.each(["Bard", "Ranger", "Rogue"])(
    "%s starts with no skill or instrument automatically chosen",
    (className) => {
      const character = characterFixture({ className: "Wizard", level: 3, xp: 900 });
      const draft = createMulticlassDraft(character);
      draft.classes.push({ id: "secondary", className, level: 1 });
      const result = applyClassProgression(character, draft);
      expect(
        result.skillProficiencies.filter((entry) => entry.sourceStr === `${className} (multiclass)`)
      ).toEqual([]);
      if (className === "Bard")
        expect(
          result.toolProficiencies.filter((entry) => entry.sourceStr === "Bard (multiclass)")
        ).toEqual([]);
    }
  );
  it.each(["Ranger", "Rogue"])(
    "%s rejects a skill outside its list and grants at most one valid choice",
    (className) => {
      const character = characterFixture({ className: "Wizard", level: 3, xp: 900 });
      const draft = createMulticlassDraft(character);
      draft.classes.push({
        id: "secondary",
        className,
        level: 1,
        skillChoices: ["Arcana", "Stealth", "Survival"]
      });
      const result = applyClassProgression(character, draft);
      expect(
        result.skillProficiencies
          .filter((entry) => entry.sourceStr === `${className} (multiclass)`)
          .map((entry) => entry.proficiency)
      ).toEqual([Skill.STEALTH]);
    }
  );
});
