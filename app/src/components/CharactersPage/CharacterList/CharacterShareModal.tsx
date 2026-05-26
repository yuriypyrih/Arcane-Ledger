import { Check, Copy, Link } from "lucide-react";
import { useId, useState } from "react";
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
import type { CharacterRosterEntry } from "../../../pages/CharactersPage/characterRoster";
import styles from "./CharacterShareImportModal.module.css";

type CharacterShareModalProps = {
  character: CharacterRosterEntry;
  onClose: () => void;
  onGenerateLink: (character: CharacterRosterEntry) => Promise<string>;
};

async function copyTextToClipboard(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  const textArea = document.createElement("textarea");

  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to generate a share link.";
}

function CharacterShareModal({ character, onClose, onGenerateLink }: CharacterShareModalProps) {
  const titleId = useId();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [didCopy, setDidCopy] = useState(false);

  async function handleGenerateLink() {
    if (link) {
      return;
    }

    setError(null);
    setDidCopy(false);
    setIsGenerating(true);

    try {
      setLink(await onGenerateLink(character));
    } catch (generateError) {
      setError(getErrorMessage(generateError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyLink() {
    if (!link) {
      return;
    }

    try {
      await copyTextToClipboard(link);
      setDidCopy(true);
    } catch {
      setError("Unable to copy the link.");
    }
  }

  return (
    <SheetModal titleId={titleId} onClose={onClose} isBusy={isGenerating} busyLabel="Generating link">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Share character</OverlayTitle>
          <OverlaySummary>{character.name}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close share character modal" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody>
        <p className={styles.copy}>
          Sharing creates a 24-hour snapshot of this character. Anyone with the link can import a
          separate copy into their own roster.
        </p>
        {link ? (
          <div className={styles.linkResult}>
            <span className={styles.fieldLabel}>Share link</span>
            <div className={styles.linkRow}>
              <span className={styles.linkValue}>{link}</span>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Copy share link"
                title="Copy share link"
                onClick={handleCopyLink}
              >
                {didCopy ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
        ) : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.footerActions}>
          <ActionButton
            icon={<Link size={16} aria-hidden="true" />}
            disabled={Boolean(link)}
            loading={isGenerating}
            loadingLabel="Generating share link"
            onClick={handleGenerateLink}
          >
            Generate Link
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default CharacterShareModal;
