import {
  CONTAINER_OBJECT_LIMIT,
  INVENTORY_OBJECT_LIMIT
} from "../../../../pages/CharactersPage/inventoryItems";
import { formatCharacterSheetSize } from "../../../../pages/CharactersPage/characterSheetSize";
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
import InventoryTagPill from "./InventoryTagPill";
import styles from "./EquipmentGuideModal.module.css";

type EquipmentGuideModalProps = {
  inventoryObjectCount: number;
  sheetSizeBytes?: number;
  onClose: () => void;
};

function EquipmentGuideModal({
  inventoryObjectCount,
  sheetSizeBytes,
  onClose
}: EquipmentGuideModalProps) {
  const sheetSizeLabel = formatCharacterSheetSize(sheetSizeBytes);

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
            including items inside containers. Each container can hold up to{" "}
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
            Descriptions are just a reference text. The app applies only effects explicitly added
            through item mods. Modified items are always separate rows and can only be sold or
            removed, not added as extra copies.
          </p>
          <div className={styles.effectRuleList}>
            <div className={styles.effectRuleRow}>
              <span>
                For the effects to take place the item must be in root inventory, not inside a
                container.
              </span>
            </div>
            <div className={styles.effectRuleRow}>
              <span>Weapons and shields apply their effects only while held.</span>
              <InventoryTagPill type="onHand" label="In hand" />
            </div>
            <div className={styles.effectRuleRow}>
              <span>Armor applies its effects only while worn.</span>
              <InventoryTagPill type="worn" />
            </div>
            <div className={styles.effectRuleRow}>
              <span>Attunable items apply their effects only after attunement.</span>
              <InventoryTagPill type="attuned" />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Tags</h4>
          <p className={styles.sectionText}>
            <InventoryTagPill type="conjured" inline /> items cannot be sold and vanish on death by
            default. Their expanded item tag can show the source that created them and any explicit
            vanishing conditions.
          </p>
          <p className={styles.sectionText}>
            <InventoryTagPill type="spellcastingFocus" inline /> is available in item mods for
            marking an item as a spellcasting focus. This tag is mostly cosmetic (unless it has a
            specific source) but it helps you remember it during role-playing.
          </p>
        </section>

        {sheetSizeLabel ? (
          <p className={styles.storageNote}>Sheet object size: {sheetSizeLabel}</p>
        ) : null}
      </OverlayBody>
    </SheetModal>
  );
}

export default EquipmentGuideModal;
