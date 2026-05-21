import { Package, Sparkles } from "lucide-react";
import RarityPill, { hasDisplayableRarity } from "../../../CodexPage/RarityPill";
import type { CharacterContainerContentItem } from "../../../../types";
import {
  createCharacterInventoryItem,
  getContainerContentsWeightValue,
  getInventoryItemConjuredRowTagLabel,
  getInventoryItemFeatureTagLabels,
  isExtractableEquipmentPackRecord
} from "../../../../pages/CharactersPage/inventoryItems";
import {
  getEffectiveInventoryItemRecord,
  hasCharacterItemMods
} from "../../../../pages/CharactersPage/itemMods";
import { formatEquipmentWeight } from "../../../../utils/codex";
import SheetSurface from "../SheetSurface";
import styles from "./EquipmentForm.module.css";

type EquipmentContainerContentsListProps = {
  contents: CharacterContainerContentItem[];
  containerStackId: string;
  contentsWeightLimit?: number | null;
  onSelectContent: (contentIndex: number) => void;
};

function getContentRowItem(
  containerStackId: string,
  content: CharacterContainerContentItem,
  index: number
) {
  const stack = createCharacterInventoryItem(content.item, {
    id: `${containerStackId}:content:${index}`,
    quantity: content.quantity,
    attuned: content.attuned,
    usesRemaining: content.usesRemaining,
    featureTags: content.featureTags,
    conjuredSource: content.conjuredSource,
    conjuredDuration: content.conjuredDuration,
    mods: content.mods
  });

  return {
    item: getEffectiveInventoryItemRecord(stack),
    stack
  };
}

function formatContentName(content: CharacterContainerContentItem, name: string): string {
  return content.quantity > 1 ? `${content.quantity}x ${name}` : name;
}

function formatContentWeightProgress(weight: number, weightLimit: number): string {
  return `${Math.round(weight * 100) / 100}/${formatEquipmentWeight(weightLimit)}`;
}

function EquipmentContainerContentsList({
  contents,
  containerStackId,
  contentsWeightLimit = null,
  onSelectContent
}: EquipmentContainerContentsListProps) {
  const contentsWeight = getContainerContentsWeightValue(contents);
  const contentsWeightLabel =
    contentsWeightLimit !== null
      ? formatContentWeightProgress(contentsWeight, contentsWeightLimit)
      : formatEquipmentWeight(contentsWeight);

  return (
    <section className={styles.containerContentsSection}>
      <header className={styles.containerContentsHeader}>
        <h4>{`Contents (${contentsWeightLabel})`}</h4>
      </header>
      {contents.length === 0 ? null : (
        <ul className={styles.equipmentItemList}>
          {contents.map((content, index) => {
            const { item, stack } = getContentRowItem(containerStackId, content, index);
            const conjuredRowTagLabel = getInventoryItemConjuredRowTagLabel(stack);
            const objectTagLabel = isExtractableEquipmentPackRecord(item) ? "Pack" : null;

            return (
              <li key={`${item.key ?? item.name ?? "item"}-${index}`}>
                <SheetSurface
                  as="button"
                  type="button"
                  borderSize="sm"
                  hoverBorder
                  className={styles.equipmentItemButton}
                  onClick={() => onSelectContent(index)}
                >
                  <span className={styles.equipmentItemLabel}>
                    <span className={styles.equipmentItemName}>
                      {formatContentName(content, item.name ?? "Item")}
                    </span>
                    {objectTagLabel ? (
                      <span className={styles.equipmentItemObjectTag}>
                        <Package size={13} aria-hidden="true" />
                        <span>{objectTagLabel}</span>
                      </span>
                    ) : null}
                    {stack.attuned ? (
                      <span className={styles.equipmentItemAttuned}>
                        <Sparkles size={13} aria-hidden="true" />
                        <span>Attuned</span>
                      </span>
                    ) : null}
                    {getInventoryItemFeatureTagLabels(stack, {
                      excludeConjured: true
                    }).map((tagLabel) => (
                      <span key={tagLabel} className={styles.equipmentItemFeatureTag}>
                        {tagLabel}
                      </span>
                    ))}
                  </span>
                  <span className={styles.equipmentItemMeta}>
                    {hasCharacterItemMods(stack.mods) && !stack.mods?.isCustom ? (
                      <span className={styles.equipmentItemModdedTag}>
                        <span>Modded</span>
                      </span>
                    ) : null}
                    {conjuredRowTagLabel ? (
                      <span className={styles.equipmentItemFeatureTag}>{conjuredRowTagLabel}</span>
                    ) : null}
                    {hasDisplayableRarity(item.rarity) ? <RarityPill rarity={item.rarity} /> : null}
                    <span className={styles.equipmentItemWeight}>
                      {formatEquipmentWeight(getContainerContentsWeightValue([content]))}
                    </span>
                  </span>
                </SheetSurface>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default EquipmentContainerContentsList;
