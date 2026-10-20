import { arcaneShotOptions } from "../../../../codex/subclasses/fighterArcaneArcher";
import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getArcaneShotOptionIds,
  updateArcaneShotOptions
} from "../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterArcaneShot";
import SelectInput from "../../FormInputs/SelectInput";
import styles from "./ClassFeaturesAndFeats.module.css";

export default function FighterArcaneShotFields({
  character,
  onPersistCharacter
}: {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
}) {
  const selectedIds = getArcaneShotOptionIds(character);
  return (
    <div className={styles.featureSelectionGrid}>
      {selectedIds.map((id, index) => (
        <label key={index} className={styles.featureSelectionField}>
          <span className={styles.featureSelectionLabel}>Arcane Shot option {index + 1}</span>
          <SelectInput
            value={id}
            onChange={(event) => {
              const value = event.target.value;
              onPersistCharacter((current) => {
                const ids = getArcaneShotOptionIds(current);
                ids[index] = value;
                return updateArcaneShotOptions(current, ids);
              });
            }}
          >
            <option value="">Select an Arcane Shot option</option>
            {arcaneShotOptions.map((option) => (
              <option
                key={option.id}
                value={option.id}
                disabled={option.id !== id && selectedIds.includes(option.id)}
              >
                {option.name}
              </option>
            ))}
          </SelectInput>
        </label>
      ))}
    </div>
  );
}
