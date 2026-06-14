import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../components/Overlay";
import styles from "./LiveEncounterGuideModal.module.css";

type LiveEncounterGuideModalProps = {
  onClose: () => void;
};

function LiveEncounterGuideModal({ onClose }: LiveEncounterGuideModalProps) {
  return (
    <SheetModal titleId="live-encounter-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Live Encounter</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="live-encounter-guide-modal-title">
              Welcome to the Live Encounter Tracker Guide
            </OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close live encounter guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Initiative Order</h4>
          <p className={styles.sectionText}>
            The GM can pull Members and Creatures into the Initiative Order list, which players can
            see while the encounter is live.
          </p>
          <p className={styles.sectionText}>
            The GM can set the current turn, change the round, and reorder the initiative order.
            Players who are already in the initiative order can also move the current turn by
            pressing Round Start or Round End on their character sheet.
          </p>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Player And Creature Details</h4>
          <p className={styles.sectionText}>
            The GM controls what players can see when they inspect creature stat blocks. Players can
            still inspect each other normally.
          </p>
          <p className={styles.sectionText}>
            The GM has explicit control over creature stat blocks and HP. Player cards are updated
            when the corresponding character sheet syncs.
          </p>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Ending The Encounter</h4>
          <p className={styles.sectionText}>
            The live encounter ends when the GM decides to end it.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default LiveEncounterGuideModal;
