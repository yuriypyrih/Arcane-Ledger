import clsx from "clsx";
import { Trash2 } from "lucide-react";
import SelectInput from "../../../../FormInputs/SelectInput";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import type {
  CharacterCustomTraitRollMode,
  CharacterCustomTraitValueMode,
  CharacterCustomTraitWeaponFormulaTarget
} from "../../../../../../types";
import type { CustomTraitEffectDraft, CustomTraitTargetOption } from "./customTraitDraft";
import {
  customTraitWeaponFormulaTargetOptions,
  customTraitDiceValueOptions,
  doesCustomTraitTargetAllowAbilityValue,
  doesCustomTraitTargetAllowDiceValue,
  formatCustomTraitDefenseValueOptionLabel,
  getCustomTraitDefenseValueOptions,
  isCustomTraitEffectRollModeDisabled,
  isCustomTraitDefenseTarget,
  isCustomTraitWeaponTarget,
  normalizeDraftWeaponFormulaTarget
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

type CustomTraitEffectWeaponFormulaTargetToggleProps = {
  effect: CustomTraitEffectDraft;
  onWeaponFormulaTargetChange: (value: CharacterCustomTraitWeaponFormulaTarget) => void;
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

function getModeOptionClassName(value: string, isSelected: boolean) {
  return clsx(
    styles.modeOption,
    isSelected && styles.modeOptionSelected,
    isSelected &&
      (value === "buff" || value === "advantage") &&
      styles.modeOptionPositive,
    isSelected &&
      (value === "debuff" || value === "disadvantage") &&
      styles.modeOptionNegative
  );
}

export function CustomTraitEffectValueModeToggle({
  effect,
  onValueModeChange
}: CustomTraitEffectValueModeToggleProps) {
  return (
    <div className={styles.modeGroup} role="radiogroup" aria-label="Buff or debuff">
      {valueModeOptions.map((option) => {
        const isSelected = effect.valueMode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={getModeOptionClassName(option.value, isSelected)}
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              if (!isSelected) {
                onValueModeChange(option.value);
              }
            }}
          >
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CustomTraitEffectRollModeToggle({
  effect,
  onRollModeChange
}: CustomTraitEffectRollModeToggleProps) {
  const rollModeDisabled = isCustomTraitEffectRollModeDisabled(effect);
  const selectedRollMode = rollModeDisabled ? "normal" : effect.rollMode;

  return (
    <div
      className={clsx(styles.rollModeGroup, rollModeDisabled && styles.rollModeGroupDisabled)}
      role="radiogroup"
      aria-disabled={rollModeDisabled}
      aria-label="Roll mode"
    >
      {rollModeOptions.map((option) => {
        const isSelected = selectedRollMode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={getModeOptionClassName(option.value, isSelected)}
            role="radio"
            aria-checked={isSelected}
            disabled={rollModeDisabled}
            onClick={() => {
              if (!isSelected) {
                onRollModeChange(option.value);
              }
            }}
          >
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CustomTraitEffectWeaponFormulaTargetToggle({
  effect,
  onWeaponFormulaTargetChange
}: CustomTraitEffectWeaponFormulaTargetToggleProps) {
  if (!isCustomTraitWeaponTarget(effect.target)) {
    return null;
  }

  const selectedFormulaTarget = normalizeDraftWeaponFormulaTarget(effect.weaponFormulaTarget);

  return (
    <div className={styles.modeGroup} role="radiogroup" aria-label="Attack or damage formula">
      {customTraitWeaponFormulaTargetOptions.map((option) => {
        const isSelected = selectedFormulaTarget === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={getModeOptionClassName(option.value, isSelected)}
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              if (!isSelected) {
                onWeaponFormulaTargetChange(option.value);
              }
            }}
          >
            <span>{option.label.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
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
  const isDefenseTarget = isCustomTraitDefenseTarget(effect.target);
  const allowAbilityValues = doesCustomTraitTargetAllowAbilityValue(effect.target);
  const allowDiceValues = doesCustomTraitTargetAllowDiceValue(effect.target);
  const defenseValueOptions = isDefenseTarget
    ? getCustomTraitDefenseValueOptions(effect.target)
    : [];

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
          {isDefenseTarget
            ? defenseValueOptions.map((option) => (
                <option key={option} value={option}>
                  {formatCustomTraitDefenseValueOptionLabel(effect.target, option)}
                </option>
              ))
            : valueOptions.map((option) => (
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
