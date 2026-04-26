import clsx from "clsx";
import ActionButton from "../../../../../ActionButton";
import ActionShape from "../../../../../ActionShape";
import CellContainer from "../../../../../CellContainer/CellContainer";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { monkWarriorOfTheOpenHandQuiveringPalmDamageFormula } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import { formatFormulaCell } from "../../../../../../pages/CharactersPage/shared/formulas";
import actionStyles from "../ActionsWidget/ActionsWidget.module.css";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";

type QuiveringPalmStatusDrawerActionRowProps = {
  disabled: boolean;
  disabledReason?: string | null;
  onDetonate: () => void;
};

function getQuiveringPalmFormulaContent(): string {
  return formatFormulaCell({
    formula: monkWarriorOfTheOpenHandQuiveringPalmDamageFormula,
    displayTerms: [`${monkWarriorOfTheOpenHandQuiveringPalmDamageFormula} Force`],
    resultLabel: "Damage"
  }).value;
}

export function QuiveringPalmStatusDrawerFormula() {
  return (
    <div className={clsx(sheetStyles.spellDrawerDetails, actionStyles.weaponFormulaList)}>
      <CellContainer
        label="Formula"
        content={getQuiveringPalmFormulaContent()}
        contentClassName={actionStyles.weaponFormulaValue}
      />
    </div>
  );
}

export function QuiveringPalmStatusDrawerActionRow({
  disabled,
  disabledReason,
  onDetonate
}: QuiveringPalmStatusDrawerActionRowProps) {
  return (
    <div className={actionStyles.weaponFooterActions}>
      <ActionButton
        className={actionStyles.weaponFooterButton}
        onClick={onDetonate}
        disabled={disabled}
        title={disabledReason ?? undefined}
        icon={<img src={d20Icon} alt="" className={actionStyles.weaponFooterIcon} />}
        trailingBadge={
          <span className={actionStyles.footerActionShapeGroup}>
            <ActionShape
              shape="action"
              isSelected={!disabled}
              showMultiCountLabel={false}
              className={actionStyles.footerActionShape}
            />
          </span>
        }
      >
        Detonate Quivering Palm
      </ActionButton>
      <DiceRollerSettingsButton
        actionName="Detonate Quivering Palm"
        className={actionStyles.weaponFooterIconButton}
      />
    </div>
  );
}
