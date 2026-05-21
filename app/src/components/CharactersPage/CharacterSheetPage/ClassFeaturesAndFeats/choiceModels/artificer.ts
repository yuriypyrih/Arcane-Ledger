import {
  getArtificerReplicateMagicItemAvailablePlanGroups,
  getArtificerReplicateMagicItemPlanKeysForCharacter,
  getArtificerReplicateMagicItemPlansKnown,
  isArtificerReplicateMagicItemPlanSelectionInputRequired,
  setArtificerReplicateMagicItemPlanKeysForCharacter
} from "../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import { updateSelectionAtIndex } from "../helpers";
import type { ClassFeatureChoiceModelArgs } from "./shared";

export function createArtificerFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getArtificerReplicateMagicItemPlanSelections(): string[] {
    return getArtificerReplicateMagicItemPlanKeysForCharacter(character);
  }

  function updateArtificerReplicateMagicItemPlanSelection(slotIndex: number, nextPlanKey: string) {
    onPersistCharacter((currentCharacter) =>
      setArtificerReplicateMagicItemPlanKeysForCharacter(
        currentCharacter,
        updateSelectionAtIndex(
          getArtificerReplicateMagicItemPlanKeysForCharacter(currentCharacter),
          getArtificerReplicateMagicItemPlansKnown(currentCharacter),
          slotIndex,
          nextPlanKey
        )
      )
    );
  }

  return {
    getArtificerReplicateMagicItemAvailablePlanGroups: () =>
      getArtificerReplicateMagicItemAvailablePlanGroups(character),
    getArtificerReplicateMagicItemPlanSelections,
    getArtificerReplicateMagicItemPlansKnown: () =>
      getArtificerReplicateMagicItemPlansKnown(character),
    isArtificerReplicateMagicItemPlanSelectionInputRequired: () =>
      isArtificerReplicateMagicItemPlanSelectionInputRequired(character),
    updateArtificerReplicateMagicItemPlanSelection
  };
}
