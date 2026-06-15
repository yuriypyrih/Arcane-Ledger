import clsx from "clsx";
import type { DivinityEntry } from "../../codex/entries";
import ActionShape, { getActionShapeForCastingTime } from "../ActionShape";
import {
  formatDivinitySubtitle,
  formatSpellCastingTimeSummary
} from "../../utils/codex";
import SheetSurface from "../CharactersPage/CharacterSheetPage/SheetSurface";
import styles from "../SpellListRow/SpellListRow.module.css";

type DivinityListRowProps = {
  divinity: DivinityEntry;
  onClick: () => void;
  className?: string;
  valueSummary?: string;
  actionShapeSelected?: boolean;
  actionShapeMultiCount?: number;
};

function formatDivinitySummaryRange(range: string): string {
  return range.replace(/(\d+)\s*feet\b/gi, "$1ft").replace(/(\d+)-foot\b/gi, "$1ft");
}

function formatDivinityRowMeta(divinity: DivinityEntry, hasActionShape: boolean): string {
  return [
    hasActionShape ? "" : formatSpellCastingTimeSummary(divinity.castingTime),
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
  valueSummary = "-",
  actionShapeSelected = true,
  actionShapeMultiCount = 0
}: DivinityListRowProps) {
  const actionShape = getActionShapeForCastingTime(divinity.castingTime);
  const metaText = formatDivinityRowMeta(divinity, actionShape !== null);

  return (
    <SheetSurface
      as="button"
      type="button"
      borderSize="md"
      borderStrength="light"
      hasBorder
      hoverBorder
      className={clsx(styles.button, className)}
      onClick={onClick}
    >
      <div className={styles.contentRow}>
        <div className={styles.primaryBlock}>
          <span className={styles.name}>{divinity.name}</span>
          <small className={styles.subtitle}>{formatDivinitySubtitle(divinity)}</small>
        </div>
        <small className={styles.outcome}>{valueSummary}</small>
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
      </div>
    </SheetSurface>
  );
}

export default DivinityListRow;
