import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import {
  abilityKeys,
  CUSTOM_ABILITY_SCORE_MAX
} from "../../../../pages/CharactersPage/constants";
import type { AbilityKey, AbilityScores, AttributeMode } from "../../../../types";
import styles from "./AbilityScoresModal.module.css";

type AbilityScoresEditorContentProps = {
  attributeMode: AttributeMode;
  abilities: AbilityScores;
  pointBuyRemaining: number | null;
  onSetAttributeMode: (attributeMode: AttributeMode) => void;
  onUpdateAbilityScore: (ability: AbilityKey, value: string) => void;
};

function AbilityScoresEditorContent({
  attributeMode,
  abilities,
  pointBuyRemaining,
  onSetAttributeMode,
  onUpdateAbilityScore
}: AbilityScoresEditorContentProps) {
  const pointBuyStatus =
    attributeMode === "pointBuy" && pointBuyRemaining !== null
      ? pointBuyRemaining < 0
        ? "overdraft"
        : pointBuyRemaining === 0
          ? "ready"
          : null
      : null;

  function getAbilityScoreBounds() {
    if (attributeMode === "pointBuy") {
      return {
        min: 8,
        max: 15
      };
    }

    return {
      min: 1,
      max: CUSTOM_ABILITY_SCORE_MAX
    };
  }

  function handleAbilityScoreKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
    ability: AbilityKey
  ) {
    if (attributeMode !== "pointBuy") {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      onUpdateAbilityScore(ability, String(abilities[ability] + 1));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      onUpdateAbilityScore(ability, String(abilities[ability] - 1));
      return;
    }

    if (
      [
        "Tab",
        "Shift",
        "Backspace",
        "Delete",
        "Enter",
        "Escape",
        "ArrowLeft",
        "ArrowRight"
      ].includes(event.key)
    ) {
      return;
    }

    event.preventDefault();
  }

  function adjustAbilityScore(ability: AbilityKey, delta: number) {
    if (delta === 0) {
      return;
    }

    onUpdateAbilityScore(ability, String(abilities[ability] + delta));
  }

  return (
    <>
      <div className={styles.modeControl}>
        <button
          type="button"
          className={clsx(
            styles.modeButton,
            attributeMode === "pointBuy" && styles.modeButtonActive
          )}
          onClick={() => onSetAttributeMode("pointBuy")}
        >
          Point Buy
        </button>
        <button
          type="button"
          className={clsx(
            styles.modeButton,
            attributeMode === "custom" && styles.modeButtonActive
          )}
          onClick={() => onSetAttributeMode("custom")}
        >
          Custom
        </button>
      </div>

      {attributeMode === "pointBuy" && pointBuyRemaining !== null ? (
        <div className={styles.pointBuyInfo}>
          <div
            className={clsx(
              styles.pointBuySummary,
              pointBuyStatus === "overdraft" && styles.pointBuySummaryOverdraft
            )}
          >
            <span className={styles.pointBuyLabel}>
              POINTS REMAINING
              {pointBuyStatus ? (
                <>
                  {" "}
                  <span className={styles.pointBuyLabelDivider}>-</span>{" "}
                  <span
                    className={clsx(
                      styles.pointBuyStatus,
                      pointBuyStatus === "ready"
                        ? styles.pointBuyStatusReady
                        : styles.pointBuyStatusOverdraft
                    )}
                  >
                    {pointBuyStatus === "ready" ? "READY" : "OVERDRAFT"}
                  </span>
                </>
              ) : null}
            </span>
            <strong className={styles.pointBuyValue}>{pointBuyRemaining}</strong>
          </div>
          <p className={styles.pointBuyHint}>
            Scores 8-13 cost 1 point per +1. Scores 14-15 cost 2 points per +1.
          </p>
        </div>
      ) : null}

      <div className={styles.abilityInputGrid}>
        {abilityKeys.map((ability) => {
          const currentValue = abilities[ability];
          const scoreBounds = getAbilityScoreBounds();
          const isPointBuy = attributeMode === "pointBuy";

          return (
            <label key={ability} className={styles.abilityInputCard}>
              <span className={styles.abilityInputLabel}>{ability}</span>
              <div className={styles.pointBuyInputShell}>
                <NumberInput
                  className={styles.pointBuyInput}
                  min={scoreBounds.min}
                  max={isPointBuy ? 15 : scoreBounds.max}
                  readOnly={isPointBuy}
                  value={currentValue}
                  onBeforeInput={
                    isPointBuy
                      ? (event) => {
                          event.preventDefault();
                        }
                      : undefined
                  }
                  onKeyDown={(event) => handleAbilityScoreKeyDown(event, ability)}
                  onChange={(event) => onUpdateAbilityScore(ability, event.target.value)}
                />
                <div className={styles.pointBuyStepper}>
                  <button
                    type="button"
                    className={styles.pointBuyStepperButton}
                    onClick={() => adjustAbilityScore(ability, 1)}
                    disabled={currentValue >= scoreBounds.max}
                    aria-label={`Increase ${ability}`}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.pointBuyStepperButton}
                    onClick={() => adjustAbilityScore(ability, -1)}
                    disabled={currentValue <= scoreBounds.min}
                    aria-label={`Decrease ${ability}`}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </>
  );
}

export default AbilityScoresEditorContent;
