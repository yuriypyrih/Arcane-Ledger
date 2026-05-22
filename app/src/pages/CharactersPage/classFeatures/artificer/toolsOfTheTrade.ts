import type {
  Character,
  CharacterArtificerFeatureState,
  ToolProficiencyEntry
} from "../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  TOOL_PROFICIENCY
} from "../../../../types";
import { artisanToolProficiencies, type ToolProficiency } from "../../proficiencyOptions";
import { getToolLevelFromEntries } from "../../proficiency/manual";
import type { FeatureToolProficiencyEntry } from "../types";

const alchemistSubclassId = "artificer-alchemist";
const alchemistToolsOfTheTradeSource = "Alchemist: Tools of the Trade";
const alchemistToolsOfTheTradeDefaults = [
  TOOL_PROFICIENCY.ALCHEMISTS_SUPPLIES,
  TOOL_PROFICIENCY.HERBALISM_KIT
] as const;
const toolsOfTheTradeSelectionCount = alchemistToolsOfTheTradeDefaults.length;
const toolsOfTheTradeArtisanToolOptions = [...artisanToolProficiencies] as const;

type ArtificerToolsOfTheTradeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "subclassId" | "toolProficiencies">>;

function hasArtificerAlchemistToolsOfTheTradeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Artificer" &&
    character.subclassId === alchemistSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function isArtificerToolsOfTheTradeChoice(value: string): value is ToolProficiency {
  return toolsOfTheTradeArtisanToolOptions.some((option) => option === value);
}

function getPriorToolProficiencyEntries(
  character: ArtificerToolsOfTheTradeCharacter
): ToolProficiencyEntry[] {
  return (character.toolProficiencies ?? []).filter(
    (entry) => entry.sourceStr !== alchemistToolsOfTheTradeSource
  );
}

function hasPriorToolProficiency(
  character: ArtificerToolsOfTheTradeCharacter,
  proficiency: TOOL_PROFICIENCY
): boolean {
  return (
    getToolLevelFromEntries(getPriorToolProficiencyEntries(character), proficiency) !==
    PROF_LEVEL.NONE
  );
}

function getStoredArtificerToolsOfTheTradeChoices(value: unknown): ToolProficiency[] {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};

  if (!Array.isArray(record.toolsOfTheTradeToolProficiencies)) {
    return [];
  }

  return [...new Set(record.toolsOfTheTradeToolProficiencies)].filter(
    isArtificerToolsOfTheTradeChoice
  );
}

function isAvailableArtificerToolsOfTheTradeChoice(
  character: ArtificerToolsOfTheTradeCharacter,
  tool: ToolProficiency,
  blockedSelections: readonly ToolProficiency[] = []
): boolean {
  return (
    !getArtificerToolsOfTheTradeLockedSelectionsForCharacter(character).includes(tool) &&
    !blockedSelections.includes(tool) &&
    !hasPriorToolProficiency(character, tool)
  );
}

function createArtificerToolsOfTheTradeToolEntry(
  proficiency: TOOL_PROFICIENCY
): FeatureToolProficiencyEntry {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: alchemistToolsOfTheTradeSource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  } satisfies ToolProficiencyEntry;
}

export function normalizeArtificerToolsOfTheTradeState(
  value: unknown,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<CharacterArtificerFeatureState, "toolsOfTheTradeToolProficiencies"> {
  if (!hasArtificerAlchemistToolsOfTheTradeFeature(character)) {
    return {};
  }

  const choices = getStoredArtificerToolsOfTheTradeChoices(value).slice(
    0,
    toolsOfTheTradeSelectionCount
  );

  return choices.length > 0 ? { toolsOfTheTradeToolProficiencies: choices } : {};
}

export function getArtificerToolsOfTheTradeLockedSelectionsForCharacter(
  character: ArtificerToolsOfTheTradeCharacter
): TOOL_PROFICIENCY[] {
  if (!hasArtificerAlchemistToolsOfTheTradeFeature(character)) {
    return [];
  }

  return alchemistToolsOfTheTradeDefaults.filter(
    (proficiency) => !hasPriorToolProficiency(character, proficiency)
  );
}

export function getArtificerToolsOfTheTradeChoiceCountForCharacter(
  character: ArtificerToolsOfTheTradeCharacter
): number {
  if (!hasArtificerAlchemistToolsOfTheTradeFeature(character)) {
    return 0;
  }

  return Math.max(
    0,
    toolsOfTheTradeSelectionCount -
      getArtificerToolsOfTheTradeLockedSelectionsForCharacter(character).length
  );
}

export function getArtificerToolsOfTheTradeChoiceSelectionsForCharacter(
  character: ArtificerToolsOfTheTradeCharacter
): ToolProficiency[] {
  const choiceCount = getArtificerToolsOfTheTradeChoiceCountForCharacter(character);
  const selections: ToolProficiency[] = [];

  getStoredArtificerToolsOfTheTradeChoices(character.classFeatureState?.artificer).forEach(
    (selection) => {
      if (
        selections.length < choiceCount &&
        isAvailableArtificerToolsOfTheTradeChoice(character, selection, selections)
      ) {
        selections.push(selection);
      }
    }
  );

  return selections;
}

export function getArtificerToolsOfTheTradeAvailableToolSelectionsForCharacter(
  character: ArtificerToolsOfTheTradeCharacter,
  slotIndex: number
): ToolProficiency[] {
  const selections = getArtificerToolsOfTheTradeChoiceSelectionsForCharacter(character);
  const currentValue = selections[slotIndex] ?? null;
  const blockedSelections = selections.filter((_, index) => index !== slotIndex);

  return toolsOfTheTradeArtisanToolOptions.filter(
    (tool) =>
      currentValue === tool ||
      isAvailableArtificerToolsOfTheTradeChoice(character, tool, blockedSelections)
  );
}

export function getArtificerToolsOfTheTradeSelectionsForCharacter(
  character: ArtificerToolsOfTheTradeCharacter
): TOOL_PROFICIENCY[] {
  return [
    ...getArtificerToolsOfTheTradeLockedSelectionsForCharacter(character),
    ...getArtificerToolsOfTheTradeChoiceSelectionsForCharacter(character)
  ].slice(0, toolsOfTheTradeSelectionCount);
}

export function setArtificerToolsOfTheTradeToolSelectionsForCharacter(
  character: Character,
  selections: readonly string[]
): Character {
  const choiceCount = getArtificerToolsOfTheTradeChoiceCountForCharacter(character);
  const nextSelections: ToolProficiency[] = [];

  selections.forEach((selection) => {
    if (
      nextSelections.length < choiceCount &&
      isArtificerToolsOfTheTradeChoice(selection) &&
      isAvailableArtificerToolsOfTheTradeChoice(character, selection, nextSelections)
    ) {
      nextSelections.push(selection);
    }
  });

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...character.classFeatureState?.artificer,
        toolsOfTheTradeToolProficiencies: nextSelections.length > 0 ? nextSelections : undefined
      }
    }
  };
}

export function getArtificerToolsOfTheTradeToolProficiencyEntries(
  character: ArtificerToolsOfTheTradeCharacter
): FeatureToolProficiencyEntry[] {
  if (!hasArtificerAlchemistToolsOfTheTradeFeature(character)) {
    return [];
  }

  return getArtificerToolsOfTheTradeSelectionsForCharacter(character).map(
    createArtificerToolsOfTheTradeToolEntry
  );
}

export function isArtificerToolsOfTheTradeInputRequired(
  character: ArtificerToolsOfTheTradeCharacter
): boolean {
  return (
    getArtificerToolsOfTheTradeChoiceSelectionsForCharacter(character).length <
    getArtificerToolsOfTheTradeChoiceCountForCharacter(character)
  );
}
