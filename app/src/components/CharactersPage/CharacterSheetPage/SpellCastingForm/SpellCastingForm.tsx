import clsx from "clsx";
import { CircleHelp, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import InputRequiredBadge from "../../../InputRequiredBadge";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import CharacterSpellDrawer, { type CharacterSpellDrawerMode } from "./CharacterSpellDrawer";
import SpellMainListRow from "./SpellMainListRow";
import SpellCastingGuideModal from "./SpellCastingGuideModal";
import SpellManagementModal from "./SpellManagementModal";
import SpellSlotActionSheet from "./SpellSlotActionSheet";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../codex/classes";
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import {
  CLASS_FEATURE,
  MAGIC_SCHOOL,
  getSpellEntryById,
  type SpellEntry
} from "../../../../codex/entries";
import type { Character, CharacterCompanion } from "../../../../types";
import {
  normalizeRoundTracker,
  shouldTrackRoundScopedResources,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import { ACTION_CATEGORY } from "../../../../pages/CharactersPage/actionEconomy";
import {
  applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter,
  applySpellCastFeatureEffectsForCharacter,
  activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter,
  consumeDruidStarMapGuidingBoltUseForCharacter,
  consumeDruidNaturalRecoveryUseForCharacter,
  consumeBlessingOfMoonlightUseForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeRangerFeyReinforcementsUseForCharacter,
  consumeWizardIllusionistPhantasmalCreaturesUseForCharacter,
  consumeRangerWinterWalkerFrozenHauntUseForCharacter,
  consumeRangerMistyWandererUseForCharacter,
  consumeWarlockStepsOfTheFeyUseForCharacter,
  consumeSharedEconomyMultiForCharacterAction,
  getDruidStarMapGuidingBoltUsesRemainingForCharacter,
  getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter,
  hasActiveMantleOfMajestyForCharacter,
  createEconomyMultiContextForSpell,
  getSpellSourceLabels,
  mergeSpellSourceMaps,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  consumeWizardSignatureSpellFreeCastForCharacter,
  getWizardSignatureSpellIdsForCharacter,
  hasWizardSignatureSpellFreeCastAvailableForCharacter,
  getWizardSpellMasterySpellIdsForCharacter,
  getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse,
  warriorOfTheOpenHandSubclassId
} from "../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import {
  circleOfTheMoonSpellIdsByLevel,
  circleOfTheLandSpellIdsByLand,
  getDruidCircleOfTheMoonSpellIdsForCharacter,
  getDruidCircleOfTheLandSpellIdsForCharacter
} from "../../../../pages/CharactersPage/classFeatures/subclasses";
import {
  getClericLifeDomainHealingSpellEntry,
  getClericMindMagicSpellEntry
} from "../../../../pages/CharactersPage/classFeatures/cleric/cleric";
import { getDruidCircleOfTheStarsChaliceHealingSpellEntry } from "../../../../pages/CharactersPage/classFeatures/druid/subclasses/druidCircleOfTheStarsDescriptions";
import {
  createChargesAndUsageHeaderTags,
  createChargesCardUsage,
  createChargesHeaderTag,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createNamedUsageHeaderTags
} from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  getSorceryPointsRemaining,
  spendSorceryPoints
} from "../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import {
  canUseSorcererSubclassPsionicSorceryForSpell,
  canUseSorcererSubclassTamedSurgeForSpell,
  consumeSorcererSubclassTamedSurgeUseForCharacter
} from "../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses";
import {
  getAlwaysPreparedSpellIds,
  getCantripSelectionOptionsForCharacter,
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  areSpellcastingRulesEnforcedForCharacter,
  hasBuiltInSpellcastingForCharacter,
  hasClassFeatureForCharacter,
  isSpellcastingClass,
  normalizeTrackedSpellIds,
  normalizePreparedSpellIds,
  normalizeSpellbookSpellIds,
  normalizeSpellSlotsExpended,
  usesFlexibleSpellcastingRulesForCharacter,
  usesSpellbookForCharacter,
  usesPreparedSpellsForCharacter
} from "../../../../pages/CharactersPage/spellcasting";
import {
  CUSTOM_CLASS_SPELL_SLOT_MAXIMUM,
  getCharacterClassRulesConfig,
  isCustomClassName,
  normalizeCharacterClassRulesConfig
} from "../../../../pages/CharactersPage/customClass";
import { hasSpellcastingForCharacter } from "../../../../pages/CharactersPage/spellcastingAvailability";
import { getSpellSelectionInputStatusForCharacter } from "../../../../pages/CharactersPage/spellSelection";
import {
  consumeFeyTouchedFreeCastForCharacter,
  consumeMagicInitiateFreeCastForCharacter,
  consumeRitualCasterQuickRitualForCharacter,
  consumeShadowTouchedFreeCastForCharacter,
  consumeTelepathicDetectThoughtsFreeCastForCharacter,
  canUseEmeraldEnclaveFledglingSpeakWithAnimalsForSpell,
  canUseBoonOfSpellRecallFreeCastingForSpell,
  getFeyTouchedFreeCastStateForCharacter,
  getMagicInitiateFreeCastStateForCharacter,
  getRitualCasterQuickRitualStateForCharacter,
  getShadowTouchedFreeCastStateForCharacter,
  getSpellfireSparkSpellfireFlameStateForCharacter,
  applyFeatureSpellCastEffectsForCharacter,
  getTelepathicDetectThoughtsFreeCastStateForCharacter
} from "../../../../pages/CharactersPage/feats/runtime";
import {
  appendGoliathAttackDescriptionAddition,
  consumeGoliathGiantAncestryUseForCharacter,
  consumeGnomeSpeakWithAnimalsFreeCastForCharacter,
  consumeTieflingFiendishLegacyFreeCastForCharacter,
  getGoliathAttackDamageDetail,
  getGoliathAttackOptionStateForCharacter,
  getGnomeSpeakWithAnimalsFreeCastStateForCharacter,
  getSpeciesAlwaysPreparedCantripEntriesForCharacter,
  getSpeciesAlwaysPreparedSpellIdsForCharacter,
  getSpeciesAlwaysPreparedSpellSourceMapForCharacter,
  getSpeciesGrantedCantripEntriesForCharacter,
  getSpeciesSpellcastingAbilityForCharacter,
  getTieflingFiendishLegacyFreeCastStateForCharacter
} from "../../../../pages/CharactersPage/species";
import { applySpellConcentrationToStatusEntries } from "../../../../pages/CharactersPage/statusEntries";
import { fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId } from "../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterPsiWarriorShared";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { hasWarlockArchfeyPatronBewitchingMagicFeature } from "../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockArchfeyPatron";
import {
  canUseWarlockCelestialPatronRadiantSoulForSpell,
  getWarlockCelestialPatronRadiantSoulDamageDetail,
  spellSupportsWarlockCelestialPatronRadiantSoul
} from "../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockCelestialPatron";
import {
  applyWizardEvokerOverchannelUse,
  canUseWizardEvokerOverchannelForSpellSlot,
  getWizardEvokerOverchannelNecroticDamageFormula,
  spellQualifiesForWizardEvokerOverchannel
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardEvoker";
import {
  clampNumber,
  formatSpellGroupTitle,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getRoundTrackerResourceForSpell } from "../../../../pages/CharactersPage/shared";
import {
  getSpellDamageDetailForCharacter,
  getSpellOutcomeSummaryForCharacter
} from "../../../../pages/CharactersPage/spellOutcome";
import { getSpellAttackRollFormulaForCharacter } from "../../../../pages/CharactersPage/shared/spellFormulas";
import {
  applySpellImplementationForCharacter,
  getSpellImplementationRollEffectsForCharacter,
  type SpellImplementationCastSource,
  type SpellImplementationOptionValues
} from "../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetActionButton from "../SheetActionButton";
import SheetSurface from "../SheetSurface";
import ActionButton from "../../../ActionButton";
import { getActionShapeForEconomyType } from "../GameplayForm/gameplayWidgetUtils";
import { getSpellActionPathStates, getSpellActionPathWarning } from "../spellActionPaths";
import {
  appendSpellSummonCompanionsForCast,
  canAddSpellSummonCompanionsForCast
} from "../../../../pages/CharactersPage/spellSummons";
import styles from "./SpellCastingForm.module.css";
import {
  applyRolledTemporaryHitPointsToCharacter,
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../GameplayForm/gameplayStateUtils";
import { renderSpellCastingForm } from "./SpellCastingFormRenderer";
import { castSelectedSpellWithContext } from "./castSelectedSpell";
import {
  createSpellRowGroups,
  groupSpellsByLevel,
  type SpellListRowActionShapes
} from "./spellcastingListModel";

type SpellCastingFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SelectedSpellViewMode = CharacterSpellDrawerMode;

function grantMonkFleetStepFollowUpForSpellCastIfEligible(
  character: Character,
  roundTrackerResource: RoundTrackerResource | null
): Character {
  return shouldTrackRoundScopedResources(character.roundTracker) &&
    roundTrackerResource === "bonusAction" &&
    character.className === "Monk" &&
    character.subclassId === warriorOfTheOpenHandSubclassId &&
    character.level >= 11
    ? grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse(character)
    : character;
}
type WizardSpellViewFilter = "all" | "prepared";
const wizardSignatureSpellLevel = 3;
const frozenHauntFallbackSpellSlotMinimumLevel = 4;
const guidingBoltSpellId = "spell-guiding-bolt";
const huntersMarkSpellId = "spell-hunters-mark";
const mistyStepSpellId = "spell-misty-step";
const summonFeySpellId = "spell-summon-fey";
const telekinesisSpellId = "spell-telekinesis";

function SpellCastingForm({ character, className, onPersistCharacter }: SpellCastingFormProps) {
  const isCustomClass = isCustomClassName(character.className);
  const hasBuiltInSpellcastingRules = hasBuiltInSpellcastingForCharacter(
    character.className,
    character.level,
    character.subclassId
  );
  const spellcastingRulesEnforced = areSpellcastingRulesEnforcedForCharacter(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const spellcastingRulesEnforcementDisabled = isCustomClass || !hasBuiltInSpellcastingRules;
  const usesManualSpellcastingRules = usesFlexibleSpellcastingRulesForCharacter(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const hasClassSpellcasting = isSpellcastingClass(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedSpellViewMode, setSelectedSpellViewMode] =
    useState<SelectedSpellViewMode>("standard");
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [useBeguilingMagicOnSelectedSpell, setUseBeguilingMagicOnSelectedSpell] = useState(false);
  const [useBlessingOfMoonlightOnSelectedSpell, setUseBlessingOfMoonlightOnSelectedSpell] =
    useState(false);
  const [useStarMapOnSelectedSpell, setUseStarMapOnSelectedSpell] = useState(false);
  const [useMagicInitiateOnSelectedSpell, setUseMagicInitiateOnSelectedSpell] = useState(false);
  const [useForestGnomeOnSelectedSpell, setUseForestGnomeOnSelectedSpell] = useState(false);
  const [useFiendishLegacyOnSelectedSpell, setUseFiendishLegacyOnSelectedSpell] = useState(false);
  const [useGoliathAncestryOnSelectedSpell, setUseGoliathAncestryOnSelectedSpell] = useState(false);
  const [useFeyMagicOnSelectedSpell, setUseFeyMagicOnSelectedSpell] = useState(false);
  const [useQuickRitualOnSelectedSpell, setUseQuickRitualOnSelectedSpell] = useState(false);
  const [useShadowMagicOnSelectedSpell, setUseShadowMagicOnSelectedSpell] = useState(false);
  const [useDetectThoughtsOnSelectedSpell, setUseDetectThoughtsOnSelectedSpell] = useState(false);
  const [useBoonOfSpellRecallOnSelectedSpell, setUseBoonOfSpellRecallOnSelectedSpell] =
    useState(false);
  const [
    useEmeraldEnclaveFledglingFreeUseOnSelectedSpell,
    setUseEmeraldEnclaveFledglingFreeUseOnSelectedSpell
  ] = useState(false);
  const [useFeyReinforcementsOnSelectedSpell, setUseFeyReinforcementsOnSelectedSpell] =
    useState(false);
  const [usePhantasmalCreaturesOnSelectedSpell, setUsePhantasmalCreaturesOnSelectedSpell] =
    useState(false);
  const [useStepsOfTheFeyOnSelectedSpell, setUseStepsOfTheFeyOnSelectedSpell] = useState(false);
  const [useBewitchingMagicOnSelectedSpell, setUseBewitchingMagicOnSelectedSpell] = useState(false);
  const [useMistyWandererOnSelectedSpell, setUseMistyWandererOnSelectedSpell] = useState(false);
  const [
    useFeyReinforcementsNoConcentrationOnSelectedSpell,
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell
  ] = useState(false);
  const [useNaturalRecoveryOnSelectedSpell, setUseNaturalRecoveryOnSelectedSpell] = useState(false);
  const [usePsionicSorceryOnSelectedSpell, setUsePsionicSorceryOnSelectedSpell] = useState(false);
  const [useTamedSurgeOnSelectedSpell, setUseTamedSurgeOnSelectedSpell] = useState(false);
  const [useTelekineticMasterOnSelectedSpell, setUseTelekineticMasterOnSelectedSpell] =
    useState(false);
  const [useRadiantSoulOnSelectedSpell, setUseRadiantSoulOnSelectedSpell] = useState(false);
  const [useOverchannelOnSelectedSpell, setUseOverchannelOnSelectedSpell] = useState(false);
  const [useFrozenHauntOnSelectedSpell, setUseFrozenHauntOnSelectedSpell] = useState(false);
  const [selectedFrozenHauntFallbackSlotLevel, setSelectedFrozenHauntFallbackSlotLevel] =
    useState(4);
  const [isSelectedSpellDiceRollerSettingsOpen, setIsSelectedSpellDiceRollerSettingsOpen] =
    useState(false);
  const [activeSpellSlotSheetLevel, setActiveSpellSlotSheetLevel] = useState<number | null>(null);
  const [isSpellManagementModalOpen, setIsSpellManagementModalOpen] = useState(false);
  const [isSpellcastingGuideOpen, setIsSpellcastingGuideOpen] = useState(false);
  const [activeWizardSpellFilter, setActiveWizardSpellFilter] =
    useState<WizardSpellViewFilter>("prepared");
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(
    Boolean(
      isSpellManagementModalOpen ||
      isSpellcastingGuideOpen ||
      activeSpellSlotSheetLevel !== null ||
      selectedSpell
    )
  );

  const closeSelectedSpell = useCallback(() => {
    setSelectedSpell(null);
    setSelectedSpellViewMode("standard");
    setUseBeguilingMagicOnSelectedSpell(false);
    setUseBlessingOfMoonlightOnSelectedSpell(false);
    setUseFeyReinforcementsOnSelectedSpell(false);
    setUseMagicInitiateOnSelectedSpell(false);
    setUseForestGnomeOnSelectedSpell(false);
    setUseFiendishLegacyOnSelectedSpell(false);
    setUseGoliathAncestryOnSelectedSpell(false);
    setUseFeyMagicOnSelectedSpell(false);
    setUseQuickRitualOnSelectedSpell(false);
    setUseShadowMagicOnSelectedSpell(false);
    setUseDetectThoughtsOnSelectedSpell(false);
    setUseBoonOfSpellRecallOnSelectedSpell(false);
    setUsePhantasmalCreaturesOnSelectedSpell(false);
    setUseStepsOfTheFeyOnSelectedSpell(false);
    setUseMistyWandererOnSelectedSpell(false);
    setUseBewitchingMagicOnSelectedSpell(false);
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell(false);
    setUseNaturalRecoveryOnSelectedSpell(false);
    setUsePsionicSorceryOnSelectedSpell(false);
    setUseTamedSurgeOnSelectedSpell(false);
    setUseTelekineticMasterOnSelectedSpell(false);
    setUseRadiantSoulOnSelectedSpell(false);
    setUseFrozenHauntOnSelectedSpell(false);
    setIsSelectedSpellDiceRollerSettingsOpen(false);
    setSelectedFrozenHauntFallbackSlotLevel(frozenHauntFallbackSpellSlotMinimumLevel);
  }, []);
  const closeSpellSlotActionSheet = useCallback(() => {
    setActiveSpellSlotSheetLevel(null);
  }, []);
  const prepareCharacterForResourceConsumption = useCallback(
    (currentCharacter: Character, resource: RoundTrackerResource | null) =>
      resource
        ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, resource)
        : currentCharacter,
    []
  );

  const baseClassSpellEntries = useClassSpellEntries(character.className, character.subclassId);
  const characterRuntime = useMemo(() => getCharacterRuntime(character), [character]);
  const spellEntryTransformer = characterRuntime.spellEntryTransformer;
  const featRuntime = characterRuntime.feats;
  const spellcastingRuntime = characterRuntime.spellcasting;
  const { transformSpellEntry, transformSpellbookSpellEntry } = spellEntryTransformer;
  const featGrantedCantripEntries = useMemo(
    () => featRuntime.grantedCantripEntries.map((spell) => transformSpellEntry(spell)),
    [featRuntime.grantedCantripEntries, transformSpellEntry]
  );
  const speciesGrantedCantripEntries = useMemo(
    () =>
      getSpeciesGrantedCantripEntriesForCharacter(character).map((spell) =>
        transformSpellEntry(spell)
      ),
    [character, transformSpellEntry]
  );
  const speciesAlwaysPreparedCantripEntries = useMemo(
    () =>
      getSpeciesAlwaysPreparedCantripEntriesForCharacter(character).map((spell) =>
        transformSpellEntry(spell)
      ),
    [character, transformSpellEntry]
  );
  const featAlwaysPreparedCantripEntries = useMemo(
    () => featRuntime.alwaysPreparedCantripEntries.map((spell) => transformSpellEntry(spell)),
    [featRuntime.alwaysPreparedCantripEntries, transformSpellEntry]
  );
  const getSpellcastingAbilityOverrideForSpell = useCallback(
    (spellId: string) =>
      getSpeciesSpellcastingAbilityForCharacter(character, spellId) ??
      featRuntime.spellcastingAbilityBySpellId.get(spellId) ??
      null,
    [character, featRuntime.spellcastingAbilityBySpellId]
  );
  const featAlwaysPreparedSpellEntries = useMemo(
    () => featRuntime.alwaysPreparedSpellEntries.map((spell) => transformSpellEntry(spell)),
    [featRuntime.alwaysPreparedSpellEntries, transformSpellEntry]
  );
  const featureAlwaysSpellbookSpellIds = spellcastingRuntime.featureAlwaysSpellbookSpellIds;
  const featureRitualOnlySpellIds = spellcastingRuntime.featureRitualOnlySpellIds;
  const basePreparedSpellPoolEntries = usePreparedSpellEntries(
    character.className,
    character.level,
    character.subclassId
  );
  const canCastSpells = hasSpellcastingForCharacter(character);
  const spellcastingState = spellcastingRuntime.spellcastingState;

  useEffect(() => {
    if (canCastSpells) {
      return;
    }

    closeSelectedSpell();
    closeSpellSlotActionSheet();
    setIsSpellManagementModalOpen(false);
  }, [canCastSpells, closeSelectedSpell, closeSpellSlotActionSheet]);

  useEffect(() => {
    if (!spellcastingState.blocked) {
      return;
    }

    closeSpellSlotActionSheet();
    setIsSpellManagementModalOpen(false);
  }, [closeSpellSlotActionSheet, spellcastingState.blocked]);
  const classSpellEntries = useMemo(
    () =>
      hasClassSpellcasting
        ? baseClassSpellEntries.map((spell) => transformSpellEntry(spell))
        : [],
    [baseClassSpellEntries, hasClassSpellcasting, transformSpellEntry]
  );
  const preparedSpellPoolEntries = useMemo(
    () =>
      !hasClassSpellcasting
        ? []
        : basePreparedSpellPoolEntries.map((spell) => transformSpellEntry(spell)),
    [basePreparedSpellPoolEntries, hasClassSpellcasting, transformSpellEntry]
  );
  const bardicInspirationUsesTotal = spellcastingRuntime.bardicInspirationUsesTotal;
  const sorceryPointsRemaining = spellcastingRuntime.sorceryPointsRemaining;
  const sorceryPointsTotal = spellcastingRuntime.sorceryPointsTotal;
  const tamedSurgeUsesRemaining = spellcastingRuntime.tamedSurgeUsesRemaining;
  const tamedSurgeUsesTotal = spellcastingRuntime.tamedSurgeUsesTotal;
  const usesPreparedSpells = usesPreparedSpellsForCharacter(
    character.className,
    character.level,
    character.subclassId,
    character.customClass,
    character.classRules
  );
  const cantripLimit = spellcastingRuntime.cantripLimit;
  const preparedSpellLimit = spellcastingRuntime.preparedSpellLimit;
  const spellSlotTotals = spellcastingRuntime.spellSlotTotals;
  const spellSlotsExpended = spellcastingRuntime.spellSlotsExpended;
  const spellSlotsRemaining = spellcastingRuntime.spellSlotsRemaining;
  const beguilingMagicUsesTotal = spellcastingRuntime.beguilingMagicUsesTotal;
  const beguilingMagicUsesRemaining = spellcastingRuntime.beguilingMagicUsesRemaining;
  const blessingOfMoonlightUsesTotal = spellcastingRuntime.blessingOfMoonlightUsesTotal;
  const blessingOfMoonlightUsesRemaining = spellcastingRuntime.blessingOfMoonlightUsesRemaining;
  const druidNaturalRecoveryUsesRemaining = spellcastingRuntime.druidNaturalRecoveryUsesRemaining;
  const druidStarMapGuidingBoltUsesTotal = spellcastingRuntime.druidStarMapGuidingBoltUsesTotal;
  const druidStarMapGuidingBoltUsesRemaining =
    spellcastingRuntime.druidStarMapGuidingBoltUsesRemaining;
  const rangerFeyReinforcementsUsesTotal = spellcastingRuntime.rangerFeyReinforcementsUsesTotal;
  const rangerFeyReinforcementsUsesRemaining =
    spellcastingRuntime.rangerFeyReinforcementsUsesRemaining;
  const rangerMistyWandererUsesTotal = spellcastingRuntime.rangerMistyWandererUsesTotal;
  const rangerMistyWandererUsesRemaining = spellcastingRuntime.rangerMistyWandererUsesRemaining;
  const warlockStepsOfTheFeyUsesTotal = spellcastingRuntime.warlockStepsOfTheFeyUsesTotal;
  const warlockStepsOfTheFeyUsesRemaining = spellcastingRuntime.warlockStepsOfTheFeyUsesRemaining;
  const fighterPsiWarriorTelekineticMasterUsesTotal =
    spellcastingRuntime.fighterPsiWarriorTelekineticMasterUsesTotal;
  const fighterPsiWarriorTelekineticMasterUsesRemaining =
    spellcastingRuntime.fighterPsiWarriorTelekineticMasterUsesRemaining;
  const fighterPsiWarriorEnergyDiceRemaining =
    spellcastingRuntime.fighterPsiWarriorEnergyDiceRemaining;
  const fighterPsiWarriorEnergyDiceTotal = spellcastingRuntime.fighterPsiWarriorEnergyDiceTotal;
  const bardicInspirationUsesRemaining = spellcastingRuntime.bardicInspirationUsesRemaining;
  const highestSpellSlotLevel = spellcastingRuntime.highestSpellSlotLevel;
  const cantripOptions = useMemo(
    () =>
      getCantripSelectionOptionsForCharacter(
        character.className,
        character.level,
        character.subclassId,
        character.customClass,
        character.classRules
      ).map((spell) => transformSpellEntry(spell)),
    [
      character.className,
      character.classRules,
      character.customClass,
      character.level,
      character.subclassId,
      transformSpellEntry
    ]
  );
  const spellPreparationOptions = useMemo(
    () =>
      getPreparedSpellSelectionOptionsForCharacter(
        character.className,
        character.level,
        character.subclassId,
        character.customClass,
        character.classRules
      ).map((spell) => transformSpellEntry(spell)),
    [
      character.className,
      character.classRules,
      character.customClass,
      character.level,
      character.subclassId,
      transformSpellEntry
    ]
  );
  const usesSpellbook = usesSpellbookForCharacter(
    character.className,
    character.subclassId,
    character.customClass,
    character.classRules,
    character.level
  );
  const hasWizardRitualAdept =
    usesSpellbook &&
    hasClassFeatureForCharacter(character.className, character.level, CLASS_FEATURE.RITUAL_ADEPT);
  const wizardSpellMasterySpellIds = useMemo(
    () => getWizardSpellMasterySpellIdsForCharacter(character),
    [character]
  );
  const wizardSpellMasterySpellIdSet = useMemo(
    () => new Set(wizardSpellMasterySpellIds),
    [wizardSpellMasterySpellIds]
  );
  const wizardSignatureSpellIds = useMemo(
    () => getWizardSignatureSpellIdsForCharacter(character),
    [character]
  );
  const wizardSignatureSpellIdSet = useMemo(
    () => new Set(wizardSignatureSpellIds),
    [wizardSignatureSpellIds]
  );
  const classAlwaysPreparedSpellIds = useMemo(
    () =>
      getAlwaysPreparedSpellIds(
        character.className,
        character.level,
        character.classFeatureState,
        character.spellbookSpellIds,
        character.subclassId,
        character.statusEntries,
        character.customClass,
        character.classRules
      ),
    [
      character.classFeatureState,
      character.className,
      character.classRules,
      character.customClass,
      character.level,
      character.spellbookSpellIds,
      character.statusEntries,
      character.subclassId
    ]
  );
  const classAlwaysPreparedSpellSourceMap = spellcastingRuntime.featureAlwaysPreparedSpellSourceMap;
  const featAlwaysPreparedSpellIds = useMemo(
    () => featAlwaysPreparedSpellEntries.map((spell) => spell.id),
    [featAlwaysPreparedSpellEntries]
  );
  const speciesAlwaysPreparedSpellIds = useMemo(
    () => getSpeciesAlwaysPreparedSpellIdsForCharacter(character),
    [character]
  );
  const featAlwaysPreparedSpellSourceMap = featRuntime.alwaysPreparedSpellSourceMap;
  const speciesAlwaysPreparedSpellSourceMap = useMemo(
    () => getSpeciesAlwaysPreparedSpellSourceMapForCharacter(character),
    [character]
  );
  const alwaysPreparedSpellSourceMap = useMemo(
    () =>
      mergeSpellSourceMaps(
        classAlwaysPreparedSpellSourceMap,
        featAlwaysPreparedSpellSourceMap,
        speciesAlwaysPreparedSpellSourceMap
      ),
    [
      classAlwaysPreparedSpellSourceMap,
      featAlwaysPreparedSpellSourceMap,
      speciesAlwaysPreparedSpellSourceMap
    ]
  );
  const alwaysPreparedSpellIds = useMemo(
    () => [
      ...new Set([
        ...classAlwaysPreparedSpellIds,
        ...featAlwaysPreparedSpellIds,
        ...speciesAlwaysPreparedSpellIds
      ])
    ],
    [classAlwaysPreparedSpellIds, featAlwaysPreparedSpellIds, speciesAlwaysPreparedSpellIds]
  );
  const alwaysPreparedSpellIdSet = useMemo(
    () => new Set(alwaysPreparedSpellIds),
    [alwaysPreparedSpellIds]
  );
  const alwaysSpellbookSpellIds = featureAlwaysSpellbookSpellIds;
  const alwaysSpellbookSpellIdSet = useMemo(
    () => new Set(alwaysSpellbookSpellIds),
    [alwaysSpellbookSpellIds]
  );
  const alwaysPreparedSpellEntries = useMemo(
    () =>
      alwaysPreparedSpellIds
        .map((spellId) => getSpellEntryById(spellId))
        .filter((spell): spell is SpellEntry => spell !== null)
        .map((spell) => transformSpellEntry(spell)),
    [alwaysPreparedSpellIds, transformSpellEntry]
  );
  const alwaysPreparedCantripEntries = useMemo(
    () => alwaysPreparedSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
    [alwaysPreparedSpellEntries]
  );
  const alwaysPreparedLeveledSpellIds = useMemo(
    () =>
      alwaysPreparedSpellEntries
        .filter((spell) => getSpellLevel(spell) > 0)
        .map((spell) => spell.id),
    [alwaysPreparedSpellEntries]
  );
  const alwaysPreparedCantripIdSet = useMemo(
    () =>
      new Set(
        [
          ...alwaysPreparedCantripEntries,
          ...featAlwaysPreparedCantripEntries,
          ...speciesAlwaysPreparedCantripEntries
        ].map((spell) => spell.id)
      ),
    [
      alwaysPreparedCantripEntries,
      featAlwaysPreparedCantripEntries,
      speciesAlwaysPreparedCantripEntries
    ]
  );
  const allKnownCantripEntries = useMemo(() => {
    const mergedCantrips = new Map<string, SpellEntry>();

    [
      ...cantripOptions,
      ...alwaysPreparedCantripEntries,
      ...featGrantedCantripEntries,
      ...speciesGrantedCantripEntries
    ].forEach((spell) => {
      mergedCantrips.set(spell.id, spell);
    });

    return [...mergedCantrips.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [
    alwaysPreparedCantripEntries,
    cantripOptions,
    featGrantedCantripEntries,
    speciesGrantedCantripEntries
  ]);
  const selectedCantripIds = useMemo(
    () => normalizeTrackedSpellIds(character.cantripIds, cantripOptions, cantripLimit),
    [cantripLimit, cantripOptions, character.cantripIds]
  );
  const selectedManualSpellbookSpellIds = useMemo(
    () =>
      usesSpellbook
        ? normalizeSpellbookSpellIds(character.spellbookSpellIds, spellPreparationOptions).filter(
            (spellId) => !alwaysSpellbookSpellIdSet.has(spellId)
          )
        : [],
    [alwaysSpellbookSpellIdSet, character.spellbookSpellIds, spellPreparationOptions, usesSpellbook]
  );
  const selectedSpellbookSpellIds = useMemo(
    () =>
      usesSpellbook
        ? normalizeSpellbookSpellIds(
            character.spellbookSpellIds,
            spellPreparationOptions,
            alwaysSpellbookSpellIds
          )
        : [],
    [alwaysSpellbookSpellIds, character.spellbookSpellIds, spellPreparationOptions, usesSpellbook]
  );
  const selectedSpellbookSpellIdSet = useMemo(
    () => new Set(selectedSpellbookSpellIds),
    [selectedSpellbookSpellIds]
  );
  const selectedPreparedSpellIds = useMemo(
    () =>
      normalizePreparedSpellIds(
        character.preparedSpellIds,
        spellPreparationOptions,
        preparedSpellLimit,
        alwaysPreparedLeveledSpellIds
      ).filter((spellId) => !usesSpellbook || selectedSpellbookSpellIdSet.has(spellId)),
    [
      alwaysPreparedLeveledSpellIds,
      character.preparedSpellIds,
      preparedSpellLimit,
      selectedSpellbookSpellIdSet,
      spellPreparationOptions,
      usesSpellbook
    ]
  );
  const cantripOptionsById = useMemo(
    () => new Map(allKnownCantripEntries.map((spell) => [spell.id, spell])),
    [allKnownCantripEntries]
  );
  const knownSpellEntriesById = useMemo(
    () =>
      new Map(
        [
          ...classSpellEntries,
          ...cantripOptions,
          ...featGrantedCantripEntries,
          ...speciesGrantedCantripEntries,
          ...preparedSpellPoolEntries,
          ...spellPreparationOptions,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [spell.id, spell])
      ),
    [
      alwaysPreparedSpellEntries,
      cantripOptions,
      classSpellEntries,
      featGrantedCantripEntries,
      speciesGrantedCantripEntries,
      preparedSpellPoolEntries,
      spellPreparationOptions
    ]
  );
  const spellbookSpellEntriesById = useMemo(
    () =>
      new Map(
        selectedSpellbookSpellIds.flatMap((spellId) => {
          const spell = knownSpellEntriesById.get(spellId);

          return spell ? [[spellId, transformSpellbookSpellEntry(spell)] as const] : [];
        })
      ),
    [knownSpellEntriesById, selectedSpellbookSpellIds, transformSpellbookSpellEntry]
  );
  const selectedCantrips = useMemo(() => {
    const selectedCantripEntries = new Map<string, SpellEntry>();

    selectedCantripIds.forEach((spellId) => {
      const spell = cantripOptionsById.get(spellId);

      if (spell) {
        selectedCantripEntries.set(spell.id, spell);
      }
    });

    featGrantedCantripEntries.forEach((spell) => {
      selectedCantripEntries.set(spell.id, spell);
    });

    speciesGrantedCantripEntries.forEach((spell) => {
      selectedCantripEntries.set(spell.id, spell);
    });

    alwaysPreparedCantripEntries.forEach((spell) => {
      selectedCantripEntries.set(spell.id, spell);
    });

    return [...selectedCantripEntries.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [
    alwaysPreparedCantripEntries,
    cantripOptionsById,
    featGrantedCantripEntries,
    selectedCantripIds,
    speciesGrantedCantripEntries
  ]);
  const selectedPreparedSpells = useMemo(() => {
    const preparedSpells = usesPreparedSpells
      ? [...alwaysPreparedLeveledSpellIds, ...selectedPreparedSpellIds]
          .map(
            (spellId) =>
              spellbookSpellEntriesById.get(spellId) ?? knownSpellEntriesById.get(spellId)
          )
          .filter((spell): spell is SpellEntry => spell !== undefined)
      : alwaysPreparedSpellEntries.length > 0
        ? alwaysPreparedSpellEntries
        : spellPreparationOptions;

    return usesPreparedSpells
      ? preparedSpells.map((spell) =>
          getDruidCircleOfTheStarsChaliceHealingSpellEntry(
            character,
            getClericLifeDomainHealingSpellEntry(character, spell, true),
            true
          )
        )
      : preparedSpells;
  }, [
    alwaysPreparedSpellEntries,
    alwaysPreparedLeveledSpellIds,
    character,
    knownSpellEntriesById,
    selectedPreparedSpellIds,
    spellbookSpellEntriesById,
    spellPreparationOptions,
    usesPreparedSpells
  ]);
  const selectedSpellbookSpells = useMemo(
    () =>
      selectedSpellbookSpellIds
        .map(
          (spellId) => spellbookSpellEntriesById.get(spellId) ?? knownSpellEntriesById.get(spellId)
        )
        .filter((spell): spell is SpellEntry => spell !== undefined),
    [knownSpellEntriesById, selectedSpellbookSpellIds, spellbookSpellEntriesById]
  );
  const wizardPreparedSpellIdSet = useMemo(
    () => new Set([...alwaysPreparedLeveledSpellIds, ...selectedPreparedSpellIds]),
    [alwaysPreparedLeveledSpellIds, selectedPreparedSpellIds]
  );
  const wizardSpellbookOnlyIdSet = useMemo(
    () =>
      new Set(
        selectedSpellbookSpellIds.filter((spellId) => !wizardPreparedSpellIdSet.has(spellId))
      ),
    [selectedSpellbookSpellIds, wizardPreparedSpellIdSet]
  );
  const wizardSpellbookOnlyRitualSpells = useMemo(
    () =>
      hasWizardRitualAdept
        ? selectedSpellbookSpells.filter(
            (spell) => wizardSpellbookOnlyIdSet.has(spell.id) && spell.ritual === true
          )
        : [],
    [hasWizardRitualAdept, selectedSpellbookSpells, wizardSpellbookOnlyIdSet]
  );
  const wizardSpellbookOnlyRitualIdSet = useMemo(
    () => new Set(wizardSpellbookOnlyRitualSpells.map((spell) => spell.id)),
    [wizardSpellbookOnlyRitualSpells]
  );
  const visibleWizardLevelledSpells = useMemo(() => {
    if (!usesSpellbook) {
      return selectedPreparedSpells;
    }

    if (activeWizardSpellFilter === "prepared") {
      const mergedSpells = new Map<string, SpellEntry>();

      [...selectedPreparedSpells, ...wizardSpellbookOnlyRitualSpells].forEach((spell) => {
        mergedSpells.set(spell.id, spell);
      });

      return [...mergedSpells.values()].sort((left, right) => {
        if (left.spellLevel !== right.spellLevel) {
          return left.spellLevel - right.spellLevel;
        }

        return left.name.localeCompare(right.name);
      });
    }

    const mergedSpells = new Map<string, SpellEntry>();

    [...selectedPreparedSpells, ...selectedSpellbookSpells].forEach((spell) => {
      mergedSpells.set(spell.id, spell);
    });

    return [...mergedSpells.values()].sort((left, right) => {
      if (left.spellLevel !== right.spellLevel) {
        return left.spellLevel - right.spellLevel;
      }

      return left.name.localeCompare(right.name);
    });
  }, [
    activeWizardSpellFilter,
    selectedPreparedSpells,
    selectedSpellbookSpells,
    usesSpellbook,
    wizardSpellbookOnlyRitualSpells
  ]);
  const visibleSpellEntries = useMemo(
    () => [...selectedCantrips, ...visibleWizardLevelledSpells],
    [selectedCantrips, visibleWizardLevelledSpells]
  );
  const preparedSpellGroups = useMemo(
    () => groupSpellsByLevel(visibleSpellEntries),
    [visibleSpellEntries]
  );
  const hasCantripManagement =
    cantripOptions.length > 0 && (cantripLimit === null || cantripLimit > 0);
  const hasSpellManagementOptions = hasCantripManagement || usesPreparedSpells;
  const spellSelectionInputStatus = useMemo(
    () => getSpellSelectionInputStatusForCharacter(character),
    [character]
  );
  const hasSpellSelectionInputRequired = spellSelectionInputStatus.hasInputRequired;
  const getSpellOutcomeSummary = useCallback(
    (spell: SpellEntry) =>
      getSpellOutcomeSummaryForCharacter(
        character,
        spell,
        getSpellcastingAbilityOverrideForSpell(spell.id)
      ),
    [character, getSpellcastingAbilityOverrideForSpell]
  );
  const visibleSpellOutcomeSummariesById = useMemo(
    () => new Map(visibleSpellEntries.map((spell) => [spell.id, getSpellOutcomeSummary(spell)])),
    [getSpellOutcomeSummary, visibleSpellEntries]
  );

  const roundTracker = useMemo(
    () => normalizeRoundTracker(character.roundTracker),
    [character.roundTracker]
  );
  const selectedSpellActionPaths = useMemo(
    () => (selectedSpell ? getSpellActionPathStates(character, selectedSpell, roundTracker) : []),
    [character, roundTracker, selectedSpell]
  );
  const selectedSpellAlwaysPrepared = selectedSpell
    ? alwaysPreparedSpellIdSet.has(selectedSpell.id) ||
      alwaysPreparedCantripIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellAlwaysPreparedSources = selectedSpell
    ? getSpellSourceLabels(alwaysPreparedSpellSourceMap, selectedSpell.id)
    : [];
  const selectedSpellAlwaysSpellbook = selectedSpell
    ? alwaysSpellbookSpellIdSet.has(selectedSpell.id)
    : false;
  const ritualOnlySpellIdSet = useMemo(
    () => new Set(featureRitualOnlySpellIds),
    [featureRitualOnlySpellIds]
  );
  const selectedSpellIsWizardSpellMastery = selectedSpell
    ? wizardSpellMasterySpellIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellIsWizardSignatureSpell = selectedSpell
    ? wizardSignatureSpellIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellInSpellbook = selectedSpell
    ? selectedSpellbookSpellIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellPreparedNormally = selectedSpell
    ? selectedPreparedSpellIds.includes(selectedSpell.id)
    : false;
  const selectedSpellIsPrepared =
    Boolean(selectedSpell) && (selectedSpellAlwaysPrepared || selectedSpellPreparedNormally);
  const selectedSpellIsSpellbookOnly =
    usesSpellbook &&
    Boolean(selectedSpell) &&
    selectedSpellInSpellbook &&
    !selectedSpellAlwaysPrepared &&
    !selectedSpellPreparedNormally;
  const selectedSpellCanOnlyBeCastAsRitual =
    selectedSpell !== null &&
    (ritualOnlySpellIdSet.has(selectedSpell.id) ||
      wizardSpellbookOnlyRitualIdSet.has(selectedSpell.id));
  const selectedSpellCanCastAsRitualFromSpellbook =
    selectedSpellIsSpellbookOnly && hasWizardRitualAdept && selectedSpell?.ritual === true;
  const selectedSpellHasSignatureSpellFreeCastAvailable =
    selectedSpell !== null &&
    hasWizardSignatureSpellFreeCastAvailableForCharacter(character, selectedSpell.id);
  const selectedSpellUnderMantleOfMajesty =
    selectedSpell?.id === "spell-command" && hasActiveMantleOfMajestyForCharacter(character);
  const druidCircleOfTheLandSpellIds = useMemo(
    () => getDruidCircleOfTheLandSpellIdsForCharacter(character, circleOfTheLandSpellIdsByLand),
    [character]
  );
  const druidCircleOfTheMoonSpellIds = useMemo(
    () => getDruidCircleOfTheMoonSpellIdsForCharacter(character, circleOfTheMoonSpellIdsByLevel),
    [character]
  );
  const selectedSpellSupportsNaturalRecovery =
    selectedSpell !== null &&
    getSpellLevel(selectedSpell) > 0 &&
    druidCircleOfTheLandSpellIds.includes(selectedSpell.id);
  const selectedSpellSupportsStarMap =
    selectedSpell?.id === guidingBoltSpellId && druidStarMapGuidingBoltUsesTotal > 0;
  const selectedSpellMagicInitiateFreeCastState = selectedSpell
    ? getMagicInitiateFreeCastStateForCharacter(character, selectedSpell.id)
    : null;
  const selectedSpellSupportsMagicInitiate = selectedSpellMagicInitiateFreeCastState !== null;
  const selectedSpellMagicInitiateDisabled =
    selectedSpellMagicInitiateFreeCastState !== null &&
    selectedSpellMagicInitiateFreeCastState.usesRemaining <= 0;
  const selectedSpellForestGnomeFreeCastState = selectedSpell
    ? getGnomeSpeakWithAnimalsFreeCastStateForCharacter(character, selectedSpell.id)
    : null;
  const selectedSpellSupportsForestGnome = selectedSpellForestGnomeFreeCastState !== null;
  const selectedSpellForestGnomeDisabled =
    selectedSpellForestGnomeFreeCastState !== null &&
    selectedSpellForestGnomeFreeCastState.usesRemaining <= 0;
  const selectedSpellFiendishLegacyFreeCastState = selectedSpell
    ? getTieflingFiendishLegacyFreeCastStateForCharacter(character, selectedSpell.id)
    : null;
  const selectedSpellSupportsFiendishLegacy = selectedSpellFiendishLegacyFreeCastState !== null;
  const selectedSpellFiendishLegacyDisabled =
    selectedSpellFiendishLegacyFreeCastState !== null &&
    selectedSpellFiendishLegacyFreeCastState.usesRemaining <= 0;
  const selectedSpellFeyMagicFreeCastState = selectedSpell
    ? getFeyTouchedFreeCastStateForCharacter(character, selectedSpell.id)
    : null;
  const selectedSpellSupportsFeyMagic = selectedSpellFeyMagicFreeCastState !== null;
  const selectedSpellFeyMagicDisabled =
    selectedSpellFeyMagicFreeCastState !== null &&
    selectedSpellFeyMagicFreeCastState.usesRemaining <= 0;
  const selectedSpellQuickRitualState =
    selectedSpell?.ritual === true ? getRitualCasterQuickRitualStateForCharacter(character) : null;
  const selectedSpellSupportsQuickRitual = selectedSpellQuickRitualState !== null;
  const selectedSpellQuickRitualDisabled =
    selectedSpellIsSpellbookOnly ||
    (selectedSpellQuickRitualState !== null && selectedSpellQuickRitualState.usesRemaining <= 0);
  const selectedSpellShadowMagicFreeCastState = selectedSpell
    ? getShadowTouchedFreeCastStateForCharacter(character, selectedSpell.id)
    : null;
  const selectedSpellSupportsShadowMagic = selectedSpellShadowMagicFreeCastState !== null;
  const selectedSpellShadowMagicDisabled =
    selectedSpellShadowMagicFreeCastState !== null &&
    selectedSpellShadowMagicFreeCastState.usesRemaining <= 0;
  const selectedSpellDetectThoughtsFreeCastState = selectedSpell
    ? getTelepathicDetectThoughtsFreeCastStateForCharacter(character, selectedSpell.id)
    : null;
  const selectedSpellSupportsDetectThoughts = selectedSpellDetectThoughtsFreeCastState !== null;
  const selectedSpellDetectThoughtsDisabled =
    selectedSpellDetectThoughtsFreeCastState !== null &&
    selectedSpellDetectThoughtsFreeCastState.usesRemaining <= 0;
  const selectedSpellSpellfireFlameState = selectedSpell
    ? getSpellfireSparkSpellfireFlameStateForCharacter(character, selectedSpell.id)
    : null;
  const selectedSpellSupportsSpellfireFlame = selectedSpellSpellfireFlameState !== null;
  const selectedSpellSupportsBoonOfSpellRecall = selectedSpell
    ? canUseBoonOfSpellRecallFreeCastingForSpell(character, selectedSpell)
    : false;
  const selectedSpellSupportsEmeraldEnclaveFledgling =
    selectedSpell !== null &&
    canUseEmeraldEnclaveFledglingSpeakWithAnimalsForSpell(character, selectedSpell.id);
  const selectedSpellCanCastAsEmeraldEnclaveFledglingRitual =
    selectedSpellSupportsEmeraldEnclaveFledgling && selectedSpell?.ritual === true;
  const selectedSpellMagicInitiateAbility = selectedSpell
    ? getSpellcastingAbilityOverrideForSpell(selectedSpell.id)
    : null;
  const selectedSpellSupportsPsionicSorcery =
    selectedSpell !== null &&
    getSpellLevel(selectedSpell) > 0 &&
    canUseSorcererSubclassPsionicSorceryForSpell(character, selectedSpell.id);
  const selectedSpellSupportsTamedSurge =
    selectedSpell !== null && canUseSorcererSubclassTamedSurgeForSpell(character, selectedSpell);
  const selectedSpellSupportsStepsOfTheFey =
    selectedSpell?.id === mistyStepSpellId && warlockStepsOfTheFeyUsesTotal > 0;
  const selectedSpellSupportsBewitchingMagic =
    selectedSpell?.id === mistyStepSpellId &&
    hasWarlockArchfeyPatronBewitchingMagicFeature(character);
  const selectedSpellSupportsMistyWanderer =
    selectedSpell?.id === mistyStepSpellId && rangerMistyWandererUsesTotal > 0;
  const selectedSpellSupportsFeyReinforcements =
    selectedSpell?.id === summonFeySpellId && rangerFeyReinforcementsUsesTotal > 0;
  const selectedSpellPhantasmalCreaturesOptionState =
    getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter(character, selectedSpell);
  const selectedSpellSupportsPhantasmalCreatures =
    selectedSpellPhantasmalCreaturesOptionState !== null;
  const selectedSpellCanIgnoreSpellcastingBlock =
    selectedSpell !== null && druidCircleOfTheMoonSpellIds.includes(selectedSpell.id);
  const selectedSpellPsionicSorcerySlotLevel =
    selectedSpell && getSpellLevel(selectedSpell) > 0
      ? clampNumber(
          selectedSpellSlotLevel,
          Math.max(1, getSpellLevel(selectedSpell)),
          9,
          Math.max(1, getSpellLevel(selectedSpell))
        )
      : 1;
  const selectedSpellPsionicSorceryMinimumCost =
    selectedSpell && getSpellLevel(selectedSpell) > 0
      ? Math.max(1, getSpellLevel(selectedSpell))
      : 0;
  const selectedSpellPsionicSorceryCurrentCost = selectedSpellSupportsPsionicSorcery
    ? selectedSpellPsionicSorcerySlotLevel
    : 0;
  const selectedSpellStarMapDisabled =
    selectedSpellSupportsStarMap && druidStarMapGuidingBoltUsesRemaining <= 0;
  const selectedSpellPsionicSorceryDisabled =
    selectedSpellSupportsPsionicSorcery &&
    sorceryPointsRemaining < selectedSpellPsionicSorceryMinimumCost;
  const selectedSpellFreeCastSlotLevel = selectedSpellUnderMantleOfMajesty
    ? 1
    : selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell
      ? selectedSpellPsionicSorcerySlotLevel
      : selectedSpellSupportsNaturalRecovery &&
          useNaturalRecoveryOnSelectedSpell &&
          druidNaturalRecoveryUsesRemaining > 0
        ? Math.max(1, getSpellLevel(selectedSpell))
        : selectedSpell && selectedSpellIsWizardSpellMastery
          ? Math.max(1, getSpellLevel(selectedSpell))
          : selectedSpell &&
              selectedSpellIsWizardSignatureSpell &&
              selectedSpellHasSignatureSpellFreeCastAvailable
            ? 3
            : null;
  const selectedSpellBlockedReason = selectedSpellIsSpellbookOnly
    ? "This spell is in your spellbook but not prepared."
    : null;
  const selectedSpellSupportsBeguilingMagic =
    selectedSpell !== null &&
    beguilingMagicUsesTotal > 0 &&
    (selectedSpell.magicSchool === MAGIC_SCHOOL.ENCHANTMENT ||
      selectedSpell.magicSchool === MAGIC_SCHOOL.ILLUSION);
  const selectedSpellDisplay = useMemo(() => {
    if (!selectedSpell) {
      return null;
    }

    const spellDisplay = getDruidCircleOfTheStarsChaliceHealingSpellEntry(
      character,
      getClericLifeDomainHealingSpellEntry(
        character,
        getClericMindMagicSpellEntry(character, selectedSpell, selectedSpellIsPrepared),
        selectedSpellIsPrepared
      ),
      selectedSpellIsPrepared
    );

    return selectedSpell.isAttackSpell === true
      ? appendGoliathAttackDescriptionAddition(
          spellDisplay,
          getGoliathAttackOptionStateForCharacter(character)
        )
      : spellDisplay;
  }, [character, selectedSpell, selectedSpellIsPrepared]);
  const selectedSpellSupportsBlessingOfMoonlight =
    selectedSpell?.id === "spell-moonbeam" && blessingOfMoonlightUsesTotal > 0;
  const selectedSpellSupportsRadiantSoul = spellSupportsWarlockCelestialPatronRadiantSoul(
    character,
    selectedSpellDisplay
  );
  const selectedSpellRadiantSoulDisabled =
    selectedSpellSupportsRadiantSoul &&
    !canUseWarlockCelestialPatronRadiantSoulForSpell(character, selectedSpellDisplay);
  const selectedSpellSupportsOverchannel = spellQualifiesForWizardEvokerOverchannel(
    character,
    selectedSpellDisplay
  );
  const selectedSpellOverchannelDisabled =
    selectedSpellSupportsOverchannel &&
    !canUseWizardEvokerOverchannelForSpellSlot(
      character,
      selectedSpellDisplay,
      selectedSpellSlotLevel
    );
  const selectedSpellOverchannelNecroticDamage =
    getWizardEvokerOverchannelNecroticDamageFormula(character);
  const selectedSpellAttackRollFormula = selectedSpellDisplay
    ? getSpellAttackRollFormulaForCharacter(
        selectedSpellDisplay,
        character,
        selectedSpellMagicInitiateAbility
      )
    : null;
  const selectedSpellGoliathAncestryState =
    selectedSpell?.isAttackSpell === true
      ? getGoliathAttackOptionStateForCharacter(character)
      : null;
  const selectedSpellSupportsGoliathAncestry = selectedSpellGoliathAncestryState !== null;
  const selectedSpellGoliathAncestryDisabled = selectedSpellGoliathAncestryState?.disabled ?? false;
  const selectedSpellDamageDetailOverride = useMemo(() => {
    if (
      !selectedSpellDisplay ||
      (!useRadiantSoulOnSelectedSpell && !useGoliathAncestryOnSelectedSpell)
    ) {
      return null;
    }

    const baseDamageDetail = getSpellDamageDetailForCharacter(
      character,
      selectedSpellDisplay,
      selectedSpellMagicInitiateAbility
    );

    const radiantSoulDamageDetail = useRadiantSoulOnSelectedSpell
      ? getWarlockCelestialPatronRadiantSoulDamageDetail(
          character,
          selectedSpellDisplay,
          baseDamageDetail
        )
      : baseDamageDetail;

    return useGoliathAncestryOnSelectedSpell
      ? getGoliathAttackDamageDetail(radiantSoulDamageDetail, selectedSpellGoliathAncestryState)
      : radiantSoulDamageDetail;
  }, [
    character,
    selectedSpellGoliathAncestryState,
    selectedSpellMagicInitiateAbility,
    selectedSpellDisplay,
    useGoliathAncestryOnSelectedSpell,
    useRadiantSoulOnSelectedSpell
  ]);
  const selectedSpellStepsOfTheFeyDisabled =
    selectedSpellSupportsStepsOfTheFey && warlockStepsOfTheFeyUsesRemaining <= 0;
  const selectedSpellMistyWandererDisabled =
    selectedSpellSupportsMistyWanderer && rangerMistyWandererUsesRemaining <= 0;
  const selectedSpellFeyReinforcementsDisabled =
    selectedSpellSupportsFeyReinforcements && rangerFeyReinforcementsUsesRemaining <= 0;
  const selectedSpellPhantasmalCreaturesDisabled =
    selectedSpellPhantasmalCreaturesOptionState?.disabled ?? false;
  const selectedSpellSupportsTelekineticMaster =
    selectedSpell?.id === telekinesisSpellId && fighterPsiWarriorTelekineticMasterUsesTotal > 0;
  const selectedSpellTelekineticMasterDisabled =
    selectedSpellSupportsTelekineticMaster &&
    fighterPsiWarriorTelekineticMasterUsesRemaining <= 0 &&
    fighterPsiWarriorEnergyDiceRemaining <= 0;
  const selectedSpellCastOptionSkipsSpellSlot =
    (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) ||
    (selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) ||
    (selectedSpellSupportsForestGnome && useForestGnomeOnSelectedSpell) ||
    (selectedSpellSupportsFiendishLegacy && useFiendishLegacyOnSelectedSpell) ||
    (selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell) ||
    (selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell) ||
    (selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell) ||
    (selectedSpellSupportsDetectThoughts && useDetectThoughtsOnSelectedSpell) ||
    (selectedSpellSupportsBoonOfSpellRecall && useBoonOfSpellRecallOnSelectedSpell) ||
    (selectedSpellSupportsEmeraldEnclaveFledgling &&
      useEmeraldEnclaveFledglingFreeUseOnSelectedSpell) ||
    (selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell) ||
    (selectedSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnSelectedSpell) ||
    (selectedSpellSupportsBewitchingMagic && useBewitchingMagicOnSelectedSpell) ||
    (selectedSpellSupportsMistyWanderer && useMistyWandererOnSelectedSpell) ||
    (selectedSpellSupportsFeyReinforcements && useFeyReinforcementsOnSelectedSpell) ||
    (selectedSpellSupportsPhantasmalCreatures && usePhantasmalCreaturesOnSelectedSpell) ||
    (selectedSpellSupportsTelekineticMaster && useTelekineticMasterOnSelectedSpell);
  const selectedSpellTamedSurgeDisabled =
    selectedSpellSupportsTamedSurge &&
    (tamedSurgeUsesRemaining <= 0 || selectedSpellCastOptionSkipsSpellSlot);
  const selectedSpellPsionicSorceryWarning =
    usePsionicSorceryOnSelectedSpell &&
    selectedSpellSupportsPsionicSorcery &&
    sorceryPointsRemaining < selectedSpellPsionicSorceryCurrentCost
      ? `You need ${selectedSpellPsionicSorceryCurrentCost} Sorcery Points.`
      : null;
  const selectedSpellProjectedSpellSlotsExpended = useMemo(() => {
    if (!selectedSpell || getSpellLevel(selectedSpell) <= 0) {
      return spellSlotsExpended;
    }

    const minimumSlotLevel = Math.max(1, getSpellLevel(selectedSpell));
    const slotLevel =
      (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) ||
      (selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) ||
      (selectedSpellSupportsForestGnome && useForestGnomeOnSelectedSpell) ||
      (selectedSpellSupportsFiendishLegacy && useFiendishLegacyOnSelectedSpell) ||
      (selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell) ||
      (selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell) ||
      (selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell) ||
      (selectedSpellSupportsDetectThoughts && useDetectThoughtsOnSelectedSpell) ||
      (selectedSpellSupportsBoonOfSpellRecall && useBoonOfSpellRecallOnSelectedSpell) ||
      (selectedSpellSupportsEmeraldEnclaveFledgling &&
        useEmeraldEnclaveFledglingFreeUseOnSelectedSpell)
        ? minimumSlotLevel
        : clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);
    const castsWithoutSpellSlot =
      (selectedSpellFreeCastSlotLevel !== null && slotLevel === selectedSpellFreeCastSlotLevel) ||
      (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) ||
      (selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) ||
      (selectedSpellSupportsForestGnome && useForestGnomeOnSelectedSpell) ||
      (selectedSpellSupportsFiendishLegacy && useFiendishLegacyOnSelectedSpell) ||
      (selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell) ||
      (selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell) ||
      (selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell) ||
      (selectedSpellSupportsDetectThoughts && useDetectThoughtsOnSelectedSpell) ||
      (selectedSpellSupportsBoonOfSpellRecall && useBoonOfSpellRecallOnSelectedSpell) ||
      (selectedSpellSupportsEmeraldEnclaveFledgling &&
        useEmeraldEnclaveFledglingFreeUseOnSelectedSpell);

    if (castsWithoutSpellSlot) {
      return spellSlotsExpended;
    }

    const nextSpellSlotsExpended = [...spellSlotsExpended];
    nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

    return nextSpellSlotsExpended;
  }, [
    selectedSpell,
    selectedSpellFreeCastSlotLevel,
    selectedSpellSlotLevel,
    selectedSpellSupportsMagicInitiate,
    selectedSpellSupportsForestGnome,
    selectedSpellSupportsFiendishLegacy,
    selectedSpellSupportsFeyMagic,
    selectedSpellSupportsQuickRitual,
    selectedSpellSupportsShadowMagic,
    selectedSpellSupportsDetectThoughts,
    selectedSpellSupportsBoonOfSpellRecall,
    selectedSpellSupportsEmeraldEnclaveFledgling,
    selectedSpellSupportsStarMap,
    spellSlotsExpended,
    useMagicInitiateOnSelectedSpell,
    useForestGnomeOnSelectedSpell,
    useFiendishLegacyOnSelectedSpell,
    useFeyMagicOnSelectedSpell,
    useQuickRitualOnSelectedSpell,
    useShadowMagicOnSelectedSpell,
    useDetectThoughtsOnSelectedSpell,
    useBoonOfSpellRecallOnSelectedSpell,
    useEmeraldEnclaveFledglingFreeUseOnSelectedSpell,
    useStarMapOnSelectedSpell
  ]);
  const selectedSpellFrozenHauntOptionState = useMemo(
    () =>
      getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
        character,
        selectedSpell,
        spellSlotTotals,
        selectedSpellProjectedSpellSlotsExpended
      ),
    [character, selectedSpell, selectedSpellProjectedSpellSlotsExpended, spellSlotTotals]
  );
  const selectedSpellHuntersRimeTemporaryHitPointsFormula =
    selectedSpell?.id === huntersMarkSpellId
      ? getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter(character)
      : null;
  const selectedSpellHuntersRimeTemporaryHitPointsFormulaDisplay =
    selectedSpell?.id === huntersMarkSpellId
      ? getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter(character)
      : null;
  const selectedSpellImplementationRollEffects = selectedSpell
    ? getSpellImplementationRollEffectsForCharacter({
        character,
        spell: selectedSpell,
        spellSlotLevel: selectedSpellSlotLevel,
        castSource: "standard",
        options: {}
      })
    : [];
  const selectedSpellFalseLifeTemporaryHitPointsFormula =
    selectedSpellImplementationRollEffects[0]?.formula ?? null;
  const selectedSpellFacts =
    selectedSpell?.id === huntersMarkSpellId
      ? getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter(character)
      : [];
  const selectedSpellProjectedSpellSlotsRemaining = useMemo(
    () =>
      spellSlotTotals.map((total, index) =>
        Math.max(0, total - (selectedSpellProjectedSpellSlotsExpended[index] ?? 0))
      ),
    [selectedSpellProjectedSpellSlotsExpended, spellSlotTotals]
  );
  const selectedSpellFrozenHauntFallbackSlotOptions = useMemo(
    () =>
      (selectedSpellFrozenHauntOptionState?.fallbackSpellSlotLevels ?? []).map((slotLevel) => ({
        value: slotLevel,
        label: `Level ${slotLevel} (${selectedSpellProjectedSpellSlotsRemaining[slotLevel - 1] ?? 0}/${spellSlotTotals[slotLevel - 1] ?? 0})`
      })),
    [
      selectedSpellFrozenHauntOptionState?.fallbackSpellSlotLevels,
      selectedSpellProjectedSpellSlotsRemaining,
      spellSlotTotals
    ]
  );
  const selectedSpellFrozenHauntFallbackSlotSummary = useMemo(
    () => ({
      remaining: selectedSpellProjectedSpellSlotsRemaining
        .slice(frozenHauntFallbackSpellSlotMinimumLevel - 1)
        .reduce((sum, remaining) => sum + remaining, 0),
      total: spellSlotTotals
        .slice(frozenHauntFallbackSpellSlotMinimumLevel - 1)
        .reduce((sum, total) => sum + total, 0)
    }),
    [selectedSpellProjectedSpellSlotsRemaining, spellSlotTotals]
  );
  const selectedSpellFrozenHauntFallbackSlotLevelIsValid =
    selectedSpellFrozenHauntOptionState?.fallbackSpellSlotLevels.includes(
      selectedFrozenHauntFallbackSlotLevel
    ) ?? false;
  const selectedSpellFrozenHauntWarning =
    useFrozenHauntOnSelectedSpell && selectedSpellFrozenHauntOptionState
      ? selectedSpellFrozenHauntOptionState.usesRemaining > 0
        ? null
        : (selectedSpellFrozenHauntOptionState.disabledReason ??
          (!selectedSpellFrozenHauntFallbackSlotLevelIsValid
            ? `Select a level ${frozenHauntFallbackSpellSlotMinimumLevel}+ spell slot for Frozen Haunt.`
            : null))
      : null;
  const selectedSpellSharedCastWarning =
    spellcastingState.blocked && !selectedSpellCanIgnoreSpellcastingBlock
      ? spellcastingState.reason
      : (selectedSpellPsionicSorceryWarning ?? selectedSpellFrozenHauntWarning);
  const selectedSpellCastWarning =
    selectedSpellSharedCastWarning ?? getSpellActionPathWarning(selectedSpellActionPaths);

  useEffect(() => {
    setUseBeguilingMagicOnSelectedSpell(false);
    setUseBlessingOfMoonlightOnSelectedSpell(false);
    setUseStarMapOnSelectedSpell(false);
    setUseMagicInitiateOnSelectedSpell(false);
    setUseForestGnomeOnSelectedSpell(false);
    setUseFiendishLegacyOnSelectedSpell(false);
    setUseGoliathAncestryOnSelectedSpell(false);
    setUseFeyMagicOnSelectedSpell(false);
    setUseQuickRitualOnSelectedSpell(false);
    setUseShadowMagicOnSelectedSpell(false);
    setUseDetectThoughtsOnSelectedSpell(false);
    setUseBoonOfSpellRecallOnSelectedSpell(false);
    setUseEmeraldEnclaveFledglingFreeUseOnSelectedSpell(false);
    setUseFeyReinforcementsOnSelectedSpell(false);
    setUsePhantasmalCreaturesOnSelectedSpell(false);
    setUseStepsOfTheFeyOnSelectedSpell(false);
    setUseBewitchingMagicOnSelectedSpell(false);
    setUseMistyWandererOnSelectedSpell(false);
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell(false);
    setUseNaturalRecoveryOnSelectedSpell(false);
    setUsePsionicSorceryOnSelectedSpell(false);
    setUseTelekineticMasterOnSelectedSpell(false);
    setUseRadiantSoulOnSelectedSpell(false);
    setUseOverchannelOnSelectedSpell(false);
    setUseFrozenHauntOnSelectedSpell(false);
    setSelectedFrozenHauntFallbackSlotLevel(frozenHauntFallbackSpellSlotMinimumLevel);
  }, [selectedSpell?.id]);

  useEffect(() => {
    if (!selectedSpellSupportsOverchannel || !selectedSpellOverchannelDisabled) {
      return;
    }

    setUseOverchannelOnSelectedSpell(false);
  }, [selectedSpellOverchannelDisabled, selectedSpellSupportsOverchannel]);

  useEffect(() => {
    if (!selectedSpellSupportsStarMap || !selectedSpellStarMapDisabled) {
      return;
    }

    setUseStarMapOnSelectedSpell(false);
  }, [selectedSpellStarMapDisabled, selectedSpellSupportsStarMap]);

  useEffect(() => {
    if (!selectedSpellSupportsMagicInitiate || !selectedSpellMagicInitiateDisabled) {
      return;
    }

    setUseMagicInitiateOnSelectedSpell(false);
  }, [selectedSpellMagicInitiateDisabled, selectedSpellSupportsMagicInitiate]);

  useEffect(() => {
    if (!selectedSpellSupportsForestGnome || !selectedSpellForestGnomeDisabled) {
      return;
    }

    setUseForestGnomeOnSelectedSpell(false);
  }, [selectedSpellForestGnomeDisabled, selectedSpellSupportsForestGnome]);

  useEffect(() => {
    if (!selectedSpellSupportsFiendishLegacy || !selectedSpellFiendishLegacyDisabled) {
      return;
    }

    setUseFiendishLegacyOnSelectedSpell(false);
  }, [selectedSpellFiendishLegacyDisabled, selectedSpellSupportsFiendishLegacy]);

  useEffect(() => {
    if (selectedSpellSupportsGoliathAncestry && !selectedSpellGoliathAncestryDisabled) {
      return;
    }

    setUseGoliathAncestryOnSelectedSpell(false);
  }, [selectedSpellGoliathAncestryDisabled, selectedSpellSupportsGoliathAncestry]);

  useEffect(() => {
    if (!selectedSpellSupportsFeyMagic || !selectedSpellFeyMagicDisabled) {
      return;
    }

    setUseFeyMagicOnSelectedSpell(false);
  }, [selectedSpellFeyMagicDisabled, selectedSpellSupportsFeyMagic]);

  useEffect(() => {
    if (!selectedSpellSupportsQuickRitual || !selectedSpellQuickRitualDisabled) {
      return;
    }

    setUseQuickRitualOnSelectedSpell(false);
  }, [selectedSpellQuickRitualDisabled, selectedSpellSupportsQuickRitual]);

  useEffect(() => {
    if (!selectedSpellSupportsShadowMagic || !selectedSpellShadowMagicDisabled) {
      return;
    }

    setUseShadowMagicOnSelectedSpell(false);
  }, [selectedSpellShadowMagicDisabled, selectedSpellSupportsShadowMagic]);

  useEffect(() => {
    if (!selectedSpellSupportsDetectThoughts || !selectedSpellDetectThoughtsDisabled) {
      return;
    }

    setUseDetectThoughtsOnSelectedSpell(false);
  }, [selectedSpellDetectThoughtsDisabled, selectedSpellSupportsDetectThoughts]);

  useEffect(() => {
    if (selectedSpellSupportsBoonOfSpellRecall) {
      return;
    }

    setUseBoonOfSpellRecallOnSelectedSpell(false);
  }, [selectedSpellSupportsBoonOfSpellRecall]);

  useEffect(() => {
    if (selectedSpellSupportsEmeraldEnclaveFledgling) {
      return;
    }

    setUseEmeraldEnclaveFledglingFreeUseOnSelectedSpell(false);
  }, [selectedSpellSupportsEmeraldEnclaveFledgling]);

  useEffect(() => {
    if (selectedSpellSupportsPsionicSorcery && !selectedSpellPsionicSorceryDisabled) {
      return;
    }

    setUsePsionicSorceryOnSelectedSpell(false);
  }, [selectedSpellPsionicSorceryDisabled, selectedSpellSupportsPsionicSorcery]);

  useEffect(() => {
    if (selectedSpellSupportsTamedSurge && !selectedSpellTamedSurgeDisabled) {
      return;
    }

    setUseTamedSurgeOnSelectedSpell(false);
  }, [selectedSpellSupportsTamedSurge, selectedSpellTamedSurgeDisabled]);

  useEffect(() => {
    if (!selectedSpellSupportsRadiantSoul || !selectedSpellRadiantSoulDisabled) {
      return;
    }

    setUseRadiantSoulOnSelectedSpell(false);
  }, [selectedSpellRadiantSoulDisabled, selectedSpellSupportsRadiantSoul]);

  useEffect(() => {
    if (!selectedSpellSupportsStepsOfTheFey || !selectedSpellStepsOfTheFeyDisabled) {
      return;
    }

    setUseStepsOfTheFeyOnSelectedSpell(false);
  }, [selectedSpellStepsOfTheFeyDisabled, selectedSpellSupportsStepsOfTheFey]);

  useEffect(() => {
    if (selectedSpellSupportsBewitchingMagic) {
      return;
    }

    setUseBewitchingMagicOnSelectedSpell(false);
  }, [selectedSpellSupportsBewitchingMagic]);

  useEffect(() => {
    if (!selectedSpellSupportsMistyWanderer || !selectedSpellMistyWandererDisabled) {
      return;
    }

    setUseMistyWandererOnSelectedSpell(false);
  }, [selectedSpellMistyWandererDisabled, selectedSpellSupportsMistyWanderer]);

  useEffect(() => {
    if (!selectedSpellSupportsFeyReinforcements || !selectedSpellFeyReinforcementsDisabled) {
      return;
    }

    setUseFeyReinforcementsOnSelectedSpell(false);
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell(false);
  }, [selectedSpellFeyReinforcementsDisabled, selectedSpellSupportsFeyReinforcements]);

  useEffect(() => {
    if (!selectedSpellSupportsPhantasmalCreatures || !selectedSpellPhantasmalCreaturesDisabled) {
      return;
    }

    setUsePhantasmalCreaturesOnSelectedSpell(false);
  }, [selectedSpellPhantasmalCreaturesDisabled, selectedSpellSupportsPhantasmalCreatures]);

  useEffect(() => {
    if (useFeyReinforcementsOnSelectedSpell) {
      return;
    }

    setUseFeyReinforcementsNoConcentrationOnSelectedSpell(false);
  }, [useFeyReinforcementsOnSelectedSpell]);

  useEffect(() => {
    if (!selectedSpellSupportsTelekineticMaster || !selectedSpellTelekineticMasterDisabled) {
      return;
    }

    setUseTelekineticMasterOnSelectedSpell(false);
  }, [selectedSpellSupportsTelekineticMaster, selectedSpellTelekineticMasterDisabled]);

  useEffect(() => {
    if (!selectedSpellFrozenHauntOptionState) {
      setUseFrozenHauntOnSelectedSpell(false);
      return;
    }

    if (!selectedSpellFrozenHauntFallbackSlotLevelIsValid) {
      setSelectedFrozenHauntFallbackSlotLevel(
        selectedSpellFrozenHauntOptionState.fallbackSpellSlotLevels[0] ??
          frozenHauntFallbackSpellSlotMinimumLevel
      );
    }

    if (selectedSpellFrozenHauntOptionState.disabled) {
      setUseFrozenHauntOnSelectedSpell(false);
    }
  }, [selectedSpellFrozenHauntFallbackSlotLevelIsValid, selectedSpellFrozenHauntOptionState]);

  const getSpellRowActionShapes = useCallback(
    (spell: SpellEntry): SpellListRowActionShapes =>
      getSpellActionPathStates(character, spell, roundTracker)
        .map((path) => {
          const actionShape = getActionShapeForEconomyType(path.economyType);

          return actionShape
            ? {
                key: path.id,
                shape: actionShape,
                isSelected: path.shapeState.isAvailable,
                multiCount: path.shapeState.multiCount
              }
            : null;
        })
        .filter((path): path is NonNullable<typeof path> => path !== null),
    [character, roundTracker]
  );
  const spellActionShapesById = useMemo(
    () => new Map(visibleSpellEntries.map((spell) => [spell.id, getSpellRowActionShapes(spell)])),
    [getSpellRowActionShapes, visibleSpellEntries]
  );
  const preparedSpellRowGroups = useMemo(
    () =>
      createSpellRowGroups({
        preparedSpellGroups,
        spellActionShapesById,
        alwaysPreparedSpellIdSet,
        alwaysPreparedCantripIdSet,
        alwaysSpellbookSpellIdSet,
        spellOutcomeSummariesById: visibleSpellOutcomeSummariesById,
        wizardSignatureSpellIdSet,
        wizardSpellbookOnlyIdSet,
        wizardSpellbookOnlyRitualIdSet,
        wizardSpellMasterySpellIdSet
      }),
    [
      alwaysPreparedCantripIdSet,
      alwaysPreparedSpellIdSet,
      alwaysSpellbookSpellIdSet,
      preparedSpellGroups,
      spellActionShapesById,
      visibleSpellOutcomeSummariesById,
      wizardSignatureSpellIdSet,
      wizardSpellMasterySpellIdSet,
      wizardSpellbookOnlyIdSet,
      wizardSpellbookOnlyRitualIdSet
    ]
  );
  const openSpellManagementMenu = useCallback(() => {
    if (!hasSpellManagementOptions) {
      return;
    }

    setIsSpellManagementModalOpen(true);
  }, [hasSpellManagementOptions]);

  useEffect(() => {
    if (activeSpellSlotSheetLevel === null && !selectedSpell) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (isSelectedSpellDiceRollerSettingsOpen) {
          setIsSelectedSpellDiceRollerSettingsOpen(false);
          return;
        }

        if (selectedSpell) {
          closeSelectedSpell();
          return;
        }

        if (activeSpellSlotSheetLevel !== null) {
          closeSpellSlotActionSheet();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeSpellSlotSheetLevel,
    closeSpellSlotActionSheet,
    closeSelectedSpell,
    isSelectedSpellDiceRollerSettingsOpen,
    selectedSpell
  ]);

  const updateSpellSlotsExpended = useCallback(
    (slotLevel: number, delta: number) => {
      onPersistCharacter((currentCharacter) => {
        const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level,
          currentCharacter.subclassId,
          currentCharacter.customClass,
          currentCharacter.classRules
        );
        const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
          currentCharacter.spellSlotsExpended,
          currentSpellSlotTotals
        );
        const slotIndex = slotLevel - 1;
        const totalSlots = currentSpellSlotTotals[slotIndex] ?? 0;

        if (totalSlots <= 0) {
          return currentCharacter;
        }

        const currentValue = currentSpellSlotsExpended[slotIndex] ?? 0;
        const nextValue = clampNumber(currentValue + delta, 0, totalSlots, currentValue);

        if (nextValue === currentValue) {
          return currentCharacter;
        }

        const nextSpellSlotsExpended = [...currentSpellSlotsExpended];
        nextSpellSlotsExpended[slotIndex] = nextValue;

        return {
          ...currentCharacter,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      });
    },
    [onPersistCharacter]
  );

  const resetAllSpellSlotsAtLevel = useCallback(
    (slotLevel: number) => {
      onPersistCharacter((currentCharacter) => {
        const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level,
          currentCharacter.subclassId,
          currentCharacter.customClass,
          currentCharacter.classRules
        );
        const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
          currentCharacter.spellSlotsExpended,
          currentSpellSlotTotals
        );
        const slotIndex = slotLevel - 1;
        const totalSlots = currentSpellSlotTotals[slotIndex] ?? 0;
        const currentValue = currentSpellSlotsExpended[slotIndex] ?? 0;

        if (totalSlots <= 0 || currentValue <= 0) {
          return currentCharacter;
        }

        const nextSpellSlotsExpended = [...currentSpellSlotsExpended];
        nextSpellSlotsExpended[slotIndex] = 0;

        return {
          ...currentCharacter,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      });
    },
    [onPersistCharacter]
  );

  const updateCustomSpellSlotMaximum = useCallback(
    (slotLevel: number, delta: number) => {
      onPersistCharacter((currentCharacter) => {
        if (
          !usesFlexibleSpellcastingRulesForCharacter(
            currentCharacter.className,
            currentCharacter.level,
            currentCharacter.subclassId,
            currentCharacter.customClass,
            currentCharacter.classRules
          )
        ) {
          return currentCharacter;
        }

        const slotIndex = slotLevel - 1;
        const currentClassRules = getCharacterClassRulesConfig(currentCharacter);
        const currentMaximum = currentClassRules.spellSlotMaximums[slotIndex] ?? 0;
        const nextMaximum = Math.min(
          CUSTOM_CLASS_SPELL_SLOT_MAXIMUM,
          Math.max(0, currentMaximum + delta)
        );

        if (nextMaximum === currentMaximum) {
          return currentCharacter;
        }

        const nextSpellSlotMaximums = [...currentClassRules.spellSlotMaximums];
        nextSpellSlotMaximums[slotIndex] = nextMaximum;

        const nextClassRules = normalizeCharacterClassRulesConfig(
          {
            ...currentClassRules,
            spellSlotMaximums: nextSpellSlotMaximums
          },
          {
            className: currentCharacter.className,
            legacyCustomClass: currentCharacter.customClass
          }
        );
        const nextSpellSlotTotals = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level,
          currentCharacter.subclassId,
          currentCharacter.customClass,
          nextClassRules
        );
        const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
          currentCharacter.spellSlotsExpended,
          nextSpellSlotTotals
        );

        return {
          ...currentCharacter,
          classRules: nextClassRules,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      });
    },
    [onPersistCharacter]
  );

  const updateSpellcastingRulesEnforcement = useCallback(
    (enabled: boolean) => {
      onPersistCharacter((currentCharacter) => {
        if (
          isCustomClassName(currentCharacter.className) ||
          !hasBuiltInSpellcastingForCharacter(
            currentCharacter.className,
            currentCharacter.level,
            currentCharacter.subclassId
          )
        ) {
          return currentCharacter;
        }

        const currentClassRules = getCharacterClassRulesConfig(currentCharacter);

        if (currentClassRules.spellcastingRulesEnforced === enabled) {
          return currentCharacter;
        }

        const nextClassRules = normalizeCharacterClassRulesConfig(
          {
            ...currentClassRules,
            spellcastingRulesEnforced: enabled
          },
          {
            className: currentCharacter.className,
            legacyCustomClass: currentCharacter.customClass
          }
        );
        const nextSpellSlotTotals = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level,
          currentCharacter.subclassId,
          currentCharacter.customClass,
          nextClassRules
        );

        return {
          ...currentCharacter,
          classRules: nextClassRules,
          spellSlotsExpended: normalizeSpellSlotsExpended(
            currentCharacter.spellSlotsExpended,
            nextSpellSlotTotals
          )
        };
      });
    },
    [onPersistCharacter]
  );

  const openSpellDetails = useCallback(
    (spell: SpellEntry, viewMode: SelectedSpellViewMode = "standard") => {
      const spellLevel = getSpellLevel(spell);
      const minimumSlotLevel = Math.max(1, spellLevel);
      const isWizardSpellMasterySpell = wizardSpellMasterySpellIdSet.has(spell.id);
      const hasWizardSignatureSpellFreeCast =
        wizardSignatureSpellIdSet.has(spell.id) &&
        hasWizardSignatureSpellFreeCastAvailableForCharacter(character, spell.id);
      const preferredSlotLevel =
        spellLevel === 0
          ? 1
          : isWizardSpellMasterySpell
            ? minimumSlotLevel
            : hasWizardSignatureSpellFreeCast
              ? wizardSignatureSpellLevel
              : (spellSlotLevels.find(
                  (slotLevel) =>
                    slotLevel >= minimumSlotLevel && (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
                ) ??
                spellSlotLevels.find(
                  (slotLevel) =>
                    slotLevel >= minimumSlotLevel && (spellSlotTotals[slotLevel - 1] ?? 0) > 0
                ) ??
                minimumSlotLevel);

      setSelectedSpellViewMode(viewMode);
      setSelectedSpellSlotLevel(preferredSlotLevel);
      setSelectedSpell(spell);
    },
    [
      character,
      spellSlotTotals,
      spellSlotsRemaining,
      wizardSignatureSpellIdSet,
      wizardSpellMasterySpellIdSet
    ]
  );

  if (!canCastSpells) {
    return null;
  }

  function rollHuntersRimeTemporaryHitPointsForSpellCast(spell: Pick<SpellEntry, "id" | "name">) {
    if (spell.id !== huntersMarkSpellId || !selectedSpellHuntersRimeTemporaryHitPointsFormula) {
      return;
    }

    openDiceRoller({
      title: "Hunter's Rime",
      formula: selectedSpellHuntersRimeTemporaryHitPointsFormula,
      formulaDisplay:
        selectedSpellHuntersRimeTemporaryHitPointsFormulaDisplay ??
        selectedSpellHuntersRimeTemporaryHitPointsFormula,
      description: `When you cast ${spell.name}, you gain Temporary Hit Points.`,
      onResolvedResult: ({ result }) => {
        onPersistCharacter((currentCharacter) =>
          applyRolledTemporaryHitPointsToCharacter(currentCharacter, result.total, "Hunter's Rime")
        );
      }
    });
  }

  function rollSpellImplementationEffectsForSpellCast(
    spell: SpellEntry,
    spellSlotLevel: number | null,
    options: SpellImplementationOptionValues = {},
    castSource: SpellImplementationCastSource = "standard"
  ) {
    const rollEffects = getSpellImplementationRollEffectsForCharacter({
      character,
      spell,
      spellSlotLevel,
      castSource,
      options
    });

    rollEffects.forEach((effect) => {
      openDiceRoller({
        title: effect.title,
        formula: effect.formula,
        formulaDisplay: effect.formulaDisplay ?? effect.formula,
        description: effect.description,
        onResolvedResult: effect.applyResolvedResult
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                effect.applyResolvedResult!(currentCharacter, result)
              );
            }
          : undefined
      });
    });
  }

  function rollSpellAttackForSpellCast(
    spell: Pick<SpellEntry, "isAttackSpell" | "isSavingThrowSpell" | "name" | "spellLists">
  ) {
    const attackRollFormula = getSpellAttackRollFormulaForCharacter(
      spell,
      character,
      "id" in spell && typeof spell.id === "string"
        ? getSpellcastingAbilityOverrideForSpell(spell.id)
        : null
    );

    if (!attackRollFormula) {
      return;
    }

    openDiceRoller({
      title: `${spell.name} attack`,
      formula: attackRollFormula.formula,
      formulaDisplay: attackRollFormula.formulaDisplay,
      description: "Roll to hit the target's Armor Class.",
      mode: attackRollFormula.rollMode,
      enableNextCriticalHitOnNatural20: true
    });
  }

  function castSelectedSpell(options?: {
    castAsRitual?: boolean;
    roundTrackerResourceOverride?: RoundTrackerResource | null;
    useBeguilingMagic?: boolean;
    useStarMap?: boolean;
    useMagicInitiate?: boolean;
    useForestGnome?: boolean;
    useFiendishLegacy?: boolean;
    useGoliathAncestry?: boolean;
    useFeyMagic?: boolean;
    useQuickRitual?: boolean;
    useShadowMagic?: boolean;
    useDetectThoughts?: boolean;
    useBlessingOfMoonlight?: boolean;
    useFeyReinforcements?: boolean;
    useFeyReinforcementsNoConcentration?: boolean;
    useFrozenHaunt?: boolean;
    frozenHauntFallbackSlotLevel?: number;
    usePhantasmalCreatures?: boolean;
    useMistyWanderer?: boolean;
    useStepsOfTheFey?: boolean;
    useBewitchingMagic?: boolean;
    useNaturalRecovery?: boolean;
    usePsionicSorcery?: boolean;
    useTamedSurge?: boolean;
    useTelekineticMaster?: boolean;
    useRadiantSoul?: boolean;
    useOverchannel?: boolean;
    useBoonOfSpellRecall?: boolean;
    useEmeraldEnclaveFledglingFreeUse?: boolean;
    spellCastEffectIds?: string[];
    spellActionPathId?: string | null;
    spellImplementationCastSource?: SpellImplementationCastSource;
    spellImplementationOptions?: SpellImplementationOptionValues;
    summonCompanions?: CharacterCompanion[];
  }) {
    return castSelectedSpellWithContext(
      {
        ACTION_CATEGORY,
        activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter,
        applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter,
        applySpellCastFeatureEffectsForCharacter,
        applySpellConcentrationToStatusEntries,
        applySpellImplementationForCharacter,
        applyWizardEvokerOverchannelUse,
        canUseWarlockCelestialPatronRadiantSoulForSpell,
        canUseWizardEvokerOverchannelForSpellSlot,
        character,
        clampNumber,
        closeSelectedSpell,
        consumeBeguilingMagicOrBardicInspirationForCharacter,
        consumeBlessingOfMoonlightUseForCharacter,
        consumeFeyTouchedFreeCastForCharacter,
        consumeGoliathGiantAncestryUseForCharacter,
        consumeGnomeSpeakWithAnimalsFreeCastForCharacter,
        consumeTieflingFiendishLegacyFreeCastForCharacter,
        consumeMagicInitiateFreeCastForCharacter,
        consumeRitualCasterQuickRitualForCharacter,
        consumeShadowTouchedFreeCastForCharacter,
        consumeTelepathicDetectThoughtsFreeCastForCharacter,
        applyFeatureSpellCastEffectsForCharacter,
        appendSpellSummonCompanionsForCast,
        canAddSpellSummonCompanionsForCast,
        consumeDruidNaturalRecoveryUseForCharacter,
        consumeDruidStarMapGuidingBoltUseForCharacter,
        consumeRangerFeyReinforcementsUseForCharacter,
        consumeRangerMistyWandererUseForCharacter,
        consumeRangerWinterWalkerFrozenHauntUseForCharacter,
        consumeRoundTrackerResourceForCharacter,
        consumeSharedEconomyMultiForCharacterAction,
        consumeSorcererSubclassTamedSurgeUseForCharacter,
        consumeWarlockStepsOfTheFeyUseForCharacter,
        consumeWizardIllusionistPhantasmalCreaturesUseForCharacter,
        consumeWizardSignatureSpellFreeCastForCharacter,
        createEconomyMultiContextForSpell,
        druidNaturalRecoveryUsesRemaining,
        fighterPsiWarriorEnergyDiceRemaining,
        fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId,
        fighterPsiWarriorTelekineticMasterUsesRemaining,
        getDruidStarMapGuidingBoltUsesRemainingForCharacter,
        getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter,
        getRoundTrackerResourceForSpell,
        getSorceryPointsRemaining,
        getSpellLevel,
        getSpellSlotTotalsForCharacter,
        getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter,
        grantMonkFleetStepFollowUpForSpellCastIfEligible,
        hasWizardRitualAdept,
        hasWizardSignatureSpellFreeCastAvailableForCharacter,
        normalizeSpellSlotsExpended,
        onPersistCharacter,
        prepareCharacterForResourceConsumption,
        rangerFeyReinforcementsUsesRemaining,
        rangerMistyWandererUsesRemaining,
        restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
        rollSpellImplementationEffectsForSpellCast,
        rollHuntersRimeTemporaryHitPointsForSpellCast,
        rollSpellAttackForSpellCast,
        selectedSpell,
        selectedSpellActionPaths,
        selectedSpellCanIgnoreSpellcastingBlock,
        selectedSpellCanOnlyBeCastAsRitual,
        selectedSpellDisplay,
        selectedSpellFrozenHauntOptionState,
        selectedSpellIsSpellbookOnly,
        selectedSpellIsWizardSignatureSpell,
        selectedSpellIsWizardSpellMastery,
        selectedSpellPhantasmalCreaturesOptionState,
        selectedSpellSlotLevel,
        selectedSpellSupportsBewitchingMagic,
        selectedSpellSupportsEmeraldEnclaveFledgling,
        selectedSpellSupportsBoonOfSpellRecall,
        selectedSpellSupportsDetectThoughts,
        selectedSpellSupportsFeyMagic,
        selectedSpellSupportsForestGnome,
        selectedSpellSupportsFiendishLegacy,
        selectedSpellSupportsFeyReinforcements,
        selectedSpellSupportsGoliathAncestry,
        selectedSpellSupportsMagicInitiate,
        selectedSpellSupportsMistyWanderer,
        selectedSpellSupportsNaturalRecovery,
        selectedSpellSupportsOverchannel,
        selectedSpellSupportsPsionicSorcery,
        selectedSpellSupportsQuickRitual,
        selectedSpellSupportsShadowMagic,
        selectedSpellSupportsSpellfireFlame,
        selectedSpellSupportsStarMap,
        selectedSpellSupportsStepsOfTheFey,
        selectedSpellSupportsTamedSurge,
        selectedSpellSupportsTelekineticMaster,
        sorceryPointsRemaining,
        spellSlotsExpended,
        spellSlotsRemaining,
        spellcastingState,
        spendSorceryPoints,
        tamedSurgeUsesRemaining,
        warlockStepsOfTheFeyUsesRemaining,
        wizardSignatureSpellLevel
      },
      options
    );
  }

  const isPreparedSpellPreview = selectedSpellViewMode === "prepare-preview";
  const activeSpellSlotSheetTotal =
    activeSpellSlotSheetLevel !== null ? (spellSlotTotals[activeSpellSlotSheetLevel - 1] ?? 0) : 0;
  const activeSpellSlotSheetExpended =
    activeSpellSlotSheetLevel !== null
      ? (spellSlotsExpended[activeSpellSlotSheetLevel - 1] ?? 0)
      : 0;
  return renderSpellCastingForm({
    ActionButton,
    CharacterSpellDrawer,
    CircleHelp,
    InputRequiredBadge,
    Pencil,
    SpellCastingGuideModal,
    SpellMainListRow,
    SpellManagementModal,
    SpellSlotActionSheet,
    activeSpellSlotSheetExpended,
    activeSpellSlotSheetLevel,
    activeSpellSlotSheetTotal,
    activeWizardSpellFilter,
    alwaysPreparedSpellIds,
    alwaysSpellbookSpellIds,
    bardicInspirationUsesRemaining,
    bardicInspirationUsesTotal,
    beguilingMagicUsesRemaining,
    beguilingMagicUsesTotal,
    blessingOfMoonlightUsesRemaining,
    blessingOfMoonlightUsesTotal,
    cantripLimit,
    cantripOptions,
    castSelectedSpell,
    character,
    className,
    closeSelectedSpell,
    closeSpellSlotActionSheet,
    clsx,
    createChargesAndUsageHeaderTags,
    createChargesCardUsage,
    createChargesHeaderTag,
    createChargesOrResourceCardUsage,
    createFeatureActionCardCost,
    createNamedResourceCardUsage,
    createNamedUsageHeaderTags,
    diceRollerPopup,
    druidNaturalRecoveryUsesRemaining,
    druidStarMapGuidingBoltUsesRemaining,
    druidStarMapGuidingBoltUsesTotal,
    fighterPsiWarriorEnergyDiceRemaining,
    fighterPsiWarriorEnergyDiceTotal,
    fighterPsiWarriorTelekineticMasterUsesRemaining,
    fighterPsiWarriorTelekineticMasterUsesTotal,
    formatSpellGroupTitle,
    frozenHauntFallbackSpellSlotMinimumLevel,
    getActionShapeForEconomyType,
    getSpellOutcomeSummary,
    getSpellRowActionShapes,
    hasSpellManagementOptions,
    hasSpellSelectionInputRequired,
    highestSpellSlotLevel,
    isPreparedSpellPreview,
    isCustomClass: usesManualSpellcastingRules,
    customClassSpellSlotMaximumLimit: CUSTOM_CLASS_SPELL_SLOT_MAXIMUM,
    isSelectedSpellDiceRollerSettingsOpen,
    isSpellcastingGuideOpen,
    isSpellManagementModalOpen,
    isSpellcastingRulesEnforced: spellcastingRulesEnforced,
    isSpellcastingRulesEnforcementDisabled: spellcastingRulesEnforcementDisabled,
    knownSpellEntriesById,
    onPersistCharacter,
    openSpellDetails,
    openSpellManagementMenu,
    preparedSpellRowGroups,
    preparedSpellLimit,
    rangerFeyReinforcementsUsesRemaining,
    rangerFeyReinforcementsUsesTotal,
    rangerMistyWandererUsesRemaining,
    rangerMistyWandererUsesTotal,
    resetAllSpellSlotsAtLevel,
    selectedCantripIds,
    selectedFrozenHauntFallbackSlotLevel,
    selectedManualSpellbookSpellIds,
    selectedPreparedSpellIds,
    selectedSpell,
    selectedSpellActionPaths,
    selectedSpellAlwaysPrepared,
    selectedSpellAlwaysPreparedSources,
    selectedSpellAlwaysSpellbook,
    selectedSpellAttackRollFormula,
    selectedSpellBlockedReason,
    selectedSpellMagicInitiateAbility,
    selectedSpellMagicInitiateDisabled,
    selectedSpellMagicInitiateFreeCastState,
    selectedSpellForestGnomeDisabled,
    selectedSpellForestGnomeFreeCastState,
    selectedSpellFiendishLegacyDisabled,
    selectedSpellFiendishLegacyFreeCastState,
    selectedSpellGoliathAncestryDisabled,
    selectedSpellGoliathAncestryState,
    selectedSpellCanCastAsRitualFromSpellbook,
    selectedSpellCanCastAsEmeraldEnclaveFledglingRitual,
    selectedSpellCanOnlyBeCastAsRitual,
    selectedSpellCastWarning,
    selectedSpellDamageDetailOverride,
    selectedSpellDetectThoughtsDisabled,
    selectedSpellDetectThoughtsFreeCastState,
    selectedSpellDisplay,
    selectedSpellFacts,
    selectedSpellFeyMagicDisabled,
    selectedSpellFeyMagicFreeCastState,
    selectedSpellFeyReinforcementsDisabled,
    selectedSpellFalseLifeTemporaryHitPointsFormula,
    selectedSpellFreeCastSlotLevel,
    selectedSpellFrozenHauntFallbackSlotOptions,
    selectedSpellFrozenHauntFallbackSlotSummary,
    selectedSpellFrozenHauntOptionState,
    selectedSpellHuntersRimeTemporaryHitPointsFormula,
    selectedSpellIsSpellbookOnly,
    selectedSpellIsWizardSpellMastery,
    selectedSpellMistyWandererDisabled,
    selectedSpellOverchannelDisabled,
    selectedSpellOverchannelNecroticDamage,
    selectedSpellPhantasmalCreaturesDisabled,
    selectedSpellPhantasmalCreaturesOptionState,
    selectedSpellPsionicSorceryCurrentCost,
    selectedSpellPsionicSorceryDisabled,
    selectedSpellQuickRitualDisabled,
    selectedSpellQuickRitualState,
    selectedSpellRadiantSoulDisabled,
    selectedSpellShadowMagicDisabled,
    selectedSpellShadowMagicFreeCastState,
    selectedSpellSharedCastWarning,
    selectedSpellSlotLevel,
    selectedSpellStarMapDisabled,
    selectedSpellStepsOfTheFeyDisabled,
    selectedSpellSupportsBeguilingMagic,
    selectedSpellSupportsBewitchingMagic,
    selectedSpellSupportsBlessingOfMoonlight,
    selectedSpellSupportsBoonOfSpellRecall,
    selectedSpellSupportsEmeraldEnclaveFledgling,
    selectedSpellSupportsDetectThoughts,
    selectedSpellSupportsFeyMagic,
    selectedSpellSupportsForestGnome,
    selectedSpellSupportsFiendishLegacy,
    selectedSpellSupportsFeyReinforcements,
    selectedSpellSupportsGoliathAncestry,
    selectedSpellSupportsMagicInitiate,
    selectedSpellSupportsMistyWanderer,
    selectedSpellSupportsNaturalRecovery,
    selectedSpellSupportsOverchannel,
    selectedSpellSupportsPhantasmalCreatures,
    selectedSpellSupportsPsionicSorcery,
    selectedSpellSupportsQuickRitual,
    selectedSpellSupportsRadiantSoul,
    selectedSpellSupportsShadowMagic,
    selectedSpellSupportsStarMap,
    selectedSpellSupportsStepsOfTheFey,
    selectedSpellSupportsTamedSurge,
    selectedSpellSupportsTelekineticMaster,
    selectedSpellTamedSurgeDisabled,
    selectedSpellTelekineticMasterDisabled,
    selectedSpellUnderMantleOfMajesty,
    selectedSpellViewMode,
    setActiveSpellSlotSheetLevel,
    setActiveWizardSpellFilter,
    setIsSelectedSpellDiceRollerSettingsOpen,
    setIsSpellcastingGuideOpen,
    setIsSpellManagementModalOpen,
    setSelectedFrozenHauntFallbackSlotLevel,
    setSelectedSpellSlotLevel,
    setUseBeguilingMagicOnSelectedSpell,
    setUseBewitchingMagicOnSelectedSpell,
    setUseBlessingOfMoonlightOnSelectedSpell,
    setUseBoonOfSpellRecallOnSelectedSpell,
    setUseEmeraldEnclaveFledglingFreeUseOnSelectedSpell,
    setUseDetectThoughtsOnSelectedSpell,
    setUseFeyMagicOnSelectedSpell,
    setUseForestGnomeOnSelectedSpell,
    setUseFiendishLegacyOnSelectedSpell,
    setUseGoliathAncestryOnSelectedSpell,
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell,
    setUseFeyReinforcementsOnSelectedSpell,
    setUseFrozenHauntOnSelectedSpell,
    setUseMagicInitiateOnSelectedSpell,
    setUseMistyWandererOnSelectedSpell,
    setUseNaturalRecoveryOnSelectedSpell,
    setUseOverchannelOnSelectedSpell,
    setUsePhantasmalCreaturesOnSelectedSpell,
    setUsePsionicSorceryOnSelectedSpell,
    setUseQuickRitualOnSelectedSpell,
    setUseRadiantSoulOnSelectedSpell,
    setUseShadowMagicOnSelectedSpell,
    setUseStarMapOnSelectedSpell,
    setUseStepsOfTheFeyOnSelectedSpell,
    setUseTamedSurgeOnSelectedSpell,
    setUseTelekineticMasterOnSelectedSpell,
    shared,
    SheetActionButton,
    SheetSurface,
    sorceryPointsRemaining,
    sorceryPointsTotal,
    spellPreparationOptions,
    spellSlotLevels,
    spellSlotTotals,
    spellSlotsRemaining,
    spellbookSpellEntriesById,
    spellcastingState,
    styles,
    tamedSurgeUsesRemaining,
    tamedSurgeUsesTotal,
    updateSpellSlotsExpended,
    updateCustomSpellSlotMaximum,
    updateSpellcastingRulesEnforcement,
    useBeguilingMagicOnSelectedSpell,
    useBewitchingMagicOnSelectedSpell,
    useBlessingOfMoonlightOnSelectedSpell,
    useBoonOfSpellRecallOnSelectedSpell,
    useEmeraldEnclaveFledglingFreeUseOnSelectedSpell,
    useDetectThoughtsOnSelectedSpell,
    useFeyMagicOnSelectedSpell,
    useForestGnomeOnSelectedSpell,
    useFiendishLegacyOnSelectedSpell,
    useGoliathAncestryOnSelectedSpell,
    useFeyReinforcementsNoConcentrationOnSelectedSpell,
    useFeyReinforcementsOnSelectedSpell,
    useFrozenHauntOnSelectedSpell,
    useMagicInitiateOnSelectedSpell,
    useMistyWandererOnSelectedSpell,
    useNaturalRecoveryOnSelectedSpell,
    useOverchannelOnSelectedSpell,
    usePhantasmalCreaturesOnSelectedSpell,
    usePsionicSorceryOnSelectedSpell,
    useQuickRitualOnSelectedSpell,
    useRadiantSoulOnSelectedSpell,
    useShadowMagicOnSelectedSpell,
    useStarMapOnSelectedSpell,
    useStepsOfTheFeyOnSelectedSpell,
    useTamedSurgeOnSelectedSpell,
    useTelekineticMasterOnSelectedSpell,
    usesPreparedSpells,
    usesSpellbook,
    warlockStepsOfTheFeyUsesRemaining,
    warlockStepsOfTheFeyUsesTotal
  });
}

export default SpellCastingForm;
