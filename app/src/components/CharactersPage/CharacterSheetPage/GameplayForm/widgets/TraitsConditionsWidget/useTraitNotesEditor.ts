import { useEffect, useId, useRef, useState } from "react";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../../../../../../constants/inputLimits";
import { STATUS_NOTE_CHARGES_MAX } from "../../../../../../pages/CharactersPage/statusEntries";
import type {
  CharacterStatusEntry,
  CharacterStatusEntryNoteCharges
} from "../../../../../../types";
import { sanitizeUserInput } from "../../../../../../utils/userInputSanitization";

type UseTraitNotesEditorOptions = {
  entry: CharacterStatusEntry;
  onSaveNotes: (
    entry: CharacterStatusEntry,
    notes: string,
    noteCharges?: CharacterStatusEntryNoteCharges
  ) => void;
};

function normalizeDraftChargesMax(value: string): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.min(STATUS_NOTE_CHARGES_MAX, Math.floor(parsedValue)));
}

function normalizeDraftNoteCharges(
  maxValue: string,
  currentValue: number
): CharacterStatusEntryNoteCharges | undefined {
  const max = normalizeDraftChargesMax(maxValue);

  if (max <= 0) {
    return undefined;
  }

  return {
    current: Math.max(0, Math.min(max, Math.floor(currentValue))),
    max
  };
}

function getDraftChargesMaxValue(noteCharges: CharacterStatusEntry["noteCharges"]): string {
  return noteCharges ? String(noteCharges.max) : "";
}

export function useTraitNotesEditor({ entry, onSaveNotes }: UseTraitNotesEditorOptions) {
  const notesInputId = useId();
  const notesInputRef = useRef<HTMLTextAreaElement | null>(null);
  const entryNoteChargesMax = entry.noteCharges?.max;
  const entryNoteChargesCurrent = entry.noteCharges?.current ?? 0;
  const entryNoteChargesMaxValue = entryNoteChargesMax ? String(entryNoteChargesMax) : "";
  const [draftNotes, setDraftNotes] = useState(entry.notes ?? "");
  const [draftChargesMax, setDraftChargesMax] = useState(entryNoteChargesMaxValue);
  const [draftChargesCurrent, setDraftChargesCurrent] = useState(entryNoteChargesCurrent);
  const [isEditing, setIsEditing] = useState(false);
  const savedNotes = entry.notes?.trim() ?? "";
  const hasSavedNotes = savedNotes.length > 0;
  const savedNoteCharges = entry.noteCharges;
  const hasSavedNoteCharges = savedNoteCharges !== undefined;
  const hasSavedNoteMetadata = hasSavedNotes || hasSavedNoteCharges;
  const sanitizedDraft = sanitizeUserInput(draftNotes, { multiline: true })
    .slice(0, DEFAULT_TEXTAREA_MAX_LENGTH)
    .trim();
  const draftNoteCharges = normalizeDraftNoteCharges(draftChargesMax, draftChargesCurrent);
  const draftChargesMaxValue = normalizeDraftChargesMax(draftChargesMax);
  const canSave =
    hasSavedNoteMetadata || sanitizedDraft.length > 0 || draftNoteCharges !== undefined;
  const canDecreaseDraftCharges =
    draftNoteCharges !== undefined && draftNoteCharges.current > 0;
  const canIncreaseDraftCharges =
    draftNoteCharges !== undefined && draftNoteCharges.current < draftNoteCharges.max;
  const canClearDraftCharges = draftNoteCharges !== undefined && draftNoteCharges.current > 0;
  const canFillDraftCharges =
    draftNoteCharges !== undefined && draftNoteCharges.current < draftNoteCharges.max;

  useEffect(() => {
    setDraftNotes(entry.notes ?? "");
    setDraftChargesMax(entryNoteChargesMaxValue);
    setDraftChargesCurrent(entryNoteChargesCurrent);
    setIsEditing(false);
  }, [entry.id, entry.notes, entryNoteChargesCurrent, entryNoteChargesMaxValue]);

  function resetDrafts() {
    setDraftNotes(entry.notes ?? "");
    setDraftChargesMax(entryNoteChargesMaxValue);
    setDraftChargesCurrent(entryNoteChargesCurrent);
  }

  function startEditing() {
    resetDrafts();
    setIsEditing(true);
    window.requestAnimationFrame(() => notesInputRef.current?.focus());
  }

  function cancelEditing() {
    resetDrafts();
    setIsEditing(false);
  }

  function updateDraftChargesMax(nextValue: string) {
    const nextMax = normalizeDraftChargesMax(nextValue);
    const previousMax = normalizeDraftChargesMax(draftChargesMax);

    setDraftChargesMax(nextValue.trim().length > 0 ? String(nextMax) : "");
    setDraftChargesCurrent((current) => {
      if (nextMax <= 0) {
        return 0;
      }

      return previousMax > 0 ? Math.min(current, nextMax) : nextMax;
    });
  }

  function adjustDraftCharges(delta: number) {
    setDraftChargesCurrent((current) => {
      if (draftChargesMaxValue <= 0) {
        return 0;
      }

      return Math.max(0, Math.min(draftChargesMaxValue, current + delta));
    });
  }

  function setDraftChargesToMinimum() {
    setDraftChargesCurrent(0);
  }

  function setDraftChargesToMaximum() {
    setDraftChargesCurrent(draftChargesMaxValue);
  }

  function saveNotes() {
    if (!canSave) {
      return;
    }

    onSaveNotes(entry, sanitizedDraft, draftNoteCharges);
    setDraftNotes(sanitizedDraft);
    setDraftChargesMax(getDraftChargesMaxValue(draftNoteCharges));
    setDraftChargesCurrent(draftNoteCharges?.current ?? 0);
    setIsEditing(false);
  }

  return {
    adjustDraftCharges,
    canSave,
    canClearDraftCharges,
    canDecreaseDraftCharges,
    canFillDraftCharges,
    canIncreaseDraftCharges,
    cancelEditing,
    draftChargesCurrent: draftNoteCharges?.current ?? 0,
    draftChargesMax,
    draftChargesMaxValue,
    draftNotes,
    hasSavedNoteCharges,
    hasSavedNoteMetadata,
    hasSavedNotes,
    isEditing,
    notesInputId,
    notesInputRef,
    saveNotes,
    savedNoteCharges,
    savedNotes,
    setDraftChargesMax: updateDraftChargesMax,
    setDraftChargesToMaximum,
    setDraftChargesToMinimum,
    setDraftNotes,
    startEditing
  };
}

export type TraitNotesEditorState = ReturnType<typeof useTraitNotesEditor>;
