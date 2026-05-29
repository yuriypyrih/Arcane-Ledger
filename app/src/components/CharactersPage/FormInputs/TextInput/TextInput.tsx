import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { DEFAULT_TEXT_INPUT_MAX_LENGTH } from "../../../../constants/inputLimits";
import styles from "./TextInput.module.css";

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
  invalid?: boolean;
};

const TEXT_LIKE_INPUT_TYPES = new Set(["text", "search", "email", "password", "url", "tel"]);
const NUMBER_LIKE_INPUT_MODES = new Set(["numeric", "decimal"]);

function getDefaultMaxLength(
  type: ComponentPropsWithoutRef<"input">["type"],
  inputMode: ComponentPropsWithoutRef<"input">["inputMode"]
) {
  if (inputMode && NUMBER_LIKE_INPUT_MODES.has(inputMode)) {
    return undefined;
  }

  const normalizedType = String(type ?? "text").toLowerCase();

  return TEXT_LIKE_INPUT_TYPES.has(normalizedType) ? DEFAULT_TEXT_INPUT_MAX_LENGTH : undefined;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, inputMode, invalid = false, maxLength, type, ...props },
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      type={type ?? "text"}
      inputMode={inputMode}
      maxLength={maxLength ?? getDefaultMaxLength(type, inputMode)}
      aria-invalid={invalid}
      className={clsx(styles.input, invalid && styles.inputInvalid, className)}
    />
  );
});

export default TextInput;
