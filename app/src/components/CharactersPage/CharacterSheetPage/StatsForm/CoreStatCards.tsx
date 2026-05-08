import clsx from "clsx";
import { ChevronsUp } from "lucide-react";
import type { CSSProperties } from "react";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import { resolveFeatureIndicators } from "../../../RollStatePill/rollState";
import SheetSurface from "../SheetSurface";
import type { CoreStatCard } from "./coreStatModel";
import styles from "./CoreStatCards.module.css";

type CoreStatCardsProps = {
  cards?: CoreStatCard[];
  rows?: CoreStatCard[][];
  compact?: boolean;
  wide?: boolean;
  className?: string;
  onOpenCard: (card: CoreStatCard) => void;
};

function CoreStatCards({
  cards,
  rows,
  compact = false,
  wide = false,
  className,
  onOpenCard
}: CoreStatCardsProps) {
  function renderCard(card: CoreStatCard, floatingRollState = false) {
    const rollState = resolveFeatureIndicators(card.indicators);

    return (
      <SheetSurface
        as="button"
        key={card.key}
        type="button"
        borderSize={compact ? "lg" : "xl"}
        hoverBorder
        className={clsx(
          styles.card,
          styles.button,
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
        <strong className={styles.valueRow}>
          <span>{card.value}</span>
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
    return (
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
