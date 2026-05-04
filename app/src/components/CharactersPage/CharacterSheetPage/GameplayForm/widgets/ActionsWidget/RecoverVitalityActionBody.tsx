import SelectInput from "../../../../FormInputs/SelectInput";
import styles from "./HealingLightActionBody.module.css";

type RecoverVitalityActionBodyProps = {
  remainingDice: number;
  selectedDiceCount: number;
  onSelectedDiceCountChange: (diceCount: number) => void;
};

function RecoverVitalityActionBody({
  remainingDice,
  selectedDiceCount,
  onSelectedDiceCountChange
}: RecoverVitalityActionBodyProps) {
  const maxSelectableDice = Math.min(10, remainingDice);
  const diceOptions = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <div className={styles.body}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>d10</span>
        <SelectInput
          className={styles.select}
          value={String(selectedDiceCount)}
          disabled={maxSelectableDice <= 0}
          onChange={(event) => onSelectedDiceCountChange(Number(event.target.value) || 1)}
        >
          {diceOptions.map((diceCount) => (
            <option
              key={`recover-vitality-${diceCount}`}
              value={diceCount}
              disabled={diceCount > maxSelectableDice}
            >
              {diceCount}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}

export default RecoverVitalityActionBody;
