import { CircleHelp } from "lucide-react";
import styles from "./DmToolsPage.module.css";

type CampaignManagerGuideButtonProps = {
  onClick: () => void;
};

function CampaignManagerGuideButton({ onClick }: CampaignManagerGuideButtonProps) {
  return (
    <button
      type="button"
      className={styles.helpButton}
      aria-label="Open campaign manager guide"
      title="Campaign Manager Guide"
      onClick={onClick}
    >
      <CircleHelp size={15} aria-hidden="true" />
    </button>
  );
}

export default CampaignManagerGuideButton;
