import clsx from "clsx";
import { Cog } from "lucide-react";
import { useState, type ReactNode } from "react";
import DiceRollerSettingsModal from "./DiceRollerSettingsModal";

type DiceRollerSettingsButtonProps = {
  actionName: string;
  className?: string;
  iconSize?: number;
  ariaLabel?: string;
  children?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function DiceRollerSettingsButton({
  actionName,
  className,
  iconSize = 18,
  ariaLabel = "Open dice roller settings",
  children,
  isOpen,
  onOpenChange
}: DiceRollerSettingsButtonProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof isOpen === "boolean";
  const isModalOpen = isControlled ? isOpen : internalIsOpen;

  function setModalOpen(nextIsOpen: boolean) {
    if (!isControlled) {
      setInternalIsOpen(nextIsOpen);
    }

    onOpenChange?.(nextIsOpen);
  }

  return (
    <>
      <button
        type="button"
        className={clsx(className)}
        onClick={() => setModalOpen(true)}
        aria-label={ariaLabel}
      >
        {children ?? <Cog size={iconSize} />}
      </button>
      {isModalOpen ? (
        <DiceRollerSettingsModal actionName={actionName} onClose={() => setModalOpen(false)} />
      ) : null}
    </>
  );
}

export default DiceRollerSettingsButton;
