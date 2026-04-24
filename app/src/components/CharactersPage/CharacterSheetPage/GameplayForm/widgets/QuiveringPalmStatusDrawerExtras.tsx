import clsx from "clsx";
import ActionShape from "../../../../ActionShape";
import CellContainer from "../../../../CellContainer/CellContainer";
import d20Icon from "../../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { parseRollFormulaRange } from "../../../../../pages/CharactersPage/actionOutcome";
import { monkWarriorOfTheOpenHandQuiveringPalmDamageFormula } from "../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import actionStyles from "./ActionsWidget.module.css";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";

type QuiveringPalmStatusDrawerActionRowProps = {
  disabled: boolean;
  disabledReason?: string | null;
  onDetonate: () => void;
};

function getQuiveringPalmFormulaContent(): string {
  const parsedRange = parseRollFormulaRange(monkWarriorOfTheOpenHandQuiveringPalmDamageFormula);

  if (!parsedRange) {
    return `Damage= ${monkWarriorOfTheOpenHandQuiveringPalmDamageFormula} Force`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} Damage= ${monkWarriorOfTheOpenHandQuiveringPalmDamageFormula} Force`;
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
      <button
        type="button"
        className={clsx(sheetStyles.castButton, actionStyles.weaponFooterButton)}
        onClick={onDetonate}
        disabled={disabled}
        title={disabledReason ?? undefined}
      >
        <span className={actionStyles.centeredFooterButtonContent}>
          <img src={d20Icon} alt="" className={actionStyles.weaponFooterIcon} />
          <span>Detonate Quivering Palm</span>
          <span className={actionStyles.footerActionShapeGroup}>
            <ActionShape
              shape="action"
              isSelected={!disabled}
              showMultiCountLabel={false}
              className={actionStyles.footerActionShape}
            />
          </span>
        </span>
      </button>
      <DiceRollerSettingsButton
        actionName="Detonate Quivering Palm"
        className={clsx(sheetStyles.castButton, actionStyles.weaponFooterIconButton)}
      />
    </div>
  );
}
