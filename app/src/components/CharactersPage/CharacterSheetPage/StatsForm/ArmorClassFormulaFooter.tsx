import type { ChangeEvent } from "react";
import SelectInput from "../../FormInputs/SelectInput";
import type { ArmorClassFormulaOption } from "../../../../pages/CharactersPage/armor";
import styles from "./StatsForm.module.css";

type ArmorClassFormulaFooterProps = {
  formulas: ArmorClassFormulaOption[];
  selectedFormulaKey: string;
  onFormulaChange: (formulaKey: string) => void;
};

function ArmorClassFormulaFooter({
  formulas,
  selectedFormulaKey,
  onFormulaChange
}: ArmorClassFormulaFooterProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onFormulaChange(event.target.value);
  }

  return (
    <div className={styles.referenceFooterStack}>
      <label className={styles.referenceSelectField}>
        <span className={styles.referenceSelectLabel}>Armor Class Formula</span>
        <SelectInput value={selectedFormulaKey} onChange={handleChange}>
          {formulas.map((formula) => (
            <option key={formula.key} value={formula.key}>
              {formula.selectorLabel}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}

export default ArmorClassFormulaFooter;
