import clsx from "clsx";
import { X } from "lucide-react";
import { createElement, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Overlay.module.css";

type OverlayContainerProps = {
  children: ReactNode;
  className?: string;
};

type OverlayCloseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  label: string;
};

type OverlayDetailCardProps =
  | ({
      as?: "div";
      children: ReactNode;
      className?: string;
    } & HTMLAttributes<HTMLDivElement>)
  | ({
      as: "button";
      children: ReactNode;
      className?: string;
    } & ButtonHTMLAttributes<HTMLButtonElement>);

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

export function OverlayDetailCard(props: OverlayDetailCardProps) {
  const { as = "div", children, className, ...elementProps } = props as OverlayDetailCardProps & {
    as: "div" | "button";
  };

  return createElement(
    as,
    {
      className: clsx(styles.detailCard, className),
      ...elementProps
    },
    children
  );
}

export function OverlayDetailLabel({ children, className }: OverlayContainerProps) {
  return <span className={clsx(styles.detailCardLabel, className)}>{children}</span>;
}
