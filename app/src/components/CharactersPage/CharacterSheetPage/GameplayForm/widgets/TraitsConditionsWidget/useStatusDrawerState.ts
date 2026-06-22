import { useEffect, useState } from "react";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { removeFeatureStatusEntryForCharacter } from "../../../../../../pages/CharactersPage/classFeatures";
import { createDefaultDeathSaves } from "../../gameplayStateUtils";
import {
  getExhaustionLevel,
  isExhaustionStatusEntry,
  removeCharacterStatusEntry,
  setCharacterExhaustionLevel,
  updateCharacterStatusEntryDuration,
  updateCharacterStatusEntryNotes
} from "../../../../../../pages/CharactersPage/statusEntries";
import {
  reconcileCharacterStatusConsequences,
  type ExhaustionLevel
} from "../../../../../../pages/CharactersPage/traits";
import type { CharacterStatusEntry } from "../../../../../../types";
import { STATUS_ENTRY_SOURCE_TYPE } from "../../../../../../types";
import {
  createManualStatusDuration,
  defaultManualStatusDurationDraft,
  getManualStatusDurationDraft
} from "./manualStatusDuration";

type UseStatusDrawerStateOptions = {
  onPersistCharacter: PersistCharacterUpdater;
  selectedStatusEntry: CharacterStatusEntry | null;
  selectedStatusEntryId: string | null;
  setSelectedStatusEntryId: (entryId: string | null) => void;
};

export function useStatusDrawerState({
  onPersistCharacter,
  selectedStatusEntry,
  selectedStatusEntryId,
  setSelectedStatusEntryId
}: UseStatusDrawerStateOptions) {
  const [isEditingStatusDuration, setIsEditingStatusDuration] = useState(false);
  const [statusDrawerDurationType, setStatusDrawerDurationType] = useState(
    defaultManualStatusDurationDraft.type
  );
  const [statusDrawerDurationValue, setStatusDrawerDurationValue] = useState(
    defaultManualStatusDurationDraft.value
  );

  useEffect(() => {
    if (!selectedStatusEntryId) {
      return;
    }

    if (selectedStatusEntry) {
      return;
    }

    setSelectedStatusEntryId(null);
  }, [selectedStatusEntry, selectedStatusEntryId, setSelectedStatusEntryId]);

  useEffect(() => {
    if (!selectedStatusEntry) {
      setIsEditingStatusDuration(false);
      return;
    }

    const durationDraft = getManualStatusDurationDraft(selectedStatusEntry.duration);

    setStatusDrawerDurationType(durationDraft.type);
    setStatusDrawerDurationValue(durationDraft.value);
    setIsEditingStatusDuration(false);
  }, [selectedStatusEntry, selectedStatusEntryId]);

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

      return reconcileCharacterStatusConsequences({
        ...currentCharacter,
        statusEntries: removeCharacterStatusEntry(currentCharacter.statusEntries, entry.id)
      });
    });

    setSelectedStatusEntryId(null);
  }

  function applyStatusEntryDuration() {
    if (!selectedStatusEntry) {
      return;
    }

    const nextDuration = createManualStatusDuration(
      statusDrawerDurationType,
      statusDrawerDurationValue
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

  function saveStatusEntryNotes(entry: CharacterStatusEntry, notes: string) {
    onPersistCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        statusEntries: updateCharacterStatusEntryNotes(currentCharacter.statusEntries, entry, notes)
      }),
      {
        domains: ["statuses"],
        normalize: "targeted"
      }
    );
  }

  function cancelStatusDurationEdit() {
    if (!selectedStatusEntry) {
      return;
    }

    const durationDraft = getManualStatusDurationDraft(selectedStatusEntry.duration);

    setStatusDrawerDurationType(durationDraft.type);
    setStatusDrawerDurationValue(durationDraft.value);
    setIsEditingStatusDuration(false);
  }

  const selectedExhaustionLevel =
    selectedStatusEntry && isExhaustionStatusEntry(selectedStatusEntry)
      ? Math.max(1, Math.min(6, selectedStatusEntry.conditionLevel ?? 1))
      : null;

  return {
    applyStatusEntryDuration,
    cancelStatusDurationEdit,
    isEditingStatusDuration,
    removeStatusEntry,
    saveStatusEntryNotes,
    selectedExhaustionLevel,
    setIsEditingStatusDuration,
    setStatusDrawerDurationType,
    setStatusDrawerDurationValue,
    statusDrawerDurationType,
    statusDrawerDurationValue,
    updateExhaustionLevel
  };
}
