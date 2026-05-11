import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import type { AbilityKey, AbilityScores, AttributeMode } from "../../../../types";
import styles from "./AbilityScoresModal.module.css";

type AbilityScoresEditorContentProps = {
  attributeMode: AttributeMode;
  abilities: AbilityScores;
  pointBuyRemaining: number | null;
  onSetAttributeMode: (attributeMode: AttributeMode) => void;
  onUpdateAbilityScore: (ability: AbilityKey, value: string) => void;
  getMaxPointBuyScore?: (ability: AbilityKey) => number;
};

function AbilityScoresEditorContent({
  attributeMode,
  abilities,
  pointBuyRemaining,
  onSetAttributeMode,
  onUpdateAbilityScore,
  getMaxPointBuyScore
}: AbilityScoresEditorContentProps) {
  const pointBuyStatus =
    attributeMode === "pointBuy" && pointBuyRemaining !== null
      ? pointBuyRemaining < 0
        ? "overdraft"
        : pointBuyRemaining === 0
          ? "ready"
          : null
      : null;

  function handlePointBuyKeyDown(
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

  function adjustPointBuyAbility(ability: AbilityKey, delta: number) {
    if (attributeMode !== "pointBuy" || delta === 0) {
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
          const maxPointBuyScore = getMaxPointBuyScore?.(ability) ?? 15;

          return (
            <label key={ability} className={styles.abilityInputCard}>
              <span className={styles.abilityInputLabel}>{ability}</span>
              {attributeMode === "pointBuy" ? (
                <div className={styles.pointBuyInputShell}>
                  <NumberInput
                    className={styles.pointBuyInput}
                    min={8}
                    max={15}
                    readOnly
                    value={currentValue}
                    onBeforeInput={(event) => {
                      event.preventDefault();
                    }}
                    onKeyDown={(event) => handlePointBuyKeyDown(event, ability)}
                    onChange={(event) => onUpdateAbilityScore(ability, event.target.value)}
                  />
                  <div className={styles.pointBuyStepper}>
                    <button
                      type="button"
                      className={styles.pointBuyStepperButton}
                      onClick={() => adjustPointBuyAbility(ability, 1)}
                      disabled={currentValue >= maxPointBuyScore}
                      aria-label={`Increase ${ability}`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.pointBuyStepperButton}
                      onClick={() => adjustPointBuyAbility(ability, -1)}
                      disabled={currentValue <= 8}
                      aria-label={`Decrease ${ability}`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <NumberInput
                  min={1}
                  max={99}
                  value={currentValue}
                  onChange={(event) => onUpdateAbilityScore(ability, event.target.value)}
                />
              )}
            </label>
          );
        })}
      </div>
    </>
  );
}

export default AbilityScoresEditorContent;
