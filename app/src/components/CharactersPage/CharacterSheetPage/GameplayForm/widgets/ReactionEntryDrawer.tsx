import clsx from "clsx";
import { X } from "lucide-react";
import type { ReactionEntry } from "../../../../../codex/entries";
import SpellDescriptionContent from "../../../../SpellDescriptionContent";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./TraitsConditionsWidget.module.css";

type ReactionEntryDrawerProps = {
  reaction: ReactionEntry;
  actionWarning: string | null;
  onCast: () => void;
  onClose: () => void;
};

function ReactionEntryDrawer({
  reaction,
  actionWarning,
  onCast,
  onClose
}: ReactionEntryDrawerProps) {
  return (
    <div className={sheetStyles.spellDrawerBackdrop} role="presentation" onClick={onClose}>
      <section
        className={sheetStyles.spellDrawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reaction-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
        <div className={sheetStyles.spellDrawerHeader}>
          <div className={sheetStyles.spellDrawerHeaderContent}>
            <p className={sheetStyles.spellDrawerBadge}>Reaction</p>
            <div className={sheetStyles.spellDrawerTitleRow}>
              <h3 id="reaction-drawer-title">{reaction.name}</h3>
            </div>
          </div>
          <button
            type="button"
            className={sheetStyles.spellDrawerCloseButton}
            onClick={onClose}
            aria-label="Close reaction details"
          >
            <X size={18} />
          </button>
        </div>

        <div className={sheetStyles.spellDrawerBody}>
          <SpellDescriptionContent
            description={reaction.description}
            className={clsx(
              sheetStyles.spellDrawerDescriptionList,
              sheetStyles.spellDrawerDescriptionSection
            )}
            entryClassName={sheetStyles.spellDrawerDescriptionLine}
          />
        </div>

        <div className={sheetStyles.spellDrawerActions}>
          <div className={styles.castActionMeta}>
            {actionWarning ? <p className={styles.castActionWarning}>{actionWarning}</p> : null}
          </div>
          <button
            type="button"
            className={sheetStyles.castButton}
            onClick={onCast}
            disabled={actionWarning !== null}
          >
            Cast
          </button>
        </div>
      </section>
    </div>
  );
}

export default ReactionEntryDrawer;
