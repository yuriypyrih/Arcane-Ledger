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
export const musicalInstrumentToolProficiencies: ToolProficiency[] = [
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_BAGPIPES,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DRUM,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DULCIMER,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_HORN,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LYRE,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_PAN_FLUTE,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_SHAWM,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_VIOL
];
export const gamingSetToolProficiencies: ToolProficiency[] = [
  TOOL_PROFICIENCY.GAMING_SET_DICE,
  TOOL_PROFICIENCY.GAMING_SET_DRAGONCHESS,
  TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
  TOOL_PROFICIENCY.GAMING_SET_THREE_DRAGON_ANTE
];
export const artisanToolProficiencies: ToolProficiency[] = [
  TOOL_PROFICIENCY.ALCHEMISTS_SUPPLIES,
  TOOL_PROFICIENCY.BREWERS_SUPPLIES,
  TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES,
  TOOL_PROFICIENCY.CARPENTERS_TOOLS,
  TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS,
  TOOL_PROFICIENCY.COBBLERS_TOOLS,
  TOOL_PROFICIENCY.COOKS_UTENSILS,
  TOOL_PROFICIENCY.GLASSBLOWERS_TOOLS,
  TOOL_PROFICIENCY.JEWELERS_TOOLS,
  TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS,
  TOOL_PROFICIENCY.MASONS_TOOLS,
  TOOL_PROFICIENCY.PAINTERS_SUPPLIES,
  TOOL_PROFICIENCY.POTTERS_TOOLS,
  TOOL_PROFICIENCY.SMITHS_TOOLKIT,
  TOOL_PROFICIENCY.TINKERS_TOOLS,
  TOOL_PROFICIENCY.WEAVERS_TOOLS,
  TOOL_PROFICIENCY.WOODCARVERS_TOOLS
];
export const languageProficiencyOptions: LANGUAGE_PROFICIENCY[] = [
  ...standardLanguageEntries.map((entry) => entry.proficiency),
  ...exoticLanguageEntries.map((entry) => entry.proficiency)
];

export const toolProficiencyLabels: Record<TOOL_PROFICIENCY, string> = {
  [TOOL_PROFICIENCY.THIEVES_TOOLKIT]: "Thieves' Tools",
  [TOOL_PROFICIENCY.SMITHS_TOOLKIT]: "Smith's Tools",
  [TOOL_PROFICIENCY.DISGUISE_KIT]: "Disguise Kit",
  [TOOL_PROFICIENCY.FORGERY_KIT]: "Forgery Kit",
  [TOOL_PROFICIENCY.POISONERS_KIT]: "Poisoner's Kit",
  [TOOL_PROFICIENCY.DISARM_KIT]: "Disarm Kit",
  [TOOL_PROFICIENCY.HERBALISM_KIT]: "Herbalism Kit",
  [TOOL_PROFICIENCY.NAVIGATORS_TOOLS]: "Navigator's Tools",
  [TOOL_PROFICIENCY.ALCHEMISTS_SUPPLIES]: "Alchemist's Supplies",
  [TOOL_PROFICIENCY.BREWERS_SUPPLIES]: "Brewer's Supplies",
  [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES]: "Calligrapher's Supplies",
  [TOOL_PROFICIENCY.CARPENTERS_TOOLS]: "Carpenter's Tools",
  [TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS]: "Cartographer's Tools",
  [TOOL_PROFICIENCY.COBBLERS_TOOLS]: "Cobbler's Tools",
  [TOOL_PROFICIENCY.COOKS_UTENSILS]: "Cook's Utensils",
  [TOOL_PROFICIENCY.GLASSBLOWERS_TOOLS]: "Glassblower's Tools",
  [TOOL_PROFICIENCY.JEWELERS_TOOLS]: "Jeweler's Tools",
  [TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS]: "Leatherworker's Tools",
  [TOOL_PROFICIENCY.MASONS_TOOLS]: "Mason's Tools",
  [TOOL_PROFICIENCY.PAINTERS_SUPPLIES]: "Painter's Supplies",
  [TOOL_PROFICIENCY.POTTERS_TOOLS]: "Potter's Tools",
  [TOOL_PROFICIENCY.TINKERS_TOOLS]: "Tinker's Tools",
  [TOOL_PROFICIENCY.WEAVERS_TOOLS]: "Weaver's Tools",
  [TOOL_PROFICIENCY.WOODCARVERS_TOOLS]: "Woodcarver's Tools",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_BAGPIPES]: "Bagpipes",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DRUM]: "Drum",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DULCIMER]: "Dulcimer",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE]: "Flute",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_HORN]: "Horn",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE]: "Lute",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LYRE]: "Lyre",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_PAN_FLUTE]: "Pan Flute",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_SHAWM]: "Shawm",
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_VIOL]: "Viol",
  [TOOL_PROFICIENCY.GAMING_SET_DICE]: "Dice Set",
  [TOOL_PROFICIENCY.GAMING_SET_DRAGONCHESS]: "Dragonchess Set",
  [TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS]: "Playing Card Set",
  [TOOL_PROFICIENCY.GAMING_SET_THREE_DRAGON_ANTE]: "Three-Dragon Ante Set"
};

const artisanToolProficiencySet = new Set<ToolProficiency>(artisanToolProficiencies);
const musicalInstrumentToolProficiencySet = new Set<ToolProficiency>(
  musicalInstrumentToolProficiencies
);
const gamingSetToolProficiencySet = new Set<ToolProficiency>(gamingSetToolProficiencies);

function sortToolProficienciesAlphabetically(
  toolProficiencies: readonly ToolProficiency[]
): ToolProficiency[] {
  return [...toolProficiencies].sort((left, right) =>
    toolProficiencyLabels[left].localeCompare(toolProficiencyLabels[right])
  );
}

export const groupedToolProficiencyOptions: ToolProficiency[] = [
  ...sortToolProficienciesAlphabetically(artisanToolProficiencies),
  ...sortToolProficienciesAlphabetically(musicalInstrumentToolProficiencies),
  ...sortToolProficienciesAlphabetically(gamingSetToolProficiencies),
  ...sortToolProficienciesAlphabetically(
    toolProficiencyOptions.filter(
      (tool) =>
        !artisanToolProficiencySet.has(tool) &&
        !musicalInstrumentToolProficiencySet.has(tool) &&
        !gamingSetToolProficiencySet.has(tool)
    )
  )
];

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
  return (
    value.startsWith(CUSTOM_LANGUAGE_PREFIX) &&
    value.slice(CUSTOM_LANGUAGE_PREFIX.length).trim().length > 0
  );
}

export function isLanguageProficiency(value: string): value is LanguageProficiency {
  return (
    builtInLanguageProficiencySet.has(value as LANGUAGE_PROFICIENCY) ||
    isCustomLanguageProficiency(value)
  );
}

export function getCustomLanguageNameFromProficiency(
  proficiency: LanguageProficiency
): string | null {
  return isCustomLanguageProficiency(proficiency)
    ? proficiency.slice(CUSTOM_LANGUAGE_PREFIX.length).trim() || null
    : null;
}

export function createCustomLanguageProficiency(
  name: string
): `${typeof CUSTOM_LANGUAGE_PREFIX}${string}` | null {
  const normalizedName = name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    return null;
  }

  return `${CUSTOM_LANGUAGE_PREFIX}${normalizedName}`;
}
