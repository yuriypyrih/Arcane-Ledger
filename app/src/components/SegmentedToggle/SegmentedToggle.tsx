import clsx from "clsx";
import styles from "./SegmentedToggle.module.css";

export type SegmentedToggleOption<TValue extends string = string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

type SegmentedToggleProps<TValue extends string = string> = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onValueChange: (value: TValue) => void;
  options: readonly SegmentedToggleOption<TValue>[];
  value: TValue;
};

function SegmentedToggle<TValue extends string = string>({
  ariaLabel,
  className,
  disabled = false,
  onValueChange,
  options,
  value
}: SegmentedToggleProps<TValue>) {
  return (
    <div className={clsx(styles.root, className)} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled === true;

        return (
          <button
            key={option.value}
            type="button"
            className={clsx(styles.segment, isSelected && styles.segmentSelected)}
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => {
              if (!isSelected) {
                onValueChange(option.value);
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedToggle;
