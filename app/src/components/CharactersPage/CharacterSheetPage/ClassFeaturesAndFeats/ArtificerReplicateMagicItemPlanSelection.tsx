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
  armorReplicationGroups?: ArtificerReplicateMagicItemPlanGroup[];
  armorReplicationSelection?: string;
  onArmorReplicationChange?: (planKey: string) => void;
};

function ArtificerReplicateMagicItemPlanSelection({
  groups,
  isUnlocked,
  plansKnown,
  selections,
  onChange,
  armorReplicationGroups = [],
  armorReplicationSelection = "",
  onArmorReplicationChange
}: ArtificerReplicateMagicItemPlanSelectionProps) {
  if (plansKnown <= 0) {
    return null;
  }

  const selectedBasePlanKeys = new Set(selections.filter((selection) => selection.length > 0));
  const hasArmorReplicationSelection =
    armorReplicationGroups.length > 0 && onArmorReplicationChange !== undefined;

  return (
    <div className={styles.featureSelectionGrid}>
      {Array.from({ length: plansKnown }, (_, slotIndex) => {
        const selectedElsewhere = new Set(
          selections.filter((selection, index) => index !== slotIndex && selection.length > 0)
        );

        if (armorReplicationSelection) {
          selectedElsewhere.add(armorReplicationSelection);
        }

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
      {hasArmorReplicationSelection ? (
        <label
          className={clsx(
            styles.featureSelectionField,
            !isUnlocked && styles.featureOptionRowDisabled
          )}
        >
          <span className={styles.featureSelectionLabel}>Armor Replication Plan</span>
          <SelectInput
            value={armorReplicationSelection}
            disabled={!isUnlocked}
            invalid={isUnlocked && !armorReplicationSelection}
            onChange={(event) => onArmorReplicationChange(event.target.value)}
          >
            <option value="">-</option>
            {armorReplicationGroups.map((group) => (
              <optgroup key={group.level} label={group.label}>
                {group.options.map((option) => (
                  <option
                    key={`armor-replication-${option.key}`}
                    value={option.key}
                    disabled={selectedBasePlanKeys.has(option.key)}
                  >
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectInput>
        </label>
      ) : null}
    </div>
  );
}

export default ArtificerReplicateMagicItemPlanSelection;
