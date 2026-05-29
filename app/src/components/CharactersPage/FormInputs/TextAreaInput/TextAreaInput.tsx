import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../../../../constants/inputLimits";
import styles from "./TextAreaInput.module.css";

type TextAreaInputProps = ComponentPropsWithoutRef<"textarea"> & {
  invalid?: boolean;
};

const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaInputProps>(function TextAreaInput(
  { className, invalid = false, maxLength, ...props },
  ref
) {
  return (
    <textarea
      {...props}
      ref={ref}
      maxLength={maxLength ?? DEFAULT_TEXTAREA_MAX_LENGTH}
      aria-invalid={invalid}
      className={clsx(styles.textarea, invalid && styles.textareaInvalid, className)}
    />
  );
});

export default TextAreaInput;
