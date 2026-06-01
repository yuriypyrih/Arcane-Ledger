import { Trash2 } from "lucide-react";
import SelectInput from "../../../../FormInputs/SelectInput";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import type {
  CharacterCustomTraitRollMode,
  CharacterCustomTraitValueMode
} from "../../../../../../types";
import type { CustomTraitEffectDraft, CustomTraitTargetOption } from "./customTraitDraft";
import {
  customTraitDiceValueOptions,
  doesCustomTraitTargetAllowAbilityValue,
  doesCustomTraitTargetAllowDiceValue,
  isCustomTraitRollModeDisabledTarget
} from "./customTraitDraft";
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

type CustomTraitEffectRollModeToggleProps = {
  effect: CustomTraitEffectDraft;
  onRollModeChange: (value: CharacterCustomTraitRollMode) => void;
};

type CustomTraitEffectValueModeToggleProps = {
  effect: CustomTraitEffectDraft;
  onValueModeChange: (value: CharacterCustomTraitValueMode) => void;
};

const rollModeOptions: Array<{ value: CharacterCustomTraitRollMode; label: string }> = [
  { value: "normal", label: "NORM" },
  { value: "advantage", label: "ADV" },
  { value: "disadvantage", label: "DIS" }
];

const valueModeOptions: Array<{ value: CharacterCustomTraitValueMode; label: string }> = [
  { value: "buff", label: "BUFF" },
  { value: "debuff", label: "DEBUFF" }
];

const valueOptions = [
  ...Array.from({ length: 11 }, (_, value) => ({
    value: String(value),
    label: String(value),
    kind: "flat" as const
  })),
  ...customTraitDiceValueOptions.map((option) => ({
    ...option,
    kind: "dice" as const
  })),
  ...(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map((ability) => ({
    value: ability,
    label: ability,
    kind: "ability" as const
  }))
];

export function CustomTraitEffectValueModeToggle({
  effect,
  onValueModeChange
}: CustomTraitEffectValueModeToggleProps) {
  return (
    <fieldset className={styles.modeGroup} aria-label="Buff or debuff">
      <div className={styles.modeOptions}>
        {valueModeOptions.map((option) => (
          <label key={option.value} className={styles.modeOption}>
            <input
              type="radio"
              name={`value-mode-${effect.id}`}
              value={option.value}
              checked={effect.valueMode === option.value}
              onChange={() => onValueModeChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CustomTraitEffectRollModeToggle({
  effect,
  onRollModeChange
}: CustomTraitEffectRollModeToggleProps) {
  const rollModeDisabled = isCustomTraitRollModeDisabledTarget(effect.target);
  const selectedRollMode = rollModeDisabled ? "normal" : effect.rollMode;

  return (
    <fieldset
      className={styles.rollModeGroup}
      disabled={rollModeDisabled}
      aria-label="Roll mode"
    >
      <div className={styles.modeOptions}>
        {rollModeOptions.map((option) => (
          <label key={option.value} className={styles.modeOption}>
            <input
              type="radio"
              name={`roll-mode-${effect.id}`}
              value={option.value}
              checked={selectedRollMode === option.value}
              onChange={() => onRollModeChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CustomTraitEffectEditorRow({
  effect,
  targetOptions,
  removeDisabled,
  removeLabel,
  onTargetChange,
  onValueChange,
  onRemove
}: CustomTraitEffectEditorRowProps) {
  const allowAbilityValues = doesCustomTraitTargetAllowAbilityValue(effect.target);
  const allowDiceValues = doesCustomTraitTargetAllowDiceValue(effect.target);

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
        <SelectInput value={effect.value} onChange={(event) => onValueChange(event.target.value)}>
          {valueOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={
                (option.kind === "ability" && !allowAbilityValues) ||
                (option.kind === "dice" && !allowDiceValues)
              }
            >
              {option.label}
            </option>
          ))}
        </SelectInput>
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
