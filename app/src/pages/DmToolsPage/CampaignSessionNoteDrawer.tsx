import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { CampaignSessionNoteInput, CampaignSessionNoteRecord } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import TextAreaInput from "../../components/CharactersPage/FormInputs/TextAreaInput";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer
} from "../../components/Overlay";
import shared from "../../components/CharactersPage/CharacterSheetPage/CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./CampaignSessionNoteDrawer.module.css";

export const CAMPAIGN_SESSION_NOTE_DESCRIPTION_MAX_LENGTH = 10000;

type CampaignSessionNoteDrawerProps = {
  note?: CampaignSessionNoteRecord;
  onClose: () => void;
  onSave: (sessionNote: CampaignSessionNoteInput) => Promise<void>;
  sessionIndex: number;
};

function getSessionTitle(sessionIndex: number, name: string) {
  const trimmedName = name.trim();

  return trimmedName ? `Session ${sessionIndex} - ${trimmedName}` : `Session ${sessionIndex}`;
}

function CampaignSessionNoteDrawer({
  note,
  onClose,
  onSave,
  sessionIndex
}: CampaignSessionNoteDrawerProps) {
  const titleId = useId();
  const nameInputId = useId();
  const notesInputId = useId();
  const [draftName, setDraftName] = useState(note?.name ?? "");
  const [draftNotes, setDraftNotes] = useState(note?.description ?? "");
  const [isEditingName, setIsEditingName] = useState(!note);
  const [isEditingNotes, setIsEditingNotes] = useState(!note);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const notesInputRef = useRef<HTMLTextAreaElement | null>(null);
  const trimmedName = draftName.trim();
  const trimmedNotes = draftNotes.trim();
  const isNotesInvalid =
    trimmedNotes.length === 0 || trimmedNotes.length > CAMPAIGN_SESSION_NOTE_DESCRIPTION_MAX_LENGTH;
  const hasDirtyState =
    !note || trimmedName !== (note.name ?? "") || trimmedNotes !== note.description;
  const title = getSessionTitle(sessionIndex, note?.name ?? trimmedName);
  const canSave = hasDirtyState && !isNotesInvalid && !isSaving;

  function startEditingName() {
    setIsEditingName(true);
    window.requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
  }

  function startEditingNotes() {
    setIsEditingNotes(true);
    window.requestAnimationFrame(() => {
      notesInputRef.current?.focus();
    });
  }

  function cancelNameEdit() {
    setDraftName(note?.name ?? "");
    setIsEditingName(false);
  }

  function cancelNotesEdit() {
    setDraftNotes(note?.description ?? "");
    setIsEditingNotes(false);
  }

  async function saveChanges() {
    if (isNotesInvalid || isSaving) {
      setError("Session Notes are required and must be at most 10000 characters.");
      setIsEditingNotes(true);
      window.requestAnimationFrame(() => notesInputRef.current?.focus());
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSave({
        ...(trimmedName ? { name: trimmedName } : {}),
        description: trimmedNotes
      });
      onClose();
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to save session note."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetDrawer titleId={titleId} onClose={onClose} onEscape={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>{title}</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary>Campaign session note</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close session note" disabled={isSaving} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.fieldSection}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel} htmlFor={nameInputId}>
              Session Name
            </label>
            {isEditingName ? (
              note ? (
                <button type="button" className={shared.editButton} onClick={cancelNameEdit}>
                  <X size={16} aria-hidden="true" />
                  Cancel
                </button>
              ) : null
            ) : (
              <button type="button" className={shared.editButton} onClick={startEditingName}>
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>
            )}
          </div>
          <div className={styles.prefixedInput}>
            <span className={styles.sessionPrefix}>Session {sessionIndex} -</span>
            <TextInput
              ref={nameInputRef}
              id={nameInputId}
              className={clsx(!isEditingName && styles.readOnlyControl)}
              value={draftName}
              placeholder="Optional name"
              readOnly={!isEditingName}
              disabled={isSaving}
              onChange={(event) => {
                setDraftName(event.target.value);
                setError(null);
              }}
            />
          </div>
        </section>

        <section className={styles.fieldSection}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel} htmlFor={notesInputId}>
              Session Notes
            </label>
            {isEditingNotes ? (
              note ? (
                <button type="button" className={shared.editButton} onClick={cancelNotesEdit}>
                  <X size={16} aria-hidden="true" />
                  Cancel
                </button>
              ) : null
            ) : (
              <button type="button" className={shared.editButton} onClick={startEditingNotes}>
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>
            )}
          </div>

          <TextAreaInput
            ref={notesInputRef}
            id={notesInputId}
            className={clsx(styles.notesTextarea, !isEditingNotes && styles.readOnlyControl)}
            value={draftNotes}
            maxLength={CAMPAIGN_SESSION_NOTE_DESCRIPTION_MAX_LENGTH}
            placeholder="No session notes yet."
            readOnly={!isEditingNotes}
            disabled={isSaving}
            invalid={Boolean(error)}
            onChange={(event) => {
              setDraftNotes(event.target.value);
              setError(null);
            }}
          />
          <p className={styles.characterCounter}>
            {trimmedNotes.length}/{CAMPAIGN_SESSION_NOTE_DESCRIPTION_MAX_LENGTH}
          </p>
          {error ? (
            <span className={styles.errorText} role="alert">
              {error}
            </span>
          ) : null}
        </section>
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.footerActions}>
          <ActionButton
            fullWidth={false}
            icon={<Save size={16} aria-hidden="true" />}
            disabled={!canSave}
            loading={isSaving}
            loadingLabel="Saving session note"
            onClick={() => {
              void saveChanges();
            }}
          >
            Save changes
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetDrawer>
  );
}

export default CampaignSessionNoteDrawer;
