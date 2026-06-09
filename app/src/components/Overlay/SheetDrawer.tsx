import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Overlay.module.css";
import { useDismissableOverlay } from "./useDismissableOverlay";

type SheetDrawerProps = {
  titleId: string;
  onClose: () => void;
  onEscape?: () => void;
  children: ReactNode;
  backdropClassName?: string;
  drawerClassName?: string;
};

function SheetDrawer({
  titleId,
  onClose,
  onEscape,
  children,
  backdropClassName,
  drawerClassName
}: SheetDrawerProps) {
  const { onBackdropClick, onBackdropPointerDown, onContentClick } = useDismissableOverlay({
    isOpen: true,
    onClose,
    onEscape
  });

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={[styles.drawerBackdrop, backdropClassName ?? ""].join(" ").trim()}
      role="presentation"
      onClick={onBackdropClick}
      onPointerDown={onBackdropPointerDown}
    >
      <section
        className={[styles.drawerPanel, drawerClassName ?? ""].join(" ").trim()}
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

export default SheetDrawer;
