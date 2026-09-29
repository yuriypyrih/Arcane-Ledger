import {
  getAppliedAbilityScoreBonus,
  compareAbilityScoreBonusOrder
} from "../../shared/abilityBonusMath";
import { getClassLevel } from "../../multiclassState";
import type { AbilityKey, Character } from "../../../../types";
import { getFeatAbilityScoreBonusesForCharacter } from "../../feats/runtime";
import { getBackgroundAbilityScoreBonusesForCharacter } from "../../backgrounds";

type RangerAbilityModifierCharacter = Partial<
  Pick<Character, "abilities" | "background" | "backgroundChoices" | "feats" | "level">
>;

function normalizeAbilityScore(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
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
      level: getClassLevel(character, "Ranger") ?? 1
    })
  ]
    .filter((bonus) => bonus.ability === ability)
    .sort(compareAbilityScoreBonusOrder)
    .forEach((bonus) => {
      total += getAppliedAbilityScoreBonus(total, bonus);
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
