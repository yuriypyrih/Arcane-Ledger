import type { ReactNode } from "react";
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
  const { onBackdropClick, onContentClick } = useDismissableOverlay({
    isOpen: true,
    onClose,
    onEscape
  });

  return (
    <div
      className={[styles.drawerBackdrop, backdropClassName ?? ""].join(" ").trim()}
      role="presentation"
      onClick={onBackdropClick}
    >
      <section
        className={[styles.drawerPanel, drawerClassName ?? ""].join(" ").trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={onContentClick}
      >
        <div className={styles.drawerHandle} aria-hidden="true" />
        {children}
      </section>
    </div>
  );
}

export default SheetDrawer;
