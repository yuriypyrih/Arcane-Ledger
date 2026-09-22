import type { ReactNode, Ref } from "react";
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
  panelRef?: Ref<HTMLElement>;
  titleId: string;
  onClose: () => void;
  onEscape?: () => void;
  children: ReactNode;
  backdropClassName?: string;
  busyLabel?: string;
  isBusy?: boolean;
  panelClassName?: string;
  readOnlyReference?: boolean;
  size?: SheetModalSize;
};

function SheetModal({
  panelRef,
  titleId,
  onClose,
  onEscape,
  children,
  backdropClassName,
  busyLabel = "Saving changes",
  isBusy = false,
  panelClassName,
  readOnlyReference = false,
  size = "small"
}: SheetModalProps) {
  const { onBackdropClick, onBackdropPointerDown, onContentClick } = useDismissableOverlay({
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
      data-read-only-reference={readOnlyReference ? "true" : undefined}
      style={readOnlyReference ? { zIndex: 60 } : undefined}
      onClick={onBackdropClick}
      onPointerDown={onBackdropPointerDown}
    >
      <section
        ref={panelRef}
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
