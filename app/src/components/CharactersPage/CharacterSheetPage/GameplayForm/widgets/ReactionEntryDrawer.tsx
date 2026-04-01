import clsx from "clsx";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  type DivinityEntry,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import DescriptionContent from "../../../../../components/DescriptionContent/DescriptionContent";
import CodexDivinityDrawer from "../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import KeywordReferenceDrawer from "../../../../../components/KeywordReferenceDrawer/KeywordReferenceDrawer";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type { ResolvedKeywordReference } from "../../../../../utils/codex/renderCodexRichText";
import styles from "./ReactionEntryDrawer.module.css";

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

  return (
    <>
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
                <h3 id="reaction-drawer-title" className={sheetStyles.spellDrawerTitle}>
                  {reaction.name}
                </h3>
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
            <div
              className={clsx(
                sheetStyles.spellDrawerDescriptionList,
                sheetStyles.spellDrawerDescriptionSection
              )}
            >
              <DescriptionContent
                description={reaction.description}
                entryClassName={sheetStyles.spellDrawerDescriptionLine}
                strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                linkClassName={styles.inlineLinkButton}
                onOpenKeyword={setSelectedKeyword}
                onOpenSpell={setSelectedSpellReference}
                onOpenDivinity={setSelectedDivinityReference}
              />
            </div>
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
              Take Reaction
            </button>
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

export default ReactionEntryDrawer;
