import clsx from "clsx";
import type { DivinityEntry } from "../../codex/entries";
import {
  formatDivinitySubtitle,
  formatSpellCastingTimeSummary
} from "../../utils/codex";
import styles from "../SpellListRow/SpellListRow.module.css";

type DivinityListRowProps = {
  divinity: DivinityEntry;
  onClick: () => void;
  className?: string;
  valueSummary?: string;
};

function formatDivinitySummaryRange(range: string): string {
  return range.replace(/(\d+)\s*feet\b/gi, "$1ft").replace(/(\d+)-foot\b/gi, "$1ft");
}

function formatDivinityRowMeta(divinity: DivinityEntry): string {
  return [
    formatSpellCastingTimeSummary(divinity.castingTime),
    divinity.duration,
    formatDivinitySummaryRange(divinity.range)
  ]
    .filter((entry) => entry.trim().length > 0)
    .join(", ");
}

function DivinityListRow({
  divinity,
  onClick,
  className,
  valueSummary = "-"
}: DivinityListRowProps) {
  return (
    <button type="button" className={clsx(styles.button, className)} onClick={onClick}>
      <div className={styles.contentRow}>
        <div className={styles.primaryBlock}>
          <span className={styles.name}>{divinity.name}</span>
          <small className={styles.subtitle}>{formatDivinitySubtitle(divinity)}</small>
        </div>
        <small className={styles.outcome}>{valueSummary}</small>
        <small className={styles.meta}>{formatDivinityRowMeta(divinity)}</small>
      </div>
    </button>
  );
}

export default DivinityListRow;
