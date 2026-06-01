import { useEffect, useMemo } from "react";
import clsx from "clsx";
import ActionButton from "../../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../../ActionShape";
import SelectInput from "../../../../../FormInputs/SelectInput";
import {
  getArtificerEldritchCannonSpellSlotOptions,
  getArtificerEldritchCannonUsesRemaining,
  isArtificerEldritchCannonOptionKey,
  type ArtificerEldritchCannonOptionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import type { Character } from "../../../../../../../types";
import { runWithActionConfirmationToastAsync } from "../../../../actionConfirmationToast";
import ActionFooterButtonRow from "../ActionFooterButtonRow";
import styles from "../ActionsWidget.module.css";

type ArtificerEldritchCannonActionFooterProps = {
  character: Character;
  selectedOptionKey: string | null;
  selectedSpellSlotLevel: number | null;
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  confirmLabel: string;
  onSelectedSpellSlotLevelChange: (spellSlotLevel: number | null) => void;
  onUseCannon: (
    optionKey: ArtificerEldritchCannonOptionKey,
    spellSlotLevel: number | null
  ) => Promise<void>;
};

function ArtificerEldritchCannonActionFooter({
  character,
  selectedOptionKey,
  selectedSpellSlotLevel,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  confirmLabel,
  onSelectedSpellSlotLevelChange,
  onUseCannon
}: ArtificerEldritchCannonActionFooterProps) {
  const usesRemaining = getArtificerEldritchCannonUsesRemaining(character);
  const requiresSpellSlot = usesRemaining <= 0;
  const spellSlotOptions = useMemo(
    () => getArtificerEldritchCannonSpellSlotOptions(character),
    [character]
  );
  const selectedOption = isArtificerEldritchCannonOptionKey(selectedOptionKey)
    ? selectedOptionKey
    : null;

  useEffect(() => {
    if (
      selectedSpellSlotLevel !== null &&
      !spellSlotOptions.some((option) => option.level === selectedSpellSlotLevel)
    ) {
      onSelectedSpellSlotLevelChange(null);
    }

    if (requiresSpellSlot && selectedSpellSlotLevel === null && spellSlotOptions[0]) {
      onSelectedSpellSlotLevelChange(spellSlotOptions[0].level);
    }
  }, [
    onSelectedSpellSlotLevelChange,
    requiresSpellSlot,
    selectedSpellSlotLevel,
    spellSlotOptions
  ]);

  function handleSubmit() {
    if (!selectedOption) {
      return;
    }

    const spellSlotLevel = requiresSpellSlot ? selectedSpellSlotLevel : null;

    void runWithActionConfirmationToastAsync("action", () =>
      onUseCannon(selectedOption, spellSlotLevel)
    ).catch(() => undefined);
  }

  const spellSlotRequiredButMissing = requiresSpellSlot && selectedSpellSlotLevel === null;

  return (
    <ActionFooterButtonRow>
      {requiresSpellSlot ? (
        <label className={clsx(styles.wildCompanionSelectField, styles.footerSplitField)}>
          <SelectInput
            aria-label="Eldritch Cannon spell slot"
            value={selectedSpellSlotLevel !== null ? String(selectedSpellSlotLevel) : ""}
            className={clsx(styles.wildCompanionSelect, styles.footerActionSelect)}
            disabled={spellSlotOptions.length <= 0}
            onChange={(event) =>
              onSelectedSpellSlotLevelChange(Number(event.target.value))
            }
          >
            {spellSlotOptions.length > 0 ? (
              spellSlotOptions.map((slot) => (
                <option key={`eldritch-cannon-slot-${slot.level}`} value={slot.level}>
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
        className={styles.weaponFooterButton}
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={!selectedOption || disabledReason !== null || spellSlotRequiredButMissing}
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

export default ArtificerEldritchCannonActionFooter;
