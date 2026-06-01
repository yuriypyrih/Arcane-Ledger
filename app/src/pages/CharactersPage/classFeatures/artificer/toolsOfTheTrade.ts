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
const armorerSubclassId = "artificer-armorer";
const armorerToolsOfTheTradeSource = "Armorer: Tools of the Trade";
const armorerToolsOfTheTradeDefaults = [TOOL_PROFICIENCY.SMITHS_TOOLKIT] as const;
const artilleristSubclassId = "artificer-artillerist";
const artilleristToolsOfTheTradeSource = "Artillerist: Tools of the Trade";
const artilleristToolsOfTheTradeDefaults = [TOOL_PROFICIENCY.WOODCARVERS_TOOLS] as const;
const battleSmithSubclassId = "artificer-battle-smith";
const battleSmithToolsOfTheTradeSource = "Battle Smith: Tools of the Trade";
const battleSmithToolsOfTheTradeDefaults = [TOOL_PROFICIENCY.SMITHS_TOOLKIT] as const;
const cartographerSubclassId = "artificer-cartographer";
const cartographerToolsOfTheTradeSource = "Cartographer: Tools of the Trade";
const cartographerToolsOfTheTradeDefaults = [
  TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES,
  TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS
] as const;
const toolsOfTheTradeArtisanToolOptions = [...artisanToolProficiencies] as const;

type ArtificerToolsOfTheTradeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "subclassId" | "toolProficiencies">>;

type ArtificerToolsOfTheTradeConfig = {
  subclassId: string;
  source: string;
  defaultTools: readonly TOOL_PROFICIENCY[];
};

const toolsOfTheTradeConfigs: ArtificerToolsOfTheTradeConfig[] = [
  {
    subclassId: alchemistSubclassId,
    source: alchemistToolsOfTheTradeSource,
    defaultTools: alchemistToolsOfTheTradeDefaults
  },
  {
    subclassId: armorerSubclassId,
    source: armorerToolsOfTheTradeSource,
    defaultTools: armorerToolsOfTheTradeDefaults
  },
  {
    subclassId: artilleristSubclassId,
    source: artilleristToolsOfTheTradeSource,
    defaultTools: artilleristToolsOfTheTradeDefaults
  },
  {
    subclassId: battleSmithSubclassId,
    source: battleSmithToolsOfTheTradeSource,
    defaultTools: battleSmithToolsOfTheTradeDefaults
  },
  {
    subclassId: cartographerSubclassId,
    source: cartographerToolsOfTheTradeSource,
    defaultTools: cartographerToolsOfTheTradeDefaults
  }
];

function getArtificerToolsOfTheTradeConfig(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ArtificerToolsOfTheTradeConfig | null {
  if (character.className !== "Artificer" || (character.level ?? 0) < 3) {
    return null;
  }

  return (
    toolsOfTheTradeConfigs.find((config) => config.subclassId === character.subclassId) ?? null
  );
}

function isArtificerToolsOfTheTradeChoice(value: string): value is ToolProficiency {
  return toolsOfTheTradeArtisanToolOptions.some((option) => option === value);
}

function getPriorToolProficiencyEntries(
  character: ArtificerToolsOfTheTradeCharacter
): ToolProficiencyEntry[] {
  const activeConfig = getArtificerToolsOfTheTradeConfig(character);

  return (character.toolProficiencies ?? []).filter(
    (entry) => entry.sourceStr !== activeConfig?.source
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
  config: ArtificerToolsOfTheTradeConfig,
  proficiency: TOOL_PROFICIENCY
): FeatureToolProficiencyEntry {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: config.source,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  } satisfies ToolProficiencyEntry;
}

export function normalizeArtificerToolsOfTheTradeState(
  value: unknown,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<CharacterArtificerFeatureState, "toolsOfTheTradeToolProficiencies"> {
  const activeConfig = getArtificerToolsOfTheTradeConfig(character);

  if (!activeConfig) {
    return {};
  }

  const choices = getStoredArtificerToolsOfTheTradeChoices(value).slice(
    0,
    activeConfig.defaultTools.length
  );

  return choices.length > 0 ? { toolsOfTheTradeToolProficiencies: choices } : {};
}

export function getArtificerToolsOfTheTradeLockedSelectionsForCharacter(
  character: ArtificerToolsOfTheTradeCharacter
): TOOL_PROFICIENCY[] {
  const activeConfig = getArtificerToolsOfTheTradeConfig(character);

  if (!activeConfig) {
    return [];
  }

  return activeConfig.defaultTools.filter(
    (proficiency) => !hasPriorToolProficiency(character, proficiency)
  );
}

export function getArtificerToolsOfTheTradeChoiceCountForCharacter(
  character: ArtificerToolsOfTheTradeCharacter
): number {
  const activeConfig = getArtificerToolsOfTheTradeConfig(character);

  if (!activeConfig) {
    return 0;
  }

  return Math.max(
    0,
    activeConfig.defaultTools.length -
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
  const activeConfig = getArtificerToolsOfTheTradeConfig(character);

  if (!activeConfig) {
    return [];
  }

  return [
    ...getArtificerToolsOfTheTradeLockedSelectionsForCharacter(character),
    ...getArtificerToolsOfTheTradeChoiceSelectionsForCharacter(character)
  ].slice(0, activeConfig.defaultTools.length);
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
  const activeConfig = getArtificerToolsOfTheTradeConfig(character);

  if (!activeConfig) {
    return [];
  }

  return getArtificerToolsOfTheTradeSelectionsForCharacter(character).map((selection) =>
    createArtificerToolsOfTheTradeToolEntry(activeConfig, selection)
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
