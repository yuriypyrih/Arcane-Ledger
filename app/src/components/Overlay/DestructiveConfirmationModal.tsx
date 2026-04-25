import type { ReactNode } from "react";
import ActionButton from "../ActionButton";
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
          <ActionButton variant="GHOST" onClick={onCancel}>
            {cancelLabel}
          </ActionButton>
          <ActionButton actionType="ERROR" onClick={onConfirm}>
            {confirmLabel}
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default DestructiveConfirmationModal;
