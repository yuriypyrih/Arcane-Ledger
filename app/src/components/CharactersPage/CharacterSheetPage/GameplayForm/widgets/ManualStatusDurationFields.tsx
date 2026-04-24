import SelectInput from "../../../FormInputs/SelectInput";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import {
  isManualStatusDurationValueDisabled,
  manualStatusDurationTypeOptions,
  manualStatusDurationValueOptions,
  type ManualStatusDurationType
} from "./manualStatusDuration";

type ManualStatusDurationFieldsProps = {
  durationType: ManualStatusDurationType;
  durationValue: number;
  disabled?: boolean;
  onDurationTypeChange: (value: ManualStatusDurationType) => void;
  onDurationValueChange: (value: number) => void;
};

function ManualStatusDurationFields({
  durationType,
  durationValue,
  disabled = false,
  onDurationTypeChange,
  onDurationValueChange
}: ManualStatusDurationFieldsProps) {
  const valueDisabled = disabled || isManualStatusDurationValueDisabled(durationType);

  return (
    <>
      <label className={shared.field}>
        <span className={shared.fieldLabel}>Duration Type</span>
        <SelectInput
          value={durationType}
          disabled={disabled}
          onChange={(event) => onDurationTypeChange(event.target.value as ManualStatusDurationType)}
        >
          {manualStatusDurationTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
      </label>

      <label className={shared.field}>
        <span className={shared.fieldLabel}>Duration Value</span>
        <SelectInput
          value={durationValue}
          disabled={valueDisabled}
          onChange={(event) => onDurationValueChange(Number(event.target.value))}
        >
          {manualStatusDurationValueOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectInput>
      </label>
    </>
  );
}

export default ManualStatusDurationFields;
