import clsx from "clsx";
import {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent
} from "react";
import {
  getDefaultNumberInputMode,
  isNumberInputOutOfRange,
  normalizeNumberInputOnBlur,
  normalizeNumberInputDuringEdit
} from "./numberInputBehavior";
import styles from "./NumberInput.module.css";

type NumberInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  invalid?: boolean;
};

function getInputRawValue(
  value: NumberInputProps["value"] | NumberInputProps["defaultValue"]
): string {
  return typeof value === "number" || typeof value === "string" ? String(value) : "";
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    className,
    defaultValue,
    inputMode,
    invalid = false,
    max,
    min,
    onBlur,
    onChange,
    step,
    value,
    ...props
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rangeInvalidFromProps = isNumberInputOutOfRange(
    getInputRawValue(value ?? defaultValue),
    min,
    max
  );
  const hasInvalidState = invalid || rangeInvalidFromProps;

  useEffect(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const rangeInvalid = isNumberInputOutOfRange(input.value, min, max);
    input.setAttribute("aria-invalid", invalid || rangeInvalid ? "true" : "false");

    if (rangeInvalid) {
      input.dataset.rangeInvalid = "true";
      return;
    }

    delete input.dataset.rangeInvalid;
  }, [defaultValue, invalid, max, min, value]);

  function setInputRef(node: HTMLInputElement | null) {
    inputRef.current = node;

    if (typeof ref === "function") {
      ref(node);
      return;
    }

    if (ref) {
      ref.current = node;
    }
  }

  function syncInputValidityAttributes(input: HTMLInputElement) {
    const rangeInvalid = isNumberInputOutOfRange(input.value, min, max);
    input.setAttribute("aria-invalid", invalid || rangeInvalid ? "true" : "false");

    if (rangeInvalid) {
      input.dataset.rangeInvalid = "true";
      return;
    }

    delete input.dataset.rangeInvalid;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const normalizedValue = normalizeNumberInputDuringEdit(input.value);

    if (normalizedValue !== input.value) {
      input.value = normalizedValue;
    }

    syncInputValidityAttributes(input);
    onChange?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const normalizedValue = normalizeNumberInputOnBlur(input.value);

    if (normalizedValue !== input.value) {
      input.value = normalizedValue;
    }

    syncInputValidityAttributes(input);
    onBlur?.(event);
  }

  return (
    <input
      {...props}
      ref={setInputRef}
      type="number"
      defaultValue={defaultValue}
      inputMode={inputMode ?? getDefaultNumberInputMode(step)}
      min={min}
      max={max}
      step={step}
      value={value}
      onBlur={handleBlur}
      onChange={handleChange}
      aria-invalid={hasInvalidState}
      className={clsx(styles.input, hasInvalidState && styles.inputInvalid, className)}
    />
  );
});

export default NumberInput;
