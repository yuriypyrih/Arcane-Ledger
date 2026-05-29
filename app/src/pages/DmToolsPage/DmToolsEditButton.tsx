import { Pencil } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import shared from "../../components/CharactersPage/CharacterSheetPage/CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";

type DmToolsEditButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children?: ReactNode;
};

function getClassName(className?: string) {
  return className ? `${shared.editButton} ${className}` : shared.editButton;
}

function DmToolsEditButton({
  children = "Edit",
  className,
  type = "button",
  ...buttonProps
}: DmToolsEditButtonProps) {
  return (
    <button type={type} className={getClassName(className)} {...buttonProps}>
      <Pencil size={16} aria-hidden="true" />
      {children}
    </button>
  );
}

export default DmToolsEditButton;
