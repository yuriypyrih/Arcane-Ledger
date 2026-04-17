import clsx from "clsx";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getSkillLevelFromEntries,
  getSkillProficiencyForName
} from "../../../../pages/CharactersPage/proficiency";
import {
  getWizardBladesingerTrainingInWarAndSongSkillSelection,
  setWizardBladesingerTrainingInWarAndSongSkillSelection,
  wizardBladesingerTrainingInWarAndSongSkillOptions
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
import type { Character, WizardBladesingerTrainingInWarAndSongSkill } from "../../../../types";
import { PROF_LEVEL } from "../../../../types";
import SelectInput from "../../FormInputs/SelectInput";
import styles from "./ClassFeaturesAndFeats.module.css";

type WizardBladesingerTrainingInWarAndSongFieldsProps = {
  character: Character;
  featureKey: string;
  isUnlocked: boolean;
  onPersistCharacter: PersistCharacterUpdater;
  recomputeCharacterFeatureProficiencies: (nextCharacter: Character) => Character;
};

function getTrainingInWarAndSongOptions(character: Character): Array<{
  skill: WizardBladesingerTrainingInWarAndSongSkill;
  disabled: boolean;
  label: string;
}> {
  const currentSelection = getWizardBladesingerTrainingInWarAndSongSkillSelection(character);

  return wizardBladesingerTrainingInWarAndSongSkillOptions.map((skillName) => {
    const proficiency = getSkillProficiencyForName(skillName);
    const isAlreadyProficient =
      proficiency !== null &&
      currentSelection !== skillName &&
      getSkillLevelFromEntries(character.skillProficiencies ?? [], proficiency) !== PROF_LEVEL.NONE;

    return {
      skill: skillName,
      disabled: isAlreadyProficient,
      label: skillName
    };
  });
}

function WizardBladesingerTrainingInWarAndSongFields({
  character,
  featureKey,
  isUnlocked,
  onPersistCharacter,
  recomputeCharacterFeatureProficiencies
}: WizardBladesingerTrainingInWarAndSongFieldsProps) {
  const currentSelection = getWizardBladesingerTrainingInWarAndSongSkillSelection(character);
  const options = getTrainingInWarAndSongOptions(character);

  function updateSelection(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      recomputeCharacterFeatureProficiencies(
        setWizardBladesingerTrainingInWarAndSongSkillSelection(
          currentCharacter,
          nextValue.trim().length > 0
            ? (nextValue as WizardBladesingerTrainingInWarAndSongSkill)
            : null
        )
      )
    );
  }

  return (
    <div className={styles.featureSelectionGrid}>
      <label
        className={clsx(styles.featureSelectionField, !isUnlocked && styles.featureOptionRowDisabled)}
      >
        <span className={styles.featureSelectionLabel}>Training Skill</span>
        <SelectInput
          value={currentSelection ?? ""}
          disabled={!isUnlocked}
          onChange={(event) => updateSelection(event.target.value)}
        >
          <option value="">Select a skill</option>
          {options.map((option) => (
            <option
              key={`${featureKey}-training-in-war-and-song-${option.skill}`}
              value={option.skill}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}

export default WizardBladesingerTrainingInWarAndSongFields;
