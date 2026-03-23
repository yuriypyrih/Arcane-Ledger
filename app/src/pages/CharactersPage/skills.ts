import type { AbilityKey, Character, SkillName } from "../../types";
import { getAbilityModifier, getProficiencyBonus } from "./gameplay";
import { getAbilityScoreForCharacter } from "./abilities";
import { skillGroupsByAbility } from "./skillDefinitions";

export type SkillProficiencyMultiplier = 0 | 1 | 2;

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

export function getSkillRowsByAbility(
  character: Character,
  proficientSkills: string[],
  expertSkills: string[] = []
): SkillRowsByAbility[] {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const proficientSkillSet = new Set<string>(proficientSkills);
  const expertSkillSet = new Set<string>(expertSkills.filter((skill) => proficientSkillSet.has(skill)));

  return skillGroupsByAbility.map((group) => {
    const abilityModifier = getAbilityModifier(
      getAbilityScoreForCharacter(character, group.ability)
    );

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
