import type { AbilityKey, Character, SkillName } from "../../types";
import { getAbilityModifier, getProficiencyBonus } from "./gameplay";

export type SkillProficiencyMultiplier = 0 | 1 | 2;

export type SkillGroupDefinition = {
  ability: AbilityKey;
  abilityLabel: string;
  skills: SkillName[];
};

export type SkillRow = {
  name: SkillName;
  ability: AbilityKey;
  abilityLabel: string;
  abilityModifier: number;
  proficiencyBonus: number;
  proficiencyMultiplier: SkillProficiencyMultiplier;
  totalModifier: number;
};

export type SkillRowsByAbility = {
  ability: AbilityKey;
  abilityLabel: string;
  rows: SkillRow[];
};

export const skillGroupsByAbility: SkillGroupDefinition[] = [
  { ability: "STR", abilityLabel: "Strength", skills: ["Athletics"] },
  {
    ability: "DEX",
    abilityLabel: "Dexterity",
    skills: ["Acrobatics", "Sleight of Hand", "Stealth"]
  },
  {
    ability: "INT",
    abilityLabel: "Intelligence",
    skills: ["Arcana", "History", "Investigation", "Nature", "Religion"]
  },
  {
    ability: "WIS",
    abilityLabel: "Wisdom",
    skills: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"]
  },
  {
    ability: "CHA",
    abilityLabel: "Charisma",
    skills: ["Deception", "Intimidation", "Performance", "Persuasion"]
  }
];

export function getSkillRowsByAbility(
  character: Character,
  proficientSkills: string[],
  expertSkills: string[] = []
): SkillRowsByAbility[] {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const proficientSkillSet = new Set<string>(proficientSkills);
  const expertSkillSet = new Set<string>(expertSkills.filter((skill) => proficientSkillSet.has(skill)));

  return skillGroupsByAbility.map((group) => {
    const abilityModifier = getAbilityModifier(character.abilities[group.ability]);

    return {
      ability: group.ability,
      abilityLabel: group.abilityLabel,
      rows: group.skills.map((skill) => {
        const proficiencyMultiplier: SkillProficiencyMultiplier = expertSkillSet.has(skill)
          ? 2
          : proficientSkillSet.has(skill)
            ? 1
            : 0;

        return {
          name: skill,
          ability: group.ability,
          abilityLabel: group.abilityLabel,
          abilityModifier,
          proficiencyBonus,
          proficiencyMultiplier,
          totalModifier: abilityModifier + proficiencyMultiplier * proficiencyBonus
        };
      })
    };
  });
}
