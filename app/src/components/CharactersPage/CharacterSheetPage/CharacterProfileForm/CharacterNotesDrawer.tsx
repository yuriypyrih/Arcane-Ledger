import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import ActionButton from "../../../ActionButton";
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
} from "../../../Overlay";
import SelectInput from "../../FormInputs/SelectInput";
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import { alignmentOptions } from "../../../../pages/CharactersPage/constants";
import {
  getCharacterBackgroundDisplayName,
  getCharacterClassDisplayName,
  getCharacterSpeciesDisplayName
} from "../../../../pages/CharactersPage/customOrigins";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { Character } from "../../../../types";
import { sanitizeUserInput } from "../../../../utils/userInputSanitization";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CharacterNotesDrawer.module.css";

type CharacterNotesDrawerProps = {
  character: Character;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

function getCharacterSummary(character: Character) {
  const identityLine = [
    getCharacterSpeciesDisplayName(character),
    getCharacterClassDisplayName(character)
  ].filter(Boolean).join(" ");
  const background = getCharacterBackgroundDisplayName(character).trim();
  const alignment = character.alignment.trim();

  return [identityLine, background, alignment].filter(Boolean).join(" - ") || "Character profile";
}

function CharacterNotesDrawer({
  character,
  onClose,
  onPersistCharacter
}: CharacterNotesDrawerProps) {
  const titleId = useId();
  const nameInputId = useId();
  const alignmentInputId = useId();
  const notesInputId = useId();
  const [draftName, setDraftName] = useState(character.name);
  const [draftAlignment, setDraftAlignment] = useState<Character["alignment"]>(
    character.alignment
  );
  const [draftNotes, setDraftNotes] = useState(character.backgroundNotes);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAlignment, setIsEditingAlignment] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const alignmentInputRef = useRef<HTMLSelectElement | null>(null);
  const notesInputRef = useRef<HTMLTextAreaElement | null>(null);
  const trimmedName = draftName.trim();
  const isNameInvalid = trimmedName.length === 0;
  const hasDirtyState =
    trimmedName !== character.name.trim() ||
    draftAlignment !== character.alignment ||
    draftNotes !== character.backgroundNotes;
  const characterSummary = getCharacterSummary(character);

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

  function startEditingAlignment() {
    setIsEditingAlignment(true);
    window.requestAnimationFrame(() => {
      alignmentInputRef.current?.focus();
    });
  }

  function cancelNameEdit() {
    setDraftName(character.name);
    setIsEditingName(false);
  }

  function cancelAlignmentEdit() {
    setDraftAlignment(character.alignment);
    setIsEditingAlignment(false);
  }

  function cancelNotesEdit() {
    setDraftNotes(character.backgroundNotes);
    setIsEditingNotes(false);
  }

  function saveChanges() {
    const sanitizedName = sanitizeUserInput(draftName);
    const sanitizedNotes = sanitizeUserInput(draftNotes, { multiline: true });

    if (!sanitizedName) {
      setIsEditingName(true);
      window.requestAnimationFrame(() => nameInputRef.current?.focus());
      return;
    }

    onPersistCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        name: sanitizedName,
        alignment: draftAlignment,
        backgroundNotes: sanitizedNotes
      }),
      {
        domains: ["profile"],
        normalize: "targeted",
        flush: true
      }
    );
    onClose();
  }

  return (
    <SheetDrawer titleId={titleId} onClose={onClose} onEscape={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>{character.name}</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary>{characterSummary}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close character notes" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.fieldSection}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel} htmlFor={nameInputId}>
              Character name
            </label>
            {isEditingName ? (
              <button type="button" className={shared.editButton} onClick={cancelNameEdit}>
                <X size={16} aria-hidden="true" />
                Cancel
              </button>
            ) : (
              <button type="button" className={shared.editButton} onClick={startEditingName}>
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>
            )}
          </div>
          <TextInput
            ref={nameInputRef}
            id={nameInputId}
            className={clsx(!isEditingName && styles.readOnlyControl)}
            value={draftName}
            invalid={isNameInvalid}
            readOnly={!isEditingName}
            aria-describedby={isNameInvalid ? `${nameInputId}-error` : undefined}
            onChange={(event) => setDraftName(event.target.value)}
          />
          {isNameInvalid ? (
            <span id={`${nameInputId}-error`} className={styles.errorText} role="alert">
              Name is required.
            </span>
          ) : null}
        </section>

        <section className={styles.fieldSection}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel} htmlFor={alignmentInputId}>
              Character alignment
            </label>
            {isEditingAlignment ? (
              <button type="button" className={shared.editButton} onClick={cancelAlignmentEdit}>
                <X size={16} aria-hidden="true" />
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className={shared.editButton}
                onClick={startEditingAlignment}
              >
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>
            )}
          </div>
          {isEditingAlignment ? (
            <SelectInput
              ref={alignmentInputRef}
              id={alignmentInputId}
              value={draftAlignment}
              onChange={(event) => setDraftAlignment(event.target.value as Character["alignment"])}
            >
              {alignmentOptions.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {alignment}
                </option>
              ))}
            </SelectInput>
          ) : (
            <TextInput
              id={alignmentInputId}
              className={styles.readOnlyControl}
              value={draftAlignment}
              readOnly
            />
          )}
        </section>

        <section className={styles.fieldSection}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel} htmlFor={notesInputId}>
              Character notes
            </label>
            {isEditingNotes ? (
              <button type="button" className={shared.editButton} onClick={cancelNotesEdit}>
                <X size={16} aria-hidden="true" />
                Cancel
              </button>
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
            placeholder="No character notes yet."
            readOnly={!isEditingNotes}
            onChange={(event) => setDraftNotes(event.target.value)}
          />
        </section>
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.footerActions}>
          <ActionButton
            fullWidth={false}
            icon={<Save size={16} aria-hidden="true" />}
            onClick={saveChanges}
            disabled={!hasDirtyState || isNameInvalid}
          >
            Save changes
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetDrawer>
  );
}

export default CharacterNotesDrawer;
