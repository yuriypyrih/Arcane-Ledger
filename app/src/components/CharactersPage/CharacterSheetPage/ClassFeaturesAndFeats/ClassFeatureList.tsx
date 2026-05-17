import clsx from "clsx";
import { Pencil, Plus } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  getFeatureTrackingState,
  type DivinityEntry,
  type SpellEntry
} from "../../../../codex/entries";
import SelectInput from "../../FormInputs/SelectInput";
import InputRequiredBadge from "../../../InputRequiredBadge";
import {
  getBarbarianPrimalKnowledgeSkillOptionsForCharacter,
  getBarbarianPrimalKnowledgeSkillSelectionForCharacter,
  getBarbarianWildHeartAspectChoiceForCharacter,
  getBardPrimalLoreSkillOptionsForCharacter,
  getClericBlessedStrikesChoiceForCharacter,
  fighterBanneretKnightlyEnvoySkillOptions,
  getDruidCircleOfTheLandChoiceForCharacter,
  getDruidElementalFuryChoiceForCharacter,
  getDruidPrimalOrderChoiceForCharacter,
  sorcererDraconicElementalAffinityDamageTypeOptions,
  warlockFiendPatronFiendishResilienceDamageTypeOptions,
  getWeaponMasteryOptionsForCharacter,
  getWeaponMasterySelectionCountForCharacter,
  getWeaponMasterySelectionsForCharacter,
  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
  rangerFeyWandererGiftOptions,
  rangerOtherworldlyGlamourSkillOptions,
  setBarbarianPrimalKnowledgeSkillSelectionForCharacter,
  setBarbarianWildHeartAspectChoiceForCharacter,
  setWeaponMasterySelectionsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  artisanToolProficiencies,
  getProficiencyLabel,
  getWeaponProficiencyLabel,
  skillsOptions
} from "../../../../pages/CharactersPage/proficiency";
import { getSpellSelectionInputStatusForCharacter } from "../../../../pages/CharactersPage/spellSelection";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { isWizardSavantFeature } from "../../../../pages/CharactersPage/classFeatures/wizard/savant";
import type {
  Character,
  CharacterFeatEntry,
  MonsterRecord,
  SkillName,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { SKILL } from "../../../../types";
import { formatCodexLabel } from "../../../../utils/codex";
import { FeatureDisclosureRow, featureDisclosureStyles } from "../../../FeatureDisclosure";
import { MonsterEntryDrawer } from "../../../MonsterEntryRenderer";
import { CharacterSheetSectionProfiler } from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetSectionProfiler";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./ClassFeaturesAndFeats.module.css";
import BattleMasterManeuverSelection from "./BattleMasterManeuverSelection";
import FeatureChoiceOptions from "./ClassFeatureChoiceOptions";
import DruidWildShapeMonsterModal from "./DruidWildShapeMonsterModal";
import EldritchInvocationList from "./EldritchInvocationList";
import WizardBladesingerTrainingInWarAndSongFields from "./WizardBladesingerTrainingInWarAndSongFields";
import WizardSavantFeatureFields from "./WizardSavantFeatureFields";
import {
  buildSkillSelectOptions,
  buildToolSelectOptions,
  getSelectableUnproficientSkillOptions,
  isFeatChoiceFeature,
  renderDescriptionLine,
  updateSelectionAtIndex,
  wizardScholarSkillOptions
} from "./helpers";
import {
  createBardFeatureChoiceModel,
  createClericFeatureChoiceModel,
  createDruidFeatureChoiceModel,
  createFighterFeatureChoiceModel,
  createPaladinFeatureChoiceModel,
  createRangerFeatureChoiceModel,
  createRogueFeatureChoiceModel,
  createSorcererFeatureChoiceModel,
  createWarlockFeatureChoiceModel,
  createWizardFeatureChoiceModel,
  recomputeCharacterFeatureProficiencies
} from "./choiceModels";
import type { FeatureRow, TrackingButtonRenderer } from "./types";
import { renderClassFeatureContent } from "./ClassFeatureListFeatureContent";
import type {
  WarlockEldritchInvocationInputStatus,
  WarlockEldritchInvocationOption
} from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";

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
  onOpenInvocationReference: (option: WarlockEldritchInvocationOption) => void;
  onOpenEldritchInvocationEditor: () => void;
  onPersistCharacter: PersistCharacterUpdater;
  renderTrackingButton: TrackingButtonRenderer;
  eldritchInvocationInputStatus: WarlockEldritchInvocationInputStatus;
  learnedInvocationOptions: WarlockEldritchInvocationOption[];
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

type ClassFeatureRowProps = {
  bodyClassName: string;
  bodyId: string;
  character: Character;
  featureKey: string;
  featureRow: FeatureRow;
  headerMeta: ReactNode;
  isExpanded: boolean;
  isInputRequired: boolean;
  linkedFeat: CharacterFeatEntry | null;
  onToggleFeature: (featureKey: string) => void;
  renderBody: () => ReactNode;
  showDivider: boolean;
  title: ReactNode;
  trackingButton: ReactNode;
};

const ClassFeatureRow = memo(
  function ClassFeatureRow({
    bodyClassName,
    bodyId,
    featureKey,
    headerMeta,
    isExpanded,
    onToggleFeature,
    renderBody,
    showDivider,
    title,
    trackingButton
  }: ClassFeatureRowProps) {
    const [isBodyRenderReady, setIsBodyRenderReady] = useState(false);
    const handleToggle = useCallback(
      () => onToggleFeature(featureKey),
      [featureKey, onToggleFeature]
    );

    useEffect(() => {
      if (!isExpanded) {
        setIsBodyRenderReady(false);
        return;
      }

      if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
        setIsBodyRenderReady(true);
        return;
      }

      const frameId = window.requestAnimationFrame(() => {
        setIsBodyRenderReady(true);
      });

      return () => window.cancelAnimationFrame(frameId);
    }, [featureKey, isExpanded]);

    return (
      <FeatureDisclosureRow
        as="li"
        title={title}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        bodyId={bodyId}
        bodyClassName={bodyClassName}
        trackingButton={trackingButton}
        headerMeta={headerMeta}
        showDivider={showDivider}
      >
        {isBodyRenderReady ? (
          <CharacterSheetSectionProfiler id={`class-feature-body:${featureKey}`}>
            {renderBody()}
          </CharacterSheetSectionProfiler>
        ) : null}
      </FeatureDisclosureRow>
    );
  },
  (previous, next) =>
    previous.character === next.character &&
    previous.featureKey === next.featureKey &&
    previous.featureRow === next.featureRow &&
    previous.isExpanded === next.isExpanded &&
    previous.isInputRequired === next.isInputRequired &&
    previous.linkedFeat === next.linkedFeat &&
    previous.onToggleFeature === next.onToggleFeature &&
    previous.showDivider === next.showDivider
);

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
  onOpenInvocationReference,
  onOpenEldritchInvocationEditor,
  onPersistCharacter,
  renderTrackingButton,
  eldritchInvocationInputStatus,
  learnedInvocationOptions,
  getCharacterFeatSummary,
  getFeatDefinition
}: ClassFeatureListProps) {
  const [isWildShapeModalOpen, setIsWildShapeModalOpen] = useState(false);
  const [selectedWildShapeMonster, setSelectedWildShapeMonster] = useState<MonsterRecord | null>(
    null
  );
  const spellSelectionInputStatus = useMemo(
    () => getSpellSelectionInputStatusForCharacter(character),
    [character]
  );
  const expandedFeatureKeySet = useMemo(() => new Set(expandedFeatureKeys), [expandedFeatureKeys]);
  const bardChoices = useMemo(
    () => createBardFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const clericChoices = useMemo(
    () => createClericFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const druidChoices = useMemo(
    () => createDruidFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const fighterChoices = useMemo(
    () => createFighterFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const paladinChoices = useMemo(
    () => createPaladinFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const rangerChoices = useMemo(
    () => createRangerFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const rogueChoices = useMemo(
    () => createRogueFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const sorcererChoices = useMemo(
    () => createSorcererFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const warlockChoices = useMemo(
    () => createWarlockFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const wizardChoices = useMemo(
    () => createWizardFeatureChoiceModel({ character, onPersistCharacter }),
    [character, onPersistCharacter]
  );
  const {
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
  } = bardChoices;
  const {
    getAvailableKnowledgeDomainBlessingsSkills,
    getAvailableKnowledgeDomainBlessingsTools,
    getAvailableKnowledgeDomainUnfetteredMindSavingThrows,
    getClericDivineOrderChoiceForCharacter,
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
    updateKnowledgeDomainUnfetteredMindSavingThrowSelection
  } = clericChoices;
  const {
    getDruidWildShapeKnownForms,
    getDruidWildShapeRules,
    updateDruidCircleOfTheLandChoice,
    updateDruidElementalFuryChoice,
    updateDruidPrimalOrderChoice,
    updateDruidWildShapeKnownForms
  } = druidChoices;
  const {
    getAvailableFighterBanneretKnightlyEnvoyLanguages,
    getAvailableFighterBanneretKnightlyEnvoySkills,
    getFighterBanneretKnightlyEnvoyLanguageSelection,
    getFighterBanneretKnightlyEnvoySkillSelection,
    isFighterBanneretKnightlyEnvoyInputRequired,
    isFighterBattleMasterManeuverOptionsInputRequired,
    updateFighterBanneretKnightlyEnvoyLanguageSelection,
    updateFighterBanneretKnightlyEnvoySkillSelection
  } = fighterChoices;
  const {
    getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills,
    getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection,
    isPaladinOathOfTheNobleGeniesGeniesSplendorInputRequired,
    updatePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection
  } = paladinChoices;
  const {
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
  } = rangerChoices;
  const {
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
  } = rogueChoices;
  const {
    getAvailableSorcererMetamagicOptions,
    getSorcererDraconicElementalAffinityDamageTypeSelection,
    getSorcererMetamagicSelections,
    getSorcererMetamagicStartIndex,
    isSorcererDraconicElementalAffinityInputRequired,
    isSorcererMetamagicInputRequired,
    updateSorcererDraconicElementalAffinityDamageTypeSelection,
    updateSorcererMetamagicSelection
  } = sorcererChoices;
  const {
    getAvailableWarlockMysticArcanumSpells,
    getWarlockFiendishResilienceDamageTypeSelection,
    getWarlockMysticArcanumSelection,
    getWarlockMysticArcanumSpellLevel,
    isWarlockFiendishResilienceInputRequired,
    isWarlockMysticArcanumInputRequired,
    updateWarlockFiendishResilienceDamageTypeSelection,
    updateWarlockMysticArcanumSelection
  } = warlockChoices;
  const {
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
  } = wizardChoices;

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

  function getBarbarianPrimalKnowledgeSelection(): SkillName | null {
    return getBarbarianPrimalKnowledgeSkillSelectionForCharacter(character);
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
          const isFeatureExpanded = expandedFeatureKeySet.has(featureRow.key);
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
            (featureRow.feature === CLASS_FEATURE.SPELLCASTING ||
              featureRow.feature === CLASS_FEATURE.PACT_MAGIC) &&
            spellSelectionInputStatus.hasInputRequired;
          const isEldritchInvocationInputRequired =
            isUnlocked &&
            featureRow.feature === CLASS_FEATURE.ELDRITCH_INVOCATIONS &&
            character.className === "Warlock" &&
            eldritchInvocationInputStatus.hasInputRequired;
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
            isEldritchInvocationInputRequired ||
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
              featureRow.feature === CLASS_FEATURE.DIVINE_ORDER &&
              character.className === "Cleric" &&
              getClericDivineOrderChoiceForCharacter(character) === null) ||
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
            <ClassFeatureRow
              key={featureRow.key}
              character={character}
              featureKey={featureRow.key}
              featureRow={featureRow}
              title={
                <span className={styles.featureTitleContent}>
                  <span>{`Level ${featureRow.level}: ${formatCodexLabel(featureRow.feature)}`}</span>
                  {featureRow.isSubclass ? (
                    <span className={styles.subclassFeatureIndicator}>Subclass</span>
                  ) : null}
                </span>
              }
              isExpanded={isFeatureExpanded}
              onToggleFeature={onToggleFeature}
              bodyId={featurePanelId}
              bodyClassName={clsx(
                featureDisclosureStyles.descriptionList,
                styles.featureDescriptionList
              )}
              trackingButton={renderTrackingButton(getFeatureTrackingState(featureDetails))}
              headerMeta={isInputRequired ? <InputRequiredBadge /> : null}
              isInputRequired={isInputRequired}
              linkedFeat={linkedFeat}
              showDivider={index > 0}
              renderBody={() =>
                renderClassFeatureContent({
                  BattleMasterManeuverSelection,
                  CLASS_FEATURE,
                  EldritchInvocationList,
                  FeatureChoiceOptions,
                  FeatureDescriptionLines,
                  Pencil,
                  Plus,
                  SKILL,
                  SelectInput,
                  WizardBladesingerTrainingInWarAndSongFields,
                  WizardSavantFeatureFields,
                  artisanToolProficiencies,
                  blessedStrikesChoice,
                  buildSkillSelectOptions,
                  buildToolSelectOptions,
                  character,
                  clsx,
                  druidElementalFuryChoice,
                  druidWildShapeKnownForms,
                  druidWildShapeRules,
                  featureDetails,
                  featureRow,
                  fighterBanneretKnightlyEnvoySkillOptions,
                  formatCodexLabel,
                  getAvailableBardExpertiseSkills,
                  getAvailableBardLoreBonusProficiencySkills,
                  getAvailableBardMagicalDiscoveriesSpells,
                  getAvailableBardPrimalLoreCantrips,
                  getAvailableBardPrimalLoreSkills,
                  getAvailableFighterBanneretKnightlyEnvoyLanguages,
                  getAvailableFighterBanneretKnightlyEnvoySkills,
                  getAvailableKnowledgeDomainBlessingsSkills,
                  getAvailableKnowledgeDomainBlessingsTools,
                  getAvailableKnowledgeDomainUnfetteredMindSavingThrows,
                  getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills,
                  getAvailableRangerDeftExplorerLanguages,
                  getAvailableRangerDeftExplorerSkills,
                  getAvailableRangerGloomStalkerIronMindSavingThrows,
                  getAvailableRangerLevel9ExpertiseSkills,
                  getAvailableRangerOtherworldlyGlamourSkills,
                  getAvailableRogueExpertiseSkills,
                  getAvailableRogueThievesCantLanguages,
                  getAvailableSorcererMetamagicOptions,
                  getAvailableWarlockMysticArcanumSpells,
                  getAvailableWeaponMasteryOptions,
                  getAvailableWizardScholarSkills,
                  getAvailableWizardSignatureSpells,
                  getAvailableWizardSpellMasterySpells,
                  getBarbarianPrimalKnowledgeOptions,
                  getBarbarianPrimalKnowledgeSelection,
                  getBarbarianWildHeartAspectChoiceForCharacter,
                  getBardExpertiseSelections,
                  getBardLoreBonusProficiencySelections,
                  getBardMagicalDiscoveriesSpellSelections,
                  getBardPrimalLoreCantripSelection,
                  getBardPrimalLoreSkillOptionsForCharacter,
                  getBardPrimalLoreSkillSelection,
                  getClericDivineOrderChoiceForCharacter,
                  getDamageTypeChoiceContent,
                  getDruidCircleOfTheLandChoiceForCharacter,
                  getDruidPrimalOrderChoiceForCharacter,
                  getFighterBanneretKnightlyEnvoyLanguageSelection,
                  getFighterBanneretKnightlyEnvoySkillSelection,
                  getKnowledgeDomainBlessingsSkillSelections,
                  getKnowledgeDomainBlessingsToolSelection,
                  getKnowledgeDomainUnfetteredMindSavingThrowSelection,
                  getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection,
                  getProficiencyLabel,
                  getRangerDeftExplorerExpertiseSelection,
                  getRangerDeftExplorerLanguageSelections,
                  getRangerFeyWandererGiftSelection,
                  getRangerGloomStalkerIronMindSavingThrowSelection,
                  getRangerHunterDefensiveTacticsChoice,
                  getRangerHunterPreyChoice,
                  getRangerLevel9ExpertiseSelections,
                  getRangerOtherworldlyGlamourSkillSelection,
                  getRogueExpertiseSelections,
                  getRogueScionOfTheThreeDreadAllegianceChoice,
                  getRogueThievesCantLanguageSelection,
                  getSorcererDraconicElementalAffinityDamageTypeSelection,
                  getSorcererMetamagicSelections,
                  getSorcererMetamagicStartIndex,
                  getWarlockFiendishResilienceDamageTypeSelection,
                  getWarlockMysticArcanumSelection,
                  getWarlockMysticArcanumSpellLevel,
                  getWeaponMasterySelectionCountForCharacter,
                  getWeaponMasterySelections,
                  getWeaponProficiencyLabel,
                  getWizardScholarSelection,
                  getWizardSignatureSpellSelections,
                  getWizardSpellMasterySelection,
                  isEldritchInvocationInputRequired,
                  isFeatChoiceFeature,
                  isKnowledgeDomainUnfetteredMindLocked,
                  isRangerGloomStalkerIronMindLocked,
                  isSpellcastingFeatureInputRequired,
                  isUnlocked,
                  isWarlockFiendishResilienceInputRequired,
                  isWizardSavantFeature,
                  learnedInvocationOptions,
                  linkedFeat,
                  linkedFeatDefinition,
                  linkedFeatSummary,
                  eldritchInvocationInputStatus,
                  onOpenDivinityReference,
                  onOpenEldritchInvocationEditor,
                  onOpenFeatEditorForFeature,
                  onOpenFeatReference,
                  onOpenInvocationReference,
                  onOpenKeyword,
                  onOpenSpellReference,
                  onPersistCharacter,
                  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
                  rangerFeyWandererGiftOptions,
                  rangerOtherworldlyGlamourSkillOptions,
                  recomputeCharacterFeatureProficiencies,
                  renderTrackingButton,
                  setIsWildShapeModalOpen,
                  setSelectedWildShapeMonster,
                  shared,
                  skillsOptions,
                  sorcererDraconicElementalAffinityDamageTypeOptions,
                  spellSelectionInputStatus,
                  styles,
                  updateBarbarianPrimalKnowledgeSelection,
                  updateBarbarianWildHeartAspectChoice,
                  updateBardExpertiseSelection,
                  updateBardLoreBonusProficiencySelection,
                  updateBardMagicalDiscoveriesSpellSelection,
                  updateBardPrimalLoreCantripSelection,
                  updateBardPrimalLoreSkillSelection,
                  updateClericBlessedStrikesChoice,
                  updateClericDivineOrderChoice,
                  updateDruidCircleOfTheLandChoice,
                  updateDruidElementalFuryChoice,
                  updateDruidPrimalOrderChoice,
                  updateFighterBanneretKnightlyEnvoyLanguageSelection,
                  updateFighterBanneretKnightlyEnvoySkillSelection,
                  updateKnowledgeDomainBlessingsSkillSelection,
                  updateKnowledgeDomainBlessingsToolSelection,
                  updateKnowledgeDomainUnfetteredMindSavingThrowSelection,
                  updatePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection,
                  updateRangerDeftExplorerExpertiseSelection,
                  updateRangerDeftExplorerLanguageSelection,
                  updateRangerFeyWandererGiftSelection,
                  updateRangerGloomStalkerIronMindSavingThrowSelection,
                  updateRangerHunterDefensiveTacticsChoice,
                  updateRangerHunterPreyChoice,
                  updateRangerLevel9ExpertiseSelection,
                  updateRangerOtherworldlyGlamourSkillSelection,
                  updateRogueExpertiseSelection,
                  updateRogueScionOfTheThreeDreadAllegianceChoice,
                  updateRogueThievesCantLanguageSelection,
                  updateSorcererDraconicElementalAffinityDamageTypeSelection,
                  updateSorcererMetamagicSelection,
                  updateWarlockFiendishResilienceDamageTypeSelection,
                  updateWarlockMysticArcanumSelection,
                  updateWeaponMasterySelection,
                  updateWizardScholarSelection,
                  updateWizardSignatureSpellSelection,
                  updateWizardSpellMasterySelection,
                  warlockFiendPatronFiendishResilienceDamageTypeOptions,
                  wizardScholarSkillOptions
                })
              }
            />
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
