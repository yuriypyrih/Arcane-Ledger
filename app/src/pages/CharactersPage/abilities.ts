import type { AbilityKey, AbilityScores, Character } from "../../types";
import { abilityKeys } from "./constants";
import {
  getAbilityScoreBonusesForCharacter,
  type FeatureAbilityScoreBonus
} from "./classFeatures";
import { getCustomTraitAbilityModifierBonuses } from "./customTraitEffects";
import { getFeatAbilityScoreBonusesForCharacter } from "./featRuntime";

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
};

export type AbilityModifierBreakdown = {
  ability: AbilityKey;
  abilityScore: number;
  baseValue: number;
  bonusEntries: AbilityModifierBonusEntry[];
  total: number;
};

type AbilityCharacterContext = Partial<
  Pick<Character, "abilities" | "level" | "className" | "classFeatureState" | "feats" | "statusEntries">
>;

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
  ability: AbilityKey
): AbilityScoreBreakdown {
  const baseScore = normalizeAbilityScore(character.abilities?.[ability] ?? 10);
  const relevantBonuses: FeatureAbilityScoreBonus[] = [
    ...(typeof character.className === "string"
      ? getAbilityScoreBonusesForCharacter({
          className: character.className,
          level: character.level ?? 1,
          classFeatureState: character.classFeatureState,
          statusEntries: character.statusEntries
        })
      : []),
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

    if (appliedValue === 0) {
      return;
    }

    total += appliedValue;
    entries.push({
      label:
        bonus.maxScore !== null &&
        bonus.maxScore !== undefined &&
        normalizedValue > 0 &&
        appliedValue < normalizedValue
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
  ability: AbilityKey
): number {
  return getAbilityScoreBreakdownForCharacter(character, ability).total;
}

export function getAbilityScoresForCharacter(
  character: AbilityCharacterContext
): AbilityScores {
  return abilityKeys.reduce((scores, ability) => {
    scores[ability] = getAbilityScoreForCharacter(character, ability);
    return scores;
  }, {} as AbilityScores);
}

export function getAbilityModifierBreakdownForCharacter(
  character: AbilityCharacterContext,
  ability: AbilityKey
): AbilityModifierBreakdown {
  const abilityScore = getAbilityScoreForCharacter(character, ability);
  const baseValue = Math.floor((abilityScore - 10) / 2);
  const bonusEntries = getCustomTraitAbilityModifierBonuses(character.statusEntries, ability);

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
  ability: AbilityKey
): number {
  return getAbilityModifierBreakdownForCharacter(character, ability).total;
}
