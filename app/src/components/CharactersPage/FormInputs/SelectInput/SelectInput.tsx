import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./SelectInput.module.css";

type SelectInputProps = ComponentPropsWithoutRef<"select"> & {
  compact?: boolean;
  invalid?: boolean;
};

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { className, compact = false, invalid = false, ...props },
  ref
) {
  return (
    <select
      {...props}
      ref={ref}
      aria-invalid={invalid}
      className={clsx(
        styles.select,
        compact && styles.selectCompact,
        invalid && styles.selectInvalid,
        className
      )}
    />
  );
});

export default SelectInput;
