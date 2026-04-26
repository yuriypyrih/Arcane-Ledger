import CellContainer from "../CellContainer/CellContainer";
import DescriptionContent from "../DescriptionContent/DescriptionContent";
import { buildItemDetailPresentation } from "../../pages/ItemCodexEntryPage/itemPresentation";
import type { ItemRecord } from "../../types";
import ItemInspectionHeader from "./ItemInspectionHeader";
import WeaponMasteryStatusLabel from "../WeaponMasteryStatusLabel/WeaponMasteryStatusLabel";
import styles from "./ItemInspectionContent.module.css";

type ItemInspectionContentProps = {
  item: ItemRecord;
  className?: string;
  showHeader?: boolean;
  weaponMasteryActive?: boolean;
  weaponProficient?: boolean;
  onOpenWeaponReference?: (title: string, keywords: string[]) => void;
};

function normalizeWeaponReferenceLabels(labels: string[]) {
  return labels.map((label) => label.replace(/\s*\([^)]*\)\s*$/, "").trim()).filter(Boolean);
}

function ItemInspectionContent({
  item,
  className,
  showHeader = true,
  weaponMasteryActive = false,
  weaponProficient = false,
  onOpenWeaponReference
}: ItemInspectionContentProps) {
  const presentation = buildItemDetailPresentation(item);
  const weaponReferenceKeywords = {
    Properties: normalizeWeaponReferenceLabels(presentation.weapon?.propertyLabels ?? []),
    Mastery: normalizeWeaponReferenceLabels(presentation.weapon?.masteryLabels ?? [])
  };

  function getWeaponReferenceKeywords(label: string) {
    if (label !== "Properties" && label !== "Mastery") {
      return [];
    }

    return weaponReferenceKeywords[label];
  }

  return (
    <article className={className ?? styles.card}>
      {showHeader ? <ItemInspectionHeader item={item} /> : null}

      {presentation.description.length > 0 ? (
        <section className={styles.section}>
          <DescriptionContent
            description={presentation.description}
            className={styles.descriptionBlock}
            entryClassName={styles.descriptionParagraph}
          />
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.cellGrid}>
          {presentation.stapleCells.map((cell) => (
            <CellContainer
              key={cell.label}
              label={cell.label}
              content={cell.value}
              breakdown={cell.note ?? undefined}
            />
          ))}
        </div>
      </section>

      {presentation.weapon && presentation.weaponCells.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Weapon Details</h2>
          <div className={styles.cellGrid}>
            {presentation.weaponCells.map((cell) => {
              const referenceKeywords = getWeaponReferenceKeywords(cell.label);
              const label =
                weaponProficient && cell.label === "Type" ? (
                  <WeaponMasteryStatusLabel label="Type" status="PROFICIENT" />
                ) : weaponMasteryActive && cell.label === "Mastery" ? (
                  <WeaponMasteryStatusLabel />
                ) : (
                  cell.label
                );

              if (onOpenWeaponReference && referenceKeywords.length > 0) {
                return (
                  <CellContainer
                    key={cell.label}
                    as="button"
                    type="button"
                    className={styles.referenceCell}
                    label={label}
                    content={cell.value}
                    breakdown={cell.note ?? undefined}
                    onClick={() => onOpenWeaponReference(cell.label, referenceKeywords)}
                  />
                );
              }

              return (
                <CellContainer
                  key={cell.label}
                  label={label}
                  content={cell.value}
                  breakdown={cell.note ?? undefined}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {presentation.armor && presentation.armorCells.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Armor Details</h2>
          <div className={styles.cellGrid}>
            {presentation.armorCells.map((cell) => (
              <CellContainer
                key={cell.label}
                label={cell.label}
                content={cell.value}
                breakdown={cell.note ?? undefined}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default ItemInspectionContent;
