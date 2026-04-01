import { getFeatureTrackingState, type DivinityEntry, type SpellEntry } from "../../../../codex/entries";
import { getFeatCategoryLabel, type FeatDefinition } from "../../../../pages/CharactersPage/feats";
import type { CharacterFeatEntry } from "../../../../types";
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
import { renderDescriptionLine } from "./helpers";
import type { SelectedFeatReference, TrackingButtonRenderer } from "./types";

type FeatReferenceDrawerProps = {
  selectedFeatReference: SelectedFeatReference;
  featDefinition: FeatDefinition;
  onClose: () => void;
  renderTrackingButton: TrackingButtonRenderer;
  onOpenKeyword: (keywordKey: string, title?: string) => void;
  onOpenFeatReference: (feat: CharacterFeatEntry["feat"], entry?: CharacterFeatEntry) => void;
  onOpenSpellReference: (spell: SpellEntry) => void;
  onOpenDivinityReference: (divinity: DivinityEntry) => void;
  getCharacterFeatSummary: (entry?: CharacterFeatEntry | null) => string | null;
};

function FeatReferenceDrawer({
  selectedFeatReference,
  featDefinition,
  onClose,
  renderTrackingButton,
  onOpenKeyword,
  onOpenFeatReference,
  onOpenSpellReference,
  onOpenDivinityReference,
  getCharacterFeatSummary
}: FeatReferenceDrawerProps) {
  return (
    <SheetDrawer
      titleId="feat-reference-drawer-title"
      onClose={onClose}
      backdropClassName={styles.featDrawerBackdrop}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Feat</OverlayBadge>
          <OverlayTitleRow className={styles.featDrawerTitleRow}>
            <OverlayTitle id="feat-reference-drawer-title">{featDefinition.label}</OverlayTitle>
            {renderTrackingButton(getFeatureTrackingState(featDefinition))}
          </OverlayTitleRow>
          <OverlaySummary>
            {getFeatCategoryLabel(featDefinition.category)} Feat
            {featDefinition.prerequisite ? ` • Prerequisite: ${featDefinition.prerequisite}` : ""}
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label={`Close ${featDefinition.label} reference`}
          onClick={onClose}
        />
      </OverlayHeader>

      <OverlayBody className={styles.keywordDrawerBody}>
        {selectedFeatReference.entry && getCharacterFeatSummary(selectedFeatReference.entry) ? (
          <p className={styles.featReferenceSummary}>
            {`Selection: ${getCharacterFeatSummary(selectedFeatReference.entry)}`}
          </p>
        ) : null}
        {featDefinition.description.map((line, index) => (
          <p
            key={`${featDefinition.feat}-line-${index}`}
            className={featureDisclosureStyles.descriptionLine}
          >
            {renderDescriptionLine(
              line,
              onOpenKeyword,
              (feat) => onOpenFeatReference(feat),
              onOpenSpellReference,
              onOpenDivinityReference
            )}
          </p>
        ))}
      </OverlayBody>
    </SheetDrawer>
  );
}

export default FeatReferenceDrawer;
