import clsx from "clsx";
import ActionButton from "../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../ActionShape";
import type { LayOnHandsCondition } from "../../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import RadioContainerOption from "../../../RadioContainerOption";
import actionStyles from "./ActionsWidget.module.css";
import styles from "./LayOnHandsAction.module.css";

export type LayOnHandsTarget = "self" | "other";

type LayOnHandsActionBodyProps = {
  conditionOptions: LayOnHandsCondition[];
  target: LayOnHandsTarget;
  poolSpendInput: string;
  selectedConditions: LayOnHandsCondition[];
  onTargetChange: (target: LayOnHandsTarget) => void;
  onPoolSpendInputChange: (value: string) => void;
  onSelectedConditionsChange: (conditions: LayOnHandsCondition[]) => void;
};

type LayOnHandsActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  onConfirm: () => void;
};

export function LayOnHandsActionBody({
  conditionOptions,
  target,
  poolSpendInput,
  selectedConditions,
  onTargetChange,
  onPoolSpendInputChange,
  onSelectedConditionsChange
}: LayOnHandsActionBodyProps) {
  function toggleCondition(condition: LayOnHandsCondition) {
    onSelectedConditionsChange(
      selectedConditions.includes(condition)
        ? selectedConditions.filter((entry) => entry !== condition)
        : [...selectedConditions, condition]
    );
  }

  return (
    <div className={styles.body}>
      <div className={styles.topRow}>
        <div className={styles.targetSwitch} role="tablist" aria-label="Lay on Hands target">
          <button
            type="button"
            role="tab"
            aria-selected={target === "self"}
            className={clsx(styles.targetButton, target === "self" && styles.targetButtonActive)}
            onClick={() => onTargetChange("self")}
          >
            Myself
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={target === "other"}
            className={clsx(styles.targetButton, target === "other" && styles.targetButtonActive)}
            onClick={() => onTargetChange("other")}
          >
            Another
          </button>
        </div>

        <label className={styles.section}>
          <span className={styles.sectionLabel}>Heal Amount</span>
          <input
            className={styles.fieldControl}
            type="number"
            min={0}
            inputMode="numeric"
            value={poolSpendInput}
            onChange={(event) => onPoolSpendInputChange(event.target.value)}
          />
        </label>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Conditions to Cure</span>
        <div className={styles.conditionList}>
          {conditionOptions.map((condition) => {
            const isSelected = selectedConditions.includes(condition);

            return (
              <RadioContainerOption
                key={condition}
                header={condition}
                selected={isSelected}
                indicatorType="checkbox"
                onSelect={() => toggleCondition(condition)}
                className={styles.conditionOption}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LayOnHandsActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  onConfirm
}: LayOnHandsActionFooterProps) {
  return (
    <ActionButton
      className={clsx(actionStyles.footerActionButton, styles.confirmButton)}
      onClick={onConfirm}
      disabled={disabled}
      trailingBadge={
        actionShape ? (
          <ActionShape
            shape={actionShape}
            isSelected={actionShapeAvailable}
            multiCount={actionShapeMultiCount}
            className={actionStyles.footerActionShape}
          />
        ) : null
      }
    >
      {confirmLabel}
    </ActionButton>
  );
}
