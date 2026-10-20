import { isSkillName, type Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getRoguePhantomWhispersProficiency,
  setRoguePhantomWhispersProficiency
} from "../../../../pages/CharactersPage/classFeatures/rogue/subclasses/roguePhantom";
import {
  skillsOptions,
  toolProficiencyOptions
} from "../../../../pages/CharactersPage/proficiencyOptions";
import {
  getEffectiveUnproficientSkillOptions,
  getEffectiveUnproficientToolOptions
} from "../../../../pages/CharactersPage/proficiency/runtime";
import { buildSkillSelectOptions, buildToolSelectOptions } from "./helpers";
import { recomputeCharacterFeatureProficiencies } from "./choiceModels/shared";
import SelectInput from "../../FormInputs/SelectInput";
import styles from "./ClassFeaturesAndFeats.module.css";

export default function RoguePhantomFeatureFields({
  character,
  disabled,
  onPersistCharacter
}: {
  character: Character;
  disabled: boolean;
  onPersistCharacter: PersistCharacterUpdater;
}) {
  const selection = getRoguePhantomWhispersProficiency(character);
  const skill = isSkillName(selection) ? selection : null;
  const tool = selection && !isSkillName(selection) ? selection : null;
  const skillOptions = buildSkillSelectOptions(
    skillsOptions,
    getEffectiveUnproficientSkillOptions(character, skillsOptions, skill),
    skill
  );
  const toolOptions = buildToolSelectOptions(
    toolProficiencyOptions,
    getEffectiveUnproficientToolOptions(character, toolProficiencyOptions, tool),
    tool
  );

  return (
    <div className={styles.featureSelectionGrid}>
      <label className={styles.featureSelectionField}>
        <span className={styles.featureSelectionLabel}>Borrowed Proficiency</span>
        <SelectInput
          value={selection ?? ""}
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value;
            onPersistCharacter((current) =>
              recomputeCharacterFeatureProficiencies(
                setRoguePhantomWhispersProficiency(current, value)
              )
            );
          }}
        >
          <option value="">Select a skill or tool</option>
          <optgroup label="Skills">
            {skillOptions.map((option) => (
              <option key={option.skill} value={option.skill} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Tools">
            {toolOptions.map((option) => (
              <option key={option.tool} value={option.tool} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
        </SelectInput>
      </label>
    </div>
  );
}
