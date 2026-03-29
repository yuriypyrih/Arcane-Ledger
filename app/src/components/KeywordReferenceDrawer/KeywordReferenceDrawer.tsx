import clsx from "clsx";
import { useState } from "react";
import type { DivinityEntry, SpellEntry } from "../../codex/entries";
import DescriptionContent from "../DescriptionContent/DescriptionContent";
import CodexDivinityDrawer from "../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../Overlay";
import type { KeywordReference } from "../../pages/CharactersPage/keywordDescriptions";
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

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      <SheetDrawer
        titleId="reference-drawer-title"
        onClose={onClose}
        onEscape={() => {
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
              <h3 id="reference-drawer-title">{title}</h3>
            </OverlayTitleRow>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close reference" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody>
          <div className={styles.referenceList}>
            {entries.map((entry, index) => (
              <article
                key={`${entry.title || "reference"}-${index}`}
                className={styles.referenceCard}
              >
                {entry.title ? <h4 className={styles.referenceTitle}>{entry.title}</h4> : null}
                <DescriptionContent
                  description={entry.description}
                  className={overlayClassNames.descriptionList}
                  entryClassName={overlayClassNames.descriptionLine}
                  linkClassName={styles.inlineLinkButton}
                  onOpenKeyword={setSelectedKeyword}
                  onOpenSpell={setSelectedSpellReference}
                  onOpenDivinity={setSelectedDivinityReference}
                />
              </article>
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
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
    </>
  );
}

export default KeywordReferenceDrawer;
