import clsx from "clsx";
import type { ReactNode } from "react";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";

type InlineToggleButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
  expanded?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
};

function InlineToggleButton({
  label,
  onClick,
  className,
  expanded,
  icon,
  disabled = false
}: InlineToggleButtonProps) {
  return (
    <button
      type="button"
      className={clsx(shared.inlineToggleButton, className)}
      onClick={onClick}
      aria-expanded={expanded}
      disabled={disabled}
    >
      {icon ? <span className={shared.inlineToggleIcon}>{icon}</span> : null}
      <span className={shared.inlineToggleLabel}>{label}</span>
    </button>
  );
}

export default InlineToggleButton;
