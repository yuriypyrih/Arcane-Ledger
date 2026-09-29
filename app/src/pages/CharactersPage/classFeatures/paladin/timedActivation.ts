import type { Character, CharacterPaladinFeatureState } from "../../../../types";
import { getSheetSpellSlotTotals } from "../../multiclassSpellcasting";
import { normalizeSpellSlotsExpended } from "../../spellSlots";
import { replaceClassFeatureState, type NumericKey } from "../shared/resourceState";

type PaladinTimedActivation = {
  hasFeature: (character: Character) => boolean;
  isActive: (character: Character) => boolean;
  getRemaining: (character: Character) => number;
  counter: NumericKey<CharacterPaladinFeatureState>;
  getFallbackSlotLevel: (character: Character) => number | null;
  applyStatus: (character: Character) => Character;
};

/** The ordinary use always pays first. Status application remains owned by the subclass. */
export function activatePaladinTimedFeature(
  character: Character,
  feature: PaladinTimedActivation
): Character {
  if (!feature.hasFeature(character) || feature.isActive(character)) return character;
  let next: Character;
  if (feature.getRemaining(character) > 0) {
    const state = character.classFeatureState?.paladin ?? {};
    next = replaceClassFeatureState(character, "paladin", {
      ...state,
      [feature.counter]: (state[feature.counter] ?? 0) + 1
    });
  } else {
    const level = feature.getFallbackSlotLevel(character);
    if (level === null) return character;
    const expended = [
      ...normalizeSpellSlotsExpended(
        character.spellSlotsExpended,
        getSheetSpellSlotTotals(character)
      )
    ];
    expended[level - 1] = (expended[level - 1] ?? 0) + 1;
    next = { ...character, spellSlotsExpended: expended };
  }
  return feature.applyStatus(next);
}
