import { Hand, Shield, Sparkles } from "lucide-react";
import {
  CONTAINER_OBJECT_LIMIT,
  INVENTORY_OBJECT_LIMIT
} from "../../../../pages/CharactersPage/inventoryItems";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../Overlay";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./EquipmentGuideModal.module.css";

type EquipmentGuideModalProps = {
  inventoryObjectCount: number;
  onClose: () => void;
};

function EquipmentGuideModal({ inventoryObjectCount, onClose }: EquipmentGuideModalProps) {
  return (
    <SheetModal titleId="equipment-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Equipment</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="equipment-guide-modal-title">Equipment Guide</OverlayTitle>
            <span className={styles.headerPill}>
              {`${inventoryObjectCount} /${INVENTORY_OBJECT_LIMIT} MAX`}
            </span>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            Equipment tracks what your character carries, buys, sells, stores, and actively uses.
            The whole character sheet can hold up to {INVENTORY_OBJECT_LIMIT} unique inventory rows,
            including items inside containers; each container can hold up to{" "}
            {CONTAINER_OBJECT_LIMIT} unique rows.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close equipment guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <p className={styles.sectionText}>
            Your loadout is the part of inventory the app treats as active. Held weapons become
            available in Gameplay, worn armor changes armor class, and held shields count toward
            defense. Gear kept in a container is carried, but it is not active until moved back to
            root inventory.
          </p>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Item Effects</h4>
          <p className={styles.sectionText}>
            Descriptions are reference text. The app applies only effects explicitly added through
            item mods. Modified items are always separate rows and can only be sold or removed, not
            added as extra copies.
          </p>
          <div className={styles.effectRuleList}>
            <div className={styles.effectRuleRow}>
              <span>The item must be in root inventory, not inside a container.</span>
            </div>
            <div className={styles.effectRuleRow}>
              <span>Weapons and shields apply their effects only while held.</span>
              <span className={`${styles.rulePill} ${styles.rulePillInHand}`}>
                <Hand size={13} aria-hidden="true" />
                In hand
              </span>
            </div>
            <div className={styles.effectRuleRow}>
              <span>Armor applies its effects only while worn.</span>
              <span className={`${styles.rulePill} ${styles.rulePillWorn}`}>
                <Shield size={13} aria-hidden="true" />
                Worn
              </span>
            </div>
            <div className={styles.effectRuleRow}>
              <span>Attunable items apply their effects only after attunement.</span>
              <span className={`${styles.rulePill} ${styles.rulePillAttuned}`}>
                <Sparkles size={13} aria-hidden="true" />
                Attuned
              </span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Conjured Items</h4>
          <p className={styles.sectionText}>
            <span className={`${styles.inlinePill} ${styles.rulePillConjured}`}>
              <Sparkles size={13} aria-hidden="true" />
              Conjured
            </span>{" "}
            items cannot be sold and vanish on death by default. Some conjured gear may also expire
            on a rest if the feature that created it says so.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default EquipmentGuideModal;
