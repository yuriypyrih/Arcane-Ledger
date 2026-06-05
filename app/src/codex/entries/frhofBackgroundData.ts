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

type FrhofBackgroundSeed = Omit<
  BackgroundEntry,
  "category" | "source" | "summary" | "starterPack"
> & {
  starterPack: Omit<BackgroundEntry["starterPack"], "recommendedStartingEquipmentIndex"> & {
    recommendedStartingEquipmentIndex?: number;
  };
};

const goldAlternative = starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP));

function createFrhofBackgroundEntry(seed: FrhofBackgroundSeed): BackgroundEntry {
  const { starterPack, ...entry } = seed;

  return {
    ...entry,
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    source: "FRHoF",
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      ...starterPack
    },
    summary: ""
  };
}

export const frhofBackgroundEntries: BackgroundEntry[] = [
  createFrhofBackgroundEntry({
    id: "background-chondathan-freebooter-frhof",
    name: "Chondathan Freebooter",
    tags: [BACKGROUND_TYPES.SEAFARING],
    page: 28,
    abilityScoreOptions: ["STR", "DEX", "WIS"],
    originFeat: FEATS.SKILLED,
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.SLEIGHT_OF_HAND],
    grantedToolProficiencies: [TOOL_PROFICIENCY.WEAVERS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_dagger", "Dagger"),
          starterPackItem("srd-2024_weavers-tools", "Weaver's Tools"),
          starterPackItem("srd-2024_backpack", "Backpack"),
          starterPackItem("srd-2024_ball-bearings", "Ball Bearings"),
          starterPackItem("srd-2024_basket", "Basket"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_bucket", "Bucket"),
          starterPackItem("srd-2024_rations", "Rations", 3),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackItem("srd-2024_signal-whistle", "Signal Whistle"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(38, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-dead-magic-dweller-frhof",
    name: "Dead Magic Dweller",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 28,
    abilityScoreOptions: ["STR", "CON", "WIS"],
    originFeat: FEATS.HEALER,
    grantedSkillProficiencies: [SKILL.MEDICINE, SKILL.SURVIVAL],
    grantedToolProficiencies: [TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_greatclub", "Greatclub"),
          starterPackItem("srd-2024_leatherworkers-tools", "Leatherworker's Tools"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_blanket", "Blanket"),
          starterPackItem("srd-2024_healers-kit", "Healer's Kit"),
          starterPackItem("srd-2024_pole", "Pole"),
          starterPackItem("srd-2024_rations", "Rations", 3),
          starterPackItem("srd-2024_tent", "Tent"),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackItem("srd-2024_torch", "Torch", 5),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackItem("srd-2024_waterskin", "Waterskin"),
          starterPackCurrency(32, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-dragon-cultist-frhof",
    name: "Dragon Cultist",
    tags: [BACKGROUND_TYPES.RELIGIOUS],
    page: 29,
    abilityScoreOptions: ["DEX", "CON", "INT"],
    originFeat: FEATS.CULT_OF_THE_DRAGON_INITIATE,
    grantedSkillProficiencies: [SKILL.DECEPTION, SKILL.STEALTH],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_calligraphers-supplies", "Calligrapher's Supplies"),
          starterPackItem("srd-2024_dagger", "Dagger"),
          starterPackItem("srd-2024_bottle-glass", "Glass Bottle"),
          starterPackItem("srd-2024_lamp", "Lamp"),
          starterPackItem("srd-2024_manacles", "Manacles"),
          starterPackItem("srd-2024_oil", "Oil", 5),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_robe", "Robe"),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackCurrency(30, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-emerald-enclave-caretaker-frhof",
    name: "Emerald Enclave Caretaker",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 29,
    abilityScoreOptions: ["CON", "INT", "WIS"],
    originFeat: FEATS.EMERALD_ENCLAVE_FLEDGLING,
    grantedSkillProficiencies: [SKILL.NATURE, SKILL.SURVIVAL],
    grantedToolProficiencies: [TOOL_PROFICIENCY.HERBALISM_KIT],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_shortbow", "Shortbow"),
          starterPackItem("srd-2024_arrows-20", "Arrows (20)"),
          starterPackItem("srd-2024_herbalism-kit", "Herbalism Kit"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_blanket", "Blanket"),
          starterPackItem("srd-2024_pouch", "Pouch"),
          starterPackItem("srd-2024_tent", "Tent"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(13, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-flaming-fist-mercenary-frhof",
    name: "Flaming Fist Mercenary",
    tags: [BACKGROUND_TYPES.MILITARY],
    page: 30,
    abilityScoreOptions: ["STR", "CON", "CHA"],
    originFeat: FEATS.TOUGH,
    grantedSkillProficiencies: [SKILL.INTIMIDATION, SKILL.PERCEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.SMITHS_TOOLKIT],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_mace", "Mace"),
          starterPackItem("srd-2024_smiths-tools", "Smith's Tools"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackItem("srd-2024_manacles", "Manacles"),
          starterPackItem("srd-2024_ram-portable", "Portable Ram"),
          starterPackCurrency(4, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-genie-touched-frhof",
    name: "Genie Touched",
    tags: [BACKGROUND_TYPES.SCHOLAR],
    page: 30,
    abilityScoreOptions: ["DEX", "WIS", "CHA"],
    originFeat: FEATS.MAGIC_INITIATE,
    originFeatSpellList: SPELL_LIST_CLASS.WIZARD,
    grantedSkillProficiencies: [SKILL.PERCEPTION, SKILL.PERSUASION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.GLASSBLOWERS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_light-hammer", "Light Hammer"),
          starterPackItem("srd-2024_glassblowers-tools", "Glassblower's Tools"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackItem("srd-2024_lamp", "Lamp"),
          starterPackItem("srd-2024_oil", "Oil", 3),
          starterPackItem("srd-2024_waterskin", "Waterskin"),
          starterPackCurrency(2, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-harper-frhof",
    name: "Harper",
    tags: [BACKGROUND_TYPES.PERFORMER],
    page: 31,
    abilityScoreOptions: ["DEX", "INT", "CHA"],
    originFeat: FEATS.HARPER_AGENT,
    grantedSkillProficiencies: [SKILL.PERFORMANCE, SKILL.SLEIGHT_OF_HAND],
    grantedToolProficiencies: [TOOL_PROFICIENCY.DISGUISE_KIT],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_disguise-kit", "Disguise Kit"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_costume", "Costume"),
          starterPackItem("srd-2024_grappling-hook", "Grappling Hook"),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(14, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-ice-fisher-frhof",
    name: "Ice Fisher",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 31,
    abilityScoreOptions: ["STR", "DEX", "CON"],
    originFeat: FEATS.ALERT,
    grantedSkillProficiencies: [SKILL.ANIMAL_HANDLING, SKILL.ATHLETICS],
    grantedToolProficiencies: [TOOL_PROFICIENCY.WOODCARVERS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_woodcarvers-tools", "Woodcarver's Tools"),
          starterPackItem("srd-2024_basket", "Basket"),
          starterPackItem("srd-2024_block-and-tackle", "Block and Tackle"),
          starterPackItem("srd-2024_chain", "Chain"),
          starterPackItem("srd-2024_hunting-trap", "Hunting Trap"),
          starterPackItem("srd-2024_net", "Net"),
          starterPackItem("srd-2024_pole", "Pole"),
          starterPackItem("srd-2024_rations", "Rations", 3),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(32, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-knight-of-the-gauntlet-frhof",
    name: "Knight of the Gauntlet",
    tags: [BACKGROUND_TYPES.MILITARY],
    page: 32,
    abilityScoreOptions: ["STR", "INT", "WIS"],
    originFeat: FEATS.TYRO_OF_THE_GAUNTLET,
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.MEDICINE],
    grantedToolProficiencies: [TOOL_PROFICIENCY.SMITHS_TOOLKIT],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_spear", "Spear"),
          starterPackItem("srd-2024_smiths-tools", "Smith's Tools"),
          starterPackItem("srd-2024_lantern-bullseye", "Bullseye Lantern"),
          starterPackItem("srd-2024_holy-symbol-amulet", "Holy Symbol"),
          starterPackItem("srd-2024_manacles", "Manacles"),
          starterPackItem("srd-2024_oil", "Oil", 5),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(9, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-lords-alliance-vassal-frhof",
    name: "Lords' Alliance Vassal",
    tags: [BACKGROUND_TYPES.NOBILITY],
    page: 32,
    abilityScoreOptions: ["STR", "INT", "CHA"],
    originFeat: FEATS.LORDS_ALLIANCE_AGENT,
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.PERSUASION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_javelin", "Javelin", 2),
          starterPackItem("srd-2024_calligraphers-supplies", "Calligrapher's Supplies"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackItem("srd-2024_ink", "Ink"),
          starterPackItem("srd-2024_ink-pen", "Ink Pen", 5),
          starterPackItem("srd-2024_parchment", "Parchment", 9),
          starterPackCurrency(13, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-moonwell-pilgrim-frhof",
    name: "Moonwell Pilgrim",
    tags: [BACKGROUND_TYPES.RELIGIOUS],
    page: 33,
    abilityScoreOptions: ["CON", "WIS", "CHA"],
    originFeat: FEATS.MAGIC_INITIATE,
    originFeatSpellList: SPELL_LIST_CLASS.DRUID,
    grantedSkillProficiencies: [SKILL.NATURE, SKILL.PERFORMANCE],
    grantedToolProficiencies: [TOOL_PROFICIENCY.PAINTERS_SUPPLIES],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_quarterstaff", "Quarterstaff"),
          starterPackItem("srd-2024_painters-supplies", "Painter's Supplies"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_bell", "Bell"),
          starterPackItem("srd-2024_pouch", "Pouch"),
          starterPackItem("srd-2024_robe", "Robe"),
          starterPackItem("srd-2024_string", "String"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackItem("srd-2024_waterskin", "Waterskin"),
          starterPackCurrency(38, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-mulhorandi-tomb-raider-frhof",
    name: "Mulhorandi Tomb Raider",
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    page: 33,
    abilityScoreOptions: ["DEX", "CON", "INT"],
    originFeat: FEATS.LUCKY,
    grantedSkillProficiencies: [SKILL.INVESTIGATION, SKILL.RELIGION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.MASONS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_dagger", "Dagger"),
          starterPackItem("srd-2024_light-hammer", "Light Hammer"),
          starterPackItem("srd-2024_masons-tools", "Mason's Tools"),
          starterPackItem("srd-2024_backpack", "Backpack"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_crowbar", "Crowbar"),
          starterPackItem("srd-2024_ladder", "Ladder"),
          starterPackItem("srd-2024_pole", "Pole"),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackItem("srd-2024_string", "String"),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackItem("srd-2024_torch", "Torch", 5),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackItem("srd-2024_waterskin", "Waterskin"),
          starterPackCurrency(26, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-mythalkeeper-frhof",
    name: "Mythalkeeper",
    tags: [BACKGROUND_TYPES.SCHOLAR],
    page: 34,
    abilityScoreOptions: ["INT", "WIS", "CHA"],
    originFeat: FEATS.CRAFTER,
    grantedSkillProficiencies: [SKILL.ARCANA, SKILL.HISTORY],
    grantedToolProficiencies: [TOOL_PROFICIENCY.JEWELERS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_quarterstaff", "Quarterstaff"),
          starterPackItem("srd-2024_jewelers-tools", "Jeweler's Tools"),
          starterPackItem("srd-2024_perfume", "Perfume"),
          starterPackItem("srd-2024_pouch", "Pouch"),
          starterPackItem("srd-2024_robe", "Robe"),
          starterPackItem("srd-2024_shovel", "Shovel"),
          starterPackItem("srd-2024_string", "String"),
          starterPackItem("srd-2024_waterskin", "Waterskin"),
          starterPackCurrency(16, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-purple-dragon-squire-frhof",
    name: "Purple Dragon Squire",
    tags: [BACKGROUND_TYPES.MILITARY],
    page: 34,
    abilityScoreOptions: ["STR", "WIS", "CHA"],
    originFeat: FEATS.PURPLE_DRAGON_ROOK,
    grantedSkillProficiencies: [SKILL.ANIMAL_HANDLING, SKILL.INSIGHT],
    grantedToolProficiencies: [TOOL_PROFICIENCY.NAVIGATORS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_spear", "Spear"),
          starterPackItem("srd-2024_navigators-tools", "Navigator's Tools"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackCurrency(9, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-rashemi-wanderer-frhof",
    name: "Rashemi Wanderer",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 35,
    abilityScoreOptions: ["STR", "CON", "CHA"],
    originFeat: FEATS.TOUGH,
    grantedSkillProficiencies: [SKILL.INTIMIDATION, SKILL.PERCEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_cartographers-tools", "Cartographer's Tools"),
          starterPackItem("srd-2024_backpack", "Backpack"),
          starterPackItem("srd-2024_bedroll", "Bedroll"),
          starterPackItem("srd-2024_lantern-hooded", "Hooded Lantern"),
          starterPackItem("srd-2024_oil", "Oil", 3),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackItem("srd-2024_waterskin", "Waterskin"),
          starterPackCurrency(23, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-shadowmasters-exile-frhof",
    name: "Shadowmasters Exile",
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    page: 35,
    abilityScoreOptions: ["DEX", "INT", "CHA"],
    originFeat: FEATS.SAVAGE_ATTACKER,
    grantedSkillProficiencies: [SKILL.ACROBATICS, SKILL.STEALTH],
    grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_dagger", "Dagger", 2),
          starterPackItem("srd-2024_thieves-tools", "Thieves' Tools"),
          starterPackItem("srd-2024_caltrops", "Caltrops"),
          starterPackItem("srd-2024_costume", "Costume"),
          starterPackItem("srd-2024_grappling-hook", "Grappling Hook"),
          starterPackItem("srd-2024_spikes-iron", "Iron Spikes"),
          starterPackItem("srd-2024_mirror", "Mirror"),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(3, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-spellfire-initiate-frhof",
    name: "Spellfire Initiate",
    tags: [BACKGROUND_TYPES.SCHOLAR],
    page: 36,
    abilityScoreOptions: ["CON", "INT", "CHA"],
    originFeat: FEATS.SPELLFIRE_SPARK,
    grantedSkillProficiencies: [SKILL.ARCANA, SKILL.PERCEPTION],
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
      startingEquipment: [
        starterPackChoice(
          starterPackSelectedTool("Gaming Set"),
          starterPackItem("srd_crystal", "Arcane Focus (Crystal or Wand)"),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(36, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createFrhofBackgroundEntry({
    id: "background-zhentarim-mercenary-frhof",
    name: "Zhentarim Mercenary",
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    page: 36,
    abilityScoreOptions: ["STR", "DEX", "CHA"],
    originFeat: FEATS.ZHENTARIM_RUFFIAN,
    grantedSkillProficiencies: [SKILL.INTIMIDATION, SKILL.PERCEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.FORGERY_KIT],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_club", "Club"),
          starterPackItem("srd-2024_dagger", "Dagger"),
          starterPackItem("srd-2024_forgery-kit", "Forgery Kit"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackItem("srd-2024_lantern-hooded", "Hooded Lantern"),
          starterPackItem("srd-2024_oil", "Oil", 3),
          starterPackItem("srd-2024_pouch", "Pouch", 2),
          starterPackItem("srd-2024_string", "String"),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackCurrency(11, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  })
];
