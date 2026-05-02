import { TOOL_PROFICIENCY } from "../../types/proficiencies";
import { SKILL } from "../../types/skills";
import {
  starterPackChoice,
  starterPackCurrency,
  starterPackItem,
  starterPackSelectedTool
} from "../classes/starterPack";
import {
  BACKGROUND_TYPES,
  CURRENCY_TYPE,
  ENTRY_CATEGORIES,
  FEATS,
  SPELL_LIST_CLASS
} from "./enums";
import type { BackgroundEntry } from "./types";

export const backgroundEntries: BackgroundEntry[] = [
  {
    id: "background-acolyte-2024",
    name: "Acolyte",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.RELIGIOUS],
    source: "PHB'24",
    page: 178,
    abilityScoreOptions: ["INT", "WIS", "CHA"],
    originFeat: FEATS.MAGIC_INITIATE,
    originFeatSpellList: SPELL_LIST_CLASS.CLERIC,
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.RELIGION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_calligraphers-supplies", "Calligrapher's Supplies"),
          starterPackItem("srd-2024_book", "Book (prayers)"),
          starterPackItem("srd-2024_holy-symbol-amulet", "Holy Symbol"),
          starterPackItem("srd-2024_parchment", "Parchment", 10),
          starterPackItem("srd-2024_robe", "Robe"),
          starterPackCurrency(8, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-artisan-2024",
    name: "Artisan",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.CRAFT],
    source: "PHB'24",
    page: 179,
    abilityScoreOptions: ["STR", "DEX", "INT"],
    originFeat: FEATS.CRAFTER,
    grantedSkillProficiencies: [SKILL.INVESTIGATION, SKILL.PERSUASION],
    grantedToolProficiencies: [],
    toolProficiencyChoices: [
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
    ],
    toolProficiencyChoiceLabel: "Artisan's Tools",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.SMITHS_TOOLKIT,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackSelectedTool("Artisan's Tools"),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(32, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-charlatan-2024",
    name: "Charlatan",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    source: "PHB'24",
    page: 180,
    abilityScoreOptions: ["DEX", "CON", "CHA"],
    originFeat: FEATS.SKILLED,
    grantedSkillProficiencies: [SKILL.DECEPTION, SKILL.SLEIGHT_OF_HAND],
    grantedToolProficiencies: [TOOL_PROFICIENCY.FORGERY_KIT],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_forgery-kit", "Forgery Kit"),
          starterPackItem("srd-2024_costume", "Costume"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackCurrency(15, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-criminal-2024",
    name: "Criminal",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    source: "PHB'24",
    page: 180,
    abilityScoreOptions: ["DEX", "CON", "INT"],
    originFeat: FEATS.ALERT,
    grantedSkillProficiencies: [SKILL.SLEIGHT_OF_HAND, SKILL.STEALTH],
    grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_dagger", "Dagger", 2),
          starterPackItem("srd-2024_thieves-tools", "Thieves' Tools"),
          starterPackItem("srd-2024_crowbar", "Crowbar"),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(16, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-entertainer-2024",
    name: "Entertainer",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.PERFORMER],
    source: "PHB'24",
    page: 180,
    abilityScoreOptions: ["STR", "DEX", "CHA"],
    originFeat: FEATS.MUSICIAN,
    grantedSkillProficiencies: [SKILL.ACROBATICS, SKILL.PERFORMANCE],
    grantedToolProficiencies: [],
    toolProficiencyChoices: [
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
    ],
    toolProficiencyChoiceLabel: "Musical Instrument",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackSelectedTool("Musical Instrument"),
          starterPackItem("srd-2024_costume", "Costume", 2),
          starterPackItem("srd-2024_mirror", "Mirror"),
          starterPackItem("srd-2024_perfume", "Perfume"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(11, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-farmer-2024",
    name: "Farmer",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.COMMONER],
    source: "PHB'24",
    page: 180,
    abilityScoreOptions: ["STR", "CON", "WIS"],
    originFeat: FEATS.TOUGH,
    grantedSkillProficiencies: [SKILL.ANIMAL_HANDLING, SKILL.NATURE],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CARPENTERS_TOOLS],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_sickle", "Sickle"),
          starterPackItem("srd-2024_carpenters-tools", "Carpenter's Tools"),
          starterPackItem("srd-2024_healers-kit", "Healer's Kit"),
          starterPackItem("srd_pot-iron", "Iron Pot"),
          starterPackItem("srd-2024_shovel", "Shovel"),
          starterPackCurrency(30, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-guard-2024",
    name: "Guard",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.MILITARY],
    source: "PHB'24",
    page: 181,
    abilityScoreOptions: ["STR", "INT", "WIS"],
    originFeat: FEATS.ALERT,
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.PERCEPTION],
    grantedToolProficiencies: [],
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.GAMING_SET_DICE,
      TOOL_PROFICIENCY.GAMING_SET_DRAGONCHESS,
      TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      TOOL_PROFICIENCY.GAMING_SET_THREE_DRAGON_ANTE
    ],
    toolProficiencyChoiceLabel: "Gaming Set",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_spear", "Spear"),
          starterPackItem("srd-2024_light-crossbow", "Light Crossbow"),
          starterPackItem("srd-2024_bolts-20", "Bolts (20)"),
          starterPackSelectedTool("Gaming Set"),
          starterPackItem("srd-2024_lantern-hooded", "Hooded Lantern"),
          starterPackItem("srd-2024_manacles", "Manacles"),
          starterPackItem("srd-2024_quiver", "Quiver"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(12, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-guide-2024",
    name: "Guide",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.WILDERNESS],
    source: "PHB'24",
    page: 181,
    abilityScoreOptions: ["DEX", "CON", "WIS"],
    originFeat: FEATS.MAGIC_INITIATE,
    originFeatSpellList: SPELL_LIST_CLASS.DRUID,
    grantedSkillProficiencies: [SKILL.STEALTH, SKILL.SURVIVAL],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_shortbow", "Shortbow"),
          starterPackItem("srd-2024_arrows-20", "Arrows (20)"),
          starterPackItem("srd-2024_cartographers-tools", "Cartographer's Tools"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_quiver", "Quiver"),
          starterPackItem("srd-2024_tent", "Tent"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(3, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-hermit-2024",
    name: "Hermit",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.RECLUSIVE],
    source: "PHB'24",
    page: 182,
    abilityScoreOptions: ["CON", "WIS", "CHA"],
    originFeat: FEATS.HEALER,
    grantedSkillProficiencies: [SKILL.MEDICINE, SKILL.RELIGION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.HERBALISM_KIT],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_quarterstaff", "Quarterstaff"),
          starterPackItem("srd-2024_herbalism-kit", "Herbalism Kit"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_book", "Book (philosophy)"),
          starterPackItem("srd-2024_lamp", "Lamp"),
          starterPackItem("srd-2024_oil", "Oil", 3),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(16, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-merchant-2024",
    name: "Merchant",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.CRAFT],
    source: "PHB'24",
    page: 182,
    abilityScoreOptions: ["CON", "INT", "CHA"],
    originFeat: FEATS.LUCKY,
    grantedSkillProficiencies: [SKILL.ANIMAL_HANDLING, SKILL.PERSUASION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.NAVIGATORS_TOOLS],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_navigators-tools", "Navigator's Tools"),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(22, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-noble-2024",
    name: "Noble",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.NOBILITY],
    source: "PHB'24",
    page: 183,
    abilityScoreOptions: ["STR", "INT", "CHA"],
    originFeat: FEATS.SKILLED,
    grantedSkillProficiencies: [SKILL.HISTORY, SKILL.PERSUASION],
    grantedToolProficiencies: [],
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.GAMING_SET_DICE,
      TOOL_PROFICIENCY.GAMING_SET_DRAGONCHESS,
      TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      TOOL_PROFICIENCY.GAMING_SET_THREE_DRAGON_ANTE
    ],
    toolProficiencyChoiceLabel: "Gaming Set",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackSelectedTool("Gaming Set"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackItem("srd-2024_perfume", "Perfume"),
          starterPackCurrency(29, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-sage-2024",
    name: "Sage",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.SCHOLAR],
    source: "PHB'24",
    page: 183,
    abilityScoreOptions: ["CON", "INT", "WIS"],
    originFeat: FEATS.MAGIC_INITIATE,
    originFeatSpellList: SPELL_LIST_CLASS.WIZARD,
    grantedSkillProficiencies: [SKILL.ARCANA, SKILL.HISTORY],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_quarterstaff", "Quarterstaff"),
          starterPackItem("srd-2024_calligraphers-supplies", "Calligrapher's Supplies"),
          starterPackItem("srd-2024_book", "Book (history)"),
          starterPackItem("srd-2024_parchment", "Parchment", 8),
          starterPackItem("srd-2024_robe", "Robe"),
          starterPackCurrency(8, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-sailor-2024",
    name: "Sailor",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.SEAFARING],
    source: "PHB'24",
    page: 184,
    abilityScoreOptions: ["STR", "DEX", "WIS"],
    originFeat: FEATS.TAVERN_BRAWLER,
    grantedSkillProficiencies: [SKILL.ACROBATICS, SKILL.PERCEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.NAVIGATORS_TOOLS],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_dagger", "Dagger"),
          starterPackItem("srd-2024_navigators-tools", "Navigator's Tools"),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(20, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-scribe-2024",
    name: "Scribe",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.SCHOLAR],
    source: "PHB'24",
    page: 184,
    abilityScoreOptions: ["DEX", "INT", "WIS"],
    originFeat: FEATS.SKILLED,
    grantedSkillProficiencies: [SKILL.INVESTIGATION, SKILL.PERCEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_calligraphers-supplies", "Calligrapher's Supplies"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackItem("srd-2024_lamp", "Lamp"),
          starterPackItem("srd-2024_oil", "Oil", 3),
          starterPackItem("srd-2024_parchment", "Parchment", 12),
          starterPackCurrency(23, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-soldier-2024",
    name: "Soldier",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.MILITARY],
    source: "PHB'24",
    page: 185,
    abilityScoreOptions: ["STR", "DEX", "CON"],
    originFeat: FEATS.SAVAGE_ATTACKER,
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.INTIMIDATION],
    grantedToolProficiencies: [],
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.GAMING_SET_DICE,
      TOOL_PROFICIENCY.GAMING_SET_DRAGONCHESS,
      TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      TOOL_PROFICIENCY.GAMING_SET_THREE_DRAGON_ANTE
    ],
    toolProficiencyChoiceLabel: "Gaming Set",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_spear", "Spear"),
          starterPackItem("srd-2024_shortbow", "Shortbow"),
          starterPackItem("srd-2024_arrows-20", "Arrows (20)"),
          starterPackSelectedTool("Gaming Set"),
          starterPackItem("srd-2024_healers-kit", "Healer's Kit"),
          starterPackItem("srd-2024_quiver", "Quiver"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(14, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  },
  {
    id: "background-wayfarer-2024",
    name: "Wayfarer",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.URBAN_SURVIVAL],
    source: "PHB'24",
    page: 185,
    abilityScoreOptions: ["DEX", "WIS", "CHA"],
    originFeat: FEATS.LUCKY,
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.STEALTH],
    grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_dagger", "Dagger", 2),
          starterPackItem("srd-2024_thieves-tools", "Thieves' Tools"),
          starterPackItem("srd-2024_gaming-set-playing-cards", "Gaming Set (playing cards)"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(16, CURRENCY_TYPE.GP)
        ),
        starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
      ]
    },
    summary: ""
  }
];
