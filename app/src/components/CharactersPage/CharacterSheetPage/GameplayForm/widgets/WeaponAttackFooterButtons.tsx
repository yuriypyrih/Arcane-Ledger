import ActionButton from "../../../../ActionButton";
import ActionShape from "../../../../ActionShape";
import type { EconomyType } from "../../../../../pages/CharactersPage/actionEconomy";
import d20Icon from "../../../../../assets/svg/d20.svg";
import { getActionShapeForEconomyType } from "../gameplayWidgetUtils";
import type { WeaponAttackPathState } from "./weaponActionEconomy";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import styles from "./ActionsWidget.module.css";

type WeaponAttackFooterButtonsProps = {
  actionName: string;
  attackPaths: Array<{
    pathState: WeaponAttackPathState;
    disabledReason: string | null;
  }>;
  isDiceRollerSettingsOpen: boolean;
  onAttack: (economyType: EconomyType) => void;
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
    <div className={styles.weaponFooterActions}>
      {attackPaths.map(({ pathState, disabledReason }) => {
        const actionShape = getActionShapeForEconomyType(pathState.economyType);

        if (!actionShape) {
          return null;
        }

        return (
          <ActionButton
            key={`${actionName}-${pathState.id}`}
            className={styles.weaponFooterButton}
            onClick={() => onAttack(pathState.economyType)}
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
            Attack
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
      <DiceRollerSettingsButton
        actionName={actionName}
        className={styles.weaponFooterIconButton}
        isOpen={isDiceRollerSettingsOpen}
        aria-label="Open dice roller settings"
        onOpenChange={onDiceRollerSettingsOpenChange}
      />
    </div>
  );
}

export default WeaponAttackFooterButtons;
