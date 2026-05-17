import ActionButton from "../../../../../ActionButton";
import ActionShape from "../../../../../ActionShape";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import { getActionShapeForEconomyType } from "../../gameplayWidgetUtils";
import type { WeaponAttackPathState } from "./weaponActionEconomy";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import ActionFooterButtonRow from "./ActionFooterButtonRow";
import styles from "./ActionsWidget.module.css";

type WeaponAttackFooterButtonsProps = {
  actionName: string;
  attackPaths: Array<{
    pathState: WeaponAttackPathState;
    disabledReason: string | null;
  }>;
  isDiceRollerSettingsOpen: boolean;
  onAttack: (pathState: WeaponAttackPathState) => void;
  onDamage: () => void;
  onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
};

function WeaponAttackFooterButtons({
  actionName,
  attackPaths,
  isDiceRollerSettingsOpen,
  onAttack,
  onDamage,
  onDiceRollerSettingsOpenChange
}: WeaponAttackFooterButtonsProps) {
  return (
    <ActionFooterButtonRow
      settings={
        <DiceRollerSettingsButton
          actionName={actionName}
          className={styles.weaponFooterIconButton}
          isOpen={isDiceRollerSettingsOpen}
          ariaLabel="Open dice roller settings"
          onOpenChange={onDiceRollerSettingsOpenChange}
        />
      }
    >
      {attackPaths.map(({ pathState, disabledReason }) => {
        const actionShape = getActionShapeForEconomyType(pathState.economyType);

        if (!actionShape) {
          return null;
        }

        return (
          <ActionButton
            key={`${actionName}-${pathState.id}`}
            className={styles.weaponFooterButton}
            onClick={() => onAttack(pathState)}
            disabled={disabledReason !== null}
            title={disabledReason ?? undefined}
            icon={<img src={d20Icon} alt="" className={styles.weaponFooterIcon} />}
            trailingBadge={
              <span className={styles.footerActionShapeGroup}>
                <ActionShape
                  shape={actionShape}
                  isSelected={pathState.shapeState.isAvailable}
                  multiCount={pathState.shapeState.multiCount}
                  showMultiCountLabel={false}
                  className={styles.footerActionShape}
                />
                {pathState.additionalUseCount > 0 ? (
                  <span className={styles.footerActionCount}>{`x${pathState.totalUseCount}`}</span>
                ) : null}
              </span>
            }
          >
            {pathState.usesLightFollowUp && pathState.lightFollowUpKind === "nick"
              ? "Attack (Nick)"
              : "Attack"}
          </ActionButton>
        );
      })}
      <ActionButton
        className={styles.weaponFooterButton}
        onClick={onDamage}
        icon={<img src={d20Icon} alt="" className={styles.weaponFooterIcon} />}
      >
        Damage
      </ActionButton>
    </ActionFooterButtonRow>
  );
}

export default WeaponAttackFooterButtons;
