import type { AbilityKey, Character, SkillName, SkillProficiencyEntry } from "../../types";
import { PROF_LEVEL } from "../../types";
import { getProficiencyBonus } from "./gameplay";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityModifierForCharacter
} from "./abilities";
import { getSkillBonusesForCharacter } from "./classFeatures";
import { getResolvedSkillProficiencyEntry, getSkillProficiencyForName } from "./proficiency";
import { skillGroupsByAbility } from "./skillDefinitions";
import { getExhaustionD20TestPenalty } from "./statusEntries";
import { formatCustomTraitBonusFormulaTerm } from "./customTraitEffects";

export type SkillProficiencyMultiplier = 0 | 1 | 2;

export type SkillRow = {
  name: SkillName;
  ability: AbilityKey;
  abilityLabel: string;
  abilityModifierBase: number;
  abilityModifier: number;
  abilityModifierBonusEntries: Array<{
    label: string;
    value: number;
    abilityModifierSource?: AbilityKey;
    formulaSourceLabel?: string;
    formulaLabel?: string;
  }>;
  proficiencyBonus: number;
  proficiencyMultiplier: SkillProficiencyMultiplier;
  proficiencyContribution: number;
  proficiencySourceLabels: string[];
  proficiencyLocked: boolean;
  bonusEntries: Array<{
    label: string;
    value: number;
    abilityModifierSource?: AbilityKey;
    formulaSourceLabel?: string;
    formulaLabel?: string;
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
        const effectiveAbilityModifierBreakdown = getAbilityModifierBreakdownForCharacter(
          character,
          effectiveAbility
        );
        const effectiveAbilityModifier = effectiveAbilityModifierBreakdown.total;
        const bonusEntries = featureBonuses.flatMap((entry) => {
          if (entry.replacesBaseAbility && entry.abilityModifierSource) {
            return [];
          }

          if (entry.abilityModifierSource) {
            const sourceValue = getAbilityModifierForCharacter(character, entry.abilityModifierSource);
            const value =
              (typeof entry.minimumValue === "number"
                ? Math.max(entry.minimumValue, sourceValue)
                : sourceValue) * (entry.abilityModifierMultiplier ?? 1);

            if (value === 0 && entry.formulaSourceLabel) {
              return [];
            }

            return [
              {
                label: entry.label,
                value,
                abilityModifierSource: entry.abilityModifierSource,
                formulaSourceLabel: entry.formulaSourceLabel,
                formulaLabel:
                  formatCustomTraitBonusFormulaTerm({
                    ...entry,
                    value
                  }) ?? undefined
              }
            ];
          }

          return [
            {
              label: entry.label,
              value: entry.value ?? 0,
              formulaSourceLabel: entry.formulaSourceLabel,
              formulaLabel:
                formatCustomTraitBonusFormulaTerm({
                  value: entry.value ?? 0,
                  formulaSourceLabel: entry.formulaSourceLabel
                }) ?? undefined
            }
          ];
        });
        const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
        const rollBonusEntries =
          exhaustionPenalty !== 0
            ? [
                ...bonusEntries,
                {
                  label: "Exhaustion",
                  value: exhaustionPenalty
                }
              ]
            : bonusEntries;
        const bonusTotal = rollBonusEntries.reduce((total, entry) => total + entry.value, 0);

        return {
          name: skill,
          ability: effectiveAbility,
          abilityLabel: replacementEntry?.label ?? group.ability,
          abilityModifierBase: effectiveAbilityModifierBreakdown.baseValue,
          abilityModifier: effectiveAbilityModifier,
          abilityModifierBonusEntries: effectiveAbilityModifierBreakdown.bonusEntries,
          proficiencyBonus,
          proficiencyMultiplier,
          proficiencyContribution,
          proficiencySourceLabels: resolvedProficiency.sourceLabels,
          proficiencyLocked: resolvedProficiency.locked,
          bonusEntries: rollBonusEntries,
          totalModifier: effectiveAbilityModifier + proficiencyContribution + bonusTotal
        };
      })
    };
  });
}
