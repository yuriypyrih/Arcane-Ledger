import {
  getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter,
  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
  setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import type { SkillName } from "../../../../../types";
import { getSelectableUnproficientSkillOptions } from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createPaladinFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(): SkillName | null {
    return getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter(character);
  }

  function getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills(): SkillName[] {
    return getSelectableUnproficientSkillOptions(
      character,
      paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
      getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection()
    );
  }

  function updatePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter(
          currentCharacter,
          nextValue.trim().length > 0 ? (nextValue as SkillName) : null
        )
      )
    );
  }

  function isPaladinOathOfTheNobleGeniesGeniesSplendorInputRequired(): boolean {
    return (
      getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection() === null &&
      getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills().length > 0
    );
  }

  return {
    getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills,
    getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection,
    isPaladinOathOfTheNobleGeniesGeniesSplendorInputRequired,
    updatePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection
  };
}
