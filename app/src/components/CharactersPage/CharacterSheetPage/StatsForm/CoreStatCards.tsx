import clsx from "clsx";
import { ChevronsUp, Shield } from "lucide-react";
import type { CSSProperties } from "react";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import { resolveFeatureIndicators } from "../../../RollStatePill/rollState";
import SheetSurface from "../SheetSurface";
import type { CoreStatCard } from "./coreStatModel";
import styles from "./CoreStatCards.module.css";

type CoreStatCardsProps = {
  cards?: CoreStatCard[];
  rows?: CoreStatCard[][];
  condensedColumns?: CoreStatCard[][];
  compact?: boolean;
  wide?: boolean;
  profileTexture?: boolean;
  rowFlow?: "grid" | "condensed" | "responsive-condensed";
  className?: string;
  onOpenCard: (card: CoreStatCard) => void;
};

function CoreStatCards({
  cards,
  rows,
  condensedColumns,
  compact = false,
  wide = false,
  profileTexture = false,
  rowFlow = "grid",
  className,
  onOpenCard
}: CoreStatCardsProps) {
  function renderCard(card: CoreStatCard, floatingRollState = false) {
    const rollState = resolveFeatureIndicators(card.indicators);
    const isArmorClassProfileCard = profileTexture && card.key === "armorClass";
    const isParchmentProfileCard = profileTexture && !isArmorClassProfileCard;

    return (
      <SheetSurface
        as="button"
        key={card.key}
        type="button"
        borderSize={compact ? "lg" : "xl"}
        hasBorder={profileTexture}
        hoverBorder
        className={clsx(
          styles.card,
          styles.button,
          isParchmentProfileCard && styles.profileStatCard,
          isArmorClassProfileCard && styles.armorClassCard,
          compact && styles.compactCard,
          floatingRollState && styles.floatingStateCard
        )}
        onClick={() => onOpenCard(card)}
      >
        <div className={styles.labelRow}>
          <span className={clsx(styles.label, compact && styles.compactLabel)}>{card.label}</span>
          {rollState && !floatingRollState ? (
            <RollStatePill tone={rollState.tone} label={rollState.label} />
          ) : null}
        </div>
        <strong
          className={clsx(
            styles.valueRow,
            isArmorClassProfileCard && styles.armorClassValueRow
          )}
        >
          {isArmorClassProfileCard ? (
            <span className={styles.armorClassShieldBadge}>
              <Shield className={styles.armorClassShield} strokeWidth={1.55} aria-hidden />
              <span className={styles.armorClassShieldValue}>{card.value}</span>
            </span>
          ) : (
            <span>{card.value}</span>
          )}
          {card.showBoostIcon ? (
            <ChevronsUp size={compact ? 16 : 18} className={styles.valueIcon} aria-hidden />
          ) : null}
        </strong>
        {rollState && floatingRollState ? (
          <span className={styles.floatingState}>
            <RollStatePill
              tone={rollState.tone}
              label={rollState.label}
              size="small"
              className={styles.floatingStatePill}
            />
          </span>
        ) : null}
      </SheetSurface>
    );
  }

  if (rows) {
    const gridRows = (
      <div className={clsx(styles.rows, className)}>
        {rows.map((row, rowIndex) => (
          <div
            key={row.map((card) => card.key).join("-")}
            className={styles.row}
            style={{ "--core-stat-row-count": row.length } as CSSProperties}
            aria-label={`Profile stats row ${rowIndex + 1}`}
          >
            {row.map((card) => renderCard(card, true))}
          </div>
        ))}
      </div>
    );

    if (rowFlow === "grid") {
      return gridRows;
    }

    const condensedRows =
      condensedColumns && condensedColumns.length > 0 ? (
        <div
          className={clsx(
            styles.condensedColumns,
            rowFlow === "responsive-condensed" && styles.condensedRowsResponsive,
            className
          )}
          aria-label="Profile stats"
        >
          {condensedColumns.map((column, columnIndex) => (
            <div
              key={column.map((card) => card.key).join("-")}
              className={styles.condensedColumn}
              aria-label={`Profile stats column ${columnIndex + 1}`}
            >
              {column.map((card) => renderCard(card, true))}
            </div>
          ))}
        </div>
      ) : (
        <div
          className={clsx(
            styles.condensedRows,
            rowFlow === "responsive-condensed" && styles.condensedRowsResponsive,
            className
          )}
          aria-label="Profile stats"
        >
          {rows.flatMap((row) => row).map((card) => renderCard(card, true))}
        </div>
      );

    if (rowFlow === "condensed") {
      return condensedRows;
    }

    return (
      <>
        <div className={styles.rowsResponsiveGrid}>{gridRows}</div>
        {condensedRows}
      </>
    );
  }

  return (
    <div
      className={clsx(
        styles.grid,
        wide && styles.gridWide,
        compact && styles.compactGrid,
        className
      )}
    >
      {(cards ?? []).map((card) => renderCard(card))}
    </div>
  );
}

export default CoreStatCards;
