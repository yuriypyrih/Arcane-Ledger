import {
  getAppliedAbilityScoreBonus,
  compareLabeledAbilityScoreBonuses
} from "./shared/abilityBonusMath";
import { getCharacterLevel } from "./multiclassState";
import type { AbilityKey, AbilityScores, Character } from "../../types";
import { abilityKeys } from "./constants";
import { getAbilityScoreBonusesForCharacter, type FeatureAbilityScoreBonus } from "./classFeatures";
import {
  formatCustomTraitBonusFormulaTerm,
  getCustomTraitAbilityModifierBonuses,
  getCustomTraitAbilityScoreOverride,
  type CustomTraitBonusInput
} from "./customTraitEffects";
import { getFeatAbilityScoreBonusesForCharacter } from "./feats/runtime/derivedSelectors";
import { getBackgroundAbilityScoreBonusesForCharacter } from "./backgrounds";
import { getCharacterCustomTraitEffectInput } from "./characterRuntime/customEffectRuntime";

export type AbilityScoreBreakdownEntry = {
  label: string;
  value: number;
};

export type AbilityScoreBreakdown = {
  ability: AbilityKey;
  total: number;
  entries: AbilityScoreBreakdownEntry[];
};

export type AbilityModifierBonusEntry = {
  label: string;
  value: number;
  abilityModifierSource?: AbilityKey;
  formulaSourceLabel?: string;
  formulaLabel?: string;
};

export type AbilityModifierBreakdown = {
  ability: AbilityKey;
  abilityScore: number;
  baseValue: number;
  bonusEntries: AbilityModifierBonusEntry[];
  total: number;
};

type AbilityCharacterContext = Partial<
  Pick<
    Character,
    | "abilities"
    | "level"
    | "className"
    | "classFeatureState"
    | "feats"
    | "statusEntries"
    | "inventoryItems"
    | "background"
    | "backgroundChoices"
  >
>;

type AbilityDerivationOptions = {
  customTraitEffectInput?: CustomTraitBonusInput;
};

type AbilityClassFeatureContext = AbilityCharacterContext & Pick<Character, "className" | "level">;

function hasAbilityClassFeatureContext(
  character: AbilityCharacterContext
): character is AbilityClassFeatureContext {
  return (
    typeof character.className === "string" && typeof getCharacterLevel(character) === "number"
  );
}

function normalizeAbilityScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

export function getAbilityScoreBreakdownForCharacter(
  character: AbilityCharacterContext,
  ability: AbilityKey,
  options?: AbilityDerivationOptions
): AbilityScoreBreakdown {
  const baseScore = normalizeAbilityScore(character.abilities?.[ability] ?? 10);
  const customTraitEffectInput =
    options?.customTraitEffectInput ?? getCharacterCustomTraitEffectInput(character);
  const override = getCustomTraitAbilityScoreOverride(customTraitEffectInput, ability);

  if (override !== null) {
    return {
      ability,
      total: override.value,
      entries: [{ label: `HARD SET: ${override.label}`, value: override.value }]
    };
  }

  const relevantBonuses: FeatureAbilityScoreBonus[] = [
    ...(typeof character.className === "string"
      ? getAbilityScoreBonusesForCharacter(
          hasAbilityClassFeatureContext(character)
            ? character
            : {
                ...character,
                className: character.className,
                level: 1
              },
          { customTraitEffectInput }
        )
      : []),
    ...getBackgroundAbilityScoreBonusesForCharacter(character),
    ...getFeatAbilityScoreBonusesForCharacter({
      feats: character.feats ?? [],
      level: getCharacterLevel(character) ?? 1
    })
  ]
    .filter((bonus) => bonus.ability === ability)
    .sort(compareLabeledAbilityScoreBonuses);
  let total = baseScore;
  const entries: AbilityScoreBreakdownEntry[] = [
    {
      label: "Base",
      value: baseScore
    }
  ];

  relevantBonuses.forEach((bonus) => {
    const normalizedValue = Math.floor(bonus.value);
    const appliedValue = getAppliedAbilityScoreBonus(total, bonus);
    const hasMaxScore = bonus.maxScore !== null && bonus.maxScore !== undefined;
    const isPositiveCappedBonus =
      Number.isFinite(normalizedValue) && normalizedValue > 0 && hasMaxScore;
    const isFullyCappedBonus =
      isPositiveCappedBonus && appliedValue === 0 && total >= (bonus.maxScore ?? total);

    if (appliedValue === 0 && !isFullyCappedBonus) {
      return;
    }

    total += appliedValue;
    entries.push({
      label:
        isPositiveCappedBonus && appliedValue < normalizedValue
          ? `${bonus.label}, capped max ${bonus.maxScore}`
          : bonus.label,
      value: appliedValue
    });
  });

  return {
    ability,
    total,
    entries
  };
}

export function getAbilityScoreForCharacter(
  character: AbilityCharacterContext,
  ability: AbilityKey,
  options?: AbilityDerivationOptions
): number {
  return getAbilityScoreBreakdownForCharacter(character, ability, options).total;
}

export function getAbilityScoresForCharacter(character: AbilityCharacterContext): AbilityScores {
  const customTraitEffectInput = getCharacterCustomTraitEffectInput(character);

  return abilityKeys.reduce((scores, ability) => {
    scores[ability] = getAbilityScoreForCharacter(character, ability, { customTraitEffectInput });
    return scores;
  }, {} as AbilityScores);
}

export function getAbilityModifierBreakdownForCharacter(
  character: AbilityCharacterContext,
  ability: AbilityKey,
  options?: AbilityDerivationOptions
): AbilityModifierBreakdown {
  const customTraitEffectInput =
    options?.customTraitEffectInput ?? getCharacterCustomTraitEffectInput(character);
  const abilityScore = getAbilityScoreForCharacter(character, ability, { customTraitEffectInput });
  const baseValue = Math.floor((abilityScore - 10) / 2);
  const bonusEntries = getCustomTraitAbilityModifierBonuses(customTraitEffectInput, ability).map(
    (entry) => ({
      ...entry,
      formulaLabel: formatCustomTraitBonusFormulaTerm(entry) ?? undefined
    })
  );

  return {
    ability,
    abilityScore,
    baseValue,
    bonusEntries,
    total: baseValue + bonusEntries.reduce((sum, entry) => sum + entry.value, 0)
  };
}

export function getAbilityModifierForCharacter(
  character: AbilityCharacterContext,
  ability: AbilityKey,
  options?: AbilityDerivationOptions
): number {
  return getAbilityModifierBreakdownForCharacter(character, ability, options).total;
}
