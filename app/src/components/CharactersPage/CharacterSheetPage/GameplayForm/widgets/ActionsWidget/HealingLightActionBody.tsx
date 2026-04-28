import clsx from "clsx";
import SelectInput from "../../../../FormInputs/SelectInput";
import styles from "./HealingLightActionBody.module.css";

export type HealingLightTarget = "self" | "other";

type HealingLightActionBodyProps = {
  remainingDice: number;
  maxDicePerUse: number;
  selectedDiceCount: number;
  selectedTarget: HealingLightTarget;
  onSelectedDiceCountChange: (diceCount: number) => void;
  onSelectedTargetChange: (target: HealingLightTarget) => void;
};

function HealingLightActionBody({
  remainingDice,
  maxDicePerUse,
  selectedDiceCount,
  selectedTarget,
  onSelectedDiceCountChange,
  onSelectedTargetChange
}: HealingLightActionBodyProps) {
  const maxSelectableDice = Math.min(10, remainingDice, maxDicePerUse);
  const diceOptions = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <div className={styles.body}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Healing d6</span>
        <SelectInput
          className={styles.select}
          value={String(selectedDiceCount)}
          disabled={maxSelectableDice <= 0}
          onChange={(event) => onSelectedDiceCountChange(Number(event.target.value) || 1)}
        >
          {diceOptions.map((diceCount) => (
            <option
              key={`healing-light-${diceCount}`}
              value={diceCount}
              disabled={diceCount > maxSelectableDice}
            >
              {diceCount}
            </option>
          ))}
        </SelectInput>
      </label>

      <div className={styles.targetSwitch} role="tablist" aria-label="Healing Light target">
        <button
          type="button"
          className={clsx(
            styles.targetButton,
            selectedTarget === "self" && styles.targetButtonActive
          )}
          aria-pressed={selectedTarget === "self"}
          onClick={() => onSelectedTargetChange("self")}
        >
          Myself
        </button>
        <button
          type="button"
          className={clsx(
            styles.targetButton,
            selectedTarget === "other" && styles.targetButtonActive
          )}
          aria-pressed={selectedTarget === "other"}
          onClick={() => onSelectedTargetChange("other")}
        >
          Another
        </button>
      </div>
    </div>
  );
}

export default HealingLightActionBody;
