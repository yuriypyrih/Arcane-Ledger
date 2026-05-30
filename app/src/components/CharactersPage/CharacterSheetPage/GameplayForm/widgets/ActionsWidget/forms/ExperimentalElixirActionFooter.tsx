import { useEffect, useMemo } from "react";
import clsx from "clsx";
import ActionButton from "../../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../../ActionShape";
import SelectInput from "../../../../../FormInputs/SelectInput";
import {
  getArtificerExperimentalElixirOptionsForCharacter,
  getArtificerExperimentalElixirSpellSlotOptions,
  type ArtificerExperimentalElixirOptionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import type { Character } from "../../../../../../../types";
import { runWithActionConfirmationToastAsync } from "../../../../actionConfirmationToast";
import ActionFooterButtonRow from "../ActionFooterButtonRow";
import styles from "../ActionsWidget.module.css";

type ExperimentalElixirActionFooterProps = {
  character: Character;
  selectedOptionKey: ArtificerExperimentalElixirOptionKey | null;
  selectedSpellSlotLevel: number | null;
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  onSelectedSpellSlotLevelChange: (spellSlotLevel: number | null) => void;
  onUseElixir: (
    optionKey: ArtificerExperimentalElixirOptionKey,
    spellSlotLevel: number | null
  ) => Promise<void>;
};

const noSpellSlotValue = "none";

function parseSpellSlotValue(value: string): number | null {
  if (value === noSpellSlotValue) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.floor(parsedValue) : null;
}

function ExperimentalElixirActionFooter({
  character,
  selectedOptionKey,
  selectedSpellSlotLevel,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  onSelectedSpellSlotLevelChange,
  onUseElixir
}: ExperimentalElixirActionFooterProps) {
  const options = useMemo(
    () => getArtificerExperimentalElixirOptionsForCharacter(character),
    [character]
  );
  const spellSlotOptions = useMemo(
    () => getArtificerExperimentalElixirSpellSlotOptions(character),
    [character]
  );
  const selectedOption = options.find((option) => option.key === selectedOptionKey) ?? null;

  useEffect(() => {
    if (
      selectedSpellSlotLevel !== null &&
      !spellSlotOptions.some((option) => option.level === selectedSpellSlotLevel)
    ) {
      onSelectedSpellSlotLevelChange(null);
    }
  }, [onSelectedSpellSlotLevelChange, selectedSpellSlotLevel, spellSlotOptions]);

  function handleSubmit() {
    if (!selectedOption) {
      return;
    }

    void runWithActionConfirmationToastAsync("action", () =>
      onUseElixir(selectedOption.key, selectedSpellSlotLevel)
    ).catch(() => undefined);
  }

  return (
    <ActionFooterButtonRow>
      <label className={clsx(styles.wildCompanionSelectField, styles.footerSplitField)}>
        <span className={styles.experimentalElixirSelectLabel}>Spell Slot</span>
        <SelectInput
          aria-label="Experimental Elixir spell slot"
          value={selectedSpellSlotLevel === null ? noSpellSlotValue : String(selectedSpellSlotLevel)}
          className={clsx(styles.wildCompanionSelect, styles.footerActionSelect)}
          onChange={(event) =>
            onSelectedSpellSlotLevelChange(parseSpellSlotValue(event.target.value))
          }
        >
          <option value={noSpellSlotValue}>No spell slot</option>
          {spellSlotOptions.map((slot) => (
            <option key={`experimental-elixir-slot-${slot.level}`} value={slot.level}>
              Level {slot.level} ({slot.remaining}/{slot.total})
            </option>
          ))}
        </SelectInput>
      </label>

      <ActionButton
        className={styles.weaponFooterButton}
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={!selectedOption || disabledReason !== null}
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
        Use Experimental Elixir
      </ActionButton>
    </ActionFooterButtonRow>
  );
}

export default ExperimentalElixirActionFooter;
