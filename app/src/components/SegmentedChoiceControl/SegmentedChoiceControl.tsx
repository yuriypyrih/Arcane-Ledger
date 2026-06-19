import clsx from "clsx";
import styles from "./SegmentedChoiceControl.module.css";

export type SegmentedChoiceOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SegmentedChoiceControlProps = {
  ariaLabel: string;
  value: string;
  options: readonly SegmentedChoiceOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

function SegmentedChoiceControl({
  ariaLabel,
  value,
  options,
  onValueChange,
  disabled = false,
  className
}: SegmentedChoiceControlProps) {
  return (
    <div
      className={clsx(styles.root, className)}
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        gridTemplateColumns: `repeat(${Math.max(1, options.length)}, minmax(0, 1fr))`
      }}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled === true;

        return (
          <button
            key={option.value}
            type="button"
            className={clsx(styles.option, isSelected ? styles.optionSelected : null)}
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedChoiceControl;
