import { type DAMAGE_TYPE } from "../../../../../codex/entries";
import { formatCodexLabel } from "../../../../../utils/codex";
import {
  monkWarriorOfTheElementsElementalResistanceDamageTypeOptions
} from "../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import RadioContainerOption from "../../RadioContainerOption";
import styles from "./ElementalAttunementResistanceSelector.module.css";

type ElementalAttunementResistanceSelectorProps = {
  selectedDamageType: DAMAGE_TYPE | null;
  onSelectDamageType: (damageType: DAMAGE_TYPE) => void;
  name: string;
  disabled?: boolean;
  helperText?: string | null;
};

function ElementalAttunementResistanceSelector({
  selectedDamageType,
  onSelectDamageType,
  name,
  disabled = false,
  helperText = "Choose the Elemental Epitome resistance granted by Elemental Attunement."
}: ElementalAttunementResistanceSelectorProps) {
  return (
    <div className={styles.root}>
      <div className={shared.field}>
        <span className={shared.fieldLabel}>Elemental Resistance</span>
        <div className={styles.options}>
          {monkWarriorOfTheElementsElementalResistanceDamageTypeOptions.map((damageType) => {
            const damageTypeLabel = formatCodexLabel(damageType);

            return (
              <RadioContainerOption
                key={damageType}
                name={name}
                header={damageTypeLabel}
                selected={selectedDamageType === damageType}
                disabled={disabled}
                onSelect={() => onSelectDamageType(damageType)}
              />
            );
          })}
        </div>
      </div>
      {helperText ? <p className={shared.helperText}>{helperText}</p> : null}
    </div>
  );
}

export default ElementalAttunementResistanceSelector;
