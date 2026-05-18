import { Trash2 } from "lucide-react";
import NumberInput from "../../../../FormInputs/NumberInput";
import SelectInput from "../../../../FormInputs/SelectInput";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import type { CustomTraitEffectDraft, CustomTraitTargetOption } from "./customTraitDraft";
import styles from "./CustomTraitEffectEditorRow.module.css";

type CustomTraitEffectEditorRowProps = {
  effect: CustomTraitEffectDraft;
  targetOptions: CustomTraitTargetOption[];
  removeDisabled: boolean;
  removeLabel: string;
  onTargetChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onRemove: () => void;
};

function CustomTraitEffectEditorRow({
  effect,
  targetOptions,
  removeDisabled,
  removeLabel,
  onTargetChange,
  onValueChange,
  onRemove
}: CustomTraitEffectEditorRowProps) {
  return (
    <div className={styles.row}>
      <label className={shared.field}>
        <span className={shared.fieldLabel}>Target</span>
        <SelectInput value={effect.target} onChange={(event) => onTargetChange(event.target.value)}>
          <option value="">Select a target</option>
          {targetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
      </label>

      <label className={shared.field}>
        <span className={shared.fieldLabel}>Value</span>
        <NumberInput
          value={effect.value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Enter a flat bonus"
        />
      </label>

      <button
        type="button"
        className={styles.removeButton}
        onClick={onRemove}
        disabled={removeDisabled}
        aria-label={removeLabel}
        title={removeLabel}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default CustomTraitEffectEditorRow;
