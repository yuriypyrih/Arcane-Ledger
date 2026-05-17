import {
  getRangerDeftExplorerExpertiseSelectionForCharacter,
  getRangerDeftExplorerLanguageSelectionsForCharacter,
  getRangerFeyWandererGiftSelectionForCharacter,
  getRangerGloomStalkerIronMindSavingThrowOptionsForCharacter,
  getRangerGloomStalkerIronMindSavingThrowSelectionForCharacter,
  getRangerHunterDefensiveTacticsChoiceForCharacter,
  getRangerHunterPreyChoiceForCharacter,
  getRangerLevel9ExpertiseSelectionsForCharacter,
  getRangerOtherworldlyGlamourSkillSelectionForCharacter,
  isRangerGloomStalkerIronMindLockedToWisForCharacter,
  rangerFeyWandererGiftOptions,
  rangerOtherworldlyGlamourSkillOptions,
  setRangerDeftExplorerExpertiseSelectionForCharacter,
  setRangerDeftExplorerLanguageSelectionsForCharacter,
  setRangerFeyWandererGiftSelectionForCharacter,
  setRangerGloomStalkerIronMindSavingThrowSelectionForCharacter,
  setRangerHunterDefensiveTacticsChoiceForCharacter,
  setRangerHunterPreyChoiceForCharacter,
  setRangerLevel9ExpertiseSelectionsForCharacter,
  setRangerOtherworldlyGlamourSkillSelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { skillsOptions } from "../../../../../pages/CharactersPage/proficiency";
import {
  SAVING_THROW_PROFICIENCY,
  type LANGUAGE_PROFICIENCY,
  type RangerHunterDefensiveTacticsChoice,
  type RangerHunterPreyChoice,
  type SkillName
} from "../../../../../types";
import {
  getSelectableLanguageOptions,
  getSelectableProficientSkillOptions,
  getSelectableUnproficientSavingThrowOptions,
  getSelectableUnproficientSkillOptions,
  updateSelectionAtIndex
} from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createRangerFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getRangerGloomStalkerIronMindSavingThrowSelection(): SAVING_THROW_PROFICIENCY | null {
    return getRangerGloomStalkerIronMindSavingThrowSelectionForCharacter(character);
  }

  function getAvailableRangerGloomStalkerIronMindSavingThrows(): SAVING_THROW_PROFICIENCY[] {
    const currentValue = getRangerGloomStalkerIronMindSavingThrowSelection();

    return getSelectableUnproficientSavingThrowOptions(
      character,
      getRangerGloomStalkerIronMindSavingThrowOptionsForCharacter(character),
      currentValue
    );
  }

  function isRangerGloomStalkerIronMindLocked(): boolean {
    return isRangerGloomStalkerIronMindLockedToWisForCharacter(character);
  }

  function updateRangerGloomStalkerIronMindSavingThrowSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setRangerGloomStalkerIronMindSavingThrowSelectionForCharacter(
          currentCharacter,
          Object.values(SAVING_THROW_PROFICIENCY).some((option) => option === nextValue)
            ? (nextValue as SAVING_THROW_PROFICIENCY)
            : null
        )
      )
    );
  }

  function isRangerGloomStalkerIronMindInputRequired(): boolean {
    return (
      getAvailableRangerGloomStalkerIronMindSavingThrows().length > 0 &&
      getRangerGloomStalkerIronMindSavingThrowSelection() === null
    );
  }

  function getRangerDeftExplorerExpertiseSelection(): SkillName | null {
    return getRangerDeftExplorerExpertiseSelectionForCharacter(character);
  }

  function getAvailableRangerDeftExplorerSkills(): SkillName[] {
    return getSelectableProficientSkillOptions(
      character,
      skillsOptions,
      getRangerDeftExplorerExpertiseSelection()
    );
  }

  function updateRangerDeftExplorerExpertiseSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setRangerDeftExplorerExpertiseSelectionForCharacter(
          currentCharacter,
          skillsOptions.some((skillOption) => skillOption === nextValue)
            ? (nextValue as SkillName)
            : null
        )
      )
    );
  }

  function getRangerDeftExplorerLanguageSelections(): LANGUAGE_PROFICIENCY[] {
    return getRangerDeftExplorerLanguageSelectionsForCharacter(character);
  }

  function getAvailableRangerDeftExplorerLanguages(slotIndex: number): LANGUAGE_PROFICIENCY[] {
    const currentSelections = getRangerDeftExplorerLanguageSelections();
    const currentValue = currentSelections[slotIndex] ?? null;
    const blockedSelections = currentSelections.filter((_, index) => index !== slotIndex);

    return getSelectableLanguageOptions(character, currentValue, blockedSelections);
  }

  function updateRangerDeftExplorerLanguageSelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setRangerDeftExplorerLanguageSelectionsForCharacter(
          currentCharacter,
          updateSelectionAtIndex(
            getRangerDeftExplorerLanguageSelectionsForCharacter(currentCharacter),
            2,
            slotIndex,
            nextValue
          ).filter((selection): selection is LANGUAGE_PROFICIENCY =>
            getSelectableLanguageOptions(currentCharacter, null).includes(
              selection as LANGUAGE_PROFICIENCY
            )
          )
        )
      )
    );
  }

  function isRangerDeftExplorerInputRequired(): boolean {
    return (
      getRangerDeftExplorerExpertiseSelection() === null ||
      getRangerDeftExplorerLanguageSelections().length < 2
    );
  }

  function getRangerLevel9ExpertiseSelections(): SkillName[] {
    return getRangerLevel9ExpertiseSelectionsForCharacter(character);
  }

  function getAvailableRangerLevel9ExpertiseSkills(slotIndex: number): SkillName[] {
    const currentSelections = getRangerLevel9ExpertiseSelections();
    const currentValue = currentSelections[slotIndex] ?? null;
    const blockedSelections = currentSelections.filter((_, index) => index !== slotIndex);

    return getSelectableProficientSkillOptions(
      character,
      skillsOptions,
      currentValue,
      blockedSelections
    );
  }

  function updateRangerLevel9ExpertiseSelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setRangerLevel9ExpertiseSelectionsForCharacter(
          currentCharacter,
          updateSelectionAtIndex(
            getRangerLevel9ExpertiseSelectionsForCharacter(currentCharacter),
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

  function isRangerLevel9ExpertiseInputRequired(): boolean {
    return getRangerLevel9ExpertiseSelections().length < 2;
  }

  function getRangerFeyWandererGiftSelection() {
    return getRangerFeyWandererGiftSelectionForCharacter(character);
  }

  function getRangerHunterPreyChoice(): RangerHunterPreyChoice | null {
    return getRangerHunterPreyChoiceForCharacter(character);
  }

  function updateRangerHunterPreyChoice(choice: RangerHunterPreyChoice) {
    onPersistCharacter((currentCharacter) =>
      setRangerHunterPreyChoiceForCharacter(currentCharacter, choice)
    );
  }

  function isRangerHunterPreyInputRequired(): boolean {
    return getRangerHunterPreyChoice() === null;
  }

  function getRangerHunterDefensiveTacticsChoice(): RangerHunterDefensiveTacticsChoice | null {
    return getRangerHunterDefensiveTacticsChoiceForCharacter(character);
  }

  function updateRangerHunterDefensiveTacticsChoice(choice: RangerHunterDefensiveTacticsChoice) {
    onPersistCharacter((currentCharacter) =>
      setRangerHunterDefensiveTacticsChoiceForCharacter(currentCharacter, choice)
    );
  }

  function isRangerHunterDefensiveTacticsInputRequired(): boolean {
    return getRangerHunterDefensiveTacticsChoice() === null;
  }

  function updateRangerFeyWandererGiftSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setRangerFeyWandererGiftSelectionForCharacter(
        currentCharacter,
        rangerFeyWandererGiftOptions.some((option) => option.value === nextValue)
          ? (nextValue as (typeof rangerFeyWandererGiftOptions)[number]["value"])
          : null
      )
    );
  }

  function isRangerFeyWandererGiftInputRequired(): boolean {
    return getRangerFeyWandererGiftSelection() === null;
  }

  function getRangerOtherworldlyGlamourSkillSelection() {
    return getRangerOtherworldlyGlamourSkillSelectionForCharacter(character);
  }

  function getAvailableRangerOtherworldlyGlamourSkills(): SkillName[] {
    return getSelectableUnproficientSkillOptions(
      character,
      rangerOtherworldlyGlamourSkillOptions.map((option) => option.value),
      getRangerOtherworldlyGlamourSkillSelection()
    );
  }

  function updateRangerOtherworldlyGlamourSkillSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setRangerOtherworldlyGlamourSkillSelectionForCharacter(
          currentCharacter,
          rangerOtherworldlyGlamourSkillOptions.some((option) => option.value === nextValue)
            ? (nextValue as (typeof rangerOtherworldlyGlamourSkillOptions)[number]["value"])
            : null
        )
      )
    );
  }

  function isRangerOtherworldlyGlamourInputRequired(): boolean {
    return (
      getAvailableRangerOtherworldlyGlamourSkills().length > 0 &&
      getRangerOtherworldlyGlamourSkillSelection() === null
    );
  }

  return {
    getAvailableRangerDeftExplorerLanguages,
    getAvailableRangerDeftExplorerSkills,
    getAvailableRangerGloomStalkerIronMindSavingThrows,
    getAvailableRangerLevel9ExpertiseSkills,
    getAvailableRangerOtherworldlyGlamourSkills,
    getRangerDeftExplorerExpertiseSelection,
    getRangerDeftExplorerLanguageSelections,
    getRangerFeyWandererGiftSelection,
    getRangerGloomStalkerIronMindSavingThrowSelection,
    getRangerHunterDefensiveTacticsChoice,
    getRangerHunterPreyChoice,
    getRangerLevel9ExpertiseSelections,
    getRangerOtherworldlyGlamourSkillSelection,
    isRangerDeftExplorerInputRequired,
    isRangerFeyWandererGiftInputRequired,
    isRangerGloomStalkerIronMindInputRequired,
    isRangerGloomStalkerIronMindLocked,
    isRangerHunterDefensiveTacticsInputRequired,
    isRangerHunterPreyInputRequired,
    isRangerLevel9ExpertiseInputRequired,
    isRangerOtherworldlyGlamourInputRequired,
    updateRangerDeftExplorerExpertiseSelection,
    updateRangerDeftExplorerLanguageSelection,
    updateRangerFeyWandererGiftSelection,
    updateRangerGloomStalkerIronMindSavingThrowSelection,
    updateRangerHunterDefensiveTacticsChoice,
    updateRangerHunterPreyChoice,
    updateRangerLevel9ExpertiseSelection,
    updateRangerOtherworldlyGlamourSkillSelection
  };
}
