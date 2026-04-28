import clsx from "clsx";
import { CirclePlay, CircleStop, Swords } from "lucide-react";
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
  const getResourceLabel = (
    availableLabel: string,
    spentLabel: string,
    outOfCombatLabel: string,
    isAvailable: boolean
  ) => (!roundTracker.isInCombat ? outOfCombatLabel : isAvailable ? availableLabel : spentLabel);

  return (
    <div className={styles.root} aria-label="Round tracker">
      <button
        type="button"
        className={clsx(
          styles.button,
          styles.turnButton,
          roundTracker.isInCombat && !roundTracker.turnStarted && styles.turnButtonActive,
          roundTracker.turnStarted && styles.turnButtonStop
        )}
        onClick={roundTracker.turnStarted ? onFinishRound : onStartTurn}
        aria-label={roundTracker.turnStarted ? "End round" : "Start round"}
        title={roundTracker.turnStarted ? "End round" : "Start round"}
      >
        {roundTracker.turnStarted ? (
          <CircleStop className={styles.turnButtonIcon} strokeWidth={1} aria-hidden="true" />
        ) : (
          <CirclePlay className={styles.turnButtonIcon} strokeWidth={1} aria-hidden="true" />
        )}
      </button>
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
        onSelect={() => {
          if (roundTracker.isInCombat) {
            onSelectResource("action");
          }
        }}
        className={styles.button}
        aria-label={getResourceLabel(
          "Action available",
          "Action spent",
          "Action free out of combat",
          roundTracker.actionAvailable
        )}
        title={getResourceLabel(
          "Action available",
          "Action spent",
          "Action free out of combat",
          roundTracker.actionAvailable
        )}
      />
      <ActionShape
        shape="bonusAction"
        isSelected={roundTracker.bonusActionAvailable}
        onSelect={() => {
          if (roundTracker.isInCombat) {
            onSelectResource("bonusAction");
          }
        }}
        className={styles.button}
        aria-label={getResourceLabel(
          "Bonus action available",
          "Bonus action spent",
          "Bonus action free out of combat",
          roundTracker.bonusActionAvailable
        )}
        title={getResourceLabel(
          "Bonus action available",
          "Bonus action spent",
          "Bonus action free out of combat",
          roundTracker.bonusActionAvailable
        )}
      />
      <ActionShape
        shape="reaction"
        isSelected={roundTracker.reactionAvailable}
        onSelect={() => {
          if (roundTracker.isInCombat) {
            onSelectResource("reaction");
          }
        }}
        className={styles.button}
        aria-label={getResourceLabel(
          "Reaction available",
          "Reaction spent",
          "Reaction free out of combat",
          roundTracker.reactionAvailable
        )}
        title={getResourceLabel(
          "Reaction available",
          "Reaction spent",
          "Reaction free out of combat",
          roundTracker.reactionAvailable
        )}
      />
    </div>
  );
}

export default RoundTrackerControl;
