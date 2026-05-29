import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import styles from "./DmToolsPage.module.css";
import shared from "../../components/CharactersPage/CharacterSheetPage/CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";

type CampaignManagerGuideModalProps = {
  onClose: () => void;
};

function CampaignManagerGuideModal({ onClose }: CampaignManagerGuideModalProps) {
  return (
    <SheetModal titleId="campaign-manager-guide-title" onClose={onClose} size="small">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id="campaign-manager-guide-title">GM Tools Guide</OverlayTitle>
          <OverlaySummary className={shared.helperText}>
            Welcome to the Campaign Manager!
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close campaign manager guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.guideBody}>
        <p className={styles.guideText}>
          Start with a party group. Invide other players to join with their chosen characters.
        </p>
        <p className={styles.guideText}>
          Once the party is ready, create a campaign. There you can prepare upcoming encounters and
          document everything using session notes. In the Campaign Manager you can also find the
          Encounter Tracker where players can see their initiative order and other useful
          information during turn based events.
        </p>
        <p className={styles.guideText}>
          Encounter templates are your reusable prep shelf. Imported encounters are baked inot the
          campaign, so you can tune them for this adventure without changing the original template.
          Keep the prep light, keep the useful bits close, and let the manager hold the fiddly
          pieces while you run the fun part.
        </p>
      </OverlayBody>
    </SheetModal>
  );
}

export default CampaignManagerGuideModal;
