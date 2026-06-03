import {
  fighterBanneretKnightlyEnvoySkillOptions,
  getFighterBattleMasterManeuverSelectionCountForCharacter,
  getFighterBattleMasterManeuverSelectionsForCharacter,
  getFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter,
  getFighterBanneretKnightlyEnvoySkillSelectionForCharacter,
  setFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter,
  setFighterBanneretKnightlyEnvoySkillSelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import type { LANGUAGE_PROFICIENCY, SkillName } from "../../../../../types";
import { getSourceChoiceLanguageOptions, getSourceChoiceSkillOptions } from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createFighterFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function isFighterBattleMasterManeuverOptionsInputRequired(): boolean {
    const totalSelections = getFighterBattleMasterManeuverSelectionCountForCharacter(character);

    return (
      totalSelections > 0 &&
      getFighterBattleMasterManeuverSelectionsForCharacter(character).length < totalSelections
    );
  }

  function getFighterBanneretKnightlyEnvoyLanguageSelection(): LANGUAGE_PROFICIENCY | null {
    return getFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter(character);
  }

  function getAvailableFighterBanneretKnightlyEnvoyLanguages(): LANGUAGE_PROFICIENCY[] {
    return getSourceChoiceLanguageOptions(
      character,
      getFighterBanneretKnightlyEnvoyLanguageSelection()
    );
  }

  function updateFighterBanneretKnightlyEnvoyLanguageSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter(
          currentCharacter,
          nextValue.trim().length > 0 ? (nextValue as LANGUAGE_PROFICIENCY) : null
        )
      )
    );
  }

  function getFighterBanneretKnightlyEnvoySkillSelection(): SkillName | null {
    return getFighterBanneretKnightlyEnvoySkillSelectionForCharacter(character);
  }

  function getAvailableFighterBanneretKnightlyEnvoySkills(): SkillName[] {
    return getSourceChoiceSkillOptions(
      character,
      fighterBanneretKnightlyEnvoySkillOptions,
      getFighterBanneretKnightlyEnvoySkillSelection()
    );
  }

  function updateFighterBanneretKnightlyEnvoySkillSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setFighterBanneretKnightlyEnvoySkillSelectionForCharacter(
          currentCharacter,
          nextValue.trim().length > 0 ? (nextValue as SkillName) : null
        )
      )
    );
  }

  function isFighterBanneretKnightlyEnvoyInputRequired(): boolean {
    return (
      getFighterBanneretKnightlyEnvoyLanguageSelection() === null ||
      getFighterBanneretKnightlyEnvoySkillSelection() === null
    );
  }

  return {
    getAvailableFighterBanneretKnightlyEnvoyLanguages,
    getAvailableFighterBanneretKnightlyEnvoySkills,
    getFighterBanneretKnightlyEnvoyLanguageSelection,
    getFighterBanneretKnightlyEnvoySkillSelection,
    isFighterBanneretKnightlyEnvoyInputRequired,
    isFighterBattleMasterManeuverOptionsInputRequired,
    updateFighterBanneretKnightlyEnvoyLanguageSelection,
    updateFighterBanneretKnightlyEnvoySkillSelection
  };
}
