import { FastForward } from "lucide-react";
import ActionShape from "../../../../ActionShape";
import type { RoundTrackerResource } from "../../../../../pages/CharactersPage/combat";
import styles from "./RoundTrackerControl.module.css";

type RoundTrackerControlProps = {
  roundTracker: {
    actionAvailable: boolean;
    bonusActionAvailable: boolean;
    reactionAvailable: boolean;
  };
  onSelectResource: (resource: RoundTrackerResource) => void;
  onFinishRound: () => void;
};

function RoundTrackerControl({
  roundTracker,
  onSelectResource,
  onFinishRound
}: RoundTrackerControlProps) {
  return (
    <div className={styles.root} aria-label="Round tracker">
      <ActionShape
        shape="action"
        isSelected={roundTracker.actionAvailable}
        onSelect={() => onSelectResource("action")}
        className={styles.button}
        aria-label={roundTracker.actionAvailable ? "Action available" : "Action spent"}
        title={roundTracker.actionAvailable ? "Action available" : "Action spent"}
      />
      <ActionShape
        shape="bonusAction"
        isSelected={roundTracker.bonusActionAvailable}
        onSelect={() => onSelectResource("bonusAction")}
        className={styles.button}
        aria-label={roundTracker.bonusActionAvailable ? "Bonus action available" : "Bonus action spent"}
        title={roundTracker.bonusActionAvailable ? "Bonus action available" : "Bonus action spent"}
      />
      <ActionShape
        shape="reaction"
        isSelected={roundTracker.reactionAvailable}
        onSelect={() => onSelectResource("reaction")}
        className={styles.button}
        aria-label={roundTracker.reactionAvailable ? "Reaction available" : "Reaction spent"}
        title={roundTracker.reactionAvailable ? "Reaction available" : "Reaction spent"}
      />
      <button
        type="button"
        className={styles.button}
        onClick={onFinishRound}
        aria-label="Finish round"
        title="Finish round"
      >
        <FastForward size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

export default RoundTrackerControl;
