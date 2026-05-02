import { TOOL_PROFICIENCY } from "../../../types/proficiencies";

export type StarterPackToolItemMapping = {
  label: string;
  itemKey: string | null;
  warning?: string;
};

export const starterPackMusicalInstrumentTools: TOOL_PROFICIENCY[] = [
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

export const starterPackArtisanTools: TOOL_PROFICIENCY[] = [
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

const toolItemMappings: Partial<Record<TOOL_PROFICIENCY, StarterPackToolItemMapping>> = {
  [TOOL_PROFICIENCY.THIEVES_TOOLKIT]: {
    label: "Thieves' Tools",
    itemKey: "srd-2024_thieves-tools"
  },
  [TOOL_PROFICIENCY.HERBALISM_KIT]: {
    label: "Herbalism Kit",
    itemKey: "srd-2024_herbalism-kit"
  },
  [TOOL_PROFICIENCY.FORGERY_KIT]: {
    label: "Forgery Kit",
    itemKey: "srd-2024_forgery-kit"
  },
  [TOOL_PROFICIENCY.NAVIGATORS_TOOLS]: {
    label: "Navigator's Tools",
    itemKey: "srd-2024_navigators-tools"
  },
  [TOOL_PROFICIENCY.ALCHEMISTS_SUPPLIES]: {
    label: "Alchemist's Supplies",
    itemKey: "srd-2024_alchemists-supplies"
  },
  [TOOL_PROFICIENCY.BREWERS_SUPPLIES]: {
    label: "Brewer's Supplies",
    itemKey: "srd-2024_brewers-supplies"
  },
  [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES]: {
    label: "Calligrapher's Supplies",
    itemKey: "srd-2024_calligraphers-supplies"
  },
  [TOOL_PROFICIENCY.CARPENTERS_TOOLS]: {
    label: "Carpenter's Tools",
    itemKey: "srd-2024_carpenters-tools"
  },
  [TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS]: {
    label: "Cartographer's Tools",
    itemKey: "srd-2024_cartographers-tools"
  },
  [TOOL_PROFICIENCY.COBBLERS_TOOLS]: {
    label: "Cobbler's Tools",
    itemKey: "srd-2024_cobblers-tools"
  },
  [TOOL_PROFICIENCY.COOKS_UTENSILS]: {
    label: "Cook's Utensils",
    itemKey: "srd-2024_cooks-utensils"
  },
  [TOOL_PROFICIENCY.GLASSBLOWERS_TOOLS]: {
    label: "Glassblower's Tools",
    itemKey: "srd-2024_glassblowers-tools"
  },
  [TOOL_PROFICIENCY.JEWELERS_TOOLS]: {
    label: "Jeweler's Tools",
    itemKey: "srd-2024_jewelers-tools"
  },
  [TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS]: {
    label: "Leatherworker's Tools",
    itemKey: "srd-2024_leatherworkers-tools"
  },
  [TOOL_PROFICIENCY.MASONS_TOOLS]: {
    label: "Mason's Tools",
    itemKey: "srd-2024_masons-tools"
  },
  [TOOL_PROFICIENCY.PAINTERS_SUPPLIES]: {
    label: "Painter's Supplies",
    itemKey: "srd-2024_painters-supplies"
  },
  [TOOL_PROFICIENCY.POTTERS_TOOLS]: {
    label: "Potter's Tools",
    itemKey: "srd-2024_potters-tools"
  },
  [TOOL_PROFICIENCY.SMITHS_TOOLKIT]: {
    label: "Smith's Tools",
    itemKey: "srd-2024_smiths-tools"
  },
  [TOOL_PROFICIENCY.TINKERS_TOOLS]: {
    label: "Tinker's Tools",
    itemKey: "srd-2024_tinkers-tools"
  },
  [TOOL_PROFICIENCY.WEAVERS_TOOLS]: {
    label: "Weaver's Tools",
    itemKey: "srd-2024_weavers-tools"
  },
  [TOOL_PROFICIENCY.WOODCARVERS_TOOLS]: {
    label: "Woodcarver's Tools",
    itemKey: "srd-2024_woodcarvers-tools"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_BAGPIPES]: {
    label: "Bagpipes",
    itemKey: "srd-2024_musical-instrument-bagpipes"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DRUM]: {
    label: "Drum",
    itemKey: "srd-2024_musical-instrument-drum"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DULCIMER]: {
    label: "Dulcimer",
    itemKey: "srd-2024_musical-instrument-dulcimer"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE]: {
    label: "Flute",
    itemKey: "srd-2024_musical-instrument-flute"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_HORN]: {
    label: "Horn",
    itemKey: "srd-2024_musical-instrument-horn"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE]: {
    label: "Lute",
    itemKey: "srd-2024_musical-instrument-lute"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LYRE]: {
    label: "Lyre",
    itemKey: "srd-2024_musical-instrument-lyre"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_PAN_FLUTE]: {
    label: "Pan Flute",
    itemKey: "srd-2024_musical-instrument-pan-flute"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_SHAWM]: {
    label: "Shawm",
    itemKey: "srd-2024_musical-instrument-shawm"
  },
  [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_VIOL]: {
    label: "Viol",
    itemKey: "srd-2024_musical-instrument-viol"
  },
  [TOOL_PROFICIENCY.GAMING_SET_DICE]: {
    label: "Dice Set",
    itemKey: "srd-2024_gaming-set-dice"
  },
  [TOOL_PROFICIENCY.GAMING_SET_DRAGONCHESS]: {
    label: "Dragonchess Set",
    itemKey: "srd-2024_gaming-set-dragonchess"
  },
  [TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS]: {
    label: "Playing Card Set",
    itemKey: "srd-2024_gaming-set-playing-cards"
  },
  [TOOL_PROFICIENCY.GAMING_SET_THREE_DRAGON_ANTE]: {
    label: "Three-Dragon Ante Set",
    itemKey: "srd-2024_gaming-set-three-dragon-ante"
  }
};

export function getStarterPackToolItemMapping(
  toolProficiency: TOOL_PROFICIENCY | string
): StarterPackToolItemMapping | null {
  return toolItemMappings[toolProficiency as TOOL_PROFICIENCY] ?? null;
}

export function isStarterPackMusicalInstrumentTool(
  toolProficiency: TOOL_PROFICIENCY | string
): boolean {
  return starterPackMusicalInstrumentTools.includes(toolProficiency as TOOL_PROFICIENCY);
}
