import { useNestedReferences } from "../useNestedReferences";
import { NestedReferenceDrawers } from "../NestedReferenceDrawers";
import { Suspense } from "react";
import { getFeatureTrackingState } from "../../../codex/entries";
import { FEATS, TRACKER } from "../../../codex/entries/enums";
import {
  getFeatCategoryLabel,
  getFeatDefinition
} from "../../../pages/CharactersPage/feats/catalog";
import { resolveKeywordReference } from "../../../utils/codex/renderCodexRichText";
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

type CodexFeatDrawerProps = {
  feat: FEATS;
  label?: string;
  onClose: () => void;
  backdropClassName?: string;
  stacked?: boolean;
};

function CodexFeatDrawer({
  feat,
  label,
  onClose,
  backdropClassName,
  stacked = false
}: CodexFeatDrawerProps) {
  const featDefinition = getFeatDefinition(feat);
  const references = useNestedReferences();
  const {
    setSelectedSpellReference,
    setSelectedDivinityReference,
    setSelectedKeyword,
    setSelectedFeatReference
  } = references;

  if (!featDefinition) {
    return null;
  }

  function openTrackingKeyword(trackingState: TRACKER, trackingMessage?: string) {
    const resolvedKeyword = resolveKeywordReference(trackingState, undefined, trackingMessage);

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
        stacked={stacked}
        onEscape={() => {
          if (references.closeTopReference()) return;

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
              trackingMessage={featDefinition.trackingMessage}
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
        <NestedReferenceDrawers
          references={references}
          backdropClassName={backdropClassName}
          stacked
        />
      </Suspense>
    </>
  );
}

export default CodexFeatDrawer;
