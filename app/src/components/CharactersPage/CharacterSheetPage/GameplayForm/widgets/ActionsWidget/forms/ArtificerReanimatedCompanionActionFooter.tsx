import { useState } from "react";
import clsx from "clsx";
import ActionButton from "../../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../../ActionShape";
import SelectInput from "../../../../../FormInputs/SelectInput";
import type { Character, CharacterCompanion } from "../../../../../../../types";
import {
  getArtificerReanimatedCompanionUsesRemaining,
  getArtificerReanimatedCompanionSpellSlotOptions
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import { runWithActionConfirmationToastAsync } from "../../../../actionConfirmationToast";
import ActionFooterButtonRow from "../ActionFooterButtonRow";
import styles from "../ActionsWidget.module.css";

type Props = {
  character: Character;
  definitions: CharacterCompanion[];
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  confirmLabel: string;
  onCreate: (definition: CharacterCompanion, spellSlotLevel: number | null) => Promise<void>;
};

export default function ArtificerReanimatedCompanionActionFooter({
  character,
  definitions,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  confirmLabel,
  onCreate
}: Props) {
  const [slotLevel, setSlotLevel] = useState<number | null>(null);
  const requiresSlot = getArtificerReanimatedCompanionUsesRemaining(character) <= 0;
  const slots = getArtificerReanimatedCompanionSpellSlotOptions(character);
  const selectedSlot = slots.find((slot) => slot.level === slotLevel) ?? slots[0];
  const definition = definitions.length === 1 ? definitions[0] : null;
  const warning =
    disabledReason ??
    (!definition?.inheritedCreatureEntry
      ? "Define your companion before creating it."
      : requiresSlot && !selectedSlot
        ? "No spell slots available."
        : null);

  return (
    <>
      {warning ? <p>{warning}</p> : null}
      <ActionFooterButtonRow>
        {requiresSlot ? (
          <label className={clsx(styles.wildCompanionSelectField, styles.footerSplitField)}>
            <SelectInput
              aria-label="Reanimated Companion spell slot"
              value={selectedSlot?.level ?? ""}
              className={clsx(styles.wildCompanionSelect, styles.footerActionSelect)}
              disabled={slots.length === 0}
              onChange={(event) => setSlotLevel(Number(event.target.value))}
            >
              {slots.length ? (
                slots.map((slot) => (
                  <option key={slot.level} value={slot.level}>
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
          loading={isSubmitting}
          disabled={warning !== null}
          onClick={() => {
            if (!definition || warning) return;
            void runWithActionConfirmationToastAsync("action", () =>
              onCreate(definition, requiresSlot ? (selectedSlot?.level ?? null) : null)
            ).catch(() => undefined);
          }}
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
    </>
  );
}
