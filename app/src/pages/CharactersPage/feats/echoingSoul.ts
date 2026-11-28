import { FEATS } from "../../../codex/entries/enums";
import {
  ALL_SKILLS,
  languageEntriesByProficiency,
  type EchoingSoulChoice,
  type LANGUAGE_PROFICIENCY,
  type SkillName,
  type SkillProficiencyEntry
} from "../../../types";
import { removeFeatGrantedSkillEntries } from "../proficiency/core";
import {
  getEffectiveProficientSkillOptions,
  getEffectiveUnproficientSkillOptions
} from "../proficiency/runtime";
import { languageProficiencyLabels } from "../proficiencyOptions";
import { getFeatLabel } from "./catalog";

export function isEchoingSoulSkill(value: unknown): value is SkillName {
  return ALL_SKILLS.some((skill) => skill === value);
}

export function isEchoingSoulLanguage(value: unknown): value is LANGUAGE_PROFICIENCY {
  return (
    typeof value === "string" && languageEntriesByProficiency.has(value as LANGUAGE_PROFICIENCY)
  );
}

export function normalizeEchoingSoulChoice(value: unknown): EchoingSoulChoice | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Partial<EchoingSoulChoice>;
  const [first, second] = Array.isArray(record.skillProficiencies) ? record.skillProficiencies : [];
  const skillExpertise = isEchoingSoulSkill(record.skillExpertise)
    ? record.skillExpertise
    : undefined;
  const language = isEchoingSoulLanguage(record.language) ? record.language : undefined;
  const skillProficiencies: EchoingSoulChoice["skillProficiencies"] = [
    isEchoingSoulSkill(first) ? first : null,
    isEchoingSoulSkill(second) && second !== first ? second : null
  ];

  return skillProficiencies.some(Boolean) || skillExpertise || language
    ? { skillProficiencies, skillExpertise, language }
    : undefined;
}

export function isEchoingSoulChoiceComplete(choice?: EchoingSoulChoice | null): boolean {
  return Boolean(
    choice?.skillProficiencies.every(Boolean) &&
    choice.skillProficiencies[0] !== choice.skillProficiencies[1] &&
    choice.skillExpertise &&
    choice.language
  );
}

export function getEchoingSoulChoiceSummary(choice?: EchoingSoulChoice): string {
  if (!choice) return "Choose skill proficiencies, Expertise, and a language.";
  return [
    ...choice.skillProficiencies,
    choice.skillExpertise && `${choice.skillExpertise} Expertise`,
    choice.language && languageProficiencyLabels[choice.language]
  ]
    .filter(Boolean)
    .join(", ");
}

export function getEchoingSoulBaseSkills(entries: SkillProficiencyEntry[], featEntryId?: string) {
  return featEntryId
    ? removeFeatGrantedSkillEntries(
        entries,
        [...ALL_SKILLS],
        getFeatLabel(FEATS.ECHOING_SOUL),
        featEntryId
      )
    : entries;
}

export function getEchoingSoulExpertiseOptions(
  skillProficiencies: SkillProficiencyEntry[],
  choice: EchoingSoulChoice
): SkillName[] {
  const character = { skillProficiencies };
  const selectedSkills = choice.skillProficiencies.filter(
    (skill): skill is SkillName => skill !== null
  );

  return [
    ...getEffectiveProficientSkillOptions(character, ALL_SKILLS, null),
    ...getEffectiveUnproficientSkillOptions(character, selectedSkills, null)
  ];
}
