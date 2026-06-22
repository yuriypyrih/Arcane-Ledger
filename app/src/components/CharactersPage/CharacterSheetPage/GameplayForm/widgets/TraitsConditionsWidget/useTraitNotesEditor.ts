import { useEffect, useId, useRef, useState } from "react";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../../../../../../constants/inputLimits";
import type { CharacterStatusEntry } from "../../../../../../types";
import { sanitizeUserInput } from "../../../../../../utils/userInputSanitization";

type UseTraitNotesEditorOptions = {
  entry: CharacterStatusEntry;
  onSaveNotes: (entry: CharacterStatusEntry, notes: string) => void;
};

export function useTraitNotesEditor({ entry, onSaveNotes }: UseTraitNotesEditorOptions) {
  const notesInputId = useId();
  const notesInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [draftNotes, setDraftNotes] = useState(entry.notes ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const savedNotes = entry.notes?.trim() ?? "";
  const hasSavedNotes = savedNotes.length > 0;
  const sanitizedDraft = sanitizeUserInput(draftNotes, { multiline: true })
    .slice(0, DEFAULT_TEXTAREA_MAX_LENGTH)
    .trim();
  const canSave = hasSavedNotes || sanitizedDraft.length > 0;

  useEffect(() => {
    setDraftNotes(entry.notes ?? "");
    setIsEditing(false);
  }, [entry.id, entry.notes]);

  function startEditing() {
    setDraftNotes(entry.notes ?? "");
    setIsEditing(true);
    window.requestAnimationFrame(() => notesInputRef.current?.focus());
  }

  function cancelEditing() {
    setDraftNotes(entry.notes ?? "");
    setIsEditing(false);
  }

  function saveNotes() {
    if (!canSave) {
      return;
    }

    onSaveNotes(entry, sanitizedDraft);
    setDraftNotes(sanitizedDraft);
    setIsEditing(false);
  }

  return {
    canSave,
    cancelEditing,
    draftNotes,
    hasSavedNotes,
    isEditing,
    notesInputId,
    notesInputRef,
    saveNotes,
    savedNotes,
    setDraftNotes,
    startEditing
  };
}

export type TraitNotesEditorState = ReturnType<typeof useTraitNotesEditor>;
