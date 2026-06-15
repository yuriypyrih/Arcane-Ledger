import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";

type SheetActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function SheetActionButton({
  className,
  type = "button",
  ...buttonProps
}: SheetActionButtonProps) {
  return <button {...buttonProps} type={type} className={clsx(shared.editButton, className)} />;
}

export default SheetActionButton;
