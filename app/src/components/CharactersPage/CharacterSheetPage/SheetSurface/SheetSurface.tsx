import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./SheetSurface.module.css";

export type SheetSurfaceBorderSize = "xm" | "sm" | "md" | "lg" | "xl";
export type SheetSurfaceBorderStrength = "strong" | "light";
export type SheetSurfaceTexturePosition = "right" | "center";
type SheetSurfaceTextureIcon = LucideIcon | string;

type SheetSurfaceOwnProps<T extends ElementType = "div"> = {
  as?: T;
  borderSize?: SheetSurfaceBorderSize;
  borderStrength?: SheetSurfaceBorderStrength;
  hasBorder?: boolean;
  hoverBorder?: boolean;
  textureIcon?: SheetSurfaceTextureIcon;
  texturePosition?: SheetSurfaceTexturePosition;
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

const borderStrengthClassNames: Record<SheetSurfaceBorderStrength, string> = {
  strong: styles.borderStrong,
  light: styles.borderLight
};

const texturePositionClassNames: Record<SheetSurfaceTexturePosition, string> = {
  right: styles.textureIconRight,
  center: styles.textureIconCenter
};

function SheetSurface<T extends ElementType = "div">({
  as,
  borderSize = "md",
  borderStrength = "strong",
  hasBorder = false,
  hoverBorder = false,
  textureIcon: TextureIcon,
  texturePosition = "right",
  className,
  children,
  ...props
}: SheetSurfaceProps<T>) {
  const Component = as ?? "div";
  const isNativeButton = Component === "button";

  return (
    <Component
      className={clsx(
        styles.root,
        isNativeButton && styles.buttonRoot,
        borderSizeClassNames[borderSize],
        borderStrengthClassNames[borderStrength],
        hoverBorder && styles.hoverTint,
        hasBorder && styles.hasBorder,
        TextureIcon && styles.hasTexture,
        className
      )}
      {...props}
    >
      {typeof TextureIcon === "string" ? (
        <img
          src={TextureIcon}
          alt=""
          className={clsx(styles.textureIcon, texturePositionClassNames[texturePosition])}
          aria-hidden="true"
        />
      ) : TextureIcon ? (
        <TextureIcon
          aria-hidden="true"
          className={clsx(styles.textureIcon, texturePositionClassNames[texturePosition])}
          focusable={false}
          strokeWidth={1.45}
        />
      ) : null}
      {children}
    </Component>
  );
}

export default SheetSurface;
