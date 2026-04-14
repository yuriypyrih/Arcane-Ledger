import CellContainer from "../CellContainer/CellContainer";
import DescriptionContent from "../DescriptionContent/DescriptionContent";
import { buildItemDetailPresentation } from "../../pages/ItemCodexEntryPage/itemPresentation";
import type { ItemRecord } from "../../types";
import styles from "./ItemInspectionContent.module.css";

type ItemInspectionContentProps = {
  item: ItemRecord;
  className?: string;
};

function ItemInspectionContent({ item, className }: ItemInspectionContentProps) {
  const presentation = buildItemDetailPresentation(item);

  return (
    <article className={className ?? styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>{presentation.name}</h1>
        <p className={styles.subtitle}>{presentation.subtitleParts.join(" • ")}</p>
      </header>

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
            {presentation.weaponCells.map((cell) => (
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
