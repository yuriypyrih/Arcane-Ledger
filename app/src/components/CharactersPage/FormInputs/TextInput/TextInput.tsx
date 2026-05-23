import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./TextInput.module.css";

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
  invalid?: boolean;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      type={props.type ?? "text"}
      aria-invalid={invalid}
      className={clsx(styles.input, invalid && styles.inputInvalid, className)}
    />
  );
});

export default TextInput;
