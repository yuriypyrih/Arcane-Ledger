import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  arcaneArcherLoreCantrips,
  getArcaneArcherLoreChoices,
  updateArcaneArcherLoreChoices
} from "../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterArcaneArcher";
import { buildSkillSelectOptions } from "./helpers";
import { recomputeCharacterFeatureProficiencies } from "./choiceModels/shared";
import SelectInput from "../../FormInputs/SelectInput";
import styles from "./ClassFeaturesAndFeats.module.css";

export default function FighterArcaneArcherLoreFields({
  character,
  disabled,
  onPersistCharacter
}: {
  character: Character;
  disabled: boolean;
  onPersistCharacter: PersistCharacterUpdater;
}) {
  const choices = getArcaneArcherLoreChoices(character);
  return (
    <div className={styles.featureSelectionGrid}>
      <label className={styles.featureSelectionField}>
        <span className={styles.featureSelectionLabel}>Cantrip (Intelligence)</span>
        <SelectInput
          value={choices.cantripId ?? ""}
          disabled={disabled}
          onChange={(event) => {
            const cantripId = event.target.value;
            onPersistCharacter((current) =>
              updateArcaneArcherLoreChoices(current, {
                arcaneArcherLoreCantripId: cantripId
              })
            );
          }}
        >
          <option value="">Select a cantrip</option>
          {arcaneArcherLoreCantrips.map((spell) => (
            <option key={spell.id} value={spell.id}>
              {spell.name}
            </option>
          ))}
        </SelectInput>
      </label>
      {choices.skills.map((choice, index) => (
        <label key={choice.defaultSkill} className={styles.featureSelectionField}>
          <span className={styles.featureSelectionLabel}>
            {choice.defaultSkill}
            {choice.needsReplacement ? " replacement" : " proficiency"}
          </span>
          <SelectInput
            value={choice.skill ?? ""}
            disabled={disabled || !choice.needsReplacement}
            onChange={(event) => {
              const value = event.target.value;
              onPersistCharacter((current) => {
                const currentChoices = getArcaneArcherLoreChoices(current);
                const skills = currentChoices.skills.map((entry) => entry.skill ?? ("" as const));
                skills[index] =
                  currentChoices.skills[index].availableOptions.find((skill) => skill === value) ??
                  "";
                return recomputeCharacterFeatureProficiencies(
                  updateArcaneArcherLoreChoices(current, {
                    arcaneArcherLoreSkills: skills
                  })
                );
              });
            }}
          >
            <option value="">Select a skill</option>
            {buildSkillSelectOptions(choice.options, choice.availableOptions, choice.skill).map(
              (option) => (
                <option key={option.skill} value={option.skill} disabled={option.disabled}>
                  {option.label}
                </option>
              )
            )}
          </SelectInput>
        </label>
      ))}
    </div>
  );
}
