import { CLASS_FEATURE, type SpellEntry } from "../../../../../codex/entries";
import {
  getAlwaysSpellbookSpellIdsForCharacter,
  getWizardSavantSpellIdsForCharacter,
  getWizardScholarSelectionForCharacter,
  getWizardSignatureSpellIdsForCharacter,
  getWizardSpellMasterySelectionForCharacter,
  setWizardScholarSelectionForCharacter,
  setWizardSignatureSpellIdsForCharacter,
  setWizardSpellMasterySelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import {
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellLevel,
  normalizeSpellbookSpellIds
} from "../../../../../pages/CharactersPage/spellcasting";
import {
  getWizardSavantSelectionCount,
  isWizardSavantFeature
} from "../../../../../pages/CharactersPage/classFeatures/wizard/savant";
import {
  getWizardBladesingerTrainingInWarAndSongSkillSelection,
  wizardBladesingerTrainingInWarAndSongSkillOptions
} from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
import type { SkillName } from "../../../../../types";
import {
  getEffectiveProficientSkillOptions,
  getSourceChoiceSkillOptions,
  updateSelectionAtIndex,
  wizardScholarSkillOptions
} from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createWizardFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getWizardScholarSelection(): SkillName | null {
    return getWizardScholarSelectionForCharacter(character);
  }

  function getAvailableWizardScholarSkills(): SkillName[] {
    return getEffectiveProficientSkillOptions(
      character,
      wizardScholarSkillOptions,
      getWizardScholarSelection()
    );
  }

  function updateWizardScholarSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setWizardScholarSelectionForCharacter(
          currentCharacter,
          wizardScholarSkillOptions.some((skillOption) => skillOption === nextValue)
            ? (nextValue as SkillName)
            : null
        )
      )
    );
  }

  function isWizardScholarInputRequired(): boolean {
    return getWizardScholarSelection() === null;
  }

  function isWizardBladesingerTrainingInWarAndSongInputRequired(): boolean {
    return (
      getWizardBladesingerTrainingInWarAndSongSkillSelection(character) === null &&
      getSourceChoiceSkillOptions(
        character,
        wizardBladesingerTrainingInWarAndSongSkillOptions,
        null
      ).length > 0
    );
  }

  function isWizardSavantInputRequired(feature: CLASS_FEATURE): boolean {
    if (!isWizardSavantFeature(feature)) {
      return false;
    }

    return (
      getWizardSavantSpellIdsForCharacter(character).length <
      getWizardSavantSelectionCount(character.level)
    );
  }

  function getWizardSpellMasterySelection(spellLevel: 1 | 2): string {
    return getWizardSpellMasterySelectionForCharacter(character, spellLevel) ?? "";
  }

  function getAvailableWizardSpellMasterySpells(spellLevel: 1 | 2): SpellEntry[] {
    const availablePreparedSpells = getPreparedSpellSelectionOptionsForCharacter(
      character.className,
      character.level
    );
    const spellbookSpellIdSet = new Set(
      normalizeSpellbookSpellIds(
        character.spellbookSpellIds,
        availablePreparedSpells,
        getAlwaysSpellbookSpellIdsForCharacter(character)
      )
    );

    return availablePreparedSpells
      .filter((spell) => getSpellLevel(spell) === spellLevel && spellbookSpellIdSet.has(spell.id))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  function updateWizardSpellMasterySelection(spellLevel: 1 | 2, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setWizardSpellMasterySelectionForCharacter(
        currentCharacter,
        spellLevel,
        nextValue.trim().length > 0 ? nextValue : null
      )
    );
  }

  function isWizardSpellMasteryInputRequired(): boolean {
    return (
      getWizardSpellMasterySelectionForCharacter(character, 1) === null ||
      getWizardSpellMasterySelectionForCharacter(character, 2) === null
    );
  }

  function getWizardSignatureSpellSelections(): string[] {
    return getWizardSignatureSpellIdsForCharacter(character);
  }

  function getAvailableWizardSignatureSpells(slotIndex: number): SpellEntry[] {
    const currentSelections = getWizardSignatureSpellSelections();
    const blockedSelections = new Set(
      currentSelections.filter((selection, index) => index !== slotIndex)
    );
    const availablePreparedSpells = getPreparedSpellSelectionOptionsForCharacter(
      character.className,
      character.level
    );
    const spellbookSpellIdSet = new Set(
      normalizeSpellbookSpellIds(
        character.spellbookSpellIds,
        availablePreparedSpells,
        getAlwaysSpellbookSpellIdsForCharacter(character)
      )
    );

    return availablePreparedSpells
      .filter((spell) => {
        if (getSpellLevel(spell) !== 3) {
          return false;
        }

        if (!spellbookSpellIdSet.has(spell.id)) {
          return false;
        }

        return !blockedSelections.has(spell.id);
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  function updateWizardSignatureSpellSelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setWizardSignatureSpellIdsForCharacter(
        currentCharacter,
        updateSelectionAtIndex(
          getWizardSignatureSpellIdsForCharacter(currentCharacter),
          2,
          slotIndex,
          nextValue
        ).filter((selection): selection is string => selection.trim().length > 0)
      )
    );
  }

  function isWizardSignatureSpellsInputRequired(): boolean {
    return getWizardSignatureSpellSelections().length < 2;
  }

  return {
    getAvailableWizardScholarSkills,
    getAvailableWizardSignatureSpells,
    getAvailableWizardSpellMasterySpells,
    getWizardScholarSelection,
    getWizardSignatureSpellSelections,
    getWizardSpellMasterySelection,
    isWizardBladesingerTrainingInWarAndSongInputRequired,
    isWizardSavantInputRequired,
    isWizardScholarInputRequired,
    isWizardSignatureSpellsInputRequired,
    isWizardSpellMasteryInputRequired,
    updateWizardScholarSelection,
    updateWizardSignatureSpellSelection,
    updateWizardSpellMasterySelection
  };
}
