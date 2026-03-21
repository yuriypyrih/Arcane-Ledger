import clsx from "clsx";
import type { SpellEntry } from "../../codex/entries";
import {
  formatSpellCastingTimeSummary,
  formatSpellComponents,
  formatSpellSubtitle
} from "../../utils/codex";
import styles from "./SpellListRow.module.css";

type SpellListRowProps = {
  spell: SpellEntry;
  onClick: () => void;
  className?: string;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
};

function formatSpellSummaryRange(range: string): string {
  return range.replace(/(\d+)\s*feet\b/gi, "$1ft").replace(/(\d+)-foot\b/gi, "$1ft");
}

function formatSpellRowMeta(spell: SpellEntry): string {
  const parts = [formatSpellCastingTimeSummary(spell.castingTime), formatSpellSummaryRange(spell.range)];
  const componentText =
    spell.components.length > 0 ? `(${formatSpellComponents(spell.components)})` : null;

  return componentText ? `${parts.join(", ")} ${componentText}` : parts.join(", ");
}

function SpellListRow({
  spell,
  onClick,
  className,
  selectable = false,
  isSelected = false,
  onSelect,
  disabled = false
}: SpellListRowProps) {
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
            <div className={styles.topRow}>
              <span className={styles.name}>{spell.name}</span>
              <small className={styles.meta}>{formatSpellRowMeta(spell)}</small>
            </div>
            <small className={styles.subtitle}>{formatSpellSubtitle(spell)}</small>
          </div>
        </button>
      </article>
    );
  }

  return (
    <button type="button" className={clsx(styles.button, className)} onClick={onClick}>
      <div className={styles.topRow}>
        <span className={styles.name}>{spell.name}</span>
        <small className={styles.meta}>{formatSpellRowMeta(spell)}</small>
      </div>
      <small className={styles.subtitle}>{formatSpellSubtitle(spell)}</small>
    </button>
  );
}

export default SpellListRow;
