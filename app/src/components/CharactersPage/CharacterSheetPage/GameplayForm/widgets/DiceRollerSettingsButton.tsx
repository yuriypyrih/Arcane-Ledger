import clsx from "clsx";
import { Cog } from "lucide-react";
import { useState, type ReactNode } from "react";
import ActionButton from "../../../../ActionButton";
import { useAppSelector } from "../../../../../store";
import DiceRollerSettingsModal from "./DiceRollerSettingsModal";
import styles from "./DiceRollerSettingsButton.module.css";

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
  const nextRollCriticalHitOverride = useAppSelector(
    (state) => state.diceRoller.nextRollCriticalHitOverride
  );
  const nextRollModeOverride = useAppSelector((state) => state.diceRoller.nextRollModeOverride);
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
      <ActionButton
        className={clsx(
          styles.button,
          !children && styles.iconButton,
          className,
          nextRollCriticalHitOverride && styles.overrideCritical,
          nextRollModeOverride === "advantage" && styles.overrideAdvantage,
          nextRollModeOverride === "disadvantage" && styles.overrideDisadvantage,
          nextRollModeOverride === "normal" && styles.overrideNormal
        )}
        onClick={() => setModalOpen(true)}
        aria-label={ariaLabel}
        icon={children ? undefined : <Cog size={iconSize} />}
        iconOnly={!children}
        fullWidth={Boolean(children)}
      >
        {children}
      </ActionButton>
      {isModalOpen ? (
        <DiceRollerSettingsModal actionName={actionName} onClose={() => setModalOpen(false)} />
      ) : null}
    </>
  );
}

export default DiceRollerSettingsButton;
