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
import styles from "./CompanionsGuideModal.module.css";

type CompanionsGuideModalProps = {
  onClose: () => void;
};

function CompanionsGuideModal({ onClose }: CompanionsGuideModalProps) {
  return (
    <SheetModal titleId="companions-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Companions</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="companions-guide-modal-title">Companions Guide</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            Companions can be familiars, summons, primal beasts, allied NPCs, or any other creature
            you want to keep near the sheet.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close companions guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <p className={styles.sectionText}>
            Cards show current HP, max HP, Temporary HP, and status at a glance. Open a card to
            inspect the companion, update its live state, or use its creature stat block when one is
            attached.
          </p>
          <p className={styles.sectionText}>
            Companion automation is intentionally lighter than the main sheet.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default CompanionsGuideModal;
