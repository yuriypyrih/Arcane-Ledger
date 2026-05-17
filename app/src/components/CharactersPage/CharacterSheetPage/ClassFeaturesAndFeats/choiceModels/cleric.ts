import {
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter
} from "../../../../../pages/CharactersPage/spellcasting";
import {
  getClericDivineOrderChoiceForCharacter,
  getKnowledgeDomainBlessingsSkillSelectionsForCharacter,
  getKnowledgeDomainBlessingsToolSelectionForCharacter,
  getKnowledgeDomainUnfetteredMindSavingThrowOptionsForCharacter,
  getKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter,
  isKnowledgeDomainUnfetteredMindLockedToIntForCharacter,
  setClericBlessedStrikesChoiceForCharacter,
  setClericDivineOrderChoiceForCharacter,
  setKnowledgeDomainBlessingsSkillSelectionsForCharacter,
  setKnowledgeDomainBlessingsToolSelectionForCharacter,
  setKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { artisanToolProficiencies } from "../../../../../pages/CharactersPage/proficiency";
import { SAVING_THROW_PROFICIENCY, SKILL, type SkillName } from "../../../../../types";
import {
  getSelectableNonExpertSkillOptions,
  getSelectableUnproficientSavingThrowOptions,
  getSelectableUnproficientToolOptions,
  updateSelectionAtIndex
} from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createClericFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getKnowledgeDomainBlessingsSkillSelections(): SkillName[] {
    return getKnowledgeDomainBlessingsSkillSelectionsForCharacter(character);
  }

  function getKnowledgeDomainBlessingsToolSelection() {
    return getKnowledgeDomainBlessingsToolSelectionForCharacter(character);
  }

  function getAvailableKnowledgeDomainBlessingsSkills(slotIndex: number): SkillName[] {
    const currentSelections = getKnowledgeDomainBlessingsSkillSelections();
    const currentValue = currentSelections[slotIndex] ?? null;
    const blockedSelections = currentSelections.filter((_, index) => index !== slotIndex);

    return getSelectableNonExpertSkillOptions(
      character,
      [SKILL.ARCANA, SKILL.HISTORY, SKILL.NATURE, SKILL.RELIGION],
      currentValue,
      blockedSelections
    );
  }

  function getAvailableKnowledgeDomainBlessingsTools() {
    return getSelectableUnproficientToolOptions(
      character,
      artisanToolProficiencies,
      getKnowledgeDomainBlessingsToolSelection()
    );
  }

  function updateKnowledgeDomainBlessingsSkillSelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setKnowledgeDomainBlessingsSkillSelectionsForCharacter(
          currentCharacter,
          updateSelectionAtIndex(
            getKnowledgeDomainBlessingsSkillSelectionsForCharacter(currentCharacter),
            2,
            slotIndex,
            nextValue
          ).filter((selection): selection is SkillName =>
            [SKILL.ARCANA, SKILL.HISTORY, SKILL.NATURE, SKILL.RELIGION].some(
              (option) => option === selection
            )
          )
        )
      )
    );
  }

  function updateKnowledgeDomainBlessingsToolSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setKnowledgeDomainBlessingsToolSelectionForCharacter(
          currentCharacter,
          artisanToolProficiencies.some((option) => option === nextValue)
            ? (nextValue as (typeof artisanToolProficiencies)[number])
            : null
        )
      )
    );
  }

  function isKnowledgeDomainBlessingsInputRequired(): boolean {
    return (
      getKnowledgeDomainBlessingsToolSelection() === null ||
      getKnowledgeDomainBlessingsSkillSelections().length < 2
    );
  }

  function getKnowledgeDomainUnfetteredMindSavingThrowSelection(): SAVING_THROW_PROFICIENCY | null {
    return getKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter(character);
  }

  function getAvailableKnowledgeDomainUnfetteredMindSavingThrows(): SAVING_THROW_PROFICIENCY[] {
    const currentValue = getKnowledgeDomainUnfetteredMindSavingThrowSelection();

    return getSelectableUnproficientSavingThrowOptions(
      character,
      getKnowledgeDomainUnfetteredMindSavingThrowOptionsForCharacter(character),
      currentValue
    );
  }

  function isKnowledgeDomainUnfetteredMindLocked(): boolean {
    return isKnowledgeDomainUnfetteredMindLockedToIntForCharacter(character);
  }

  function updateKnowledgeDomainUnfetteredMindSavingThrowSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter(
          currentCharacter,
          Object.values(SAVING_THROW_PROFICIENCY).some((option) => option === nextValue)
            ? (nextValue as SAVING_THROW_PROFICIENCY)
            : null
        )
      )
    );
  }

  function isKnowledgeDomainUnfetteredMindInputRequired(): boolean {
    return getKnowledgeDomainUnfetteredMindSavingThrowSelection() === null;
  }

  function updateClericDivineOrderChoice(choice: "protector" | "thaumaturge") {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = setClericDivineOrderChoiceForCharacter(currentCharacter, choice);
      const nextProficientCharacter = recomputeCharacterFeatureProficiencies(nextCharacter);
      const cantripLimit = getCantripLimitForCharacter(
        nextProficientCharacter.className,
        nextProficientCharacter.level,
        nextProficientCharacter.classFeatureState
      );
      const cantripSelectionOptionIds = new Set(
        getCantripSelectionOptionsForCharacter(
          nextProficientCharacter.className,
          nextProficientCharacter.level
        ).map((spell) => spell.id)
      );

      return {
        ...nextProficientCharacter,
        cantripIds: [...new Set(nextProficientCharacter.cantripIds ?? [])]
          .filter((spellId) => cantripSelectionOptionIds.has(spellId))
          .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY)
      };
    });
  }

  function updateClericBlessedStrikesChoice(choice: "blessed-strike" | "potent-spellcasting") {
    onPersistCharacter((currentCharacter) =>
      setClericBlessedStrikesChoiceForCharacter(currentCharacter, choice)
    );
  }

  return {
    getAvailableKnowledgeDomainBlessingsSkills,
    getAvailableKnowledgeDomainBlessingsTools,
    getAvailableKnowledgeDomainUnfetteredMindSavingThrows,
    getKnowledgeDomainBlessingsSkillSelections,
    getKnowledgeDomainBlessingsToolSelection,
    getKnowledgeDomainUnfetteredMindSavingThrowSelection,
    isKnowledgeDomainBlessingsInputRequired,
    isKnowledgeDomainUnfetteredMindInputRequired,
    isKnowledgeDomainUnfetteredMindLocked,
    updateClericBlessedStrikesChoice,
    updateClericDivineOrderChoice,
    updateKnowledgeDomainBlessingsSkillSelection,
    updateKnowledgeDomainBlessingsToolSelection,
    updateKnowledgeDomainUnfetteredMindSavingThrowSelection,
    getClericDivineOrderChoiceForCharacter
  };
}
