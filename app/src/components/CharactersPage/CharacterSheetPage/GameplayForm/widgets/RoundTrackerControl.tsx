import clsx from "clsx";
import { FastForward, Play, Swords } from "lucide-react";
import ActionShape from "../../../../ActionShape";
import type { RoundTrackerResource } from "../../../../../pages/CharactersPage/combat";
import styles from "./RoundTrackerControl.module.css";

type RoundTrackerControlProps = {
  roundTracker: {
    turnStarted: boolean;
    actionAvailable: boolean;
    bonusActionAvailable: boolean;
    reactionAvailable: boolean;
    isInCombat: boolean;
  };
  onSelectResource: (resource: RoundTrackerResource) => void;
  onSelectCombat: () => void;
  onStartTurn: () => void;
  onFinishRound: () => void;
};

function RoundTrackerControl({
  roundTracker,
  onSelectResource,
  onSelectCombat,
  onStartTurn,
  onFinishRound
}: RoundTrackerControlProps) {
  return (
    <div className={styles.root} aria-label="Round tracker">
      <button
        type="button"
        className={clsx(
          styles.button,
          styles.combatButton,
          roundTracker.isInCombat && styles.combatButtonActive
        )}
        onClick={onSelectCombat}
        aria-pressed={roundTracker.isInCombat}
        aria-label={roundTracker.isInCombat ? "In Combat" : "Out of Combat"}
        title={roundTracker.isInCombat ? "In Combat" : "Out of Combat"}
      >
        <Swords size={17} aria-hidden="true" />
      </button>
      <span className={styles.divider} aria-hidden="true" />
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
      <span className={styles.divider} aria-hidden="true" />
      <button
        type="button"
        className={clsx(
          styles.button,
          styles.turnButton,
          roundTracker.turnStarted && styles.turnButtonActive
        )}
        onClick={roundTracker.turnStarted ? onFinishRound : onStartTurn}
        aria-label={roundTracker.turnStarted ? "Finish turn" : "Start turn"}
        title={roundTracker.turnStarted ? "Finish turn" : "Start turn"}
      >
        {roundTracker.turnStarted ? (
          <FastForward size={15} aria-hidden="true" />
        ) : (
          <Play size={15} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default RoundTrackerControl;
