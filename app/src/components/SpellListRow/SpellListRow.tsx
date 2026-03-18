import clsx from "clsx";
import type { SpellEntry } from "../../codex/entries";
import { formatSpellComponents, formatSpellSubtitle } from "../../utils/codex";
import styles from "./SpellListRow.module.css";

type SpellListRowProps = {
  spell: SpellEntry;
  onClick: () => void;
  className?: string;
};

function formatSpellSummaryRange(range: string): string {
  return range.replace(/(\d+)\s*feet\b/gi, "$1ft").replace(/(\d+)-foot\b/gi, "$1ft");
}

function formatSpellRowMeta(spell: SpellEntry): string {
  const parts = [spell.castingTime, formatSpellSummaryRange(spell.range)];
  const componentText =
    spell.components.length > 0 ? `(${formatSpellComponents(spell.components)})` : null;

  return componentText ? `${parts.join(", ")} ${componentText}` : parts.join(", ");
}

function SpellListRow({ spell, onClick, className }: SpellListRowProps) {
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
