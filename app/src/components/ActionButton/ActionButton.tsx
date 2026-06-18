import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ActionButton.module.css";

export type ActionButtonType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type ActionButtonVariant = "FILL" | "OUTLINE" | "GHOST";
export type ActionButtonIconPosition = "left" | "right";
export type ActionButtonSize = "md" | "sm";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  actionType?: ActionButtonType;
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  iconPosition?: ActionButtonIconPosition;
  trailingBadge?: ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  size?: ActionButtonSize;
};

function ActionButton({
  actionType = "INFO",
  variant = "FILL",
  icon,
  iconPosition = "left",
  trailingBadge,
  fullWidth = true,
  iconOnly = false,
  loading = false,
  loadingLabel = "Loading",
  size = "md",
  className,
  children,
  disabled,
  type = "button",
  ...buttonProps
}: ActionButtonProps) {
  const hasText = !iconOnly && children !== undefined && children !== null;
  const iconNode = icon ? <span className={styles.icon}>{icon}</span> : null;
  const isDisabled = disabled || loading;

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={clsx(
        styles.button,
        styles[`type${actionType}`],
        styles[`variant${variant}`],
        styles[`size${size.toUpperCase()}`],
        fullWidth ? styles.fullWidth : styles.autoWidth,
        iconOnly && styles.iconOnly,
        loading && styles.loading,
        className
      )}
    >
      <span className={clsx(styles.content, loading && styles.contentLoading)}>
        {iconPosition === "left" ? iconNode : null}
        {hasText ? <span className={styles.label}>{children}</span> : null}
        {iconPosition === "right" ? iconNode : null}
        {trailingBadge ? <span className={styles.trailingBadge}>{trailingBadge}</span> : null}
      </span>
      {loading ? (
        <span className={styles.loadingIndicator} role="status">
          <LoaderCircle size={18} aria-hidden="true" />
          <span className={styles.visuallyHidden}>{loadingLabel}</span>
        </span>
      ) : null}
    </button>
  );
}

export default ActionButton;
