import { useId, useState } from "react";
import {
  getDiceRollerBehaviorPreference,
  updateDiceRollerBehaviorPreference,
  type DiceRollerBehaviorPreference
} from "../../../../../storage/preferences";
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
      "Open the dice roller and show the animated rolled result and apply the number where applicable (ie. Personal Heal or TempHp)."
  }
];

function DiceRollerSettingsModal({ onClose }: DiceRollerSettingsModalProps) {
  const titleId = useId().replace(/:/g, "");
  const [behavior, setBehavior] = useState<DiceRollerBehaviorPreference>(() =>
    getDiceRollerBehaviorPreference()
  );

  function selectBehavior(nextBehavior: DiceRollerBehaviorPreference) {
    setBehavior(nextBehavior);
    updateDiceRollerBehaviorPreference(nextBehavior);
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
      </OverlayBody>
    </SheetModal>
  );
}

export default DiceRollerSettingsModal;
