import { TRACKER } from "../../../../codex/entries";
import { FeatureTrackingBadgeButton } from "../../../FeatureDisclosure";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../Overlay";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./ClassFeaturesGuideModal.module.css";

type ClassFeaturesGuideModalProps = {
  onClose: () => void;
};

function ClassFeaturesGuideModal({ onClose }: ClassFeaturesGuideModalProps) {
  return (
    <SheetModal titleId="class-features-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Build</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="class-features-guide-modal-title">Class Features Guide</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            Class features unlock as you gain levels in your class, and subclass features start
            appearing at the levels your class grants them. This section shows what you already
            have, highlights choices that still need input, and can also preview what is coming
            later in your progression.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close class features guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Features Tracking States</h4>
          <div className={styles.badgeRow}>
            <FeatureTrackingBadgeButton trackingState={TRACKER.TRACKED} disabled />
            <FeatureTrackingBadgeButton trackingState={TRACKER.SEMI_TRACKED} disabled />
            <FeatureTrackingBadgeButton trackingState={TRACKER.NOT_TRACKED} disabled />
          </div>
          <p className={styles.sectionText}>
            Tracked means the app is doing the heavy lifting for you. Semi Tracked means it helps
            with part of the feature, or at least reminds you it exists, but you still need to read
            and handle the rest. Not Tracked means the app is showing it for reference, but that
            part is on you. The general philosophy is simple: this app mainly tracks the stuff
            happening on your own sheet, like your turn, uses and charges, formulas, HP, and
            conditions that affect you. It does not really track interactions between you and other
            creatures, so if a feature affects allies or enemies, the app tries its best to remind
            you, but remembering who got affected and how is still on you.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default ClassFeaturesGuideModal;
