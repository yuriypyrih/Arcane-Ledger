import {
  TRACKER,
  type DivinityEntry,
  type FEATS,
  type SpeciesEntry,
  type SpellEntry
} from "../../../../codex/entries";
import { formatCodexLabel } from "../../../../utils/codex";
import DescriptionContent from "../../../DescriptionContent/DescriptionContent";
import { featureDisclosureStyles } from "../../../FeatureDisclosure";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer
} from "../../../Overlay";
import styles from "./ClassFeaturesAndFeats.module.css";
import type { TrackingButtonRenderer } from "./types";

type SpeciesReferenceDrawerProps = {
  speciesEntry: SpeciesEntry;
  onClose: () => void;
  renderTrackingButton: TrackingButtonRenderer;
  onOpenKeyword: (keywordKey: string, title?: string, trackingMessage?: string) => void;
  onOpenFeatReference: (feat: FEATS) => void;
  onOpenSpellReference: (spell: SpellEntry) => void;
  onOpenDivinityReference: (divinity: DivinityEntry) => void;
};

function formatSpeciesList(values: readonly string[], fallback = "None"): string {
  return values.length > 0 ? values.map(formatCodexLabel).join(", ") : fallback;
}

function getSpeciesTrackingState(speciesEntry: SpeciesEntry): TRACKER {
  return speciesEntry.trackingState ?? TRACKER.NOT_TRACKED;
}

function SpeciesReferenceDrawer({
  speciesEntry,
  onClose,
  renderTrackingButton,
  onOpenKeyword,
  onOpenFeatReference,
  onOpenSpellReference,
  onOpenDivinityReference
}: SpeciesReferenceDrawerProps) {
  return (
    <SheetDrawer
      titleId="species-reference-drawer-title"
      onClose={onClose}
      backdropClassName={styles.featDrawerBackdrop}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Species</OverlayBadge>
          <OverlayTitleRow className={styles.featDrawerTitleRow}>
            <OverlayTitle id="species-reference-drawer-title">{speciesEntry.name}</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary>
            {formatSpeciesList(speciesEntry.tags, "Species")} • {speciesEntry.speed} ft
          </OverlaySummary>
        </OverlayHeaderContent>
        <div className={styles.featDrawerHeaderActions}>
          {renderTrackingButton(
            getSpeciesTrackingState(speciesEntry),
            speciesEntry.trackingMessage
          )}
          <OverlayCloseButton label={`Close ${speciesEntry.name} reference`} onClick={onClose} />
        </div>
      </OverlayHeader>

      <OverlayBody className={styles.keywordDrawerBody}>
        <DescriptionContent
          description={speciesEntry.description}
          className={featureDisclosureStyles.descriptionList}
          entryClassName={featureDisclosureStyles.descriptionLine}
          linkClassName={featureDisclosureStyles.inlineLinkButton}
          onOpenKeyword={(reference) => onOpenKeyword(reference.key, reference.title)}
          onOpenSpell={onOpenSpellReference}
          onOpenDivinity={onOpenDivinityReference}
          onOpenFeat={(feat) => onOpenFeatReference(feat)}
        />
      </OverlayBody>
    </SheetDrawer>
  );
}

export default SpeciesReferenceDrawer;
