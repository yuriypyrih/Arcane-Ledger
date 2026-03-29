import clsx from "clsx";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./ActionsWidget.module.css";

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
    <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
      <section
        className={clsx(sheetStyles.spellManagementModal, styles.featureActionModal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-action-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={styles.modalHeading}>
            <p className={sheetStyles.eyebrow}>{eyebrow}</p>
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
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close feature action options"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.featureActionOptionGrid}>{children}</div>
        {footer ? <div className={styles.featureActionModalFooter}>{footer}</div> : null}
      </section>
    </div>
  );
}

export default FeatureActionOptionsModal;
