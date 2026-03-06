import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./NumberInput.module.css";

type NumberInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  invalid?: boolean;
};

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { className, inputMode = "numeric", invalid = false, ...props },
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      type="number"
      inputMode={inputMode}
      aria-invalid={invalid}
      className={clsx(styles.input, invalid && styles.inputInvalid, className)}
    />
  );
});

export default NumberInput;
