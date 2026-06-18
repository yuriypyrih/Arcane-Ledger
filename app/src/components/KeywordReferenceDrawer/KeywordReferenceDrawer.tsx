import clsx from "clsx";
import { lazy, Suspense, useState } from "react";
import { FEATS, type DivinityEntry, type SpellEntry } from "../../codex/entries";
import DescriptionContent from "../DescriptionContent/DescriptionContent";
import FeatureTrackingBadgeButton from "../FeatureDisclosure/FeatureTrackingBadgeButton";
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
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../utils/codex/renderCodexRichText";
import styles from "./KeywordReferenceDrawer.module.css";

const CodexDivinityDrawer = lazy(
  () => import("../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer")
);
const CodexFeatDrawer = lazy(() => import("../CodexPage/CodexFeatDrawer/CodexFeatDrawer"));
const CodexSpellDrawer = lazy(() => import("../CodexPage/CodexSpellDrawer/CodexSpellDrawer"));

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

  function openTrackingReference(trackingState: NonNullable<KeywordReference["trackingState"]>) {
    const reference = resolveKeywordReference(trackingState);

    if (!reference) {
      return;
    }

    setSelectedKeyword(reference);
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
                {shouldShowEntryTitle(entry.title) || entry.trackingState ? (
                  <div className={styles.referenceHeadingRow}>
                    {shouldShowEntryTitle(entry.title) ? (
                      <h4 className={styles.referenceTitle}>{entry.title}</h4>
                    ) : null}
                    {entry.trackingState ? (
                      <FeatureTrackingBadgeButton
                        trackingState={entry.trackingState}
                        onClick={openTrackingReference}
                      />
                    ) : null}
                  </div>
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

      <Suspense fallback={null}>
        {selectedSpellReference ? (
          <CodexSpellDrawer
            spell={selectedSpellReference}
            backdropClassName={backdropClassName}
            onClose={() => setSelectedSpellReference(null)}
          />
        ) : null}
        {selectedDivinityReference ? (
          <CodexDivinityDrawer
            divinity={selectedDivinityReference}
            backdropClassName={backdropClassName}
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
            backdropClassName={backdropClassName}
            onClose={() => setSelectedFeatReference(null)}
          />
        ) : null}
      </Suspense>
    </>
  );
}

export default KeywordReferenceDrawer;
