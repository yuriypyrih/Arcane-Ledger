import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./DmToolsPage.module.css";

type DmToolsBackButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
};

function getClassName(className?: string) {
  return className ? `${styles.backButton} ${className}` : styles.backButton;
}

function DmToolsBackButton({
  children,
  className,
  type = "button",
  ...buttonProps
}: DmToolsBackButtonProps) {
  return (
    <button type={type} className={getClassName(className)} {...buttonProps}>
      {children}
    </button>
  );
}

export default DmToolsBackButton;
