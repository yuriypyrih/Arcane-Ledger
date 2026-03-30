import type { AbilityKey, Character, SkillName, SkillProficiencyEntry } from "../../types";
import { PROF_LEVEL } from "../../types";
import { getAbilityModifier, getProficiencyBonus } from "./gameplay";
import { getAbilityScoreForCharacter } from "./abilities";
import { getSkillBonusesForCharacter } from "./classFeatures";
import { getResolvedSkillProficiencyEntry, getSkillProficiencyForName } from "./proficiency";
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
  proficiencySourceLabels: string[];
  proficiencyLocked: boolean;
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
  skillProficiencies: SkillProficiencyEntry[]
): SkillRowsByAbility[] {
  const proficiencyBonus = getProficiencyBonus(character.level);

  return skillGroupsByAbility.map((group) => {
    return {
      ability: group.ability,
      abilityLabel: group.abilityLabel,
      rows: group.skills.map((skill) => {
        const resolvedProficiency = getResolvedSkillProficiencyEntry(
          skillProficiencies,
          getSkillProficiencyForName(skill)!
        );
        const proficiencyLevel = resolvedProficiency.proficiencyLevel;
        const proficiencyMultiplier: SkillProficiencyMultiplier =
          proficiencyLevel === PROF_LEVEL.EXPERT
            ? 2
            : proficiencyLevel === PROF_LEVEL.PROFICIENT
              ? 1
              : 0;
        const proficiencyContribution = proficiencyMultiplier * proficiencyBonus;
        const featureBonuses = getSkillBonusesForCharacter(character, skill, proficiencyLevel);
        const replacementEntry = featureBonuses.find(
          (entry) => entry.replacesBaseAbility && entry.abilityModifierSource
        );
        const effectiveAbility = replacementEntry?.abilityModifierSource ?? group.ability;
        const effectiveAbilityModifier = getAbilityModifier(
          getAbilityScoreForCharacter(character, effectiveAbility)
        );
        const bonusEntries = featureBonuses.flatMap((entry) => {
          if (entry.replacesBaseAbility && entry.abilityModifierSource) {
            return [];
          }

          if (entry.abilityModifierSource) {
            const sourceValue = getAbilityModifier(
              getAbilityScoreForCharacter(character, entry.abilityModifierSource)
            );

            return [
              {
                label: entry.label,
                value:
                  typeof entry.minimumValue === "number"
                    ? Math.max(entry.minimumValue, sourceValue)
                    : sourceValue
              }
            ];
          }

          return [
            {
              label: entry.label,
              value: entry.value ?? 0
            }
          ];
        });
        const bonusTotal = bonusEntries.reduce((total, entry) => total + entry.value, 0);

        return {
          name: skill,
          ability: effectiveAbility,
          abilityLabel: replacementEntry?.label ?? group.ability,
          abilityModifier: effectiveAbilityModifier,
          proficiencyBonus,
          proficiencyMultiplier,
          proficiencyContribution,
          proficiencySourceLabels: resolvedProficiency.sourceLabels,
          proficiencyLocked: resolvedProficiency.locked,
          bonusEntries,
          totalModifier: effectiveAbilityModifier + proficiencyContribution + bonusTotal
        };
      })
    };
  });
}
