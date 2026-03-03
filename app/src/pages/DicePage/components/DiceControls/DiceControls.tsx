import { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  function handleRollClick() {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    if (totalSelectedDice > 0) {
      onRoll();
    }

    setIsExpanded(false);
  }

  return (
    <div className={styles.controls}>
      <div
        id="dice-roller-menu"
        className={clsx(styles.diceRail, isExpanded && styles.diceRailExpanded)}
        aria-hidden={!isExpanded}
      >
        <div className={styles.diceGroup} aria-label="Dice pool">
          {selectableDice.map((sides) => (
            <button
              key={sides}
              type="button"
              className={clsx(styles.dieButton, selection[sides] > 0 && styles.dieButtonActive)}
              disabled={!isExpanded}
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
                  {selection[sides]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.rollButton}
        onClick={handleRollClick}
        aria-controls="dice-roller-menu"
        aria-expanded={isExpanded}
      >
        <span className={styles.rollLabel}>Roll</span>
      </button>
    </div>
  );
}

export default DiceControls;
