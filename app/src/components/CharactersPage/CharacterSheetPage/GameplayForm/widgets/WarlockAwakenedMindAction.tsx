import clsx from "clsx";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import FeatureOptInToggle from "../../FeatureOptInToggle/FeatureOptInToggle";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./WarlockAwakenedMindAction.module.css";

type WarlockAwakenedMindActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  clairvoyantCombatantUsesRemaining: number;
  clairvoyantCombatantUsesTotal: number;
  pactMagicSlotsRemaining: number;
  pactMagicSlotTotal: number;
  toggleDisabled: boolean;
  toggleDisabledReason?: string | null;
  isClairvoyantCombatantSelected: boolean;
  onConfirm: () => void;
  onClairvoyantCombatantSelectedChange: (checked: boolean) => void;
};

export function WarlockAwakenedMindActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  clairvoyantCombatantUsesRemaining,
  clairvoyantCombatantUsesTotal,
  pactMagicSlotsRemaining,
  pactMagicSlotTotal,
  toggleDisabled,
  toggleDisabledReason = null,
  isClairvoyantCombatantSelected,
  onConfirm,
  onClairvoyantCombatantSelectedChange
}: WarlockAwakenedMindActionFooterProps) {
  return (
    <div className={styles.footerStack}>
      <FeatureOptInToggle
        label="Clairvoyant Combatant"
        checked={isClairvoyantCombatantSelected}
        disabled={toggleDisabled}
        muted={toggleDisabled}
        onCheckedChange={onClairvoyantCombatantSelectedChange}
        title={toggleDisabledReason ?? undefined}
        metaItems={[
          {
            kind: "tracker",
            current: clairvoyantCombatantUsesRemaining,
            total: clairvoyantCombatantUsesTotal
          },
          ...(clairvoyantCombatantUsesRemaining <= 0
            ? [
                {
                  kind: "cost" as const,
                  label: `Use 1 Pact Magic slot (${pactMagicSlotsRemaining}/${pactMagicSlotTotal})`
                }
              ]
            : [])
        ]}
      />
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
