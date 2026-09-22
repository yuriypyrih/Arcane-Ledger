import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import ActionButton from "../../ActionButton";
import NumberInput from "./NumberInput";
import styles from "./NumberStepper.module.css";

type Props = {
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  editable?: boolean;
  readOnly?: boolean;
};

export default function NumberStepper({
  label,
  decreaseLabel,
  increaseLabel,
  value,
  min,
  max,
  onChange,
  editable = false,
  readOnly = false
}: Props) {
  // Buttons must not share a <label>: hovering that label also hovers its associated controls.
  return (
    <div className={styles.stepper}>
      <ActionButton
        className={styles.button}
        variant="OUTLINE"
        size="sm"
        fullWidth={false}
        iconOnly
        icon={editable ? <Minus size={14} /> : <ChevronDown size={16} />}
        aria-label={decreaseLabel}
        disabled={readOnly || value <= min}
        onClick={() => onChange(value - 1)}
      />
      {editable ? (
        <NumberInput
          className={styles.input}
          aria-label={label}
          min={min}
          max={max}
          value={value}
          readOnly={readOnly}
          onChange={(event) =>
            onChange(
              Math.max(min, Math.min(max, Math.floor(event.currentTarget.valueAsNumber || min)))
            )
          }
        />
      ) : (
        <output className={styles.value} aria-label={label}>
          {value}
        </output>
      )}
      <ActionButton
        className={styles.button}
        variant="OUTLINE"
        size="sm"
        fullWidth={false}
        iconOnly
        icon={editable ? <Plus size={14} /> : <ChevronUp size={16} />}
        aria-label={increaseLabel}
        disabled={readOnly || value >= max}
        onClick={() => onChange(value + 1)}
      />
    </div>
  );
}
