import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Overlay.module.css";
import { useDismissableOverlay } from "./useDismissableOverlay";

type SheetModalProps = {
  titleId: string;
  onClose: () => void;
  onEscape?: () => void;
  children: ReactNode;
  backdropClassName?: string;
  panelClassName?: string;
};

function SheetModal({
  titleId,
  onClose,
  onEscape,
  children,
  backdropClassName,
  panelClassName
}: SheetModalProps) {
  const { onBackdropClick, onContentClick } = useDismissableOverlay({
    isOpen: true,
    onClose,
    onEscape
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
        className={[styles.modalPanel, panelClassName ?? ""].join(" ").trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={onContentClick}
      >
        {children}
      </section>
    </div>,
    document.body
  );
}

export default SheetModal;
