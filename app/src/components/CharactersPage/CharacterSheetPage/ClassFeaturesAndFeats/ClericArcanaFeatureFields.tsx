import type { Character } from "../../../../types";
import { CLASS_FEATURE } from "../../../../codex/entries/enums";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  arcanaSkillOptions,
  getArcanaDomainState,
  getArcanaWizardSpellOptions,
  updateArcanaDomainChoices
} from "../../../../pages/CharactersPage/classFeatures/cleric/subclasses/clericArcanaDomain";
import { getSourceChoiceSkillOptions } from "../../../../pages/CharactersPage/proficiency/runtime";
import { buildSkillSelectOptions } from "./helpers";
import { recomputeCharacterFeatureProficiencies } from "./choiceModels/shared";
import SelectInput from "../../FormInputs/SelectInput";
import styles from "./ClassFeaturesAndFeats.module.css";

export default function ClericArcanaFeatureFields({
  character,
  feature,
  disabled,
  onPersistCharacter
}: {
  character: Character;
  feature: CLASS_FEATURE;
  disabled: boolean;
  onPersistCharacter: PersistCharacterUpdater;
}) {
  const state = getArcanaDomainState(character);
  const student = feature === CLASS_FEATURE.STUDENT_OF_ARCANA;
  const spellIds = (student ? state.arcanaCantripIds : state.magicalMasterySpellIds) ?? [];
  return (
    <div className={styles.featureSelectionGrid}>
      {student && (
        <label className={styles.featureSelectionField}>
          <span className={styles.featureSelectionLabel}>Magical Knowledge</span>
          <SelectInput
            value={state.arcanaSkill ?? ""}
            disabled={disabled}
            onChange={(event) => {
              const skill = arcanaSkillOptions.find((skill) => skill === event.target.value);
              onPersistCharacter((current) =>
                recomputeCharacterFeatureProficiencies(
                  updateArcanaDomainChoices(current, { arcanaSkill: skill })
                )
              );
            }}
          >
            <option value="">Select a skill</option>
            {buildSkillSelectOptions(
              arcanaSkillOptions,
              getSourceChoiceSkillOptions(character, arcanaSkillOptions, state.arcanaSkill),
              state.arcanaSkill ?? null
            ).map((option) => (
              <option key={option.skill} value={option.skill} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
      )}
      {(student ? [0, 0] : [6, 7, 8, 9]).map((level, index) => (
        <label key={index} className={styles.featureSelectionField}>
          <span className={styles.featureSelectionLabel}>
            {student ? `Wizard Cantrip ${index + 1}` : `Level ${level} Wizard Spell`}
          </span>
          <SelectInput
            value={spellIds[index] ?? ""}
            disabled={disabled}
            onChange={(event) => {
              const value = event.target.value;
              onPersistCharacter((current) => {
                const currentState = getArcanaDomainState(current);
                const ids = [
                  ...((student
                    ? currentState.arcanaCantripIds
                    : currentState.magicalMasterySpellIds) ?? [])
                ];
                ids[index] = value;
                return updateArcanaDomainChoices(
                  current,
                  student ? { arcanaCantripIds: ids } : { magicalMasterySpellIds: ids }
                );
              });
            }}
          >
            <option value="">{student ? "Select a cantrip" : "Select a spell"}</option>
            {getArcanaWizardSpellOptions(level).map((spell) => (
              <option
                key={spell.id}
                value={spell.id}
                disabled={
                  spellIds.some((id, i) => i !== index && id === spell.id) ||
                  (student &&
                    (character.cantripIds ?? []).includes(spell.id) &&
                    spellIds[index] !== spell.id)
                }
              >
                {spell.name}
              </option>
            ))}
          </SelectInput>
        </label>
      ))}
    </div>
  );
}
