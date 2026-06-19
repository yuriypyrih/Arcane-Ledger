import {
  ALL_SKILLS,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  STATUS_ENTRY_GROUP,
  getSkillProficiencyForSkillName,
  isSkillName,
  type Character,
  type CharacterStatusEntry,
  type SkillName,
  type SkillProficiencyEntry
} from "../../../../types";
import { createSkillEntry } from "../../proficiency/core";
import { getResolvedSkillProficiencyEntry } from "../../proficiency/manual";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import type {
  SpellImplementationCastOption,
  SpellImplementationCastOptionsContext,
  SpellImplementationStatusOptionsContext
} from "./types";

export const borrowedKnowledgeSpellId = "spell-borrowed-knowledge";
export const borrowedKnowledgeStatusValue = "Borrowed Knowledge";
export const borrowedKnowledgeSkillOptionId = "borrowedKnowledgeSkill";

function isBorrowedKnowledgeSkillProficient(character: Character, skill: SkillName): boolean {
  return (
    getResolvedSkillProficiencyEntry(
      character.skillProficiencies,
      getSkillProficiencyForSkillName(skill)
    ).proficiencyLevel !== PROF_LEVEL.NONE
  );
}

export function getBorrowedKnowledgeCastOptions(
  context: SpellImplementationCastOptionsContext
): SpellImplementationCastOption[] {
  const choices = ALL_SKILLS.map((skill) => ({
    value: skill,
    label: skill,
    disabled: isBorrowedKnowledgeSkillProficient(context.character, skill)
  }));
  const defaultChoice = choices.find((choice) => !choice.disabled) ?? choices[0];

  return [
    {
      id: borrowedKnowledgeSkillOptionId,
      label: "Skill",
      defaultValue: defaultChoice?.value,
      choicePresentation: "select",
      choices
    }
  ];
}

export function getBorrowedKnowledgeSkillFromOptions(
  context: SpellImplementationStatusOptionsContext
): SkillName {
  const selectedSkill = context.options[borrowedKnowledgeSkillOptionId];

  return isSkillName(selectedSkill) ? selectedSkill : ALL_SKILLS[0];
}

function isBorrowedKnowledgeStatusEntry(entry: CharacterStatusEntry): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === borrowedKnowledgeSpellId &&
    entry.value === borrowedKnowledgeStatusValue &&
    isSkillName(entry.sourceSpellSkill) &&
    entry.disabled !== true
  );
}

export function getBorrowedKnowledgeSkillProficiencyEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): SkillProficiencyEntry[] {
  const borrowedKnowledgeSkills = new Set<SkillName>();

  normalizeCharacterStatusEntries(character.statusEntries).forEach((entry) => {
    if (isBorrowedKnowledgeStatusEntry(entry) && isSkillName(entry.sourceSpellSkill)) {
      borrowedKnowledgeSkills.add(entry.sourceSpellSkill);
    }
  });

  return [...borrowedKnowledgeSkills].map((skill) =>
    createSkillEntry(
      getSkillProficiencyForSkillName(skill),
      PROFICIENCY_SOURCE.SPELL,
      borrowedKnowledgeStatusValue,
      PROF_LEVEL.PROFICIENT,
      PROFICIENCY_OVERRIDE_POLICY.LOCKED
    )
  );
}
