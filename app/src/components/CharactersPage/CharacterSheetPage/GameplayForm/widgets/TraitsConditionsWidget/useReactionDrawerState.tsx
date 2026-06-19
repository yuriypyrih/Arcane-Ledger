import { useEffect, useMemo, useState } from "react";
import {
  MAGIC_SCHOOL,
  getSpellEntries,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../../codex/entries";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  applySpellCastFeatureEffectsForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeWarlockStepsOfTheFeyUseForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotalForCharacter,
  getBeguilingMagicUsesRemainingForCharacter,
  getBeguilingMagicUsesTotalForCharacter,
  artificerExplosiveCannonDetonateReactionEntryId,
  getArtificerArmorerPerfectedArmorGuardianUsesRemainingForCharacter,
  getArtificerArmorerPerfectedArmorGuardianUsesTotalForCharacter,
  getArtificerEldritchCannonCompanionsForCharacter,
  getArtificerFlashOfGeniusUsesRemainingForCharacter,
  getArtificerFlashOfGeniusUsesTotalForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  getClericWardingFlareUsesRemainingForCharacter,
  getClericWardingFlareUsesTotalForCharacter,
  getDruidCosmicOmenSelectionForCharacter,
  getDruidCosmicOmenUsesRemainingForCharacter,
  getDruidCosmicOmenUsesTotalForCharacter,
  getElementalRebukeUsesRemainingForCharacter,
  getElementalRebukeUsesTotalForCharacter,
  getFeatureReactionSpellForCharacter,
  getGloriousDefenseUsesRemainingForCharacter,
  getGloriousDefenseUsesTotalForCharacter,
  getRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter,
  getRangerWinterWalkerChillingRetributionUsesRemainingForCharacter,
  getRangerWinterWalkerChillingRetributionUsesTotalForCharacter,
  getRogueScionOfTheThreeBloodthirstUsesRemainingForCharacter,
  getRogueScionOfTheThreeBloodthirstUsesTotalForCharacter,
  getRogueSpellThiefUsesRemainingForCharacter,
  getRogueSpellThiefUsesTotalForCharacter,
  getSorcererRestoreBalanceUsesRemainingForCharacter,
  getSorcererRestoreBalanceUsesTotalForCharacter,
  getSorceryPointsRemainingForCharacter,
  getSorceryPointsTotalForCharacter,
  getSpellcastingStateForCharacter,
  getWarlockBeguilingDefenseUsesRemainingForCharacter,
  getWarlockBeguilingDefenseUsesTotalForCharacter,
  getWarlockPactMagicSlotsRemainingForCharacter,
  getWarlockPactMagicSlotTotalForCharacter,
  getWarlockStepsOfTheFeyUsesRemainingForCharacter,
  getWarlockStepsOfTheFeyUsesTotalForCharacter,
  getWizardIllusionistIllusorySelfFallbackSlotSummaryForCharacter,
  getWizardIllusionistIllusorySelfUsesRemainingForCharacter,
  getWizardIllusionistIllusorySelfUsesTotalForCharacter,
  hasActivePaladinOathOfVengeanceVowOfEnmityForCharacter,
  rangerHunterSuperiorHuntersDefenseDamageTypeOptions,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  setDruidCosmicOmenSelectionForCharacter,
  setRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter,
  type FeatureActionHeaderTag
} from "../../../../../../pages/CharactersPage/classFeatures";
import { applySpellDurationToStatusEntries } from "../../../../../../pages/CharactersPage/statusEntries";
import {
  applySpellImplementationForCharacter,
  getSpellImplementationStatusOptionsForCharacter,
  type SpellImplementationOptionValues
} from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import { getSpellLevel } from "../../../../../../pages/CharactersPage/spellcasting";
import {
  consumeRoundTrackerResource,
  normalizeRoundTracker
} from "../../../../../../pages/CharactersPage/combat";
import { getRoundTrackerActionWarning } from "../../gameplayWidgetUtils";
import {
  createChargesAndUsageHeaderTags,
  createChargesCardUsage,
  createChargesHeaderTag,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import type { DiceRollerRequest } from "../../../../../DicePage/DiceRollerPopup";
import type {
  Character,
  CharacterStatusEntry,
  DruidCosmicOmenSelection
} from "../../../../../../types";
import { STATUS_ENTRY_GROUP } from "../../../../../../types";
import { superiorHuntersDefenseReactionId } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerHunter";
import { getBarbarianPathOfTheWorldTreeBranchesOfTheTreeDcFormula } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/subclasses/barbarianPathOfTheWorldTree";
import {
  hasActiveWizardBladesong,
  wizardBladesingerSongOfDefenseReactionId
} from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
import { rogueArcaneTricksterSpellThiefReactionId } from "../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueArcaneTrickster";
import ReactionRollFooter from "./ReactionRollFooter";
import {
  applyReactionDescriptor,
  getReactionDescriptor,
  spellThiefSearchResultLimit,
  type ReactionDescriptorContext
} from "./reactionDescriptors";

const mistyStepSpellId = "spell-misty-step";

type UseReactionDrawerStateOptions = {
  character: Character;
  classSpellEntriesById: Map<string, SpellEntry>;
  onPersistCharacter: PersistCharacterUpdater;
  openDiceRoller: (request: DiceRollerRequest) => void;
  roundTracker: ReturnType<typeof normalizeRoundTracker>;
  selectedReactionEntry: ReactionEntry | null;
  selectedStatusEntry: CharacterStatusEntry | null;
  setSelectedStatusEntryId: (entryId: string | null) => void;
  spellSlotTotals: number[];
  spellSlotsRemaining: number[];
};

export function useReactionDrawerState({
  character,
  classSpellEntriesById,
  onPersistCharacter,
  openDiceRoller,
  roundTracker,
  selectedReactionEntry,
  selectedStatusEntry,
  setSelectedStatusEntryId,
  spellSlotTotals,
  spellSlotsRemaining
}: UseReactionDrawerStateOptions) {
  const [openedFeatureReactionSpellEntryId, setOpenedFeatureReactionSpellEntryId] = useState<
    string | null
  >(null);
  const [selectedReactionSpellSlotLevel, setSelectedReactionSpellSlotLevel] = useState(1);
  const [selectedSongOfDefenseSpellSlotLevel, setSelectedSongOfDefenseSpellSlotLevel] = useState(1);
  const [useBeguilingMagicOnReactionSpell, setUseBeguilingMagicOnReactionSpell] = useState(false);
  const [useStepsOfTheFeyOnReactionSpell, setUseStepsOfTheFeyOnReactionSpell] = useState(false);
  const [spellThiefSearchQuery, setSpellThiefSearchQuery] = useState("");
  const [selectedSpellThiefSpellId, setSelectedSpellThiefSpellId] = useState("");
  const [selectedEldritchCannonCompanionId, setSelectedEldritchCannonCompanionId] = useState("");
  const selectedReactionEntryId = selectedReactionEntry?.id ?? null;
  const isSpellThiefReactionSelected =
    selectedReactionEntryId === rogueArcaneTricksterSpellThiefReactionId;
  const isSongOfDefenseReactionSelected =
    selectedReactionEntryId === wizardBladesingerSongOfDefenseReactionId;
  const isEldritchCannonDetonateReactionSelected =
    selectedReactionEntryId === artificerExplosiveCannonDetonateReactionEntryId;

  const allSpellEntries = useMemo(() => {
    if (!isSpellThiefReactionSelected) {
      return [];
    }

    return getSpellEntries()
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [isSpellThiefReactionSelected]);
  const eldritchCannonCompanions = useMemo(
    () =>
      isEldritchCannonDetonateReactionSelected
        ? getArtificerEldritchCannonCompanionsForCharacter(character)
        : [],
    [character, isEldritchCannonDetonateReactionSelected]
  );
  const selectedFeatureReactionSpellPreview = useMemo(() => {
    if (!selectedReactionEntry) {
      return null;
    }

    return getFeatureReactionSpellForCharacter(character, selectedReactionEntry.id);
  }, [character, selectedReactionEntry]);
  const selectedFeatureReactionSpell =
    selectedReactionEntry && openedFeatureReactionSpellEntryId === selectedReactionEntry.id
      ? selectedFeatureReactionSpellPreview
      : null;
  const selectedReactionSpell =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-spell-")
      ? (classSpellEntriesById.get(selectedStatusEntry.sourceId.replace(/^reaction-spell-/, "")) ??
        null)
      : selectedFeatureReactionSpell;
  const beguilingMagicUsesTotal =
    selectedReactionSpell !== null ? getBeguilingMagicUsesTotalForCharacter(character) : 0;
  const beguilingMagicUsesRemaining =
    selectedReactionSpell !== null ? getBeguilingMagicUsesRemainingForCharacter(character) : 0;
  const shouldResolveBardicInspirationUses =
    selectedReactionEntry !== null || selectedReactionSpell !== null;
  const bardicInspirationUsesRemaining =
    shouldResolveBardicInspirationUses
      ? getBardicInspirationUsesRemainingForCharacter(character)
      : 0;
  const bardicInspirationUsesTotal =
    shouldResolveBardicInspirationUses ? getBardicInspirationUsesTotalForCharacter(character) : 0;
  const warlockStepsOfTheFeyUsesTotal =
    selectedReactionSpell?.id === mistyStepSpellId
      ? getWarlockStepsOfTheFeyUsesTotalForCharacter(character)
      : 0;
  const warlockStepsOfTheFeyUsesRemaining =
    selectedReactionSpell?.id === mistyStepSpellId
      ? getWarlockStepsOfTheFeyUsesRemainingForCharacter(character)
      : 0;
  const selectedReactionSpellSupportsBeguilingMagic =
    selectedReactionSpell !== null &&
    beguilingMagicUsesTotal > 0 &&
    (selectedReactionSpell.magicSchool === MAGIC_SCHOOL.ENCHANTMENT ||
      selectedReactionSpell.magicSchool === MAGIC_SCHOOL.ILLUSION);
  const selectedReactionSpellSupportsStepsOfTheFey =
    selectedReactionSpell?.id === mistyStepSpellId && warlockStepsOfTheFeyUsesTotal > 0;
  const selectedReactionSpellStepsOfTheFeyDisabled =
    selectedReactionSpellSupportsStepsOfTheFey && warlockStepsOfTheFeyUsesRemaining <= 0;
  const availableSongOfDefenseSpellSlotLevels = useMemo(() => {
    if (!isSongOfDefenseReactionSelected) {
      return [];
    }

    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      (slotLevel) => (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
    );
  }, [isSongOfDefenseReactionSelected, spellSlotsRemaining]);
  const selectedSongOfDefenseDamageReduction =
    Math.max(1, Math.min(9, Math.floor(selectedSongOfDefenseSpellSlotLevel || 1))) * 5;
  const cosmicOmenUsesRemaining = selectedReactionEntry
    ? getDruidCosmicOmenUsesRemainingForCharacter(character)
    : 0;
  const cosmicOmenUsesTotal = selectedReactionEntry
    ? getDruidCosmicOmenUsesTotalForCharacter(character)
    : 0;
  const selectedCosmicOmenSelection = selectedReactionEntry
    ? (getDruidCosmicOmenSelectionForCharacter(character) ?? "weal")
    : "weal";
  const spellThiefUsesRemaining = isSpellThiefReactionSelected
    ? getRogueSpellThiefUsesRemainingForCharacter(character)
    : 0;
  const spellThiefUsesTotal = isSpellThiefReactionSelected
    ? getRogueSpellThiefUsesTotalForCharacter(character)
    : 0;
  const gloriousDefenseUsesRemaining = selectedReactionEntry
    ? getGloriousDefenseUsesRemainingForCharacter(character)
    : 0;
  const gloriousDefenseUsesTotal = selectedReactionEntry
    ? getGloriousDefenseUsesTotalForCharacter(character)
    : 0;
  const elementalRebukeUsesRemaining = selectedReactionEntry
    ? getElementalRebukeUsesRemainingForCharacter(character)
    : 0;
  const elementalRebukeUsesTotal = selectedReactionEntry
    ? getElementalRebukeUsesTotalForCharacter(character)
    : 0;
  const flashOfGeniusUsesRemaining = selectedReactionEntry
    ? getArtificerFlashOfGeniusUsesRemainingForCharacter(character)
    : 0;
  const flashOfGeniusUsesTotal = selectedReactionEntry
    ? getArtificerFlashOfGeniusUsesTotalForCharacter(character)
    : 0;
  const perfectedArmorGuardianUsesRemaining = selectedReactionEntry
    ? getArtificerArmorerPerfectedArmorGuardianUsesRemainingForCharacter(character)
    : 0;
  const perfectedArmorGuardianUsesTotal = selectedReactionEntry
    ? getArtificerArmorerPerfectedArmorGuardianUsesTotalForCharacter(character)
    : 0;
  const chillingRetributionUsesRemaining =
    selectedReactionEntry !== null
      ? getRangerWinterWalkerChillingRetributionUsesRemainingForCharacter(character)
      : 0;
  const chillingRetributionUsesTotal =
    selectedReactionEntry !== null
      ? getRangerWinterWalkerChillingRetributionUsesTotalForCharacter(character)
      : 0;
  const sorceryPointsRemaining = selectedReactionEntry
    ? getSorceryPointsRemainingForCharacter(character)
    : 0;
  const sorceryPointsTotal = selectedReactionEntry
    ? getSorceryPointsTotalForCharacter(character)
    : 0;
  const restoreBalanceUsesRemaining = selectedReactionEntry
    ? getSorcererRestoreBalanceUsesRemainingForCharacter(character)
    : 0;
  const restoreBalanceUsesTotal = selectedReactionEntry
    ? getSorcererRestoreBalanceUsesTotalForCharacter(character)
    : 0;
  const channelDivinityUsesRemaining = selectedReactionEntry
    ? getChannelDivinityUsesRemainingForCharacter(character)
    : 0;
  const channelDivinityUsesTotal = selectedReactionEntry
    ? getChannelDivinityUsesTotalForCharacter(character)
    : 0;
  const wardingFlareUsesRemaining = selectedReactionEntry
    ? getClericWardingFlareUsesRemainingForCharacter(character)
    : 0;
  const wardingFlareUsesTotal = selectedReactionEntry
    ? getClericWardingFlareUsesTotalForCharacter(character)
    : 0;
  const bloodthirstUsesRemaining =
    selectedReactionEntry !== null
      ? getRogueScionOfTheThreeBloodthirstUsesRemainingForCharacter(character)
      : 0;
  const bloodthirstUsesTotal =
    selectedReactionEntry !== null
      ? getRogueScionOfTheThreeBloodthirstUsesTotalForCharacter(character)
      : 0;
  const warlockBeguilingDefenseUsesTotal =
    selectedReactionEntry !== null ? getWarlockBeguilingDefenseUsesTotalForCharacter(character) : 0;
  const warlockBeguilingDefenseUsesRemaining =
    selectedReactionEntry !== null
      ? getWarlockBeguilingDefenseUsesRemainingForCharacter(character)
      : 0;
  const warlockPactMagicSlotTotal =
    selectedReactionEntry !== null ? getWarlockPactMagicSlotTotalForCharacter(character) : 0;
  const warlockPactMagicSlotsRemaining =
    selectedReactionEntry !== null ? getWarlockPactMagicSlotsRemainingForCharacter(character) : 0;
  const wizardIllusionistIllusorySelfUsesTotal =
    selectedReactionEntry !== null
      ? getWizardIllusionistIllusorySelfUsesTotalForCharacter(character)
      : 0;
  const wizardIllusionistIllusorySelfUsesRemaining =
    selectedReactionEntry !== null
      ? getWizardIllusionistIllusorySelfUsesRemainingForCharacter(character)
      : 0;
  const wizardIllusionistIllusorySelfFallbackSlotSummary =
    selectedReactionEntry !== null
      ? getWizardIllusionistIllusorySelfFallbackSlotSummaryForCharacter(character)
      : { remaining: 0, total: 0 };
  const selectedRangerHunterSuperiorHuntersDefenseDamageType =
    selectedReactionEntryId === superiorHuntersDefenseReactionId
      ? getRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter(character)
      : null;
  const selectedBranchesOfTheTreeDcFormula = selectedReactionEntry
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
  const spellcastingState = selectedReactionSpell
    ? getSpellcastingStateForCharacter(character)
    : null;

  function closeSelectedReaction() {
    setOpenedFeatureReactionSpellEntryId(null);
    setUseBeguilingMagicOnReactionSpell(false);
    setUseStepsOfTheFeyOnReactionSpell(false);
    setSpellThiefSearchQuery("");
    setSelectedSpellThiefSpellId("");
    setSelectedEldritchCannonCompanionId("");
    setSelectedStatusEntryId(null);
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

  function updateDruidCosmicOmenSelection(nextSelection: DruidCosmicOmenSelection) {
    onPersistCharacter((currentCharacter) =>
      setDruidCosmicOmenSelectionForCharacter(currentCharacter, nextSelection)
    );
  }

  const selectedReactionDescriptor = selectedReactionEntryId
    ? getReactionDescriptor(selectedReactionEntryId)
    : null;
  const reactionDescriptorContext: ReactionDescriptorContext | null = selectedReactionEntry
    ? {
        availableSongOfDefenseSpellSlotLevels,
        bardicInspirationUsesRemaining,
        bardicInspirationUsesTotal,
        bloodthirstUsesRemaining,
        bloodthirstUsesTotal,
        channelDivinityUsesRemaining,
        channelDivinityUsesTotal,
        character,
        chillingRetributionUsesRemaining,
        chillingRetributionUsesTotal,
        cosmicOmenUsesRemaining,
        cosmicOmenUsesTotal,
        elementalRebukeUsesRemaining,
        elementalRebukeUsesTotal,
        eldritchCannonCompanions,
        flashOfGeniusUsesRemaining,
        flashOfGeniusUsesTotal,
        gloriousDefenseUsesRemaining,
        gloriousDefenseUsesTotal,
        hasActiveVowOfEnmity: hasActivePaladinOathOfVengeanceVowOfEnmityForCharacter(character),
        perfectedArmorGuardianUsesRemaining,
        perfectedArmorGuardianUsesTotal,
        restoreBalanceUsesRemaining,
        restoreBalanceUsesTotal,
        selectedBranchesOfTheTreeDcFormula,
        selectedCosmicOmenSelection,
        selectedEldritchCannonCompanionId,
        selectedRangerHunterSuperiorHuntersDefenseDamageType,
        selectedReactionEntry,
        selectedSongOfDefenseDamageReduction,
        selectedSongOfDefenseSpellSlotLevel,
        selectedSpellThiefSpell,
        selectedSpellThiefSpellId,
        setSelectedEldritchCannonCompanionId,
        setSelectedSongOfDefenseSpellSlotLevel,
        setSelectedSpellThiefSpellId,
        setSpellThiefSearchQuery,
        sorceryPointsRemaining,
        sorceryPointsTotal,
        spellSlotTotals,
        spellSlotsRemaining,
        spellThiefFilteredSpellOptions,
        spellThiefSearchQuery,
        spellThiefUsesRemaining,
        spellThiefUsesTotal,
        spellThiefVisibleSpellOptions,
        updateDruidCosmicOmenSelection,
        updateRangerHunterSuperiorHuntersDefenseDamageType,
        warlockBeguilingDefenseUsesRemaining,
        warlockBeguilingDefenseUsesTotal,
        warlockPactMagicSlotTotal,
        warlockPactMagicSlotsRemaining,
        wardingFlareUsesRemaining,
        wardingFlareUsesTotal,
        wizardIllusionistIllusorySelfFallbackSlotSummary,
        wizardIllusionistIllusorySelfUsesRemaining,
        wizardIllusionistIllusorySelfUsesTotal
      }
    : null;

  const selectedReactionResourceWarning =
    selectedReactionDescriptor && reactionDescriptorContext
      ? (selectedReactionDescriptor.getResourceWarning?.(reactionDescriptorContext) ?? null)
      : null;
  const selectedReactionSelectionWarning =
    selectedReactionDescriptor && reactionDescriptorContext
      ? (selectedReactionDescriptor.getSelectionWarning?.(reactionDescriptorContext) ?? null)
      : null;
  const selectedReactionInactiveBladesongWarning =
    isSongOfDefenseReactionSelected && !hasActiveWizardBladesong(character)
      ? "Bladesong is not active."
      : null;
  const selectedReactionActionWarning =
    getRoundTrackerActionWarning("reaction", roundTracker) ??
    selectedReactionInactiveBladesongWarning ??
    selectedReactionSelectionWarning ??
    selectedReactionResourceWarning;
  const selectedReactionDisabledByInactiveBladesong =
    selectedReactionInactiveBladesongWarning !== null;
  const selectedReactionShapeAvailable =
    getRoundTrackerActionWarning("reaction", roundTracker) === null;
  const selectedReactionBlockedReason = spellcastingState?.blocked
    ? spellcastingState.reason
    : null;
  const selectedReactionHeaderTags: FeatureActionHeaderTag[] =
    selectedReactionDescriptor && reactionDescriptorContext
      ? (selectedReactionDescriptor.getHeaderTags?.(reactionDescriptorContext) ?? [])
      : [];
  const selectedReactionResourceSummary =
    selectedReactionDescriptor && reactionDescriptorContext
      ? (selectedReactionDescriptor.getResourceSummary?.(reactionDescriptorContext) ?? null)
      : null;
  const selectedReactionFacts =
    selectedReactionDescriptor && reactionDescriptorContext
      ? (selectedReactionDescriptor.getFacts?.(reactionDescriptorContext) ?? [])
      : [];
  const selectedReactionFactsSectionTitle =
    selectedReactionDescriptor && reactionDescriptorContext
      ? selectedReactionDescriptor.getFactsSectionTitle?.(reactionDescriptorContext)
      : undefined;
  const selectedReactionActionLabel = selectedFeatureReactionSpellPreview
    ? `Open ${selectedFeatureReactionSpellPreview.name}`
    : "Take Reaction";
  const selectedReactionActionDisabled = selectedFeatureReactionSpellPreview
    ? false
    : selectedReactionActionWarning !== null || selectedReactionDisabledByInactiveBladesong;
  const selectedReactionCustomContent =
    selectedReactionDescriptor && reactionDescriptorContext
      ? (selectedReactionDescriptor.renderCustomContent?.(reactionDescriptorContext) ?? null)
      : null;

  useEffect(() => {
    setUseBeguilingMagicOnReactionSpell(false);
  }, [selectedReactionSpell?.id]);
  useEffect(() => {
    setUseStepsOfTheFeyOnReactionSpell(false);
  }, [selectedReactionSpell?.id]);
  useEffect(() => {
    if (selectedReactionEntryId === openedFeatureReactionSpellEntryId) {
      return;
    }

    setOpenedFeatureReactionSpellEntryId(null);
  }, [openedFeatureReactionSpellEntryId, selectedReactionEntryId]);
  useEffect(() => {
    if (isSpellThiefReactionSelected) {
      return;
    }

    setSpellThiefSearchQuery("");
    setSelectedSpellThiefSpellId("");
  }, [isSpellThiefReactionSelected]);
  useEffect(() => {
    if (!isEldritchCannonDetonateReactionSelected) {
      setSelectedEldritchCannonCompanionId("");
      return;
    }

    if (eldritchCannonCompanions.length <= 0) {
      setSelectedEldritchCannonCompanionId("");
      return;
    }

    if (
      eldritchCannonCompanions.some(
        (companion) => companion.id === selectedEldritchCannonCompanionId
      )
    ) {
      return;
    }

    setSelectedEldritchCannonCompanionId(eldritchCannonCompanions[0]?.id ?? "");
  }, [
    eldritchCannonCompanions,
    isEldritchCannonDetonateReactionSelected,
    selectedEldritchCannonCompanionId
  ]);
  useEffect(() => {
    if (
      !selectedReactionSpellSupportsStepsOfTheFey ||
      !selectedReactionSpellStepsOfTheFeyDisabled
    ) {
      return;
    }

    setUseStepsOfTheFeyOnReactionSpell(false);
  }, [selectedReactionSpellStepsOfTheFeyDisabled, selectedReactionSpellSupportsStepsOfTheFey]);
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
    if (!isSongOfDefenseReactionSelected) {
      return;
    }

    const preferredSlotLevel =
      availableSongOfDefenseSpellSlotLevels[0] ??
      [1, 2, 3, 4, 5, 6, 7, 8, 9].find((slotLevel) => (spellSlotTotals[slotLevel - 1] ?? 0) > 0) ??
      1;

    setSelectedSongOfDefenseSpellSlotLevel(preferredSlotLevel);
  }, [availableSongOfDefenseSpellSlotLevels, isSongOfDefenseReactionSelected, spellSlotTotals]);

  function castSelectedReactionSpell(options?: {
    castAsRitual?: boolean;
    useBeguilingMagic?: boolean;
    useStepsOfTheFey?: boolean;
    spellImplementationOptions?: SpellImplementationOptionValues;
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
    const spellImplementationOptions = options?.spellImplementationOptions ?? {};

    if (spellLevel === 0 || castAsRitual) {
      onPersistCharacter((currentCharacter) => {
        const nextCharacter = useBeguilingMagic
          ? consumeBeguilingMagicOrBardicInspirationForCharacter(currentCharacter)
          : currentCharacter;
        const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
          character: nextCharacter,
          spell: selectedReactionSpell,
          spellSlotLevel: null,
          sourceSpellSlotLevel: null,
          castSource: "reaction",
          options: spellImplementationOptions
        });
        const nextCharacterWithSpellDuration = {
          ...nextCharacterWithSpellImplementation,
          statusEntries: applySpellDurationToStatusEntries(
            nextCharacterWithSpellImplementation.statusEntries,
            selectedReactionSpell,
            {
              ...getSpellImplementationStatusOptionsForCharacter({
                character: nextCharacterWithSpellImplementation,
                spell: selectedReactionSpell,
                spellSlotLevel: null,
                sourceSpellSlotLevel: null,
                castSource: "reaction",
                options: spellImplementationOptions
              }),
              sourceSpellSlotLevel: null
            }
          )
        };

        return {
          ...nextCharacterWithSpellDuration,
          roundTracker: consumeRoundTrackerResource(
            nextCharacterWithSpellDuration.roundTracker,
            "reaction"
          )
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
        const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
          character: nextCharacterWithStepsOfTheFey,
          spell: selectedReactionSpell,
          spellSlotLevel: spellLevel,
          sourceSpellSlotLevel: null,
          castSource: "reaction",
          options: spellImplementationOptions
        });
        const nextCharacterWithSpellDuration = {
          ...nextCharacterWithSpellImplementation,
          statusEntries: applySpellDurationToStatusEntries(
            nextCharacterWithSpellImplementation.statusEntries,
            selectedReactionSpell,
            {
              ...getSpellImplementationStatusOptionsForCharacter({
                character: nextCharacterWithSpellImplementation,
                spell: selectedReactionSpell,
                spellSlotLevel: spellLevel,
                sourceSpellSlotLevel: null,
                castSource: "reaction",
                options: spellImplementationOptions
              }),
              sourceSpellSlotLevel: null
            }
          )
        };
        const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
          nextCharacterWithSpellDuration,
          selectedReactionSpell,
          { includeBardBattleMagic: false }
        );

        return {
          ...nextCharacterWithSpellCastEffects,
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
      const nextCharacterWithSpellcast = {
        ...preparedCharacter,
        spellSlotsExpended: nextSpellSlotsExpended,
        roundTracker: consumeRoundTrackerResource(preparedCharacter.roundTracker, "reaction")
      };
      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacterWithSpellcast,
        spell: selectedReactionSpell,
        spellSlotLevel: slotLevel,
        sourceSpellSlotLevel: slotLevel,
        castSource: "reaction",
        options: spellImplementationOptions
      });
      const nextCharacterWithSpellDuration = {
        ...nextCharacterWithSpellImplementation,
        statusEntries: applySpellDurationToStatusEntries(
          nextCharacterWithSpellImplementation.statusEntries,
          selectedReactionSpell,
          {
            ...getSpellImplementationStatusOptionsForCharacter({
              character: nextCharacterWithSpellImplementation,
              spell: selectedReactionSpell,
              spellSlotLevel: slotLevel,
              sourceSpellSlotLevel: slotLevel,
              castSource: "reaction",
              options: spellImplementationOptions
            }),
            sourceSpellSlotLevel: slotLevel
          }
        )
      };

      return applySpellCastFeatureEffectsForCharacter(
        restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter(
          nextCharacterWithSpellDuration
        ),
        selectedReactionSpell,
        { includeBardBattleMagic: false }
      );
    });

    closeSelectedReaction();
  }

  function castSelectedReactionEntry() {
    if (!selectedReactionEntry || !reactionDescriptorContext) {
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

    if (selectedReactionActionDisabled) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyReactionDescriptor(
        currentCharacter,
        selectedReactionDescriptor,
        reactionDescriptorContext
      )
    );

    closeSelectedReaction();
  }

  function takeReactionWithRoll() {
    if (
      !selectedReactionDescriptor ||
      !reactionDescriptorContext ||
      selectedReactionActionWarning
    ) {
      return;
    }

    const rollRequest = selectedReactionDescriptor.createRollRequest?.(reactionDescriptorContext);

    castSelectedReactionEntry();

    if (rollRequest) {
      openDiceRoller(rollRequest);
    }
  }

  const selectedReactionFooterContent =
    selectedReactionDescriptor?.footerActionName && reactionDescriptorContext ? (
      <ReactionRollFooter
        actionName={selectedReactionDescriptor.footerActionName}
        disabled={selectedReactionActionWarning !== null}
        onTakeReaction={takeReactionWithRoll}
      />
    ) : null;

  const reactionSpellActionOptions =
    selectedReactionSpellSupportsBeguilingMagic || selectedReactionSpellSupportsStepsOfTheFey
      ? [
          ...(selectedReactionSpellSupportsBeguilingMagic
            ? [
                {
                  id: "beguiling-magic",
                  label: "Beguiling Magic",
                  checked: useBeguilingMagicOnReactionSpell,
                  onCheckedChange: setUseBeguilingMagicOnReactionSpell,
                  disabled: beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
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
          ...(selectedReactionSpellSupportsStepsOfTheFey
            ? [
                {
                  id: "steps-of-the-fey",
                  label: "Steps of the Fey",
                  checked: useStepsOfTheFeyOnReactionSpell,
                  onCheckedChange: setUseStepsOfTheFeyOnReactionSpell,
                  disabled: selectedReactionSpellStepsOfTheFeyDisabled,
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
            : [])
        ]
      : undefined;

  return {
    castSelectedReactionEntry,
    castSelectedReactionSpell,
    closeSelectedReaction,
    openedFeatureReactionSpellEntryId,
    reactionSpellActionOptions,
    selectedReactionActionWarning,
    selectedReactionActionDisabled,
    selectedReactionActionLabel,
    selectedReactionBlockedReason,
    selectedReactionCustomContent,
    selectedReactionFacts,
    selectedReactionFactsSectionTitle,
    selectedReactionFooterContent,
    selectedReactionHeaderTags,
    selectedReactionResourceSummary,
    selectedReactionShapeAvailable,
    selectedReactionSpell,
    selectedReactionSpellSlotLevel,
    selectedReactionSpellSupportsStepsOfTheFey,
    selectedReactionSpellStepsOfTheFeyDisabled,
    setSelectedReactionSpellSlotLevel,
    useBeguilingMagicOnReactionSpell,
    useStepsOfTheFeyOnReactionSpell
  };
}
