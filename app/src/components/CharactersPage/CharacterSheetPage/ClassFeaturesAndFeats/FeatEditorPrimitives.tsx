import clsx from "clsx";
import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import type { PendingBlessedWarriorChoice, PendingDruidicWarriorChoice } from "./types";
import modalStyles from "./FeatEditorModal.module.css";

type SelectFieldOption = {
  disabled?: boolean;
  group?: string | null;
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  disabled?: boolean;
  options: SelectFieldOption[];
  onChange: (nextValue: string) => void;
};

type InlineEditorFrameProps = {
  title: string;
  cancelLabel: string;
  onCancel: () => void;
  children: ReactNode;
  footer: ReactNode;
};

type CantripChoiceEditorProps = {
  title: string;
  cancelLabel: string;
  choice: PendingBlessedWarriorChoice | PendingDruidicWarriorChoice;
  options: SpellEntry[];
  summary: string | null;
  isValid: boolean;
  validationMessage: string;
  onCancel: () => void;
  onSave: () => void;
  onChange: (selectionIndex: number, nextValue: string) => void;
};

type SingleAbilityEditorProps = {
  title: string;
  cancelLabel: string;
  label: string;
  summary: string;
  value: string;
  options: string[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextValue: string) => void;
};

export function SelectField({ label, value, disabled, options, onChange }: SelectFieldProps) {
  const ungroupedOptions = options.filter((option) => !option.group);
  const groupedOptions = options.reduce<Array<{ label: string; options: SelectFieldOption[] }>>(
    (groups, option) => {
      if (!option.group) {
        return groups;
      }

      const existingGroup = groups.find((group) => group.label === option.group);

      if (existingGroup) {
        existingGroup.options.push(option);
        return groups;
      }

      return [
        ...groups,
        {
          label: option.group,
          options: [option]
        }
      ];
    },
    []
  );

  return (
    <label className={modalStyles.field}>
      <span>{label}</span>
      <SelectInput
        className={modalStyles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {ungroupedOptions.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {groupedOptions.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </SelectInput>
    </label>
  );
}

export function InlineEditorFrame({
  title,
  cancelLabel,
  onCancel,
  children,
  footer
}: InlineEditorFrameProps) {
  return (
    <section
      className={clsx(modalStyles.editorCard, modalStyles.inlineEditor)}
      role="presentation"
      onClick={(event) => event.stopPropagation()}
    >
      <div className={modalStyles.editorHeader}>
        <p className={modalStyles.selectionTitle}>{title}</p>
        <button
          type="button"
          className={modalStyles.removeButton}
          onClick={onCancel}
          aria-label={cancelLabel}
        >
          <X size={16} />
        </button>
      </div>
      {children}
      {footer}
    </section>
  );
}

export function CantripChoiceEditor({
  title,
  cancelLabel,
  choice,
  options,
  summary,
  isValid,
  validationMessage,
  onCancel,
  onSave,
  onChange
}: CantripChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title={title}
      cancelLabel={cancelLabel}
      onCancel={onCancel}
      footer={
        <div className={modalStyles.editorActions}>
          <ActionButton
            icon={<Plus size={16} />}
            fullWidth={false}
            disabled={!isValid}
            onClick={onSave}
          >
            Add Feat
          </ActionButton>
        </div>
      }
    >
      <div className={modalStyles.singleFieldGrid}>
        {[0, 1].map((selectionIndex) => (
          <SelectField
            key={`${title}-cantrip-${selectionIndex}`}
            label={`Cantrip ${selectionIndex + 1}`}
            value={choice.cantripIds[selectionIndex]}
            options={options.map((spell) => ({
              label: spell.name,
              value: spell.id
            }))}
            onChange={(nextValue) => onChange(selectionIndex, nextValue)}
          />
        ))}
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? <p className={modalStyles.validation}>{validationMessage}</p> : null}
    </InlineEditorFrame>
  );
}

export function SingleAbilityEditor({
  title,
  cancelLabel,
  label,
  summary,
  value,
  options,
  onCancel,
  onSave,
  onChange
}: SingleAbilityEditorProps) {
  return (
    <InlineEditorFrame
      title={title}
      cancelLabel={cancelLabel}
      onCancel={onCancel}
      footer={
        <div className={modalStyles.editorActions}>
          <ActionButton icon={<Plus size={16} />} fullWidth={false} onClick={onSave}>
            Add Feat
          </ActionButton>
        </div>
      }
    >
      <div className={modalStyles.singleFieldGrid}>
        <SelectField
          label={label}
          value={value}
          options={options.map((option) => ({
            label: option,
            value: option
          }))}
          onChange={onChange}
        />
      </div>
      <p className={modalStyles.summary}>{summary}</p>
    </InlineEditorFrame>
  );
}
