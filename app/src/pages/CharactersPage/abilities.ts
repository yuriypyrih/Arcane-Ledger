import type { AbilityKey, AbilityScores, Character } from "../../types";
import { abilityKeys } from "./constants";
import {
  getAbilityScoreBonusesForCharacter,
  type FeatureAbilityScoreBonus
} from "./classFeatures";
import {
  formatCustomTraitBonusFormulaTerm,
  getCustomTraitAbilityModifierBonuses,
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
  return typeof character.className === "string" && typeof character.level === "number";
}

function normalizeAbilityScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function getAppliedAbilityScoreBonus(
  currentScore: number,
  bonus: FeatureAbilityScoreBonus
): number {
  const normalizedValue = Math.floor(bonus.value);

  if (!Number.isFinite(normalizedValue) || normalizedValue === 0) {
    return 0;
  }

  if (bonus.maxScore === null || bonus.maxScore === undefined) {
    return normalizedValue;
  }

  if (normalizedValue > 0) {
    return Math.max(0, Math.min(normalizedValue, bonus.maxScore - currentScore));
  }

  return normalizedValue;
}

function sortAbilityScoreBonuses(
  left: FeatureAbilityScoreBonus,
  right: FeatureAbilityScoreBonus
): number {
  const leftHasCap = left.maxScore !== null && left.maxScore !== undefined;
  const rightHasCap = right.maxScore !== null && right.maxScore !== undefined;

  if (leftHasCap !== rightHasCap) {
    return leftHasCap ? -1 : 1;
  }

  if (leftHasCap && rightHasCap && left.maxScore !== right.maxScore) {
    return (left.maxScore ?? Number.POSITIVE_INFINITY) - (right.maxScore ?? Number.POSITIVE_INFINITY);
  }

  const leftOrder = left.order ?? 0;
  const rightOrder = right.order ?? 0;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.label.localeCompare(right.label);
}

export function getAbilityScoreBreakdownForCharacter(
  character: AbilityCharacterContext,
  ability: AbilityKey,
  options?: AbilityDerivationOptions
): AbilityScoreBreakdown {
  const baseScore = normalizeAbilityScore(character.abilities?.[ability] ?? 10);
  const customTraitEffectInput =
    options?.customTraitEffectInput ?? getCharacterCustomTraitEffectInput(character);
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
      level: character.level ?? 1
    })
  ]
    .filter((bonus) => bonus.ability === ability)
    .sort(sortAbilityScoreBonuses);
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

export function getAbilityScoresForCharacter(
  character: AbilityCharacterContext
): AbilityScores {
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
  const bonusEntries = getCustomTraitAbilityModifierBonuses(
    customTraitEffectInput,
    ability
  ).map((entry) => ({
    ...entry,
    formulaLabel: formatCustomTraitBonusFormulaTerm(entry) ?? undefined
  }));

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
