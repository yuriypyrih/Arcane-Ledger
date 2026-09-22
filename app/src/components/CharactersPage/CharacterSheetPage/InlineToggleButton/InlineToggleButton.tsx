import clsx from "clsx";
import type { ReactNode } from "react";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetReferenceButton from "../SheetReferenceButton";

type InlineToggleButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
  expanded?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  readOnlyInteractive?: boolean;
};

function InlineToggleButton({
  label,
  onClick,
  className,
  expanded,
  icon,
  disabled = false,
  readOnlyInteractive = false
}: InlineToggleButtonProps) {
  const Button = readOnlyInteractive ? SheetReferenceButton : "button";
  return (
    <Button
      type="button"
      className={clsx(shared.inlineToggleButton, className)}
      onClick={onClick}
      aria-expanded={expanded}
      disabled={disabled}
    >
      {icon ? <span className={shared.inlineToggleIcon}>{icon}</span> : null}
      <span className={shared.inlineToggleLabel}>{label}</span>
    </Button>
  );
}

export default InlineToggleButton;
