import clsx from "clsx";
import { useState } from "react";
import { History } from "lucide-react";
import D20Viewport from "../components/D20Viewport";
import {
  createEmptySelection,
  rollDicePool,
  selectableDice,
  type DiceSelection,
  type DiceSides,
  type RolledDie
} from "../lib/dice";
import styles from "./DicePage.module.css";

type RollRecord = {
  id: number;
  total: number;
  breakdown: string;
  dice: RolledDie[];
};

type ResultPopup = {
  rollToken: number;
  total: number;
  breakdown: string;
};

function DicePage() {
  const [selection, setSelection] = useState<DiceSelection>(createEmptySelection);
  const [currentDice, setCurrentDice] = useState<RolledDie[]>([]);
  const [history, setHistory] = useState<RollRecord[]>([]);
  const [rollToken, setRollToken] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resultPopup, setResultPopup] = useState<ResultPopup | null>(null);
  const [error, setError] = useState("");

  const totalSelectedDice = selectableDice.reduce((sum, sides) => sum + selection[sides], 0);

  function adjustSelection(sides: DiceSides, delta: 1 | -1) {
    setSelection((current) => {
      const nextValue = Math.max(0, current[sides] + delta);
      return {
        ...current,
        [sides]: nextValue
      };
    });
  }

  function commitRoll() {
    try {
      if (totalSelectedDice === 0) {
        throw new Error("Select at least one die before rolling.");
      }

      const result = rollDicePool(selection);
      const record: RollRecord = {
        id: Date.now(),
        total: result.total,
        breakdown: result.breakdown,
        dice: result.dice
      };

      setHistory((current) => [record, ...current].slice(0, 12));
      setCurrentDice(result.dice);
      setSelection(createEmptySelection());
      setResultPopup(null);
      setRollToken((current) => current + 1);
      setError("");
    } catch (rollError) {
      setError(rollError instanceof Error ? rollError.message : "Failed to roll dice.");
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>Dice roller</p>
            <h2 className={styles.title}>Three.js dice pool preview.</h2>
          </div>
        </div>

        <div className={styles.stageSection}>
          <D20Viewport
            dice={currentDice}
            rollToken={rollToken}
            onRollComplete={(rolledDice, completedToken) => {
              if (completedToken !== rollToken) {
                return;
              }

              setResultPopup({
                rollToken: completedToken,
                total: rolledDice.reduce((sum, die) => sum + die.value, 0),
                breakdown: rolledDice.map((die) => `d${die.sides}:${die.value}`).join("  ")
              });
            }}
          />

          <div className={styles.controlsOverlay}>
            <div className={styles.controls}>
              <div className={styles.diceGroup} aria-label="Dice pool">
                {selectableDice.map((sides) => (
                  <button
                    key={sides}
                    type="button"
                    className={clsx(
                      styles.dieButton,
                      selection[sides] > 0 && styles.dieButtonActive
                    )}
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
                        +{selection[sides]}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={styles.rollButton}
                onClick={commitRoll}
                disabled={totalSelectedDice === 0}
              >
                Roll
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.historyToggle}
            aria-label={historyOpen ? "Hide roll history" : "Show roll history"}
            aria-expanded={historyOpen}
            onClick={() => setHistoryOpen((current) => !current)}
          >
            <History size={18} />
          </button>

          {historyOpen ? (
            <div className={styles.historyDrawer}>
              {history.length === 0 ? (
                <p className={styles.empty}>Your latest rolls will appear here for this session.</p>
              ) : (
                <ul className={styles.historyList}>
                  {history.map((entry) => (
                    <li key={entry.id} className={styles.historyItem}>
                      <div className={styles.historyTop}>
                        <strong>{entry.total}</strong>
                        <span>{entry.dice.length} dice</span>
                      </div>
                      <p>{entry.breakdown}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {resultPopup ? (
            <div className={styles.resultPopup}>
              <p className={styles.resultPopupLabel}>Result</p>
              <strong className={styles.resultPopupValue}>{resultPopup.total}</strong>
              <p className={styles.resultPopupText}>{resultPopup.breakdown}</p>
            </div>
          ) : null}
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    </section>
  );
}

export default DicePage;
