import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ActionButton.module.css";

export type ActionButtonType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type ActionButtonVariant = "FILL" | "OUTLINE" | "GHOST";
export type ActionButtonIconPosition = "left" | "right";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  actionType?: ActionButtonType;
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  iconPosition?: ActionButtonIconPosition;
  trailingBadge?: ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
};

function ActionButton({
  actionType = "INFO",
  variant = "FILL",
  icon,
  iconPosition = "left",
  trailingBadge,
  fullWidth = true,
  iconOnly = false,
  className,
  children,
  type = "button",
  ...buttonProps
}: ActionButtonProps) {
  const hasText = !iconOnly && children !== undefined && children !== null;
  const iconNode = icon ? <span className={styles.icon}>{icon}</span> : null;

  return (
    <button
      {...buttonProps}
      type={type}
      className={clsx(
        styles.button,
        styles[`type${actionType}`],
        styles[`variant${variant}`],
        fullWidth ? styles.fullWidth : styles.autoWidth,
        iconOnly && styles.iconOnly,
        className
      )}
    >
      <span className={styles.content}>
        {iconPosition === "left" ? iconNode : null}
        {hasText ? <span className={styles.label}>{children}</span> : null}
        {iconPosition === "right" ? iconNode : null}
        {trailingBadge ? <span className={styles.trailingBadge}>{trailingBadge}</span> : null}
      </span>
    </button>
  );
}

export default ActionButton;
