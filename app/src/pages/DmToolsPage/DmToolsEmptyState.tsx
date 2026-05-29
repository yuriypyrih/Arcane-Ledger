import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./DmToolsPage.module.css";

type EmptyStateContentProps = {
  children: ReactNode;
  icon: ReactNode;
};

type DmToolsEmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  EmptyStateContentProps;

type DmToolsEmptyActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  EmptyStateContentProps;

function getClassName(baseClassName: string, className?: string) {
  return className ? `${baseClassName} ${className}` : baseClassName;
}

function DmToolsEmptyState({ children, className, icon, ...divProps }: DmToolsEmptyStateProps) {
  return (
    <div className={getClassName(styles.emptyState, className)} {...divProps}>
      <span className={styles.emptyStateIcon}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export function DmToolsEmptyAction({
  children,
  className,
  icon,
  type = "button",
  ...buttonProps
}: DmToolsEmptyActionProps) {
  return (
    <button
      type={type}
      className={getClassName(styles.emptyActionState, className)}
      {...buttonProps}
    >
      <span className={styles.emptyStateIcon}>{icon}</span>
      <span>{children}</span>
    </button>
  );
}

export default DmToolsEmptyState;
