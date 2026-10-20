import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getWarlockVestigeSpellDomain,
  setWarlockVestigeSpellDomain,
  vestigeSpellDomainOptions
} from "../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockVestigeSpells";
import SelectInput from "../../FormInputs/SelectInput";
import styles from "./ClassFeaturesAndFeats.module.css";

export default function WarlockVestigeSpellFields({
  character,
  disabled,
  onPersistCharacter
}: {
  character: Character;
  disabled: boolean;
  onPersistCharacter: PersistCharacterUpdater;
}) {
  const domain = getWarlockVestigeSpellDomain(character);
  return (
    <div className={styles.featureSelectionGrid}>
      <label className={styles.featureSelectionField}>
        <span className={styles.featureSelectionLabel}>Cleric Domain</span>
        <SelectInput
          value={domain?.id ?? ""}
          disabled={disabled}
          invalid={!disabled && !domain}
          onChange={(event) => {
            const domainId = event.target.value;
            onPersistCharacter((current) => setWarlockVestigeSpellDomain(current, domainId));
          }}
        >
          <option value="">Select a domain</option>
          {vestigeSpellDomainOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}
