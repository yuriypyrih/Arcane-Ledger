import { useId, useState } from "react";
import {
  getDiceRollerBehaviorPreference,
  updateDiceRollerBehaviorPreference,
  type DiceRollerBehaviorPreference
} from "../../../../../storage/preferences";
import type { RollMode } from "../../../../../types";
import {
  clearNextRollOverrides,
  setNextRollCriticalHitOverride,
  setNextRollModeOverride,
  useAppDispatch,
  useAppSelector
} from "../../../../../store";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../Overlay";
import RadioContainerOption from "../../RadioContainerOption";
import styles from "./DiceRollerSettingsModal.module.css";

type DiceRollerSettingsModalProps = {
  actionName: string;
  onClose: () => void;
};

const diceRollerBehaviorOptions: Array<{
  value: DiceRollerBehaviorPreference;
  label: string;
  description: string;
}> = [
  {
    value: "full_manual",
    label: "Full Manual",
    description:
      "Skip the roller and show a rolled example, but the number is not applied anywhere."
  },
  {
    value: "manual_with_roller",
    label: "Manual with Roller",
    description:
      "Open the dice roller and show the animated rolled result, but the number is not applied anywhere."
  },
  {
    value: "full_auto",
    label: "Full Auto with Roller",
    description:
      "Open the dice roller and show the animated rolled result and apply the number where applicable (ie. Personal Heal, TempHp, Critical Hit, etc)."
  }
];

type NextRollOverrideOption = {
  value: RollMode | "critical_hit";
  label: string;
  toneClassName: string;
};

const nextRollOverrideOptions: NextRollOverrideOption[] = [
  {
    value: "advantage",
    label: "ADVANTAGE",
    toneClassName: "advantageTone"
  },
  {
    value: "disadvantage",
    label: "DISADVANTAGE",
    toneClassName: "disadvantageTone"
  },
  {
    value: "normal",
    label: "NORMAL",
    toneClassName: "normalTone"
  },
  {
    value: "critical_hit",
    label: "CRITICAL HIT",
    toneClassName: "criticalTone"
  }
];

function DiceRollerSettingsModal({ onClose }: DiceRollerSettingsModalProps) {
  const titleId = useId().replace(/:/g, "");
  const nextRollOverrideId = `${titleId}-next-roll-override`;
  const dispatch = useAppDispatch();
  const nextRollCriticalHitOverride = useAppSelector(
    (state) => state.diceRoller.nextRollCriticalHitOverride
  );
  const nextRollModeOverride = useAppSelector((state) => state.diceRoller.nextRollModeOverride);
  const [behavior, setBehavior] = useState<DiceRollerBehaviorPreference>(() =>
    getDiceRollerBehaviorPreference()
  );
  const selectedOverrideValue = nextRollCriticalHitOverride ? "critical_hit" : nextRollModeOverride;

  function selectBehavior(nextBehavior: DiceRollerBehaviorPreference) {
    setBehavior(nextBehavior);
    updateDiceRollerBehaviorPreference(nextBehavior);
  }

  function toggleNextRollOverride(option: NextRollOverrideOption["value"]) {
    if (selectedOverrideValue === option) {
      dispatch(clearNextRollOverrides());
      return;
    }

    if (option === "critical_hit") {
      dispatch(setNextRollCriticalHitOverride());
      return;
    }

    dispatch(setNextRollModeOverride(option));
  }

  return (
    <SheetModal titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Dice Roller</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>Global Roll Settings</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close dice roller settings" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <div className={styles.optionGrid} role="radiogroup" aria-label="Dice roller behavior">
          {diceRollerBehaviorOptions.map((option) => (
            <RadioContainerOption
              key={option.value}
              name="dice-roller-behavior"
              header={option.label}
              selected={behavior === option.value}
              onSelect={() => selectBehavior(option.value)}
              breakdown={option.description}
              className={styles.option}
            />
          ))}
        </div>

        <section className={styles.overrideSection} aria-labelledby={nextRollOverrideId}>
          <p id={nextRollOverrideId} className={styles.overrideSectionTitle}>
            Next Roll Override
          </p>
          <div className={styles.overrideList}>
            {nextRollOverrideOptions.map((option) => {
              const checked = selectedOverrideValue === option.value;
              const disabled = selectedOverrideValue !== null && !checked;

              return (
                <label
                  key={option.value}
                  className={[
                    styles.overrideRow,
                    checked ? styles.overrideRowSelected : "",
                    disabled ? styles.overrideRowDisabled : ""
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    className={styles.overrideCheckbox}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleNextRollOverride(option.value)}
                  />
                  <span className={styles.overrideLabel}>
                    Force{option.value === "critical_hit" ? " a " : " "}
                    <span className={styles[option.toneClassName]}>{option.label}</span> to the next
                    roll.
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default DiceRollerSettingsModal;
