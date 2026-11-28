import { FEATS } from "../../codex/entries/enums";
import {
  portalJumperDamageTypes,
  secondMindSkillOptions,
  type FeatBenefitChoice
} from "../../pages/CharactersPage/feats/featBenefitChoices";
import { getEffectiveUnproficientSkillOptions } from "../../pages/CharactersPage/proficiency/runtime";
import { getLanguageLevelFromEntries } from "../../pages/CharactersPage/proficiency/manual";
import {
  languageProficiencyOptions,
  languageProficiencyLabels
} from "../../pages/CharactersPage/proficiencyOptions";
import { PROF_LEVEL, type LanguageProficiencyEntry, type SkillProficiencyEntry } from "../../types";
import { formatCodexLabel } from "../../utils/codex";
import SelectInput from "./FormInputs/SelectInput";
import { buildSkillSelectOptions } from "./CharacterSheetPage/ClassFeaturesAndFeats/helpers";

type Props = {
  choice: FeatBenefitChoice;
  skillProficiencies: SkillProficiencyEntry[];
  languageProficiencies: LanguageProficiencyEntry[];
  fieldClassName: string;
  selectClassName?: string;
  compact?: boolean;
  onChange: (choice: FeatBenefitChoice) => void;
};

export default function FeatBenefitChoiceFields({
  choice,
  skillProficiencies,
  languageProficiencies,
  fieldClassName,
  selectClassName,
  compact,
  onChange
}: Props) {
  if (choice.feat === FEATS.PORTAL_JUMPER) {
    return (
      <label className={fieldClassName}>
        <span>Otherworldly Resilience</span>
        <SelectInput
          compact={compact}
          className={selectClassName}
          value={choice.portalJumper.damageType ?? ""}
          onChange={(event) => {
            const damageType = portalJumperDamageTypes.find((type) => type === event.target.value);
            if (damageType)
              onChange({ ...choice, portalJumper: { ...choice.portalJumper, damageType } });
          }}
        >
          <option value="" disabled>
            Choose a damage type
          </option>
          {portalJumperDamageTypes.map((type) => (
            <option key={type} value={type}>
              {formatCodexLabel(type)}
            </option>
          ))}
        </SelectInput>
      </label>
    );
  }

  const { skill, language } = choice.symbioticBeing;
  const availableSkills = getEffectiveUnproficientSkillOptions(
    { skillProficiencies },
    secondMindSkillOptions,
    null
  );
  return (
    <>
      <label className={fieldClassName}>
        <span>Second Mind — Skill Proficiency</span>
        <SelectInput
          compact={compact}
          className={selectClassName}
          value={skill ?? ""}
          onChange={(event) => {
            const skill = secondMindSkillOptions.find((option) => option === event.target.value);
            if (skill) onChange({ ...choice, symbioticBeing: { ...choice.symbioticBeing, skill } });
          }}
        >
          <option value="" disabled>
            Choose a skill proficiency
          </option>
          {buildSkillSelectOptions(secondMindSkillOptions, availableSkills, undefined).map(
            (option) => (
              <option
                key={option.skill}
                value={option.skill}
                disabled={option.skill !== skill && option.disabled}
              >
                {option.label}
              </option>
            )
          )}
        </SelectInput>
      </label>
      <label className={fieldClassName}>
        <span>Second Mind — Language</span>
        <SelectInput
          compact={compact}
          className={selectClassName}
          value={language ?? ""}
          onChange={(event) => {
            const language = languageProficiencyOptions.find(
              (option) => option === event.target.value
            );
            if (language)
              onChange({ ...choice, symbioticBeing: { ...choice.symbioticBeing, language } });
          }}
        >
          <option value="" disabled>
            Choose a language
          </option>
          {languageProficiencyOptions.map((option) => (
            <option
              key={option}
              value={option}
              disabled={
                option !== language &&
                getLanguageLevelFromEntries(languageProficiencies, option) !== PROF_LEVEL.NONE
              }
            >
              {languageProficiencyLabels[option]}
            </option>
          ))}
        </SelectInput>
      </label>
    </>
  );
}
