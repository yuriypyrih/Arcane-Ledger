import { Hand, Shield, Sparkles } from "lucide-react";
import RarityPill, { hasDisplayableRarity } from "../../../CodexPage/RarityPill";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { buildItemDetailPresentation } from "../../../../pages/ItemCodexEntryPage/itemPresentation";
import type { ItemRecord } from "../../../../types";
import styles from "./EquipmentForm.module.css";

type EquipmentInventoryItemDrawerHeaderProps = {
  item: ItemRecord;
  titleId?: string;
  onHandCount?: number;
  worn?: boolean;
  attuned?: boolean;
  charges?: {
    remaining: number;
    total: number;
  } | null;
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
  charges = null,
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
          <span className={styles.drawerOnHandBadge}>
            <Hand size={13} aria-hidden="true" />
            <span>{getOnHandLabel(onHandCount)}</span>
          </span>
        ) : null}
        {worn ? (
          <span className={styles.drawerWornBadge}>
            <Shield size={13} aria-hidden="true" />
            <span>Worn</span>
          </span>
        ) : null}
        {attuned ? (
          <span className={styles.drawerAttunedBadge}>
            <Sparkles size={13} aria-hidden="true" />
            <span>Attuned</span>
          </span>
        ) : null}
        {charges ? (
          <span className={styles.drawerChargesBadge}>
            <span>{`Charges ${charges.remaining}/${charges.total}`}</span>
          </span>
        ) : null}
        {spellTag ? (
          <span className={styles.drawerSpellTagBadge}>
            <Sparkles size={13} aria-hidden="true" />
            <span>{spellTag}</span>
          </span>
        ) : null}
        {modded ? (
          <span className={styles.drawerModdedTag}>
            <span>Modded</span>
          </span>
        ) : null}
        {featureTags.map((tagLabel) => (
          <span key={tagLabel} className={styles.drawerFeatureTagBadge}>
            <span>{tagLabel}</span>
          </span>
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
