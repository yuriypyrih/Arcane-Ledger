import clsx from "clsx";
import { X } from "lucide-react";
import type { KeywordReference } from "../../pages/CharactersPage/keywordDescriptions";
import sheetStyles from "../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./KeywordReferenceDrawer.module.css";

type KeywordReferenceDrawerProps = {
  title: string;
  entries: KeywordReference[];
  onClose: () => void;
  backdropClassName?: string;
};

function KeywordReferenceDrawer({
  title,
  entries,
  onClose,
  backdropClassName
}: KeywordReferenceDrawerProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(sheetStyles.spellDrawerBackdrop, backdropClassName)}
      role="presentation"
      onClick={onClose}
    >
      <section
        className={sheetStyles.spellDrawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="weapon-reference-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
        <div className={sheetStyles.spellDrawerHeader}>
          <div className={sheetStyles.spellDrawerHeaderContent}>
            <p className={sheetStyles.spellDrawerBadge}>Weapon reference</p>
            <div className={sheetStyles.spellDrawerTitleRow}>
              <h3 id="weapon-reference-drawer-title">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            className={sheetStyles.spellDrawerCloseButton}
            onClick={onClose}
            aria-label="Close weapon reference"
          >
            <X size={18} />
          </button>
        </div>
        <div className={sheetStyles.spellDrawerBody}>
          <div className={styles.referenceList}>
            {entries.map((entry) => (
              <article key={entry.title} className={styles.referenceCard}>
                <h4 className={styles.referenceTitle}>{entry.title}</h4>
                <p className={sheetStyles.spellDrawerDescriptionLine}>{entry.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default KeywordReferenceDrawer;
