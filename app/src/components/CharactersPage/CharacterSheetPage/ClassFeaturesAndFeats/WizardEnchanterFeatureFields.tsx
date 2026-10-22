import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  enchantingConversationalistSkills,
  getEnchantingConversationalistSkill,
  setEnchantingConversationalistSkill
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardEnchanter";
import SelectInput from "../../FormInputs/SelectInput";
import { buildSkillSelectOptions } from "./helpers";
import { recomputeCharacterFeatureProficiencies } from "./choiceModels/shared";
import styles from "./ClassFeaturesAndFeats.module.css";

export default function WizardEnchanterFeatureFields({
  character,
  disabled,
  onPersistCharacter
}: {
  character: Character;
  disabled: boolean;
  onPersistCharacter: PersistCharacterUpdater;
}) {
  const selection = getEnchantingConversationalistSkill(character);
  return (
    <div className={styles.featureSelectionGrid}>
      <label className={styles.featureSelectionField}>
        <span className={styles.featureSelectionLabel}>Conversationalist Skill</span>
        <SelectInput
          value={selection ?? ""}
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value;
            onPersistCharacter((current) =>
              recomputeCharacterFeatureProficiencies(
                setEnchantingConversationalistSkill(current, value)
              )
            );
          }}
        >
          <option value="">Select a skill</option>
          {buildSkillSelectOptions(
            enchantingConversationalistSkills,
            enchantingConversationalistSkills,
            selection
          ).map((option) => (
            <option key={option.skill} value={option.skill} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}
