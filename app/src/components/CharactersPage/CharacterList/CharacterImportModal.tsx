import { Upload } from "lucide-react";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { DEFAULT_TEXT_INPUT_MAX_LENGTH } from "../../../constants/inputLimits";
import ActionButton from "../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle
} from "../../Overlay";
import SheetModal from "../../Overlay/SheetModal";
import styles from "./CharacterShareImportModal.module.css";

type CharacterImportModalProps = {
  onClose: () => void;
  onImportLink: (link: string) => Promise<void>;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to import character.";
}

function CharacterImportModal({ onClose, onImportLink }: CharacterImportModalProps) {
  const titleId = useId();
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const normalizedLink = link.trim().toUpperCase();
  const canSubmit = normalizedLink.length > 0 && !isImporting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setError(null);
    setIsImporting(true);

    try {
      await onImportLink(normalizedLink);
    } catch (importError) {
      setError(getErrorMessage(importError));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <SheetModal titleId={titleId} onClose={onClose} isBusy={isImporting} busyLabel="Importing character">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Import character</OverlayTitle>
          <OverlaySummary>Add a shared character snapshot to this roster.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close import character modal" onClick={onClose} />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Share link</span>
            <input
              className={styles.linkInput}
              value={link}
              maxLength={DEFAULT_TEXT_INPUT_MAX_LENGTH}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                setLink(event.target.value.toUpperCase());
                setError(null);
              }}
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.footerActions}>
            <ActionButton
              type="submit"
              icon={<Upload size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isImporting}
              loadingLabel="Importing character"
            >
              Import Character
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default CharacterImportModal;
