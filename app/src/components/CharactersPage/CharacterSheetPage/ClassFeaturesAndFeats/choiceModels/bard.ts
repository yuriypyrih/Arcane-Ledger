import type { SpellEntry } from "../../../../../codex/entries";
import {
  getBardExpertiseSelectionsForCharacter,
  getBardLoreBonusProficiencySelectionsForCharacter,
  getBardMagicalDiscoveriesSpellIdsForCharacter,
  getBardMagicalDiscoveriesSpellOptionsForCharacter,
  getBardPrimalLoreCantripIdForCharacter,
  getBardPrimalLoreCantripOptionsForCharacter,
  getBardPrimalLoreSkillOptionsForCharacter,
  getBardPrimalLoreSkillSelectionForCharacter,
  setBardExpertiseSelectionsForCharacter,
  setBardLoreBonusProficiencySelectionsForCharacter,
  setBardMagicalDiscoveriesSpellIdsForCharacter,
  setBardPrimalLoreCantripIdForCharacter,
  setBardPrimalLoreSkillSelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { skillsOptions } from "../../../../../pages/CharactersPage/proficiency";
import type { SkillName } from "../../../../../types";
import {
  getBardExpertiseTierForLevel,
  getSelectableProficientSkillOptions,
  getSelectableUnproficientSkillOptions,
  updateSelectionAtIndex
} from "../helpers";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createBardFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getBardExpertiseSelections(level: number): SkillName[] {
    const tier = getBardExpertiseTierForLevel(level);
    return tier ? getBardExpertiseSelectionsForCharacter(character, tier) : [];
  }

  function getAvailableBardExpertiseSkills(level: number, slotIndex: number): SkillName[] {
    const currentSelections = getBardExpertiseSelections(level);
    const currentValue = currentSelections[slotIndex] ?? null;
    const blockedSelections = currentSelections.filter((_, index) => index !== slotIndex);

    return getSelectableProficientSkillOptions(
      character,
      skillsOptions,
      currentValue,
      blockedSelections
    );
  }

  function updateBardExpertiseSelection(level: number, slotIndex: number, nextValue: string) {
    const tier = getBardExpertiseTierForLevel(level);

    if (!tier) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      setBardExpertiseSelectionsForCharacter(
        currentCharacter,
        tier,
        updateSelectionAtIndex(
          getBardExpertiseSelectionsForCharacter(currentCharacter, tier),
          2,
          slotIndex,
          nextValue
        ).filter((selection): selection is SkillName =>
          skillsOptions.some((skillOption) => skillOption === selection)
        )
      )
    );
  }

  function isBardExpertiseInputRequired(level: number): boolean {
    return getBardExpertiseSelections(level).length < 2;
  }

  function getBardLoreBonusProficiencySelections(): SkillName[] {
    return getBardLoreBonusProficiencySelectionsForCharacter(character);
  }

  function getAvailableBardLoreBonusProficiencySkills(slotIndex: number): SkillName[] {
    const currentSelections = getBardLoreBonusProficiencySelections();
    const currentValue = currentSelections[slotIndex] ?? null;
    const blockedSelections = currentSelections.filter((_, index) => index !== slotIndex);

    return getSelectableUnproficientSkillOptions(
      character,
      skillsOptions,
      currentValue,
      blockedSelections
    );
  }

  function updateBardLoreBonusProficiencySelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setBardLoreBonusProficiencySelectionsForCharacter(
          currentCharacter,
          updateSelectionAtIndex(
            getBardLoreBonusProficiencySelectionsForCharacter(currentCharacter),
            3,
            slotIndex,
            nextValue
          ).filter((selection): selection is SkillName =>
            skillsOptions.some((skillOption) => skillOption === selection)
          )
        )
      )
    );
  }

  function isBardLoreBonusProficienciesInputRequired(): boolean {
    return getBardLoreBonusProficiencySelections().length < 3;
  }

  function getBardMagicalDiscoveriesSpellSelections(): string[] {
    return getBardMagicalDiscoveriesSpellIdsForCharacter(character);
  }

  function getAvailableBardMagicalDiscoveriesSpells(slotIndex: number): SpellEntry[] {
    const currentSelections = getBardMagicalDiscoveriesSpellSelections();
    const blockedSelections = new Set(
      currentSelections.filter((selection, index) => index !== slotIndex)
    );

    return getBardMagicalDiscoveriesSpellOptionsForCharacter(character).filter(
      (spell) => !blockedSelections.has(spell.id)
    );
  }

  function updateBardMagicalDiscoveriesSpellSelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setBardMagicalDiscoveriesSpellIdsForCharacter(
        currentCharacter,
        updateSelectionAtIndex(
          getBardMagicalDiscoveriesSpellIdsForCharacter(currentCharacter),
          2,
          slotIndex,
          nextValue
        ).filter((selection): selection is string => selection.trim().length > 0)
      )
    );
  }

  function isBardMagicalDiscoveriesInputRequired(): boolean {
    return getBardMagicalDiscoveriesSpellSelections().length < 2;
  }

  function getBardPrimalLoreCantripSelection(): string {
    return getBardPrimalLoreCantripIdForCharacter(character) ?? "";
  }

  function getAvailableBardPrimalLoreCantrips(): SpellEntry[] {
    return getBardPrimalLoreCantripOptionsForCharacter(character);
  }

  function updateBardPrimalLoreCantripSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setBardPrimalLoreCantripIdForCharacter(currentCharacter, nextValue || null)
    );
  }

  function isBardPrimalLoreCantripInputRequired(): boolean {
    return getBardPrimalLoreCantripSelection().length === 0;
  }

  function getBardPrimalLoreSkillSelection(): SkillName | null {
    return getBardPrimalLoreSkillSelectionForCharacter(character);
  }

  function getAvailableBardPrimalLoreSkills(): SkillName[] {
    return getSelectableUnproficientSkillOptions(
      character,
      getBardPrimalLoreSkillOptionsForCharacter(),
      getBardPrimalLoreSkillSelection()
    );
  }

  function updateBardPrimalLoreSkillSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setBardPrimalLoreSkillSelectionForCharacter(
          currentCharacter,
          skillsOptions.some((skillOption) => skillOption === nextValue)
            ? (nextValue as SkillName)
            : null
        )
      )
    );
  }

  function isBardPrimalLoreSkillInputRequired(): boolean {
    return getBardPrimalLoreSkillSelection() === null;
  }

  return {
    getAvailableBardExpertiseSkills,
    getAvailableBardLoreBonusProficiencySkills,
    getAvailableBardMagicalDiscoveriesSpells,
    getAvailableBardPrimalLoreCantrips,
    getAvailableBardPrimalLoreSkills,
    getBardExpertiseSelections,
    getBardLoreBonusProficiencySelections,
    getBardMagicalDiscoveriesSpellSelections,
    getBardPrimalLoreCantripSelection,
    getBardPrimalLoreSkillSelection,
    isBardExpertiseInputRequired,
    isBardLoreBonusProficienciesInputRequired,
    isBardMagicalDiscoveriesInputRequired,
    isBardPrimalLoreCantripInputRequired,
    isBardPrimalLoreSkillInputRequired,
    updateBardExpertiseSelection,
    updateBardLoreBonusProficiencySelection,
    updateBardMagicalDiscoveriesSpellSelection,
    updateBardPrimalLoreCantripSelection,
    updateBardPrimalLoreSkillSelection
  };
}
