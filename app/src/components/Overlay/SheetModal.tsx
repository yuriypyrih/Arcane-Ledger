import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle } from "lucide-react";
import styles from "./Overlay.module.css";
import { useDismissableOverlay } from "./useDismissableOverlay";

export type SheetModalSize = "small" | "medium" | "large";

const modalSizeClassNames: Record<SheetModalSize, string> = {
  small: styles.modalPanelSmall,
  medium: styles.modalPanelMedium,
  large: styles.modalPanelLarge
};

type SheetModalProps = {
  titleId: string;
  onClose: () => void;
  onEscape?: () => void;
  children: ReactNode;
  backdropClassName?: string;
  busyLabel?: string;
  isBusy?: boolean;
  panelClassName?: string;
  size?: SheetModalSize;
};

function SheetModal({
  titleId,
  onClose,
  onEscape,
  children,
  backdropClassName,
  busyLabel = "Saving changes",
  isBusy = false,
  panelClassName,
  size = "small"
}: SheetModalProps) {
  const { onBackdropClick, onContentClick } = useDismissableOverlay({
    isOpen: true,
    onClose: isBusy ? () => undefined : onClose,
    onEscape: isBusy ? () => undefined : onEscape
  });

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={[styles.modalBackdrop, backdropClassName ?? ""].join(" ").trim()}
      role="presentation"
      onClick={onBackdropClick}
    >
      <section
        className={[
          styles.modalPanel,
          modalSizeClassNames[size],
          isBusy ? styles.modalPanelBusy : "",
          panelClassName ?? ""
        ]
          .join(" ")
          .trim()}
        role="dialog"
        aria-modal="true"
        aria-busy={isBusy}
        aria-labelledby={titleId}
        onClick={onContentClick}
      >
        {children}
        {isBusy ? (
          <div className={styles.busyScrim} role="status" aria-live="polite">
            <div className={styles.busyIndicator}>
              <LoaderCircle size={34} className={styles.busySpinner} aria-hidden="true" />
              <span>{busyLabel}</span>
            </div>
          </div>
        ) : null}
      </section>
    </div>,
    document.body
  );
}

export default SheetModal;
