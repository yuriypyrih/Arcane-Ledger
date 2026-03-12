import clsx from "clsx";
import { X } from "lucide-react";
import { useState } from "react";
import { useDiceRollerPopup } from "../../../../components/DicePage/DiceRollerPopup";
import d20Icon from "../../../../assets/svg/d20.svg";
import type { DiceSelection, DiceSides } from "../../../../types";
import { createEmptySelection, selectableDice } from "../../../../utils/dice";
import styles from "./ThumbDiceButton.module.css";

function buildDiceFormula(selection: DiceSelection): string {
  const terms = selectableDice
    .map((sides) => {
      const count = selection[sides];
      return count > 0 ? `${count}d${sides}` : null;
    })
    .filter((term): term is string => term !== null);

  return terms.join(" + ");
}

function buildDiceDescription(selection: DiceSelection): string {
  const terms = selectableDice
    .map((sides) => {
      const count = selection[sides];
      return count > 0 ? `${count} x d${sides}` : null;
    })
    .filter((term): term is string => term !== null);

  return terms.length > 0 ? `Selected: ${terms.join(", ")}` : "No dice selected.";
}

function ThumbDiceButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selection, setSelection] = useState<DiceSelection>(createEmptySelection);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const totalSelectedDice = selectableDice.reduce((sum, sides) => sum + selection[sides], 0);

  function adjustSelection(sides: DiceSides, delta: 1 | -1) {
    setSelection((currentSelection) => {
      const nextValue = Math.max(0, currentSelection[sides] + delta);

      return {
        ...currentSelection,
        [sides]: nextValue
      };
    });
  }

  function handleThumbClick() {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    if (totalSelectedDice === 0) {
      setIsExpanded(false);
      return;
    }

    openDiceRoller({
      title: "Quick roll",
      formula: buildDiceFormula(selection),
      description: buildDiceDescription(selection)
    });

    setSelection(createEmptySelection());
    setIsExpanded(false);
  }

  const triggerLabel = !isExpanded ? (
    <img src={d20Icon} alt="" className={styles.thumbIcon} />
  ) : totalSelectedDice > 0 ? (
    <span className={styles.rollLabel}>ROLL</span>
  ) : (
    <X size={22} />
  );

  return (
    <>
      <div className={styles.floatingControls}>
        <div
          id="thumb-dice-menu"
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
                onClick={() => adjustSelection(sides, 1)}
              >
                <span>d{sides}</span>
                {selection[sides] > 0 ? (
                  <span
                    className={styles.countBadge}
                    onClick={(event) => {
                      event.stopPropagation();
                      adjustSelection(sides, -1);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        adjustSelection(sides, -1);
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
          className={styles.thumbButton}
          onClick={handleThumbClick}
          aria-controls="thumb-dice-menu"
          aria-expanded={isExpanded}
          aria-label={
            !isExpanded
              ? "Open quick dice roller"
              : totalSelectedDice > 0
                ? "Roll selected dice"
                : "Close quick dice roller"
          }
        >
          {triggerLabel}
        </button>
      </div>

      {diceRollerPopup}
    </>
  );
}

export default ThumbDiceButton;
