import clsx from "clsx";
import { Pencil, Plus, TriangleAlert } from "lucide-react";
import { useState } from "react";
import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  getFeatureTrackingState,
  type DivinityEntry,
  type SpellEntry
} from "../../../../codex/entries";
import SelectInput from "../../FormInputs/SelectInput";
import {
  getBarbarianPrimalKnowledgeSkillOptionsForCharacter,
  getBarbarianPrimalKnowledgeSkillSelectionForCharacter,
  getBarbarianWildHeartAspectChoiceForCharacter,
  getBardExpertiseSelectionsForCharacter,
  getBardLoreBonusProficiencySelectionsForCharacter,
  getBardMagicalDiscoveriesSpellIdsForCharacter,
  getBardMagicalDiscoveriesSpellOptionsForCharacter,
  getBardPrimalLoreCantripIdForCharacter,
  getBardPrimalLoreCantripOptionsForCharacter,
  getBardPrimalLoreSkillOptionsForCharacter,
  getBardPrimalLoreSkillSelectionForCharacter,
  getClericBlessedStrikesChoiceForCharacter,
  getClericDivineOrderChoiceForCharacter,
  fighterBanneretKnightlyEnvoySkillOptions,
  getKnowledgeDomainBlessingsSkillSelectionsForCharacter,
  getKnowledgeDomainBlessingsToolSelectionForCharacter,
  getKnowledgeDomainUnfetteredMindSavingThrowOptionsForCharacter,
  getKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter,
  getDruidCircleOfTheLandChoiceForCharacter,
  getDruidElementalFuryChoiceForCharacter,
  getDruidPrimalOrderChoiceForCharacter,
  getDruidWildShapeKnownFormsForCharacter,
  getDruidWildShapeRulesForCharacter,
  getFighterBattleMasterManeuverSelectionCountForCharacter,
  getFighterBattleMasterManeuverSelectionsForCharacter,
  getFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter,
  getFighterBanneretKnightlyEnvoySkillSelectionForCharacter,
  getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter,
  getRangerDeftExplorerExpertiseSelectionForCharacter,
  getRangerDeftExplorerLanguageSelectionsForCharacter,
  getRangerFeyWandererGiftSelectionForCharacter,
  getRangerHunterDefensiveTacticsChoiceForCharacter,
  getRangerHunterPreyChoiceForCharacter,
  getRangerGloomStalkerIronMindSavingThrowOptionsForCharacter,
  getRangerGloomStalkerIronMindSavingThrowSelectionForCharacter,
  getRangerLevel9ExpertiseSelectionsForCharacter,
  getRangerOtherworldlyGlamourSkillSelectionForCharacter,
  getRogueExpertiseSelectionsForCharacter,
  getRogueScionOfTheThreeDreadAllegianceChoiceForCharacter,
  getRogueThievesCantLanguageSelectionForCharacter,
  isRangerGloomStalkerIronMindLockedToWisForCharacter,
  isKnowledgeDomainUnfetteredMindLockedToIntForCharacter,
  getSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter,
  getSorcererMetamagicDefinitionsForCharacter,
  getSorcererMetamagicSelectionCountForCharacter,
  getSorcererMetamagicSelectionsForCharacter,
  sorcererDraconicElementalAffinityDamageTypeOptions,
  getWarlockFiendishResilienceDamageTypeSelectionForCharacter,
  warlockFiendPatronFiendishResilienceDamageTypeOptions,
  getWarlockMysticArcanumSpellIdForCharacter,
  getWarlockMysticArcanumSpellOptionsForCharacter,
  getWizardSavantSpellIdsForCharacter,
  getWizardScholarSelectionForCharacter,
  getWizardSignatureSpellIdsForCharacter,
  getWizardSpellMasterySelectionForCharacter,
  getAlwaysSpellbookSpellIdsForCharacter,
  getWeaponMasteryOptionsForCharacter,
  getWeaponMasterySelectionCountForCharacter,
  getWeaponMasterySelectionsForCharacter,
  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
  rangerFeyWandererGiftOptions,
  rangerOtherworldlyGlamourSkillOptions,
  setBardExpertiseSelectionsForCharacter,
  setBardLoreBonusProficiencySelectionsForCharacter,
  setBardMagicalDiscoveriesSpellIdsForCharacter,
  setBardPrimalLoreCantripIdForCharacter,
  setBardPrimalLoreSkillSelectionForCharacter,
  setBarbarianPrimalKnowledgeSkillSelectionForCharacter,
  setBarbarianWildHeartAspectChoiceForCharacter,
  setClericBlessedStrikesChoiceForCharacter,
  setClericDivineOrderChoiceForCharacter,
  setKnowledgeDomainBlessingsSkillSelectionsForCharacter,
  setKnowledgeDomainBlessingsToolSelectionForCharacter,
  setKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter,
  setDruidCircleOfTheLandChoiceForCharacter,
  setDruidElementalFuryChoiceForCharacter,
  setDruidPrimalOrderChoiceForCharacter,
  setDruidWildShapeKnownFormsForCharacter,
  setFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter,
  setFighterBanneretKnightlyEnvoySkillSelectionForCharacter,
  setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter,
  setRangerDeftExplorerExpertiseSelectionForCharacter,
  setRangerDeftExplorerLanguageSelectionsForCharacter,
  setRangerFeyWandererGiftSelectionForCharacter,
  setRangerHunterDefensiveTacticsChoiceForCharacter,
  setRangerHunterPreyChoiceForCharacter,
  setRangerGloomStalkerIronMindSavingThrowSelectionForCharacter,
  setRangerLevel9ExpertiseSelectionsForCharacter,
  setRangerOtherworldlyGlamourSkillSelectionForCharacter,
  setRogueExpertiseSelectionsForCharacter,
  setRogueScionOfTheThreeDreadAllegianceChoiceForCharacter,
  setRogueThievesCantLanguageSelectionForCharacter,
  setSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter,
  setSorcererMetamagicSelectionsForCharacter,
  setWarlockFiendishResilienceDamageTypeSelectionForCharacter,
  setWarlockMysticArcanumSpellIdForCharacter,
  setWizardScholarSelectionForCharacter,
  setWizardSignatureSpellIdsForCharacter,
  setWizardSpellMasterySelectionForCharacter,
  setWeaponMasterySelectionsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  artisanToolProficiencies,
  getProficiencyLabel,
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
import {
  getWizardSavantSelectionCount,
  isWizardSavantFeature
} from "../../../../pages/CharactersPage/classFeatures/wizard/savant";
import {
  getWizardBladesingerTrainingInWarAndSongSkillSelection,
  wizardBladesingerTrainingInWarAndSongSkillOptions
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
import type {
  Character,
  CharacterFeatEntry,
  LANGUAGE_PROFICIENCY,
  MonsterRecord,
  RangerHunterDefensiveTacticsChoice,
  RangerHunterPreyChoice,
  RogueScionOfTheThreeDreadAllegianceChoice,
  SkillName,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { SAVING_THROW_PROFICIENCY, SKILL } from "../../../../types";
import { formatCodexLabel } from "../../../../utils/codex";
import { FeatureDisclosureRow, featureDisclosureStyles } from "../../../FeatureDisclosure";
import { MonsterEntryDrawer } from "../../../MonsterEntryRenderer";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./ClassFeaturesAndFeats.module.css";
import BattleMasterManeuverSelection from "./BattleMasterManeuverSelection";
import FeatureChoiceOptions from "./ClassFeatureChoiceOptions";
import DruidWildShapeMonsterModal from "./DruidWildShapeMonsterModal";
import WizardBladesingerTrainingInWarAndSongFields from "./WizardBladesingerTrainingInWarAndSongFields";
import WizardSavantFeatureFields from "./WizardSavantFeatureFields";
import {
  buildSkillSelectOptions,
  buildToolSelectOptions,
  getBardExpertiseTierForLevel,
  getRogueExpertiseTierForLevel,
  getSelectableLanguageOptions,
  getSelectableNonExpertSkillOptions,
  getSelectableProficientSkillOptions,
  getSelectableUnproficientToolOptions,
  getSelectableUnproficientSavingThrowOptions,
  getSelectableUnproficientSkillOptions,
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
        <p key={`${featureKey}-line-${index}`} className={featureDisclosureStyles.descriptionLine}>
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

function getDamageTypeChoiceContent(damageType: DAMAGE_TYPE): string {
  const label = formatCodexLabel(damageType);
  return `<link:${label}>${label}</link>`;
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
  const [isWildShapeModalOpen, setIsWildShapeModalOpen] = useState(false);
  const [selectedWildShapeMonster, setSelectedWildShapeMonster] = useState<MonsterRecord | null>(
    null
  );
  const spellSelectionInputStatus = getSpellSelectionInputStatusForCharacter(character);

  function recomputeCharacterFeatureProficiencies(nextCharacter: Character): Character {
    return {
      ...nextCharacter,
      ...normalizeCharacterProficiencies({
        className: nextCharacter.className,
        level: nextCharacter.level,
        species: nextCharacter.species,
        background: nextCharacter.background,
        subclassId: nextCharacter.subclassId,
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

  function isWizardBladesingerTrainingInWarAndSongInputRequired(): boolean {
    return (
      getWizardBladesingerTrainingInWarAndSongSkillSelection(character) === null &&
      getSelectableUnproficientSkillOptions(
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

  function getSorcererDraconicElementalAffinityDamageTypeSelection(): DAMAGE_TYPE | null {
    return getSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter(character);
  }

  function updateSorcererDraconicElementalAffinityDamageTypeSelection(choice: DAMAGE_TYPE) {
    onPersistCharacter((currentCharacter) =>
      setSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter(currentCharacter, choice)
    );
  }

  function isSorcererDraconicElementalAffinityInputRequired(): boolean {
    return getSorcererDraconicElementalAffinityDamageTypeSelection() === null;
  }

  function getWarlockFiendishResilienceDamageTypeSelection(): DAMAGE_TYPE | null {
    return getWarlockFiendishResilienceDamageTypeSelectionForCharacter(character);
  }

  function updateWarlockFiendishResilienceDamageTypeSelection(choice: DAMAGE_TYPE) {
    onPersistCharacter((currentCharacter) =>
      setWarlockFiendishResilienceDamageTypeSelectionForCharacter(currentCharacter, choice)
    );
  }

  function isWarlockFiendishResilienceInputRequired(): boolean {
    return getWarlockFiendishResilienceDamageTypeSelection() === null;
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
    return spellLevel
      ? (getWarlockMysticArcanumSpellIdForCharacter(character, spellLevel) ?? "")
      : "";
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

  function isFighterBattleMasterManeuverOptionsInputRequired(): boolean {
    const totalSelections = getFighterBattleMasterManeuverSelectionCountForCharacter(character);

    return (
      totalSelections > 0 &&
      getFighterBattleMasterManeuverSelectionsForCharacter(character).length < totalSelections
    );
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

  function updateDruidCircleOfTheLandChoice(choice: "arid" | "polar" | "temperate" | "tropical") {
    onPersistCharacter((currentCharacter) =>
      setDruidCircleOfTheLandChoiceForCharacter(currentCharacter, choice)
    );
  }

  function updateDruidElementalFuryChoice(choice: "potent-spellcasting" | "primal-strike") {
    onPersistCharacter((currentCharacter) =>
      setDruidElementalFuryChoiceForCharacter(currentCharacter, choice)
    );
  }

  function getDruidWildShapeKnownForms(): MonsterRecord[] {
    return getDruidWildShapeKnownFormsForCharacter(character);
  }

  function getDruidWildShapeRules() {
    return getDruidWildShapeRulesForCharacter(character);
  }

  function updateDruidWildShapeKnownForms(monsters: MonsterRecord[]) {
    onPersistCharacter((currentCharacter) =>
      setDruidWildShapeKnownFormsForCharacter(currentCharacter, monsters)
    );
  }

  function updateClericBlessedStrikesChoice(choice: "blessed-strike" | "potent-spellcasting") {
    onPersistCharacter((currentCharacter) =>
      setClericBlessedStrikesChoiceForCharacter(currentCharacter, choice)
    );
  }

  function getBarbarianPrimalKnowledgeSelection(): SkillName | null {
    return getBarbarianPrimalKnowledgeSkillSelectionForCharacter(character);
  }

  function getFighterBanneretKnightlyEnvoyLanguageSelection(): LANGUAGE_PROFICIENCY | null {
    return getFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter(character);
  }

  function getAvailableFighterBanneretKnightlyEnvoyLanguages(): LANGUAGE_PROFICIENCY[] {
    return getSelectableLanguageOptions(
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
    return getSelectableUnproficientSkillOptions(
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

  function getBarbarianPrimalKnowledgeOptions() {
    const currentSelection = getBarbarianPrimalKnowledgeSelection();
    const allOptions = getBarbarianPrimalKnowledgeSkillOptionsForCharacter(character);

    return buildSkillSelectOptions(
      allOptions,
      getSelectableUnproficientSkillOptions(character, allOptions, currentSelection),
      currentSelection
    );
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

  function updateBarbarianWildHeartAspectChoice(nextValue: "owl" | "panther" | "salmon") {
    onPersistCharacter((currentCharacter) =>
      setBarbarianWildHeartAspectChoiceForCharacter(currentCharacter, nextValue)
    );
  }

  return (
    <>
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
          const druidElementalFuryChoice =
            featureRow.feature === CLASS_FEATURE.ELEMENTAL_FURY && character.className === "Druid"
              ? getDruidElementalFuryChoiceForCharacter(character)
              : null;
          const druidWildShapeRules =
            featureRow.feature === CLASS_FEATURE.WILD_SHAPE && character.className === "Druid"
              ? getDruidWildShapeRules()
              : null;
          const druidWildShapeKnownForms =
            featureRow.feature === CLASS_FEATURE.WILD_SHAPE && character.className === "Druid"
              ? getDruidWildShapeKnownForms()
              : [];
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
          const isBardLoreBonusProficienciesRequired =
            isUnlocked &&
            featureRow.feature === CLASS_FEATURE.BONUS_PROFICIENCIES &&
            character.className === "Bard" &&
            isBardLoreBonusProficienciesInputRequired();
          const isBardMagicalDiscoveriesRequired =
            isUnlocked &&
            featureRow.feature === CLASS_FEATURE.MAGICAL_DISCOVERIES &&
            character.className === "Bard" &&
            isBardMagicalDiscoveriesInputRequired();
          const isBardPrimalLoreRequired =
            isUnlocked &&
            featureRow.feature === CLASS_FEATURE.PRIMAL_LORE &&
            character.className === "Bard" &&
            (isBardPrimalLoreCantripInputRequired() || isBardPrimalLoreSkillInputRequired());
          const isKnowledgeDomainBlessingsRequired =
            isUnlocked &&
            featureRow.feature === CLASS_FEATURE.BLESSINGS_OF_KNOWLEDGE &&
            character.className === "Cleric" &&
            isKnowledgeDomainBlessingsInputRequired();
          const isKnowledgeDomainUnfetteredMindRequired =
            isUnlocked &&
            featureRow.feature === CLASS_FEATURE.UNFETTERED_MIND &&
            character.className === "Cleric" &&
            isKnowledgeDomainUnfetteredMindInputRequired();
          const isRangerGloomStalkerIronMindRequired =
            isUnlocked &&
            featureRow.feature === CLASS_FEATURE.IRON_MIND &&
            character.className === "Ranger" &&
            isRangerGloomStalkerIronMindInputRequired();
          const isInputRequired =
            (isUnlocked && isFeatChoiceFeature(featureRow.feature) && linkedFeat === null) ||
            isSpellcastingFeatureInputRequired ||
            isExpertiseInputRequired ||
            isBardLoreBonusProficienciesRequired ||
            isBardMagicalDiscoveriesRequired ||
            isBardPrimalLoreRequired ||
            isKnowledgeDomainBlessingsRequired ||
            isKnowledgeDomainUnfetteredMindRequired ||
            isRangerGloomStalkerIronMindRequired ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.KNIGHTLY_ENVOY &&
              character.className === "Fighter" &&
              isFighterBanneretKnightlyEnvoyInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.DEFT_EXPLORER &&
              character.className === "Ranger" &&
              isRangerDeftExplorerInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.HUNTERS_PREY &&
              character.className === "Ranger" &&
              isRangerHunterPreyInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.DEFENSIVE_TACTICS &&
              character.className === "Ranger" &&
              isRangerHunterDefensiveTacticsInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.FEY_WANDERER_SPELLS &&
              character.className === "Ranger" &&
              isRangerFeyWandererGiftInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.OTHERWORLDLY_GLAMOUR &&
              character.className === "Ranger" &&
              isRangerOtherworldlyGlamourInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.THIEVES_CANT &&
              character.className === "Rogue" &&
              isRogueThievesCantInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.DREAD_ALLEGIANCE &&
              character.className === "Rogue" &&
              isRogueScionOfTheThreeDreadAllegianceInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.METAMAGIC &&
              character.className === "Sorcerer" &&
              isSorcererMetamagicInputRequired(featureRow.level)) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.MYSTIC_ARCANUM &&
              character.className === "Warlock" &&
              isWarlockMysticArcanumInputRequired(featureRow.level)) ||
            (isUnlocked &&
              isWizardSavantFeature(featureRow.feature) &&
              character.className === "Wizard" &&
              isWizardSavantInputRequired(featureRow.feature)) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.SCHOLAR &&
              character.className === "Wizard" &&
              isWizardScholarInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.TRAINING_IN_WAR_AND_SONG &&
              character.className === "Wizard" &&
              isWizardBladesingerTrainingInWarAndSongInputRequired()) ||
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
              featureRow.feature === CLASS_FEATURE.MANEUVER_OPTIONS &&
              character.className === "Fighter" &&
              isFighterBattleMasterManeuverOptionsInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.PRIMAL_KNOWLEDGE &&
              character.className === "Barbarian" &&
              getBarbarianPrimalKnowledgeSelection() === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.GENIES_SPLENDOR &&
              character.className === "Paladin" &&
              isPaladinOathOfTheNobleGeniesGeniesSplendorInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.ASPECT_OF_THE_WILDS &&
              character.className === "Barbarian" &&
              getBarbarianWildHeartAspectChoiceForCharacter(character) === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER &&
              getDruidPrimalOrderChoiceForCharacter(character) === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS &&
              character.className === "Druid" &&
              getDruidCircleOfTheLandChoiceForCharacter(character) === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.WILD_SHAPE &&
              druidWildShapeRules !== null &&
              druidWildShapeKnownForms.length < druidWildShapeRules.knownForms) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES &&
              blessedStrikesChoice === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.ELEMENTAL_FURY &&
              character.className === "Druid" &&
              druidElementalFuryChoice === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.ELEMENTAL_AFFINITY &&
              character.className === "Sorcerer" &&
              isSorcererDraconicElementalAffinityInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.FIENDISH_RESILIENCE &&
              character.className === "Warlock" &&
              isWarlockFiendishResilienceInputRequired());

          return (
            <FeatureDisclosureRow
              key={featureRow.key}
              as="li"
              title={
                <span className={styles.featureTitleContent}>
                  <span>{`Level ${featureRow.level}: ${formatCodexLabel(featureRow.feature)}`}</span>
                  {featureRow.isSubclass ? (
                    <span className={styles.subclassFeatureIndicator}>Subclass</span>
                  ) : null}
                </span>
              }
              isExpanded={isFeatureExpanded}
              onToggle={() => onToggleFeature(featureRow.key)}
              bodyId={featurePanelId}
              bodyClassName={clsx(
                featureDisclosureStyles.descriptionList,
                styles.featureDescriptionList
              )}
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
                <>
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
                  ) : featureRow.feature === CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS &&
                    character.className === "Druid" ? (
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
                        groupName={`circle-of-the-land-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getDruidCircleOfTheLandChoiceForCharacter(character)}
                        options={[
                          {
                            key: "arid",
                            value: "arid",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "polar",
                            value: "polar",
                            content: featureDetails.description[2] ?? ""
                          },
                          {
                            key: "temperate",
                            value: "temperate",
                            content: featureDetails.description[3] ?? ""
                          },
                          {
                            key: "tropical",
                            value: "tropical",
                            content: featureDetails.description[4] ?? ""
                          }
                        ]}
                        onChange={updateDruidCircleOfTheLandChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.ELEMENTAL_FURY &&
                    character.className === "Druid" ? (
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
                        groupName={`elemental-fury-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={druidElementalFuryChoice}
                        options={[
                          {
                            key: "potent-spellcasting",
                            value: "potent-spellcasting",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "primal-strike",
                            value: "primal-strike",
                            content: featureDetails.description[2] ?? ""
                          }
                        ]}
                        onChange={updateDruidElementalFuryChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.ELEMENTAL_AFFINITY &&
                    character.className === "Sorcerer" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(0, 2)}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <FeatureChoiceOptions
                        featureKey={featureRow.key}
                        groupName={`elemental-affinity-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getSorcererDraconicElementalAffinityDamageTypeSelection()}
                        options={sorcererDraconicElementalAffinityDamageTypeOptions.map(
                          (damageType) => ({
                            key: damageType,
                            value: damageType,
                            content: getDamageTypeChoiceContent(damageType)
                          })
                        )}
                        onChange={updateSorcererDraconicElementalAffinityDamageTypeSelection}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(2)}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.FIENDISH_RESILIENCE &&
                    character.className === "Warlock" ? (
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
                        groupName={`fiendish-resilience-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getWarlockFiendishResilienceDamageTypeSelection()}
                        options={warlockFiendPatronFiendishResilienceDamageTypeOptions.map(
                          (damageType) => ({
                            key: damageType,
                            value: damageType,
                            content: getDamageTypeChoiceContent(damageType)
                          })
                        )}
                        onChange={updateWarlockFiendishResilienceDamageTypeSelection}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(1)}
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
                  ) : featureRow.feature === CLASS_FEATURE.WILD_SHAPE &&
                    character.className === "Druid" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <div className={styles.featureChoiceRow}>
                        <div className={styles.featureChoiceSummary}>
                          <span className={styles.featureChoiceLabel}>Beast shapes</span>
                          <span className={styles.featureChoiceValueText}>
                            {druidWildShapeRules
                              ? `${druidWildShapeKnownForms.length} / ${druidWildShapeRules.knownForms} selected`
                              : "Unavailable"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={shared.editButton}
                          disabled={!isUnlocked}
                          onClick={() => setIsWildShapeModalOpen(true)}
                        >
                          {druidWildShapeKnownForms.length > 0 ? (
                            <Pencil size={16} />
                          ) : (
                            <Plus size={16} />
                          )}
                          {druidWildShapeKnownForms.length > 0 ? "Edit" : "Choose"}
                        </button>
                      </div>
                      {druidWildShapeKnownForms.length > 0 ? (
                        <div className={styles.wildShapeMonsterList}>
                          {druidWildShapeKnownForms.map((monster) => (
                            <button
                              key={`${featureRow.key}-${monster.slug}`}
                              type="button"
                              className={styles.wildShapeMonsterRow}
                              onClick={() => setSelectedWildShapeMonster(monster)}
                            >
                              <span className={styles.wildShapeMonsterName}>{monster.name}</span>
                              <span className={styles.wildShapeMonsterMeta}>
                                {[monster.type, monster.document__slug].filter(Boolean).join(", ")}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.emptyFeatureText}>No beast shapes selected yet.</p>
                      )}
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.MANEUVER_OPTIONS &&
                    character.className === "Fighter" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(0, 1)}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <BattleMasterManeuverSelection
                        character={character}
                        featureKey={featureRow.key}
                        isUnlocked={isUnlocked}
                        onPersistCharacter={onPersistCharacter}
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
                          const currentValue = getSorcererMetamagicSelections()[currentIndex] ?? "";
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
                            {buildSkillSelectOptions(
                              skillsOptions,
                              getAvailableRangerDeftExplorerSkills(),
                              getRangerDeftExplorerExpertiseSelection()
                            ).map((option) => (
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
                  ) : featureRow.feature === CLASS_FEATURE.HUNTERS_PREY &&
                    character.className === "Ranger" ? (
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
                        groupName={`hunters-prey-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getRangerHunterPreyChoice()}
                        options={[
                          {
                            key: "colossus-slayer",
                            value: "colossus-slayer",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "horde-breaker",
                            value: "horde-breaker",
                            content: featureDetails.description[2] ?? ""
                          }
                        ]}
                        onChange={updateRangerHunterPreyChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.DEFENSIVE_TACTICS &&
                    character.className === "Ranger" ? (
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
                        groupName={`defensive-tactics-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getRangerHunterDefensiveTacticsChoice()}
                        options={[
                          {
                            key: "escape-the-horde",
                            value: "escape-the-horde",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "multiattack-defense",
                            value: "multiattack-defense",
                            content: featureDetails.description[2] ?? ""
                          }
                        ]}
                        onChange={updateRangerHunterDefensiveTacticsChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.FEY_WANDERER_SPELLS &&
                    character.className === "Ranger" ? (
                    <>
                      <FeatureDescriptionLines
                        featureKey={featureRow.key}
                        lines={featureDetails.description.slice(0, 8)}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                      <FeatureChoiceOptions
                        featureKey={featureRow.key}
                        groupName={`fey-wanderer-gift-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getRangerFeyWandererGiftSelection()}
                        options={rangerFeyWandererGiftOptions}
                        onChange={updateRangerFeyWandererGiftSelection}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.OTHERWORLDLY_GLAMOUR &&
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
                      {getAvailableRangerOtherworldlyGlamourSkills().length > 0 ? (
                        <FeatureChoiceOptions
                          featureKey={featureRow.key}
                          groupName={`otherworldly-glamour-${character.id}`}
                          isUnlocked={isUnlocked}
                          selectedValue={getRangerOtherworldlyGlamourSkillSelection()}
                          options={rangerOtherworldlyGlamourSkillOptions.filter((option) =>
                            getAvailableRangerOtherworldlyGlamourSkills().includes(option.value)
                          )}
                          onChange={updateRangerOtherworldlyGlamourSkillSelection}
                          onOpenKeyword={onOpenKeyword}
                          onOpenFeatReference={onOpenFeatReference}
                          onOpenSpellReference={onOpenSpellReference}
                          onOpenDivinityReference={onOpenDivinityReference}
                        />
                      ) : null}
                    </>
                  ) : isWizardSavantFeature(featureRow.feature) &&
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
                      <WizardSavantFeatureFields
                        character={character}
                        feature={featureRow.feature}
                        featureKey={featureRow.key}
                        isUnlocked={isUnlocked}
                        onPersistCharacter={onPersistCharacter}
                      />
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
                            {buildSkillSelectOptions(
                              wizardScholarSkillOptions,
                              getAvailableWizardScholarSkills(),
                              getWizardScholarSelection()
                            ).map((option) => (
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
                  ) : featureRow.feature === CLASS_FEATURE.TRAINING_IN_WAR_AND_SONG &&
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
                      <WizardBladesingerTrainingInWarAndSongFields
                        character={character}
                        featureKey={featureRow.key}
                        isUnlocked={isUnlocked}
                        onPersistCharacter={onPersistCharacter}
                        recomputeCharacterFeatureProficiencies={
                          recomputeCharacterFeatureProficiencies
                        }
                      />
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.KNIGHTLY_ENVOY &&
                    character.className === "Fighter" ? (
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
                            value={getFighterBanneretKnightlyEnvoyLanguageSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateFighterBanneretKnightlyEnvoyLanguageSelection(
                                event.target.value
                              )
                            }
                          >
                            <option value="">Select a language</option>
                            {getAvailableFighterBanneretKnightlyEnvoyLanguages().map(
                              (proficiency) => (
                                <option
                                  key={`${featureRow.key}-banneret-language-${proficiency}`}
                                  value={proficiency}
                                >
                                  {getProficiencyLabel(proficiency)}
                                </option>
                              )
                            )}
                          </SelectInput>
                        </label>
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>Bonus Skill</span>
                          <SelectInput
                            value={getFighterBanneretKnightlyEnvoySkillSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateFighterBanneretKnightlyEnvoySkillSelection(event.target.value)
                            }
                          >
                            <option value="">Select a skill</option>
                            {buildSkillSelectOptions(
                              fighterBanneretKnightlyEnvoySkillOptions,
                              getAvailableFighterBanneretKnightlyEnvoySkills(),
                              getFighterBanneretKnightlyEnvoySkillSelection()
                            ).map((option) => (
                              <option
                                key={`${featureRow.key}-banneret-skill-${option.skill}`}
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
                  ) : featureRow.feature === CLASS_FEATURE.GENIES_SPLENDOR &&
                    character.className === "Paladin" ? (
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
                          <span className={styles.featureSelectionLabel}>Bonus Skill</span>
                          <SelectInput
                            value={getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updatePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(
                                event.target.value
                              )
                            }
                          >
                            <option value="">Select a skill</option>
                            {buildSkillSelectOptions(
                              paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
                              getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills(),
                              getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection()
                            ).map((option) => (
                              <option
                                key={`${featureRow.key}-noble-genies-skill-${option.skill}`}
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
                  ) : featureRow.feature === CLASS_FEATURE.ASPECT_OF_THE_WILDS &&
                    character.className === "Barbarian" ? (
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
                        groupName={`aspect-of-the-wilds-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getBarbarianWildHeartAspectChoiceForCharacter(character)}
                        options={[
                          {
                            key: "owl",
                            value: "owl",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "panther",
                            value: "panther",
                            content: featureDetails.description[2] ?? ""
                          },
                          {
                            key: "salmon",
                            value: "salmon",
                            content: featureDetails.description[3] ?? ""
                          }
                        ]}
                        onChange={updateBarbarianWildHeartAspectChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
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
                  ) : featureRow.feature === CLASS_FEATURE.BONUS_PROFICIENCIES &&
                    character.className === "Bard" ? (
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
                          {[0, 1, 2].map((slotIndex) => {
                            const currentValue =
                              getBardLoreBonusProficiencySelections()[slotIndex] ?? "";
                            const availableSkills =
                              getAvailableBardLoreBonusProficiencySkills(slotIndex);

                            return (
                              <label
                                key={`${featureRow.key}-bonus-proficiency-slot-${slotIndex}`}
                              className={clsx(
                                styles.featureSelectionField,
                                !isUnlocked && styles.featureOptionRowDisabled
                              )}
                            >
                              <span className={styles.featureSelectionLabel}>
                                Bonus Proficiency {slotIndex + 1}
                              </span>
                              <SelectInput
                                value={currentValue}
                                disabled={!isUnlocked}
                                onChange={(event) =>
                                  updateBardLoreBonusProficiencySelection(
                                    slotIndex,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">Select a skill</option>
                                {buildSkillSelectOptions(
                                  skillsOptions,
                                  availableSkills,
                                  currentValue.length > 0 ? (currentValue as SkillName) : null
                                ).map((option) => (
                                  <option
                                    key={`${featureRow.key}-bonus-proficiency-${option.skill}`}
                                    value={option.skill}
                                    disabled={option.disabled}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </SelectInput>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.MAGICAL_DISCOVERIES &&
                    character.className === "Bard" ? (
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
                          const currentValue =
                            getBardMagicalDiscoveriesSpellSelections()[slotIndex] ?? "";
                          const availableSpells =
                            getAvailableBardMagicalDiscoveriesSpells(slotIndex);

                          return (
                            <label
                              key={`${featureRow.key}-magical-discovery-slot-${slotIndex}`}
                              className={clsx(
                                styles.featureSelectionField,
                                !isUnlocked && styles.featureOptionRowDisabled
                              )}
                            >
                              <span className={styles.featureSelectionLabel}>
                                Magical Discovery {slotIndex + 1}
                              </span>
                              <SelectInput
                                value={currentValue}
                                disabled={!isUnlocked}
                                onChange={(event) =>
                                  updateBardMagicalDiscoveriesSpellSelection(
                                    slotIndex,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">Select a Cleric, Druid, or Wizard spell</option>
                                {availableSpells.map((spell) => (
                                  <option
                                    key={`${featureRow.key}-magical-discovery-${spell.id}`}
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
                  ) : featureRow.feature === CLASS_FEATURE.PRIMAL_LORE &&
                    character.className === "Bard" ? (
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
                          <span className={styles.featureSelectionLabel}>Primal Lore Cantrip</span>
                          <SelectInput
                            value={getBardPrimalLoreCantripSelection()}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateBardPrimalLoreCantripSelection(event.target.value)
                            }
                          >
                            <option value="">Select a Druid cantrip</option>
                            {getAvailableBardPrimalLoreCantrips().map((spell) => (
                              <option
                                key={`${featureRow.key}-primal-lore-cantrip-${spell.id}`}
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
                          <span className={styles.featureSelectionLabel}>Primal Lore Skill</span>
                          <SelectInput
                            value={getBardPrimalLoreSkillSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateBardPrimalLoreSkillSelection(event.target.value)
                            }
                          >
                            <option value="">Select a skill</option>
                            {buildSkillSelectOptions(
                              getBardPrimalLoreSkillOptionsForCharacter(),
                              getAvailableBardPrimalLoreSkills(),
                              getBardPrimalLoreSkillSelection()
                            ).map((option) => (
                              <option
                                key={`${featureRow.key}-primal-lore-skill-${option.skill}`}
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
                  ) : featureRow.feature === CLASS_FEATURE.BLESSINGS_OF_KNOWLEDGE &&
                    character.className === "Cleric" ? (
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
                          <span className={styles.featureSelectionLabel}>
                            Artisan&apos;s Tool
                          </span>
                          <SelectInput
                            value={getKnowledgeDomainBlessingsToolSelection() ?? ""}
                            disabled={!isUnlocked}
                            onChange={(event) =>
                              updateKnowledgeDomainBlessingsToolSelection(event.target.value)
                            }
                          >
                            <option value="">Select a tool</option>
                            {buildToolSelectOptions(
                              artisanToolProficiencies,
                              getAvailableKnowledgeDomainBlessingsTools(),
                              getKnowledgeDomainBlessingsToolSelection()
                            ).map((option) => (
                              <option
                                key={`${featureRow.key}-knowledge-tool-${option.tool}`}
                                value={option.tool}
                                disabled={option.disabled}
                              >
                                {option.label}
                              </option>
                            ))}
                          </SelectInput>
                        </label>
                        {[0, 1].map((slotIndex) => {
                          const currentValue =
                            getKnowledgeDomainBlessingsSkillSelections()[slotIndex] ?? "";
                          const availableSkills =
                            getAvailableKnowledgeDomainBlessingsSkills(slotIndex);

                          return (
                            <label
                              key={`${featureRow.key}-knowledge-blessing-${slotIndex}`}
                              className={clsx(
                                styles.featureSelectionField,
                                !isUnlocked && styles.featureOptionRowDisabled
                              )}
                            >
                              <span className={styles.featureSelectionLabel}>
                                Blessing Skill {slotIndex + 1}
                              </span>
                              <SelectInput
                                value={currentValue}
                                disabled={!isUnlocked}
                                onChange={(event) =>
                                  updateKnowledgeDomainBlessingsSkillSelection(
                                    slotIndex,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">Select a skill</option>
                                {buildSkillSelectOptions(
                                  [SKILL.ARCANA, SKILL.HISTORY, SKILL.NATURE, SKILL.RELIGION],
                                  availableSkills,
                                  currentValue.length > 0 ? (currentValue as SkillName) : null
                                ).map((option) => (
                                  <option
                                    key={`${featureRow.key}-knowledge-skill-${option.skill}`}
                                    value={option.skill}
                                    disabled={option.disabled}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </SelectInput>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.UNFETTERED_MIND &&
                    character.className === "Cleric" ? (
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
                          <span className={styles.featureSelectionLabel}>Unfettered Mind Save</span>
                          <SelectInput
                            value={getKnowledgeDomainUnfetteredMindSavingThrowSelection() ?? ""}
                            disabled={!isUnlocked || isKnowledgeDomainUnfetteredMindLocked()}
                            onChange={(event) =>
                              updateKnowledgeDomainUnfetteredMindSavingThrowSelection(
                                event.target.value
                              )
                            }
                          >
                            <option value="">Select a saving throw</option>
                            {getAvailableKnowledgeDomainUnfetteredMindSavingThrows().map(
                              (proficiency) => (
                                <option
                                  key={`${featureRow.key}-unfettered-mind-${proficiency}`}
                                  value={proficiency}
                                >
                                  {getProficiencyLabel(proficiency)}
                                </option>
                              )
                            )}
                          </SelectInput>
                        </label>
                      </div>
                    </>
                  ) : featureRow.feature === CLASS_FEATURE.IRON_MIND &&
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
                        <label
                          className={clsx(
                            styles.featureSelectionField,
                            !isUnlocked && styles.featureOptionRowDisabled
                          )}
                        >
                          <span className={styles.featureSelectionLabel}>Iron Mind Save</span>
                          <SelectInput
                            value={getRangerGloomStalkerIronMindSavingThrowSelection() ?? ""}
                            disabled={!isUnlocked || isRangerGloomStalkerIronMindLocked()}
                            onChange={(event) =>
                              updateRangerGloomStalkerIronMindSavingThrowSelection(
                                event.target.value
                              )
                            }
                          >
                            <option value="">Select a saving throw</option>
                            {getAvailableRangerGloomStalkerIronMindSavingThrows().map(
                              (proficiency) => (
                                <option
                                  key={`${featureRow.key}-iron-mind-${proficiency}`}
                                  value={proficiency}
                                >
                                  {getProficiencyLabel(proficiency)}
                                </option>
                              )
                            )}
                          </SelectInput>
                        </label>
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
                            const currentValue =
                              getRangerLevel9ExpertiseSelections()[slotIndex] ?? "";
                            const availableSkills =
                              getAvailableRangerLevel9ExpertiseSkills(slotIndex);

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
                                  {buildSkillSelectOptions(
                                    skillsOptions,
                                    availableSkills,
                                    currentValue.length > 0 ? (currentValue as SkillName) : null
                                  ).map((option) => (
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
                            const currentValue =
                              getRogueExpertiseSelections(featureRow.level)[slotIndex] ?? "";
                            const availableSkills = getAvailableRogueExpertiseSkills(
                              featureRow.level,
                              slotIndex
                            );

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
                                  {buildSkillSelectOptions(
                                    skillsOptions,
                                    availableSkills,
                                    currentValue.length > 0 ? (currentValue as SkillName) : null
                                  ).map((option) => (
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
                            const currentValue =
                              getBardExpertiseSelections(featureRow.level)[slotIndex] ?? "";
                            const availableSkills = getAvailableBardExpertiseSkills(
                              featureRow.level,
                              slotIndex
                            );

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
                                  {buildSkillSelectOptions(
                                    skillsOptions,
                                    availableSkills,
                                    currentValue.length > 0 ? (currentValue as SkillName) : null
                                  ).map((option) => (
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
                  ) : featureRow.feature === CLASS_FEATURE.DREAD_ALLEGIANCE &&
                    character.className === "Rogue" ? (
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
                        groupName={`dread-allegiance-${character.id}`}
                        isUnlocked={isUnlocked}
                        selectedValue={getRogueScionOfTheThreeDreadAllegianceChoice()}
                        options={[
                          {
                            key: "bane",
                            value: "bane",
                            content: featureDetails.description[1] ?? ""
                          },
                          {
                            key: "bhaal",
                            value: "bhaal",
                            content: featureDetails.description[2] ?? ""
                          },
                          {
                            key: "myrkul",
                            value: "myrkul",
                            content: featureDetails.description[3] ?? ""
                          }
                        ]}
                        onChange={updateRogueScionOfTheThreeDreadAllegianceChoice}
                        onOpenKeyword={onOpenKeyword}
                        onOpenFeatReference={onOpenFeatReference}
                        onOpenSpellReference={onOpenSpellReference}
                        onOpenDivinityReference={onOpenDivinityReference}
                      />
                    </>
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
                </>
              ) : (
                <p className={styles.emptyFeatureText}>Details coming soon.</p>
              )}
            </FeatureDisclosureRow>
          );
        })}
      </ul>

      {isWildShapeModalOpen ? (
        <DruidWildShapeMonsterModal
          character={character}
          selectedMonsters={getDruidWildShapeKnownForms()}
          onSelectedMonstersChange={updateDruidWildShapeKnownForms}
          onClose={() => setIsWildShapeModalOpen(false)}
        />
      ) : null}

      {selectedWildShapeMonster ? (
        <MonsterEntryDrawer
          monster={selectedWildShapeMonster}
          status="ready"
          onClose={() => setSelectedWildShapeMonster(null)}
          badgeLabel="Wild Shape"
          contentSurface="plain"
          showHeaderDivider
        />
      ) : null}
    </>
  );
}

export default ClassFeatureList;
