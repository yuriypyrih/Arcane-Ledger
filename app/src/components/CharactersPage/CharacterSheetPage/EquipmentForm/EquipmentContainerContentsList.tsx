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
import {
  getInventoryItemChargesTagLabel,
  getInventoryItemStoredSpellRowTagLabel
} from "./equipmentItemUtilityTags";
import InventoryTagPill from "./InventoryTagPill";
import { getInventoryTagPillProps } from "./inventoryTagPillModel";
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
    chargesTotal: content.chargesTotal,
    storedSpell: content.storedSpell,
    featureTags: content.featureTags,
    spellcastingFocusSources: content.spellcastingFocusSources,
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
            const chargesTagLabel = getInventoryItemChargesTagLabel(stack);
            const storedSpellRowTagLabel = getInventoryItemStoredSpellRowTagLabel(stack);
            const objectTagLabel = isExtractableEquipmentPackRecord(item) ? "Pack" : null;
            const featureTagLabels = getInventoryItemFeatureTagLabels(stack, {
              excludeConjured: true
            });
            const spellcastingFocusTagLabels = featureTagLabels.filter(
              (tagLabel) => tagLabel.startsWith("Spellcasting Focus")
            );
            const otherFeatureTagLabels = featureTagLabels.filter(
              (tagLabel) => !tagLabel.startsWith("Spellcasting Focus")
            );

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
                  <span className={styles.equipmentItemName}>
                    {formatContentName(content, item.name ?? "Item")}
                  </span>
                  <span className={styles.equipmentItemTagRow}>
                    <span className={styles.equipmentItemTagsLeft}>
                      {objectTagLabel ? (
                        <InventoryTagPill type="pack" />
                      ) : null}
                      {chargesTagLabel ? (
                        <InventoryTagPill type="charges" label={chargesTagLabel} />
                      ) : null}
                      {stack.attuned ? (
                        <InventoryTagPill type="attuned" />
                      ) : null}
                      {spellcastingFocusTagLabels.map((tagLabel) => (
                        <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
                      ))}
                      {otherFeatureTagLabels.map((tagLabel) => (
                        <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
                      ))}
                    </span>
                    <span className={styles.equipmentItemTagsRight}>
                      {storedSpellRowTagLabel ? (
                        <InventoryTagPill type="spell" />
                      ) : null}
                      {conjuredRowTagLabel ? (
                        <InventoryTagPill {...getInventoryTagPillProps(conjuredRowTagLabel)} />
                      ) : null}
                      {hasCharacterItemMods(stack.mods) && !stack.mods?.isCustom ? (
                        <InventoryTagPill type="modded" />
                      ) : null}
                      {hasDisplayableRarity(item.rarity) ? <RarityPill rarity={item.rarity} /> : null}
                      <span className={styles.equipmentItemWeight}>
                        {formatEquipmentWeight(getContainerContentsWeightValue([content]))}
                      </span>
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
