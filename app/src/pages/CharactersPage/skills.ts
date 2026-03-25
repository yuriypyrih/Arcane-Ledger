import type { AbilityKey, Character, SkillName } from "../../types";
import { getAbilityModifier, getProficiencyBonus } from "./gameplay";
import { getAbilityScoreForCharacter } from "./abilities";
import { getSkillBonusesForCharacter } from "./classFeatures";
import { skillGroupsByAbility } from "./skillDefinitions";

export type SkillProficiencyMultiplier = 0 | 1 | 2;

export type SkillRow = {
  name: SkillName;
  ability: AbilityKey;
  abilityLabel: string;
  abilityModifier: number;
  proficiencyBonus: number;
  proficiencyMultiplier: SkillProficiencyMultiplier;
  proficiencyContribution: number;
  bonusEntries: Array<{
    label: string;
    value: number;
  }>;
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
        const proficiencyContribution = proficiencyMultiplier * proficiencyBonus;
        const bonusEntries = getSkillBonusesForCharacter(character, skill).map((entry) => {
          if (entry.abilityModifierSource) {
            const sourceValue = getAbilityModifier(
              getAbilityScoreForCharacter(character, entry.abilityModifierSource)
            );

            return {
              label: entry.label,
              value:
                typeof entry.minimumValue === "number"
                  ? Math.max(entry.minimumValue, sourceValue)
                  : sourceValue
            };
          }

          return {
            label: entry.label,
            value: entry.value ?? 0
          };
        });
        const bonusTotal = bonusEntries.reduce((total, entry) => total + entry.value, 0);

        return {
          name: skill,
          ability: group.ability,
          abilityLabel: group.abilityLabel,
          abilityModifier,
          proficiencyBonus,
          proficiencyMultiplier,
          proficiencyContribution,
          bonusEntries,
          totalModifier: abilityModifier + proficiencyContribution + bonusTotal
        };
      })
    };
  });
}
