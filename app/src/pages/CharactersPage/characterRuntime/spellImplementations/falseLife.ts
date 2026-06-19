import type { Character } from "../../../../types";
import { swapTemporaryHitPointsAssignment } from "../../shared";

export const falseLifeSpellId = "spell-false-life";
export const falseLifeTemporaryHitPointsSource = "False Life";
export const fiendishVigorTemporaryHitPointsSource = "Fiendish Vigor";

const falseLifeBaseBonus = 4;
const falseLifeUpcastBonusPerLevel = 5;
const falseLifeBaseDiceFormula = "2d4";
const falseLifeMaximumDieResult = 8;

function normalizeFalseLifeSpellSlotLevel(spellSlotLevel: unknown): number {
  const numericSpellSlotLevel = Number(spellSlotLevel);

  if (!Number.isFinite(numericSpellSlotLevel)) {
    return 1;
  }

  return Math.max(1, Math.floor(numericSpellSlotLevel));
}

export function getFalseLifeTemporaryHitPointsBonus(spellSlotLevel: unknown): number {
  const normalizedSpellSlotLevel = normalizeFalseLifeSpellSlotLevel(spellSlotLevel);

  return (
    falseLifeBaseBonus +
    Math.max(0, normalizedSpellSlotLevel - 1) * falseLifeUpcastBonusPerLevel
  );
}

export function getFalseLifeTemporaryHitPointsFormula(options?: {
  maximizeDie?: boolean;
  spellSlotLevel?: unknown;
}): string {
  const bonus = getFalseLifeTemporaryHitPointsBonus(options?.spellSlotLevel);

  if (options?.maximizeDie) {
    return String(falseLifeMaximumDieResult + bonus);
  }

  return `${falseLifeBaseDiceFormula} + ${bonus}`;
}

export function getFalseLifeTemporaryHitPointsFormulaDisplay(
  spellSlotLevel: unknown,
  options?: { maximizeDie?: boolean }
): string {
  const bonus = getFalseLifeTemporaryHitPointsBonus(spellSlotLevel);

  if (options?.maximizeDie) {
    return `${falseLifeMaximumDieResult + bonus} Temporary Hit Points`;
  }

  return `${falseLifeBaseDiceFormula} + ${bonus} Temporary Hit Points`;
}

export function getFalseLifeTemporaryHitPointsFromRoll(
  rolledTotal: unknown,
  _spellSlotLevel: unknown
): number {
  const normalizedRolledTotal = Number(rolledTotal);
  return Number.isFinite(normalizedRolledTotal)
    ? Math.max(1, Math.floor(normalizedRolledTotal))
    : 1;
}

export function applyFalseLifeTemporaryHitPointsToCharacter(
  character: Character,
  temporaryHitPoints: unknown,
  source = falseLifeTemporaryHitPointsSource
): Character {
  return {
    ...character,
    ...swapTemporaryHitPointsAssignment(
      character.temporaryHitPoints,
      character.temporaryHitPointsSource,
      temporaryHitPoints,
      source
    )
  };
}
