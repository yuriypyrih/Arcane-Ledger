import clsx from "clsx";
import RadioContainerOption from "../../RadioContainerOption";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type { RestOption } from "./restOptions";
import styles from "./CampButton.module.css";

type CampRestOptionProps = {
  option: RestOption;
  selected: boolean;
  onToggle: (optionId: string) => void;
};

function RestOptionCharges({ charges }: { charges: NonNullable<RestOption["charges"]> }) {
  const total = Math.max(0, Math.floor(charges.total));
  const current = Math.min(total, Math.max(0, Math.floor(charges.current)));

  return (
    <span
      className={styles.restOptionCharges}
      aria-label={`${current} of ${total} charges remaining`}
    >
      <span>Charges</span>
      <span className={sheetStyles.shortRestDots}>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={clsx(
              sheetStyles.shortRestDot,
              index < current && sheetStyles.shortRestDotActive
            )}
          />
        ))}
      </span>
    </span>
  );
}

function CampRestOption({ option, selected, onToggle }: CampRestOptionProps) {
  if (option.emphasis === "feature") {
    return (
      <RadioContainerOption
        header={option.label}
        breakdown={option.detail}
        selected={selected}
        onSelect={() => onToggle(option.id)}
        disabled={option.disabled === true}
        indicatorType="checkbox"
        aside={option.charges ? <RestOptionCharges charges={option.charges} /> : undefined}
      />
    );
  }

  return (
    <label className={sheetStyles.restChecklistItem}>
      <input
        type="checkbox"
        checked={selected}
        disabled={option.disabled === true}
        onChange={() => onToggle(option.id)}
      />
      <span>{option.label}</span>
    </label>
  );
}

export default CampRestOption;
