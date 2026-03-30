import clsx from "clsx";
import { Pencil, Plus, TriangleAlert } from "lucide-react";
import {
  CLASS_FEATURE,
  getFeatureTrackingState,
  type DivinityEntry,
  type SpellEntry
} from "../../../../codex/entries";
import SelectInput from "../../FormInputs/SelectInput";
import {
  getBarbarianPrimalKnowledgeSkillOptionsForCharacter,
  getBarbarianPrimalKnowledgeSkillSelectionForCharacter,
  getBardExpertiseSelectionsForCharacter,
  getClericBlessedStrikesChoiceForCharacter,
  getClericDivineOrderChoiceForCharacter,
  getDruidPrimalOrderChoiceForCharacter,
  getRangerDeftExplorerExpertiseSelectionForCharacter,
  getRangerDeftExplorerLanguageSelectionsForCharacter,
  getRangerLevel9ExpertiseSelectionsForCharacter,
  getRogueExpertiseSelectionsForCharacter,
  getRogueThievesCantLanguageSelectionForCharacter,
  getSorcererMetamagicDefinitionsForCharacter,
  getSorcererMetamagicSelectionCountForCharacter,
  getSorcererMetamagicSelectionsForCharacter,
  getWarlockMysticArcanumSpellIdForCharacter,
  getWarlockMysticArcanumSpellOptionsForCharacter,
  getWizardScholarSelectionForCharacter,
  getWizardSignatureSpellIdsForCharacter,
  getWizardSpellMasterySelectionForCharacter,
  getWeaponMasteryOptionsForCharacter,
  getWeaponMasterySelectionCountForCharacter,
  getWeaponMasterySelectionsForCharacter,
  setBardExpertiseSelectionsForCharacter,
  setBarbarianPrimalKnowledgeSkillSelectionForCharacter,
  setClericBlessedStrikesChoiceForCharacter,
  setClericDivineOrderChoiceForCharacter,
  setDruidPrimalOrderChoiceForCharacter,
  setRangerDeftExplorerExpertiseSelectionForCharacter,
  setRangerDeftExplorerLanguageSelectionsForCharacter,
  setRangerLevel9ExpertiseSelectionsForCharacter,
  setRogueExpertiseSelectionsForCharacter,
  setRogueThievesCantLanguageSelectionForCharacter,
  setSorcererMetamagicSelectionsForCharacter,
  setWarlockMysticArcanumSpellIdForCharacter,
  setWizardScholarSelectionForCharacter,
  setWizardSignatureSpellIdsForCharacter,
  setWizardSpellMasterySelectionForCharacter,
  setWeaponMasterySelectionsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  getProficiencyLabel,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  getWeaponProficiencyLabel,
  normalizeCharacterProficiencies,
  skillsOptions
} from "../../../../pages/CharactersPage/proficiency";
import { getSpellSelectionInputStatusForCharacter } from "../../../../pages/CharactersPage/spellSelection";
import {
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter,
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellLevel,
  normalizeSpellbookSpellIds
} from "../../../../pages/CharactersPage/spellcasting";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  Character,
  CharacterFeatEntry,
  LANGUAGE_PROFICIENCY,
  SkillName,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { PROF_LEVEL } from "../../../../types";
import { formatCodexLabel } from "../../../../utils/codex";
import {
  FeatureDisclosureRow,
  featureDisclosureStyles
} from "../../../FeatureDisclosure";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./ClassFeaturesAndFeats.module.css";
import {
  getBardExpertiseTierForLevel,
  getRogueExpertiseTierForLevel,
  getSelectableLanguageOptions,
  getSelectableProficientSkillOptions,
  isFeatChoiceFeature,
  renderDescriptionLine,
  updateSelectionAtIndex,
  wizardScholarSkillOptions
} from "./helpers";
import type { FeatureRow, TrackingButtonRenderer } from "./types";

type ClassFeatureListProps = {
  character: Character;
  features: FeatureRow[];
  expandedFeatureKeys: string[];
  onToggleFeature: (featureKey: string) => void;
  getLinkedFeatForFeature: (level: number, feature: CLASS_FEATURE) => CharacterFeatEntry | null;
  onOpenFeatEditorForFeature: (level: number, feature: CLASS_FEATURE) => void;
  onOpenKeyword: (keywordKey: string, title?: string) => void;
  onOpenFeatReference: (feat: CharacterFeatEntry["feat"], entry?: CharacterFeatEntry) => void;
  onOpenSpellReference: (spell: SpellEntry) => void;
  onOpenDivinityReference: (divinity: DivinityEntry) => void;
  onPersistCharacter: PersistCharacterUpdater;
  renderTrackingButton: TrackingButtonRenderer;
  getCharacterFeatSummary: (entry?: CharacterFeatEntry | null) => string | null;
  getFeatDefinition: (feat: CharacterFeatEntry["feat"]) => { label: string } | null;
};

type FeatureChoiceOption<TChoice extends string> = {
  key: string;
  value: TChoice;
  content: string;
};

function FeatureDescriptionLines({
  featureKey,
  lines,
  onOpenKeyword,
  onOpenFeatReference,
  onOpenSpellReference,
  onOpenDivinityReference
}: {
  featureKey: string;
  lines: string[];
  onOpenKeyword: (keywordKey: string, title?: string) => void;
  onOpenFeatReference: (feat: CharacterFeatEntry["feat"], entry?: CharacterFeatEntry) => void;
  onOpenSpellReference: (spell: SpellEntry) => void;
  onOpenDivinityReference: (divinity: DivinityEntry) => void;
}) {
  return (
    <>
      {lines.map((line, index) => (
        <p
          key={`${featureKey}-line-${index}`}
          className={featureDisclosureStyles.descriptionLine}
        >
          {renderDescriptionLine(
            line,
            onOpenKeyword,
            (feat) => onOpenFeatReference(feat),
            onOpenSpellReference,
            onOpenDivinityReference
          )}
        </p>
      ))}
    </>
  );
}

function FeatureChoiceOptions<TChoice extends string>({
  featureKey,
  groupName,
  isUnlocked,
  selectedValue,
  options,
  onChange,
  onOpenKeyword,
  onOpenFeatReference,
  onOpenSpellReference,
  onOpenDivinityReference
}: {
  featureKey: string;
  groupName: string;
  isUnlocked: boolean;
  selectedValue: TChoice | null;
  options: FeatureChoiceOption<TChoice>[];
  onChange: (choice: TChoice) => void;
  onOpenKeyword: (keywordKey: string, title?: string) => void;
  onOpenFeatReference: (feat: CharacterFeatEntry["feat"], entry?: CharacterFeatEntry) => void;
  onOpenSpellReference: (spell: SpellEntry) => void;
  onOpenDivinityReference: (divinity: DivinityEntry) => void;
}) {
  return (
    <>
      {options.map((option) => (
        <label
          key={`${featureKey}-choice-${option.key}`}
          className={clsx(
            styles.featureOptionRow,
            !isUnlocked && styles.featureOptionRowDisabled,
            selectedValue === option.value && styles.featureOptionRowActive
          )}
        >
          <input
            type="radio"
            name={groupName}
            checked={selectedValue === option.value}
            disabled={!isUnlocked}
            onChange={() => onChange(option.value)}
            className={styles.featureOptionRadio}
          />
          <span className={styles.featureOptionText}>
            {renderDescriptionLine(
              option.content,
              onOpenKeyword,
              (feat) => onOpenFeatReference(feat),
              onOpenSpellReference,
              onOpenDivinityReference
            )}
          </span>
        </label>
      ))}
    </>
  );
}

function ClassFeatureList({
  character,
  features,
  expandedFeatureKeys,
  onToggleFeature,
  getLinkedFeatForFeature,
  onOpenFeatEditorForFeature,
  onOpenKeyword,
  onOpenFeatReference,
  onOpenSpellReference,
  onOpenDivinityReference,
  onPersistCharacter,
  renderTrackingButton,
  getCharacterFeatSummary,
  getFeatDefinition
}: ClassFeatureListProps) {
  const spellSelectionInputStatus = getSpellSelectionInputStatusForCharacter(character);

  function recomputeCharacterFeatureProficiencies(nextCharacter: Character): Character {
    return {
      ...nextCharacter,
      ...normalizeCharacterProficiencies({
        className: nextCharacter.className,
        level: nextCharacter.level,
        species: nextCharacter.species,
        background: nextCharacter.background,
        classFeatureState: nextCharacter.classFeatureState,
        skillProficiencies: nextCharacter.skillProficiencies,
        savingThrowProficiencies: nextCharacter.savingThrowProficiencies,
        weaponProficiencies: nextCharacter.weaponProficiencies,
        armorProficiencies: nextCharacter.armorProficiencies,
        toolProficiencies: nextCharacter.toolProficiencies,
        languageProficiencies: nextCharacter.languageProficiencies
      })
    };
  }

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
          getSelectableLanguageOptions(currentCharacter, null).includes(nextValue as LANGUAGE_PROFICIENCY)
            ? (nextValue as LANGUAGE_PROFICIENCY)
            : null
        )
      )
    );
  }

  function isRogueThievesCantInputRequired(): boolean {
    return getRogueThievesCantLanguageSelection() === null;
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

  function getWizardScholarSelection(): SkillName | null {
    return getWizardScholarSelectionForCharacter(character);
  }

  function getAvailableWizardScholarSkills(): SkillName[] {
    return getSelectableProficientSkillOptions(
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

  function getWizardSpellMasterySelection(spellLevel: 1 | 2): string {
    return getWizardSpellMasterySelectionForCharacter(character, spellLevel) ?? "";
  }

  function getAvailableWizardSpellMasterySpells(spellLevel: 1 | 2): SpellEntry[] {
    const availablePreparedSpells = getPreparedSpellSelectionOptionsForCharacter(
      character.className,
      character.level
    );
    const spellbookSpellIdSet = new Set(
      normalizeSpellbookSpellIds(character.spellbookSpellIds, availablePreparedSpells)
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
      normalizeSpellbookSpellIds(character.spellbookSpellIds, availablePreparedSpells)
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

  function getSorcererMetamagicStartIndex(level: number): number {
    if (level >= 17) {
      return 4;
    }

    if (level >= 10) {
      return 2;
    }

    return 0;
  }

  function getSorcererMetamagicSelections(): string[] {
    return getSorcererMetamagicSelectionsForCharacter(character);
  }

  function getAvailableSorcererMetamagicOptions(level: number, slotIndex: number) {
    const currentSelections = getSorcererMetamagicSelections();
    const currentIndex = getSorcererMetamagicStartIndex(level) + slotIndex;
    const currentValue = currentSelections[currentIndex] ?? "";
    const blockedSelections = new Set(
      currentSelections.filter((selection, index) => index !== currentIndex)
    );

    return getSorcererMetamagicDefinitionsForCharacter().filter((definition) => {
      if (currentValue === definition.key) {
        return true;
      }

      return !blockedSelections.has(definition.key);
    });
  }

  function updateSorcererMetamagicSelection(level: number, slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) => {
      const currentSelections = getSorcererMetamagicSelectionsForCharacter(currentCharacter);
      const totalSelectionCount = getSorcererMetamagicSelectionCountForCharacter(currentCharacter);
      const metamagicDefinitions = getSorcererMetamagicDefinitionsForCharacter();
      const currentIndex = getSorcererMetamagicStartIndex(level) + slotIndex;
      const nextSelections = updateSelectionAtIndex(
        currentSelections,
        totalSelectionCount,
        currentIndex,
        nextValue
      );

      return setSorcererMetamagicSelectionsForCharacter(
        currentCharacter,
        nextSelections.flatMap((selection) =>
          metamagicDefinitions.some((definition) => definition.key === selection)
            ? [selection as (typeof metamagicDefinitions)[number]["key"]]
            : []
        )
      );
    });
  }

  function isSorcererMetamagicInputRequired(level: number): boolean {
    const currentSelections = getSorcererMetamagicSelections();
    const startIndex = getSorcererMetamagicStartIndex(level);

    return [0, 1].some((slotIndex) => !currentSelections[startIndex + slotIndex]);
  }

  function getWarlockMysticArcanumSpellLevel(level: number): 6 | 7 | 8 | 9 | null {
    if (level === 11) {
      return 6;
    }

    if (level === 13) {
      return 7;
    }

    if (level === 15) {
      return 8;
    }

    if (level === 17) {
      return 9;
    }

    return null;
  }

  function getWarlockMysticArcanumSelection(level: number): string {
    const spellLevel = getWarlockMysticArcanumSpellLevel(level);
    return spellLevel ? getWarlockMysticArcanumSpellIdForCharacter(character, spellLevel) ?? "" : "";
  }

  function getAvailableWarlockMysticArcanumSpells(level: number): SpellEntry[] {
    const spellLevel = getWarlockMysticArcanumSpellLevel(level);
    return spellLevel ? getWarlockMysticArcanumSpellOptionsForCharacter(character, spellLevel) : [];
  }

  function updateWarlockMysticArcanumSelection(level: number, nextValue: string) {
    const spellLevel = getWarlockMysticArcanumSpellLevel(level);

    if (!spellLevel) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      setWarlockMysticArcanumSpellIdForCharacter(
        currentCharacter,
        spellLevel,
        nextValue.trim().length > 0 ? nextValue : null
      )
    );
  }

  function isWarlockMysticArcanumInputRequired(level: number): boolean {
    return getWarlockMysticArcanumSelection(level).trim().length <= 0;
  }

  function getWeaponMasterySelections(): WEAPON_PROFICIENCY[] {
    return getWeaponMasterySelectionsForCharacter(character);
  }

  function getAvailableWeaponMasteryOptions(slotIndex: number): WEAPON_PROFICIENCY[] {
    const currentSelections = getWeaponMasterySelections();
    const blockedSelections = currentSelections.filter((_, index) => index !== slotIndex);

    return getWeaponMasteryOptionsForCharacter(character).filter(
      (proficiency) => !blockedSelections.includes(proficiency)
    );
  }

  function updateWeaponMasterySelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = setWeaponMasterySelectionsForCharacter(
        currentCharacter,
        updateSelectionAtIndex(
          getWeaponMasterySelectionsForCharacter(currentCharacter),
          getWeaponMasterySelectionCountForCharacter(currentCharacter),
          slotIndex,
          nextValue
        ).filter((selection): selection is WEAPON_PROFICIENCY =>
          getWeaponMasteryOptionsForCharacter(currentCharacter).includes(
            selection as WEAPON_PROFICIENCY
          )
        )
      );

      return recomputeCharacterFeatureProficiencies(nextCharacter);
    });
  }

  function isWeaponMasteryInputRequired(): boolean {
    const totalSelections = getWeaponMasterySelectionCountForCharacter(character);
    return totalSelections > 0 && getWeaponMasterySelections().length < totalSelections;
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

  function updateDruidPrimalOrderChoice(choice: "magician" | "warden") {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = setDruidPrimalOrderChoiceForCharacter(currentCharacter, choice);
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

  function getBarbarianPrimalKnowledgeSelection(): SkillName | null {
    return getBarbarianPrimalKnowledgeSkillSelectionForCharacter(character);
  }

  function getBarbarianPrimalKnowledgeOptions(): Array<{
    skill: SkillName;
    disabled: boolean;
    label: string;
  }> {
    const currentSelection = getBarbarianPrimalKnowledgeSelection();

    return getBarbarianPrimalKnowledgeSkillOptionsForCharacter(character).map((skillName) => {
      const proficiency = getSkillProficiencyForName(skillName);
      const isAlreadyProficient =
        proficiency !== null &&
        currentSelection !== skillName &&
        getSkillLevelFromEntries(character.skillProficiencies, proficiency) !== PROF_LEVEL.NONE;

      return {
        skill: skillName,
        disabled: isAlreadyProficient,
        label: isAlreadyProficient ? `${skillName} (already proficient)` : skillName
      };
    });
  }

  function updateBarbarianPrimalKnowledgeSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setBarbarianPrimalKnowledgeSkillSelectionForCharacter(
          currentCharacter,
          nextValue.trim().length > 0 ? (nextValue as SkillName) : null
        )
      )
    );
  }

  return (
    <ul className={featureDisclosureStyles.featureList}>
      {features.map((featureRow, index) => {
        const featureDetails = featureRow.details;
        const isUnlocked = featureRow.level <= character.level;
        const isFeatureExpanded = expandedFeatureKeys.includes(featureRow.key);
        const featurePanelId = `class-feature-panel-${featureRow.key}`;
        const linkedFeat = isFeatChoiceFeature(featureRow.feature)
          ? getLinkedFeatForFeature(featureRow.level, featureRow.feature)
          : null;
        const linkedFeatDefinition = linkedFeat ? getFeatDefinition(linkedFeat.feat) : null;
        const linkedFeatSummary = linkedFeat ? getCharacterFeatSummary(linkedFeat) : null;
        const blessedStrikesChoice =
          featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES
            ? getClericBlessedStrikesChoiceForCharacter(character)
            : null;
        const isSpellcastingFeatureInputRequired =
          isUnlocked &&
          featureRow.level === 1 &&
          (featureRow.feature === CLASS_FEATURE.SPELLCASTING ||
            featureRow.feature === CLASS_FEATURE.PACT_MAGIC) &&
          spellSelectionInputStatus.hasInputRequired;
        const isExpertiseInputRequired =
          isUnlocked && featureRow.feature === CLASS_FEATURE.EXPERTISE
            ? character.className === "Bard"
              ? isBardExpertiseInputRequired(featureRow.level)
              : character.className === "Ranger"
                ? isRangerLevel9ExpertiseInputRequired()
                : character.className === "Rogue"
                  ? isRogueExpertiseInputRequired(featureRow.level)
                  : false
            : false;
        const isInputRequired =
          (isUnlocked && isFeatChoiceFeature(featureRow.feature) && linkedFeat === null) ||
          isSpellcastingFeatureInputRequired ||
          isExpertiseInputRequired ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.DEFT_EXPLORER &&
            character.className === "Ranger" &&
            isRangerDeftExplorerInputRequired()) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.THIEVES_CANT &&
            character.className === "Rogue" &&
            isRogueThievesCantInputRequired()) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.METAMAGIC &&
            character.className === "Sorcerer" &&
            isSorcererMetamagicInputRequired(featureRow.level)) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.MYSTIC_ARCANUM &&
            character.className === "Warlock" &&
            isWarlockMysticArcanumInputRequired(featureRow.level)) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.SCHOLAR &&
            character.className === "Wizard" &&
            isWizardScholarInputRequired()) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.SPELL_MASTERY &&
            character.className === "Wizard" &&
            isWizardSpellMasteryInputRequired()) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.SIGNATURE_SPELLS &&
            character.className === "Wizard" &&
            isWizardSignatureSpellsInputRequired()) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.WEAPON_MASTERY &&
            isWeaponMasteryInputRequired()) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.PRIMAL_KNOWLEDGE &&
            character.className === "Barbarian" &&
            getBarbarianPrimalKnowledgeSelection() === null) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER &&
            getDruidPrimalOrderChoiceForCharacter(character) === null) ||
          (isUnlocked &&
            featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES &&
            blessedStrikesChoice === null);

        return (
          <FeatureDisclosureRow
            key={featureRow.key}
            as="li"
            title={`Level ${featureRow.level}: ${formatCodexLabel(featureRow.feature)}`}
            isExpanded={isFeatureExpanded}
            onToggle={() => onToggleFeature(featureRow.key)}
            bodyId={featurePanelId}
            bodyClassName={featureDisclosureStyles.descriptionList}
            trackingButton={renderTrackingButton(getFeatureTrackingState(featureDetails))}
            headerMeta={
              isInputRequired ? (
                <span className={featureDisclosureStyles.featureInputRequired}>
                  <TriangleAlert size={16} aria-hidden="true" />
                  INPUT REQUIRED
                </span>
              ) : null
            }
            showDivider={index > 0}
          >
            {featureDetails.description.length > 0 ? (
              <div>
                  {featureRow.feature === CLASS_FEATURE.DIVINE_ORDER ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(0, 1)}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <FeatureChoiceOptions
                        featureKey={featureRow.key}
                        groupName={`divine-order-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getClericDivineOrderChoiceForCharacter(character)}
                        options={[
                          {
                            key: "protector",
                            value: "protector",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "thaumaturge",
                            value: "thaumaturge",
                            content: featureDetails.description[2] ?? ""
                          }
                        ]}
                        onChange={updateClericDivineOrderChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(0, 1)}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <FeatureChoiceOptions
                        featureKey={featureRow.key}
                        groupName={`blessed-strikes-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={blessedStrikesChoice}
                        options={[
                          {
                            key: "blessed-strike",
                            value: "blessed-strike",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "potent-spellcasting",
                            value: "potent-spellcasting",
                            content: featureDetails.description[2] ?? ""
                          }
                        ]}
                        onChange={updateClericBlessedStrikesChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(0, 1)}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <FeatureChoiceOptions
                        featureKey={featureRow.key}
                        groupName={`primal-order-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getDruidPrimalOrderChoiceForCharacter(character)}
                        options={[
                          {
                            key: "magician",
                            value: "magician",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "warden",
                            value: "warden",
                            content: featureDetails.description[2] ?? ""
                          }
                        ]}
                        onChange={updateDruidPrimalOrderChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.METAMAGIC &&
                    character.className === "Sorcerer" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        {[0, 1].map((slotIndex) => {
                          const currentIndex =
                            getSorcererMetamagicStartIndex(featureRow.level) + slotIndex;
                          const currentValue =
                            getSorcererMetamagicSelections()[currentIndex] ?? "";
                          const availableOptions = getAvailableSorcererMetamagicOptions(
                            featureRow.level,
                            slotIndex
                          );

                          return (
                            <label
                              key={`${featureRow.key}-metamagic-slot-${slotIndex}`}
                              className={clsx(
                                styles.featureSelectionField,
                                !isUnlocked && styles.featureOptionRowDisabled
                              )}
                            >
                              <span className={styles.featureSelectionLabel}>
                                Metamagic {currentIndex + 1}
                              </span>
                              <SelectInput
                                value={currentValue}
                                disabled={!isUnlocked}
                                onChange={(event) =>
                                  updateSorcererMetamagicSelection(
                                    featureRow.level,
                                    slotIndex,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">Select an option</option>
                                {availableOptions.map((definition) => (
                                  <option
                                    key={`${featureRow.key}-${definition.key}`}
                                    value={definition.key}
                                  >
                                    {definition.name}
                                  </option>
                                ))}
                              </SelectInput>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.DEFT_EXPLORER ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>Expertise</span>
                          <SelectInput
                            value={getRangerDeftExplorerExpertiseSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateRangerDeftExplorerExpertiseSelection(event.target.value)
                            }
                          >
                            <option value="">Select a skill</option>
                            {getAvailableRangerDeftExplorerSkills().map((skillName) => (
                              <option key={`${featureRow.key}-${skillName}`} value={skillName}>
                                {skillName}
                              </option>
                            ))}
                          </SelectInput>
                        </label>
                        {[0, 1].map((slotIndex) => {
                          const currentValue =
                            getRangerDeftExplorerLanguageSelections()[slotIndex] ?? "";
                          const availableLanguages =
                            getAvailableRangerDeftExplorerLanguages(slotIndex);

                          if (
                            currentValue &&
                            !availableLanguages.includes(currentValue as LANGUAGE_PROFICIENCY)
                          ) {
                            availableLanguages.unshift(currentValue as LANGUAGE_PROFICIENCY);
                          }

                          return (
                            <label
                              key={`${featureRow.key}-language-slot-${slotIndex}`}
                              className={clsx(
                                styles.featureSelectionField,
                                !isUnlocked && styles.featureOptionRowDisabled
                              )}
                            >
                              <span className={styles.featureSelectionLabel}>
                                Language {slotIndex + 1}
                              </span>
                              <SelectInput
                                value={currentValue}
                                disabled={!isUnlocked}
                                onChange={(event) =>
                                  updateRangerDeftExplorerLanguageSelection(
                                    slotIndex,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">Select a language</option>
                                {availableLanguages.map((proficiency) => (
                                  <option
                                    key={`${featureRow.key}-${slotIndex}-${proficiency}`}
                                    value={proficiency}
                                  >
                                    {getProficiencyLabel(proficiency)}
                                  </option>
                                ))}
                              </SelectInput>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.SCHOLAR &&
                    character.className === "Wizard" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>Scholar Skill</span>
                          <SelectInput
                            value={getWizardScholarSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) => updateWizardScholarSelection(event.target.value)}
                          >
                            <option value="">Select a skill</option>
                            {getAvailableWizardScholarSkills().map((skillName) => (
                              <option key={`${featureRow.key}-${skillName}`} value={skillName}>
                                {skillName}
                              </option>
                            ))}
                          </SelectInput>
                        </label>
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.PRIMAL_KNOWLEDGE &&
                    character.className === "Barbarian" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>New Skill</span>
                          <SelectInput
                            value={getBarbarianPrimalKnowledgeSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateBarbarianPrimalKnowledgeSelection(event.target.value)
                            }
                          >
                            <option value="">Select a skill</option>
                            {getBarbarianPrimalKnowledgeOptions().map((option) => (
                              <option
                                key={`${featureRow.key}-${option.skill}`}
                                value={option.skill}
                                disabled={option.disabled}
                              >
                                {option.label}
                              </option>
                            ))}
                          </SelectInput>
                        </label>
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.SPELL_MASTERY &&
                    character.className === "Wizard" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>Level 1 Spell</span>
                          <SelectInput
                            value={getWizardSpellMasterySelection(1)}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateWizardSpellMasterySelection(1, event.target.value)
                            }
                          >
                            <option value="">Select a spell from your spellbook</option>
                            {getAvailableWizardSpellMasterySpells(1).map((spell) => (
                              <option
                                key={`${featureRow.key}-spell-mastery-1-${spell.id}`}
                                value={spell.id}
                              >
                                {spell.name}
                              </option>
                            ))}
                          </SelectInput>
                        </label>
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>Level 2 Spell</span>
                          <SelectInput
                            value={getWizardSpellMasterySelection(2)}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateWizardSpellMasterySelection(2, event.target.value)
                            }
                          >
                            <option value="">Select a spell from your spellbook</option>
                            {getAvailableWizardSpellMasterySpells(2).map((spell) => (
                              <option
                                key={`${featureRow.key}-spell-mastery-2-${spell.id}`}
                                value={spell.id}
                              >
                                {spell.name}
                              </option>
                            ))}
                          </SelectInput>
                        </label>
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.SIGNATURE_SPELLS &&
                    character.className === "Wizard" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        {[0, 1].map((slotIndex) => {
                          const currentValue = getWizardSignatureSpellSelections()[slotIndex] ?? "";
                          const availableSpells = getAvailableWizardSignatureSpells(slotIndex);

                          return (
                            <label
                              key={`${featureRow.key}-signature-slot-${slotIndex}`}
                              className={clsx(
                                styles.featureSelectionField,
                                !isUnlocked && styles.featureOptionRowDisabled
                              )}
                            >
                              <span className={styles.featureSelectionLabel}>
                                Signature Spell {slotIndex + 1}
                              </span>
                              <SelectInput
                                value={currentValue}
                                disabled={!isUnlocked}
                                onChange={(event) =>
                                  updateWizardSignatureSpellSelection(slotIndex, event.target.value)
                                }
                              >
                                <option value="">Select a level 3 spell from your spellbook</option>
                                {availableSpells.map((spell) => (
                                  <option
                                    key={`${featureRow.key}-signature-${spell.id}`}
                                    value={spell.id}
                                  >
                                    {spell.name}
                                  </option>
                                ))}
                              </SelectInput>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.EXPERTISE ? (
                    character.className === "Ranger" ? (
                      <>
                        <FeatureDescriptionLines
                          featureKey={featureRow.key}
                          lines={featureDetails.description}
                          onOpenKeyword={onOpenKeyword}
                          onOpenFeatReference={onOpenFeatReference}
                          onOpenSpellReference={onOpenSpellReference}
                          onOpenDivinityReference={onOpenDivinityReference}
                        />
                        <div className={styles.featureSelectionGrid}>
                          {[0, 1].map((slotIndex) => {
                            const currentValue = getRangerLevel9ExpertiseSelections()[slotIndex] ?? "";
                            const availableSkills =
                              getAvailableRangerLevel9ExpertiseSkills(slotIndex);

                            if (currentValue && !availableSkills.includes(currentValue as SkillName)) {
                              availableSkills.unshift(currentValue as SkillName);
                            }

                            return (
                              <label
                                key={`${featureRow.key}-expertise-slot-${slotIndex}`}
                                className={clsx(
                                  styles.featureSelectionField,
                                  !isUnlocked && styles.featureOptionRowDisabled
                                )}
                              >
                                <span className={styles.featureSelectionLabel}>
                                  Expertise {slotIndex + 1}
                                </span>
                                <SelectInput
                                  value={currentValue}
                                  disabled={!isUnlocked}
                                  onChange={(event) =>
                                    updateRangerLevel9ExpertiseSelection(
                                      slotIndex,
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="">Select a skill</option>
                                  {availableSkills.map((skillName) => (
                                    <option key={`${featureRow.key}-${skillName}`} value={skillName}>
                                      {skillName}
                                    </option>
                                  ))}
                                </SelectInput>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : character.className === "Rogue" ? (
                      <>
                        <FeatureDescriptionLines
                          featureKey={featureRow.key}
                          lines={
                            featureRow.level >= 6
                              ? featureDetails.description.slice(1, 2)
                              : featureDetails.description.slice(0, 1)
                          }
                          onOpenKeyword={onOpenKeyword}
                          onOpenFeatReference={onOpenFeatReference}
                          onOpenSpellReference={onOpenSpellReference}
                          onOpenDivinityReference={onOpenDivinityReference}
                        />
                        <div className={styles.featureSelectionGrid}>
                          {[0, 1].map((slotIndex) => {
                            const currentValue = getRogueExpertiseSelections(featureRow.level)[slotIndex] ?? "";
                            const availableSkills = getAvailableRogueExpertiseSkills(
                              featureRow.level,
                              slotIndex
                            );

                            if (currentValue && !availableSkills.includes(currentValue as SkillName)) {
                              availableSkills.unshift(currentValue as SkillName);
                            }

                            return (
                              <label
                                key={`${featureRow.key}-expertise-slot-${slotIndex}`}
                                className={clsx(
                                  styles.featureSelectionField,
                                  !isUnlocked && styles.featureOptionRowDisabled
                                )}
                              >
                                <span className={styles.featureSelectionLabel}>
                                  Expertise {slotIndex + 1}
                                </span>
                                <SelectInput
                                  value={currentValue}
                                  disabled={!isUnlocked}
                                  onChange={(event) =>
                                    updateRogueExpertiseSelection(
                                      featureRow.level,
                                      slotIndex,
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="">Select a skill</option>
                                  {availableSkills.map((skillName) => (
                                    <option key={`${featureRow.key}-${skillName}`} value={skillName}>
                                      {skillName}
                                    </option>
                                  ))}
                                </SelectInput>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : character.className === "Bard" ? (
                      <>
                        <FeatureDescriptionLines
                          featureKey={featureRow.key}
                          lines={
                            featureRow.level >= 9
                              ? featureDetails.description.slice(1, 2)
                              : featureDetails.description.slice(0, 1)
                          }
                          onOpenKeyword={onOpenKeyword}
                          onOpenFeatReference={onOpenFeatReference}
                          onOpenSpellReference={onOpenSpellReference}
                          onOpenDivinityReference={onOpenDivinityReference}
                        />
                        <div className={styles.featureSelectionGrid}>
                          {[0, 1].map((slotIndex) => {
                            const currentValue = getBardExpertiseSelections(featureRow.level)[slotIndex] ?? "";
                            const availableSkills = getAvailableBardExpertiseSkills(
                              featureRow.level,
                              slotIndex
                            );

                            if (currentValue && !availableSkills.includes(currentValue as SkillName)) {
                              availableSkills.unshift(currentValue as SkillName);
                            }

                            return (
                              <label
                                key={`${featureRow.key}-expertise-slot-${slotIndex}`}
                                className={clsx(
                                  styles.featureSelectionField,
                                  !isUnlocked && styles.featureOptionRowDisabled
                                )}
                              >
                                <span className={styles.featureSelectionLabel}>
                                  Expertise {slotIndex + 1}
                                </span>
                                <SelectInput
                                  value={currentValue}
                                  disabled={!isUnlocked}
                                  onChange={(event) =>
                                    updateBardExpertiseSelection(
                                      featureRow.level,
                                      slotIndex,
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="">Select a skill</option>
                                  {availableSkills.map((skillName) => (
                                    <option key={`${featureRow.key}-${skillName}`} value={skillName}>
                                      {skillName}
                                    </option>
                                  ))}
                                </SelectInput>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    )
                  ) : featureRow.feature === CLASS_FEATURE.THIEVES_CANT &&
                    character.className === "Rogue" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>Bonus Language</span>
                          <SelectInput
                            value={getRogueThievesCantLanguageSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateRogueThievesCantLanguageSelection(event.target.value)
                            }
                          >
                            <option value="">Select a language</option>
                            {getAvailableRogueThievesCantLanguages().map((proficiency) => (
                              <option key={`${featureRow.key}-${proficiency}`} value={proficiency}>
                                {getProficiencyLabel(proficiency)}
                              </option>
                            ))}
                          </SelectInput>
                        </label>
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.WEAPON_MASTERY ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureSelectionGrid}>
                        {Array.from(
                          { length: getWeaponMasterySelectionCountForCharacter(character) },
                          (_, slotIndex) => {
                            const currentValue = getWeaponMasterySelections()[slotIndex] ?? "";
                            const availableOptions = getAvailableWeaponMasteryOptions(slotIndex);

                            return (
                              <label
                                key={`${featureRow.key}-weapon-mastery-slot-${slotIndex}`}
                                className={clsx(
                                  styles.featureSelectionField,
                                  !isUnlocked && styles.featureOptionRowDisabled
                                )}
                              >
                                <span className={styles.featureSelectionLabel}>
                                  Weapon Mastery {slotIndex + 1}
                                </span>
                                <SelectInput
                                  value={currentValue}
                                  disabled={!isUnlocked}
                                  onChange={(event) =>
                                    updateWeaponMasterySelection(slotIndex, event.target.value)
                                  }
                                >
                                  <option value="">Select a weapon</option>
                                  {availableOptions.map((proficiency) => (
                                    <option
                                      key={`${featureRow.key}-weapon-mastery-${proficiency}`}
                                      value={proficiency}
                                    >
                                      {getWeaponProficiencyLabel(proficiency)}
                                    </option>
                                  ))}
                                </SelectInput>
                              </label>
                            );
                          }
                        )}
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.MYSTIC_ARCANUM &&
                    character.className === "Warlock" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      {getWarlockMysticArcanumSpellLevel(featureRow.level) ? (
                        <div className={styles.featureSelectionGrid}>
                          <label
                            className={clsx(
                              styles.featureSelectionField,
                              !isUnlocked && styles.featureOptionRowDisabled
                            )}
                          >
                            <span className={styles.featureSelectionLabel}>
                              {`${getWarlockMysticArcanumSpellLevel(featureRow.level)}th-level Arcanum`}
                            </span>
                            <SelectInput
                              value={getWarlockMysticArcanumSelection(featureRow.level)}
                              disabled={!isUnlocked}
                              onChange={(event) =>
                                updateWarlockMysticArcanumSelection(
                                  featureRow.level,
                                  event.target.value
                                )
                              }
                            >
                              <option value="">Select a spell</option>
                              {getAvailableWarlockMysticArcanumSpells(featureRow.level).map(
                                (spell) => (
                                  <option key={`${featureRow.key}-${spell.id}`} value={spell.id}>
                                    {spell.name}
                                  </option>
                                )
                              )}
                            </SelectInput>
                          </label>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <FeatureDescriptionLines
                      featureKey={featureRow.key}
                      lines={featureDetails.description}
                      onOpenKeyword={onOpenKeyword}
                      onOpenFeatReference={onOpenFeatReference}
                      onOpenSpellReference={onOpenSpellReference}
                      onOpenDivinityReference={onOpenDivinityReference}
                    />
                  )}

                  {isSpellcastingFeatureInputRequired && spellSelectionInputStatus.message ? (
                    <p className={styles.featureInputRequiredDescription}>
                      {spellSelectionInputStatus.message}
                    </p>
                  ) : null}

                  {isFeatChoiceFeature(featureRow.feature) ? (
                    linkedFeat && linkedFeatDefinition ? (
                      <div className={styles.featureChoiceRow}>
                        <div className={styles.featureChoiceSummary}>
                          <span className={styles.featureChoiceLabel}>Chosen feat</span>
                          <button
                            type="button"
                            className={styles.featureChoiceValue}
                            onClick={() => onOpenFeatReference(linkedFeat.feat, linkedFeat)}
                          >
                            {linkedFeatDefinition.label}
                            {linkedFeatSummary ? ` · ${linkedFeatSummary}` : ""}
                          </button>
                        </div>
                        <button
                          type="button"
                          className={shared.editButton}
                          disabled={!isUnlocked}
                          onClick={() =>
                            onOpenFeatEditorForFeature(featureRow.level, featureRow.feature)
                          }
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className={styles.featureChoiceRow}>
                        <button
                          type="button"
                          className={shared.editButton}
                          disabled={!isUnlocked}
                          onClick={() =>
                            onOpenFeatEditorForFeature(featureRow.level, featureRow.feature)
                          }
                        >
                          <Plus size={16} />
                          Choose Feat
                        </button>
                      </div>
                    )
                  ) : null}
              </div>
            ) : (
              <p className={styles.emptyFeatureText}>
                Details coming soon.
              </p>
            )}
          </FeatureDisclosureRow>
        );
      })}
    </ul>
  );
}

export default ClassFeatureList;
