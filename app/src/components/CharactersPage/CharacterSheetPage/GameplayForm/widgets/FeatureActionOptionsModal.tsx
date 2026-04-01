import clsx from "clsx";
import type { ReactNode } from "react";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import {
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  SheetModal
} from "../../../../Overlay";
import styles from "./FeatureActionModal.module.css";

type FeatureActionOptionsModalProps = {
  action: FeatureActionCard;
  onClose: () => void;
  children: ReactNode;
  eyebrow?: string;
  helperText?: string;
  helperTextTone?: "default" | "accent";
  footer?: ReactNode;
  bodyClassName?: string;
};

function FeatureActionOptionsModal({
  action,
  onClose,
  children,
  eyebrow = "Cleric",
  helperText = `Choose which divine effect to channel. ${action.usesLabel ?? ""}`.trim(),
  helperTextTone = "default",
  footer,
  bodyClassName
}: FeatureActionOptionsModalProps) {
  return (
    <SheetModal
      titleId="feature-action-modal-title"
      onClose={onClose}
      panelClassName={styles.featureActionModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <div className={styles.modalHeading}>
            <OverlayEyebrow>{eyebrow}</OverlayEyebrow>
            <h3 id="feature-action-modal-title" className={sheetStyles.sheetPanelTitle}>
              {action.name}
            </h3>
            <p
              className={clsx(
                shared.helperText,
                helperTextTone === "accent" && styles.featureActionHelperTextAccent
              )}
            >
              {helperText}
            </p>
          </div>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close feature action options" onClick={onClose} />
      </OverlayHeader>

      <div className={clsx(styles.featureActionOptionGrid, bodyClassName)}>{children}</div>
      {footer ? <div className={styles.featureActionModalFooter}>{footer}</div> : null}
    </SheetModal>
  );
}

export default FeatureActionOptionsModal;
