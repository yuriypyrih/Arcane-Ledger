import clsx from "clsx";
import ActionButton from "../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import CellContainer from "../../../../CellContainer/CellContainer";
import d20Icon from "../../../../../assets/svg/d20.svg";
import { formatAbilityModifier } from "../../../../../pages/CharactersPage/gameplay";
import type { AbilityKey } from "../../../../../types";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import actionStyles from "./ActionsWidget.module.css";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import styles from "./IndomitableAction.module.css";

export type IndomitableOption = {
  ability: AbilityKey;
  total: number;
  formula: string;
  formulaDisplay: string;
};

type IndomitableActionBodyProps = {
  options: IndomitableOption[];
  selectedAbility: AbilityKey | null;
  onSelectAbility: (ability: AbilityKey) => void;
};

type IndomitableActionFooterProps = {
  actionName: string;
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  isDiceRollerSettingsOpen: boolean;
  onConfirm: () => void;
  onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
};

export function IndomitableActionBody({
  options,
  selectedAbility,
  onSelectAbility
}: IndomitableActionBodyProps) {
  const selectedOption =
    selectedAbility !== null
      ? (options.find((option) => option.ability === selectedAbility) ?? null)
      : null;

  return (
    <>
      <div className={styles.abilityGrid}>
        {options.map((option) => (
          <button
            key={option.ability}
            type="button"
            className={clsx(
              styles.abilityButton,
              selectedAbility === option.ability && styles.abilityButtonActive
            )}
            onClick={() => onSelectAbility(option.ability)}
          >
            <strong className={styles.abilityName}>{option.ability}</strong>
            <small className={styles.abilityMeta}>{formatAbilityModifier(option.total)} Save</small>
          </button>
        ))}
      </div>

      <div className={clsx(sheetStyles.spellDrawerDetails, styles.formulaGrid)}>
        <CellContainer
          className={styles.fullWidthCell}
          label="Saving Throw Formula"
          content={
            selectedOption?.formulaDisplay ?? "Choose a saving throw to see the roll formula."
          }
          contentClassName={styles.formulaValue}
        />
      </div>
    </>
  );
}

export function IndomitableActionFooter({
  actionName,
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  isDiceRollerSettingsOpen,
  onConfirm,
  onDiceRollerSettingsOpenChange
}: IndomitableActionFooterProps) {
  return (
    <div className={actionStyles.weaponFooterActions}>
      <ActionButton
        className={actionStyles.weaponFooterButton}
        onClick={onConfirm}
        disabled={disabled}
        icon={<img src={d20Icon} alt="" className={actionStyles.weaponFooterIcon} />}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={actionShapeAvailable}
              multiCount={actionShapeMultiCount}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {confirmLabel}
      </ActionButton>
      <DiceRollerSettingsButton
        actionName={actionName}
        className={actionStyles.weaponFooterIconButton}
        isOpen={isDiceRollerSettingsOpen}
        ariaLabel="Open dice roller settings"
        onOpenChange={onDiceRollerSettingsOpenChange}
      />
    </div>
  );
}
