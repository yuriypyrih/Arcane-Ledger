import { CLASS_FEATURE } from "../../../codex/entries";
import { getClassEntryByName } from "../../../codex/selectors";
import type { AbilityKey, AbilityScores, Character } from "../../../types";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityScoresForCharacter,
  type AbilityModifierBonusEntry
} from "../abilities";
import {
  getAbilityCheckIndicatorsForCharacter,
  getSavingThrowBonusesForCharacter,
  getSavingThrowIndicatorsForCharacter,
  hasActivePaladinAuraOfProtectionForCharacter,
  type FeatureIndicator,
  type FeatureSavingThrowBonus
} from "../classFeatures";
import { getBarbarianRageState } from "../classFeatures/barbarian/barbarian";
import { getFeatureDescriptionForCharacter } from "../classFeatures/featureDescriptions";
import { abilityKeys } from "../constants";
import {
  formatCustomTraitBonusFormulaTerm,
  type CustomTraitBonusInput
} from "../customTraitEffects";
import { formatAbilityModifier, getProficiencyBonus } from "../gameplay";
import {
  getPrimaryAbilityForClass,
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../proficiency";
import { resolveFeatureIndicators, type ResolvedRollState } from "../rollState";
import { getProficiencyMultiplier } from "../shared";
import { getCharacterCustomTraitEffectInput } from "./customEffectRuntime";

export const abilityDisplayLabels: Record<AbilityKey, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma"
};

export type CombatSummarySavingThrowBonusEntry = {
  label: string;
  value: number;
  formula?: string;
  formulaMultiplier?: 1 | -1;
  abilityModifierSource?: AbilityKey;
  formulaSourceLabel?: string;
  formulaLabel?: string;
};

export type CombatSummaryAbilitySavingThrowCard = {
  ability: AbilityKey;
  score: number;
  modifier: string;
  modifierBaseValue: number;
  modifierValue: number;
  modifierBonusEntries: AbilityModifierBonusEntry[];
  isSavingThrowProficient: boolean;
  proficiencyContribution: number;
  proficiencyLabel?: string;
  savingThrowBonusEntries: CombatSummarySavingThrowBonusEntry[];
  totalSavingThrowValue: number;
  totalSavingThrow: string;
  showScoreBoostIcon?: boolean;
  scoreBoostIconLabel?: string;
  showSavingThrowBoostIcon?: boolean;
  savingThrowBoostIconLabel?: string;
  modifierIndicators: FeatureIndicator[];
  modifierRollState: ResolvedRollState | null;
  savingThrowIndicators: FeatureIndicator[];
  savingThrowRollState: ResolvedRollState | null;
};

export type CharacterCombatSummaryAbilities = {
  effectiveAbilities: AbilityScores;
  primaryAbilities: AbilityKey[];
  abilityCheckIndicators: Partial<Record<AbilityKey, FeatureIndicator[]>>;
  savingThrowIndicators: Partial<Record<AbilityKey, FeatureIndicator[]>>;
  customTraitEffectInput: CustomTraitBonusInput;
  proficiencyBonus: number;
  abilitySavingThrowCards: CombatSummaryAbilitySavingThrowCard[];
};

function getPrimaryAbilitiesFromLabel(label: string): AbilityKey[] {
  const normalizedLabel = label.toUpperCase();

  return abilityKeys.filter((ability) => {
    const abilityName = abilityDisplayLabels[ability].toUpperCase();
    return (
      new RegExp(`\\b${ability}\\b`).test(normalizedLabel) ||
      new RegExp(`\\b${abilityName}\\b`).test(normalizedLabel)
    );
  });
}

export function getClassPrimaryAbilitiesForUi(className: string): AbilityKey[] {
  const starterPack = getClassEntryByName(className)?.starterPack ?? null;

  if (starterPack?.primaryAbilityLabel) {
    const labeledAbilities = getPrimaryAbilitiesFromLabel(starterPack.primaryAbilityLabel);

    if (labeledAbilities.length > 0) {
      return labeledAbilities;
    }
  }

  if (starterPack?.primaryAbility) {
    return [starterPack.primaryAbility];
  }

  const fallbackPrimaryAbility = getPrimaryAbilityForClass(className);
  return fallbackPrimaryAbility ? [fallbackPrimaryAbility] : [];
}

export function resolveFeatureSavingThrowBonusValue(
  bonus: FeatureSavingThrowBonus,
  character: Character,
  options?: {
    customTraitEffectInput?: CustomTraitBonusInput;
  }
): number {
  if (bonus.abilityModifierSource) {
    const sourceValue = getAbilityModifierBreakdownForCharacter(
      character,
      bonus.abilityModifierSource,
      {
        customTraitEffectInput: options?.customTraitEffectInput
      }
    ).total;
    const clampedValue =
      typeof bonus.minimumValue === "number" ? Math.max(bonus.minimumValue, sourceValue) : sourceValue;

    return clampedValue * (bonus.abilityModifierMultiplier ?? 1);
  }

  return bonus.value ?? 0;
}

export function createCombatSummaryAbilities(character: Character): CharacterCombatSummaryAbilities {
  const primaryAbilities = getClassPrimaryAbilitiesForUi(character.className);
  const hasIndomitableMight =
    character.className === "Barbarian" &&
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.INDOMITABLE_MIGHT).length > 0;
  const hasFanaticalFocus =
    character.className === "Barbarian" &&
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.FANATICAL_FOCUS).length > 0;
  const isBarbarianRaging = hasFanaticalFocus && getBarbarianRageState(character).active === true;
  const hasLeadingEvasion =
    character.className === "Bard" &&
    character.subclassId === "bard-college-of-dance" &&
    character.level >= 14;
  const hasEvasion = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.EVASION).length > 0;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const effectiveAbilities = getAbilityScoresForCharacter(character);
  const customTraitEffectInput = getCharacterCustomTraitEffectInput(character);
  const paladinAuraOfProtectionBonus = hasActivePaladinAuraOfProtectionForCharacter(character)
    ? Math.max(1, getAbilityModifierBreakdownForCharacter(character, "CHA").total)
    : 0;
  const abilityCheckIndicators = getAbilityCheckIndicatorsForCharacter(character);
  const savingThrowIndicators = getSavingThrowIndicatorsForCharacter(character);
  const abilitySavingThrowCards = abilityKeys.map((ability) => {
    const abilityScore = effectiveAbilities[ability];
    const abilityModifierBreakdown = getAbilityModifierBreakdownForCharacter(character, ability, {
      customTraitEffectInput
    });
    const abilityModifierValue = abilityModifierBreakdown.total;
    const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
    const savingThrowLevel = getSavingThrowLevelFromEntries(
      character.savingThrowProficiencies,
      savingThrowProficiency
    );
    const proficiencyMultiplier = getProficiencyMultiplier(savingThrowLevel);
    const proficiencyContribution = proficiencyBonus * proficiencyMultiplier;
    const featureSavingThrowBonusEntries: CombatSummarySavingThrowBonusEntry[] =
      getSavingThrowBonusesForCharacter(character, ability, {
        customTraitEffectInput
      }).map((bonus) => {
        const value = resolveFeatureSavingThrowBonusValue(bonus, character, {
          customTraitEffectInput
        });

        return {
          label: bonus.label,
          value,
          formula: bonus.formula,
          formulaMultiplier: bonus.formulaMultiplier,
          abilityModifierSource: bonus.abilityModifierSource,
          formulaSourceLabel: bonus.formulaSourceLabel,
          formulaLabel:
            formatCustomTraitBonusFormulaTerm({
              ...bonus,
              value
            }) ?? undefined
        };
      });
    const savingThrowBonusEntries: CombatSummarySavingThrowBonusEntry[] = [
      ...(paladinAuraOfProtectionBonus > 0
        ? [
            {
              label: "Aura of Protection",
              value: paladinAuraOfProtectionBonus
            }
          ]
        : []),
      ...featureSavingThrowBonusEntries
    ];
    const totalSavingThrowValue =
      abilityModifierValue +
      proficiencyContribution +
      savingThrowBonusEntries.reduce((sum, entry) => sum + entry.value, 0);
    const proficiencyLabel =
      proficiencyMultiplier === 2
        ? "Proficiency Bonus x2"
        : proficiencyMultiplier === 1
          ? "Proficiency Bonus"
          : undefined;
    const modifierIndicators = abilityCheckIndicators[ability] ?? [];
    const saveIndicators = savingThrowIndicators[ability] ?? [];
    const modifierRollState = resolveFeatureIndicators(modifierIndicators);
    const savingThrowRollState = resolveFeatureIndicators(saveIndicators);

    return {
      ability,
      score: abilityScore,
      modifier: formatAbilityModifier(abilityModifierValue),
      modifierBaseValue: abilityModifierBreakdown.baseValue,
      modifierValue: abilityModifierValue,
      modifierBonusEntries: abilityModifierBreakdown.bonusEntries,
      isSavingThrowProficient: proficiencyMultiplier > 0,
      proficiencyContribution,
      proficiencyLabel,
      savingThrowBonusEntries,
      totalSavingThrowValue,
      totalSavingThrow: formatAbilityModifier(totalSavingThrowValue),
      showScoreBoostIcon:
        (ability === "STR" && hasIndomitableMight) ||
        isBarbarianRaging ||
        (ability === "DEX" && hasLeadingEvasion),
      scoreBoostIconLabel:
        ability === "DEX" && hasLeadingEvasion
          ? "Leading Evasion active"
          : ability === "STR" && hasIndomitableMight
            ? "Indomitable Might active"
            : isBarbarianRaging
              ? "Fanatical Focus active"
              : undefined,
      showSavingThrowBoostIcon: ability === "DEX" && hasEvasion,
      savingThrowBoostIconLabel: ability === "DEX" && hasEvasion ? "Evasion active" : undefined,
      modifierIndicators,
      modifierRollState,
      savingThrowIndicators: saveIndicators,
      savingThrowRollState
    };
  });

  return {
    effectiveAbilities,
    primaryAbilities,
    abilityCheckIndicators,
    savingThrowIndicators,
    customTraitEffectInput,
    proficiencyBonus,
    abilitySavingThrowCards
  };
}
