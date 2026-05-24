import { CloudDownload, CloudUpload, X } from "lucide-react";
import { useId } from "react";
import ActionButton from "../components/ActionButton";
import {
  OverlayBody,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../components/Overlay";
import type { PortableCharacterSheet } from "../types";
import styles from "./CharacterSyncConflictModal.module.css";

type CharacterSyncConflictModalProps = {
  error: string | null;
  isBusy: boolean;
  record: PortableCharacterSheet;
  onDismiss: () => void;
  onKeepCloud: () => void;
  onKeepLocal: () => void;
};

function CharacterSyncConflictModal({
  error,
  isBusy,
  record,
  onDismiss,
  onKeepCloud,
  onKeepLocal
}: CharacterSyncConflictModalProps) {
  const titleId = useId();

  return (
    <SheetModal
      titleId={titleId}
      onClose={onDismiss}
      isBusy={isBusy}
      busyLabel="Resolving conflict"
      panelClassName={styles.modalPanel}
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Cloud sync</OverlayEyebrow>
          <OverlayTitle id={titleId}>Character Conflict</OverlayTitle>
          <OverlaySummary>
            {record.summary.name} has local changes and a newer cloud revision.
          </OverlaySummary>
        </OverlayHeaderContent>
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <p className={styles.copy}>
          Choose which full sheet should win. Closing this keeps both versions untouched and the
          prompt can return on the next sync attempt.
        </p>
        {error ? <p className={styles.error}>{error}</p> : null}
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton
          icon={<CloudUpload size={16} aria-hidden="true" />}
          loading={isBusy}
          onClick={onKeepLocal}
        >
          Keep Local
        </ActionButton>
        <ActionButton
          actionType="SUCCESS"
          icon={<CloudDownload size={16} aria-hidden="true" />}
          loading={isBusy}
          onClick={onKeepCloud}
        >
          Keep Cloud
        </ActionButton>
        <ActionButton
          actionType="WARNING"
          variant="OUTLINE"
          icon={<X size={16} aria-hidden="true" />}
          disabled={isBusy}
          onClick={onDismiss}
        >
          Dismiss
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default CharacterSyncConflictModal;
