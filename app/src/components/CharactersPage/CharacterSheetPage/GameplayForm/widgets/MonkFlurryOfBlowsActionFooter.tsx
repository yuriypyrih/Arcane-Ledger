import clsx from "clsx";
import ActionShape from "../../../../ActionShape";
import FeatureOptInToggle from "../../FeatureOptInToggle/FeatureOptInToggle";
import type { EconomyType } from "../../../../../pages/CharactersPage/actionEconomy";
import { createChargesCardUsage } from "../../../../../pages/CharactersPage/classFeatures/cardUsage";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { getActionShapeForEconomyType, getEconomyShapeState } from "../gameplayWidgetUtils";
import styles from "./ActionsWidget.module.css";

type MonkFlurryOfBlowsActionFooterProps = {
  confirmLabel: string;
  economyType: EconomyType;
  shapeState: ReturnType<typeof getEconomyShapeState> | null;
  confirmDisabledReason: string | null;
  onConfirm: () => void;
  flurryOfHealingAndHarmOption?: {
    checked: boolean;
    disabled: boolean;
    current: number;
    total: number;
    title?: string;
    onCheckedChange: (checked: boolean) => void;
  };
};

export function MonkFlurryOfBlowsActionFooter({
  confirmLabel,
  economyType,
  shapeState,
  confirmDisabledReason,
  onConfirm,
  flurryOfHealingAndHarmOption
}: MonkFlurryOfBlowsActionFooterProps) {
  const actionShape = getActionShapeForEconomyType(economyType);

  return (
    <div className={styles.footerActionStack}>
      {flurryOfHealingAndHarmOption ? (
        <FeatureOptInToggle
          label="Flurry of Healing and Harm"
          checked={flurryOfHealingAndHarmOption.checked}
          disabled={flurryOfHealingAndHarmOption.disabled}
          muted={flurryOfHealingAndHarmOption.disabled}
          title={flurryOfHealingAndHarmOption.title}
          onCheckedChange={flurryOfHealingAndHarmOption.onCheckedChange}
          usage={createChargesCardUsage(
            flurryOfHealingAndHarmOption.current,
            flurryOfHealingAndHarmOption.total
          )}
          usageKey="flurry-of-healing-and-harm"
        />
      ) : null}
      <div className={styles.weaponFooterActions}>
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
          onClick={onConfirm}
          disabled={confirmDisabledReason !== null}
          title={confirmDisabledReason ?? undefined}
        >
          <span className={styles.centeredFooterButtonContent}>
            <span>{confirmLabel}</span>
            {actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={shapeState?.isAvailable ?? true}
                multiCount={shapeState?.multiCount ?? 0}
                showMultiCountLabel={false}
                className={styles.footerActionShape}
              />
            ) : null}
          </span>
        </button>
      </div>
    </div>
  );
}
