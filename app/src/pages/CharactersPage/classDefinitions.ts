import type { Character, CharacterClassEntry, CharacterMulticlass, SkillName } from "../../types";
import { PROFICIENCY_SOURCE, PROF_LEVEL } from "../../types";
import { createMulticlassDraft, applyClassProgression } from "./multiclassProgression";
import { getClassEditorCharacter, readMulticlass } from "./multiclass";
import {
  createSkillEntry,
  createToolEntry,
  getSkillProficiencyForName,
  getSelectedClassSkillSelectionsFromEntries,
  getSelectedClassToolSelectionsFromEntries,
  normalizeSkillSelectionsForClass,
  normalizeToolSelectionsForClass
} from "./proficiency";
import type { ToolProficiency } from "./proficiencyOptions";
import {
  getCharacterClassRulesConfig,
  normalizeCharacterClassRulesConfig,
  normalizeCustomClassConfig
} from "./customClass";
import { seedClassRulesDefaultsForCharacter } from "./classRulesDefaults";
import { normalizeCharacter } from "./storage";

export type ClassDefinitionsDraft = {
  progression: CharacterMulticlass;
  startingSkills: SkillName[];
  startingTools: ToolProficiency[];
};

export function createClassDefinitionsDraft(character: Character): ClassDefinitionsDraft {
  return {
    progression: createMulticlassDraft(character),
    startingSkills: getSelectedClassSkillSelectionsFromEntries(
      character.skillProficiencies,
      character.className
    ),
    startingTools: getSelectedClassToolSelectionsFromEntries(
      character.toolProficiencies,
      character.className
    )
  };
}

export function createDeclaredClass(className = "", level = 0): CharacterClassEntry {
  const id = `class-${crypto.randomUUID()}`;
  return {
    id,
    className,
    level,
    ...(className === "Custom"
      ? {
          customClass: {
            ...normalizeCustomClassConfig({}),
            id,
            name: "Custom class",
            castingProgression: "none" as const
          }
        }
      : {})
  };
}

export function removeDeclaredClass(state: CharacterMulticlass, id: string): CharacterMulticlass {
  if (id === state.startingClassId) throw new Error("The starting class cannot be removed.");
  const removed = state.classes.find((entry) => entry.id === id);
  if (!removed) return state;
  return {
    ...state,
    classes: state.classes
      .filter((entry) => entry.id !== id)
      .map((entry) =>
        entry.id === state.startingClassId
          ? { ...entry, level: entry.level + removed.level }
          : entry
      )
  };
}

/** Reuse the existing subclass editor's rules transition independently for each class. */
export function setEntryRulesEnforced(
  character: Character,
  entry: CharacterClassEntry,
  enforced: boolean
): CharacterClassEntry {
  const view = getClassEditorCharacter(character, entry);
  const previous = getCharacterClassRulesConfig(view);
  const input = { ...previous, classRulesEnforced: entry.className !== "Custom" && enforced };
  return {
    ...entry,
    classRules: normalizeCharacterClassRulesConfig(
      previous.classRulesEnforced && !enforced && entry.className !== "Custom"
        ? seedClassRulesDefaultsForCharacter(view, input)
        : input,
      { className: entry.className, legacyCustomClass: entry.customClass }
    )
  };
}

export function applyClassDefinitions(
  character: Character,
  draft: ClassDefinitionsDraft
): Character {
  const original = createMulticlassDraft(character);
  const state = draft.progression;
  const starting = state.classes.find((entry) => entry.id === original.startingClassId);
  if (
    state.startingClassId !== original.startingClassId ||
    !starting ||
    starting.className !== character.className
  )
    throw new Error("The starting class cannot be changed or removed.");
  if (
    !readMulticlass(state) ||
    state.classes.reduce((sum, entry) => sum + entry.level, 0) !== character.level
  )
    throw new Error(
      "Choose a distinct class for every row and preserve the total character level."
    );
  if (
    state.classes.some(
      (entry) =>
        (entry.className === "Custom" && !entry.customClass?.name?.trim()) ||
        (entry.customSubclass &&
          entry.customSubclass.id === entry.subclassId &&
          !entry.customSubclass.name.trim())
    )
  )
    throw new Error("Enter a name for each custom class and subclass.");
  const skills = normalizeSkillSelectionsForClass(character.className, draft.startingSkills);
  const tools = normalizeToolSelectionsForClass(character.className, draft.startingTools);
  const base: Character = {
    ...character,
    skillProficiencies: [
      ...character.skillProficiencies.filter(
        (entry) =>
          !(entry.source === PROFICIENCY_SOURCE.CLASS && entry.sourceStr === character.className)
      ),
      ...skills.map((skill) =>
        createSkillEntry(
          getSkillProficiencyForName(skill)!,
          PROFICIENCY_SOURCE.CLASS,
          character.className,
          PROF_LEVEL.PROFICIENT
        )
      )
    ],
    toolProficiencies: [
      ...character.toolProficiencies.filter(
        (entry) =>
          !(entry.source === PROFICIENCY_SOURCE.CLASS && entry.sourceStr === character.className)
      ),
      ...tools.map((tool) =>
        createToolEntry(tool, PROFICIENCY_SOURCE.CLASS, character.className, PROF_LEVEL.PROFICIENT)
      )
    ]
  };
  if (!character.multiclass && state.classes.length === 1) {
    return (
      normalizeCharacter({
        ...base,
        subclassId: starting.subclassId,
        customSubclass: starting.customSubclass,
        customClass: starting.customClass,
        classRules: starting.classRules
      }) ?? base
    );
  }
  // Definitions must not replace resource spending or spell choices made since the editor opened.
  const current = createMulticlassDraft(base);
  const progression = {
    ...current,
    classes: state.classes.map((entry) => {
      const existing = current.classes.find((item) => item.id === entry.id);
      if (!existing) return entry;
      return {
        ...existing,
        className: entry.className,
        level: entry.level,
        subclassId: entry.subclassId,
        customSubclass: entry.customSubclass,
        customClass: entry.customClass,
        classRules: entry.classRules,
        skillChoices: entry.skillChoices,
        toolChoices: entry.toolChoices
      };
    })
  };
  return { ...applyClassProgression(base, progression, character.xp), xp: character.xp };
}
