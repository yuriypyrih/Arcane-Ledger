import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import styles from "./SheetSurface.module.css";

export type SheetSurfaceBorderSize = "xm" | "sm" | "md" | "lg" | "xl";

type SheetSurfaceOwnProps<T extends ElementType = "div"> = {
  as?: T;
  borderSize?: SheetSurfaceBorderSize;
  hoverBorder?: boolean;
  className?: string;
  children?: ReactNode;
};

export type SheetSurfaceProps<T extends ElementType = "div"> = SheetSurfaceOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SheetSurfaceOwnProps<T>>;

const borderSizeClassNames: Record<SheetSurfaceBorderSize, string> = {
  xm: styles.borderXm,
  sm: styles.borderSm,
  md: styles.borderMd,
  lg: styles.borderLg,
  xl: styles.borderXl
};

function SheetSurface<T extends ElementType = "div">({
  as,
  borderSize = "md",
  hoverBorder = false,
  className,
  children,
  ...props
}: SheetSurfaceProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={clsx(
        styles.root,
        borderSizeClassNames[borderSize],
        hoverBorder && styles.hoverBorder,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default SheetSurface;
