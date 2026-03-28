import clsx from "clsx";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { DivinityEntry, SpellEntry } from "../../codex/entries";
import DescriptionContent from "../DescriptionContent/DescriptionContent";
import CodexDivinityDrawer from "../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import type { KeywordReference } from "../../pages/CharactersPage/keywordDescriptions";
import sheetStyles from "../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type { ResolvedKeywordReference } from "../../utils/codex/renderCodexRichText";
import styles from "./KeywordReferenceDrawer.module.css";

type KeywordReferenceDrawerProps = {
  title: string;
  entries: KeywordReference[];
  onClose: () => void;
  backdropClassName?: string;
  badgeLabel?: string;
};

function KeywordReferenceDrawer({
  title,
  entries,
  onClose,
  backdropClassName,
  badgeLabel = "Reference"
}: KeywordReferenceDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedKeyword) {
        setSelectedKeyword(null);
        return;
      }

      if (selectedDivinityReference) {
        setSelectedDivinityReference(null);
        return;
      }

      if (selectedSpellReference) {
        setSelectedSpellReference(null);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedDivinityReference, selectedKeyword, selectedSpellReference]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={clsx(sheetStyles.spellDrawerBackdrop, backdropClassName)}
        role="presentation"
        onClick={onClose}
      >
        <section
          className={sheetStyles.spellDrawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reference-drawer-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
          <div className={sheetStyles.spellDrawerHeader}>
            <div className={sheetStyles.spellDrawerHeaderContent}>
              <p className={sheetStyles.spellDrawerBadge}>{badgeLabel}</p>
              <div className={sheetStyles.spellDrawerTitleRow}>
                <h3 id="reference-drawer-title">{title}</h3>
              </div>
            </div>
            <button
              type="button"
              className={sheetStyles.spellDrawerCloseButton}
              onClick={onClose}
              aria-label="Close reference"
            >
              <X size={18} />
            </button>
          </div>

          <div className={sheetStyles.spellDrawerBody}>
            <div className={styles.referenceList}>
              {entries.map((entry, index) => (
                <article
                  key={`${entry.title || "reference"}-${index}`}
                  className={styles.referenceCard}
                >
                  {entry.title ? <h4 className={styles.referenceTitle}>{entry.title}</h4> : null}
                  <DescriptionContent
                    description={entry.description}
                    className={sheetStyles.spellDrawerDescriptionList}
                    entryClassName={sheetStyles.spellDrawerDescriptionLine}
                    linkClassName={styles.inlineLinkButton}
                    onOpenKeyword={setSelectedKeyword}
                    onOpenSpell={setSelectedSpellReference}
                    onOpenDivinity={setSelectedDivinityReference}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedKeyword ? (
        <KeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description
            }
          ]}
          badgeLabel="Keyword"
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
    </>
  );
}

export default KeywordReferenceDrawer;
