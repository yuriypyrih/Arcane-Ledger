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
import { applySpellConcentrationToStatusEntries } from "../../../../../../pages/CharactersPage/statusEntries";
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
import { wizardBladesingerSongOfDefenseReactionId } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
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
  const selectedSongOfDefenseDamageReduction =
    Math.max(1, Math.min(9, Math.floor(selectedSongOfDefenseSpellSlotLevel || 1))) * 5;
  const cosmicOmenUsesRemaining = getDruidCosmicOmenUsesRemainingForCharacter(character);
  const cosmicOmenUsesTotal = getDruidCosmicOmenUsesTotalForCharacter(character);
  const selectedCosmicOmenSelection = getDruidCosmicOmenSelectionForCharacter(character) ?? "weal";
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
  const sorceryPointsTotal = getSorceryPointsTotalForCharacter(character);
  const restoreBalanceUsesRemaining = getSorcererRestoreBalanceUsesRemainingForCharacter(character);
  const restoreBalanceUsesTotal = getSorcererRestoreBalanceUsesTotalForCharacter(character);
  const channelDivinityUsesRemaining = getChannelDivinityUsesRemainingForCharacter(character);
  const channelDivinityUsesTotal = getChannelDivinityUsesTotalForCharacter(character);
  const wardingFlareUsesRemaining = getClericWardingFlareUsesRemainingForCharacter(character);
  const wardingFlareUsesTotal = getClericWardingFlareUsesTotalForCharacter(character);
  const bloodthirstUsesRemaining =
    getRogueScionOfTheThreeBloodthirstUsesRemainingForCharacter(character);
  const bloodthirstUsesTotal = getRogueScionOfTheThreeBloodthirstUsesTotalForCharacter(character);
  const selectedRangerHunterSuperiorHuntersDefenseDamageType =
    selectedReactionEntry?.id === superiorHuntersDefenseReactionId
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
  const spellcastingState = getSpellcastingStateForCharacter(character);

  function closeSelectedReaction() {
    setOpenedFeatureReactionSpellEntryId(null);
    setUseBeguilingMagicOnReactionSpell(false);
    setUseStepsOfTheFeyOnReactionSpell(false);
    setSpellThiefSearchQuery("");
    setSelectedSpellThiefSpellId("");
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

  const selectedReactionDescriptor = getReactionDescriptor(selectedReactionEntry?.id);
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
        gloriousDefenseUsesRemaining,
        gloriousDefenseUsesTotal,
        hasActiveVowOfEnmity: hasActivePaladinOathOfVengeanceVowOfEnmityForCharacter(character),
        restoreBalanceUsesRemaining,
        restoreBalanceUsesTotal,
        selectedBranchesOfTheTreeDcFormula,
        selectedCosmicOmenSelection,
        selectedRangerHunterSuperiorHuntersDefenseDamageType,
        selectedReactionEntry,
        selectedSongOfDefenseDamageReduction,
        selectedSongOfDefenseSpellSlotLevel,
        selectedSpellThiefSpell,
        selectedSpellThiefSpellId,
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
  const selectedReactionActionWarning =
    getRoundTrackerActionWarning("reaction", roundTracker) ??
    selectedReactionSelectionWarning ??
    selectedReactionResourceWarning;
  const selectedReactionShapeAvailable =
    getRoundTrackerActionWarning("reaction", roundTracker) === null;
  const selectedReactionBlockedReason = spellcastingState.blocked ? spellcastingState.reason : null;
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
    : selectedReactionActionWarning !== null;
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

    if (spellLevel === 0 || castAsRitual) {
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

    if (selectedReactionActionWarning) {
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
