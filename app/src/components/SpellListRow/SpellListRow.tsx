import clsx from "clsx";
import type { SpellEntry } from "../../codex/entries";
import ActionShape, { getActionShapeForCastingTime } from "../ActionShape";
import {
  formatSpellCastingTimeSummary,
  formatSpellDuration,
  formatSpellSubtitle
} from "../../utils/codex";
import styles from "./SpellListRow.module.css";

type SpellListRowProps = {
  spell: SpellEntry;
  onClick: () => void;
  className?: string;
  valueSummary?: string;
  alwaysPrepared?: boolean;
  actionShapeSelected?: boolean;
  actionShapeMultiCount?: number;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
};

function formatSpellSummaryRange(range: string): string {
  return range.replace(/(\d+)\s*feet\b/gi, "$1ft").replace(/(\d+)-foot\b/gi, "$1ft");
}

function formatSpellRowMeta(spell: SpellEntry, hasActionShape: boolean): string {
  return [
    hasActionShape ? "" : formatSpellCastingTimeSummary(spell.castingTime),
    formatSpellDuration(spell.duration),
    formatSpellSummaryRange(spell.range)
  ]
    .filter((entry) => entry.trim().length > 0)
    .join(", ");
}

function SpellListRow({
  spell,
  onClick,
  className,
  valueSummary = "",
  alwaysPrepared = false,
  actionShapeSelected = true,
  actionShapeMultiCount = 0,
  selectable = false,
  isSelected = false,
  onSelect,
  disabled = false
}: SpellListRowProps) {
  const hasValueSummary = valueSummary.trim().length > 0;
  const actionShape = getActionShapeForCastingTime(spell.castingTime);
  const metaText = formatSpellRowMeta(spell, actionShape !== null);
  const metaNode =
    actionShape || metaText ? (
      <span className={styles.metaGroup}>
        {actionShape ? (
          <ActionShape
            shape={actionShape}
            isSelected={actionShapeSelected}
            multiCount={actionShapeMultiCount}
            size="small"
            className={styles.metaShape}
          />
        ) : null}
        {metaText ? <small className={styles.meta}>{metaText}</small> : null}
      </span>
    ) : (
      <span />
    );

  if (selectable) {
    return (
      <article
        className={clsx(
          styles.button,
          styles.selectableCard,
          isSelected && styles.selectableCardSelected,
          className
        )}
      >
        <button
          type="button"
          className={clsx(
            styles.selectableToggleButton,
            disabled && styles.selectableToggleButtonDisabled
          )}
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`${isSelected ? "Deselect" : "Select"} ${spell.name}`}
          disabled={disabled}
          onClick={onSelect}
        >
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            tabIndex={-1}
            className={styles.selectableCheckbox}
            aria-hidden="true"
          />
        </button>
        <button type="button" className={styles.selectableDetailButton} onClick={onClick}>
          <div className={styles.selectableTextBlock}>
            <div className={styles.contentRow}>
              <div className={styles.primaryBlock}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{spell.name}</span>
                  {alwaysPrepared ? (
                    <span className={clsx(styles.namePill, styles.alwaysPreparedPill)}>
                      Always Prepared
                    </span>
                  ) : null}
                </div>
                <small className={styles.subtitle}>{formatSpellSubtitle(spell)}</small>
              </div>
              {hasValueSummary ? (
                <small className={styles.outcome}>{valueSummary}</small>
              ) : (
                <span />
              )}
              {metaNode}
            </div>
          </div>
        </button>
      </article>
    );
  }

  return (
    <button type="button" className={clsx(styles.button, className)} onClick={onClick}>
      <div className={styles.contentRow}>
        <div className={styles.primaryBlock}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{spell.name}</span>
            {alwaysPrepared ? (
              <span className={clsx(styles.namePill, styles.alwaysPreparedPill)}>
                Always Prepared
              </span>
            ) : null}
          </div>
          <small className={styles.subtitle}>{formatSpellSubtitle(spell)}</small>
        </div>
        {hasValueSummary ? <small className={styles.outcome}>{valueSummary}</small> : <span />}
        {metaNode}
      </div>
    </button>
  );
}

export default SpellListRow;
