import clsx from "clsx";
import {
  ChevronsLeft,
  ChevronsRight,
  Minus,
  Pencil,
  Plus,
  Save,
  ScrollText,
  Undo2
} from "lucide-react";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../../../../../../constants/inputLimits";
import { STATUS_NOTE_CHARGES_MAX } from "../../../../../../pages/CharactersPage/statusEntries";
import ActionButton from "../../../../../ActionButton";
import NumberInput from "../../../../FormInputs/NumberInput";
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
        <div className={styles.noteChargesEditor}>
          <div className={styles.noteChargesControls} role="group" aria-label="Note charges">
            <label className={styles.noteChargesMaxField}>
              <span className={styles.noteChargesMaxLabel}>Max Charges</span>
              <NumberInput
                min={0}
                max={STATUS_NOTE_CHARGES_MAX}
                value={editor.draftChargesMax}
                className={styles.noteChargesMaxInput}
                aria-label="Maximum note charges"
                onChange={(event) => editor.setDraftChargesMax(event.target.value)}
              />
            </label>
            <div className={styles.noteChargesStepper}>
              <ActionButton
                className={styles.noteChargesIconButton}
                actionType="ERROR"
                variant="OUTLINE"
                size="sm"
                fullWidth={false}
                iconOnly
                icon={<ChevronsLeft size={15} aria-hidden="true" />}
                onClick={editor.setDraftChargesToMinimum}
                disabled={!editor.canClearDraftCharges}
                aria-label="Set note charges to zero"
                title="Set note charges to zero"
              />
              <ActionButton
                className={styles.noteChargesIconButton}
                actionType="ERROR"
                variant="OUTLINE"
                size="sm"
                fullWidth={false}
                iconOnly
                icon={<Minus size={15} aria-hidden="true" />}
                onClick={() => editor.adjustDraftCharges(-1)}
                disabled={!editor.canDecreaseDraftCharges}
                aria-label="Use 1 note charge"
                title="Use 1 note charge"
              />
              <span className={styles.noteChargesCurrent} aria-live="polite">
                {editor.draftChargesCurrent}/{editor.draftChargesMaxValue}
              </span>
              <ActionButton
                className={styles.noteChargesIconButton}
                actionType="INFO"
                variant="OUTLINE"
                size="sm"
                fullWidth={false}
                iconOnly
                icon={<Plus size={15} aria-hidden="true" />}
                onClick={() => editor.adjustDraftCharges(1)}
                disabled={!editor.canIncreaseDraftCharges}
                aria-label="Recover 1 note charge"
                title="Recover 1 note charge"
              />
              <ActionButton
                className={styles.noteChargesIconButton}
                actionType="INFO"
                variant="OUTLINE"
                size="sm"
                fullWidth={false}
                iconOnly
                icon={<ChevronsRight size={15} aria-hidden="true" />}
                onClick={editor.setDraftChargesToMaximum}
                disabled={!editor.canFillDraftCharges}
                aria-label="Set note charges to maximum"
                title="Set note charges to maximum"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (editor.hasSavedNoteMetadata) {
    return (
      <section className={clsx(styles.notesSection, className)}>
        {editor.hasSavedNotes ? (
          <p className={styles.notesText}>
            <span className={styles.notesInlineHeader}>
              <ScrollText size={14} aria-hidden="true" />
              <span className={styles.notesInlineLabel}>NOTES:</span>
            </span>{" "}
            {editor.savedNotes}
          </p>
        ) : null}
        {editor.savedNoteCharges ? (
          <div className={clsx(styles.notesText, styles.noteChargesReadout)}>
            <div className={styles.noteChargesReadoutHeader}>
              <span className={styles.notesInlineHeader}>
                <ScrollText size={14} aria-hidden="true" />
                <span className={styles.notesInlineLabel}>CHARGES:</span>
              </span>
            </div>
            <div className={styles.noteChargesReadoutStepper} role="group" aria-label="Charges">
              <ActionButton
                className={styles.noteChargesIconButton}
                actionType="ERROR"
                variant="OUTLINE"
                size="sm"
                fullWidth={false}
                iconOnly
                icon={<Minus size={15} aria-hidden="true" />}
                onClick={() => editor.adjustSavedCharges(-1)}
                disabled={!editor.canDecreaseSavedCharges}
                aria-label="Use 1 charge"
                title="Use 1 charge"
              />
              <span className={styles.noteChargesCurrent} aria-live="polite">
                {editor.savedNoteCharges.current}/{editor.savedNoteCharges.max}
              </span>
              <ActionButton
                className={styles.noteChargesIconButton}
                actionType="INFO"
                variant="OUTLINE"
                size="sm"
                fullWidth={false}
                iconOnly
                icon={<Plus size={15} aria-hidden="true" />}
                onClick={() => editor.adjustSavedCharges(1)}
                disabled={!editor.canIncreaseSavedCharges}
                aria-label="Recover 1 charge"
                title="Recover 1 charge"
              />
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return null;
}

export function TraitNotesFooterControls({ editor, className }: TraitNotesFooterControlsProps) {
  if (editor.isEditing) {
    return (
      <div className={clsx(styles.notesFooterButtonRow, className)}>
        <ActionButton
          className={styles.footerActionButton}
          actionType="INFO"
          variant="FILL"
          icon={<Save size={15} aria-hidden="true" />}
          onClick={editor.saveNotes}
          disabled={!editor.canSave}
        >
          Save
        </ActionButton>
        <ActionButton
          className={styles.footerActionButton}
          actionType="INFO"
          variant="OUTLINE"
          icon={<Undo2 size={15} aria-hidden="true" />}
          onClick={editor.cancelEditing}
        >
          Cancel
        </ActionButton>
      </div>
    );
  }

  return (
    <div className={clsx(styles.notesActionRow, styles.notesFooterActionRow, className)}>
      <InlineToggleButton
        label={editor.hasSavedNoteMetadata ? "Edit Notes" : "Add Notes"}
        icon={
          editor.hasSavedNoteMetadata ? (
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
