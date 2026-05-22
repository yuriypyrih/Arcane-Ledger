import {
  getArtificerReplicateMagicItemAvailablePlanGroups,
  getArtificerReplicateMagicItemPlanKeysForCharacter,
  getArtificerReplicateMagicItemPlansKnown,
  getArtificerToolsOfTheTradeAvailableToolSelectionsForCharacter,
  getArtificerToolsOfTheTradeChoiceCountForCharacter,
  getArtificerToolsOfTheTradeChoiceSelectionsForCharacter,
  getArtificerToolsOfTheTradeLockedSelectionsForCharacter,
  isArtificerToolsOfTheTradeInputRequired,
  isArtificerReplicateMagicItemPlanSelectionInputRequired,
  setArtificerReplicateMagicItemPlanKeysForCharacter,
  setArtificerToolsOfTheTradeToolSelectionsForCharacter
} from "../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import { updateSelectionAtIndex } from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

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

  function getArtificerToolsOfTheTradeChoiceSelections() {
    return getArtificerToolsOfTheTradeChoiceSelectionsForCharacter(character);
  }

  function updateArtificerToolsOfTheTradeToolSelection(slotIndex: number, nextTool: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setArtificerToolsOfTheTradeToolSelectionsForCharacter(
          currentCharacter,
          updateSelectionAtIndex(
            getArtificerToolsOfTheTradeChoiceSelectionsForCharacter(currentCharacter),
            getArtificerToolsOfTheTradeChoiceCountForCharacter(currentCharacter),
            slotIndex,
            nextTool
          )
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
    getArtificerToolsOfTheTradeAvailableToolSelections: (slotIndex: number) =>
      getArtificerToolsOfTheTradeAvailableToolSelectionsForCharacter(character, slotIndex),
    getArtificerToolsOfTheTradeChoiceCount: () =>
      getArtificerToolsOfTheTradeChoiceCountForCharacter(character),
    getArtificerToolsOfTheTradeChoiceSelections,
    getArtificerToolsOfTheTradeLockedSelections: () =>
      getArtificerToolsOfTheTradeLockedSelectionsForCharacter(character),
    isArtificerReplicateMagicItemPlanSelectionInputRequired: () =>
      isArtificerReplicateMagicItemPlanSelectionInputRequired(character),
    isArtificerToolsOfTheTradeInputRequired: () =>
      isArtificerToolsOfTheTradeInputRequired(character),
    updateArtificerReplicateMagicItemPlanSelection,
    updateArtificerToolsOfTheTradeToolSelection
  };
}
