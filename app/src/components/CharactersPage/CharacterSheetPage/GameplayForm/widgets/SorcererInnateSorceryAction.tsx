import clsx from "clsx";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import FeatureOptInToggle from "../../FeatureOptInToggle/FeatureOptInToggle";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./SorcererInnateSorceryAction.module.css";

type SorcererInnateSorceryActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  crownOfSpellfireUnlocked: boolean;
  crownOfSpellfireUsesRemaining: number;
  crownOfSpellfireUsesTotal: number;
  crownOfSpellfireFallbackSorceryPointCost: number;
  crownOfSpellfireDisabledReason?: string | null;
  isCrownOfSpellfireSelected: boolean;
  onConfirm: () => void;
  onCrownOfSpellfireSelectedChange: (checked: boolean) => void;
};

export function SorcererInnateSorceryActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  crownOfSpellfireUnlocked,
  crownOfSpellfireUsesRemaining,
  crownOfSpellfireUsesTotal,
  crownOfSpellfireFallbackSorceryPointCost,
  crownOfSpellfireDisabledReason = null,
  isCrownOfSpellfireSelected,
  onConfirm,
  onCrownOfSpellfireSelectedChange
}: SorcererInnateSorceryActionFooterProps) {
  return (
    <div className={styles.footerStack}>
      {crownOfSpellfireUnlocked ? (
        <FeatureOptInToggle
          label="Crown of Spellfire"
          checked={isCrownOfSpellfireSelected}
          onCheckedChange={onCrownOfSpellfireSelectedChange}
          title={crownOfSpellfireDisabledReason ?? undefined}
          metaItems={[
            {
              kind: "tracker",
              current: crownOfSpellfireUsesRemaining,
              total: crownOfSpellfireUsesTotal
            },
            ...(crownOfSpellfireUsesRemaining <= 0 && crownOfSpellfireFallbackSorceryPointCost > 0
              ? [
                  {
                    kind: "cost" as const,
                    label: `Use ${crownOfSpellfireFallbackSorceryPointCost}`,
                    icon: "sparkles" as const
                  }
                ]
              : [])
          ]}
        />
      ) : null}
      <button
        type="button"
        className={clsx(sheetStyles.castButton, styles.confirmButton)}
        onClick={onConfirm}
        disabled={disabled}
      >
        <span>{confirmLabel}</span>
        {actionShape ? (
          <ActionShape
            shape={actionShape}
            isSelected={actionShapeAvailable}
            multiCount={actionShapeMultiCount}
            className={styles.footerActionShape}
          />
        ) : null}
      </button>
    </div>
  );
}
