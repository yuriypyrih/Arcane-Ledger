import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect } from "react";
import D20Viewport from "../../D20Viewport";
import { useBodyScrollLock } from "../../../lib/useBodyScrollLock";
import type { NaturalOutcome } from "../../../types";
import styles from "./DiceRollerPopup.module.css";
import type { DiceRollerPopupState } from "./types";

type DiceRollerPopupProps = {
  state: DiceRollerPopupState | null;
  onClose: () => void;
  onRollComplete: (rollToken: number) => void;
};

function formatResultSummary(state: DiceRollerPopupState): string {
  return state.results
    .map((entry) => `${entry.label?.trim() || "Roll"} ${entry.result.total}`)
    .join(" | ");
}

function renderNaturalOutcomePill(outcome: NaturalOutcome) {
  const label =
    outcome === "natural20" ? "Natural 20" : outcome === "natural1" ? "Natural 1" : null;

  if (!label) {
    return null;
  }

  return (
    <span
      className={clsx(
        styles.naturalOutcomePill,
        outcome === "natural20" ? styles.natural20Pill : styles.natural1Pill
      )}
    >
      {label}
    </span>
  );
}

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
  const hasMultipleResults = state.results.length > 1;

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-label={request.title}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dice roller"
        >
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
          hasMultipleResults ? (
            <div className={styles.multiResultPanel}>
              <p className={styles.resultLabel}>Results</p>
              <strong className={styles.multiResultSummary}>{formatResultSummary(state)}</strong>
              <div className={styles.multiResultGrid}>
                {state.results.map((entry) => (
                  <div
                    key={`${entry.request.formulaDisplay}-${entry.label ?? "roll"}`}
                    className={styles.multiResultCard}
                  >
                    <p className={styles.multiResultCardLabel}>{entry.label ?? "Roll"}</p>
                    <strong className={styles.multiResultCardValue}>{entry.result.total}</strong>
                    <div className={clsx(styles.breakdownRow, styles.multiResultBreakdownRow)}>
                      {renderNaturalOutcomePill(entry.result.naturalOutcome)}
                      <p className={clsx(styles.breakdown, styles.multiResultBreakdown)}>
                        {entry.result.breakdown}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.resultPanel}>
              <p className={styles.resultLabel}>Result</p>
              <strong className={styles.resultValue}>{result.total}</strong>
              <div className={clsx(styles.breakdownRow, styles.resultBreakdownRow)}>
                {renderNaturalOutcomePill(result.naturalOutcome)}
                <p className={clsx(styles.breakdown, styles.resultBreakdown)}>{result.breakdown}</p>
              </div>
            </div>
          )
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
