import clsx from "clsx";
import { Pencil, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ActionShape, { getActionShapeForCastingTime } from "../../../ActionShape";
import CellContainer from "../../../CellContainer/CellContainer";
import DivinityListRow from "../../../DivinityListRow/DivinityListRow";
import SpellListRow from "../../../SpellListRow";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import CharacterSpellDrawer, { type CharacterSpellDrawerMode } from "./CharacterSpellDrawer";
import SpellManagementModal from "./SpellManagementModal";
import SpellSlotActionSheet from "./SpellSlotActionSheet";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../codex/classes";
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import {
  ACTION_TYPE,
  CLASS_FEATURE,
  DURATION,
  MAGIC_SCHOOL,
  getSpellEntryById,
  type SpellEntry
} from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  formatDivinitySubtitle,
  formatSpellCastingTime,
  formatCodexLabel
} from "../../../../utils/codex";
import {
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker,
  shouldTrackRoundScopedResources,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import {
  ACTION_CATEGORY,
  getRoundTrackerResourceForEconomyType
} from "../../../../pages/CharactersPage/actionEconomy";
import {
  applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter,
  applySpellCastFeatureEffectsForCharacter,
  activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter,
  consumeDruidStarMapGuidingBoltUseForCharacter,
  consumeDruidNaturalRecoveryUseForCharacter,
  consumeBlessingOfMoonlightUseForCharacter,
  activateFeatureActionOptionForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeRangerFeyReinforcementsUseForCharacter,
  consumeWizardIllusionistPhantasmalCreaturesUseForCharacter,
  consumeRangerWinterWalkerFrozenHauntUseForCharacter,
  consumeRangerMistyWandererUseForCharacter,
  consumeWarlockStepsOfTheFeyUseForCharacter,
  consumeSharedEconomyMultiForCharacterAction,
  expendChannelDivinityUseForCharacter,
  getDruidStarMapGuidingBoltUsesRemainingForCharacter,
  getFeatureActionOptionsForCharacter,
  getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter,
  hasActiveMantleOfMajestyForCharacter,
  createEconomyMultiContextForSpell,
  getSpellbookSpellEntryForCharacter,
  getSpellEntryForCharacter,
  getSpellSourceLabels,
  mergeSpellSourceMaps,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  consumeWizardSignatureSpellFreeCastForCharacter,
  getWizardSignatureSpellIdsForCharacter,
  hasWizardSignatureSpellFreeCastAvailableForCharacter,
  getWizardSpellMasterySpellIdsForCharacter,
  getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter,
  type FeatureActionOptionCard
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
  channelDivinityActionKey,
  canUseClericMindMagicForSpell,
  canUseClericWarGodsBlessingForSpell,
  getClericLifeDomainHealingSpellEntry,
  getClericMindMagicSpellEntry,
  getClericResolvedDivinityDisplay
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
import { paladinChannelDivinityActionKey } from "../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import {
  applyPaladinOathOfTheNobleGeniesElementalSmiteEffect,
  getPaladinOathOfTheNobleGeniesElementalSmiteDamageDetail,
  hasPaladinOathOfTheNobleGeniesElementalSmite,
  paladinOathOfTheNobleGeniesElementalSmiteOptions,
  type PaladinOathOfTheNobleGeniesElementalSmiteOptionKey
} from "../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
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
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  hasClassFeatureForCharacter,
  isSpellcastingClass,
  normalizeTrackedSpellIds,
  normalizePreparedSpellIds,
  normalizeSpellbookSpellIds,
  normalizeSpellSlotsExpended,
  usesSpellbookForCharacter,
  usesPreparedSpellsForCharacter
} from "../../../../pages/CharactersPage/spellcasting";
import { getSpellSelectionInputStatusForCharacter } from "../../../../pages/CharactersPage/spellSelection";
import {
  consumeFeyTouchedFreeCastForCharacter,
  consumeMagicInitiateFreeCastForCharacter,
  consumeRitualCasterQuickRitualForCharacter,
  consumeShadowTouchedFreeCastForCharacter,
  consumeTelepathicDetectThoughtsFreeCastForCharacter,
  canUseBoonOfSpellRecallFreeCastingForSpell,
  getFeatAlwaysPreparedCantripEntriesForCharacter,
  getFeatAlwaysPreparedSpellEntriesForCharacter,
  getFeatAlwaysPreparedSpellSourceMapForCharacter,
  getFeatGrantedCantripEntriesForCharacter,
  getFeyTouchedFreeCastStateForCharacter,
  getMagicInitiateFreeCastStateForCharacter,
  getMagicInitiateSpellcastingAbilityForCharacter,
  getRitualCasterQuickRitualStateForCharacter,
  getShadowTouchedFreeCastStateForCharacter,
  getTelepathicDetectThoughtsFreeCastStateForCharacter
} from "../../../../pages/CharactersPage/feats/runtime";
import {
  getSpeciesAlwaysPreparedCantripEntriesForCharacter,
  getSpeciesAlwaysPreparedSpellSourceMapForCharacter,
  getSpeciesGrantedCantripEntriesForCharacter,
  getSpeciesSpellcastingAbilityForCharacter
} from "../../../../pages/CharactersPage/species";
import { formatFeatureActionOptionRangeLabel } from "../../../../pages/CharactersPage/actionOutcome";
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
import { orderDescriptionAdditionSections } from "../../../../pages/CharactersPage/actionModalDescriptions";
import {
  getSpellDamageDetailForCharacter,
  getSpellOutcomeSummaryForCharacter
} from "../../../../pages/CharactersPage/spellOutcome";
import { getSpellAttackRollFormulaForCharacter } from "../../../../pages/CharactersPage/shared/spellFormulas";
import {
  applyFalseLifeTemporaryHitPointsToCharacter,
  applySpellImplementationForCharacter,
  falseLifeSpellId,
  getFalseLifeTemporaryHitPointsFormula,
  getFalseLifeTemporaryHitPointsFormulaDisplay,
  getFalseLifeTemporaryHitPointsFromRoll
} from "../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetSurface from "../SheetSurface";
import ActionButton from "../../../ActionButton";
import { getActionShapeForEconomyType } from "../GameplayForm/gameplayWidgetUtils";
import gameplayActionStyles from "../GameplayForm/widgets/ActionsWidget/GameplayActionDrawer.module.css";
import { getSpellActionPathStates, getSpellActionPathWarning } from "../spellActionPaths";
import styles from "./SpellCastingForm.module.css";
import {
  applyRolledTemporaryHitPointsToCharacter,
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../GameplayForm/gameplayStateUtils";
import {
  createChannelDivinityOptionRows,
  type ChannelDivinityOptionRow
} from "../channelDivinityUtils";
import { renderSpellCastingForm } from "./SpellCastingFormRenderer";
import { castSelectedSpellWithContext } from "./castSelectedSpell";

type SpellCastingFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SpellGroup = {
  level: number;
  spells: SpellEntry[];
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

function getDivinityDrawerValueLabel(option: FeatureActionOptionCard): string {
  return option.rollFormulaDisplay ?? "-";
}

function groupSpellsByLevel(spells: SpellEntry[]): SpellGroup[] {
  const spellsByLevel = spells.reduce((groups, spell) => {
    const spellLevel = getSpellLevel(spell);
    const currentGroup = groups.get(spellLevel) ?? [];

    groups.set(spellLevel, [...currentGroup, spell]);
    return groups;
  }, new Map<number, SpellEntry[]>());

  return [...spellsByLevel.entries()]
    .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
    .map(([level, levelSpells]) => ({
      level,
      spells: [...levelSpells].sort((left, right) => left.name.localeCompare(right.name))
    }));
}

function getRoundTrackerResourceLabel(resource: RoundTrackerResource): string {
  switch (resource) {
    case "bonusAction":
      return ACTION_TYPE.BONUS_ACTION;
    case "reaction":
      return ACTION_TYPE.REACTION;
    case "action":
    default:
      return ACTION_TYPE.ACTION;
  }
}

function getRoundTrackerActionWarning(
  resource: RoundTrackerResource | null,
  roundTracker: ReturnType<typeof normalizeRoundTracker>
): string | null {
  if (
    !resource ||
    !shouldTrackRoundScopedResources(roundTracker) ||
    isRoundTrackerResourceAvailable(roundTracker, resource)
  ) {
    return null;
  }

  return `You already used the ${getRoundTrackerResourceLabel(resource)} for this turn`;
}

function getActionShapeStateForRoundTrackerResource(
  resource: RoundTrackerResource | null,
  roundTracker: ReturnType<typeof normalizeRoundTracker>,
  multiCount = 0
): {
  isSelected: boolean;
  multiCount: number;
} {
  if (!shouldTrackRoundScopedResources(roundTracker)) {
    return {
      isSelected: true,
      multiCount: 0
    };
  }

  const isSelected = !resource || isRoundTrackerResourceAvailable(roundTracker, resource);

  return {
    isSelected,
    multiCount: isSelected ? 0 : Math.max(0, Math.floor(multiCount))
  };
}

function SpellCastingForm({ character, className, onPersistCharacter }: SpellCastingFormProps) {
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedDivinityOptionKey, setSelectedDivinityOptionKey] = useState<string | null>(null);
  const [selectedSpellViewMode, setSelectedSpellViewMode] =
    useState<SelectedSpellViewMode>("standard");
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [useBeguilingMagicOnSelectedSpell, setUseBeguilingMagicOnSelectedSpell] = useState(false);
  const [useMindMagicOnSelectedSpell, setUseMindMagicOnSelectedSpell] = useState(false);
  const [useWarGodsBlessingOnSelectedSpell, setUseWarGodsBlessingOnSelectedSpell] = useState(false);
  const [useBlessingOfMoonlightOnSelectedSpell, setUseBlessingOfMoonlightOnSelectedSpell] =
    useState(false);
  const [useElementalSmiteOnSelectedSpell, setUseElementalSmiteOnSelectedSpell] = useState(false);
  const [
    selectedElementalSmiteOptionOnSelectedSpell,
    setSelectedElementalSmiteOptionOnSelectedSpell
  ] = useState<PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null>(null);
  const [useStarMapOnSelectedSpell, setUseStarMapOnSelectedSpell] = useState(false);
  const [useMagicInitiateOnSelectedSpell, setUseMagicInitiateOnSelectedSpell] = useState(false);
  const [useFeyMagicOnSelectedSpell, setUseFeyMagicOnSelectedSpell] = useState(false);
  const [useQuickRitualOnSelectedSpell, setUseQuickRitualOnSelectedSpell] = useState(false);
  const [useShadowMagicOnSelectedSpell, setUseShadowMagicOnSelectedSpell] = useState(false);
  const [useDetectThoughtsOnSelectedSpell, setUseDetectThoughtsOnSelectedSpell] = useState(false);
  const [useBoonOfSpellRecallOnSelectedSpell, setUseBoonOfSpellRecallOnSelectedSpell] =
    useState(false);
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
  const [activeWizardSpellFilter, setActiveWizardSpellFilter] =
    useState<WizardSpellViewFilter>("prepared");
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(
    Boolean(
      isSpellManagementModalOpen ||
      activeSpellSlotSheetLevel !== null ||
      selectedSpell ||
      selectedDivinityOptionKey
    )
  );

  const closeSelectedSpell = useCallback(() => {
    setSelectedSpell(null);
    setSelectedSpellViewMode("standard");
    setUseBeguilingMagicOnSelectedSpell(false);
    setUseMindMagicOnSelectedSpell(false);
    setUseWarGodsBlessingOnSelectedSpell(false);
    setUseBlessingOfMoonlightOnSelectedSpell(false);
    setUseElementalSmiteOnSelectedSpell(false);
    setSelectedElementalSmiteOptionOnSelectedSpell(null);
    setUseFeyReinforcementsOnSelectedSpell(false);
    setUseMagicInitiateOnSelectedSpell(false);
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
  const closeSelectedDivinity = useCallback(() => {
    setSelectedDivinityOptionKey(null);
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
  const featGrantedCantripEntries = useMemo(
    () =>
      getFeatGrantedCantripEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const speciesGrantedCantripEntries = useMemo(
    () =>
      getSpeciesGrantedCantripEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const speciesAlwaysPreparedCantripEntries = useMemo(
    () =>
      getSpeciesAlwaysPreparedCantripEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const featAlwaysPreparedCantripEntries = useMemo(
    () =>
      getFeatAlwaysPreparedCantripEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const getSpellcastingAbilityOverrideForSpell = useCallback(
    (spellId: string) =>
      getSpeciesSpellcastingAbilityForCharacter(character, spellId) ??
      getMagicInitiateSpellcastingAbilityForCharacter(character, spellId),
    [character]
  );
  const featAlwaysPreparedSpellEntries = useMemo(
    () =>
      getFeatAlwaysPreparedSpellEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const characterRuntime = useMemo(() => getCharacterRuntime(character), [character]);
  const spellcastingRuntime = characterRuntime.spellcasting;
  const featureAlwaysPreparedSpellIds = spellcastingRuntime.featureAlwaysPreparedSpellIds;
  const featureAlwaysSpellbookSpellIds = spellcastingRuntime.featureAlwaysSpellbookSpellIds;
  const featureRitualOnlySpellIds = spellcastingRuntime.featureRitualOnlySpellIds;
  const basePreparedSpellPoolEntries = usePreparedSpellEntries(
    character.className,
    character.level,
    character.subclassId
  );
  const canCastSpells =
    isSpellcastingClass(character.className, character.level, character.subclassId) ||
    featGrantedCantripEntries.length > 0 ||
    speciesGrantedCantripEntries.length > 0 ||
    featAlwaysPreparedCantripEntries.length > 0 ||
    featAlwaysPreparedSpellEntries.length > 0 ||
    featureAlwaysPreparedSpellIds.length > 0 ||
    featureAlwaysSpellbookSpellIds.length > 0;
  const spellcastingState = spellcastingRuntime.spellcastingState;

  useEffect(() => {
    if (canCastSpells) {
      return;
    }

    closeSelectedSpell();
    closeSelectedDivinity();
    closeSpellSlotActionSheet();
    setIsSpellManagementModalOpen(false);
  }, [canCastSpells, closeSelectedDivinity, closeSelectedSpell, closeSpellSlotActionSheet]);

  useEffect(() => {
    if (!spellcastingState.blocked) {
      return;
    }

    closeSpellSlotActionSheet();
    setIsSpellManagementModalOpen(false);
  }, [closeSpellSlotActionSheet, spellcastingState.blocked]);
  const classSpellEntries = useMemo(
    () => baseClassSpellEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [baseClassSpellEntries, character]
  );
  const preparedSpellPoolEntries = useMemo(
    () => basePreparedSpellPoolEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [basePreparedSpellPoolEntries, character]
  );
  const featureActions = spellcastingRuntime.featureActions;
  const channelDivinityAction = useMemo(
    () =>
      featureActions.find(
        (action) =>
          action.key === channelDivinityActionKey || action.key === paladinChannelDivinityActionKey
      ) ?? null,
    [featureActions]
  );
  const channelDivinityOptions = useMemo(
    () =>
      channelDivinityAction
        ? getFeatureActionOptionsForCharacter(character, channelDivinityAction.key)
        : [],
    [channelDivinityAction, character]
  );
  const channelDivinityRows = useMemo(
    () => createChannelDivinityOptionRows(channelDivinityAction, channelDivinityOptions),
    [channelDivinityAction, channelDivinityOptions]
  );
  const spellcastingChannelDivinityRows = useMemo(
    () => (channelDivinityAction?.key === channelDivinityActionKey ? [] : channelDivinityRows),
    [channelDivinityAction?.key, channelDivinityRows]
  );
  const selectedDivinityRow = useMemo(
    () =>
      selectedDivinityOptionKey
        ? (spellcastingChannelDivinityRows.find(
            (row) => row.option.key === selectedDivinityOptionKey
          ) ?? null)
        : null,
    [selectedDivinityOptionKey, spellcastingChannelDivinityRows]
  );
  const selectedDivinityDisplay = useMemo(
    () =>
      selectedDivinityRow
        ? selectedDivinityRow.action.key === channelDivinityActionKey
          ? getClericResolvedDivinityDisplay(character, selectedDivinityRow.entry)
          : {
              damage: null,
              healing: null,
              valueCell: null,
              description: selectedDivinityRow.entry.description,
              descriptionAdditions: []
            }
        : null,
    [character, selectedDivinityRow]
  );
  const channelDivinityUsesTotal = spellcastingRuntime.channelDivinityUsesTotal;
  const channelDivinityUsesRemaining = spellcastingRuntime.channelDivinityUsesRemaining;
  const bardicInspirationUsesTotal = spellcastingRuntime.bardicInspirationUsesTotal;
  const sorceryPointsRemaining = spellcastingRuntime.sorceryPointsRemaining;
  const sorceryPointsTotal = spellcastingRuntime.sorceryPointsTotal;
  const tamedSurgeUsesRemaining = spellcastingRuntime.tamedSurgeUsesRemaining;
  const tamedSurgeUsesTotal = spellcastingRuntime.tamedSurgeUsesTotal;
  const usesPreparedSpells = usesPreparedSpellsForCharacter(
    character.className,
    character.level,
    character.subclassId
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
    () => classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
    [classSpellEntries]
  );
  const allKnownCantripEntries = useMemo(() => {
    const mergedCantrips = new Map<string, SpellEntry>();

    [...cantripOptions, ...featGrantedCantripEntries, ...speciesGrantedCantripEntries].forEach(
      (spell) => {
        mergedCantrips.set(spell.id, spell);
      }
    );

    return [...mergedCantrips.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [cantripOptions, featGrantedCantripEntries, speciesGrantedCantripEntries]);
  const spellPreparationOptions = useMemo(
    () =>
      preparedSpellPoolEntries.filter((spell) => {
        const spellLevel = getSpellLevel(spell);
        return spellLevel > 0 && spellLevel <= highestSpellSlotLevel;
      }),
    [highestSpellSlotLevel, preparedSpellPoolEntries]
  );
  const usesSpellbook = usesSpellbookForCharacter(character.className, character.subclassId);
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
        character.statusEntries
      ),
    [
      character.classFeatureState,
      character.className,
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
  const featAlwaysPreparedSpellSourceMap = useMemo(
    () => getFeatAlwaysPreparedSpellSourceMapForCharacter(character),
    [character]
  );
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
  const alwaysPreparedCantripIdSet = useMemo(
    () =>
      new Set(
        [...featAlwaysPreparedCantripEntries, ...speciesAlwaysPreparedCantripEntries].map(
          (spell) => spell.id
        )
      ),
    [featAlwaysPreparedCantripEntries, speciesAlwaysPreparedCantripEntries]
  );
  const alwaysPreparedSpellIds = useMemo(
    () => [...new Set([...classAlwaysPreparedSpellIds, ...featAlwaysPreparedSpellIds])],
    [classAlwaysPreparedSpellIds, featAlwaysPreparedSpellIds]
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
        .map((spell) => getSpellEntryForCharacter(character, spell)),
    [alwaysPreparedSpellIds, character]
  );
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
        alwaysPreparedSpellIds
      ).filter((spellId) => !usesSpellbook || selectedSpellbookSpellIdSet.has(spellId)),
    [
      alwaysPreparedSpellIds,
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
          ...featGrantedCantripEntries,
          ...speciesGrantedCantripEntries,
          ...preparedSpellPoolEntries,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [spell.id, spell])
      ),
    [
      alwaysPreparedSpellEntries,
      classSpellEntries,
      featGrantedCantripEntries,
      speciesGrantedCantripEntries,
      preparedSpellPoolEntries
    ]
  );
  const spellbookSpellEntriesById = useMemo(
    () =>
      new Map(
        selectedSpellbookSpellIds.flatMap((spellId) => {
          const spell = knownSpellEntriesById.get(spellId);

          return spell
            ? [[spellId, getSpellbookSpellEntryForCharacter(character, spell)] as const]
            : [];
        })
      ),
    [character, knownSpellEntriesById, selectedSpellbookSpellIds]
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

    return [...selectedCantripEntries.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [
    cantripOptionsById,
    featGrantedCantripEntries,
    selectedCantripIds,
    speciesGrantedCantripEntries
  ]);
  const selectedPreparedSpells = useMemo(() => {
    const preparedSpells = usesPreparedSpells
      ? [...alwaysPreparedSpellIds, ...selectedPreparedSpellIds]
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
    alwaysPreparedSpellIds,
    alwaysPreparedSpellEntries,
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
    () => new Set([...alwaysPreparedSpellIds, ...selectedPreparedSpellIds]),
    [alwaysPreparedSpellIds, selectedPreparedSpellIds]
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
  const hasCantripManagement = cantripLimit !== null && cantripLimit > 0;
  const hasSpellManagementOptions = hasCantripManagement || usesPreparedSpells;
  const spellSelectionInputStatus = useMemo(
    () => getSpellSelectionInputStatusForCharacter(character),
    [character]
  );
  const hasSpellSelectionInputRequired = spellSelectionInputStatus.hasInputRequired;
  const spellOutcomeSummariesById = useMemo(
    () =>
      new Map(
        [
          ...classSpellEntries,
          ...featGrantedCantripEntries,
          ...speciesGrantedCantripEntries,
          ...preparedSpellPoolEntries,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [
          spell.id,
          getSpellOutcomeSummaryForCharacter(
            character,
            spell,
            getSpellcastingAbilityOverrideForSpell(spell.id)
          )
        ])
      ),
    [
      alwaysPreparedSpellEntries,
      character,
      classSpellEntries,
      featGrantedCantripEntries,
      getSpellcastingAbilityOverrideForSpell,
      speciesGrantedCantripEntries,
      preparedSpellPoolEntries
    ]
  );

  const roundTracker = useMemo(
    () => normalizeRoundTracker(character.roundTracker),
    [character.roundTracker]
  );
  const selectedSpellActionPaths = useMemo(
    () => (selectedSpell ? getSpellActionPathStates(character, selectedSpell, roundTracker) : []),
    [character, roundTracker, selectedSpell]
  );
  const selectedDivinityActionWarning = getRoundTrackerActionWarning(
    selectedDivinityRow
      ? getRoundTrackerResourceForEconomyType(selectedDivinityRow.option.economyType)
      : null,
    roundTracker
  );
  const selectedDivinityActionShape = selectedDivinityRow
    ? getActionShapeForCastingTime(selectedDivinityRow.entry.castingTime)
    : null;
  const selectedDivinityActionShapeState = selectedDivinityRow
    ? getDivinityRowActionShapeState(selectedDivinityRow)
    : null;
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
  const selectedSpellSupportsBoonOfSpellRecall = selectedSpell
    ? canUseBoonOfSpellRecallFreeCastingForSpell(character, selectedSpell)
    : false;
  const selectedSpellMagicInitiateAbility = selectedSpell
    ? getSpellcastingAbilityOverrideForSpell(selectedSpell.id)
    : null;
  const selectedSpellSupportsPsionicSorcery =
    selectedSpell !== null &&
    getSpellLevel(selectedSpell) > 0 &&
    canUseSorcererSubclassPsionicSorceryForSpell(character, selectedSpell.id);
  const selectedSpellSupportsTamedSurge =
    selectedSpell !== null && canUseSorcererSubclassTamedSurgeForSpell(character, selectedSpell);
  const selectedSpellSupportsMindMagic = canUseClericMindMagicForSpell(
    character,
    selectedSpell,
    selectedSpellIsPrepared
  );
  const selectedSpellSupportsWarGodsBlessing = canUseClericWarGodsBlessingForSpell(
    character,
    selectedSpell
  );
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
  const selectedSpellMindMagicDisabled =
    selectedSpellSupportsMindMagic && channelDivinityUsesRemaining <= 0;
  const selectedSpellWarGodsBlessingDisabled =
    selectedSpellSupportsWarGodsBlessing && channelDivinityUsesRemaining <= 0;
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
  const selectedSpellDisplay = useMemo(
    () =>
      selectedSpell
        ? getDruidCircleOfTheStarsChaliceHealingSpellEntry(
            character,
            getClericLifeDomainHealingSpellEntry(
              character,
              getClericMindMagicSpellEntry(character, selectedSpell, selectedSpellIsPrepared),
              selectedSpellIsPrepared
            ),
            selectedSpellIsPrepared
          )
        : null,
    [character, selectedSpell, selectedSpellIsPrepared]
  );
  const selectedSpellSupportsBlessingOfMoonlight =
    selectedSpell?.id === "spell-moonbeam" && blessingOfMoonlightUsesTotal > 0;
  const selectedSpellSupportsElementalSmite =
    selectedSpell?.id === "spell-divine-smite" &&
    hasPaladinOathOfTheNobleGeniesElementalSmite(character);
  const selectedSpellElementalSmiteDisabled =
    selectedSpellSupportsElementalSmite && channelDivinityUsesRemaining <= 0;
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
  const selectedSpellDamageDetailOverride = useMemo(() => {
    if (
      !selectedSpellDisplay ||
      (!useElementalSmiteOnSelectedSpell && !useRadiantSoulOnSelectedSpell)
    ) {
      return null;
    }

    const baseDamageDetail = getSpellDamageDetailForCharacter(
      character,
      selectedSpellDisplay,
      selectedSpellMagicInitiateAbility
    );
    const elementalSmiteDamageDetail = useElementalSmiteOnSelectedSpell
      ? getPaladinOathOfTheNobleGeniesElementalSmiteDamageDetail(
          baseDamageDetail,
          selectedElementalSmiteOptionOnSelectedSpell
        )
      : baseDamageDetail;

    return useRadiantSoulOnSelectedSpell
      ? getWarlockCelestialPatronRadiantSoulDamageDetail(
          character,
          selectedSpellDisplay,
          elementalSmiteDamageDetail
        )
      : elementalSmiteDamageDetail;
  }, [
    character,
    selectedElementalSmiteOptionOnSelectedSpell,
    selectedSpellMagicInitiateAbility,
    selectedSpellDisplay,
    useElementalSmiteOnSelectedSpell,
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
    (selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell) ||
    (selectedSpellSupportsWarGodsBlessing && useWarGodsBlessingOnSelectedSpell) ||
    (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) ||
    (selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) ||
    (selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell) ||
    (selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell) ||
    (selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell) ||
    (selectedSpellSupportsDetectThoughts && useDetectThoughtsOnSelectedSpell) ||
    (selectedSpellSupportsBoonOfSpellRecall && useBoonOfSpellRecallOnSelectedSpell) ||
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
      (selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell) ||
      (selectedSpellSupportsWarGodsBlessing && useWarGodsBlessingOnSelectedSpell) ||
      (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) ||
      (selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) ||
      (selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell) ||
      (selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell) ||
      (selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell) ||
      (selectedSpellSupportsDetectThoughts && useDetectThoughtsOnSelectedSpell) ||
      (selectedSpellSupportsBoonOfSpellRecall && useBoonOfSpellRecallOnSelectedSpell)
        ? minimumSlotLevel
        : clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);
    const castsWithoutSpellSlot =
      (selectedSpellFreeCastSlotLevel !== null && slotLevel === selectedSpellFreeCastSlotLevel) ||
      (selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell) ||
      (selectedSpellSupportsWarGodsBlessing && useWarGodsBlessingOnSelectedSpell) ||
      (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) ||
      (selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) ||
      (selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell) ||
      (selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell) ||
      (selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell) ||
      (selectedSpellSupportsDetectThoughts && useDetectThoughtsOnSelectedSpell) ||
      (selectedSpellSupportsBoonOfSpellRecall && useBoonOfSpellRecallOnSelectedSpell);

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
    selectedSpellSupportsMindMagic,
    selectedSpellSupportsMagicInitiate,
    selectedSpellSupportsFeyMagic,
    selectedSpellSupportsQuickRitual,
    selectedSpellSupportsShadowMagic,
    selectedSpellSupportsDetectThoughts,
    selectedSpellSupportsBoonOfSpellRecall,
    selectedSpellSupportsStarMap,
    selectedSpellSupportsWarGodsBlessing,
    spellSlotsExpended,
    useMindMagicOnSelectedSpell,
    useMagicInitiateOnSelectedSpell,
    useFeyMagicOnSelectedSpell,
    useQuickRitualOnSelectedSpell,
    useShadowMagicOnSelectedSpell,
    useDetectThoughtsOnSelectedSpell,
    useBoonOfSpellRecallOnSelectedSpell,
    useStarMapOnSelectedSpell,
    useWarGodsBlessingOnSelectedSpell
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
  const selectedSpellFalseLifeTemporaryHitPointsFormula =
    selectedSpell?.id === falseLifeSpellId ? getFalseLifeTemporaryHitPointsFormula() : null;
  const selectedSpellAttackRollFormula = selectedSpellDisplay
    ? getSpellAttackRollFormulaForCharacter(
        selectedSpellDisplay,
        character,
        selectedSpellMagicInitiateAbility
      )
    : null;
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
    setUseMindMagicOnSelectedSpell(false);
    setUseWarGodsBlessingOnSelectedSpell(false);
    setUseBlessingOfMoonlightOnSelectedSpell(false);
    setUseElementalSmiteOnSelectedSpell(false);
    setSelectedElementalSmiteOptionOnSelectedSpell(null);
    setUseStarMapOnSelectedSpell(false);
    setUseMagicInitiateOnSelectedSpell(false);
    setUseFeyMagicOnSelectedSpell(false);
    setUseQuickRitualOnSelectedSpell(false);
    setUseShadowMagicOnSelectedSpell(false);
    setUseDetectThoughtsOnSelectedSpell(false);
    setUseBoonOfSpellRecallOnSelectedSpell(false);
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
    if (!selectedSpellSupportsMindMagic || !selectedSpellMindMagicDisabled) {
      return;
    }

    setUseMindMagicOnSelectedSpell(false);
  }, [selectedSpellMindMagicDisabled, selectedSpellSupportsMindMagic]);

  useEffect(() => {
    if (!selectedSpellSupportsWarGodsBlessing || !selectedSpellWarGodsBlessingDisabled) {
      return;
    }

    setUseWarGodsBlessingOnSelectedSpell(false);
  }, [selectedSpellSupportsWarGodsBlessing, selectedSpellWarGodsBlessingDisabled]);

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
    if (!selectedSpellSupportsElementalSmite || !selectedSpellElementalSmiteDisabled) {
      return;
    }

    setUseElementalSmiteOnSelectedSpell(false);
    setSelectedElementalSmiteOptionOnSelectedSpell(null);
  }, [selectedSpellElementalSmiteDisabled, selectedSpellSupportsElementalSmite]);

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

  function getSpellRowActionShapes(spell: SpellEntry) {
    return getSpellActionPathStates(character, spell, roundTracker)
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
      .filter((path): path is NonNullable<typeof path> => path !== null);
  }

  function getDivinityRowActionShapeState(row: ChannelDivinityOptionRow) {
    return getActionShapeStateForRoundTrackerResource(
      getRoundTrackerResourceForEconomyType(row.option.economyType),
      roundTracker
    );
  }

  useEffect(() => {
    if (!selectedDivinityOptionKey) {
      return;
    }

    if (selectedDivinityRow) {
      return;
    }

    setSelectedDivinityOptionKey(null);
  }, [selectedDivinityOptionKey, selectedDivinityRow]);

  const openSpellManagementMenu = useCallback(() => {
    if (!hasSpellManagementOptions) {
      return;
    }

    setIsSpellManagementModalOpen(true);
  }, [hasSpellManagementOptions]);

  useEffect(() => {
    if (activeSpellSlotSheetLevel === null && !selectedSpell && !selectedDivinityOptionKey) {
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

        if (selectedDivinityOptionKey) {
          closeSelectedDivinity();
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
    closeSelectedDivinity,
    closeSelectedSpell,
    isSelectedSpellDiceRollerSettingsOpen,
    selectedDivinityOptionKey,
    selectedSpell
  ]);

  const updateSpellSlotsExpended = useCallback(
    (slotLevel: number, delta: number) => {
      onPersistCharacter((currentCharacter) => {
        const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level,
          currentCharacter.subclassId
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
          currentCharacter.subclassId
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

  if (!canCastSpells) {
    return null;
  }

  function openSpellDetails(spell: SpellEntry, viewMode: SelectedSpellViewMode = "standard") {
    closeSelectedDivinity();
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
  }

  function openDivinityDetails(optionKey: string) {
    closeSelectedSpell();
    setSelectedDivinityOptionKey(optionKey);
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

  function rollFalseLifeTemporaryHitPointsForSpellCast(
    spell: Pick<SpellEntry, "id" | "name">,
    spellSlotLevel: number
  ) {
    if (spell.id !== falseLifeSpellId) {
      return;
    }

    openDiceRoller({
      title: spell.name,
      formula: getFalseLifeTemporaryHitPointsFormula(),
      formulaDisplay: getFalseLifeTemporaryHitPointsFormulaDisplay(spellSlotLevel),
      description: `When you cast ${spell.name}, you gain Temporary Hit Points.`,
      onResolvedResult: ({ result }) => {
        const temporaryHitPoints = getFalseLifeTemporaryHitPointsFromRoll(
          result.total,
          spellSlotLevel
        );

        onPersistCharacter((currentCharacter) =>
          applyFalseLifeTemporaryHitPointsToCharacter(currentCharacter, temporaryHitPoints)
        );
      }
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
    useMindMagic?: boolean;
    useWarGodsBlessing?: boolean;
    useStarMap?: boolean;
    useMagicInitiate?: boolean;
    useFeyMagic?: boolean;
    useQuickRitual?: boolean;
    useShadowMagic?: boolean;
    useDetectThoughts?: boolean;
    useBlessingOfMoonlight?: boolean;
    useElementalSmite?: boolean;
    elementalSmiteOption?: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null;
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
    castMageArmorOnSelf?: boolean;
  }) {
    return castSelectedSpellWithContext(
      {
        ACTION_CATEGORY,
        DURATION,
        activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter,
        applyPaladinOathOfTheNobleGeniesElementalSmiteEffect,
        applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter,
        applySpellCastFeatureEffectsForCharacter,
        applySpellConcentrationToStatusEntries,
        applySpellImplementationForCharacter,
        applyWizardEvokerOverchannelUse,
        canUseWarlockCelestialPatronRadiantSoulForSpell,
        canUseWizardEvokerOverchannelForSpellSlot,
        channelDivinityUsesRemaining,
        character,
        clampNumber,
        closeSelectedSpell,
        consumeBeguilingMagicOrBardicInspirationForCharacter,
        consumeBlessingOfMoonlightUseForCharacter,
        consumeFeyTouchedFreeCastForCharacter,
        consumeMagicInitiateFreeCastForCharacter,
        consumeRitualCasterQuickRitualForCharacter,
        consumeShadowTouchedFreeCastForCharacter,
        consumeTelepathicDetectThoughtsFreeCastForCharacter,
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
        expendChannelDivinityUseForCharacter,
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
        rollFalseLifeTemporaryHitPointsForSpellCast,
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
        selectedSpellSupportsElementalSmite,
        selectedSpellSupportsBoonOfSpellRecall,
        selectedSpellSupportsDetectThoughts,
        selectedSpellSupportsFeyMagic,
        selectedSpellSupportsFeyReinforcements,
        selectedSpellSupportsMagicInitiate,
        selectedSpellSupportsMindMagic,
        selectedSpellSupportsMistyWanderer,
        selectedSpellSupportsNaturalRecovery,
        selectedSpellSupportsOverchannel,
        selectedSpellSupportsPsionicSorcery,
        selectedSpellSupportsQuickRitual,
        selectedSpellSupportsShadowMagic,
        selectedSpellSupportsStarMap,
        selectedSpellSupportsStepsOfTheFey,
        selectedSpellSupportsTamedSurge,
        selectedSpellSupportsTelekineticMaster,
        selectedSpellSupportsWarGodsBlessing,
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

  function channelSelectedDivinity() {
    if (!selectedDivinityRow || channelDivinityUsesRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedDivinityRow.option.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        selectedDivinityRow.action.key,
        selectedDivinityRow.option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeSelectedDivinity();
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
    ActionShape,
    CellContainer,
    CharacterSpellDrawer,
    DURATION,
    DivinityListRow,
    Pencil,
    SpellDescriptionContent,
    SpellListRow,
    SpellManagementModal,
    SpellSlotActionSheet,
    TriangleAlert,
    X,
    activeSpellSlotSheetExpended,
    activeSpellSlotSheetLevel,
    activeSpellSlotSheetTotal,
    activeWizardSpellFilter,
    alwaysPreparedSpellIdSet,
    alwaysPreparedSpellIds,
    alwaysSpellbookSpellIdSet,
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
    channelDivinityUsesRemaining,
    channelDivinityUsesTotal,
    channelSelectedDivinity,
    character,
    className,
    closeSelectedDivinity,
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
    formatCodexLabel,
    formatDivinitySubtitle,
    formatFeatureActionOptionRangeLabel,
    formatSpellCastingTime,
    formatSpellGroupTitle,
    frozenHauntFallbackSpellSlotMinimumLevel,
    alwaysPreparedCantripIdSet,
    gameplayActionStyles,
    getActionShapeForEconomyType,
    getDivinityDrawerValueLabel,
    getDivinityRowActionShapeState,
    getSpellRowActionShapes,
    hasSpellManagementOptions,
    hasSpellSelectionInputRequired,
    highestSpellSlotLevel,
    isPreparedSpellPreview,
    isSelectedSpellDiceRollerSettingsOpen,
    isSpellManagementModalOpen,
    knownSpellEntriesById,
    onPersistCharacter,
    openDivinityDetails,
    openSpellDetails,
    openSpellManagementMenu,
    orderDescriptionAdditionSections,
    paladinOathOfTheNobleGeniesElementalSmiteOptions,
    preparedSpellGroups,
    preparedSpellLimit,
    rangerFeyReinforcementsUsesRemaining,
    rangerFeyReinforcementsUsesTotal,
    rangerMistyWandererUsesRemaining,
    rangerMistyWandererUsesTotal,
    resetAllSpellSlotsAtLevel,
    selectedCantripIds,
    selectedDivinityActionShape,
    selectedDivinityActionShapeState,
    selectedDivinityActionWarning,
    selectedDivinityDisplay,
    selectedDivinityOptionKey,
    selectedDivinityRow,
    selectedElementalSmiteOptionOnSelectedSpell,
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
    selectedSpellCanCastAsRitualFromSpellbook,
    selectedSpellCanOnlyBeCastAsRitual,
    selectedSpellCastWarning,
    selectedSpellDamageDetailOverride,
    selectedSpellDetectThoughtsDisabled,
    selectedSpellDetectThoughtsFreeCastState,
    selectedSpellDisplay,
    selectedSpellElementalSmiteDisabled,
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
    selectedSpellMindMagicDisabled,
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
    selectedSpellSupportsElementalSmite,
    selectedSpellSupportsDetectThoughts,
    selectedSpellSupportsFeyMagic,
    selectedSpellSupportsFeyReinforcements,
    selectedSpellSupportsMagicInitiate,
    selectedSpellSupportsMindMagic,
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
    selectedSpellSupportsWarGodsBlessing,
    selectedSpellTamedSurgeDisabled,
    selectedSpellTelekineticMasterDisabled,
    selectedSpellUnderMantleOfMajesty,
    selectedSpellViewMode,
    selectedSpellWarGodsBlessingDisabled,
    setActiveSpellSlotSheetLevel,
    setActiveWizardSpellFilter,
    setIsSelectedSpellDiceRollerSettingsOpen,
    setIsSpellManagementModalOpen,
    setSelectedElementalSmiteOptionOnSelectedSpell,
    setSelectedFrozenHauntFallbackSlotLevel,
    setSelectedSpellSlotLevel,
    setUseBeguilingMagicOnSelectedSpell,
    setUseBewitchingMagicOnSelectedSpell,
    setUseBlessingOfMoonlightOnSelectedSpell,
    setUseBoonOfSpellRecallOnSelectedSpell,
    setUseDetectThoughtsOnSelectedSpell,
    setUseElementalSmiteOnSelectedSpell,
    setUseFeyMagicOnSelectedSpell,
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell,
    setUseFeyReinforcementsOnSelectedSpell,
    setUseFrozenHauntOnSelectedSpell,
    setUseMagicInitiateOnSelectedSpell,
    setUseMindMagicOnSelectedSpell,
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
    setUseWarGodsBlessingOnSelectedSpell,
    shared,
    SheetSurface,
    sheetStyles,
    sorceryPointsRemaining,
    sorceryPointsTotal,
    spellOutcomeSummariesById,
    spellPreparationOptions,
    spellSlotLevels,
    spellSlotTotals,
    spellSlotsRemaining,
    spellbookSpellEntriesById,
    spellcastingChannelDivinityRows,
    spellcastingState,
    styles,
    tamedSurgeUsesRemaining,
    tamedSurgeUsesTotal,
    updateSpellSlotsExpended,
    useBeguilingMagicOnSelectedSpell,
    useBewitchingMagicOnSelectedSpell,
    useBlessingOfMoonlightOnSelectedSpell,
    useElementalSmiteOnSelectedSpell,
    useBoonOfSpellRecallOnSelectedSpell,
    useDetectThoughtsOnSelectedSpell,
    useFeyMagicOnSelectedSpell,
    useFeyReinforcementsNoConcentrationOnSelectedSpell,
    useFeyReinforcementsOnSelectedSpell,
    useFrozenHauntOnSelectedSpell,
    useMagicInitiateOnSelectedSpell,
    useMindMagicOnSelectedSpell,
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
    useWarGodsBlessingOnSelectedSpell,
    usesPreparedSpells,
    usesSpellbook,
    warlockStepsOfTheFeyUsesRemaining,
    warlockStepsOfTheFeyUsesTotal,
    wizardSignatureSpellIdSet,
    wizardSpellMasterySpellIdSet,
    wizardSpellbookOnlyIdSet,
    wizardSpellbookOnlyRitualIdSet
  });
}

export default SpellCastingForm;
