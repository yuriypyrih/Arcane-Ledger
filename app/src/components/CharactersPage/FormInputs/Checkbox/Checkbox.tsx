import clsx from "clsx";
import type { ChangeEvent, ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from "react";
import type { ActionButtonType } from "../../../ActionButton";
import styles from "./Checkbox.module.css";

type CheckboxRootElement = "label" | "span";
type CheckboxRootProps = HTMLAttributes<HTMLElement> & {
  [key: `data-${string}`]: string | undefined;
};

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "className" | "type"> & {
  actionType?: ActionButtonType;
  compact?: boolean;
  inputClassName?: string;
  label?: ReactNode;
  markerClassName?: string;
  onCheckedChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  rootAs?: CheckboxRootElement;
  rootProps?: CheckboxRootProps;
  textClassName?: string;
  className?: string;
};

function Checkbox({
  actionType = "INFO",
  checked,
  className,
  compact = false,
  disabled = false,
  inputClassName,
  label,
  markerClassName,
  onChange,
  onCheckedChange,
  rootAs,
  rootProps,
  textClassName,
  ...inputProps
}: CheckboxProps) {
  const Root = rootAs ?? (label ? "label" : "span");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    onCheckedChange?.(event.target.checked, event);
  }

  return (
    <Root
      {...rootProps}
      className={clsx(
        styles.root,
        styles[`type${actionType}`],
        compact && styles.compact,
        disabled && styles.disabled,
        className,
        rootProps?.className
      )}
    >
      <span className={clsx(styles.control, markerClassName)}>
        <input
          {...inputProps}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className={clsx(styles.input, inputClassName)}
        />
        <span className={styles.box} aria-hidden="true" />
      </span>
      {label !== undefined && label !== null ? (
        <span className={clsx(styles.text, textClassName)}>{label}</span>
      ) : null}
    </Root>
  );
}

export default Checkbox;
