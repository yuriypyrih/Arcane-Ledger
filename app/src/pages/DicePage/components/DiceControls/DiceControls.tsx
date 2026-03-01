import clsx from "clsx";
import type { DiceSelection, DiceSides } from "../../../../types";
import { selectableDice } from "../../../../utils/dice";
import styles from "./DiceControls.module.css";

type DiceControlsProps = {
  selection: DiceSelection;
  totalSelectedDice: number;
  onAdjustSelection: (sides: DiceSides, delta: 1 | -1) => void;
  onRoll: () => void;
};

function DiceControls({
  selection,
  totalSelectedDice,
  onAdjustSelection,
  onRoll
}: DiceControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.diceGroup} aria-label="Dice pool">
        {selectableDice.map((sides) => (
          <button
            key={sides}
            type="button"
            className={clsx(styles.dieButton, selection[sides] > 0 && styles.dieButtonActive)}
            onClick={() => onAdjustSelection(sides, 1)}
          >
            <span>d{sides}</span>
            {selection[sides] > 0 ? (
              <span
                className={styles.countBadge}
                onClick={(event) => {
                  event.stopPropagation();
                  onAdjustSelection(sides, -1);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onAdjustSelection(sides, -1);
                  }
                }}
              >
                +{selection[sides]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.rollButton}
        onClick={onRoll}
        disabled={totalSelectedDice === 0}
      >
        Roll
      </button>
    </div>
  );
}

export default DiceControls;
