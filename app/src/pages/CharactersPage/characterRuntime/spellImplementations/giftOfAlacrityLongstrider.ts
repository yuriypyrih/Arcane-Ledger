import {
  STATUS_ENTRY_GROUP,
  type Character,
  type CharacterStatusEntry,
  type CharacterStatusSpellTarget
} from "../../../../types";
import type { FeatureInitiativeBonus, FeatureSpeedBonus } from "../../classFeatures/types";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import type {
  SpellImplementationCastOption,
  SpellImplementationStatusOptionsContext
} from "./types";

export const giftOfAlacritySpellId = "spell-gift-of-alacrity";
export const giftOfAlacrityStatusValue = "Gift of Alacrity";
export const giftOfAlacrityTargetOptionId = "giftOfAlacrityTarget";
export const longstriderSpellId = "spell-longstrider";
export const longstriderStatusValue = "Longstrider";
export const longstriderTargetOptionId = "longstriderTarget";

const giftOfAlacrityInitiativeFormula = "1d8";
const longstriderSpeedBonus = 10;
const selfOrOtherTargetChoices = [
  { value: "self", label: "Myself" },
  { value: "other", label: "Another" }
];

function createSelfOrOtherTargetCastOptions(
  optionId: string
): SpellImplementationCastOption[] {
  return [
    {
      id: optionId,
      label: "Target",
      defaultValue: "self",
      choices: selfOrOtherTargetChoices
    }
  ];
}

function getSpellTargetFromOptions(
  context: SpellImplementationStatusOptionsContext,
  optionId: string
): CharacterStatusSpellTarget {
  return context.options[optionId] === "other" ? "other" : "self";
}

function isSelfTargetedSpellStatusEntry(
  entry: CharacterStatusEntry,
  spellId: string,
  statusValue: string
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === spellId &&
    entry.value === statusValue &&
    entry.sourceSpellTarget === "self" &&
    entry.disabled !== true
  );
}

function hasSelfTargetedSpellStatus(
  statusEntries: Character["statusEntries"],
  spellId: string,
  statusValue: string
): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some((entry) =>
    isSelfTargetedSpellStatusEntry(entry, spellId, statusValue)
  );
}

export function getGiftOfAlacrityCastOptions(): SpellImplementationCastOption[] {
  return createSelfOrOtherTargetCastOptions(giftOfAlacrityTargetOptionId);
}

export function getGiftOfAlacrityTargetFromOptions(
  context: SpellImplementationStatusOptionsContext
): CharacterStatusSpellTarget {
  return getSpellTargetFromOptions(context, giftOfAlacrityTargetOptionId);
}

export function getLongstriderCastOptions(): SpellImplementationCastOption[] {
  return createSelfOrOtherTargetCastOptions(longstriderTargetOptionId);
}

export function getLongstriderTargetFromOptions(
  context: SpellImplementationStatusOptionsContext
): CharacterStatusSpellTarget {
  return getSpellTargetFromOptions(context, longstriderTargetOptionId);
}

export function getGiftOfAlacrityInitiativeBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureInitiativeBonus[] {
  if (
    !hasSelfTargetedSpellStatus(
      character.statusEntries,
      giftOfAlacritySpellId,
      giftOfAlacrityStatusValue
    )
  ) {
    return [];
  }

  return [
    {
      label: giftOfAlacrityStatusValue,
      formula: giftOfAlacrityInitiativeFormula,
      formulaSourceLabel: giftOfAlacrityStatusValue
    }
  ];
}

export function getLongstriderSpeedBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  if (
    !hasSelfTargetedSpellStatus(
      character.statusEntries,
      longstriderSpellId,
      longstriderStatusValue
    )
  ) {
    return [];
  }

  return [
    {
      label: longstriderStatusValue,
      value: longstriderSpeedBonus,
      movementType: "walk"
    }
  ];
}
