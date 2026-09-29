import { useNestedReferences } from "../CodexPage/useNestedReferences";
import { NestedReferenceDrawers } from "../CodexPage/NestedReferenceDrawers";
import clsx from "clsx";
import { Suspense } from "react";

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
import { resolveKeywordReference } from "../../utils/codex/renderCodexRichText";
import styles from "./KeywordReferenceDrawer.module.css";

type KeywordReferenceDrawerProps = {
  title: string;
  entries: KeywordReference[];
  onClose: () => void;
  backdropClassName?: string;
  stacked?: boolean;
  badgeLabel?: string;
};

function formatTrackingMessage(message: string | undefined): string | null {
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    return null;
  }

  return `${trimmedMessage.charAt(0).toUpperCase()}${trimmedMessage.slice(1)}`;
}

function KeywordReferenceDrawer({
  title,
  entries,
  onClose,
  backdropClassName,
  stacked = false,
  badgeLabel = "Reference"
}: KeywordReferenceDrawerProps) {
  const references = useNestedReferences();
  const {
    setSelectedSpellReference,
    setSelectedDivinityReference,
    setSelectedKeyword,
    setSelectedFeatReference
  } = references;

  if (entries.length === 0) {
    return null;
  }

  function shouldShowEntryTitle(entryTitle: string | undefined) {
    if (!entryTitle) {
      return false;
    }

    return !(entries.length === 1 && entryTitle.trim() === title.trim());
  }

  function openTrackingReference(
    trackingState: NonNullable<KeywordReference["trackingState"]>,
    trackingMessage?: string
  ) {
    const reference = resolveKeywordReference(trackingState, undefined, trackingMessage);

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
          if (references.closeTopReference()) return;

          onClose();
        }}
        backdropClassName={clsx(backdropClassName)}
        stacked={stacked}
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
                        trackingMessage={entry.trackingMessage}
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
                {formatTrackingMessage(entry.trackingMessage) ? (
                  <div className={styles.trackingDetails}>
                    <p>
                      <strong>Details:</strong> {formatTrackingMessage(entry.trackingMessage)}
                    </p>
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </OverlayBody>
      </SheetDrawer>

      <Suspense fallback={null}>
        <NestedReferenceDrawers
          references={references}
          backdropClassName={backdropClassName}
          stacked
        />
      </Suspense>
    </>
  );
}

export default KeywordReferenceDrawer;
