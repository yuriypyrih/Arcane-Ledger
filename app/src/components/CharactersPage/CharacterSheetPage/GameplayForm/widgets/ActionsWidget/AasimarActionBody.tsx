import clsx from "clsx";
import {
  getAasimarCelestialRevelationOptions,
  type AasimarCelestialRevelationOptionKey,
  type AasimarHealingHandsTarget
} from "../../../../../../pages/CharactersPage/species";
import RadioContainerOption from "../../../RadioContainerOption";
import styles from "./ActionsWidget.module.css";
import targetStyles from "./HealingLightActionBody.module.css";

type AasimarHealingHandsActionBodyProps = {
  selectedTarget: AasimarHealingHandsTarget;
  onSelectedTargetChange: (target: AasimarHealingHandsTarget) => void;
};

export function AasimarHealingHandsActionBody({
  selectedTarget,
  onSelectedTargetChange
}: AasimarHealingHandsActionBodyProps) {
  return (
    <div className={styles.aasimarTargetBody}>
      <div className={targetStyles.targetSwitch} role="tablist" aria-label="Healing Hands target">
        <button
          type="button"
          className={clsx(
            targetStyles.targetButton,
            selectedTarget === "self" && targetStyles.targetButtonActive
          )}
          aria-pressed={selectedTarget === "self"}
          onClick={() => onSelectedTargetChange("self")}
        >
          Myself
        </button>
        <button
          type="button"
          className={clsx(
            targetStyles.targetButton,
            selectedTarget === "other" && targetStyles.targetButtonActive
          )}
          aria-pressed={selectedTarget === "other"}
          onClick={() => onSelectedTargetChange("other")}
        >
          Another
        </button>
      </div>
    </div>
  );
}

type AasimarCelestialRevelationActionBodyProps = {
  selectedOptionKey: AasimarCelestialRevelationOptionKey | null;
  onSelectOption: (optionKey: AasimarCelestialRevelationOptionKey) => void;
};

export function AasimarCelestialRevelationActionBody({
  selectedOptionKey,
  onSelectOption
}: AasimarCelestialRevelationActionBodyProps) {
  const options = getAasimarCelestialRevelationOptions();

  return (
    <div className={styles.natureMagicianBody}>
      {options.map((option) => (
        <RadioContainerOption
          key={option.key}
          name="aasimar-celestial-revelation"
          header={option.name}
          breakdown={option.description}
          selected={selectedOptionKey === option.key}
          onSelect={() => onSelectOption(option.key)}
        />
      ))}
    </div>
  );
}
