import {
  getArtificerImprovedArmorerArmorReplicationPlanGroups,
  getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter,
  getArtificerReplicateMagicItemAvailablePlanGroups,
  getArtificerReplicateMagicItemPlanKeysForCharacter,
  getArtificerReplicateMagicItemPlansKnown,
  getArtificerToolsOfTheTradeAvailableToolSelectionsForCharacter,
  getArtificerToolsOfTheTradeChoiceCountForCharacter,
  getArtificerToolsOfTheTradeChoiceSelectionsForCharacter,
  getArtificerToolsOfTheTradeLockedSelectionsForCharacter,
  isArtificerToolsOfTheTradeInputRequired,
  isArtificerReplicateMagicItemPlanSelectionInputRequired,
  setArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter,
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

  function getArtificerImprovedArmorerArmorReplicationPlanSelection(): string {
    return getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(character) ?? "";
  }

  function updateArtificerImprovedArmorerArmorReplicationPlanSelection(nextPlanKey: string) {
    onPersistCharacter((currentCharacter) =>
      setArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(
        currentCharacter,
        nextPlanKey
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
    getArtificerImprovedArmorerArmorReplicationPlanGroups: () =>
      getArtificerImprovedArmorerArmorReplicationPlanGroups(character),
    getArtificerImprovedArmorerArmorReplicationPlanSelection,
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
    updateArtificerImprovedArmorerArmorReplicationPlanSelection,
    updateArtificerReplicateMagicItemPlanSelection,
    updateArtificerToolsOfTheTradeToolSelection
  };
}
