import { useEffect, useMemo } from "react";
import clsx from "clsx";
import ActionButton from "../../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../../ActionShape";
import SelectInput from "../../../../../FormInputs/SelectInput";
import { getArtificerSteelDefenderSpellSlotOptions } from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import type { Character } from "../../../../../../../types";
import { runWithActionConfirmationToastAsync } from "../../../../actionConfirmationToast";
import ActionFooterButtonRow from "../ActionFooterButtonRow";
import styles from "../ActionsWidget.module.css";

const withoutSpellSlotValue = "without-spell-slot";

type ArtificerSteelDefenderActionFooterProps = {
  character: Character;
  selectedSpellSlotLevel: number | null;
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  confirmLabel: string;
  onSelectedSpellSlotLevelChange: (spellSlotLevel: number | null) => void;
  onUseSteelDefender: (spellSlotLevel: number | null) => Promise<void>;
};

function ArtificerSteelDefenderActionFooter({
  character,
  selectedSpellSlotLevel,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  confirmLabel,
  onSelectedSpellSlotLevelChange,
  onUseSteelDefender
}: ArtificerSteelDefenderActionFooterProps) {
  const spellSlotOptions = useMemo(
    () => getArtificerSteelDefenderSpellSlotOptions(character),
    [character]
  );

  useEffect(() => {
    if (
      selectedSpellSlotLevel !== null &&
      !spellSlotOptions.some((option) => option.level === selectedSpellSlotLevel)
    ) {
      onSelectedSpellSlotLevelChange(null);
    }
  }, [onSelectedSpellSlotLevelChange, selectedSpellSlotLevel, spellSlotOptions]);

  function handleSubmit() {
    void runWithActionConfirmationToastAsync("action", () =>
      onUseSteelDefender(selectedSpellSlotLevel)
    ).catch(() => undefined);
  }

  return (
    <ActionFooterButtonRow>
      <label className={clsx(styles.wildCompanionSelectField, styles.footerSplitField)}>
        <SelectInput
          aria-label="Steel Defender spell slot"
          value={
            selectedSpellSlotLevel !== null ? String(selectedSpellSlotLevel) : withoutSpellSlotValue
          }
          className={clsx(styles.wildCompanionSelect, styles.footerActionSelect)}
          onChange={(event) => {
            const nextValue = event.target.value;

            onSelectedSpellSlotLevelChange(
              nextValue === withoutSpellSlotValue ? null : Number(nextValue)
            );
          }}
        >
          <option value={withoutSpellSlotValue}>Without spell slot</option>
          {spellSlotOptions.map((slot) => (
            <option key={`steel-defender-slot-${slot.level}`} value={slot.level}>
              Level {slot.level} ({slot.remaining}/{slot.total})
            </option>
          ))}
        </SelectInput>
      </label>

      <ActionButton
        className={styles.weaponFooterButton}
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={disabledReason !== null}
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
    </ActionFooterButtonRow>
  );
}

export default ArtificerSteelDefenderActionFooter;
