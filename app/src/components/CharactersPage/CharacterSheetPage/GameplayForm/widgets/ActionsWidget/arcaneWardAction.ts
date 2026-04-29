import type { Character } from "../../../../../../types";
import type { FeatureActionCard } from "../../../../../../pages/CharactersPage/classFeatures";
import { activateWizardAbjurerArcaneWardFeatureAction } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses";
import { getRoundTrackerResourceForEconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../../pages/CharactersPage/spellcasting";
import {
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../../gameplayStateUtils";

export type ArcaneWardSpellSlotOption = {
  level: number;
  remaining: number;
  total: number;
};

export function getArcaneWardSpellSlotOptions(
  spellSlotTotals: readonly number[],
  spellSlotsRemaining: readonly number[]
): ArcaneWardSpellSlotOption[] {
  return spellSlotTotals.flatMap((total, index) => {
    const remaining = spellSlotsRemaining[index] ?? 0;

    return total > 0 && remaining > 0
      ? [
          {
            level: index + 1,
            remaining,
            total
          }
        ]
      : [];
  });
}

export function getArcaneWardDisabledReason(
  primaryDisabledReason: string | null,
  spellSlotOptions: readonly ArcaneWardSpellSlotOption[],
  selectedSpellSlotIsValid: boolean
): string | null {
  return (
    primaryDisabledReason ??
    (spellSlotOptions.length <= 0
      ? "No spell slots remain to fuel Arcane Ward."
      : !selectedSpellSlotIsValid
        ? "Select a spell slot to use Arcane Ward."
        : null)
  );
}

export function applyArcaneWardActionUse(
  currentCharacter: Character,
  action: FeatureActionCard,
  spellSlotLevel: number | null
): Character {
  if (spellSlotLevel === null) {
    return currentCharacter;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    currentCharacter.className,
    currentCharacter.level
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    currentCharacter.spellSlotsExpended,
    spellSlotTotals
  );
  const slotIndex = spellSlotLevel - 1;
  const selectedSlotRemaining = Math.max(
    0,
    (spellSlotTotals[slotIndex] ?? 0) - (spellSlotsExpended[slotIndex] ?? 0)
  );

  if (selectedSlotRemaining <= 0) {
    return currentCharacter;
  }

  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
  const preparedCharacter = roundTrackerResource
    ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, roundTrackerResource)
    : currentCharacter;
  const nextCharacter = activateWizardAbjurerArcaneWardFeatureAction(
    preparedCharacter,
    spellSlotLevel
  );

  if (nextCharacter === preparedCharacter) {
    return currentCharacter;
  }

  const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
    nextCharacter.spellSlotsExpended,
    spellSlotTotals
  );
  nextSpellSlotsExpended[slotIndex] = (nextSpellSlotsExpended[slotIndex] ?? 0) + 1;

  const nextCharacterWithSpellSlot = {
    ...nextCharacter,
    spellSlotsExpended: nextSpellSlotsExpended
  };

  return roundTrackerResource
    ? consumeRoundTrackerResourceForCharacter(nextCharacterWithSpellSlot, roundTrackerResource)
    : nextCharacterWithSpellSlot;
}
