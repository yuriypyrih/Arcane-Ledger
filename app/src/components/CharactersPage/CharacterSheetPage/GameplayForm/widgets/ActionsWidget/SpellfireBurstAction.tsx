import clsx from "clsx";
import ActionButton from "../../../../../ActionButton";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import ActionFooterButtonRow from "./ActionFooterButtonRow";
import actionStyles from "./ActionsWidget.module.css";
import styles from "./SpellfireBurstAction.module.css";

export type SpellfireBurstTarget = "self" | "other";
export type SpellfireBurstEffect = "bolstering-flames" | "radiant-fire";

type SpellfireBurstActionBodyProps = {
  selectedTarget: SpellfireBurstTarget;
  onSelectTarget: (target: SpellfireBurstTarget) => void;
};

export function SpellfireBurstActionBody({
  selectedTarget,
  onSelectTarget
}: SpellfireBurstActionBodyProps) {
  return (
    <div className={styles.targetSwitch} role="tablist" aria-label="Bolstering Flames target">
      <button
        type="button"
        className={clsx(styles.targetButton, selectedTarget === "self" && styles.targetButtonActive)}
        aria-pressed={selectedTarget === "self"}
        onClick={() => onSelectTarget("self")}
      >
        Myself
      </button>
      <button
        type="button"
        className={clsx(
          styles.targetButton,
          selectedTarget === "other" && styles.targetButtonActive
        )}
        aria-pressed={selectedTarget === "other"}
        onClick={() => onSelectTarget("other")}
      >
        Another
      </button>
    </div>
  );
}

type SpellfireBurstActionFooterProps = {
  actionName: string;
  disabled: boolean;
  isDiceRollerSettingsOpen: boolean;
  onUseEffect: (effect: SpellfireBurstEffect) => void;
  onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
};

export function SpellfireBurstActionFooter({
  actionName,
  disabled,
  isDiceRollerSettingsOpen,
  onUseEffect,
  onDiceRollerSettingsOpenChange
}: SpellfireBurstActionFooterProps) {
  return (
    <ActionFooterButtonRow
      settings={
        <DiceRollerSettingsButton
          actionName={actionName}
          className={actionStyles.weaponFooterIconButton}
          isOpen={isDiceRollerSettingsOpen}
          ariaLabel="Open dice roller settings"
          onOpenChange={onDiceRollerSettingsOpenChange}
        />
      }
    >
      <ActionButton
        className={actionStyles.weaponFooterButton}
        onClick={() => onUseEffect("bolstering-flames")}
        disabled={disabled}
        icon={<img src={d20Icon} alt="" className={actionStyles.weaponFooterIcon} />}
      >
        Use Bolstering Flames
      </ActionButton>
      <ActionButton
        className={actionStyles.weaponFooterButton}
        onClick={() => onUseEffect("radiant-fire")}
        disabled={disabled}
        icon={<img src={d20Icon} alt="" className={actionStyles.weaponFooterIcon} />}
      >
        Use Radiant Fire
      </ActionButton>
    </ActionFooterButtonRow>
  );
}
