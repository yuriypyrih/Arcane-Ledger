import type { ReactNode } from "react";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle
} from "./OverlayLayout";
import SheetModal from "./SheetModal";
import styles from "./DestructiveConfirmationModal.module.css";

type DestructiveConfirmationModalProps = {
  titleId: string;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  closeLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function DestructiveConfirmationModal({
  titleId,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  closeLabel,
  onCancel,
  onConfirm
}: DestructiveConfirmationModalProps) {
  return (
    <SheetModal titleId={titleId} onClose={onCancel}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>{title}</OverlayTitle>
          <OverlaySummary>This action cannot be undone.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label={closeLabel} onClick={onCancel} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <p className={styles.message}>{message}</p>
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.footerActions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={styles.confirmButton} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default DestructiveConfirmationModal;
