import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import styles from "./RadioContainerOption.module.css";

export type RadioContainerOptionProps = {
  header: ReactNode;
  selected: boolean;
  onSelect: () => void;
  headerFollowup?: ReactNode;
  subheader?: ReactNode;
  breakdown?: ReactNode;
  actionBadge?: ReactNode;
  backgroundTexture?: ReactNode;
  aside?: ReactNode;
  asideClassName?: string;
  disabled?: boolean;
  name?: string;
  indicatorType?: "radio" | "checkbox";
  width?: CSSProperties["width"];
  className?: string;
};

function RadioContainerOption({
  header,
  selected,
  onSelect,
  headerFollowup,
  subheader,
  breakdown,
  actionBadge,
  backgroundTexture,
  aside,
  asideClassName,
  disabled = false,
  name,
  indicatorType = "radio",
  width,
  className
}: RadioContainerOptionProps) {
  return (
    <label
      className={clsx(
        styles.root,
        selected && styles.selected,
        disabled && styles.disabled,
        actionBadge && styles.withActionBadge,
        className
      )}
      style={{ width: width ?? "100%" }}
    >
      {backgroundTexture}
      {actionBadge ? (
        <div className={styles.actionBadge} aria-hidden="true">
          {actionBadge}
        </div>
      ) : null}
      <div className={styles.label}>
        <input
          type={indicatorType}
          name={name}
          checked={selected}
          disabled={disabled}
          onChange={onSelect}
          className={styles.input}
        />
        <div className={styles.content}>
          <div className={styles.headerLine}>
            <div className={styles.header}>{header}</div>
            {headerFollowup ? <div className={styles.headerFollowup}>{headerFollowup}</div> : null}
          </div>
          {subheader ? <div className={styles.subheader}>{subheader}</div> : null}
          {breakdown ? <div className={styles.breakdown}>{breakdown}</div> : null}
        </div>
      </div>
      {aside ? <div className={clsx(styles.aside, asideClassName)}>{aside}</div> : null}
    </label>
  );
}

export default RadioContainerOption;
