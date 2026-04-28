import clsx from "clsx";
import { Pencil, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ActionShape, { getActionShapeForCastingTime } from "../../../ActionShape";
import CellContainer from "../../../CellContainer/CellContainer";
import DivinityListRow from "../../../DivinityListRow/DivinityListRow";
import EldritchInvocationListRow from "../../../EldritchInvocationListRow";
import SpellListRow from "../../../SpellListRow";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import CharacterSpellDrawer, { type CharacterSpellDrawerMode } from "./CharacterSpellDrawer";
import EldritchInvocationDrawer from "./EldritchInvocationDrawer";
import SpellManagementModal from "./SpellManagementModal";
import SpellSlotActionSheet from "./SpellSlotActionSheet";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../codex/classes";
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
  getBlessingOfMoonlightUsesRemainingForCharacter,
  getBlessingOfMoonlightUsesTotalForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  getAlwaysPreparedSpellIdsForCharacter,
  getAlwaysSpellbookSpellIdsForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotalForCharacter,
  getBeguilingMagicUsesRemainingForCharacter,
  getBeguilingMagicUsesTotalForCharacter,
  getDruidNaturalRecoveryUsesRemainingForCharacter,
  getDruidStarMapGuidingBoltUsesRemainingForCharacter,
  getDruidStarMapGuidingBoltUsesTotalForCharacter,
  getFeatureActionsForCharacter,
  getFeatureActionOptionsForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorTelekineticMasterUsesRemainingForCharacter,
  getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter,
  getRangerFeyReinforcementsUsesRemainingForCharacter,
  getRangerFeyReinforcementsUsesTotalForCharacter,
  getRangerMistyWandererUsesRemainingForCharacter,
  getRangerMistyWandererUsesTotalForCharacter,
  getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter,
  getWarlockStepsOfTheFeyUsesRemainingForCharacter,
  getWarlockStepsOfTheFeyUsesTotalForCharacter,
  hasActiveMantleOfMajestyForCharacter,
  getRitualOnlySpellIdsForCharacter,
  createEconomyMultiContextForSpell,
  getSpellbookSpellEntryForCharacter,
  getSpellEntryForCharacter,
  getSpellcastingStateForCharacter,
  getWarlockEldritchInvocationLimitForCharacter,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  getWarlockInvocationSelectionIdsForCharacter,
  getWarlockLearnedInvocationOptionsForCharacter,
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
  getSorceryPointsTotal,
  getSorceryPointsRemaining,
  spendSorceryPoints
} from "../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import {
  canUseSorcererSubclassPsionicSorceryForSpell,
  canUseSorcererSubclassTamedSurgeForSpell,
  consumeSorcererSubclassTamedSurgeUseForCharacter,
  getSorcererSubclassTamedSurgeUsesRemaining,
  getSorcererSubclassTamedSurgeUsesTotal
} from "../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
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
import { getFeatGrantedCantripEntriesForCharacter } from "../../../../pages/CharactersPage/feats";
import { formatFeatureActionOptionRangeLabel } from "../../../../pages/CharactersPage/actionOutcome";
import { applySpellConcentrationToStatusEntries } from "../../../../pages/CharactersPage/statusEntries";
import { fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId } from "../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterPsiWarriorShared";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import {
  clampNumber,
  formatSpellGroupTitle,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import {
  getRoundTrackerResourceForSpell
} from "../../../../pages/CharactersPage/shared";
import { orderDescriptionAdditionSections } from "../../../../pages/CharactersPage/actionModalDescriptions";
import {
  getSpellDamageDetailForCharacter,
  getSpellOutcomeSummaryForCharacter
} from "../../../../pages/CharactersPage/spellOutcome";
import { getSpellAttackRollFormulaForCharacter } from "../../../../pages/CharactersPage/shared/spellFormulas";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
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
  return roundTrackerResource === "bonusAction" &&
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

function getHighestSpellSlotLevel(spellSlotTotals: number[]): number {
  for (let index = spellSlotTotals.length - 1; index >= 0; index -= 1) {
    if ((spellSlotTotals[index] ?? 0) > 0) {
      return index + 1;
    }
  }

  return 0;
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
  if (!resource || isRoundTrackerResourceAvailable(roundTracker, resource)) {
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
  const isSelected = !resource || isRoundTrackerResourceAvailable(roundTracker, resource);

  return {
    isSelected,
    multiCount: isSelected ? 0 : Math.max(0, Math.floor(multiCount))
  };
}

function SpellCastingForm({ character, className, onPersistCharacter }: SpellCastingFormProps) {
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedDivinityOptionKey, setSelectedDivinityOptionKey] = useState<string | null>(null);
  const [selectedInvocation, setSelectedInvocation] =
    useState<WarlockEldritchInvocationOption | null>(null);
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
  const [useFeyReinforcementsOnSelectedSpell, setUseFeyReinforcementsOnSelectedSpell] =
    useState(false);
  const [usePhantasmalCreaturesOnSelectedSpell, setUsePhantasmalCreaturesOnSelectedSpell] =
    useState(false);
  const [useStepsOfTheFeyOnSelectedSpell, setUseStepsOfTheFeyOnSelectedSpell] = useState(false);
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
      selectedDivinityOptionKey ||
      selectedInvocation
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
    setUsePhantasmalCreaturesOnSelectedSpell(false);
    setUseMistyWandererOnSelectedSpell(false);
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell(false);
    setUseNaturalRecoveryOnSelectedSpell(false);
    setUsePsionicSorceryOnSelectedSpell(false);
    setUseTamedSurgeOnSelectedSpell(false);
    setUseTelekineticMasterOnSelectedSpell(false);
    setUseFrozenHauntOnSelectedSpell(false);
    setIsSelectedSpellDiceRollerSettingsOpen(false);
    setSelectedFrozenHauntFallbackSlotLevel(frozenHauntFallbackSpellSlotMinimumLevel);
  }, []);
  const closeSelectedDivinity = useCallback(() => {
    setSelectedDivinityOptionKey(null);
  }, []);
  const closeSelectedInvocation = useCallback(() => {
    setSelectedInvocation(null);
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
  const featureAlwaysPreparedSpellIds = useMemo(
    () => getAlwaysPreparedSpellIdsForCharacter(character),
    [character]
  );
  const featureAlwaysSpellbookSpellIds = useMemo(
    () => getAlwaysSpellbookSpellIdsForCharacter(character),
    [character]
  );
  const featureRitualOnlySpellIds = useMemo(
    () => getRitualOnlySpellIdsForCharacter(character),
    [character]
  );
  const basePreparedSpellPoolEntries = usePreparedSpellEntries(
    character.className,
    character.level,
    character.subclassId
  );
  const canCastSpells =
    isSpellcastingClass(character.className, character.level, character.subclassId) ||
    featGrantedCantripEntries.length > 0 ||
    featureAlwaysPreparedSpellIds.length > 0 ||
    featureAlwaysSpellbookSpellIds.length > 0;
  const spellcastingState = getSpellcastingStateForCharacter(character);

  useEffect(() => {
    if (canCastSpells) {
      return;
    }

    closeSelectedSpell();
    closeSelectedDivinity();
    closeSelectedInvocation();
    closeSpellSlotActionSheet();
    setIsSpellManagementModalOpen(false);
  }, [
    canCastSpells,
    closeSelectedDivinity,
    closeSelectedInvocation,
    closeSelectedSpell,
    closeSpellSlotActionSheet
  ]);

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
  const featureActions = useMemo(() => getFeatureActionsForCharacter(character), [character]);
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
  const channelDivinityUsesTotal = useMemo(
    () => getChannelDivinityUsesTotalForCharacter(character),
    [character]
  );
  const channelDivinityUsesRemaining = useMemo(
    () => getChannelDivinityUsesRemainingForCharacter(character),
    [character]
  );
  const bardicInspirationUsesTotal = useMemo(
    () => getBardicInspirationUsesTotalForCharacter(character),
    [character]
  );
  const sorceryPointsRemaining = useMemo(() => getSorceryPointsRemaining(character), [character]);
  const sorceryPointsTotal = useMemo(() => getSorceryPointsTotal(character), [character]);
  const tamedSurgeUsesRemaining = useMemo(
    () => getSorcererSubclassTamedSurgeUsesRemaining(character),
    [character]
  );
  const tamedSurgeUsesTotal = useMemo(
    () => getSorcererSubclassTamedSurgeUsesTotal(character),
    [character]
  );
  const usesPreparedSpells = usesPreparedSpellsForCharacter(
    character.className,
    character.level,
    character.subclassId
  );
  const cantripLimit = getCantripLimitForCharacter(
    character.className,
    character.level,
    character.classFeatureState,
    character.subclassId
  );
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    character.className,
    character.level,
    character.subclassId
  );
  const spellSlotTotals = useMemo(
    () =>
      getSpellSlotTotalsForCharacter(character.className, character.level, character.subclassId),
    [character.className, character.level, character.subclassId]
  );
  const spellSlotsExpended = useMemo(
    () => normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals),
    [character.spellSlotsExpended, spellSlotTotals]
  );
  const spellSlotsRemaining = useMemo(
    () =>
      spellSlotTotals.map((total, index) => Math.max(0, total - (spellSlotsExpended[index] ?? 0))),
    [spellSlotTotals, spellSlotsExpended]
  );
  const beguilingMagicUsesTotal = useMemo(
    () => getBeguilingMagicUsesTotalForCharacter(character),
    [character.className, character.level, character.subclassId]
  );
  const beguilingMagicUsesRemaining = useMemo(
    () => getBeguilingMagicUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const blessingOfMoonlightUsesTotal = useMemo(
    () => getBlessingOfMoonlightUsesTotalForCharacter(character),
    [character.className, character.level, character.subclassId]
  );
  const blessingOfMoonlightUsesRemaining = useMemo(
    () => getBlessingOfMoonlightUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const druidNaturalRecoveryUsesRemaining = useMemo(
    () => getDruidNaturalRecoveryUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const druidStarMapGuidingBoltUsesTotal = useMemo(
    () => getDruidStarMapGuidingBoltUsesTotalForCharacter(character),
    [character.abilities, character.className, character.level, character.subclassId]
  );
  const druidStarMapGuidingBoltUsesRemaining = useMemo(
    () => getDruidStarMapGuidingBoltUsesRemainingForCharacter(character),
    [
      character.abilities,
      character.classFeatureState,
      character.className,
      character.level,
      character.subclassId
    ]
  );
  const rangerFeyReinforcementsUsesTotal =
    getRangerFeyReinforcementsUsesTotalForCharacter(character);
  const rangerFeyReinforcementsUsesRemaining =
    getRangerFeyReinforcementsUsesRemainingForCharacter(character);
  const rangerMistyWandererUsesTotal = getRangerMistyWandererUsesTotalForCharacter(character);
  const rangerMistyWandererUsesRemaining =
    getRangerMistyWandererUsesRemainingForCharacter(character);
  const warlockStepsOfTheFeyUsesTotal = getWarlockStepsOfTheFeyUsesTotalForCharacter(character);
  const warlockStepsOfTheFeyUsesRemaining =
    getWarlockStepsOfTheFeyUsesRemainingForCharacter(character);
  const fighterPsiWarriorTelekineticMasterUsesTotal = useMemo(
    () => getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter(character),
    [character.className, character.level, character.subclassId]
  );
  const fighterPsiWarriorTelekineticMasterUsesRemaining = useMemo(
    () => getFighterPsiWarriorTelekineticMasterUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const fighterPsiWarriorEnergyDiceRemaining = useMemo(
    () => getFighterPsiWarriorEnergyDiceRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const fighterPsiWarriorEnergyDiceTotal = useMemo(
    () => getFighterPsiWarriorEnergyDiceTotalForCharacter(character),
    [character.className, character.level, character.subclassId]
  );
  const bardicInspirationUsesRemaining = useMemo(
    () => getBardicInspirationUsesRemainingForCharacter(character),
    [
      character.abilities,
      character.classFeatureState,
      character.className,
      character.feats,
      character.level
    ]
  );
  const highestSpellSlotLevel = useMemo(
    () => getHighestSpellSlotLevel(spellSlotTotals),
    [spellSlotTotals]
  );
  const cantripOptions = useMemo(
    () => classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
    [classSpellEntries]
  );
  const allKnownCantripEntries = useMemo(() => {
    const mergedCantrips = new Map<string, SpellEntry>();

    [...cantripOptions, ...featGrantedCantripEntries].forEach((spell) => {
      mergedCantrips.set(spell.id, spell);
    });

    return [...mergedCantrips.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [cantripOptions, featGrantedCantripEntries]);
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
  const alwaysPreparedSpellIds = useMemo(
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
          ...preparedSpellPoolEntries,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [spell.id, spell])
      ),
    [
      alwaysPreparedSpellEntries,
      classSpellEntries,
      featGrantedCantripEntries,
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

    return [...selectedCantripEntries.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [cantripOptionsById, featGrantedCantripEntries, selectedCantripIds]);
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
  const selectedInvocationIds = useMemo(
    () => getWarlockInvocationSelectionIdsForCharacter(character),
    [character]
  );
  const hasCantripManagement = cantripLimit !== null && cantripLimit > 0;
  const eldritchInvocationLimit = getWarlockEldritchInvocationLimitForCharacter(character);
  const hasEldritchInvocationManagement = eldritchInvocationLimit > 0;
  const selectedInvocationCount = selectedInvocationIds.length;
  const hasSpellManagementOptions =
    hasCantripManagement || hasEldritchInvocationManagement || usesPreparedSpells;
  const spellSelectionInputStatus = useMemo(
    () => getSpellSelectionInputStatusForCharacter(character),
    [character]
  );
  const hasSpellSelectionInputRequired = spellSelectionInputStatus.hasInputRequired;
  const learnedInvocationOptions = useMemo(
    () => getWarlockLearnedInvocationOptionsForCharacter(character),
    [character]
  );
  const spellOutcomeSummariesById = useMemo(
    () =>
      new Map(
        [
          ...classSpellEntries,
          ...featGrantedCantripEntries,
          ...preparedSpellPoolEntries,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [spell.id, getSpellOutcomeSummaryForCharacter(character, spell)])
      ),
    [
      alwaysPreparedSpellEntries,
      character,
      classSpellEntries,
      featGrantedCantripEntries,
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
    ? alwaysPreparedSpellIdSet.has(selectedSpell.id)
    : false;
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
  const selectedSpellElementalSmiteDamageDetail = useMemo(() => {
    if (!selectedSpellDisplay || !useElementalSmiteOnSelectedSpell) {
      return null;
    }

    return getPaladinOathOfTheNobleGeniesElementalSmiteDamageDetail(
      getSpellDamageDetailForCharacter(character, selectedSpellDisplay),
      selectedElementalSmiteOptionOnSelectedSpell
    );
  }, [
    character,
    selectedElementalSmiteOptionOnSelectedSpell,
    selectedSpellDisplay,
    useElementalSmiteOnSelectedSpell
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
    (selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell) ||
    (selectedSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnSelectedSpell) ||
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
      (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell)
        ? minimumSlotLevel
        : clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);
    const castsWithoutSpellSlot =
      (selectedSpellFreeCastSlotLevel !== null && slotLevel === selectedSpellFreeCastSlotLevel) ||
      (selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell) ||
      (selectedSpellSupportsWarGodsBlessing && useWarGodsBlessingOnSelectedSpell) ||
      (selectedSpellSupportsStarMap && useStarMapOnSelectedSpell);

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
    selectedSpellSupportsStarMap,
    selectedSpellSupportsWarGodsBlessing,
    spellSlotsExpended,
    useMindMagicOnSelectedSpell,
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
  const selectedSpellAttackRollFormula = selectedSpellDisplay
    ? getSpellAttackRollFormulaForCharacter(selectedSpellDisplay, character)
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
    setUseFeyReinforcementsOnSelectedSpell(false);
    setUsePhantasmalCreaturesOnSelectedSpell(false);
    setUseStepsOfTheFeyOnSelectedSpell(false);
    setUseMistyWandererOnSelectedSpell(false);
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell(false);
    setUseNaturalRecoveryOnSelectedSpell(false);
    setUsePsionicSorceryOnSelectedSpell(false);
    setUseTelekineticMasterOnSelectedSpell(false);
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
    if (!selectedSpellSupportsStarMap || !selectedSpellStarMapDisabled) {
      return;
    }

    setUseStarMapOnSelectedSpell(false);
  }, [selectedSpellStarMapDisabled, selectedSpellSupportsStarMap]);

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
    if (!selectedSpellSupportsStepsOfTheFey || !selectedSpellStepsOfTheFeyDisabled) {
      return;
    }

    setUseStepsOfTheFeyOnSelectedSpell(false);
  }, [selectedSpellStepsOfTheFeyDisabled, selectedSpellSupportsStepsOfTheFey]);

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

  useEffect(() => {
    if (!selectedInvocation || isSpellManagementModalOpen) {
      return;
    }

    if (
      learnedInvocationOptions.some(
        (option) => option.selectionId === selectedInvocation.selectionId
      )
    ) {
      return;
    }

    setSelectedInvocation(null);
  }, [isSpellManagementModalOpen, learnedInvocationOptions, selectedInvocation]);

  const openSpellManagementMenu = useCallback(() => {
    if (!hasSpellManagementOptions) {
      return;
    }

    setIsSpellManagementModalOpen(true);
  }, [hasSpellManagementOptions]);

  useEffect(() => {
    if (
      activeSpellSlotSheetLevel === null &&
      !selectedSpell &&
      !selectedDivinityOptionKey &&
      !selectedInvocation
    ) {
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

        if (selectedInvocation) {
          closeSelectedInvocation();
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
    closeSelectedInvocation,
    closeSelectedSpell,
    isSelectedSpellDiceRollerSettingsOpen,
    selectedDivinityOptionKey,
    selectedInvocation,
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
    closeSelectedInvocation();
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
    closeSelectedInvocation();
    setSelectedDivinityOptionKey(optionKey);
  }

  function openInvocationDetails(option: WarlockEldritchInvocationOption) {
    closeSelectedSpell();
    closeSelectedDivinity();
    setSelectedInvocation(option);
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

  function rollSpellAttackForSpellCast(
    spell: Pick<SpellEntry, "isAttackSpell" | "isSavingThrowSpell" | "name" | "spellLists">
  ) {
    const attackRollFormula = getSpellAttackRollFormulaForCharacter(spell, character);

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
    useNaturalRecovery?: boolean;
    usePsionicSorcery?: boolean;
    useTamedSurge?: boolean;
    useTelekineticMaster?: boolean;
  }) {
    if (!selectedSpell || (spellcastingState.blocked && !selectedSpellCanIgnoreSpellcastingBlock)) {
      return;
    }

    const spellLevel = getSpellLevel(selectedSpell);
    const roundTrackerResource =
      options?.roundTrackerResourceOverride ??
      selectedSpellActionPaths[0]?.roundTrackerResource ??
      getRoundTrackerResourceForSpell(selectedSpell);
    const selectedSpellActionPath =
      selectedSpellActionPaths.find((path) => path.roundTrackerResource === roundTrackerResource) ??
      selectedSpellActionPaths[0] ??
      null;
    const sharedEconomyContext = selectedSpellActionPath
      ? {
          economyType: selectedSpellActionPath.economyType,
          actionCategory: ACTION_CATEGORY.MAGIC,
          spellLevel: selectedSpell.spellLevel
        }
      : createEconomyMultiContextForSpell(selectedSpell);
    const castAsRitual = options?.castAsRitual === true && selectedSpell.ritual === true;
    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useMindMagic =
      options?.useMindMagic === true &&
      selectedSpellSupportsMindMagic &&
      channelDivinityUsesRemaining > 0;
    const useWarGodsBlessing =
      options?.useWarGodsBlessing === true &&
      selectedSpellSupportsWarGodsBlessing &&
      channelDivinityUsesRemaining > 0;
    const useStarMap = options?.useStarMap === true && selectedSpellSupportsStarMap;
    const useBlessingOfMoonlight = options?.useBlessingOfMoonlight === true;
    const useElementalSmite =
      options?.useElementalSmite === true &&
      selectedSpellSupportsElementalSmite &&
      channelDivinityUsesRemaining > 0;
    const elementalSmiteOption = useElementalSmite ? (options?.elementalSmiteOption ?? null) : null;
    const useStepsOfTheFey =
      options?.useStepsOfTheFey === true &&
      selectedSpellSupportsStepsOfTheFey &&
      warlockStepsOfTheFeyUsesRemaining > 0;
    const useMistyWanderer =
      options?.useMistyWanderer === true &&
      selectedSpellSupportsMistyWanderer &&
      rangerMistyWandererUsesRemaining > 0;
    const useFeyReinforcements =
      options?.useFeyReinforcements === true &&
      selectedSpellSupportsFeyReinforcements &&
      rangerFeyReinforcementsUsesRemaining > 0;
    const usePhantasmalCreatures =
      options?.usePhantasmalCreatures === true &&
      selectedSpellPhantasmalCreaturesOptionState !== null &&
      selectedSpellPhantasmalCreaturesOptionState.usesRemaining > 0;
    const useFeyReinforcementsNoConcentration =
      useFeyReinforcements && options?.useFeyReinforcementsNoConcentration === true;
    const useNaturalRecovery = options?.useNaturalRecovery === true;
    const usePsionicSorcery =
      options?.usePsionicSorcery === true && selectedSpellSupportsPsionicSorcery;
    const useTamedSurge =
      options?.useTamedSurge === true &&
      selectedSpellSupportsTamedSurge &&
      tamedSurgeUsesRemaining > 0;
    const useTelekineticMaster =
      options?.useTelekineticMaster === true &&
      selectedSpellSupportsTelekineticMaster &&
      (fighterPsiWarriorTelekineticMasterUsesRemaining > 0 ||
        fighterPsiWarriorEnergyDiceRemaining > 0);
    const useFrozenHaunt =
      options?.useFrozenHaunt === true && selectedSpellFrozenHauntOptionState !== null;
    const frozenHauntFallbackSlotLevel = useFrozenHaunt
      ? (options?.frozenHauntFallbackSlotLevel ?? null)
      : null;
    const spellForStatusEntries = useFeyReinforcementsNoConcentration
      ? {
          name: selectedSpell.name,
          duration: ["1 minute"]
        }
      : useWarGodsBlessing && selectedSpell.duration.includes(DURATION.CONCENTRATION)
        ? {
            name: selectedSpell.name,
            duration: selectedSpell.duration.filter(
              (durationPart) => durationPart !== DURATION.CONCENTRATION
            )
          }
        : selectedSpell;
    const concentrationStatusOptions = useTelekineticMaster
      ? {
          sourceId: fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId
        }
      : undefined;
    const canCastSpellbookRitual =
      selectedSpellIsSpellbookOnly &&
      castAsRitual &&
      (hasWizardRitualAdept || selectedSpellCanOnlyBeCastAsRitual);

    if (selectedSpellIsSpellbookOnly && !canCastSpellbookRitual) {
      return;
    }

    if (useElementalSmite && elementalSmiteOption === null) {
      return;
    }

    if (spellLevel === 0) {
      if (roundTrackerResource) {
        onPersistCharacter((currentCharacter) => {
          const preparedCharacter = prepareCharacterForResourceConsumption(
            currentCharacter,
            roundTrackerResource
          );
          const nextCharacter = {
            ...preparedCharacter,
            statusEntries: applySpellConcentrationToStatusEntries(
              preparedCharacter.statusEntries,
              spellForStatusEntries,
              concentrationStatusOptions
            )
          };
          const nextCharacterWithBeguilingMagic = useBeguilingMagic
            ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacter)
            : nextCharacter;
          const nextCharacterWithMindMagic = useMindMagic
            ? expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic)
            : nextCharacterWithBeguilingMagic;
          const nextCharacterWithSpellOptions = useBlessingOfMoonlight
            ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithMindMagic)
            : nextCharacterWithMindMagic;
          const nextCharacterWithElementalSmite = useElementalSmite
            ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
                expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
                elementalSmiteOption
              )
            : nextCharacterWithSpellOptions;

          const nextCharacterWithSharedMulti = consumeSharedEconomyMultiForCharacterAction(
            nextCharacterWithElementalSmite,
            sharedEconomyContext
          );

          if (nextCharacterWithSharedMulti !== nextCharacterWithElementalSmite) {
            return applySpellCastFeatureEffectsForCharacter(
              nextCharacterWithSharedMulti,
              selectedSpell
            );
          }

          const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
            nextCharacterWithElementalSmite,
            selectedSpell
          );
          const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpForSpellCastIfEligible(
            nextCharacterWithSpellCastEffects,
            roundTrackerResource
          );

          return consumeRoundTrackerResourceForCharacter(
            nextCharacterWithFleetStep,
            roundTrackerResource
          );
        });
      } else {
        onPersistCharacter((currentCharacter) => {
          const nextCharacter = useBeguilingMagic
            ? consumeBeguilingMagicOrBardicInspirationForCharacter(currentCharacter)
            : currentCharacter;
          const nextCharacterWithMindMagic = useMindMagic
            ? expendChannelDivinityUseForCharacter(nextCharacter)
            : nextCharacter;
          const nextCharacterWithSpellOptions = useBlessingOfMoonlight
            ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithMindMagic)
            : nextCharacterWithMindMagic;
          const nextCharacterWithElementalSmite = useElementalSmite
            ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
                expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
                elementalSmiteOption
              )
            : nextCharacterWithSpellOptions;

          const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
            nextCharacterWithElementalSmite,
            selectedSpell
          );

          return {
            ...nextCharacterWithSpellCastEffects,
            statusEntries: applySpellConcentrationToStatusEntries(
              nextCharacterWithSpellCastEffects.statusEntries,
              spellForStatusEntries,
              concentrationStatusOptions
            )
          };
        });
      }

      rollHuntersRimeTemporaryHitPointsForSpellCast(selectedSpell);
      rollSpellAttackForSpellCast(selectedSpell);
      closeSelectedSpell();
      return;
    }

    if (castAsRitual) {
      onPersistCharacter((currentCharacter) => {
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = {
          ...preparedCharacter,
          statusEntries: applySpellConcentrationToStatusEntries(
            preparedCharacter.statusEntries,
            spellForStatusEntries,
            concentrationStatusOptions
          )
        };
        const nextCharacterWithBeguilingMagic = useBeguilingMagic
          ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacter)
          : nextCharacter;
        const nextCharacterWithMindMagic = useMindMagic
          ? expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic)
          : nextCharacterWithBeguilingMagic;
        const nextCharacterWithSpellOptions = useBlessingOfMoonlight
          ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithMindMagic)
          : nextCharacterWithMindMagic;
        const nextCharacterWithElementalSmite = useElementalSmite
          ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
              expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
              elementalSmiteOption
            )
          : nextCharacterWithSpellOptions;

        const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
          nextCharacterWithElementalSmite,
          selectedSpell,
          { includeBardBattleMagic: false }
        );
        const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpForSpellCastIfEligible(
          nextCharacterWithSpellCastEffects,
          roundTrackerResource
        );

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(
              nextCharacterWithFleetStep,
              roundTrackerResource
            )
          : nextCharacterWithFleetStep;
      });

      rollHuntersRimeTemporaryHitPointsForSpellCast(selectedSpell);
      rollSpellAttackForSpellCast(selectedSpell);
      closeSelectedSpell();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel =
      useMindMagic ||
      useWarGodsBlessing ||
      useStarMap ||
      useStepsOfTheFey ||
      useMistyWanderer ||
      useFeyReinforcements ||
      usePhantasmalCreatures
        ? minimumSlotLevel
        : clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);
    const castsFreeViaSpellMastery =
      selectedSpellIsWizardSpellMastery && slotLevel === minimumSlotLevel;
    const castsFreeViaSignatureSpells =
      selectedSpellIsWizardSignatureSpell &&
      slotLevel === wizardSignatureSpellLevel &&
      hasWizardSignatureSpellFreeCastAvailableForCharacter(character, selectedSpell.id);
    const castsFreeViaNaturalRecovery =
      useNaturalRecovery &&
      selectedSpellSupportsNaturalRecovery &&
      druidNaturalRecoveryUsesRemaining > 0 &&
      slotLevel === spellLevel;
    const castsFreeViaStarMap = useStarMap;
    const castsFreeViaMindMagic = useMindMagic;
    const castsFreeViaWarGodsBlessing = useWarGodsBlessing;
    const castsFreeViaPsionicSorcery = usePsionicSorcery && sorceryPointsRemaining >= slotLevel;
    const castsFreeViaStepsOfTheFey = useStepsOfTheFey;
    const castsFreeViaMistyWanderer = useMistyWanderer;
    const castsFreeViaFeyReinforcements = useFeyReinforcements;
    const castsFreeViaPhantasmalCreatures = usePhantasmalCreatures;
    const castsFreeViaTelekineticMaster = useTelekineticMaster;
    const castsWithoutSpellSlot =
      castsFreeViaSpellMastery ||
      castsFreeViaSignatureSpells ||
      castsFreeViaNaturalRecovery ||
      castsFreeViaStarMap ||
      castsFreeViaMindMagic ||
      castsFreeViaWarGodsBlessing ||
      castsFreeViaPsionicSorcery ||
      castsFreeViaStepsOfTheFey ||
      castsFreeViaMistyWanderer ||
      castsFreeViaFeyReinforcements ||
      castsFreeViaPhantasmalCreatures ||
      castsFreeViaTelekineticMaster;

    if (usePsionicSorcery && sorceryPointsRemaining < slotLevel) {
      return;
    }

    if (!castsWithoutSpellSlot && (spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
        preparedCharacter.className,
        preparedCharacter.level,
        preparedCharacter.subclassId
      );
      const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
        preparedCharacter.spellSlotsExpended,
        currentSpellSlotTotals
      );
      const preparedCharacterSorceryPointsRemaining = getSorceryPointsRemaining(preparedCharacter);
      const nextSpellSlotsExpended = [...currentSpellSlotsExpended];
      const currentFrozenHauntOptionState =
        getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
          preparedCharacter,
          selectedSpell,
          currentSpellSlotTotals,
          nextSpellSlotsExpended
        );
      const currentPhantasmalCreaturesOptionState =
        getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter(
          preparedCharacter,
          selectedSpell
        );
      const currentDruidStarMapGuidingBoltUsesRemaining =
        getDruidStarMapGuidingBoltUsesRemainingForCharacter(preparedCharacter);

      if (!castsWithoutSpellSlot) {
        if (
          (currentSpellSlotTotals[slotLevel - 1] ?? 0) -
            (nextSpellSlotsExpended[slotLevel - 1] ?? 0) <=
          0
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;
      }

      if (castsFreeViaPsionicSorcery && preparedCharacterSorceryPointsRemaining < slotLevel) {
        return currentCharacter;
      }

      if (castsFreeViaStarMap && currentDruidStarMapGuidingBoltUsesRemaining <= 0) {
        return currentCharacter;
      }

      const usesFrozenHauntCharge =
        useFrozenHaunt && (currentFrozenHauntOptionState?.usesRemaining ?? 0) > 0;
      const shouldSpendFrozenHauntFallbackSlot = useFrozenHaunt && !usesFrozenHauntCharge;

      if (shouldSpendFrozenHauntFallbackSlot) {
        const availableFrozenHauntFallbackSlotLevels =
          getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
            preparedCharacter,
            selectedSpell,
            currentSpellSlotTotals,
            nextSpellSlotsExpended
          )?.fallbackSpellSlotLevels ?? [];

        if (
          frozenHauntFallbackSlotLevel === null ||
          !availableFrozenHauntFallbackSlotLevels.includes(frozenHauntFallbackSlotLevel)
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[frozenHauntFallbackSlotLevel - 1] =
          (nextSpellSlotsExpended[frozenHauntFallbackSlotLevel - 1] ?? 0) + 1;
      }

      if (castsFreeViaPhantasmalCreatures) {
        if ((currentPhantasmalCreaturesOptionState?.usesRemaining ?? 0) <= 0) {
          return currentCharacter;
        }
      }

      const nextCharacter = castsFreeViaSignatureSpells
        ? consumeWizardSignatureSpellFreeCastForCharacter(preparedCharacter, selectedSpell.id)
        : preparedCharacter;
      const nextCharacterWithPsionicSorcery = castsFreeViaPsionicSorcery
        ? spendSorceryPoints(nextCharacter, slotLevel)
        : nextCharacter;
      const nextCharacterWithSpellcast = {
        ...nextCharacterWithPsionicSorcery,
        spellSlotsExpended:
          castsWithoutSpellSlot && !shouldSpendFrozenHauntFallbackSlot
            ? nextCharacterWithPsionicSorcery.spellSlotsExpended
            : nextSpellSlotsExpended,
        statusEntries: useFrozenHaunt
          ? applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter(
              applySpellConcentrationToStatusEntries(
                nextCharacterWithPsionicSorcery.statusEntries,
                spellForStatusEntries,
                concentrationStatusOptions
              )
            )
          : applySpellConcentrationToStatusEntries(
              nextCharacterWithPsionicSorcery.statusEntries,
              spellForStatusEntries,
              concentrationStatusOptions
            )
      };
      const nextCharacterWithTelekineticMaster = castsFreeViaTelekineticMaster
        ? activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter(
            nextCharacterWithSpellcast
          )
        : nextCharacterWithSpellcast;
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithTelekineticMaster)
        : nextCharacterWithTelekineticMaster;
      const nextCharacterWithMindMagic = castsFreeViaMindMagic
        ? expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic)
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithWarGodsBlessing = castsFreeViaWarGodsBlessing
        ? expendChannelDivinityUseForCharacter(nextCharacterWithMindMagic)
        : nextCharacterWithMindMagic;
      const nextCharacterWithSpellOptions = useBlessingOfMoonlight
        ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithWarGodsBlessing)
        : nextCharacterWithWarGodsBlessing;
      const nextCharacterWithElementalSmite = useElementalSmite
        ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
            expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
            elementalSmiteOption
          )
        : nextCharacterWithSpellOptions;
      const nextCharacterWithNaturalRecovery = castsFreeViaNaturalRecovery
        ? consumeDruidNaturalRecoveryUseForCharacter(nextCharacterWithElementalSmite)
        : nextCharacterWithElementalSmite;
      const nextCharacterWithStarMap = castsFreeViaStarMap
        ? consumeDruidStarMapGuidingBoltUseForCharacter(nextCharacterWithNaturalRecovery)
        : nextCharacterWithNaturalRecovery;
      const nextCharacterWithStepsOfTheFey = castsFreeViaStepsOfTheFey
        ? consumeWarlockStepsOfTheFeyUseForCharacter(nextCharacterWithStarMap)
        : nextCharacterWithStarMap;
      const nextCharacterWithMistyWanderer = castsFreeViaMistyWanderer
        ? consumeRangerMistyWandererUseForCharacter(nextCharacterWithStepsOfTheFey)
        : nextCharacterWithStepsOfTheFey;
      const nextCharacterWithFeyReinforcements = castsFreeViaFeyReinforcements
        ? consumeRangerFeyReinforcementsUseForCharacter(nextCharacterWithMistyWanderer)
        : nextCharacterWithMistyWanderer;
      const nextCharacterWithPhantasmalCreatures = castsFreeViaPhantasmalCreatures
        ? consumeWizardIllusionistPhantasmalCreaturesUseForCharacter(
            nextCharacterWithFeyReinforcements
          )
        : nextCharacterWithFeyReinforcements;
      const nextCharacterWithFrozenHaunt = usesFrozenHauntCharge
        ? consumeRangerWinterWalkerFrozenHauntUseForCharacter(nextCharacterWithPhantasmalCreatures)
        : nextCharacterWithPhantasmalCreatures;
      const spellConsumedSpellSlot = !castsWithoutSpellSlot || shouldSpendFrozenHauntFallbackSlot;
      const nextCharacterWithTamedSurge =
        useTamedSurge && spellConsumedSpellSlot
          ? consumeSorcererSubclassTamedSurgeUseForCharacter(nextCharacterWithFrozenHaunt)
          : nextCharacterWithFrozenHaunt;
      const spellCastFeatureEffectSlotLevel = spellConsumedSpellSlot
        ? shouldSpendFrozenHauntFallbackSlot
          ? frozenHauntFallbackSlotLevel
          : slotLevel
        : null;
      const nextCharacterWithSorcererSubclassRecharge = spellConsumedSpellSlot
        ? restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter(nextCharacterWithTamedSurge)
        : nextCharacterWithTamedSurge;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithSorcererSubclassRecharge,
        selectedSpell,
        {
          spellSlotLevel: spellCastFeatureEffectSlotLevel
        }
      );
      const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpForSpellCastIfEligible(
        nextCharacterWithSpellCastEffects,
        roundTrackerResource
      );

      if (castsFreeViaTelekineticMaster && roundTrackerResource) {
        return consumeRoundTrackerResourceForCharacter(
          nextCharacterWithFleetStep,
          roundTrackerResource
        );
      }

      const nextCharacterWithSharedMulti = roundTrackerResource
        ? consumeSharedEconomyMultiForCharacterAction(
            nextCharacterWithSpellCastEffects,
            sharedEconomyContext
          )
        : nextCharacterWithSpellCastEffects;

      if (nextCharacterWithSharedMulti !== nextCharacterWithSpellCastEffects) {
        return nextCharacterWithSharedMulti;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacterWithFleetStep, roundTrackerResource)
        : nextCharacterWithFleetStep;
    });

    rollHuntersRimeTemporaryHitPointsForSpellCast(selectedSpell);
    rollSpellAttackForSpellCast(selectedSpell);
    closeSelectedSpell();
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

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Spellcasting</p>
          <h3 className={shared.subtitle}>
            {hasEldritchInvocationManagement
              ? "Invocations, prepared spells, and spell slots"
              : usesSpellbook
                ? "Spellbook, prepared spells, and spell slots"
                : "Prepared spells and spell slots"}
          </h3>
        </div>
        <div className={shared.headerActions}>
          {hasSpellSelectionInputRequired ? (
            <span className={styles.spellInputRequired}>
              <TriangleAlert size={16} aria-hidden="true" />
              INPUT REQUIRED
            </span>
          ) : null}
          {hasSpellManagementOptions ? (
            <button
              type="button"
              className={shared.editButton}
              onClick={openSpellManagementMenu}
              disabled={spellcastingState.blocked}
            >
              <Pencil size={16} />
              Edit
            </button>
          ) : null}
        </div>
      </div>

      {spellcastingState.reason ? (
        <p className={styles.spellcastingBlockedNotice}>{spellcastingState.reason}</p>
      ) : null}

      <div className={styles.spellSlotHeader}>
        <p className={styles.spellGroupTitle}>Spell slots</p>
      </div>
      <div className={styles.spellSlotGrid}>
        {spellSlotLevels.map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;

          return (
            <button
              key={slotLevel}
              type="button"
              className={clsx(
                styles.spellSlotCard,
                styles.spellSlotCardButton,
                totalSlots === 0 && styles.spellSlotCardEmpty
              )}
              onClick={() => setActiveSpellSlotSheetLevel(slotLevel)}
              disabled={spellcastingState.blocked}
              aria-label={
                totalSlots > 0
                  ? `Manage level ${slotLevel} spell slots (${remainingSlots} of ${totalSlots} remaining)`
                  : `Manage level ${slotLevel} spell slots (no slots available)`
              }
            >
              <span>L{slotLevel}</span>
              {totalSlots === 0 ? (
                <small className={styles.spellSlotDash}>-</small>
              ) : (
                <div className={styles.spellSlotSquares}>
                  {Array.from({ length: totalSlots }, (_, index) => (
                    <span
                      key={`${slotLevel}-${index}`}
                      className={clsx(
                        styles.spellSlotSquare,
                        index < remainingSlots && styles.spellSlotSquareFilled
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {usesSpellbook ? (
        <div className={styles.wizardFilterBar} role="tablist" aria-label="Wizard spell view">
          {(
            [
              ["all", "All Spellbook"],
              ["prepared", "Prepared"]
            ] as const
          ).map(([filterKey, label]) => (
            <button
              key={filterKey}
              type="button"
              role="tab"
              aria-selected={activeWizardSpellFilter === filterKey}
              className={clsx(
                styles.wizardFilterButton,
                activeWizardSpellFilter === filterKey && styles.wizardFilterButtonActive
              )}
              onClick={() => setActiveWizardSpellFilter(filterKey)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.spellListStack}>
        {learnedInvocationOptions.length > 0 ? (
          <div className={styles.spellGroup}>
            <p className={styles.spellGroupTitle}>
              {`Eldritch Invocations (${selectedInvocationCount}/${eldritchInvocationLimit})`}
            </p>
            <ul className={styles.spellList}>
              {learnedInvocationOptions.map((option) => (
                <li key={option.selectionId}>
                  <EldritchInvocationListRow
                    name={option.displayName}
                    subtitle={option.displaySubtitle}
                    metaText="Eldritch Invocation"
                    onClick={() => openInvocationDetails(option)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {spellcastingChannelDivinityRows.length > 0 ? (
          <div className={styles.spellGroup}>
            <p className={styles.spellGroupTitle}>
              {`Channel Divinity (uses ${channelDivinityUsesRemaining}/${channelDivinityUsesTotal})`}
            </p>
            <ul className={styles.spellList}>
              {spellcastingChannelDivinityRows.map((row) => (
                <li key={row.option.key}>
                  {(() => {
                    const actionShapeState = getDivinityRowActionShapeState(row);

                    return (
                      <DivinityListRow
                        divinity={{
                          ...row.entry,
                          name: row.option.name
                        }}
                        onClick={() => openDivinityDetails(row.option.key)}
                        valueSummary={formatFeatureActionOptionRangeLabel(row.option)}
                        actionShapeSelected={actionShapeState.isSelected}
                        actionShapeMultiCount={actionShapeState.multiCount}
                      />
                    );
                  })()}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {preparedSpellGroups.length === 0 &&
        spellcastingChannelDivinityRows.length === 0 &&
        learnedInvocationOptions.length === 0 ? (
          <p className={shared.emptyText}>
            No spells, cantrips, or eldritch invocations have been selected yet.
          </p>
        ) : (
          preparedSpellGroups.map((group) => (
            <div key={group.level} className={styles.spellGroup}>
              <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
              <ul className={styles.spellList}>
                {group.spells.map((spell) => (
                  <li key={spell.id}>
                    {(() => {
                      const actionShapes = getSpellRowActionShapes(spell);

                      return (
                        <SpellListRow
                          spell={spell}
                          onClick={() => openSpellDetails(spell)}
                          valueSummary={
                            wizardSpellbookOnlyIdSet.has(spell.id)
                              ? ""
                              : (spellOutcomeSummariesById.get(spell.id) ?? "")
                          }
                          detailNote={
                            wizardSpellbookOnlyRitualIdSet.has(spell.id)
                              ? "Ritual from spellbook"
                              : wizardSpellbookOnlyIdSet.has(spell.id)
                                ? "In Spellbook but not prepared"
                                : undefined
                          }
                          detailNoteTone={
                            wizardSpellbookOnlyIdSet.has(spell.id) ? "accent" : "default"
                          }
                          alwaysPrepared={alwaysPreparedSpellIdSet.has(spell.id)}
                          alwaysSpellbook={alwaysSpellbookSpellIdSet.has(spell.id)}
                          highlightTone={
                            wizardSpellMasterySpellIdSet.has(spell.id) ||
                            wizardSignatureSpellIdSet.has(spell.id)
                              ? "spell-mastery"
                              : "default"
                          }
                          compactConcentrationDuration
                          actionShapes={actionShapes}
                        />
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {activeSpellSlotSheetLevel !== null ? (
        <SpellSlotActionSheet
          slotLevel={activeSpellSlotSheetLevel}
          totalSlots={activeSpellSlotSheetTotal}
          expendedSlots={activeSpellSlotSheetExpended}
          onClose={closeSpellSlotActionSheet}
          onResetSlot={() => updateSpellSlotsExpended(activeSpellSlotSheetLevel, -1)}
          onUseSlot={() => updateSpellSlotsExpended(activeSpellSlotSheetLevel, 1)}
          onResetAll={() => resetAllSpellSlotsAtLevel(activeSpellSlotSheetLevel)}
        />
      ) : null}

      {isSpellManagementModalOpen ? (
        <SpellManagementModal
          alwaysPreparedSpellIds={alwaysPreparedSpellIds}
          alwaysSpellbookSpellIds={alwaysSpellbookSpellIds}
          cantripLimit={cantripLimit}
          cantripOptions={cantripOptions}
          character={character}
          eldritchInvocationLimit={eldritchInvocationLimit}
          getSpellRowActionShapes={getSpellRowActionShapes}
          highestSpellSlotLevel={highestSpellSlotLevel}
          knownSpellEntriesById={knownSpellEntriesById}
          onClose={() => setIsSpellManagementModalOpen(false)}
          onOpenInvocationDetails={openInvocationDetails}
          onOpenSpellDetails={openSpellDetails}
          onPersistCharacter={onPersistCharacter}
          preparedSpellLimit={preparedSpellLimit}
          selectedCantripIds={selectedCantripIds}
          selectedInvocationIds={selectedInvocationIds}
          selectedManualSpellbookSpellIds={selectedManualSpellbookSpellIds}
          selectedPreparedSpellIds={selectedPreparedSpellIds}
          spellbookSpellEntriesById={spellbookSpellEntriesById}
          spellOutcomeSummariesById={spellOutcomeSummariesById}
          spellPreparationOptions={spellPreparationOptions}
          suspendEscapeClose={Boolean(
            activeSpellSlotSheetLevel !== null ||
              selectedSpell ||
              selectedDivinityOptionKey ||
              selectedInvocation ||
              isSelectedSpellDiceRollerSettingsOpen
          )}
          usesPreparedSpells={usesPreparedSpells}
          usesSpellbook={usesSpellbook}
        />
      ) : null}

      {selectedSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedSpellDisplay ?? selectedSpell}
          damageDetailOverride={selectedSpellElementalSmiteDamageDetail}
          alwaysPrepared={selectedSpellAlwaysPrepared}
          alwaysSpellbook={selectedSpellAlwaysSpellbook}
          mode={selectedSpellViewMode}
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
          selectedSpellSlotLevel={selectedSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedSpellSlotLevel}
          onClose={closeSelectedSpell}
          onAction={(options) =>
            castSelectedSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnSelectedSpell,
              useMindMagic: useMindMagicOnSelectedSpell,
              useWarGodsBlessing: useWarGodsBlessingOnSelectedSpell,
              useStarMap: useStarMapOnSelectedSpell,
              useBlessingOfMoonlight: useBlessingOfMoonlightOnSelectedSpell,
              useElementalSmite: useElementalSmiteOnSelectedSpell,
              elementalSmiteOption: selectedElementalSmiteOptionOnSelectedSpell,
              useFeyReinforcements: useFeyReinforcementsOnSelectedSpell,
              useFeyReinforcementsNoConcentration:
                useFeyReinforcementsNoConcentrationOnSelectedSpell,
              useFrozenHaunt: useFrozenHauntOnSelectedSpell,
              frozenHauntFallbackSlotLevel: selectedFrozenHauntFallbackSlotLevel,
              usePhantasmalCreatures: usePhantasmalCreaturesOnSelectedSpell,
              useMistyWanderer: useMistyWandererOnSelectedSpell,
              useStepsOfTheFey: useStepsOfTheFeyOnSelectedSpell,
              useNaturalRecovery: useNaturalRecoveryOnSelectedSpell,
              usePsionicSorcery: usePsionicSorceryOnSelectedSpell,
              useTamedSurge: useTamedSurgeOnSelectedSpell,
              useTelekineticMaster: useTelekineticMasterOnSelectedSpell
            })
          }
          actionConsumesSpellSlot={
            !selectedSpellIsSpellbookOnly &&
            !selectedSpellCanOnlyBeCastAsRitual &&
            !(selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell) &&
            !(selectedSpellSupportsWarGodsBlessing && useWarGodsBlessingOnSelectedSpell) &&
            !(selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) &&
            !(selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell) &&
            !(selectedSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnSelectedSpell) &&
            !(selectedSpellSupportsMistyWanderer && useMistyWandererOnSelectedSpell) &&
            !(selectedSpellSupportsFeyReinforcements && useFeyReinforcementsOnSelectedSpell) &&
            !(selectedSpellSupportsPhantasmalCreatures && usePhantasmalCreaturesOnSelectedSpell) &&
            !(selectedSpellSupportsTelekineticMaster && useTelekineticMasterOnSelectedSpell)
          }
          freeCastSlotLevel={selectedSpellFreeCastSlotLevel}
          allowRitualCasting={
            selectedSpellCanCastAsRitualFromSpellbook || selectedSpellCanOnlyBeCastAsRitual
          }
          ritualCastingRequired={selectedSpellCanOnlyBeCastAsRitual}
          actionAvailabilityText={
            selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell
              ? "Mind Magic lets you cast this spell at its base level by using 1 Channel Divinity instead of a spell slot."
              : selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell
                ? `Psionic Sorcery lets you cast this spell at level ${selectedSpellPsionicSorceryCurrentCost} by spending ${selectedSpellPsionicSorceryCurrentCost} Sorcery Point${selectedSpellPsionicSorceryCurrentCost === 1 ? "" : "s"} instead of a spell slot.`
                : selectedSpellSupportsStarMap && useStarMapOnSelectedSpell
                  ? "Star Map lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                  : selectedSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnSelectedSpell
                    ? "Steps of the Fey lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                    : selectedSpellSupportsMistyWanderer && useMistyWandererOnSelectedSpell
                      ? "Misty Wanderer lets you cast this spell without expending a spell slot."
                      : selectedSpellSupportsFeyReinforcements &&
                          useFeyReinforcementsOnSelectedSpell
                        ? "Fey Reinforcements lets you cast this spell without expending a spell slot."
                        : selectedSpellSupportsPhantasmalCreatures &&
                            usePhantasmalCreaturesOnSelectedSpell
                          ? "Phantasmal Creatures lets you cast this spell without expending a spell slot. This shared use recharges on a Long Rest, and the summoned creature has half Hit Points."
                          : selectedSpellSupportsTelekineticMaster &&
                              useTelekineticMasterOnSelectedSpell
                            ? fighterPsiWarriorTelekineticMasterUsesRemaining > 0
                              ? "Telekinetic Master lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                              : "Telekinetic Master lets you cast this spell without expending a spell slot by using 1 Psi Energy Die."
                            : selectedSpellSupportsTamedSurge && useTamedSurgeOnSelectedSpell
                              ? "Tamed Surge will be spent after this spell consumes a spell slot."
                            : selectedSpellUnderMantleOfMajesty
                              ? "Mantle of Majesty is active. Cast at level 1 without expending a spell slot, or upcast normally."
                              : null
          }
          actionContextText={
            selectedSpellSupportsWarGodsBlessing &&
            useWarGodsBlessingOnSelectedSpell &&
            selectedSpell?.duration.includes(DURATION.CONCENTRATION)
              ? "Concentration is removed for this casting."
              : selectedSpellSupportsFeyReinforcements &&
                  useFeyReinforcementsNoConcentrationOnSelectedSpell
                ? "Concentration is removed for this casting, and the duration becomes 10 turns."
                : selectedSpellUnderMantleOfMajesty
                  ? "Under the effect of Mantle of Majesty."
                  : null
          }
          actionWarning={selectedSpellCastWarning}
          actionDisabled={selectedSpellSharedCastWarning !== null}
          blockedReason={selectedSpellBlockedReason}
          facts={selectedSpellFacts}
          factsSectionTitle={null}
          showActionDiceControls={
            selectedSpellHuntersRimeTemporaryHitPointsFormula !== null ||
            selectedSpellAttackRollFormula !== null
          }
          isDiceRollerSettingsOpen={isSelectedSpellDiceRollerSettingsOpen}
          onDiceRollerSettingsOpenChange={setIsSelectedSpellDiceRollerSettingsOpen}
          actionPaths={selectedSpellActionPaths
            .map((path) => {
              const actionShape = getActionShapeForEconomyType(path.economyType);

              return actionShape
                ? {
                    id: path.id,
                    actionShape,
                    actionShapeAvailable: path.shapeState.isAvailable,
                    actionShapeMultiCount: path.shapeState.multiCount,
                    disabledReason: path.shapeState.disabledReason,
                    roundTrackerResourceOverride: path.roundTrackerResource
                  }
                : null;
            })
            .filter((path): path is NonNullable<typeof path> => path !== null)}
          actionOptions={
            selectedSpellSupportsWarGodsBlessing ||
            selectedSpellSupportsMindMagic ||
            selectedSpellSupportsStarMap ||
            selectedSpellSupportsPsionicSorcery ||
            selectedSpellSupportsBeguilingMagic ||
            selectedSpellSupportsBlessingOfMoonlight ||
            selectedSpellSupportsElementalSmite ||
            selectedSpellSupportsStepsOfTheFey ||
            selectedSpellSupportsMistyWanderer ||
            selectedSpellSupportsFeyReinforcements ||
            selectedSpellSupportsPhantasmalCreatures ||
            selectedSpellFrozenHauntOptionState !== null ||
            selectedSpellSupportsNaturalRecovery ||
            selectedSpellSupportsTamedSurge ||
            selectedSpellSupportsTelekineticMaster
              ? [
                  ...(selectedSpellSupportsWarGodsBlessing
                    ? [
                        {
                          id: "war-gods-blessing",
                          label: "War God's Blessing",
                          checked: useWarGodsBlessingOnSelectedSpell,
                          onCheckedChange: setUseWarGodsBlessingOnSelectedSpell,
                          disabled: selectedSpellWarGodsBlessingDisabled,
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            }),
                            channelDivinityUsesRemaining,
                            channelDivinityUsesTotal,
                            {
                              icon: "pyromancy"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsMindMagic
                    ? [
                        {
                          id: "mind-magic",
                          label: "Mind Magic",
                          checked: useMindMagicOnSelectedSpell,
                          onCheckedChange: setUseMindMagicOnSelectedSpell,
                          disabled: selectedSpellMindMagicDisabled,
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            }),
                            channelDivinityUsesRemaining,
                            channelDivinityUsesTotal,
                            {
                              icon: "pyromancy"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsStarMap
                    ? [
                        {
                          id: "star-map",
                          label: "Star Map",
                          checked: useStarMapOnSelectedSpell,
                          onCheckedChange: setUseStarMapOnSelectedSpell,
                          disabled: selectedSpellStarMapDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              druidStarMapGuidingBoltUsesRemaining,
                              druidStarMapGuidingBoltUsesTotal
                            )
                          ],
                          usage: createChargesCardUsage(
                            druidStarMapGuidingBoltUsesRemaining,
                            druidStarMapGuidingBoltUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsPsionicSorcery
                    ? [
                        {
                          id: "psionic-sorcery",
                          label: "Psionic Sorcery",
                          checked: usePsionicSorceryOnSelectedSpell,
                          onCheckedChange: setUsePsionicSorceryOnSelectedSpell,
                          disabled: selectedSpellPsionicSorceryDisabled,
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: String(selectedSpellPsionicSorceryCurrentCost),
                              icon: "sparkles"
                            }),
                            sorceryPointsRemaining,
                            sorceryPointsTotal,
                            {
                              icon: "sparkles"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: String(selectedSpellPsionicSorceryCurrentCost),
                              icon: "sparkles"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsTamedSurge
                    ? [
                        {
                          id: "tamed-surge",
                          label: "Tamed Surge",
                          checked: useTamedSurgeOnSelectedSpell,
                          onCheckedChange: setUseTamedSurgeOnSelectedSpell,
                          disabled: selectedSpellTamedSurgeDisabled,
                          headerTags: [
                            createChargesHeaderTag(tamedSurgeUsesRemaining, tamedSurgeUsesTotal)
                          ],
                          usage: createChargesCardUsage(tamedSurgeUsesRemaining, tamedSurgeUsesTotal)
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsBeguilingMagic
                    ? [
                        {
                          id: "beguiling-magic",
                          label: "Beguiling Magic",
                          checked: useBeguilingMagicOnSelectedSpell,
                          onCheckedChange: setUseBeguilingMagicOnSelectedSpell,
                          disabled:
                            beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                          headerTags: createChargesAndUsageHeaderTags(
                            beguilingMagicUsesRemaining,
                            beguilingMagicUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "music"
                            }),
                            bardicInspirationUsesRemaining,
                            bardicInspirationUsesTotal,
                            {
                              icon: "music"
                            }
                          ),
                          usage: createChargesOrResourceCardUsage(
                            beguilingMagicUsesRemaining,
                            beguilingMagicUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "music"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsTelekineticMaster
                    ? [
                        {
                          id: "telekinetic-master",
                          label: "Telekinetic Master",
                          checked: useTelekineticMasterOnSelectedSpell,
                          onCheckedChange: setUseTelekineticMasterOnSelectedSpell,
                          disabled: selectedSpellTelekineticMasterDisabled,
                          headerTags: createChargesAndUsageHeaderTags(
                            fighterPsiWarriorTelekineticMasterUsesRemaining,
                            fighterPsiWarriorTelekineticMasterUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "psi"
                            }),
                            fighterPsiWarriorEnergyDiceRemaining,
                            fighterPsiWarriorEnergyDiceTotal,
                            {
                              icon: "psi"
                            }
                          ),
                          usage: createChargesOrResourceCardUsage(
                            fighterPsiWarriorTelekineticMasterUsesRemaining,
                            fighterPsiWarriorTelekineticMasterUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "psi"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsElementalSmite
                    ? [
                        {
                          id: "elemental-smite",
                          label: "Elemental Smite",
                          checked: useElementalSmiteOnSelectedSpell,
                          onCheckedChange: setUseElementalSmiteOnSelectedSpell,
                          disabled: selectedSpellElementalSmiteDisabled,
                          radioOptions: {
                            value: selectedElementalSmiteOptionOnSelectedSpell,
                            onValueChange: (value: string) =>
                              setSelectedElementalSmiteOptionOnSelectedSpell(
                                value as Exclude<
                                  typeof selectedElementalSmiteOptionOnSelectedSpell,
                                  null
                                >
                              ),
                            required: true,
                            placement: "body" as const,
                            options: paladinOathOfTheNobleGeniesElementalSmiteOptions.map(
                              (option) => ({
                                id: option.key,
                                header: option.label,
                                description: option.descriptionEntries
                              })
                            )
                          },
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            }),
                            channelDivinityUsesRemaining,
                            channelDivinityUsesTotal,
                            {
                              icon: "pyromancy"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsStepsOfTheFey
                    ? [
                        {
                          id: "steps-of-the-fey",
                          label: "Steps of the Fey",
                          checked: useStepsOfTheFeyOnSelectedSpell,
                          onCheckedChange: setUseStepsOfTheFeyOnSelectedSpell,
                          disabled: selectedSpellStepsOfTheFeyDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              warlockStepsOfTheFeyUsesRemaining,
                              warlockStepsOfTheFeyUsesTotal
                            )
                          ],
                          usage: createChargesCardUsage(
                            warlockStepsOfTheFeyUsesRemaining,
                            warlockStepsOfTheFeyUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsMistyWanderer
                    ? [
                        {
                          id: "misty-wanderer",
                          label: "Misty Wanderer",
                          checked: useMistyWandererOnSelectedSpell,
                          onCheckedChange: setUseMistyWandererOnSelectedSpell,
                          disabled: selectedSpellMistyWandererDisabled,
                          usage: createChargesCardUsage(
                            rangerMistyWandererUsesRemaining,
                            rangerMistyWandererUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsFeyReinforcements
                    ? [
                        {
                          id: "fey-reinforcements",
                          label: "Fey Reinforcements",
                          checked: useFeyReinforcementsOnSelectedSpell,
                          onCheckedChange: setUseFeyReinforcementsOnSelectedSpell,
                          disabled: selectedSpellFeyReinforcementsDisabled,
                          usage: createChargesCardUsage(
                            rangerFeyReinforcementsUsesRemaining,
                            rangerFeyReinforcementsUsesTotal
                          )
                        },
                        {
                          id: "fey-reinforcements-no-concentration",
                          label: "No Concentration (10 turns)",
                          checked: useFeyReinforcementsNoConcentrationOnSelectedSpell,
                          onCheckedChange: setUseFeyReinforcementsNoConcentrationOnSelectedSpell,
                          disabled:
                            selectedSpellFeyReinforcementsDisabled ||
                            !useFeyReinforcementsOnSelectedSpell
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsPhantasmalCreatures
                    ? [
                        {
                          id: "phantasmal-creatures",
                          label: "Phantasmal Creatures",
                          checked: usePhantasmalCreaturesOnSelectedSpell,
                          onCheckedChange: setUsePhantasmalCreaturesOnSelectedSpell,
                          disabled: selectedSpellPhantasmalCreaturesDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellPhantasmalCreaturesOptionState?.usesRemaining ?? 0,
                              selectedSpellPhantasmalCreaturesOptionState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellPhantasmalCreaturesOptionState?.usesRemaining ?? 0,
                            selectedSpellPhantasmalCreaturesOptionState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellFrozenHauntOptionState
                    ? [
                        {
                          id: "frozen-haunt",
                          label: "Frozen Haunt",
                          checked: useFrozenHauntOnSelectedSpell,
                          onCheckedChange: setUseFrozenHauntOnSelectedSpell,
                          disabled: selectedSpellFrozenHauntOptionState.disabled,
                          headerTags: createChargesAndUsageHeaderTags(
                            selectedSpellFrozenHauntOptionState.usesRemaining,
                            selectedSpellFrozenHauntOptionState.usesTotal,
                            createFeatureActionCardCost({
                              amountText: `${frozenHauntFallbackSpellSlotMinimumLevel}+`,
                              resourceLabel: "Spell Slot"
                            }),
                            selectedSpellFrozenHauntFallbackSlotSummary.remaining,
                            selectedSpellFrozenHauntFallbackSlotSummary.total,
                            {
                              label: "Spell Slots"
                            }
                          ),
                          usage: createChargesOrResourceCardUsage(
                            selectedSpellFrozenHauntOptionState.usesRemaining,
                            selectedSpellFrozenHauntOptionState.usesTotal,
                            createFeatureActionCardCost({
                              amountText: `${frozenHauntFallbackSpellSlotMinimumLevel}+`,
                              resourceLabel: "Spell Slot"
                            })
                          ),
                          select:
                            useFrozenHauntOnSelectedSpell &&
                            selectedSpellFrozenHauntOptionState.usesRemaining <= 0 &&
                            selectedSpellFrozenHauntFallbackSlotOptions.length > 0
                              ? {
                                  label: "Frozen Haunt Slot",
                                  value: selectedFrozenHauntFallbackSlotLevel,
                                  onValueChange: setSelectedFrozenHauntFallbackSlotLevel,
                                  options: selectedSpellFrozenHauntFallbackSlotOptions
                                }
                              : undefined
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsBlessingOfMoonlight
                    ? [
                        {
                          id: "blessing-of-moonlight",
                          label: "Blessing of Moonlight",
                          checked: useBlessingOfMoonlightOnSelectedSpell,
                          onCheckedChange: setUseBlessingOfMoonlightOnSelectedSpell,
                          disabled: blessingOfMoonlightUsesRemaining <= 0,
                          headerTags: [
                            createChargesHeaderTag(
                              blessingOfMoonlightUsesRemaining,
                              blessingOfMoonlightUsesTotal
                            )
                          ],
                          usage: createChargesCardUsage(
                            blessingOfMoonlightUsesRemaining,
                            blessingOfMoonlightUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsNaturalRecovery
                    ? [
                        {
                          id: "natural-recovery",
                          label: "Natural Recovery",
                          checked: useNaturalRecoveryOnSelectedSpell,
                          onCheckedChange: setUseNaturalRecoveryOnSelectedSpell,
                          disabled: druidNaturalRecoveryUsesRemaining <= 0,
                          headerTags: [
                            createChargesHeaderTag(druidNaturalRecoveryUsesRemaining, 1)
                          ],
                          usage: createChargesCardUsage(druidNaturalRecoveryUsesRemaining, 1)
                        }
                      ]
                    : [])
                ]
              : undefined
          }
          backdropClassName={isPreparedSpellPreview ? styles.previewSpellDrawerBackdrop : undefined}
        />
      ) : null}

      {selectedInvocation ? (
        <EldritchInvocationDrawer
          option={selectedInvocation}
          onClose={closeSelectedInvocation}
          backdropClassName={
            isSpellManagementModalOpen ? styles.previewSpellDrawerBackdrop : undefined
          }
        />
      ) : null}

      {selectedDivinityRow ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={closeSelectedDivinity}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-divinity-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>{formatCodexLabel("DIVINITY")}</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-divinity-drawer-title" className={sheetStyles.spellDrawerTitle}>
                    {selectedDivinityRow.option.name}
                  </h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {formatDivinitySubtitle(selectedDivinityRow.entry)}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeSelectedDivinity}
                aria-label="Close divinity details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerBody}>
              <div className={sheetStyles.spellDrawerDetails}>
                <CellContainer
                  label="Casting Time"
                  content={
                    <span className={styles.divinityCastingTimeContent}>
                      <span>{formatSpellCastingTime(selectedDivinityRow.entry.castingTime)}</span>
                      {selectedDivinityActionShape ? (
                        <ActionShape
                          shape={selectedDivinityActionShape}
                          isSelected
                          size="small"
                          className={styles.divinityCastingTimeShape}
                        />
                      ) : null}
                    </span>
                  }
                />
                <CellContainer label="Range" content={selectedDivinityRow.entry.range} />
                <CellContainer label="Duration" content={selectedDivinityRow.entry.duration} />
                <CellContainer
                  label={selectedDivinityRow.option.resultLabel ?? "Damage"}
                  content={getDivinityDrawerValueLabel(selectedDivinityRow.option)}
                />
              </div>

              {(() => {
                const descriptionEntries =
                  selectedDivinityDisplay?.description ?? selectedDivinityRow.entry.description;
                const descriptionSections = orderDescriptionAdditionSections(
                  selectedDivinityDisplay?.descriptionAdditions ?? []
                );
                const hasBaseDescription = descriptionEntries.length > 0;

                return hasBaseDescription || descriptionSections.length > 0 ? (
                  <div className={sheetStyles.spellDrawerDescriptionStack}>
                    {hasBaseDescription ? (
                      <SpellDescriptionContent
                        description={descriptionEntries}
                        className={clsx(
                          sheetStyles.spellDrawerDescriptionList,
                          sheetStyles.spellDrawerDescriptionSection
                        )}
                        entryClassName={sheetStyles.spellDrawerDescriptionLine}
                        strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                      />
                    ) : null}
                    {descriptionSections.map((section, index) => (
                      <div
                        key={`${selectedDivinityRow.option.key}-description-addition-${index}`}
                        className={sheetStyles.spellDrawerDescriptionAdditionSection}
                      >
                        {hasBaseDescription || index > 0 ? (
                          <hr
                            className={sheetStyles.spellDrawerDescriptionDivider}
                            aria-hidden="true"
                          />
                        ) : null}
                        <SpellDescriptionContent
                          description={section}
                          className={clsx(
                            sheetStyles.spellDrawerDescriptionList,
                            sheetStyles.spellDrawerDescriptionSection
                          )}
                          entryClassName={sheetStyles.spellDrawerDescriptionLine}
                          strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                        />
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            <div className={sheetStyles.spellDrawerActions}>
              <div className={styles.divinityDrawerActionStack}>
                {selectedDivinityActionWarning ? (
                  <div className={styles.divinityDrawerWarningBlock}>
                    <p className={gameplayActionStyles.warningCard}>
                      {selectedDivinityActionWarning}
                    </p>
                  </div>
                ) : null}
              </div>
              <ActionButton
                className={styles.divinityDrawerActionButton}
                onClick={channelSelectedDivinity}
                disabled={
                  channelDivinityUsesRemaining <= 0 || selectedDivinityActionWarning !== null
                }
                trailingBadge={
                  selectedDivinityActionShape ? (
                    <ActionShape
                      shape={selectedDivinityActionShape}
                      isSelected={selectedDivinityActionShapeState?.isSelected ?? true}
                      multiCount={selectedDivinityActionShapeState?.multiCount ?? 0}
                      className={styles.divinityDrawerActionButtonShape}
                    />
                  ) : null
                }
              >
                Use Channel Divinity
              </ActionButton>
            </div>
          </section>
        </div>
      ) : null}
      {diceRollerPopup}
    </article>
  );
}

export default SpellCastingForm;
