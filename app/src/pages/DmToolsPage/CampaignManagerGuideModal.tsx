import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import styles from "./DmToolsPage.module.css";

type CampaignManagerGuideModalProps = {
  onClose: () => void;
};

function CampaignManagerGuideModal({ onClose }: CampaignManagerGuideModalProps) {
  return (
    <SheetModal titleId="campaign-manager-guide-title" onClose={onClose} size="small">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id="campaign-manager-guide-title">
            Welcome to the Campaign Manager!
          </OverlayTitle>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close campaign manager guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.guideBody}>
        <p className={styles.guideText}>
          Start with a party group. It gives your campaign a table of characters to point at, and it
          keeps roster work in one tidy place when players join, leave, or swap characters.
        </p>
        <p className={styles.guideText}>
          Once the party is ready, create a campaign. Use session notes for the story as it unfolds,
          prepare encounters before game night, and set player visibility so Encounter Tracking
          Module gameplay reveals only what you want at the table.
        </p>
        <p className={styles.guideText}>
          Encounter templates are your reusable prep shelf. Build an encounter once, then import it
          into any campaign whenever that setup deserves an encore.
        </p>
        <p className={styles.guideText}>
          Imported encounters become campaign snapshots, so you can tune them for this adventure
          without changing the original template. Keep the prep light, keep the useful bits close,
          and let the manager hold the fiddly pieces while you run the fun part.
        </p>
      </OverlayBody>
    </SheetModal>
  );
}

export default CampaignManagerGuideModal;
