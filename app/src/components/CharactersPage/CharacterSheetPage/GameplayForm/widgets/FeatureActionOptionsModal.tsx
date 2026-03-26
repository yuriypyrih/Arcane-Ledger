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
};

function FeatureActionOptionsModal({
  action,
  onClose,
  children
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
            <p className={sheetStyles.eyebrow}>Cleric</p>
            <h3 id="feature-action-modal-title">{action.name}</h3>
            <p className={shared.helperText}>
              Choose which divine effect to channel. {action.usesLabel ?? ""}
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
      </section>
    </div>
  );
}

export default FeatureActionOptionsModal;
