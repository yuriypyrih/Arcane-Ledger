import { useRef, type ReactNode } from "react";
import { useReadOnlySheet } from "../CharactersPage/CharacterSheetPage/readOnlySheetContext";
import { isTopInspectionDialog, useInspectionFocus } from "../CharactersPage/CharacterInspection/useInspectionFocus";
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
  stacked?: boolean;
};

function SheetDrawer({
  titleId,
  onClose,
  onEscape,
  children,
  backdropClassName,
  drawerClassName,
  stacked = false
}: SheetDrawerProps) {
  const readOnly = useReadOnlySheet();
  const panelRef = useRef<HTMLElement>(null);
  useInspectionFocus(panelRef, readOnly, readOnly);
  const { onBackdropClick, onBackdropPointerDown, onContentClick } = useDismissableOverlay({
    isOpen: true,
    onClose,
    onEscape: readOnly ? () => {
      if (isTopInspectionDialog(panelRef.current)) (onEscape ?? onClose)();
    } : onEscape
  });

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={[
        styles.drawerBackdrop,
        stacked ? styles.drawerBackdropStacked : "",
        backdropClassName ?? ""
      ]
        .join(" ")
        .trim()}
      role="presentation"
      data-read-only-reference={readOnly ? "true" : undefined}
      style={readOnly ? { zIndex: 60 } : undefined}
      onClick={onBackdropClick}
      onPointerDown={onBackdropPointerDown}
    >
      <section
        ref={panelRef}
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
