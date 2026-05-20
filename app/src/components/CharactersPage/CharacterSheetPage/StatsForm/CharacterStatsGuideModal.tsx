import { ChevronsUp } from "lucide-react";
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
import styles from "./CharacterStatsGuideModal.module.css";

type CharacterStatsGuideModalProps = {
  onClose: () => void;
};

function CharacterStatsGuideModal({ onClose }: CharacterStatsGuideModalProps) {
  return (
    <SheetModal titleId="character-stats-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Character Stats</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="character-stats-guide-modal-title">
              Character Stats Guide
            </OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            Ability scores, ability modifiers, and ability saving throws are the core stats the app
            uses across the character sheet.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close character stats guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <p className={styles.sectionText}>
            If you see a blue{" "}
            <ChevronsUp size={16} className={styles.boostIcon} aria-label="Additional bonus" />{" "}
            icon, that stat has additional bonuses. Click the stat to see where they come from.
            If a saving throw number is <span className={styles.purpleText}>purple</span>, your
            character is proficient in that saving throw.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default CharacterStatsGuideModal;
