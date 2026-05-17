import type { AbilityKey, AbilityScores } from "../../../types";
import { abilityKeys, alignmentOptions, CUSTOM_ABILITY_SCORE_MAX } from "../constants";
import { clampNumber } from "../shared";

export { alignmentOptions, clampNumber };
export const spellSlotLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const skillColumnLayout: AbilityKey[][] = [
  ["STR", "DEX", "INT"],
  ["WIS", "CHA"]
];

export function cloneAbilityScores(abilities: AbilityScores): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = abilities[ability];
    return next;
  }, {} as AbilityScores);
}

export function normalizeCustomAbilityScores(abilities: AbilityScores): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = clampNumber(abilities[ability], 1, CUSTOM_ABILITY_SCORE_MAX, 8);
    return next;
  }, {} as AbilityScores);
}

export function formatSpellGroupTitle(level: number): string {
  return level === 0 ? "Cantrips" : `Level ${level}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString();
}
