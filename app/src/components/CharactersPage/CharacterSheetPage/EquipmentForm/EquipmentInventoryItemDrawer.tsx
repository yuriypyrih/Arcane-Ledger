import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import ItemInspectionContent, { ItemInspectionHeader } from "../../../ItemInspection";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type { SpellDescriptionEntry } from "../../../../codex/entries";
import type { CharacterCustomTraitEffect, CodexStatus, ItemRecord } from "../../../../types";
import CustomTraitEffectList from "../GameplayForm/widgets/TraitsConditionsWidget/CustomTraitEffectList";
import styles from "./EquipmentInventoryItemDrawer.module.css";

type EquipmentInventoryItemDrawerProps = {
  item: ItemRecord | null;
  status: CodexStatus;
  onClose: () => void;
  footer?: ReactNode;
  headerContent?: ReactNode;
  headerAction?: ReactNode;
  additionalDescription?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  modEffects?: CharacterCustomTraitEffect[];
  costSuffix?: ReactNode;
  weaponMasteryActive?: boolean;
  weaponProficient?: boolean;
  onOpenWeaponReference?: (title: string, keywords: string[]) => void;
};

function EquipmentInventoryItemDrawer({
  item,
  status,
  onClose,
  footer,
  headerContent,
  headerAction,
  additionalDescription,
  descriptionAdditions,
  modEffects = [],
  costSuffix,
  weaponMasteryActive = false,
  weaponProficient = false,
  onOpenWeaponReference
}: EquipmentInventoryItemDrawerProps) {
  const resolvedHeaderContent =
    headerContent ??
    (status === "ready" && item ? (
      <ItemInspectionHeader item={item} titleId="equipment-item-drawer-title" headingLevel="h3" />
    ) : null);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
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
        <div className={sheetStyles.spellDrawerHeader}>
          {resolvedHeaderContent ?? (
            <div className={sheetStyles.spellDrawerHeaderContent}>
              <p className={sheetStyles.spellDrawerBadge}>Item Inspection</p>
              <div className={sheetStyles.spellDrawerTitleRow}>
                <h3 id="equipment-item-drawer-title" className={sheetStyles.spellDrawerTitle}>
                  Item details
                </h3>
              </div>
            </div>
          )}
          <div className={styles.headerActions}>
            {headerAction}
            <button
              type="button"
              className={sheetStyles.spellDrawerCloseButton}
              onClick={onClose}
              aria-label="Close item inspection"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={sheetStyles.spellDrawerBody}>
          {status === "loading" ? (
            <div className={styles.statusCard}>
              <strong>Loading item...</strong>
              <span>Fetching item details from the configured backend.</span>
            </div>
          ) : null}

          {status === "error" ? (
            <div className={styles.statusCard}>
              <strong>Item unavailable</strong>
              <span>The selected item could not be loaded.</span>
            </div>
          ) : null}

          {status === "server-unavailable" ? (
            <div className={styles.statusCard}>
              <strong>Server Unavailable</strong>
              <span>Item details are unavailable because the backend is not configured or cannot be reached.</span>
            </div>
          ) : null}

          {status === "ready" && !item ? (
            <div className={styles.statusCard}>
              <strong>Item not found</strong>
              <span>The selected item could not be found.</span>
            </div>
          ) : null}

          {status === "ready" && item ? (
            <>
              <ItemInspectionContent
                item={item}
                showHeader={false}
                additionalDescription={additionalDescription}
                descriptionAdditions={descriptionAdditions}
                costSuffix={costSuffix}
                weaponMasteryActive={weaponMasteryActive}
                weaponProficient={weaponProficient}
                onOpenWeaponReference={onOpenWeaponReference}
              />
              <CustomTraitEffectList effects={modEffects} />
            </>
          ) : null}
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </section>
    </div>,
    document.body
  );
}

export default EquipmentInventoryItemDrawer;
