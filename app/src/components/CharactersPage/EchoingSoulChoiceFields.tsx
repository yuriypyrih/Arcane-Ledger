import { FEATS } from "../../codex/entries/enums";
import { getFeatLabel } from "../../pages/CharactersPage/feats/catalog";
import {
  getEchoingSoulBaseSkills,
  getEchoingSoulExpertiseOptions,
  isEchoingSoulLanguage,
  isEchoingSoulSkill
} from "../../pages/CharactersPage/feats/echoingSoul";
import { removeFeatGrantedLanguageEntries } from "../../pages/CharactersPage/proficiency/core";
import { getLanguageLevelFromEntries } from "../../pages/CharactersPage/proficiency/manual";
import { getEffectiveUnproficientSkillOptions } from "../../pages/CharactersPage/proficiency/runtime";
import {
  languageProficiencyLabels,
  languageProficiencyOptions
} from "../../pages/CharactersPage/proficiencyOptions";
import {
  ALL_SKILLS,
  PROF_LEVEL,
  type EchoingSoulChoice,
  type LanguageProficiencyEntry,
  type SkillName,
  type SkillProficiencyEntry
} from "../../types";
import SelectInput from "./FormInputs/SelectInput";
import { buildSkillSelectOptions } from "./CharacterSheetPage/ClassFeaturesAndFeats/helpers";

type EchoingSoulChoiceFieldsProps = {
  choice: EchoingSoulChoice;
  featEntryId?: string | null;
  skillProficiencies: SkillProficiencyEntry[];
  languageProficiencies: LanguageProficiencyEntry[];
  fieldClassName: string;
  selectClassName?: string;
  compact?: boolean;
  onChange: (choice: EchoingSoulChoice) => void;
};

export default function EchoingSoulChoiceFields({
  choice,
  featEntryId,
  skillProficiencies,
  languageProficiencies,
  fieldClassName,
  selectClassName,
  compact,
  onChange
}: EchoingSoulChoiceFieldsProps) {
  const baseSkills = getEchoingSoulBaseSkills(skillProficiencies, featEntryId ?? undefined);
  const baseLanguages = featEntryId
    ? removeFeatGrantedLanguageEntries(
        languageProficiencies,
        languageProficiencyOptions,
        getFeatLabel(FEATS.ECHOING_SOUL),
        featEntryId
      )
    : languageProficiencies;
  const expertiseOptions = getEchoingSoulExpertiseOptions(baseSkills, choice);

  function selectProficiency(index: number, skill: SkillName) {
    const nextChoice: EchoingSoulChoice = {
      ...choice,
      skillProficiencies: [...choice.skillProficiencies]
    };
    nextChoice.skillProficiencies[index] = skill;
    if (
      nextChoice.skillExpertise &&
      !getEchoingSoulExpertiseOptions(baseSkills, nextChoice).includes(nextChoice.skillExpertise)
    ) {
      nextChoice.skillExpertise = undefined;
    }
    onChange(nextChoice);
  }

  return (
    <>
      {choice.skillProficiencies.map((skill, index) => {
        const otherSkill = choice.skillProficiencies[index === 0 ? 1 : 0];
        const availableSkills = getEffectiveUnproficientSkillOptions(
          { skillProficiencies: baseSkills },
          ALL_SKILLS,
          skill,
          otherSkill ? [otherSkill] : []
        );
        const label = `Channeled Prowess — Skill Proficiency ${index + 1}`;

        return (
          <label className={fieldClassName} key={label}>
            <span>{label}</span>
            <SelectInput
              compact={compact}
              className={selectClassName}
              value={skill ?? ""}
              onChange={(event) => {
                const next = event.target.value;
                if (isEchoingSoulSkill(next)) selectProficiency(index, next);
              }}
            >
              <option value="" disabled>
                Choose a skill proficiency
              </option>
              {buildSkillSelectOptions(ALL_SKILLS, availableSkills, skill).map((option) => (
                <option key={option.skill} value={option.skill} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </label>
        );
      })}
      <label className={fieldClassName}>
        <span>Channeled Prowess — Expertise</span>
        <SelectInput
          compact={compact}
          className={selectClassName}
          value={choice.skillExpertise ?? ""}
          onChange={(event) => {
            const skillExpertise = event.target.value;
            if (isEchoingSoulSkill(skillExpertise)) onChange({ ...choice, skillExpertise });
          }}
        >
          <option value="" disabled>
            Choose a proficient skill
          </option>
          {buildSkillSelectOptions(ALL_SKILLS, expertiseOptions, choice.skillExpertise).map(
            (option) => (
              <option key={option.skill} value={option.skill} disabled={option.disabled}>
                {option.label}
              </option>
            )
          )}
        </SelectInput>
      </label>
      <label className={fieldClassName}>
        <span>Inherent Tongues — Language</span>
        <SelectInput
          compact={compact}
          className={selectClassName}
          value={choice.language ?? ""}
          onChange={(event) => {
            const language = event.target.value;
            if (isEchoingSoulLanguage(language)) onChange({ ...choice, language });
          }}
        >
          <option value="" disabled>
            Choose a language
          </option>
          {languageProficiencyOptions.map((language) => (
            <option
              key={language}
              value={language}
              disabled={
                language !== choice.language &&
                getLanguageLevelFromEntries(baseLanguages, language) !== PROF_LEVEL.NONE
              }
            >
              {languageProficiencyLabels[language]}
            </option>
          ))}
        </SelectInput>
      </label>
    </>
  );
}
