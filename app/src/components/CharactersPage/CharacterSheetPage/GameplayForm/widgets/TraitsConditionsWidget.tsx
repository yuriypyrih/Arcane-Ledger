import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CellContainer from "../../../../CellContainer/CellContainer";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../../codex/classes";
import {
  MAGIC_SCHOOL,
  getSpellEntries,
  getSpellEntryById,
  type SpellEntry
} from "../../../../../codex/entries";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import {
  activateBardCollegeOfDanceInspiringMovementForCharacter,
  activateBarbarianBerserkerRetaliationForCharacter,
  activateRangerHunterSuperiorHuntersDefenseForCharacter,
  applySpellCastFeatureEffectsForCharacter,
  consumeElementalRebukeUseForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeWarlockBeguilingDefenseUseForCharacter,
  consumeSorcererRestoreBalanceUseForCharacter,
  consumeRogueScionOfTheThreeBloodthirstUseForCharacter,
  consumeRogueSpellThiefUseForCharacter,
  consumeWizardIllusionistIllusorySelfUseForCharacter,
  consumeFighterIndomitableUseForCharacter,
  consumeGloriousDefenseUseForCharacter,
  consumeRangerWinterWalkerChillingRetributionUseForCharacter,
  consumeWarlockStepsOfTheFeyUseForCharacter,
  expendFighterPsiWarriorEnergyDieForCharacter,
  expendBardicInspirationUseForCharacter,
  expendSorceryPointForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotalForCharacter,
  getBeguilingMagicUsesRemainingForCharacter,
  getBeguilingMagicUsesTotalForCharacter,
  getDerivedFeatureStatusEntriesForCharacter,
  getDruidWildShapeActiveFormForCharacter,
  getElementalRebukeUsesRemainingForCharacter,
  getElementalRebukeUsesTotalForCharacter,
  getFighterIndomitableUsesRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFeatureReactionEntriesForCharacter,
  getFeatureReactionSpellForCharacter,
  getGloriousDefenseUsesRemainingForCharacter,
  getGloriousDefenseUsesTotalForCharacter,
  getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter,
  getRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter,
  getRogueScionOfTheThreeBloodthirstUsesRemainingForCharacter,
  getRogueScionOfTheThreeBloodthirstUsesTotalForCharacter,
  getRogueSpellThiefUsesRemainingForCharacter,
  getRogueSpellThiefUsesTotalForCharacter,
  getSorceryPointsRemainingForCharacter,
  getWarlockBeguilingDefenseUsesRemainingForCharacter,
  getWarlockBeguilingDefenseUsesTotalForCharacter,
  getWarlockPactMagicSlotTotalForCharacter,
  getWarlockPactMagicSlotsRemainingForCharacter,
  getWizardIllusionistIllusorySelfFallbackSlotSummaryForCharacter,
  getWizardIllusionistIllusorySelfUsesRemainingForCharacter,
  getWizardIllusionistIllusorySelfUsesTotalForCharacter,
  sorcererBendLuckReactionEntryId,
  getSorcererRestoreBalanceUsesRemainingForCharacter,
  getSorcererRestoreBalanceUsesTotalForCharacter,
  getSpellEntryForCharacter,
  getRangerWinterWalkerChillingRetributionUsesRemainingForCharacter,
  getRangerWinterWalkerChillingRetributionUsesTotalForCharacter,
  paladinElementalRebukeReactionEntryId,
  paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions,
  paladinGloriousDefenseReactionEntryId,
  rogueScionOfTheThreeBloodthirstReactionEntryId,
  rangerWinterWalkerChillingRetributionReactionEntryId,
  sorcererRestoreBalanceReactionEntryId,
  rangerHunterSuperiorHuntersDefenseDamageTypeOptions,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  setRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter,
  getSpellcastingStateForCharacter,
  wizardIllusionistIllusorySelfReactionEntryId,
  warlockBeguilingDefenseReactionEntryId,
  getWarlockStepsOfTheFeyUsesRemainingForCharacter,
  getWarlockStepsOfTheFeyUsesTotalForCharacter,
  removeFeatureStatusEntryForCharacter,
  setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import {
  getFeatDerivedStatusEntriesForCharacter,
  getFeatGrantedCantripEntriesForCharacter
} from "../../../../../pages/CharactersPage/feats";
import { normalizeRoundTracker } from "../../../../../pages/CharactersPage/combat";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended,
  normalizePreparedSpellIds,
  normalizeTrackedSpellIds,
  usesPreparedSpellsForCharacter
} from "../../../../../pages/CharactersPage/spellcasting";
import {
  applySpellConcentrationToStatusEntries,
  createCharacterStatusEntry,
  getExhaustionLevel,
  getStatusDurationPreset,
  getStatusDurationTickOn,
  isExhaustionConditionOptionValue,
  isExhaustionStatusEntry,
  parseConditionOptionValue,
  reconcileCharacterStatusConsequences,
  resolveCharacterStatusEntries,
  setCharacterExhaustionLevel,
  statusGroupOrder,
  statusGroupTitles,
  updateCharacterStatusEntryDuration,
  upsertManualStatusEntry,
  removeCharacterStatusEntry
} from "../../../../../pages/CharactersPage/traits";
import type { ExhaustionLevel } from "../../../../../pages/CharactersPage/traits";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  Character,
  CharacterStatusDuration,
  CharacterStatusEntry,
  CharacterStatusValue
} from "../../../../../types";
import {
  STATUS_DURATION_PRESET,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { consumeRoundTrackerResource } from "../../../../../pages/CharactersPage/combat";
import CharacterSpellDrawer from "../../SpellCastingForm/CharacterSpellDrawer";
import SelectInput from "../../../FormInputs/SelectInput";
import { MonsterEntryDrawer } from "../../../../MonsterEntryRenderer";
import SearchField from "../../../../SearchField";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import { createDefaultDeathSaves } from "../gameplayStateUtils";
import { getRoundTrackerActionWarning } from "../gameplayWidgetUtils";
import styles from "./TraitsConditionsWidget.module.css";
import TraitEditorModal from "./TraitEditorModal";
import ReactionEntryDrawer from "./ReactionEntryDrawer";
import StatusEntryDrawer from "./StatusEntryDrawer";
import TraitsConditionsSections from "./TraitsConditionsSections";
import {
  createDefaultStatusDraftValues,
  getDerivedReactionStatusEntries,
  getTraitEditorGroup,
  resolveStatusDurationPreset,
  type TraitEditorTab
} from "./traitsWidgetUtils";
import { formatCodexLabel } from "../../../../../utils/codex";
import { barbarianBerserkerRetaliationReactionId } from "../../../../../pages/CharactersPage/classFeatures/barbarian/subclasses/barbarianPathOfTheBerserker";
import {
  barbarianWorldTreeBranchesOfTheTreeReactionId,
  getBarbarianPathOfTheWorldTreeBranchesOfTheTreeDcFormula
} from "../../../../../pages/CharactersPage/classFeatures/barbarian/subclasses/barbarianPathOfTheWorldTree";
import { paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId } from "../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import { superiorHuntersDefenseReactionId } from "../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerHunter";
import {
  getRogueArcaneTricksterSpellThiefStatusSourceId,
  isRogueArcaneTricksterSpellThiefStatusSourceId,
  rogueArcaneTricksterSpellThiefReactionId
} from "../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueArcaneTrickster";
import { wizardBladesingerSongOfDefenseReactionId } from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
import { bardCollegeOfDanceInspiringMovementReactionId } from "../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfDance";

type TraitsConditionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

const spellThiefSearchResultLimit = 50;
const mistyStepSpellId = "spell-misty-step";

function formatSpellThiefSpellOptionLabel(spell: SpellEntry): string {
  return `${spell.name} (${spell.spellLevel === 0 ? "Cantrip" : `Level ${spell.spellLevel}`})`;
}

function TraitsConditionsWidget({ character, onPersistCharacter }: TraitsConditionsWidgetProps) {
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false);
  const [activeTraitEditorTab, setActiveTraitEditorTab] = useState<TraitEditorTab>("conditions");
  const [statusDraftValues, setStatusDraftValues] = useState<Record<TraitEditorTab, string>>(
    createDefaultStatusDraftValues
  );
  const [statusDraftDurationPreset, setStatusDraftDurationPreset] = useState(
    STATUS_DURATION_PRESET.INFINITE
  );
  const [statusDraftRoundTickOn, setStatusDraftRoundTickOn] = useState(
    STATUS_DURATION_ROUND_TICK.ROUND_START
  );
  const [selectedStatusEntryId, setSelectedStatusEntryId] = useState<string | null>(null);
  const [isEditingStatusDuration, setIsEditingStatusDuration] = useState(false);
  const [statusDrawerDurationPreset, setStatusDrawerDurationPreset] = useState(
    STATUS_DURATION_PRESET.INFINITE
  );
  const [statusDrawerRoundTickOn, setStatusDrawerRoundTickOn] = useState(
    STATUS_DURATION_ROUND_TICK.ROUND_START
  );
  const [openedFeatureReactionSpellEntryId, setOpenedFeatureReactionSpellEntryId] = useState<
    string | null
  >(null);
  const [selectedReactionSpellSlotLevel, setSelectedReactionSpellSlotLevel] = useState(1);
  const [selectedSongOfDefenseSpellSlotLevel, setSelectedSongOfDefenseSpellSlotLevel] =
    useState(1);
  const [useBeguilingMagicOnReactionSpell, setUseBeguilingMagicOnReactionSpell] = useState(false);
  const [useStepsOfTheFeyOnReactionSpell, setUseStepsOfTheFeyOnReactionSpell] = useState(false);
  const [spellThiefSearchQuery, setSpellThiefSearchQuery] = useState("");
  const [selectedSpellThiefSpellId, setSelectedSpellThiefSpellId] = useState("");

  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const baseClassSpellEntries = useClassSpellEntries(character.className, character.subclassId);
  const classSpellEntries = useMemo(
    () => baseClassSpellEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [baseClassSpellEntries, character]
  );
  const featGrantedCantripEntries = useMemo(
    () =>
      getFeatGrantedCantripEntriesForCharacter(character).map((spell) =>
        getSpellEntryForCharacter(character, spell)
      ),
    [character]
  );
  const basePreparedSpellPoolEntries = usePreparedSpellEntries(
    character.className,
    character.level,
    character.subclassId
  );
  const preparedSpellPoolEntries = useMemo(
    () => basePreparedSpellPoolEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [basePreparedSpellPoolEntries, character]
  );
  const cantripLimit = useMemo(
    () =>
      getCantripLimitForCharacter(
        character.className,
        character.level,
        character.classFeatureState,
        character.subclassId
      ),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const preparedSpellLimit = useMemo(
    () =>
      getPreparedSpellLimitForCharacter(character.className, character.level, character.subclassId),
    [character.className, character.level, character.subclassId]
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
  const allSpellEntries = useMemo(
    () =>
      getSpellEntries()
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name)),
    []
  );
  const beguilingMagicUsesTotal = useMemo(
    () => getBeguilingMagicUsesTotalForCharacter(character),
    [character]
  );
  const beguilingMagicUsesRemaining = useMemo(
    () => getBeguilingMagicUsesRemainingForCharacter(character),
    [character]
  );
  const bardicInspirationUsesRemaining = useMemo(
    () => getBardicInspirationUsesRemainingForCharacter(character),
    [character]
  );
  const bardicInspirationUsesTotal = useMemo(
    () => getBardicInspirationUsesTotalForCharacter(character),
    [character]
  );
  const warlockStepsOfTheFeyUsesTotal = getWarlockStepsOfTheFeyUsesTotalForCharacter(character);
  const warlockStepsOfTheFeyUsesRemaining =
    getWarlockStepsOfTheFeyUsesRemainingForCharacter(character);
  const warlockBeguilingDefenseUsesTotal =
    getWarlockBeguilingDefenseUsesTotalForCharacter(character);
  const warlockBeguilingDefenseUsesRemaining =
    getWarlockBeguilingDefenseUsesRemainingForCharacter(character);
  const warlockPactMagicSlotTotal = getWarlockPactMagicSlotTotalForCharacter(character);
  const warlockPactMagicSlotsRemaining = getWarlockPactMagicSlotsRemainingForCharacter(character);
  const wizardIllusionistIllusorySelfUsesTotal =
    getWizardIllusionistIllusorySelfUsesTotalForCharacter(character);
  const wizardIllusionistIllusorySelfUsesRemaining =
    getWizardIllusionistIllusorySelfUsesRemainingForCharacter(character);
  const wizardIllusionistIllusorySelfFallbackSlotSummary =
    getWizardIllusionistIllusorySelfFallbackSlotSummaryForCharacter(character);
  const usesPreparedSpells = useMemo(
    () =>
      usesPreparedSpellsForCharacter(character.className, character.level, character.subclassId),
    [character.className, character.level, character.subclassId]
  );
  const alwaysPreparedSpellIds = useMemo(
    () =>
      getAlwaysPreparedSpellIds(
        character.className,
        character.level,
        character.classFeatureState,
        undefined,
        character.subclassId,
        character.statusEntries
      ),
    [
      character.classFeatureState,
      character.className,
      character.level,
      character.statusEntries,
      character.subclassId
    ]
  );
  const alwaysPreparedSpellEntries = useMemo(
    () =>
      alwaysPreparedSpellIds
        .map((spellId) => getSpellEntryById(spellId))
        .filter((spell): spell is SpellEntry => spell !== null)
        .map((spell) => getSpellEntryForCharacter(character, spell)),
    [alwaysPreparedSpellIds, character]
  );
  const classSpellEntriesById = useMemo(
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
  const selectedCantrips = useMemo(() => {
    const selectedCantripEntries = new Map<string, SpellEntry>();

    normalizeTrackedSpellIds(
      character.cantripIds,
      classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
      cantripLimit
    ).forEach((spellId) => {
      const spell = classSpellEntriesById.get(spellId);

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
  }, [
    cantripLimit,
    character.cantripIds,
    classSpellEntries,
    classSpellEntriesById,
    featGrantedCantripEntries
  ]);
  const selectedPreparedSpells = useMemo(() => {
    const highestSpellSlotLevel = spellSlotTotals.reduce(
      (highest, total, index) => (total > 0 ? index + 1 : highest),
      0
    );
    const spellPreparationOptions = preparedSpellPoolEntries.filter((spell) => {
      const spellLevel = getSpellLevel(spell);
      return spellLevel > 0 && spellLevel <= highestSpellSlotLevel;
    });

    return usesPreparedSpells
      ? [
          ...alwaysPreparedSpellIds,
          ...normalizePreparedSpellIds(
            character.preparedSpellIds,
            spellPreparationOptions,
            preparedSpellLimit,
            alwaysPreparedSpellIds
          )
        ]
          .map((spellId) => classSpellEntriesById.get(spellId))
          .filter((spell): spell is SpellEntry => spell !== undefined)
      : spellPreparationOptions;
  }, [
    alwaysPreparedSpellIds,
    character.preparedSpellIds,
    classSpellEntriesById,
    preparedSpellLimit,
    preparedSpellPoolEntries,
    spellSlotTotals,
    usesPreparedSpells
  ]);
  const featureReactionEntries = useMemo(
    () => getFeatureReactionEntriesForCharacter(character),
    [character]
  );
  const featureReactionEntriesById = useMemo(
    () =>
      new Map(
        featureReactionEntries.map(
          (reaction) => [`reaction-entry-${reaction.id}`, reaction] as const
        )
      ),
    [featureReactionEntries]
  );
  const reactionStatusEntries = useMemo(
    () =>
      getDerivedReactionStatusEntries(
        [...selectedCantrips, ...selectedPreparedSpells],
        featureReactionEntries
      ),
    [featureReactionEntries, selectedCantrips, selectedPreparedSpells]
  );
  const statusEntries = useMemo(
    () =>
      resolveCharacterStatusEntries(character.statusEntries, [
        ...getDerivedFeatureStatusEntriesForCharacter(character),
        ...getFeatDerivedStatusEntriesForCharacter(character),
        ...reactionStatusEntries
      ]),
    [character, reactionStatusEntries]
  );
  const statusSections = useMemo(
    () =>
      statusGroupOrder
        .map((group) => ({
          group,
          title: statusGroupTitles[group],
          entries: statusEntries.filter((entry) => entry.group === group)
        }))
        .filter((section) => section.entries.length > 0),
    [statusEntries]
  );
  const selectedStatusEntry = selectedStatusEntryId
    ? (statusEntries.find((entry) => entry.id === selectedStatusEntryId) ?? null)
    : null;
  const selectedReactionEntry =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-entry-")
      ? (featureReactionEntriesById.get(
          selectedStatusEntry.sourceId as `reaction-entry-${string}`
        ) ?? null)
      : null;
  const selectedFeatureReactionSpell = useMemo(() => {
    if (!selectedReactionEntry || openedFeatureReactionSpellEntryId !== selectedReactionEntry.id) {
      return null;
    }

    return getFeatureReactionSpellForCharacter(character, selectedReactionEntry.id);
  }, [character, openedFeatureReactionSpellEntryId, selectedReactionEntry]);
  const selectedReactionSpell =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-spell-")
      ? (classSpellEntriesById.get(selectedStatusEntry.sourceId.replace(/^reaction-spell-/, "")) ??
        null)
      : selectedFeatureReactionSpell;
  const selectedReactionSpellSupportsBeguilingMagic =
    selectedReactionSpell !== null &&
    beguilingMagicUsesTotal > 0 &&
    (selectedReactionSpell.magicSchool === MAGIC_SCHOOL.ENCHANTMENT ||
      selectedReactionSpell.magicSchool === MAGIC_SCHOOL.ILLUSION);
  const selectedReactionSpellSupportsStepsOfTheFey =
    selectedReactionSpell?.id === mistyStepSpellId && warlockStepsOfTheFeyUsesTotal > 0;
  const selectedReactionSpellStepsOfTheFeyDisabled =
    selectedReactionSpellSupportsStepsOfTheFey && warlockStepsOfTheFeyUsesRemaining <= 0;
  const availableSongOfDefenseSpellSlotLevels = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
        (slotLevel) => (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
      ),
    [spellSlotsRemaining]
  );
  const selectedSongOfDefenseDamageReduction = Math.max(
    1,
    Math.min(9, Math.floor(selectedSongOfDefenseSpellSlotLevel || 1))
  ) * 5;
  const spellThiefUsesRemaining = getRogueSpellThiefUsesRemainingForCharacter(character);
  const spellThiefUsesTotal = getRogueSpellThiefUsesTotalForCharacter(character);
  const gloriousDefenseUsesRemaining = getGloriousDefenseUsesRemainingForCharacter(character);
  const gloriousDefenseUsesTotal = getGloriousDefenseUsesTotalForCharacter(character);
  const elementalRebukeUsesRemaining = getElementalRebukeUsesRemainingForCharacter(character);
  const elementalRebukeUsesTotal = getElementalRebukeUsesTotalForCharacter(character);
  const chillingRetributionUsesRemaining =
    getRangerWinterWalkerChillingRetributionUsesRemainingForCharacter(character);
  const chillingRetributionUsesTotal =
    getRangerWinterWalkerChillingRetributionUsesTotalForCharacter(character);
  const sorceryPointsRemaining = getSorceryPointsRemainingForCharacter(character);
  const restoreBalanceUsesRemaining = getSorcererRestoreBalanceUsesRemainingForCharacter(character);
  const restoreBalanceUsesTotal = getSorcererRestoreBalanceUsesTotalForCharacter(character);
  const bloodthirstUsesRemaining =
    getRogueScionOfTheThreeBloodthirstUsesRemainingForCharacter(character);
  const bloodthirstUsesTotal = getRogueScionOfTheThreeBloodthirstUsesTotalForCharacter(character);
  const selectedWildShapeMonster = selectedStatusEntry?.sourceId?.startsWith(
    "feature-druid-wild-shape:"
  )
    ? getDruidWildShapeActiveFormForCharacter(character)
    : null;
  const selectedNobleGeniesAuraOfElementalShieldingDamageType =
    selectedStatusEntry?.sourceId ===
    paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId
      ? getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
          character
        )
      : null;
  const selectedRangerHunterSuperiorHuntersDefenseDamageType =
    selectedReactionEntry?.id === superiorHuntersDefenseReactionId
      ? getRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter(character)
      : null;
  const selectedBranchesOfTheTreeDcFormula =
    selectedReactionEntry?.id === barbarianWorldTreeBranchesOfTheTreeReactionId
      ? getBarbarianPathOfTheWorldTreeBranchesOfTheTreeDcFormula(character)
      : null;
  const selectedSpellThiefSpell =
    selectedSpellThiefSpellId.length > 0
      ? (allSpellEntries.find((spell) => spell.id === selectedSpellThiefSpellId) ?? null)
      : null;
  const normalizedSpellThiefSearchQuery = spellThiefSearchQuery.trim().toLowerCase();
  const spellThiefFilteredSpellOptions = useMemo(
    () =>
      normalizedSpellThiefSearchQuery.length > 0
        ? allSpellEntries.filter((spell) =>
            spell.name.toLowerCase().includes(normalizedSpellThiefSearchQuery)
          )
        : allSpellEntries,
    [allSpellEntries, normalizedSpellThiefSearchQuery]
  );
  const spellThiefVisibleSpellOptions = useMemo(() => {
    const limitedOptions = spellThiefFilteredSpellOptions.slice(0, spellThiefSearchResultLimit);

    if (
      !selectedSpellThiefSpell ||
      limitedOptions.some((spell) => spell.id === selectedSpellThiefSpell.id)
    ) {
      return limitedOptions;
    }

    return [selectedSpellThiefSpell, ...limitedOptions].slice(0, spellThiefSearchResultLimit);
  }, [selectedSpellThiefSpell, spellThiefFilteredSpellOptions]);
  const spellcastingState = getSpellcastingStateForCharacter(character);

  useEffect(() => {
    setUseBeguilingMagicOnReactionSpell(false);
  }, [selectedReactionSpell?.id]);
  useEffect(() => {
    setUseStepsOfTheFeyOnReactionSpell(false);
  }, [selectedReactionSpell?.id]);
  useEffect(() => {
    if (selectedReactionEntry?.id === openedFeatureReactionSpellEntryId) {
      return;
    }

    setOpenedFeatureReactionSpellEntryId(null);
  }, [openedFeatureReactionSpellEntryId, selectedReactionEntry?.id]);
  useEffect(() => {
    if (selectedReactionEntry?.id === rogueArcaneTricksterSpellThiefReactionId) {
      return;
    }

    setSpellThiefSearchQuery("");
    setSelectedSpellThiefSpellId("");
  }, [selectedReactionEntry?.id]);
  useEffect(() => {
    if (
      !selectedReactionSpellSupportsStepsOfTheFey ||
      !selectedReactionSpellStepsOfTheFeyDisabled
    ) {
      return;
    }

    setUseStepsOfTheFeyOnReactionSpell(false);
  }, [selectedReactionSpellStepsOfTheFeyDisabled, selectedReactionSpellSupportsStepsOfTheFey]);
  const selectedReactionResourceWarning =
    selectedReactionEntry?.id === "reaction-cutting-words"
      ? bardicInspirationUsesRemaining <= 0
        ? "No Bardic Inspiration uses remaining."
        : null
      : selectedReactionEntry?.id === bardCollegeOfDanceInspiringMovementReactionId
        ? bardicInspirationUsesRemaining <= 0
          ? "No Bardic Inspiration uses remaining."
          : null
      : selectedReactionEntry?.id === "reaction-banneret-shared-resilience"
        ? getFighterIndomitableUsesRemainingForCharacter(character) <= 0
          ? "No Indomitable uses remaining."
          : null
        : selectedReactionEntry?.id === "reaction-psi-warrior-protective-field"
          ? getFighterPsiWarriorEnergyDiceRemainingForCharacter(character) <= 0
            ? "No Psi Energy Dice remaining."
            : null
          : selectedReactionEntry?.id === sorcererBendLuckReactionEntryId
            ? sorceryPointsRemaining <= 0
              ? "You need 1 Sorcery Point."
              : null
            : selectedReactionEntry?.id === sorcererRestoreBalanceReactionEntryId
              ? restoreBalanceUsesRemaining <= 0
                ? "No Restore Balance uses remaining."
                : null
              : selectedReactionEntry?.id === paladinGloriousDefenseReactionEntryId
                ? gloriousDefenseUsesRemaining <= 0
                  ? "No Glorious Defense charges remaining."
                  : null
                : selectedReactionEntry?.id === paladinElementalRebukeReactionEntryId
                  ? elementalRebukeUsesRemaining <= 0
                    ? "No Elemental Rebuke charges remaining."
                    : null
                  : selectedReactionEntry?.id === rogueScionOfTheThreeBloodthirstReactionEntryId
                    ? bloodthirstUsesRemaining <= 0
                      ? "No Bloodthirst uses remaining."
                      : null
                    : selectedReactionEntry?.id ===
                        rangerWinterWalkerChillingRetributionReactionEntryId
                      ? chillingRetributionUsesRemaining <= 0
                        ? "No Chilling Retribution charges remaining."
                        : null
                      : selectedReactionEntry?.id ===
                          wizardIllusionistIllusorySelfReactionEntryId
                        ? wizardIllusionistIllusorySelfUsesRemaining <= 0 &&
                          wizardIllusionistIllusorySelfFallbackSlotSummary.remaining <= 0
                          ? "No Illusory Self charge or level 2+ spell slots remaining."
                          : null
                      : selectedReactionEntry?.id === warlockBeguilingDefenseReactionEntryId
                        ? warlockBeguilingDefenseUsesRemaining <= 0 &&
                          warlockPactMagicSlotsRemaining <= 0
                          ? "No Beguiling Defense charges or Pact Magic spell slots remaining."
                          : null
                        : selectedReactionEntry?.id === wizardBladesingerSongOfDefenseReactionId
                          ? availableSongOfDefenseSpellSlotLevels.length <= 0
                            ? "No spell slots remaining."
                            : !availableSongOfDefenseSpellSlotLevels.includes(
                                  selectedSongOfDefenseSpellSlotLevel
                                )
                              ? `No level ${selectedSongOfDefenseSpellSlotLevel} spell slots remaining.`
                              : null
                        : selectedReactionEntry?.id === rogueArcaneTricksterSpellThiefReactionId
                          ? spellThiefUsesRemaining <= 0
                            ? "No Spell Thief charges remaining."
                            : null
                          : null;
  const selectedReactionResourceSummary =
    selectedReactionEntry?.id === bardCollegeOfDanceInspiringMovementReactionId
      ? `${bardicInspirationUsesRemaining}/${bardicInspirationUsesTotal} Bardic Inspiration uses | Cost: 1`
      : selectedReactionEntry?.id === paladinGloriousDefenseReactionEntryId
      ? `${gloriousDefenseUsesRemaining}/${gloriousDefenseUsesTotal} charges | Long Rest`
      : selectedReactionEntry?.id === paladinElementalRebukeReactionEntryId
        ? `${elementalRebukeUsesRemaining}/${elementalRebukeUsesTotal} charges | Long Rest`
        : selectedReactionEntry?.id === sorcererBendLuckReactionEntryId
          ? `${sorceryPointsRemaining} Sorcery Points remaining | Cost: 1`
          : selectedReactionEntry?.id === sorcererRestoreBalanceReactionEntryId
            ? `${restoreBalanceUsesRemaining}/${restoreBalanceUsesTotal} uses | Long Rest`
            : selectedReactionEntry?.id === rogueScionOfTheThreeBloodthirstReactionEntryId
              ? `${bloodthirstUsesRemaining}/${bloodthirstUsesTotal} uses | Long Rest`
              : selectedReactionEntry?.id === rangerWinterWalkerChillingRetributionReactionEntryId
                ? `${chillingRetributionUsesRemaining}/${chillingRetributionUsesTotal} charges | Long Rest`
                : selectedReactionEntry?.id === wizardIllusionistIllusorySelfReactionEntryId
                  ? `${wizardIllusionistIllusorySelfUsesRemaining}/${wizardIllusionistIllusorySelfUsesTotal} charge | Short Rest / Long Rest${
                      wizardIllusionistIllusorySelfFallbackSlotSummary.total > 0
                        ? ` | Fallback: 1 level 2+ spell slot (${wizardIllusionistIllusorySelfFallbackSlotSummary.remaining}/${wizardIllusionistIllusorySelfFallbackSlotSummary.total})`
                        : ""
                    }`
                : selectedReactionEntry?.id === warlockBeguilingDefenseReactionEntryId
                  ? `${warlockBeguilingDefenseUsesRemaining}/${warlockBeguilingDefenseUsesTotal} charge${warlockBeguilingDefenseUsesTotal === 1 ? "" : "s"} | Long Rest${
                      warlockPactMagicSlotTotal > 0
                        ? ` | Fallback: 1 Pact Magic spell slot (${warlockPactMagicSlotsRemaining}/${warlockPactMagicSlotTotal})`
                        : ""
                    }`
                  : selectedReactionEntry?.id === wizardBladesingerSongOfDefenseReactionId
                    ? `Reduce damage by ${selectedSongOfDefenseDamageReduction} | Level ${selectedSongOfDefenseSpellSlotLevel} slot (${spellSlotsRemaining[selectedSongOfDefenseSpellSlotLevel - 1] ?? 0} remaining)`
                  : selectedReactionEntry?.id === rogueArcaneTricksterSpellThiefReactionId
                    ? `${spellThiefUsesRemaining}/${spellThiefUsesTotal} charges | Long Rest`
                    : null;
  const selectedReactionSelectionWarning =
    selectedReactionEntry?.id === superiorHuntersDefenseReactionId &&
    selectedRangerHunterSuperiorHuntersDefenseDamageType === null
      ? "Select a damage type."
      : selectedReactionEntry?.id === rogueArcaneTricksterSpellThiefReactionId &&
          selectedSpellThiefSpell === null
        ? "Select a spell."
        : null;
  const selectedReactionActionWarning =
    getRoundTrackerActionWarning("reaction", roundTracker) ??
    selectedReactionSelectionWarning ??
    selectedReactionResourceWarning;
  const selectedReactionBlockedReason = spellcastingState.blocked ? spellcastingState.reason : null;
  const selectedStatusEntryPreset = selectedStatusEntry
    ? getStatusDurationPreset(selectedStatusEntry.duration)
    : STATUS_DURATION_PRESET.INFINITE;
  const hasOverlayOpen = isTraitModalOpen || selectedStatusEntryId !== null;

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedStatusEntryId(null);
        setIsTraitModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasOverlayOpen]);

  useEffect(() => {
    if (!selectedStatusEntryId) {
      return;
    }

    if (selectedStatusEntry) {
      return;
    }

    setSelectedStatusEntryId(null);
  }, [selectedStatusEntry, selectedStatusEntryId]);

  useEffect(() => {
    if (!selectedStatusEntry) {
      setIsEditingStatusDuration(false);
      return;
    }

    setStatusDrawerDurationPreset(selectedStatusEntryPreset);
    setStatusDrawerRoundTickOn(
      getStatusDurationTickOn(selectedStatusEntry.duration) ??
        STATUS_DURATION_ROUND_TICK.ROUND_START
    );
    setIsEditingStatusDuration(false);
  }, [selectedStatusEntry, selectedStatusEntryId, selectedStatusEntryPreset]);

  useEffect(() => {
    if (!selectedReactionSpell) {
      return;
    }

    const spellLevel = getSpellLevel(selectedReactionSpell);
    const minimumSlotLevel = Math.max(1, spellLevel);
    const preferredSlotLevel =
      spellLevel === 0
        ? 1
        : ([1, 2, 3, 4, 5, 6, 7, 8, 9].find(
            (slotLevel) =>
              slotLevel >= minimumSlotLevel && (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
          ) ??
          [1, 2, 3, 4, 5, 6, 7, 8, 9].find(
            (slotLevel) =>
              slotLevel >= minimumSlotLevel && (spellSlotTotals[slotLevel - 1] ?? 0) > 0
          ) ??
          minimumSlotLevel);

    setSelectedReactionSpellSlotLevel(preferredSlotLevel);
  }, [selectedReactionSpell, spellSlotTotals, spellSlotsRemaining]);
  useEffect(() => {
    if (selectedReactionEntry?.id !== wizardBladesingerSongOfDefenseReactionId) {
      return;
    }

    const preferredSlotLevel =
      availableSongOfDefenseSpellSlotLevels[0] ??
      [1, 2, 3, 4, 5, 6, 7, 8, 9].find((slotLevel) => (spellSlotTotals[slotLevel - 1] ?? 0) > 0) ??
      1;

    setSelectedSongOfDefenseSpellSlotLevel(preferredSlotLevel);
  }, [availableSongOfDefenseSpellSlotLevels, selectedReactionEntry?.id, spellSlotTotals]);

  function openTraitEditor() {
    setActiveTraitEditorTab("conditions");
    setStatusDraftDurationPreset(STATUS_DURATION_PRESET.INFINITE);
    setStatusDraftRoundTickOn(STATUS_DURATION_ROUND_TICK.ROUND_START);
    setIsTraitModalOpen(true);
  }

  function addStatusEntry() {
    const selectedValue = statusDraftValues[activeTraitEditorTab]?.trim();

    if (!selectedValue) {
      return;
    }

    const nextGroup = getTraitEditorGroup(activeTraitEditorTab);
    const parsedConditionValue =
      nextGroup === STATUS_ENTRY_GROUP.CONDITIONS ? parseConditionOptionValue(selectedValue) : null;
    const nextValue = parsedConditionValue?.value ?? (selectedValue as CharacterStatusValue);
    const nextDuration: CharacterStatusDuration =
      parsedConditionValue?.conditionLevel !== undefined
        ? { kind: STATUS_DURATION_KIND.INFINITE }
        : resolveStatusDurationPreset(
            statusDraftDurationPreset,
            nextGroup,
            nextValue,
            statusDraftRoundTickOn
          );

    onPersistCharacter((currentCharacter) =>
      reconcileCharacterStatusConsequences({
        ...currentCharacter,
        statusEntries: upsertManualStatusEntry(currentCharacter.statusEntries, {
          group: nextGroup,
          value: nextValue,
          conditionLevel: parsedConditionValue?.conditionLevel ?? null,
          source: "Manual",
          duration: nextDuration
        })
      })
    );

    setStatusDraftDurationPreset(STATUS_DURATION_PRESET.INFINITE);
    setStatusDraftRoundTickOn(STATUS_DURATION_ROUND_TICK.ROUND_START);
    setIsTraitModalOpen(false);
  }

  function updateExhaustionLevel(nextLevel: ExhaustionLevel | null) {
    onPersistCharacter((currentCharacter) => {
      const currentExhaustionLevel = getExhaustionLevel(currentCharacter.statusEntries);
      const isLeavingExhaustionDeathState =
        currentExhaustionLevel !== null &&
        currentExhaustionLevel >= 6 &&
        (nextLevel === null || nextLevel < 6);

      return reconcileCharacterStatusConsequences({
        ...currentCharacter,
        statusEntries: setCharacterExhaustionLevel(currentCharacter.statusEntries, nextLevel),
        deathSaves: isLeavingExhaustionDeathState
          ? createDefaultDeathSaves()
          : currentCharacter.deathSaves
      });
    });

    if (nextLevel === null) {
      setSelectedStatusEntryId(null);
    }
  }

  function removeStatusEntry(entry: CharacterStatusEntry) {
    if (isExhaustionStatusEntry(entry)) {
      updateExhaustionLevel(null);
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE) {
        return removeFeatureStatusEntryForCharacter(currentCharacter, entry);
      }

      return {
        ...currentCharacter,
        statusEntries: removeCharacterStatusEntry(currentCharacter.statusEntries, entry.id)
      };
    });

    setSelectedStatusEntryId(null);
  }

  function endSelectedWildShape() {
    if (!selectedStatusEntry) {
      return;
    }

    removeStatusEntry(selectedStatusEntry);
  }

  function applyStatusEntryDuration() {
    if (!selectedStatusEntry) {
      return;
    }

    const nextDuration = resolveStatusDurationPreset(
      statusDrawerDurationPreset,
      selectedStatusEntry.group,
      selectedStatusEntry.value,
      statusDrawerRoundTickOn
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      statusEntries: updateCharacterStatusEntryDuration(
        currentCharacter.statusEntries,
        selectedStatusEntry,
        nextDuration
      )
    }));

    setIsEditingStatusDuration(false);
  }

  function closeSelectedReaction() {
    setOpenedFeatureReactionSpellEntryId(null);
    setUseBeguilingMagicOnReactionSpell(false);
    setUseStepsOfTheFeyOnReactionSpell(false);
    setSpellThiefSearchQuery("");
    setSelectedSpellThiefSpellId("");
    setSelectedStatusEntryId(null);
  }

  function castSelectedReactionSpell(options?: {
    castAsRitual?: boolean;
    useBeguilingMagic?: boolean;
    useStepsOfTheFey?: boolean;
  }) {
    if (!selectedReactionSpell || selectedReactionBlockedReason || selectedReactionActionWarning) {
      return;
    }

    const spellLevel = getSpellLevel(selectedReactionSpell);
    const castAsRitual = options?.castAsRitual === true && selectedReactionSpell.ritual === true;
    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useStepsOfTheFey =
      options?.useStepsOfTheFey === true &&
      selectedReactionSpellSupportsStepsOfTheFey &&
      warlockStepsOfTheFeyUsesRemaining > 0;

    if (spellLevel === 0) {
      onPersistCharacter((currentCharacter) => {
        const nextCharacter = useBeguilingMagic
          ? consumeBeguilingMagicOrBardicInspirationForCharacter(currentCharacter)
          : currentCharacter;

        return {
          ...nextCharacter,
          statusEntries: applySpellConcentrationToStatusEntries(
            nextCharacter.statusEntries,
            selectedReactionSpell
          ),
          roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, "reaction")
        };
      });
      closeSelectedReaction();
      return;
    }

    if (castAsRitual) {
      onPersistCharacter((currentCharacter) => {
        const nextCharacter = useBeguilingMagic
          ? consumeBeguilingMagicOrBardicInspirationForCharacter(currentCharacter)
          : currentCharacter;

        return {
          ...nextCharacter,
          statusEntries: applySpellConcentrationToStatusEntries(
            nextCharacter.statusEntries,
            selectedReactionSpell
          ),
          roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, "reaction")
        };
      });

      closeSelectedReaction();
      return;
    }

    if (useStepsOfTheFey) {
      onPersistCharacter((currentCharacter) => {
        const nextCharacter = useBeguilingMagic
          ? consumeBeguilingMagicOrBardicInspirationForCharacter(currentCharacter)
          : currentCharacter;
        const nextCharacterWithStepsOfTheFey =
          consumeWarlockStepsOfTheFeyUseForCharacter(nextCharacter);
        const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
          nextCharacterWithStepsOfTheFey,
          selectedReactionSpell,
          { includeBardBattleMagic: false }
        );

        return {
          ...nextCharacterWithSpellCastEffects,
          statusEntries: applySpellConcentrationToStatusEntries(
            nextCharacterWithSpellCastEffects.statusEntries,
            selectedReactionSpell
          ),
          roundTracker: consumeRoundTrackerResource(
            nextCharacterWithSpellCastEffects.roundTracker,
            "reaction"
          )
        };
      });

      closeSelectedReaction();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel = Math.max(
      minimumSlotLevel,
      Math.min(9, Math.floor(selectedReactionSpellSlotLevel || minimumSlotLevel))
    );

    if ((spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(currentCharacter)
        : currentCharacter;
      const nextSpellSlotsExpended = Array.from(
        { length: 9 },
        (_, index) => (preparedCharacter.spellSlotsExpended?.[index] as number | undefined) ?? 0
      );
      nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

      return applySpellCastFeatureEffectsForCharacter(
        restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter({
          ...preparedCharacter,
          spellSlotsExpended: nextSpellSlotsExpended,
          statusEntries: applySpellConcentrationToStatusEntries(
            preparedCharacter.statusEntries,
            selectedReactionSpell
          ),
          roundTracker: consumeRoundTrackerResource(preparedCharacter.roundTracker, "reaction")
        }),
        selectedReactionSpell,
        { includeBardBattleMagic: false }
      );
    });

    closeSelectedReaction();
  }

  function castSelectedReactionEntry() {
    if (!selectedReactionEntry || selectedReactionActionWarning) {
      return;
    }

    const featureReactionSpell = getFeatureReactionSpellForCharacter(
      character,
      selectedReactionEntry.id
    );

    if (featureReactionSpell) {
      setOpenedFeatureReactionSpellEntryId(selectedReactionEntry.id);
      return;
    }

    onPersistCharacter((currentCharacter) => {
      let nextCharacter = currentCharacter;

      if (selectedReactionEntry.id === "reaction-cutting-words") {
        nextCharacter = expendBardicInspirationUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === bardCollegeOfDanceInspiringMovementReactionId) {
        nextCharacter = activateBardCollegeOfDanceInspiringMovementForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === "reaction-banneret-shared-resilience") {
        nextCharacter = consumeFighterIndomitableUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === "reaction-psi-warrior-protective-field") {
        nextCharacter = expendFighterPsiWarriorEnergyDieForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === sorcererBendLuckReactionEntryId) {
        nextCharacter = expendSorceryPointForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === sorcererRestoreBalanceReactionEntryId) {
        nextCharacter = consumeSorcererRestoreBalanceUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === paladinGloriousDefenseReactionEntryId) {
        nextCharacter = consumeGloriousDefenseUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === paladinElementalRebukeReactionEntryId) {
        nextCharacter = consumeElementalRebukeUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === rogueScionOfTheThreeBloodthirstReactionEntryId) {
        nextCharacter = consumeRogueScionOfTheThreeBloodthirstUseForCharacter(currentCharacter);
      } else if (
        selectedReactionEntry.id === rangerWinterWalkerChillingRetributionReactionEntryId
      ) {
        nextCharacter =
          consumeRangerWinterWalkerChillingRetributionUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === wizardIllusionistIllusorySelfReactionEntryId) {
        nextCharacter = consumeWizardIllusionistIllusorySelfUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === warlockBeguilingDefenseReactionEntryId) {
        nextCharacter = consumeWarlockBeguilingDefenseUseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === wizardBladesingerSongOfDefenseReactionId) {
        const slotLevel = Math.max(
          1,
          Math.min(9, Math.floor(selectedSongOfDefenseSpellSlotLevel || 1))
        );
        const spellSlotTotalsForCurrentCharacter = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level,
          currentCharacter.subclassId
        );
        const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
          currentCharacter.spellSlotsExpended,
          spellSlotTotalsForCurrentCharacter
        );

        if (
          (spellSlotTotalsForCurrentCharacter[slotLevel - 1] ?? 0) <=
          (nextSpellSlotsExpended[slotLevel - 1] ?? 0)
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;
        nextCharacter = {
          ...currentCharacter,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      } else if (selectedReactionEntry.id === superiorHuntersDefenseReactionId) {
        nextCharacter = activateRangerHunterSuperiorHuntersDefenseForCharacter(currentCharacter);
      } else if (selectedReactionEntry.id === barbarianBerserkerRetaliationReactionId) {
        nextCharacter = activateBarbarianBerserkerRetaliationForCharacter(currentCharacter);
      } else if (
        selectedReactionEntry.id === rogueArcaneTricksterSpellThiefReactionId &&
        selectedSpellThiefSpell
      ) {
        const consumedCharacter = consumeRogueSpellThiefUseForCharacter(currentCharacter);

        nextCharacter =
          consumedCharacter === currentCharacter
            ? currentCharacter
            : {
                ...consumedCharacter,
                statusEntries: [
                  ...(consumedCharacter.statusEntries ?? []).filter(
                    (entry) => !isRogueArcaneTricksterSpellThiefStatusSourceId(entry.sourceId)
                  ),
                  createCharacterStatusEntry({
                    group: STATUS_ENTRY_GROUP.EFFECTS,
                    value: selectedSpellThiefSpell.name,
                    source: "Spell Thief",
                    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
                    duration: {
                      kind: STATUS_DURATION_KIND.HOURS,
                      amount: 8
                    },
                    sourceId: getRogueArcaneTricksterSpellThiefStatusSourceId(
                      selectedSpellThiefSpell.id
                    )
                  })
                ]
              };
      }

      if (
        (selectedReactionEntry.id === "reaction-cutting-words" ||
          selectedReactionEntry.id === bardCollegeOfDanceInspiringMovementReactionId ||
          selectedReactionEntry.id === "reaction-banneret-shared-resilience" ||
          selectedReactionEntry.id === "reaction-psi-warrior-protective-field" ||
          selectedReactionEntry.id === sorcererBendLuckReactionEntryId ||
          selectedReactionEntry.id === sorcererRestoreBalanceReactionEntryId ||
          selectedReactionEntry.id === paladinGloriousDefenseReactionEntryId ||
          selectedReactionEntry.id === paladinElementalRebukeReactionEntryId ||
          selectedReactionEntry.id === rogueScionOfTheThreeBloodthirstReactionEntryId ||
          selectedReactionEntry.id === rangerWinterWalkerChillingRetributionReactionEntryId ||
          selectedReactionEntry.id === wizardIllusionistIllusorySelfReactionEntryId ||
          selectedReactionEntry.id === warlockBeguilingDefenseReactionEntryId ||
          selectedReactionEntry.id === wizardBladesingerSongOfDefenseReactionId ||
          selectedReactionEntry.id === superiorHuntersDefenseReactionId ||
          selectedReactionEntry.id === barbarianBerserkerRetaliationReactionId ||
          selectedReactionEntry.id === rogueArcaneTricksterSpellThiefReactionId) &&
        nextCharacter === currentCharacter
      ) {
        return currentCharacter;
      }

      return {
        ...nextCharacter,
        roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, "reaction")
      };
    });

    closeSelectedReaction();
  }

  function updatePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
        currentCharacter,
        nextValue as (typeof paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions)[number]
      )
    );
  }

  function updateRangerHunterSuperiorHuntersDefenseDamageType(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter(
        currentCharacter,
        rangerHunterSuperiorHuntersDefenseDamageTypeOptions.some((option) => option === nextValue)
          ? (nextValue as (typeof rangerHunterSuperiorHuntersDefenseDamageTypeOptions)[number])
          : null
      )
    );
  }

  const selectedExhaustionLevel =
    selectedStatusEntry && isExhaustionStatusEntry(selectedStatusEntry)
      ? Math.max(1, Math.min(6, selectedStatusEntry.conditionLevel ?? 1))
      : null;

  return (
    <>
      <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
        <header className={widgetShellStyles.widgetHeader}>
          <p className={widgetShellStyles.widgetTitle}>Traits &amp; Conditions</p>
          <button type="button" className={shared.editButton} onClick={openTraitEditor}>
            <Pencil size={16} />
            Edit
          </button>
        </header>

        {statusSections.length === 0 ? (
          <p className={shared.emptyText}>No traits or conditions.</p>
        ) : (
          <TraitsConditionsSections
            sections={statusSections}
            reactionAvailable={roundTracker.reactionAvailable}
            onSelectEntry={setSelectedStatusEntryId}
          />
        )}
      </section>

      {isTraitModalOpen ? (
        <TraitEditorModal
          activeTab={activeTraitEditorTab}
          values={statusDraftValues}
          durationPreset={statusDraftDurationPreset}
          roundTickOn={statusDraftRoundTickOn}
          onTabChange={setActiveTraitEditorTab}
          onValueChange={(tab, value) => {
            setStatusDraftValues((current) => ({
              ...current,
              [tab]: value
            }));

            if (tab === "conditions" && isExhaustionConditionOptionValue(value)) {
              setStatusDraftDurationPreset(STATUS_DURATION_PRESET.INFINITE);
              setStatusDraftRoundTickOn(STATUS_DURATION_ROUND_TICK.ROUND_START);
            }
          }}
          onDurationPresetChange={setStatusDraftDurationPreset}
          onRoundTickOnChange={setStatusDraftRoundTickOn}
          onSave={addStatusEntry}
          onClose={() => setIsTraitModalOpen(false)}
        />
      ) : null}

      {selectedReactionSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedReactionSpell}
          mode="standard"
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
          selectedSpellSlotLevel={selectedReactionSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedReactionSpellSlotLevel}
          onClose={closeSelectedReaction}
          actionLabel={openedFeatureReactionSpellEntryId ? "Take Reaction" : undefined}
          onAction={(options) =>
            castSelectedReactionSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnReactionSpell,
              useStepsOfTheFey: useStepsOfTheFeyOnReactionSpell
            })
          }
          actionConsumesSpellSlot={
            !(selectedReactionSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnReactionSpell)
          }
          actionAvailabilityText={
            selectedReactionSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnReactionSpell
              ? "Steps of the Fey lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
              : null
          }
          actionWarning={selectedReactionActionWarning}
          actionDisabled={selectedReactionActionWarning !== null}
          blockedReason={selectedReactionBlockedReason}
          actionShape="reaction"
          actionShapeAvailable={selectedReactionActionWarning === null}
          actionOptions={
            selectedReactionSpellSupportsBeguilingMagic ||
            selectedReactionSpellSupportsStepsOfTheFey
              ? [
                  ...(selectedReactionSpellSupportsBeguilingMagic
                    ? [
                        {
                          id: "beguiling-magic",
                          label: "Beguiling Magic",
                          checked: useBeguilingMagicOnReactionSpell,
                          onCheckedChange: setUseBeguilingMagicOnReactionSpell,
                          disabled:
                            beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                          tracker: {
                            current: beguilingMagicUsesRemaining,
                            total: beguilingMagicUsesTotal
                          },
                          fallbackCost:
                            beguilingMagicUsesRemaining <= 0
                              ? {
                                  label: "Use 1",
                                  icon: "music" as const
                                }
                              : undefined
                        }
                      ]
                    : []),
                  ...(selectedReactionSpellSupportsStepsOfTheFey
                    ? [
                        {
                          id: "steps-of-the-fey",
                          label: "Steps of the Fey",
                          checked: useStepsOfTheFeyOnReactionSpell,
                          onCheckedChange: setUseStepsOfTheFeyOnReactionSpell,
                          disabled: selectedReactionSpellStepsOfTheFeyDisabled,
                          tracker: {
                            current: warlockStepsOfTheFeyUsesRemaining,
                            total: warlockStepsOfTheFeyUsesTotal
                          }
                        }
                      ]
                    : [])
                ]
              : undefined
          }
        />
      ) : null}

      {selectedReactionEntry && selectedStatusEntry && !selectedReactionSpell ? (
        <ReactionEntryDrawer
          reaction={selectedReactionEntry}
          actionWarning={selectedReactionActionWarning}
          headerBadges={
            selectedReactionEntry.id === bardCollegeOfDanceInspiringMovementReactionId
              ? ["Use 1 Bardic Inspiration"]
              : []
          }
          resourceSummary={selectedReactionResourceSummary}
          customContent={
            selectedReactionEntry.id === wizardBladesingerSongOfDefenseReactionId ? (
              <label className={shared.field}>
                <span className={shared.fieldLabel}>Spell Slot</span>
                <SelectInput
                  value={
                    availableSongOfDefenseSpellSlotLevels.includes(selectedSongOfDefenseSpellSlotLevel)
                      ? String(selectedSongOfDefenseSpellSlotLevel)
                      : ""
                  }
                  onChange={(event) =>
                    setSelectedSongOfDefenseSpellSlotLevel(Number(event.target.value) || 1)
                  }
                >
                  <option value="">Select a spell slot</option>
                  {availableSongOfDefenseSpellSlotLevels.map((slotLevel) => (
                    <option key={slotLevel} value={slotLevel}>
                      {`Level ${slotLevel} (${spellSlotsRemaining[slotLevel - 1] ?? 0} remaining) - reduce ${slotLevel * 5}`}
                    </option>
                  ))}
                </SelectInput>
              </label>
            ) : selectedReactionEntry.id === superiorHuntersDefenseReactionId ? (
              <label className={shared.field}>
                <span className={shared.fieldLabel}>Damage Type</span>
                <SelectInput
                  value={selectedRangerHunterSuperiorHuntersDefenseDamageType ?? ""}
                  onChange={(event) =>
                    updateRangerHunterSuperiorHuntersDefenseDamageType(event.target.value)
                  }
                >
                  <option value="">Select a damage type</option>
                  {rangerHunterSuperiorHuntersDefenseDamageTypeOptions.map((damageType) => (
                    <option key={damageType} value={damageType}>
                      {formatCodexLabel(damageType)}
                    </option>
                  ))}
                </SelectInput>
              </label>
            ) : selectedReactionEntry.id === barbarianWorldTreeBranchesOfTheTreeReactionId &&
              selectedBranchesOfTheTreeDcFormula ? (
              <div className={sheetStyles.spellDrawerDetails}>
                <CellContainer label="DC Formula" content={selectedBranchesOfTheTreeDcFormula} />
              </div>
            ) : selectedReactionEntry.id === rogueArcaneTricksterSpellThiefReactionId ? (
              <div className={styles.spellThiefFieldGroup}>
                <label className={shared.field}>
                  <span className={shared.fieldLabel}>Spell Search</span>
                  <SearchField
                    value={spellThiefSearchQuery}
                    onValueChange={setSpellThiefSearchQuery}
                    placeholder="Search all spells"
                    className={styles.spellThiefSearchInput}
                  />
                </label>
                <label className={shared.field}>
                  <span className={shared.fieldLabel}>Spell</span>
                  <SelectInput
                    value={selectedSpellThiefSpellId}
                    onChange={(event) => setSelectedSpellThiefSpellId(event.target.value)}
                  >
                    <option value="">Select a spell</option>
                    {spellThiefVisibleSpellOptions.map((spell) => (
                      <option key={spell.id} value={spell.id}>
                        {formatSpellThiefSpellOptionLabel(spell)}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                <p className={shared.helperText}>
                  {spellThiefFilteredSpellOptions.length > spellThiefSearchResultLimit
                    ? `Showing ${spellThiefSearchResultLimit} of ${spellThiefFilteredSpellOptions.length} matching spells. Refine the search to narrow the list.`
                    : `${spellThiefFilteredSpellOptions.length} spell${spellThiefFilteredSpellOptions.length === 1 ? "" : "s"} found.`}
                </p>
                {selectedSpellThiefSpell ? (
                  <p className={styles.spellThiefSelectionSummary}>
                    Selected: {formatSpellThiefSpellOptionLabel(selectedSpellThiefSpell)}
                  </p>
                ) : null}
              </div>
            ) : null
          }
          onCast={castSelectedReactionEntry}
          onClose={closeSelectedReaction}
        />
      ) : null}

      {selectedStatusEntry &&
      !selectedReactionSpell &&
      !selectedReactionEntry &&
      selectedWildShapeMonster ? (
        <MonsterEntryDrawer
          monster={selectedWildShapeMonster}
          status="ready"
          badgeLabel="Wild Shape"
          onClose={() => setSelectedStatusEntryId(null)}
          footer={
            <button type="button" className={shared.cancelButton} onClick={endSelectedWildShape}>
              End Wild Shape
            </button>
          }
        />
      ) : null}

      {selectedStatusEntry &&
      !selectedReactionSpell &&
      !selectedReactionEntry &&
      !selectedWildShapeMonster ? (
        <StatusEntryDrawer
          character={character}
          entry={selectedStatusEntry}
          customContent={
            selectedStatusEntry.sourceId ===
            paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId ? (
              <label className={shared.field}>
                <span className={shared.fieldLabel}>Shielded Element</span>
                <SelectInput
                  value={
                    selectedNobleGeniesAuraOfElementalShieldingDamageType ??
                    paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions[0]
                  }
                  onChange={(event) =>
                    updatePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(
                      event.target.value
                    )
                  }
                >
                  {paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions.map(
                    (damageType) => (
                      <option key={damageType} value={damageType}>
                        {formatCodexLabel(damageType)}
                      </option>
                    )
                  )}
                </SelectInput>
              </label>
            ) : null
          }
          isEditingDuration={isEditingStatusDuration}
          durationPreset={statusDrawerDurationPreset}
          roundTickOn={statusDrawerRoundTickOn}
          onDurationPresetChange={setStatusDrawerDurationPreset}
          onRoundTickOnChange={setStatusDrawerRoundTickOn}
          onStartEditDuration={() => setIsEditingStatusDuration(true)}
          onCancelEditDuration={() => {
            setStatusDrawerDurationPreset(getStatusDurationPreset(selectedStatusEntry.duration));
            setStatusDrawerRoundTickOn(
              getStatusDurationTickOn(selectedStatusEntry.duration) ??
                STATUS_DURATION_ROUND_TICK.ROUND_START
            );
            setIsEditingStatusDuration(false);
          }}
          onApplyDuration={applyStatusEntryDuration}
          onRemove={() => removeStatusEntry(selectedStatusEntry)}
          onIncreaseExhaustion={() =>
            updateExhaustionLevel(
              selectedExhaustionLevel === null
                ? 1
                : (Math.min(6, selectedExhaustionLevel + 1) as ExhaustionLevel)
            )
          }
          onDecreaseExhaustion={() =>
            updateExhaustionLevel(
              selectedExhaustionLevel === null || selectedExhaustionLevel <= 1
                ? null
                : ((selectedExhaustionLevel - 1) as ExhaustionLevel)
            )
          }
          onClose={() => setSelectedStatusEntryId(null)}
        />
      ) : null}
    </>
  );
}

export default TraitsConditionsWidget;
