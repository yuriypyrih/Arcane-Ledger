import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./TextAreaInput.module.css";

type TextAreaInputProps = ComponentPropsWithoutRef<"textarea"> & {
  invalid?: boolean;
};

const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaInputProps>(function TextAreaInput(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <textarea
      {...props}
      ref={ref}
      aria-invalid={invalid}
      className={clsx(styles.textarea, invalid && styles.textareaInvalid, className)}
    />
  );
});

export default TextAreaInput;
