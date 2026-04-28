import { useState, type FormEvent } from "react";
import clsx from "clsx";
import type { DiceSelection, DiceSides } from "../../../types";
import { formatCustomDiceText, parseCustomDiceText, selectableDice } from "../../../utils/dice";
import styles from "./DiceControls.module.css";

type DiceControlsProps = {
  selection: DiceSelection;
  customDiceText: string;
  customDiceCount: number;
  totalSelectedDice: number;
  onAdjustSelection: (sides: DiceSides, delta: 1 | -1) => void;
  onCustomDiceTextChange: (value: string) => void;
  onRoll: () => void;
};

function DiceControls({
  selection,
  customDiceText,
  customDiceCount,
  totalSelectedDice,
  onAdjustSelection,
  onCustomDiceTextChange,
  onRoll
}: DiceControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customDraftText, setCustomDraftText] = useState("");
  const [customError, setCustomError] = useState("");

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

  function openCustomModal() {
    setCustomDraftText(customDiceText);
    setCustomError("");
    setIsCustomModalOpen(true);
  }

  function submitCustomDice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const terms = parseCustomDiceText(customDraftText);
      onCustomDiceTextChange(formatCustomDiceText(terms));
      setCustomError("");
      setIsCustomModalOpen(false);
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : "Enter valid custom dice.");
    }
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
          <button
            type="button"
            className={clsx(
              styles.dieButton,
              styles.customDieButton,
              customDiceCount > 0 && styles.dieButtonActive
            )}
            disabled={!isExpanded}
            onClick={openCustomModal}
          >
            <span>Custom Dice</span>
            {customDiceCount > 0 ? <span className={styles.countBadge}>{customDiceCount}</span> : null}
          </button>
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
      {isCustomModalOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setIsCustomModalOpen(false)}
        >
          <form
            className={styles.customModal}
            onSubmit={submitCustomDice}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.customModalHeader}>
              <h3>Custom Dice</h3>
              <button
                type="button"
                className={styles.customModalClose}
                onClick={() => setIsCustomModalOpen(false)}
                aria-label="Close custom dice"
              >
                x
              </button>
            </div>
            <label className={styles.customField}>
              <span>Dice</span>
              <input
                value={customDraftText}
                onChange={(event) => setCustomDraftText(event.target.value)}
                placeholder="1d7,2d25"
                autoFocus
              />
            </label>
            <p className={styles.customHint}>
              Enter custom dice separated by commas, for example 1d7,2d25. Leave empty to clear.
            </p>
            {customError ? <p className={styles.customError}>{customError}</p> : null}
            <div className={styles.customModalActions}>
              <button type="submit" className={styles.customAddButton}>
                Add
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default DiceControls;
