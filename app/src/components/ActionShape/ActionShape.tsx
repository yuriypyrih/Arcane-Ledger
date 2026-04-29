import clsx from "clsx";
import type { CSSProperties } from "react";
import { Diamond } from "lucide-react";
import { useId } from "react";
import type { ActionShapeType } from "./actionShapeUtils";
import styles from "./ActionShape.module.css";

type ActionShapeProps = {
  shape: ActionShapeType;
  isSelected: boolean;
  multiCount?: number;
  showMultiCountLabel?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
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
  showMultiCountLabel = true,
  onSelect,
  disabled = false,
  className,
  shapeClassName,
  size = "default",
  title,
  style,
  "aria-label": ariaLabel
}: ActionShapeProps) {
  const halfFillClipPathId = useId().replace(/:/g, "");
  const isNonCombatShape = shape === "nonCombat";
  const resolvedIsSelected = isNonCombatShape ? true : isSelected;
  const resolvedMultiCount = Math.max(0, Math.floor(multiCount));
  const showMulti = !isNonCombatShape && !resolvedIsSelected && resolvedMultiCount > 0;
  const usesHalfFill = showMulti && (shape === "bonusAction" || shape === "reaction");

  function renderShape(elementClassName: string, extraProps?: { clipPath?: string }) {
    if (shape === "action") {
      return <circle cx="12" cy="12" r="8.75" className={elementClassName} {...extraProps} />;
    }

    if (shape === "bonusAction") {
      return <path d="M12 4.5 20 18.75H4Z" className={elementClassName} {...extraProps} />;
    }

    return (
      <path
        d="M12 2.5 15.45 8.55 21.5 12 15.45 15.45 12 21.5 8.55 15.45 2.5 12 8.55 8.55Z"
        className={elementClassName}
        {...extraProps}
      />
    );
  }

  const shapeNode = isNonCombatShape ? (
    <Diamond className={clsx(styles.lucideShape, shapeClassName)} aria-hidden="true" />
  ) : (
    <svg viewBox="0 0 24 24" className={clsx(styles.shapeSvg, shapeClassName)} aria-hidden="true">
      {usesHalfFill ? (
        <defs>
          <clipPath id={halfFillClipPathId}>
            <rect x="0" y={shape === "bonusAction" ? "13.5" : "12"} width="24" height="12" />
          </clipPath>
        </defs>
      ) : null}
      {renderShape(styles.backdropElement)}
      {usesHalfFill ? (
        renderShape(styles.partialFillElement, {
          clipPath: `url(#${halfFillClipPathId})`
        })
      ) : showMulti ? (
        <g className={styles.multiGroup}>{renderShape(styles.multiShapeElement)}</g>
      ) : null}
      {renderShape(styles.shapeElement)}
    </svg>
  );

  const sharedClassName = clsx(
    styles.root,
    styles[shape],
    resolvedIsSelected && styles.selected,
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
        disabled={disabled}
        aria-pressed={resolvedIsSelected}
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
      {showMulti && showMultiCountLabel && resolvedMultiCount >= 2 ? (
        <span className={styles.multiCountLabel}>{`${resolvedMultiCount}`}</span>
      ) : null}
    </span>
  );
}

export default ActionShape;
