import clsx from "clsx";
import { X } from "lucide-react";
import { createElement, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Overlay.module.css";

type OverlayContainerProps = {
  children: ReactNode;
  className?: string;
};

type OverlayTitleProps = OverlayContainerProps & {
  as?: "h2" | "h3" | "h4";
  id?: string;
};

type OverlayCloseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  label: string;
};

export function OverlayHeader({ children, className }: OverlayContainerProps) {
  return <div className={clsx(styles.header, className)}>{children}</div>;
}

export function OverlayHeaderContent({ children, className }: OverlayContainerProps) {
  return <div className={clsx(styles.headerContent, className)}>{children}</div>;
}

export function OverlayBadge({ children, className }: OverlayContainerProps) {
  return <p className={clsx(styles.badge, className)}>{children}</p>;
}

export function OverlayEyebrow({ children, className }: OverlayContainerProps) {
  return <p className={clsx(styles.eyebrow, className)}>{children}</p>;
}

export function OverlayTitleRow({ children, className }: OverlayContainerProps) {
  return <div className={clsx(styles.titleRow, className)}>{children}</div>;
}

export function OverlayTitle({
  as = "h3",
  children,
  className,
  ...headingProps
}: OverlayTitleProps) {
  return createElement(
    as,
    {
      className: clsx(styles.title, className),
      ...headingProps
    },
    children
  );
}

export function OverlaySummary({ children, className }: OverlayContainerProps) {
  return <p className={clsx(styles.summary, className)}>{children}</p>;
}

export function OverlayCloseButton({
  className,
  label,
  ...buttonProps
}: OverlayCloseButtonProps) {
  return (
    <button
      type="button"
      className={clsx(styles.closeButton, className)}
      aria-label={label}
      {...buttonProps}
    >
      <X size={18} />
    </button>
  );
}

export function OverlayBody({ children, className }: OverlayContainerProps) {
  return <div className={clsx(styles.body, className)}>{children}</div>;
}

export function OverlayDetailsGrid({ children, className }: OverlayContainerProps) {
  return <div className={clsx(styles.detailsGrid, className)}>{children}</div>;
}
