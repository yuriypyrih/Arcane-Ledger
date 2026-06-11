import { Eye, RefreshCw, ShieldCheck, Swords } from "lucide-react";
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
import styles from "./GameplayGuideModal.module.css";

type EncounterTrackerGuideModalProps = {
  onClose: () => void;
};

function EncounterTrackerGuideModal({ onClose }: EncounterTrackerGuideModalProps) {
  return (
    <SheetModal titleId="encounter-tracker-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Encounter Tracker</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="encounter-tracker-guide-modal-title">
              Encounter Tracker Guide
            </OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            The encounter tracker shows the live initiative order shared by the GM, including the
            creature details the GM has made visible to the party.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close encounter tracker guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Initiative</h4>
          <div className={styles.turnFlowList}>
            <div className={styles.turnFlowItem}>
              <span
                className={`${styles.turnFlowIcon} ${styles.turnFlowIconCombat}`}
                aria-hidden="true"
              >
                <Swords size={17} />
              </span>
              <p className={styles.sectionText}>
                The list follows the GM&apos;s active encounter order and highlights the current turn
                when the GM advances the tracker.
              </p>
            </div>
            <div className={styles.turnFlowItem}>
              <span
                className={`${styles.turnFlowIcon} ${styles.turnFlowIconStart}`}
                aria-hidden="true"
              >
                <Eye size={17} />
              </span>
              <p className={styles.sectionText}>
                Creature names and portraits stay available, while monster details, stat block
                sections, and HP information follow the GM&apos;s visibility settings.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Creature Inspection</h4>
          <div className={styles.turnFlowList}>
            <div className={styles.turnFlowItem}>
              <span className={styles.turnFlowIcon} aria-hidden="true">
                <ShieldCheck size={17} />
              </span>
              <p className={styles.sectionText}>
                The inspection drawer mirrors the visible creature card and keeps HP, temporary HP,
                vitality, and death saves read-only for party members.
              </p>
            </div>
            <div className={styles.turnFlowItem}>
              <span className={styles.turnFlowIcon} aria-hidden="true">
                <RefreshCw size={17} />
              </span>
              <p className={styles.sectionText}>
                Refresh syncs the latest encounter state after the character sheet has saved any
                pending character changes.
              </p>
            </div>
          </div>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default EncounterTrackerGuideModal;
