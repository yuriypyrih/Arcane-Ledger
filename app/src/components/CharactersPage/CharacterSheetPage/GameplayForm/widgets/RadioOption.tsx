import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./RadioOption.module.css";

type RadioOptionProps = {
  header: ReactNode;
  description?: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  name?: string;
  disabled?: boolean;
  className?: string;
  headerClassName?: string;
  descriptionClassName?: string;
  aside?: ReactNode;
  indicatorType?: "radio" | "checkbox";
};

function RadioOption({
  header,
  description,
  isSelected,
  onSelect,
  name,
  disabled = false,
  className,
  headerClassName,
  descriptionClassName,
  aside,
  indicatorType = "radio"
}: RadioOptionProps) {
  return (
    <div
      className={clsx(
        styles.root,
        isSelected && styles.selected,
        disabled && styles.disabled,
        className
      )}
    >
      <label className={styles.label}>
        <input
          type={indicatorType}
          name={name}
          checked={isSelected}
          disabled={disabled}
          onChange={onSelect}
          className={styles.input}
        />
        <span className={styles.content}>
          <span className={clsx(styles.header, headerClassName)}>{header}</span>
          {description ? (
            <span className={clsx(styles.description, descriptionClassName)}>{description}</span>
          ) : null}
        </span>
      </label>
      {aside ? <div className={styles.aside}>{aside}</div> : null}
    </div>
  );
}

export default RadioOption;
