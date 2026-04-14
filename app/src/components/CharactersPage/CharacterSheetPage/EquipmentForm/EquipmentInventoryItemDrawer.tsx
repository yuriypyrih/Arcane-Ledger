import { X } from "lucide-react";
import type { ReactNode } from "react";
import ItemInspectionContent from "../../../ItemInspection";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type { CodexStatus, ItemRecord } from "../../../../types";
import styles from "./EquipmentInventoryItemDrawer.module.css";

type EquipmentInventoryItemDrawerProps = {
  item: ItemRecord | null;
  status: CodexStatus;
  onClose: () => void;
  footer?: ReactNode;
};

function EquipmentInventoryItemDrawer({
  item,
  status,
  onClose,
  footer
}: EquipmentInventoryItemDrawerProps) {
  return (
    <div
      className={`${sheetStyles.spellDrawerBackdrop} ${styles.backdrop}`}
      role="presentation"
      onClick={onClose}
    >
      <section
        className={`${sheetStyles.spellDrawer} ${styles.drawer}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-item-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
        <div className={sheetStyles.spellDrawerHeader}>
          <div className={sheetStyles.spellDrawerHeaderContent}>
            <p className={sheetStyles.spellDrawerBadge}>Item Inspection</p>
            <div className={sheetStyles.spellDrawerTitleRow}>
              <h3 id="equipment-item-drawer-title" className={sheetStyles.spellDrawerTitle}>
                Item details
              </h3>
            </div>
          </div>
          <button
            type="button"
            className={sheetStyles.spellDrawerCloseButton}
            onClick={onClose}
            aria-label="Close item inspection"
          >
            <X size={18} />
          </button>
        </div>

        <div className={sheetStyles.spellDrawerBody}>
          {status === "loading" ? (
            <div className={styles.statusCard}>
              <strong>Loading item...</strong>
              <span>Fetching item details from the backend.</span>
            </div>
          ) : null}

          {status === "error" ? (
            <div className={styles.statusCard}>
              <strong>Item unavailable</strong>
              <span>The selected item could not be loaded.</span>
            </div>
          ) : null}

          {status === "ready" && !item ? (
            <div className={styles.statusCard}>
              <strong>Item not found</strong>
              <span>The selected item could not be found.</span>
            </div>
          ) : null}

          {status === "ready" && item ? <ItemInspectionContent item={item} /> : null}
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </section>
    </div>
  );
}

export default EquipmentInventoryItemDrawer;
