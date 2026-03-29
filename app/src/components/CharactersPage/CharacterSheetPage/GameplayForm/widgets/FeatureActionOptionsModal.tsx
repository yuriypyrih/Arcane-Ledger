import clsx from "clsx";
import type { ReactNode } from "react";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
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
};

function FeatureActionOptionsModal({
  action,
  onClose,
  children,
  eyebrow = "Cleric",
  helperText = `Choose which divine effect to channel. ${action.usesLabel ?? ""}`.trim(),
  helperTextTone = "default",
  footer
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
            <h3 id="feature-action-modal-title">{action.name}</h3>
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

      <div className={styles.featureActionOptionGrid}>{children}</div>
      {footer ? <div className={styles.featureActionModalFooter}>{footer}</div> : null}
    </SheetModal>
  );
}

export default FeatureActionOptionsModal;
