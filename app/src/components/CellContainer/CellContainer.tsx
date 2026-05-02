import clsx from "clsx";
import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode
} from "react";
import SheetSurface from "../CharactersPage/CharacterSheetPage/SheetSurface";
import styles from "./CellContainer.module.css";

type CellContainerBaseProps = {
  label: ReactNode;
  content?: ReactNode;
  breakdown?: ReactNode;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
  breakdownClassName?: string;
  contentRowClassName?: string;
};

type CellContainerProps =
  | (CellContainerBaseProps & {
      as?: "div";
    } & Omit<HTMLAttributes<HTMLDivElement>, "content">)
  | (CellContainerBaseProps & {
      as: "button";
    } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "content">);

function CellContainer(props: CellContainerProps) {
  const {
    as = "div",
    label,
    content,
    breakdown,
    className,
    labelClassName,
    contentClassName,
    breakdownClassName,
    contentRowClassName,
    ...elementProps
  } = props as CellContainerProps & { as: "div" | "button" };

  return (
    <SheetSurface
      as={as}
      borderSize="md"
      hoverBorder={as === "button"}
      className={clsx(styles.root, as === "button" && styles.buttonRoot, className)}
      {...elementProps}
    >
      <div className={clsx(styles.label, labelClassName)}>{label}</div>
      {content !== undefined || breakdown !== undefined ? (
        <div className={clsx(styles.contentRow, contentRowClassName)}>
          {content !== undefined ? (
            <div className={clsx(styles.content, contentClassName)}>{content}</div>
          ) : null}
          {breakdown !== undefined ? (
            <div className={clsx(styles.breakdown, breakdownClassName)}>{breakdown}</div>
          ) : null}
        </div>
      ) : null}
    </SheetSurface>
  );
}

export default CellContainer;
