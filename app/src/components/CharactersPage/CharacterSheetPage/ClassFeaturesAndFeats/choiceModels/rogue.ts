import {
  getRogueExpertiseSelectionsForCharacter,
  getRogueScionOfTheThreeDreadAllegianceChoiceForCharacter,
  getRogueThievesCantLanguageSelectionForCharacter,
  setRogueExpertiseSelectionsForCharacter,
  setRogueScionOfTheThreeDreadAllegianceChoiceForCharacter,
  setRogueThievesCantLanguageSelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { skillsOptions } from "../../../../../pages/CharactersPage/proficiency";
import type {
  LANGUAGE_PROFICIENCY,
  RogueScionOfTheThreeDreadAllegianceChoice,
  SkillName
} from "../../../../../types";
import {
  getRogueExpertiseTierForLevel,
  getSelectableLanguageOptions,
  getSelectableProficientSkillOptions,
  updateSelectionAtIndex
} from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createRogueFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getRogueExpertiseSelections(level: number): SkillName[] {
    const tier = getRogueExpertiseTierForLevel(level);
    return tier ? getRogueExpertiseSelectionsForCharacter(character, tier) : [];
  }

  function getAvailableRogueExpertiseSkills(level: number, slotIndex: number): SkillName[] {
    const currentSelections = getRogueExpertiseSelections(level);
    const currentValue = currentSelections[slotIndex] ?? null;
    const blockedSelections = currentSelections.filter((_, index) => index !== slotIndex);

    return getSelectableProficientSkillOptions(
      character,
      skillsOptions,
      currentValue,
      blockedSelections
    );
  }

  function updateRogueExpertiseSelection(level: number, slotIndex: number, nextValue: string) {
    const tier = getRogueExpertiseTierForLevel(level);

    if (!tier) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setRogueExpertiseSelectionsForCharacter(
          currentCharacter,
          tier,
          updateSelectionAtIndex(
            getRogueExpertiseSelectionsForCharacter(currentCharacter, tier),
            2,
            slotIndex,
            nextValue
          ).filter((selection): selection is SkillName =>
            skillsOptions.some((skillOption) => skillOption === selection)
          )
        )
      )
    );
  }

  function isRogueExpertiseInputRequired(level: number): boolean {
    return getRogueExpertiseSelections(level).length < 2;
  }

  function getRogueThievesCantLanguageSelection(): LANGUAGE_PROFICIENCY | null {
    return getRogueThievesCantLanguageSelectionForCharacter(character);
  }

  function getAvailableRogueThievesCantLanguages(): LANGUAGE_PROFICIENCY[] {
    return getSelectableLanguageOptions(character, getRogueThievesCantLanguageSelection());
  }

  function updateRogueThievesCantLanguageSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setRogueThievesCantLanguageSelectionForCharacter(
          currentCharacter,
          getSelectableLanguageOptions(currentCharacter, null).includes(
            nextValue as LANGUAGE_PROFICIENCY
          )
            ? (nextValue as LANGUAGE_PROFICIENCY)
            : null
        )
      )
    );
  }

  function isRogueThievesCantInputRequired(): boolean {
    return getRogueThievesCantLanguageSelection() === null;
  }

  function getRogueScionOfTheThreeDreadAllegianceChoice(): RogueScionOfTheThreeDreadAllegianceChoice | null {
    return getRogueScionOfTheThreeDreadAllegianceChoiceForCharacter(character);
  }

  function updateRogueScionOfTheThreeDreadAllegianceChoice(
    choice: RogueScionOfTheThreeDreadAllegianceChoice
  ) {
    onPersistCharacter((currentCharacter) =>
      setRogueScionOfTheThreeDreadAllegianceChoiceForCharacter(currentCharacter, choice)
    );
  }

  function isRogueScionOfTheThreeDreadAllegianceInputRequired(): boolean {
    return getRogueScionOfTheThreeDreadAllegianceChoice() === null;
  }

  return {
    getAvailableRogueExpertiseSkills,
    getAvailableRogueThievesCantLanguages,
    getRogueExpertiseSelections,
    getRogueScionOfTheThreeDreadAllegianceChoice,
    getRogueThievesCantLanguageSelection,
    isRogueExpertiseInputRequired,
    isRogueScionOfTheThreeDreadAllegianceInputRequired,
    isRogueThievesCantInputRequired,
    updateRogueExpertiseSelection,
    updateRogueScionOfTheThreeDreadAllegianceChoice,
    updateRogueThievesCantLanguageSelection
  };
}
