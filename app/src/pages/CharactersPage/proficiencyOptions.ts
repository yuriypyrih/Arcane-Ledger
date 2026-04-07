import type { LanguageProficiency } from "../../types";
import {
  ALL_SKILLS,
  CUSTOM_LANGUAGE_PREFIX,
  LANGUAGE_PROFICIENCY,
  TOOL_PROFICIENCY,
  exoticLanguageEntries,
  standardLanguageEntries
} from "../../types";

export const skillsOptions = ALL_SKILLS;
export type ToolProficiency = TOOL_PROFICIENCY;
export type LanguageOption = LanguageProficiency;

export const toolProficiencyOptions = Object.values(TOOL_PROFICIENCY) as ToolProficiency[];
export const languageProficiencyOptions: LANGUAGE_PROFICIENCY[] = [
  ...standardLanguageEntries.map((entry) => entry.proficiency),
  ...exoticLanguageEntries.map((entry) => entry.proficiency)
];

export const toolProficiencyLabels: Record<TOOL_PROFICIENCY, string> = {
  [TOOL_PROFICIENCY.THIEVES_TOOLKIT]: "Thieves' Toolkit",
  [TOOL_PROFICIENCY.SMITHS_TOOLKIT]: "Smith's Toolkit",
  [TOOL_PROFICIENCY.DISGUISE_KIT]: "Disguise Kit",
  [TOOL_PROFICIENCY.DISARM_KIT]: "Disarm Kit"
};

export const languageProficiencyLabels: Record<LANGUAGE_PROFICIENCY, string> = {
  [LANGUAGE_PROFICIENCY.COMMON]: "Common",
  [LANGUAGE_PROFICIENCY.ABYSSAL]: "Abyssal",
  [LANGUAGE_PROFICIENCY.CELESTIAL]: "Celestial",
  [LANGUAGE_PROFICIENCY.DEEP_SPEECH]: "Deep Speech",
  [LANGUAGE_PROFICIENCY.DRACONIC]: "Draconic",
  [LANGUAGE_PROFICIENCY.DRUIDIC]: "Druidic",
  [LANGUAGE_PROFICIENCY.DWARVISH]: "Dwarvish",
  [LANGUAGE_PROFICIENCY.ELVISH]: "Elvish",
  [LANGUAGE_PROFICIENCY.GIANT]: "Giant",
  [LANGUAGE_PROFICIENCY.GNOMISH]: "Gnomish",
  [LANGUAGE_PROFICIENCY.GOBLIN]: "Goblin",
  [LANGUAGE_PROFICIENCY.HALFLING]: "Halfling",
  [LANGUAGE_PROFICIENCY.INFERNAL]: "Infernal",
  [LANGUAGE_PROFICIENCY.ORC]: "Orc",
  [LANGUAGE_PROFICIENCY.PRIMORDIAL]: "Primordial",
  [LANGUAGE_PROFICIENCY.SYLVAN]: "Sylvan",
  [LANGUAGE_PROFICIENCY.THIEVES_CANT]: "Thieves' Cant",
  [LANGUAGE_PROFICIENCY.UNDERCOMMON]: "Undercommon"
};

const builtInLanguageProficiencySet = new Set<LANGUAGE_PROFICIENCY>(
  Object.values(LANGUAGE_PROFICIENCY) as LANGUAGE_PROFICIENCY[]
);

export function getToolProficiencyLabel(toolProficiency: ToolProficiency): string {
  return toolProficiencyLabels[toolProficiency];
}

export function isCustomLanguageProficiency(
  value: string
): value is `${typeof CUSTOM_LANGUAGE_PREFIX}${string}` {
  return value.startsWith(CUSTOM_LANGUAGE_PREFIX) && value.slice(CUSTOM_LANGUAGE_PREFIX.length).trim().length > 0;
}

export function isLanguageProficiency(value: string): value is LanguageProficiency {
  return builtInLanguageProficiencySet.has(value as LANGUAGE_PROFICIENCY) || isCustomLanguageProficiency(value);
}

export function getCustomLanguageNameFromProficiency(proficiency: LanguageProficiency): string | null {
  return isCustomLanguageProficiency(proficiency)
    ? proficiency.slice(CUSTOM_LANGUAGE_PREFIX.length).trim() || null
    : null;
}

export function createCustomLanguageProficiency(name: string): `${typeof CUSTOM_LANGUAGE_PREFIX}${string}` | null {
  const normalizedName = name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    return null;
  }

  return `${CUSTOM_LANGUAGE_PREFIX}${normalizedName}`;
}
