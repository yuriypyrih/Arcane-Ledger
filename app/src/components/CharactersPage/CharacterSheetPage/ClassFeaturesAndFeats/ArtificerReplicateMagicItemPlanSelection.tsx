import clsx from "clsx";
import SelectInput from "../../FormInputs/SelectInput";
import type { ArtificerReplicateMagicItemPlanGroup } from "../../../../pages/CharactersPage/classFeatures/artificer/replicateMagicItemPlans";
import styles from "./ClassFeaturesAndFeats.module.css";

type ArtificerReplicateMagicItemPlanSelectionProps = {
  groups: ArtificerReplicateMagicItemPlanGroup[];
  isUnlocked: boolean;
  plansKnown: number;
  selections: string[];
  onChange: (slotIndex: number, planKey: string) => void;
};

function ArtificerReplicateMagicItemPlanSelection({
  groups,
  isUnlocked,
  plansKnown,
  selections,
  onChange
}: ArtificerReplicateMagicItemPlanSelectionProps) {
  if (plansKnown <= 0) {
    return null;
  }

  return (
    <div className={styles.featureSelectionGrid}>
      {Array.from({ length: plansKnown }, (_, slotIndex) => {
        const selectedElsewhere = new Set(
          selections.filter((selection, index) => index !== slotIndex && selection.length > 0)
        );

        return (
          <label
            key={`replicate-magic-item-plan-${slotIndex}`}
            className={clsx(
              styles.featureSelectionField,
              !isUnlocked && styles.featureOptionRowDisabled
            )}
          >
            <span className={styles.featureSelectionLabel}>{`Plan ${slotIndex + 1}`}</span>
            <SelectInput
              value={selections[slotIndex] ?? ""}
              disabled={!isUnlocked}
              invalid={isUnlocked && !selections[slotIndex]}
              onChange={(event) => onChange(slotIndex, event.target.value)}
            >
              <option value="">-</option>
              {groups.map((group) => (
                <optgroup key={group.level} label={group.label}>
                  {group.options.map((option) => (
                    <option
                      key={`${slotIndex}-${option.key}`}
                      value={option.key}
                      disabled={selectedElsewhere.has(option.key)}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </SelectInput>
          </label>
        );
      })}
    </div>
  );
}

export default ArtificerReplicateMagicItemPlanSelection;
