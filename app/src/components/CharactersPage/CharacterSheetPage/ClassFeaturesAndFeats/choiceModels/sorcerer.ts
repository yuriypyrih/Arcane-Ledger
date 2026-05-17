import { DAMAGE_TYPE } from "../../../../../codex/entries";
import {
  getSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter,
  getSorcererMetamagicDefinitionsForCharacter,
  getSorcererMetamagicSelectionCountForCharacter,
  getSorcererMetamagicSelectionsForCharacter,
  setSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter,
  setSorcererMetamagicSelectionsForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { updateSelectionAtIndex } from "../helpers";
import type { ClassFeatureChoiceModelArgs } from "./shared";

export function createSorcererFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getSorcererMetamagicStartIndex(level: number): number {
    if (level >= 17) {
      return 4;
    }

    if (level >= 10) {
      return 2;
    }

    return 0;
  }

  function getSorcererMetamagicSelections(): string[] {
    return getSorcererMetamagicSelectionsForCharacter(character);
  }

  function getAvailableSorcererMetamagicOptions(level: number, slotIndex: number) {
    const currentSelections = getSorcererMetamagicSelections();
    const currentIndex = getSorcererMetamagicStartIndex(level) + slotIndex;
    const currentValue = currentSelections[currentIndex] ?? "";
    const blockedSelections = new Set(
      currentSelections.filter((selection, index) => index !== currentIndex)
    );

    return getSorcererMetamagicDefinitionsForCharacter().filter((definition) => {
      if (currentValue === definition.key) {
        return true;
      }

      return !blockedSelections.has(definition.key);
    });
  }

  function updateSorcererMetamagicSelection(level: number, slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) => {
      const currentSelections = getSorcererMetamagicSelectionsForCharacter(currentCharacter);
      const totalSelectionCount = getSorcererMetamagicSelectionCountForCharacter(currentCharacter);
      const metamagicDefinitions = getSorcererMetamagicDefinitionsForCharacter();
      const currentIndex = getSorcererMetamagicStartIndex(level) + slotIndex;
      const nextSelections = updateSelectionAtIndex(
        currentSelections,
        totalSelectionCount,
        currentIndex,
        nextValue
      );

      return setSorcererMetamagicSelectionsForCharacter(
        currentCharacter,
        nextSelections.flatMap((selection) =>
          metamagicDefinitions.some((definition) => definition.key === selection)
            ? [selection as (typeof metamagicDefinitions)[number]["key"]]
            : []
        )
      );
    });
  }

  function isSorcererMetamagicInputRequired(level: number): boolean {
    const currentSelections = getSorcererMetamagicSelections();
    const startIndex = getSorcererMetamagicStartIndex(level);

    return [0, 1].some((slotIndex) => !currentSelections[startIndex + slotIndex]);
  }

  function getSorcererDraconicElementalAffinityDamageTypeSelection(): DAMAGE_TYPE | null {
    return getSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter(character);
  }

  function updateSorcererDraconicElementalAffinityDamageTypeSelection(choice: DAMAGE_TYPE) {
    onPersistCharacter((currentCharacter) =>
      setSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter(currentCharacter, choice)
    );
  }

  function isSorcererDraconicElementalAffinityInputRequired(): boolean {
    return getSorcererDraconicElementalAffinityDamageTypeSelection() === null;
  }

  return {
    getAvailableSorcererMetamagicOptions,
    getSorcererDraconicElementalAffinityDamageTypeSelection,
    getSorcererMetamagicSelections,
    getSorcererMetamagicStartIndex,
    isSorcererDraconicElementalAffinityInputRequired,
    isSorcererMetamagicInputRequired,
    updateSorcererDraconicElementalAffinityDamageTypeSelection,
    updateSorcererMetamagicSelection
  };
}
