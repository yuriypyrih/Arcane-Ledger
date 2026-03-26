import clsx from "clsx";
import type { CSSProperties } from "react";
import type { ActionShapeType } from "./actionShapeUtils";
import styles from "./ActionShape.module.css";

type ActionShapeProps = {
  shape: ActionShapeType;
  isSelected: boolean;
  multiCount?: number;
  onSelect?: () => void;
  className?: string;
  shapeClassName?: string;
  size?: "default" | "small";
  title?: string;
  "aria-label"?: string;
  style?: CSSProperties;
};

function ActionShape({
  shape,
  isSelected,
  multiCount = 0,
  onSelect,
  className,
  shapeClassName,
  size = "default",
  title,
  style,
  "aria-label": ariaLabel
}: ActionShapeProps) {
  const resolvedMultiCount = Math.max(0, Math.floor(multiCount));
  const showMulti = !isSelected && resolvedMultiCount > 0;

  function renderShape(elementClassName: string) {
    if (shape === "action") {
      return <circle cx="12" cy="12" r="8.75" className={elementClassName} />;
    }

    if (shape === "bonusAction") {
      return <path d="M12 4.5 20 18.75H4Z" className={elementClassName} />;
    }

    return (
      <path
        d="M12 2.5 15.45 8.55 21.5 12 15.45 15.45 12 21.5 8.55 15.45 2.5 12 8.55 8.55Z"
        className={elementClassName}
      />
    );
  }

  const shapeNode = (
    <svg viewBox="0 0 24 24" className={clsx(styles.shapeSvg, shapeClassName)} aria-hidden="true">
      {renderShape(styles.backdropElement)}
      {renderShape(styles.shapeElement)}
      {showMulti ? (
        <g className={styles.multiGroup}>{renderShape(styles.multiShapeElement)}</g>
      ) : null}
    </svg>
  );

  const sharedClassName = clsx(
    styles.root,
    styles[shape],
    isSelected && styles.selected,
    showMulti && styles.multi,
    size === "small" && styles.small,
    className
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={clsx(sharedClassName, styles.button)}
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={ariaLabel}
        title={title}
        style={style}
      >
        {shapeNode}
      </button>
    );
  }

  return (
    <span
      className={sharedClassName}
      aria-label={ariaLabel}
      title={title}
      style={style}
      role={ariaLabel ? "img" : undefined}
    >
      {shapeNode}
      {showMulti && resolvedMultiCount >= 2 ? (
        <span className={styles.multiCountLabel}>{`${resolvedMultiCount}`}</span>
      ) : null}
    </span>
  );
}

export default ActionShape;
