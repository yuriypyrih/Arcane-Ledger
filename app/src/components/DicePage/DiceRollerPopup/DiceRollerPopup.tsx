import { X } from "lucide-react";
import { useEffect } from "react";
import D20Viewport from "../../D20Viewport";
import { useBodyScrollLock } from "../../../lib/useBodyScrollLock";
import styles from "./DiceRollerPopup.module.css";
import type { DiceRollerPopupState } from "./types";

type DiceRollerPopupProps = {
  state: DiceRollerPopupState | null;
  onClose: () => void;
  onRollComplete: (rollToken: number) => void;
};

function DiceRollerPopup({ state, onClose, onRollComplete }: DiceRollerPopupProps) {
  useBodyScrollLock(Boolean(state));

  useEffect(() => {
    if (!state) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state, onClose]);

  if (!state) {
    return null;
  }

  const { request, result, error } = state;

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-label={request.title}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close dice roller">
          <X size={18} />
        </button>

        {state.dice.length > 0 ? (
          <div className={styles.viewportStage}>
            <D20Viewport
              dice={state.dice}
              rollToken={state.rollToken}
              onRollComplete={(_, completedToken) => onRollComplete(completedToken)}
            />
          </div>
        ) : null}

        {error ? (
          <p className={styles.errorText}>{error}</p>
        ) : result && state.resultVisible ? (
          <div className={styles.resultPanel}>
            <p className={styles.resultLabel}>Result</p>
            <strong className={styles.resultValue}>{result.total}</strong>
            <p className={styles.breakdown}>{result.breakdown}</p>
          </div>
        ) : state.dice.length > 0 ? (
          <p className={styles.pendingText}>Rolling...</p>
        ) : (
          <p className={styles.errorText}>No dice available for this formula.</p>
        )}
      </section>
    </div>
  );
}

export default DiceRollerPopup;
