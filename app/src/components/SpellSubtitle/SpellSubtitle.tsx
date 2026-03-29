import type { SpellEntry } from "../../codex/entries";
import { formatCodexLabel, formatSpellLevelLabel } from "../../utils/codex";
import styles from "./SpellSubtitle.module.css";

type SpellSubtitleProps = {
  spell: Pick<SpellEntry, "magicSchool" | "spellLevel" | "ritual">;
};

function SpellSubtitle({ spell }: SpellSubtitleProps) {
  return (
    <span className={styles.root}>
      <span className={styles.label}>
        {`${formatCodexLabel(spell.magicSchool)} ${formatSpellLevelLabel(spell.spellLevel)}`}
      </span>
      {spell.ritual ? <span className={styles.ritualPill}>Ritual</span> : null}
    </span>
  );
}

export default SpellSubtitle;
