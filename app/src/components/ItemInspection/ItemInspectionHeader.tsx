import { createElement } from "react";
import RarityPill, { hasDisplayableRarity } from "../CodexPage/RarityPill";
import { buildItemDetailPresentation } from "../../pages/ItemCodexEntryPage/itemPresentation";
import type { ItemRecord } from "../../types";
import styles from "./ItemInspectionContent.module.css";

type ItemInspectionHeaderProps = {
  item: ItemRecord;
  className?: string;
  titleId?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4";
};

function ItemInspectionHeader({
  item,
  className,
  titleId,
  headingLevel = "h1"
}: ItemInspectionHeaderProps) {
  const presentation = buildItemDetailPresentation(item);

  return (
    <header className={[styles.header, className ?? ""].join(" ").trim()}>
      {createElement(
        headingLevel,
        {
          id: titleId,
          className: styles.title
        },
        presentation.name
      )}
      <p className={styles.subtitle}>
        <span>{presentation.categoryLabel}</span>
        <span className={styles.subtitleSeparator} aria-hidden="true">
          •
        </span>
        {hasDisplayableRarity(item.rarity) ? (
          <RarityPill rarity={item.rarity} />
        ) : (
          <span>{presentation.rarityLabel}</span>
        )}
        <span className={styles.subtitleSeparator} aria-hidden="true">
          •
        </span>
        <span>{presentation.sourceLabel}</span>
      </p>
    </header>
  );
}

export default ItemInspectionHeader;
