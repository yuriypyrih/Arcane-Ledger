import clsx from "clsx";
import { useState } from "react";
import { FEATS, type DivinityEntry, type SpellEntry } from "../../codex/entries";
import DescriptionContent from "../DescriptionContent/DescriptionContent";
import CodexDivinityDrawer from "../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../CodexPage/CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../Overlay";
import type { KeywordReference } from "../../pages/CharactersPage/keywordDescriptions";
import type { ResolvedKeywordReference } from "../../utils/codex/renderCodexRichText";
import styles from "./KeywordReferenceDrawer.module.css";

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

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
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );

  if (entries.length === 0) {
    return null;
  }

  function shouldShowEntryTitle(entryTitle: string | undefined) {
    if (!entryTitle) {
      return false;
    }

    return !(entries.length === 1 && entryTitle.trim() === title.trim());
  }

  return (
    <>
      <SheetDrawer
        titleId="reference-drawer-title"
        onClose={onClose}
        onEscape={() => {
          if (selectedFeatReference) {
            setSelectedFeatReference(null);
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
        }}
        backdropClassName={clsx(backdropClassName)}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayBadge>{badgeLabel}</OverlayBadge>
            <OverlayTitleRow>
              <OverlayTitle id="reference-drawer-title">{title}</OverlayTitle>
            </OverlayTitleRow>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close reference" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody>
          <div className={styles.referenceList}>
            {entries.map((entry, index) => (
              <section
                key={`${entry.title || "reference"}-${index}`}
                className={styles.referenceEntry}
              >
                {shouldShowEntryTitle(entry.title) ? (
                  <h4 className={styles.referenceTitle}>{entry.title}</h4>
                ) : null}
                <DescriptionContent
                  description={entry.description}
                  className={overlayClassNames.descriptionList}
                  entryClassName={overlayClassNames.descriptionLine}
                  strongClassName={overlayClassNames.descriptionStrong}
                  linkClassName={styles.inlineLinkButton}
                  onOpenKeyword={setSelectedKeyword}
                  onOpenSpell={setSelectedSpellReference}
                  onOpenDivinity={setSelectedDivinityReference}
                  onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                />
              </section>
            ))}
          </div>
        </OverlayBody>
      </SheetDrawer>

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
          backdropClassName={backdropClassName}
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
      {selectedFeatReference ? (
        <CodexFeatDrawer
          feat={selectedFeatReference.feat}
          label={selectedFeatReference.label}
          onClose={() => setSelectedFeatReference(null)}
        />
      ) : null}
    </>
  );
}

export default KeywordReferenceDrawer;
