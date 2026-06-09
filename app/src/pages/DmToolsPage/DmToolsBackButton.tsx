import { ArrowLeft } from "lucide-react";
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
      <ArrowLeft size={14} aria-hidden="true" />
      <span>{children}</span>
    </button>
  );
}

export default DmToolsBackButton;
