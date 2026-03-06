import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./SelectInput.module.css";

type SelectInputProps = ComponentPropsWithoutRef<"select"> & {
  invalid?: boolean;
};

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <select
      {...props}
      ref={ref}
      aria-invalid={invalid}
      className={clsx(styles.select, invalid && styles.selectInvalid, className)}
    />
  );
});

export default SelectInput;
