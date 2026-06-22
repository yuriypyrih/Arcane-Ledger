import clsx from "clsx";
import { Pencil, Save, ScrollText, X } from "lucide-react";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../../../../../../constants/inputLimits";
import TextAreaInput from "../../../../FormInputs/TextAreaInput";
import InlineToggleButton from "../../../InlineToggleButton";
import styles from "./StatusEntryDrawer.module.css";
import type { TraitNotesEditorState } from "./useTraitNotesEditor";

type TraitNotesBodyProps = {
  editor: TraitNotesEditorState;
  className?: string;
};

type TraitNotesFooterControlsProps = {
  editor: TraitNotesEditorState;
  className?: string;
};

export function TraitNotesBody({ editor, className }: TraitNotesBodyProps) {
  if (editor.isEditing) {
    return (
      <section className={clsx(styles.notesSection, className)}>
        <label className={styles.notesLabel} htmlFor={editor.notesInputId}>
          Notes
        </label>
        <TextAreaInput
          ref={editor.notesInputRef}
          id={editor.notesInputId}
          className={styles.notesTextarea}
          value={editor.draftNotes}
          maxLength={DEFAULT_TEXTAREA_MAX_LENGTH}
          onChange={(event) => editor.setDraftNotes(event.target.value)}
        />
      </section>
    );
  }

  if (editor.hasSavedNotes) {
    return (
      <section className={clsx(styles.notesSection, className)}>
        <p className={styles.notesText}>
          <span className={styles.notesInlineLabel}>NOTES:</span> {editor.savedNotes}
        </p>
      </section>
    );
  }

  return null;
}

export function TraitNotesFooterControls({
  editor,
  className
}: TraitNotesFooterControlsProps) {
  if (editor.isEditing) {
    return (
      <div className={clsx(styles.notesActionRow, styles.notesFooterActionRow, className)}>
        <InlineToggleButton
          label="Save"
          icon={<Save size={15} aria-hidden="true" />}
          onClick={editor.saveNotes}
          disabled={!editor.canSave}
        />
        <InlineToggleButton
          className={styles.notesCancelAction}
          label="Cancel"
          icon={<X size={15} aria-hidden="true" />}
          onClick={editor.cancelEditing}
        />
      </div>
    );
  }

  return (
    <div className={clsx(styles.notesActionRow, styles.notesFooterActionRow, className)}>
      <InlineToggleButton
        label={editor.hasSavedNotes ? "Edit Notes" : "Add Notes"}
        icon={
          editor.hasSavedNotes ? (
            <Pencil size={15} aria-hidden="true" />
          ) : (
            <ScrollText size={15} aria-hidden="true" />
          )
        }
        onClick={editor.startEditing}
      />
    </div>
  );
}
