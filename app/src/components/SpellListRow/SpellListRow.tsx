import clsx from "clsx";
import type { ReactNode } from "react";
import { DURATION, type SpellEntry } from "../../codex/entries";
import ActionShape, { getActionShapeForCastingTime, type ActionShapeType } from "../ActionShape";
import ConcentrationLabel from "../ConcentrationLabel";
import SpellSubtitle from "../SpellSubtitle";
import { formatSpellCastingTimeSummary, getSpellDurationDisplayParts } from "../../utils/codex";
import styles from "./SpellListRow.module.css";

type SpellListRowActionShape = {
  key: string;
  shape: ActionShapeType;
  isSelected: boolean;
  multiCount?: number;
};

type SpellListRowProps = {
  spell: SpellEntry;
  onClick: () => void;
  className?: string;
  valueSummary?: string;
  detailNote?: string;
  detailNoteTone?: "default" | "accent";
  alwaysPrepared?: boolean;
  alwaysSpellbook?: boolean;
  actionShapes?: SpellListRowActionShape[];
  actionShapeSelected?: boolean;
  actionShapeMultiCount?: number;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  selectionControls?: ReactNode;
  disabled?: boolean;
  compactConcentrationDuration?: boolean;
  highlightTone?: "default" | "spell-mastery";
};

function formatSpellSummaryRange(range: string): string {
  return range.replace(/(\d+)\s*feet\b/gi, "$1ft").replace(/(\d+)-foot\b/gi, "$1ft");
}

function getSpellRowDurationNode(
  spell: Pick<SpellEntry, "duration">,
  compactConcentrationDuration: boolean
): ReactNode | null {
  const { hasConcentration, detailText } = getSpellDurationDisplayParts(spell.duration);

  if (compactConcentrationDuration && hasConcentration) {
    return <ConcentrationLabel className={styles.concentrationLabel} iconSize={12} />;
  }

  if (hasConcentration) {
    return (
      <>
        <ConcentrationLabel className={styles.concentrationLabel} iconSize={12} />
        {detailText ? <span>, {detailText}</span> : null}
      </>
    );
  }

  const formattedDuration = spell.duration
    .map((part) => (part === DURATION.CONCENTRATION ? "Concentration" : part.trim()))
    .filter((part) => part.length > 0)
    .join(", ");

  return formattedDuration || null;
}

function renderCommaSeparatedMeta(entries: ReactNode[]): ReactNode {
  return entries.map((entry, index) => (
    <span key={`meta-${index}`}>
      {index > 0 ? ", " : null}
      {entry}
    </span>
  ));
}

function renderSpellRowMeta(
  spell: SpellEntry,
  hasActionShape: boolean,
  compactConcentrationDuration: boolean
): ReactNode | null {
  const entries: ReactNode[] = [];

  if (!hasActionShape) {
    entries.push(formatSpellCastingTimeSummary(spell.castingTime));
  }

  const durationNode = getSpellRowDurationNode(spell, compactConcentrationDuration);

  if (durationNode) {
    entries.push(durationNode);
  }

  const rangeLabel = formatSpellSummaryRange(spell.range);

  if (rangeLabel.trim().length > 0) {
    entries.push(rangeLabel);
  }

  return entries.length > 0 ? renderCommaSeparatedMeta(entries) : null;
}

function SpellListRow({
  spell,
  onClick,
  className,
  valueSummary = "",
  detailNote,
  detailNoteTone = "default",
  alwaysPrepared = false,
  alwaysSpellbook = false,
  actionShapes,
  actionShapeSelected = true,
  actionShapeMultiCount = 0,
  selectable = false,
  isSelected = false,
  onSelect,
  selectionControls,
  disabled = false,
  compactConcentrationDuration = false,
  highlightTone = "default"
}: SpellListRowProps) {
  const hasValueSummary = valueSummary.trim().length > 0;
  const hasDetailNote = (detailNote ?? "").trim().length > 0;
  const derivedActionShape = getActionShapeForCastingTime(spell.castingTime);
  const resolvedActionShapes =
    actionShapes && actionShapes.length > 0
      ? actionShapes
      : derivedActionShape
        ? [
            {
              key: "primary",
              shape: derivedActionShape,
              isSelected: actionShapeSelected,
              multiCount: actionShapeMultiCount
            }
          ]
        : [];
  const metaContent = renderSpellRowMeta(
    spell,
    resolvedActionShapes.length > 0,
    compactConcentrationDuration
  );
  const metaNode =
    !hasDetailNote && (resolvedActionShapes.length > 0 || metaContent) ? (
      <span className={styles.metaGroup}>
        {resolvedActionShapes.map((actionShape) => (
          <ActionShape
            key={actionShape.key}
            shape={actionShape.shape}
            isSelected={actionShape.isSelected}
            multiCount={actionShape.multiCount ?? 0}
            size="small"
            className={styles.metaShape}
          />
        ))}
        {metaContent ? <small className={styles.meta}>{metaContent}</small> : null}
      </span>
    ) : (
      <span />
    );

  if (selectable) {
    return (
      <article
        className={clsx(
          styles.button,
          highlightTone === "spell-mastery" && styles.spellMasteryHighlight,
          styles.selectableCard,
          isSelected && styles.selectableCardSelected,
          className
        )}
      >
        {selectionControls ? (
          <div className={styles.selectionControls}>{selectionControls}</div>
        ) : (
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
        )}
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
                  {alwaysSpellbook ? (
                    <span className={clsx(styles.namePill, styles.alwaysSpellbookPill)}>
                      Always Spellbook
                    </span>
                  ) : null}
                </div>
                <small className={styles.subtitle}>
                  <SpellSubtitle spell={spell} />
                </small>
              </div>
              {hasValueSummary ? (
                <small className={styles.outcome}>{valueSummary}</small>
              ) : hasDetailNote ? (
                <small
                  className={clsx(
                    styles.outcome,
                    detailNoteTone === "accent" && styles.outcomeAccent
                  )}
                >
                  {detailNote}
                </small>
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
    <button
      type="button"
      className={clsx(
        styles.button,
        highlightTone === "spell-mastery" && styles.spellMasteryHighlight,
        disabled && styles.buttonDisabled,
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={styles.contentRow}>
        <div className={styles.primaryBlock}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{spell.name}</span>
            {alwaysPrepared ? (
              <span className={clsx(styles.namePill, styles.alwaysPreparedPill)}>
                Always Prepared
              </span>
            ) : null}
            {alwaysSpellbook ? (
              <span className={clsx(styles.namePill, styles.alwaysSpellbookPill)}>
                Always Spellbook
              </span>
            ) : null}
          </div>
          <small className={styles.subtitle}>
            <SpellSubtitle spell={spell} />
          </small>
        </div>
        {hasValueSummary ? (
          <small className={styles.outcome}>{valueSummary}</small>
        ) : hasDetailNote ? (
          <small
            className={clsx(styles.outcome, detailNoteTone === "accent" && styles.outcomeAccent)}
          >
            {detailNote}
          </small>
        ) : (
          <span />
        )}
        {metaNode}
      </div>
    </button>
  );
}

export default SpellListRow;
