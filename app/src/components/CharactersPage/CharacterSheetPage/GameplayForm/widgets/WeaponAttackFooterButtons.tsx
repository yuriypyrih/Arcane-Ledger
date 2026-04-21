import clsx from "clsx";
import ActionShape from "../../../../ActionShape";
import type { EconomyType } from "../../../../../pages/CharactersPage/actionEconomy";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
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
          <button
            key={`${actionName}-${pathState.id}`}
            type="button"
            className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
            onClick={() => onAttack(pathState.economyType)}
            disabled={disabledReason !== null}
            title={disabledReason ?? undefined}
          >
            <span className={styles.centeredFooterButtonContent}>
              <img src={d20Icon} alt="" className={styles.weaponFooterIcon} />
              <span>Attack</span>
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
            </span>
          </button>
        );
      })}
      <button
        type="button"
        className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
        onClick={onDamage}
      >
        <img src={d20Icon} alt="" className={styles.weaponFooterIcon} />
        <span>Damage</span>
      </button>
      <DiceRollerSettingsButton
        actionName={actionName}
        className={clsx(sheetStyles.castButton, styles.weaponFooterIconButton)}
        isOpen={isDiceRollerSettingsOpen}
        aria-label="Open dice roller settings"
        onOpenChange={onDiceRollerSettingsOpenChange}
      />
    </div>
  );
}

export default WeaponAttackFooterButtons;
