import { lazy, Suspense, useState } from "react";
import {
  FEATS,
  TRACKER,
  getFeatureTrackingState,
  type DivinityEntry,
  type SpellEntry
} from "../../../codex/entries";
import { getFeatCategoryLabel, getFeatDefinition } from "../../../pages/CharactersPage/feats";
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../../utils/codex/renderCodexRichText";
import DescriptionContent from "../../DescriptionContent/DescriptionContent";
import { FeatureTrackingBadgeButton } from "../../FeatureDisclosure";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../Overlay";
import styles from "./CodexFeatDrawer.module.css";

const CodexDivinityDrawer = lazy(() => import("../CodexDivinityDrawer/CodexDivinityDrawer"));
const CodexSpellDrawer = lazy(() => import("../CodexSpellDrawer/CodexSpellDrawer"));
const KeywordReferenceDrawer = lazy(
  () => import("../../KeywordReferenceDrawer/KeywordReferenceDrawer")
);

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type CodexFeatDrawerProps = {
  feat: FEATS;
  label?: string;
  onClose: () => void;
  backdropClassName?: string;
};

function CodexFeatDrawer({ feat, label, onClose, backdropClassName }: CodexFeatDrawerProps) {
  const featDefinition = getFeatDefinition(feat);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );

  if (!featDefinition) {
    return null;
  }

  function openTrackingKeyword(trackingState: TRACKER) {
    const resolvedKeyword = resolveKeywordReference(trackingState);

    if (resolvedKeyword) {
      setSelectedKeyword(resolvedKeyword);
    }
  }

  return (
    <>
      <SheetDrawer
        titleId="codex-feat-drawer-title"
        onClose={onClose}
        backdropClassName={backdropClassName}
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
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayBadge>Feat</OverlayBadge>
            <OverlayTitleRow>
              <OverlayTitle id="codex-feat-drawer-title">
                {label ?? featDefinition.label}
              </OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>
              {getFeatCategoryLabel(featDefinition.category)} Feat
              {featDefinition.prerequisite ? ` • Prerequisite: ${featDefinition.prerequisite}` : ""}
            </OverlaySummary>
          </OverlayHeaderContent>
          <div className={styles.headerActions}>
            <FeatureTrackingBadgeButton
              trackingState={getFeatureTrackingState(featDefinition)}
              onClick={openTrackingKeyword}
            />
            <OverlayCloseButton label={`Close ${featDefinition.label} details`} onClick={onClose} />
          </div>
        </OverlayHeader>

        <OverlayBody>
          <DescriptionContent
            description={featDefinition.description}
            className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
            entryClassName={overlayClassNames.descriptionLine}
            strongClassName={overlayClassNames.descriptionStrong}
            linkClassName={styles.inlineLinkButton}
            onOpenKeyword={setSelectedKeyword}
            onOpenSpell={setSelectedSpellReference}
            onOpenDivinity={setSelectedDivinityReference}
            onOpenFeat={(nextFeat, nextLabel) =>
              setSelectedFeatReference({ feat: nextFeat, label: nextLabel })
            }
          />
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

export default CodexFeatDrawer;
