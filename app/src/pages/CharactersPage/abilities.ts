import type { AbilityKey, AbilityScores, Character } from "../../types";
import { abilityKeys } from "./constants";
import {
  getAbilityScoreBonusesForCharacter,
  type FeatureAbilityScoreBonus
} from "./classFeatures";
import { getFeatAbilityScoreBonusesForCharacter } from "./feats";

export type AbilityScoreBreakdownEntry = {
  label: string;
  value: number;
};

export type AbilityScoreBreakdown = {
  ability: AbilityKey;
  total: number;
  entries: AbilityScoreBreakdownEntry[];
};

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
  character: Pick<Character, "abilities" | "className" | "level" | "classFeatureState" | "feats">,
  ability: AbilityKey
): AbilityScoreBreakdown {
  const baseScore = normalizeAbilityScore(character.abilities[ability]);
  const relevantBonuses: FeatureAbilityScoreBonus[] = [
    ...getAbilityScoreBonusesForCharacter(character),
    ...getFeatAbilityScoreBonusesForCharacter(character)
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
  character: Pick<Character, "abilities" | "className" | "level" | "classFeatureState" | "feats">,
  ability: AbilityKey
): number {
  return getAbilityScoreBreakdownForCharacter(character, ability).total;
}

export function getAbilityScoresForCharacter(
  character: Pick<Character, "abilities" | "className" | "level" | "classFeatureState" | "feats">
): AbilityScores {
  return abilityKeys.reduce((scores, ability) => {
    scores[ability] = getAbilityScoreForCharacter(character, ability);
    return scores;
  }, {} as AbilityScores);
}

export function getAbilityModifierForCharacter(
  character: Pick<Character, "abilities" | "className" | "level" | "classFeatureState" | "feats">,
  ability: AbilityKey
): number {
  return Math.floor((getAbilityScoreForCharacter(character, ability) - 10) / 2);
}
