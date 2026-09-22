import { useMemo } from "react";
import type {
  Character,
  CharacterClassEntry,
  SkillName,
  TOOL_PROFICIENCY
} from "../../../../types";
import { multiclassRules } from "../../../../codex/classes/multiclass";
import { getClassProficiencyProfile } from "../../../../pages/CharactersPage/proficiencyClassData";
import {
  getProficiencyLabel,
  getProficiencyRuntimeForCharacter
} from "../../../../pages/CharactersPage/proficiency";
import type { ClassDefinitionsDraft } from "../../../../pages/CharactersPage/classDefinitions";
import SelectInput from "../../FormInputs/SelectInput";
import { buildSkillSelectOptions } from "./helpers";
import styles from "./ClassDefinitionsEditor.module.css";

type Props = {
  character: Character;
  draft: ClassDefinitionsDraft;
  entry: CharacterClassEntry;
  onChange: (draft: ClassDefinitionsDraft) => void;
};

export default function ClassTrainingChoices({ character, draft, entry, onChange }: Props) {
  const primary = entry.id === draft.progression.startingClassId;
  const profile = getClassProficiencyProfile(entry.className);
  const runtime = useMemo(() => getProficiencyRuntimeForCharacter(character), [character]);
  const skills = primary ? draft.startingSkills : (entry.skillChoices ?? []);
  const tools = primary ? draft.startingTools : (entry.toolChoices ?? []);
  const skillCount = primary
    ? (profile?.skillProficiencyCount ?? 0)
    : (multiclassRules[entry.className]?.skillChoices ?? 0);
  const toolCount = primary
    ? (profile?.toolProficiencyChoiceCount ?? 0)
    : (multiclassRules[entry.className]?.instrumentChoices ?? 0);
  const otherClasses = draft.progression.classes.filter((item) => item.id !== entry.id);
  const otherSkills = otherClasses.flatMap((item) =>
    item.id === draft.progression.startingClassId ? draft.startingSkills : (item.skillChoices ?? [])
  );
  const otherTools = otherClasses.flatMap((item) =>
    item.id === draft.progression.startingClassId ? draft.startingTools : (item.toolChoices ?? [])
  );
  const toolOptions = profile?.toolProficiencyChoices ?? [];
  const instrumentOnly =
    toolOptions.length > 0 && toolOptions.every((tool) => tool.startsWith("MUSICAL_INSTRUMENT_"));
  const toolLabel = instrumentOnly ? "Instrument proficiency" : "Tool proficiency";
  const name = entry.customClass?.name || entry.className;
  function update(kind: "skills" | "tools", index: number, value: string) {
    const values: string[] = [...(kind === "skills" ? skills : tools)];
    values[index] = value;
    if (primary) {
      onChange({
        ...draft,
        ...(kind === "skills"
          ? { startingSkills: values as SkillName[] }
          : { startingTools: values as TOOL_PROFICIENCY[] })
      });
    } else {
      onChange({
        ...draft,
        progression: {
          ...draft.progression,
          classes: draft.progression.classes.map((item) =>
            item.id === entry.id
              ? {
                  ...item,
                  ...(kind === "skills"
                    ? { skillChoices: values as SkillName[] }
                    : { toolChoices: values as TOOL_PROFICIENCY[] })
                }
              : item
          )
        }
      });
    }
  }
  return (
    <div className={styles.choices}>
      {Array.from({ length: skillCount }, (_, index) => {
        const value = skills[index] ?? "";
        const available = runtime.effectiveChoices.unproficientSkills(
          profile?.skillProficiencyOptions ?? [],
          value || undefined,
          [...otherSkills, ...skills.filter((_, position) => position !== index)]
        );
        return (
          <label key={`skill-${index}`} className={styles.field}>
            <span>Skill proficiency{skillCount > 1 ? ` ${index + 1}` : ""}</span>
            <SelectInput
              compact
              aria-label={`${name} skill proficiency${skillCount > 1 ? ` ${index + 1}` : ""}`}
              value={value}
              onChange={(event) => update("skills", index, event.target.value)}
            >
              <option value="">Choose a skill</option>
              {buildSkillSelectOptions(
                profile?.skillProficiencyOptions ?? [],
                available,
                value || undefined
              ).map((option) => (
                <option key={option.skill} value={option.skill} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </label>
        );
      })}
      {Array.from({ length: toolCount }, (_, index) => {
        const value = tools[index] ?? "";
        const available = runtime.effectiveChoices.unproficientTools(
          toolOptions,
          value || undefined,
          [...otherTools, ...tools.filter((_, position) => position !== index)]
        );
        return (
          <label key={`tool-${index}`} className={styles.field}>
            <span>
              {toolLabel}
              {toolCount > 1 ? ` ${index + 1}` : ""}
            </span>
            <SelectInput
              compact
              aria-label={`${name} ${toolLabel.toLowerCase()}${toolCount > 1 ? ` ${index + 1}` : ""}`}
              value={value}
              onChange={(event) => update("tools", index, event.target.value)}
            >
              <option value="">Choose {instrumentOnly ? "an instrument" : "a tool"}</option>
              {toolOptions.map((tool) => (
                <option key={tool} value={tool} disabled={!available.includes(tool)}>
                  {getProficiencyLabel(tool)}
                </option>
              ))}
            </SelectInput>
          </label>
        );
      })}
    </div>
  );
}
