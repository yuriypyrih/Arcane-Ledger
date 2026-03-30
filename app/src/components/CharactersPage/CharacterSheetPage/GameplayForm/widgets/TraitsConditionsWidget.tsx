import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../../codex/classes";
import type { SpellEntry } from "../../../../../codex/entries";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import {
  getDerivedFeatureStatusEntriesForCharacter,
  getFeatureReactionEntriesForCharacter,
  getSpellcastingStateForCharacter,
  removeFeatureStatusEntryForCharacter
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

type TraitsConditionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

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
  const [selectedReactionSpellSlotLevel, setSelectedReactionSpellSlotLevel] = useState(1);

  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const classSpellEntries = useClassSpellEntries(character.className);
  const featGrantedCantripEntries = useMemo(
    () => getFeatGrantedCantripEntriesForCharacter(character),
    [character]
  );
  const preparedSpellPoolEntries = usePreparedSpellEntries(character.className, character.level);
  const cantripLimit = useMemo(
    () =>
      getCantripLimitForCharacter(
        character.className,
        character.level,
        character.classFeatureState
      ),
    [character.classFeatureState, character.className, character.level]
  );
  const preparedSpellLimit = useMemo(
    () => getPreparedSpellLimitForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const spellSlotTotals = useMemo(
    () => getSpellSlotTotalsForCharacter(character.className, character.level),
    [character.className, character.level]
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
  const usesPreparedSpells = useMemo(
    () => usesPreparedSpellsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const alwaysPreparedSpellIds = useMemo(
    () =>
      getAlwaysPreparedSpellIds(character.className, character.level, character.classFeatureState),
    [character.classFeatureState, character.className, character.level]
  );
  const classSpellEntriesById = useMemo(
    () =>
      new Map(
        [...classSpellEntries, ...featGrantedCantripEntries, ...preparedSpellPoolEntries].map(
          (spell) => [spell.id, spell]
        )
      ),
    [classSpellEntries, featGrantedCantripEntries, preparedSpellPoolEntries]
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
  const selectedReactionSpell =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-spell-")
      ? (classSpellEntriesById.get(selectedStatusEntry.sourceId.replace(/^reaction-spell-/, "")) ??
        null)
      : null;
  const selectedReactionEntry =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-entry-")
      ? (featureReactionEntriesById.get(
          selectedStatusEntry.sourceId as `reaction-entry-${string}`
        ) ?? null)
      : null;
  const spellcastingState = getSpellcastingStateForCharacter(character);
  const selectedReactionActionWarning = getRoundTrackerActionWarning("reaction", roundTracker);
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
      getStatusDurationTickOn(selectedStatusEntry.duration) ?? STATUS_DURATION_ROUND_TICK.ROUND_START
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
    setSelectedStatusEntryId(null);
  }

  function castSelectedReactionSpell(options?: { castAsRitual?: boolean }) {
    if (!selectedReactionSpell || selectedReactionBlockedReason || selectedReactionActionWarning) {
      return;
    }

    const spellLevel = getSpellLevel(selectedReactionSpell);
    const castAsRitual =
      options?.castAsRitual === true && selectedReactionSpell.ritual === true;

    if (spellLevel === 0) {
      onPersistCharacter((currentCharacter) => ({
        ...currentCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          currentCharacter.statusEntries,
          selectedReactionSpell
        ),
        roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, "reaction")
      }));
      closeSelectedReaction();
      return;
    }

    if (castAsRitual) {
      onPersistCharacter((currentCharacter) => ({
        ...currentCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          currentCharacter.statusEntries,
          selectedReactionSpell
        ),
        roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, "reaction")
      }));

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
      const nextSpellSlotsExpended = Array.from(
        { length: 9 },
        (_, index) => (currentCharacter.spellSlotsExpended?.[index] as number | undefined) ?? 0
      );
      nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

      return {
        ...currentCharacter,
        spellSlotsExpended: nextSpellSlotsExpended,
        statusEntries: applySpellConcentrationToStatusEntries(
          currentCharacter.statusEntries,
          selectedReactionSpell
        ),
        roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, "reaction")
      };
    });

    closeSelectedReaction();
  }

  function castSelectedReactionEntry() {
    if (!selectedReactionEntry || selectedReactionActionWarning) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, "reaction")
    }));

    closeSelectedReaction();
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
          onAction={castSelectedReactionSpell}
          actionWarning={selectedReactionActionWarning}
          actionDisabled={selectedReactionActionWarning !== null}
          blockedReason={selectedReactionBlockedReason}
        />
      ) : null}

      {selectedReactionEntry && selectedStatusEntry ? (
        <ReactionEntryDrawer
          reaction={selectedReactionEntry}
          actionWarning={selectedReactionActionWarning}
          onCast={castSelectedReactionEntry}
          onClose={closeSelectedReaction}
        />
      ) : null}

      {selectedStatusEntry && !selectedReactionSpell && !selectedReactionEntry ? (
        <StatusEntryDrawer
          entry={selectedStatusEntry}
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
