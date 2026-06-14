import { CircleHelp } from "lucide-react";
import styles from "./DmToolsPage.module.css";

type LiveEncounterGuideButtonProps = {
  onClick: () => void;
};

function LiveEncounterGuideButton({ onClick }: LiveEncounterGuideButtonProps) {
  return (
    <button
      type="button"
      className={styles.helpButton}
      aria-label="Open live encounter guide"
      title="Live Encounter Guide"
      onClick={onClick}
    >
      <CircleHelp size={15} aria-hidden="true" />
    </button>
  );
}

export default LiveEncounterGuideButton;
