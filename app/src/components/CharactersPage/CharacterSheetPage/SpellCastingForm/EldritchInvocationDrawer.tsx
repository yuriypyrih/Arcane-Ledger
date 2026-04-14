import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { DivinityEntry, FEATS, SpellEntry } from "../../../../codex/entries";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { getFeatDefinition } from "../../../../pages/CharactersPage/feats";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import DescriptionContent from "../../../DescriptionContent/DescriptionContent";
import CodexDivinityDrawer from "../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import type { ResolvedKeywordReference } from "../../../../utils/codex/renderCodexRichText";
import styles from "./EldritchInvocationDrawer.module.css";

type EldritchInvocationDrawerProps = {
  option: WarlockEldritchInvocationOption;
  onClose: () => void;
  backdropClassName?: string;
};

function EldritchInvocationDrawer({
  option,
  onClose,
  backdropClassName
}: EldritchInvocationDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<FEATS | null>(null);

  const selectedFeatDefinition = useMemo(
    () => (selectedFeat ? getFeatDefinition(selectedFeat) : null),
    [selectedFeat]
  );

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

      if (selectedFeat) {
        setSelectedFeat(null);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedDivinityReference, selectedFeat, selectedKeyword, selectedSpellReference]);

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
          aria-labelledby="eldritch-invocation-drawer-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={sheetStyles.spellDrawerHeader}>
            <div className={sheetStyles.spellDrawerHeaderContent}>
              <p className={sheetStyles.spellDrawerBadge}>Eldritch Invocation</p>
              <div className={sheetStyles.spellDrawerTitleRow}>
                <h3 id="eldritch-invocation-drawer-title" className={sheetStyles.spellDrawerTitle}>
                  {option.invocation.name}
                </h3>
              </div>
            </div>
            <button
              type="button"
              className={sheetStyles.spellDrawerCloseButton}
              onClick={onClose}
              aria-label="Close eldritch invocation"
            >
              <X size={18} />
            </button>
          </div>

          <div className={sheetStyles.spellDrawerBody}>
            {option.displaySubtitle && !option.isPlaceholder ? (
              <p className={styles.selectionSummary}>{`Choice: ${option.displaySubtitle}`}</p>
            ) : null}
            <DescriptionContent
              description={option.invocation.description}
              className={sheetStyles.spellDrawerDescriptionList}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
              strongClassName={sheetStyles.spellDrawerDescriptionStrong}
              linkClassName={styles.inlineLinkButton}
              onOpenKeyword={setSelectedKeyword}
              onOpenSpell={setSelectedSpellReference}
              onOpenDivinity={setSelectedDivinityReference}
              onOpenFeat={setSelectedFeat}
            />
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
      {selectedFeatDefinition ? (
        <KeywordReferenceDrawer
          title={selectedFeatDefinition.label}
          badgeLabel="Feat"
          entries={[
            {
              title: selectedFeatDefinition.label,
              description: selectedFeatDefinition.description
            }
          ]}
          onClose={() => setSelectedFeat(null)}
        />
      ) : null}
    </>
  );
}

export default EldritchInvocationDrawer;
