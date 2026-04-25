import clsx from "clsx";
import ActionButton from "../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import SelectInput from "../../../FormInputs/SelectInput";
import FeatureOptInToggle from "../../FeatureOptInToggle/FeatureOptInToggle";
import {
  createFeatureActionCardCost,
  createNamedResourceCardUsage
} from "../../../../../pages/CharactersPage/classFeatures/cardUsage";
import actionStyles from "./ActionsWidget.module.css";

type BardicInspirationActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  disabledReason?: string | null;
  showInspiredEclipseToggle: boolean;
  isInspiredEclipseSelected: boolean;
  onInspiredEclipseSelectedChange: (checked: boolean) => void;
  showSpellSlotSelect: boolean;
  spellSlotOptions: Array<{
    level: number;
    remaining: number;
    total: number;
  }>;
  selectedSpellSlotLevel: number | null;
  onSelectedSpellSlotLevelChange: (slotLevel: number) => void;
  helperText?: string | null;
  onConfirm: () => void;
};

export function BardicInspirationActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  disabledReason = null,
  showInspiredEclipseToggle,
  isInspiredEclipseSelected,
  onInspiredEclipseSelectedChange,
  showSpellSlotSelect,
  spellSlotOptions,
  selectedSpellSlotLevel,
  onSelectedSpellSlotLevelChange,
  helperText = null,
  onConfirm
}: BardicInspirationActionFooterProps) {
  const shouldUseSplitRow = showSpellSlotSelect;

  return (
    <div className={actionStyles.footerActionStack}>
      {showInspiredEclipseToggle ? (
        <FeatureOptInToggle
          label="Inspired Eclipse"
          checked={isInspiredEclipseSelected}
          onCheckedChange={onInspiredEclipseSelectedChange}
          usage={createNamedResourceCardUsage(
            createFeatureActionCardCost({
              amountText: "1",
              icon: "music"
            })
          )}
          usageKey="inspired-eclipse"
        />
      ) : null}
      <div
        className={clsx(
          shouldUseSplitRow ? actionStyles.weaponFooterActions : actionStyles.footerActionStack
        )}
      >
        {showSpellSlotSelect ? (
          <label
            className={clsx(
              actionStyles.wildCompanionSelectField,
              actionStyles.footerSplitField
            )}
          >
            <SelectInput
              aria-label="Bardic Inspiration spell slot"
              value={selectedSpellSlotLevel !== null ? String(selectedSpellSlotLevel) : ""}
              className={clsx(
                actionStyles.wildCompanionSelect,
                actionStyles.footerActionSelect
              )}
              disabled={spellSlotOptions.length <= 0}
              onChange={(event) => onSelectedSpellSlotLevelChange(Number(event.target.value))}
            >
              {spellSlotOptions.length > 0 ? (
                spellSlotOptions.map((slot) => (
                  <option key={`bardic-inspiration-slot-${slot.level}`} value={slot.level}>
                    Level {slot.level} ({slot.remaining}/{slot.total})
                  </option>
                ))
              ) : (
                <option value="">No spell slots available</option>
              )}
            </SelectInput>
          </label>
        ) : null}
        <ActionButton
          className={clsx(
            shouldUseSplitRow ? actionStyles.weaponFooterButton : actionStyles.footerActionButton
          )}
          onClick={onConfirm}
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
      {helperText ? <p className={actionStyles.footerHelperText}>{helperText}</p> : null}
    </div>
  );
}
