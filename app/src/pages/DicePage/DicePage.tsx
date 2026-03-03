import { useState } from "react";
import { History } from "lucide-react";
import D20Viewport from "../../components/D20Viewport";
import type { DiceSelection, DiceSides, RolledDie } from "../../types";
import { createEmptySelection, rollDicePool, selectableDice } from "../../utils/dice";
import DiceControls from "./components/DiceControls";
import RollHistoryDrawer from "./components/RollHistoryDrawer";
import RollResultPopup from "./components/RollResultPopup";
import { createResultPopup, createRollRecord } from "./utils";
import styles from "./DicePage.module.css";
import type { ResultPopup, RollRecord } from "./types";

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
      const record: RollRecord = createRollRecord(result);

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
      <div className={styles.stageSection}>
        <D20Viewport
          dice={currentDice}
          rollToken={rollToken}
          onRollComplete={(rolledDice, completedToken) => {
            if (completedToken !== rollToken) {
              return;
            }

            setResultPopup(createResultPopup(rolledDice, completedToken));
          }}
        />

        <div className={styles.controlsOverlay}>
          <DiceControls
            selection={selection}
            totalSelectedDice={totalSelectedDice}
            onAdjustSelection={adjustSelection}
            onRoll={commitRoll}
          />
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
          <RollHistoryDrawer history={history} />
        ) : null}

        {resultPopup ? <RollResultPopup result={resultPopup} /> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    </section>
  );
}

export default DicePage;
