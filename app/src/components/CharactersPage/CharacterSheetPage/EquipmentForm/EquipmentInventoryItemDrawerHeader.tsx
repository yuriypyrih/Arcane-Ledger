import RarityPill, { hasDisplayableRarity } from "../../../CodexPage/RarityPill";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { buildItemDetailPresentation } from "../../../../pages/ItemCodexEntryPage/itemPresentation";
import type { ItemRecord } from "../../../../types";
import InventoryTagPill from "./InventoryTagPill";
import { getInventoryTagPillProps } from "./inventoryTagPillModel";
import styles from "./EquipmentForm.module.css";

type EquipmentInventoryItemDrawerHeaderProps = {
  item: ItemRecord;
  titleId?: string;
  onHandCount?: number;
  worn?: boolean;
  attuned?: boolean;
  chargesLabel?: string | null;
  spellTag?: string | null;
  featureTags?: string[];
  modded?: boolean;
};

function getOnHandLabel(onHandCount: number) {
  return onHandCount > 1 ? `On Hand x${onHandCount}` : "On Hand";
}

function EquipmentInventoryItemDrawerHeader({
  item,
  titleId = "equipment-item-drawer-title",
  onHandCount = 0,
  worn = false,
  attuned = false,
  chargesLabel = null,
  spellTag = null,
  featureTags = [],
  modded = false
}: EquipmentInventoryItemDrawerHeaderProps) {
  const presentation = buildItemDetailPresentation(item);

  return (
    <div className={sheetStyles.spellDrawerHeaderContent}>
      <p className={sheetStyles.spellDrawerBadge}>Item Inspection</p>
      <div className={sheetStyles.spellDrawerTitleRow}>
        <h3 id={titleId} className={sheetStyles.spellDrawerTitle}>
          {presentation.name}
        </h3>
        {onHandCount > 0 ? (
          <InventoryTagPill type="onHand" label={getOnHandLabel(onHandCount)} />
        ) : null}
        {worn ? <InventoryTagPill type="worn" /> : null}
        {attuned ? <InventoryTagPill type="attuned" /> : null}
        {chargesLabel ? (
          <InventoryTagPill type="charges" label={chargesLabel} />
        ) : null}
        {spellTag ? (
          <InventoryTagPill {...getInventoryTagPillProps(spellTag)} />
        ) : null}
        {modded ? <InventoryTagPill type="modded" /> : null}
        {featureTags.map((tagLabel) => (
          <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
        ))}
      </div>
      <p className={`${sheetStyles.spellDrawerSummary} ${styles.drawerSummaryRow}`}>
        <span>{presentation.categoryLabel}</span>
        <span className={styles.drawerSummarySeparator} aria-hidden="true">
          •
        </span>
        {hasDisplayableRarity(item.rarity) ? (
          <span className={styles.drawerSummaryRarity}>
            <RarityPill rarity={item.rarity} />
          </span>
        ) : (
          <span>{presentation.rarityLabel}</span>
        )}
        <span className={styles.drawerSummarySeparator} aria-hidden="true">
          •
        </span>
        <span>{presentation.sourceLabel}</span>
      </p>
    </div>
  );
}

export default EquipmentInventoryItemDrawerHeader;
