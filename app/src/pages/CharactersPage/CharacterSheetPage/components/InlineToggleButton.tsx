import clsx from "clsx";
import shared from "./CharacterSheetSectionShared.module.css";

type InlineToggleButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
  expanded?: boolean;
  disabled?: boolean;
};

function InlineToggleButton({
  label,
  onClick,
  className,
  expanded,
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
      {label}
    </button>
  );
}

export default InlineToggleButton;
