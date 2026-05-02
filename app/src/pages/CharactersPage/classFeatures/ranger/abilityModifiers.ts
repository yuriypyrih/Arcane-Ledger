import type { AbilityKey, Character } from "../../../../types";
import { getFeatAbilityScoreBonusesForCharacter } from "../../featRuntime";
import { getBackgroundAbilityScoreBonusesForCharacter } from "../../backgrounds";

type RangerAbilityModifierCharacter = Partial<
  Pick<Character, "abilities" | "background" | "backgroundChoices" | "feats" | "level">
>;
type AbilityScoreBonus = {
  ability: AbilityKey;
  value: number;
  maxScore?: number | null;
  order?: number;
};

function normalizeAbilityScore(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function getAppliedAbilityScoreBonus(
  currentScore: number,
  bonusValue: number,
  maxScore: number | null | undefined
): number {
  const normalizedValue = Math.floor(bonusValue);

  if (!Number.isFinite(normalizedValue) || normalizedValue === 0) {
    return 0;
  }

  if (maxScore === null || maxScore === undefined) {
    return normalizedValue;
  }

  if (normalizedValue > 0) {
    return Math.max(0, Math.min(normalizedValue, maxScore - currentScore));
  }

  return normalizedValue;
}

function sortFeatAbilityScoreBonuses(
  left: AbilityScoreBonus,
  right: AbilityScoreBonus
): number {
  const leftHasCap = left.maxScore !== null && left.maxScore !== undefined;
  const rightHasCap = right.maxScore !== null && right.maxScore !== undefined;

  if (leftHasCap !== rightHasCap) {
    return leftHasCap ? -1 : 1;
  }

  if (leftHasCap && rightHasCap && left.maxScore !== right.maxScore) {
    return (left.maxScore ?? Number.POSITIVE_INFINITY) - (right.maxScore ?? Number.POSITIVE_INFINITY);
  }

  return (left.order ?? 0) - (right.order ?? 0);
}

function getFeatAdjustedAbilityScore(
  character: RangerAbilityModifierCharacter,
  ability: AbilityKey
): number {
  let total = normalizeAbilityScore(character.abilities?.[ability] ?? 10);

  [
    ...getBackgroundAbilityScoreBonusesForCharacter({
      background: character.background,
      backgroundChoices: character.backgroundChoices
    }),
    ...getFeatAbilityScoreBonusesForCharacter({
      feats: character.feats ?? [],
      level: character.level ?? 1
    })
  ]
    .filter((bonus) => bonus.ability === ability)
    .sort(sortFeatAbilityScoreBonuses)
    .forEach((bonus) => {
      total += getAppliedAbilityScoreBonus(total, bonus.value, bonus.maxScore);
    });

  return total;
}

export function getRangerFeatAdjustedAbilityModifier(
  character: RangerAbilityModifierCharacter,
  ability: AbilityKey
): number {
  return Math.floor((getFeatAdjustedAbilityScore(character, ability) - 10) / 2);
}

export function getRangerFeatAdjustedWisdomModifier(
  character: RangerAbilityModifierCharacter
): number {
  return getRangerFeatAdjustedAbilityModifier(character, "WIS");
}
