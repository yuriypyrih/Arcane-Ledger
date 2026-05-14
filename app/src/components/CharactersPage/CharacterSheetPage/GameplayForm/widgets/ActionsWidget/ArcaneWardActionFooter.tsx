import clsx from "clsx";
import ActionButton from "../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../ActionShape";
import SelectInput from "../../../../FormInputs/SelectInput";
import { runWithActionConfirmationToast } from "../../../actionConfirmationToast";
import actionStyles from "./ActionsWidget.module.css";

type ArcaneWardActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  disabledReason?: string | null;
  spellSlotOptions: Array<{
    level: number;
    remaining: number;
    total: number;
  }>;
  selectedSpellSlotLevel: number | null;
  onSelectedSpellSlotLevelChange: (slotLevel: number) => void;
  onConfirm: () => void;
};

export function ArcaneWardActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  disabledReason = null,
  spellSlotOptions,
  selectedSpellSlotLevel,
  onSelectedSpellSlotLevelChange,
  onConfirm
}: ArcaneWardActionFooterProps) {
  return (
    <div className={actionStyles.weaponFooterActions}>
      <label className={clsx(actionStyles.wildCompanionSelectField, actionStyles.footerSplitField)}>
        <SelectInput
          aria-label="Arcane Ward spell slot"
          value={selectedSpellSlotLevel !== null ? String(selectedSpellSlotLevel) : ""}
          className={clsx(actionStyles.wildCompanionSelect, actionStyles.footerActionSelect)}
          disabled={spellSlotOptions.length <= 0}
          onChange={(event) => onSelectedSpellSlotLevelChange(Number(event.target.value))}
        >
          {spellSlotOptions.length > 0 ? (
            spellSlotOptions.map((slot) => (
              <option key={`arcane-ward-slot-${slot.level}`} value={slot.level}>
                Level {slot.level} ({slot.remaining}/{slot.total})
              </option>
            ))
          ) : (
            <option value="">No spell slots available</option>
          )}
        </SelectInput>
      </label>
      <ActionButton
        className={actionStyles.weaponFooterButton}
        onClick={() => runWithActionConfirmationToast(actionShape, onConfirm)}
        disabled={disabled}
        title={disabledReason ?? undefined}
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
    </div>
  );
}
