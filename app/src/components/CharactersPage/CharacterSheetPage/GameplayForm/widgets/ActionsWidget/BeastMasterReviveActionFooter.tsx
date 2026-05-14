import clsx from "clsx";
import ActionButton from "../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../ActionShape";
import SelectInput from "../../../../FormInputs/SelectInput";
import { runWithActionConfirmationToast } from "../../../actionConfirmationToast";
import actionStyles from "./ActionsWidget.module.css";

type BeastMasterReviveSpellSlotOption = {
  level: number;
  remaining: number;
  total: number;
};

type BeastMasterReviveActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  disabledReason?: string | null;
  spellSlotOptions: BeastMasterReviveSpellSlotOption[];
  selectedSpellSlotLevel: number | null;
  onSelectedSpellSlotLevelChange: (slotLevel: number) => void;
  onConfirm: () => void;
};

export function BeastMasterReviveActionFooter({
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
}: BeastMasterReviveActionFooterProps) {
  return (
    <div className={actionStyles.footerActionStack}>
      <div className={actionStyles.weaponFooterActions}>
        <label
          className={clsx(actionStyles.wildCompanionSelectField, actionStyles.footerSplitField)}
        >
          <SelectInput
            aria-label="Revive Primal Companion spell slot"
            value={selectedSpellSlotLevel !== null ? String(selectedSpellSlotLevel) : ""}
            className={clsx(actionStyles.wildCompanionSelect, actionStyles.footerActionSelect)}
            disabled={spellSlotOptions.length <= 0}
            onChange={(event) => onSelectedSpellSlotLevelChange(Number(event.target.value))}
          >
            {spellSlotOptions.length > 0 ? (
              spellSlotOptions.map((slot) => (
                <option key={`beast-master-revive-slot-${slot.level}`} value={slot.level}>
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
      {disabledReason ? <p className={actionStyles.footerHelperText}>{disabledReason}</p> : null}
    </div>
  );
}
