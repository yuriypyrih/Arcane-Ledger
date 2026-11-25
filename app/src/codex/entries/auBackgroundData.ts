import { gamingSetToolProficiencies } from "../../pages/CharactersPage/proficiencyOptions";
import { TOOL_PROFICIENCY } from "../../types/proficiencies";
import { SKILL } from "../../types/skills";
import {
  starterPackArtisanTools,
  starterPackChoice,
  starterPackCurrency,
  starterPackItem,
  starterPackSelectedTool,
  type StarterPackEquipmentChoice
} from "../classes/starterPack";
import {
  addBackgroundDescription,
  type BackgroundEntryWithoutDescription
} from "./backgroundDescriptions";
import { BACKGROUND_TYPES, CURRENCY_TYPE, ENTRY_CATEGORIES, FEATS, TRACKER } from "./enums";
import type { BackgroundEntry } from "./types";

type AuBackgroundSeed = Omit<
  BackgroundEntryWithoutDescription,
  "category" | "source" | "summary" | "starterPack" | "trackingState" | "trackingMessage"
> & {
  equipment: StarterPackEquipmentChoice;
};

// Arcana Unleashed, pp. 21–25. Each background offers its kit or 50 GP.
function auBackground({ equipment, ...entry }: AuBackgroundSeed): BackgroundEntry {
  return addBackgroundDescription({
    ...entry,
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    source: "AU",
    summary: "",
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [equipment, starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))]
    },
    trackingState: TRACKER.NOT_TRACKED,
    trackingMessage:
      "Character creation grants this background’s proficiencies, equipment, and origin feat. The feat’s benefits are reference-only."
  });
}

export const auBackgroundEntries: BackgroundEntry[] = [
  auBackground({
    id: "background-agent-of-the-ninth-quill-au",
    name: "Agent of the Ninth Quill",
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    page: 21,
    abilityScoreOptions: ["DEX", "INT", "CHA"],
    originFeat: FEATS.ARCANE_INFILTRATOR,
    grantedSkillProficiencies: [SKILL.ARCANA, SKILL.SLEIGHT_OF_HAND],
    grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
    equipment: [
      starterPackItem("srd-2024_dagger", "Dagger"),
      starterPackItem("srd-2024_light-hammer", "Light Hammer"),
      starterPackItem("srd-2024_thieves-tools", "Thieves' Tools"),
      starterPackItem("srd-2024_spikes-iron", "Iron Spikes"),
      starterPackItem("srd-2024_rope", "Rope"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackCurrency(17, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-bejeweled-conclave-spy-au",
    name: "Bejeweled Conclave Spy",
    tags: [BACKGROUND_TYPES.NOBILITY],
    page: 21,
    abilityScoreOptions: ["DEX", "WIS", "CHA"],
    originFeat: FEATS.ARCANE_ELOQUENCE,
    grantedSkillProficiencies: [SKILL.DECEPTION, SKILL.PERCEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.DISGUISE_KIT],
    equipment: [
      starterPackItem("srd-2024_disguise-kit", "Disguise Kit"),
      starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
      starterPackItem("srd-2024_perfume", "Perfume"),
      starterPackCurrency(5, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-cosmic-dawn-experiment-au",
    name: "Cosmic Dawn Experiment",
    tags: [BACKGROUND_TYPES.RECLUSIVE],
    page: 22,
    abilityScoreOptions: ["STR", "DEX", "CON"],
    originFeat: FEATS.TRANSMUTED_ANATOMY,
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.SURVIVAL],
    grantedToolProficiencies: [],
    toolProficiencyChoices: starterPackArtisanTools,
    toolProficiencyChoiceLabel: "Artisan's Tools",
    equipment: [
      starterPackSelectedTool("Artisan's Tools"),
      starterPackItem("srd-2024_backpack", "Backpack"),
      starterPackItem("srd-2024_robe", "Robe"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackCurrency(30, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-covenant-of-the-grave-recruit-au",
    name: "Covenant of the Grave Recruit",
    tags: [BACKGROUND_TYPES.SCHOLAR],
    page: 22,
    abilityScoreOptions: ["STR", "INT", "WIS"],
    originFeat: FEATS.ARCANE_UNDERTAKER,
    grantedSkillProficiencies: [SKILL.HISTORY, SKILL.MEDICINE],
    grantedToolProficiencies: [TOOL_PROFICIENCY.HERBALISM_KIT],
    equipment: [
      starterPackItem("srd-2024_dagger", "Dagger"),
      starterPackItem("srd-2024_herbalism-kit", "Herbalism Kit"),
      starterPackItem("srd-2024_book", "Book (anatomy)"),
      starterPackItem("srd-2024_shovel", "Shovel"),
      starterPackCurrency(16, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-crucible-storm-chaser-au",
    name: "Crucible Storm Chaser",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 23,
    abilityScoreOptions: ["STR", "CON", "INT"],
    originFeat: FEATS.ARCANE_OVERLOAD,
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.NATURE],
    grantedToolProficiencies: [TOOL_PROFICIENCY.GLASSBLOWERS_TOOLS],
    equipment: [
      starterPackItem("srd-2024_glassblowers-tools", "Glassblower's Tools"),
      starterPackItem("srd-2024_backpack", "Backpack"),
      starterPackItem("srd-2024_rope", "Rope"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackCurrency(15, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-familiar-trainer-au",
    name: "Familiar Trainer",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 23,
    abilityScoreOptions: ["CON", "INT", "WIS"],
    originFeat: FEATS.FAMILIAR_FRIEND,
    grantedSkillProficiencies: [SKILL.ANIMAL_HANDLING, SKILL.ARCANA],
    grantedToolProficiencies: [],
    toolProficiencyChoices: gamingSetToolProficiencies,
    toolProficiencyChoiceLabel: "Gaming Set",
    equipment: [
      starterPackItem("srd-2024_quarterstaff", "Quarterstaff"),
      starterPackSelectedTool("Gaming Set"),
      starterPackItem("srd-2024_bedroll", "Bedroll"),
      starterPackItem("srd-2024_bell", "Bell"),
      starterPackItem("srd-2024_string", "String"),
      starterPackItem("srd-2024_tinderbox", "Tinderbox"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackItem("srd-2024_waterskin", "Waterskin"),
      starterPackCurrency(44, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-horizon-weaver-initiate-au",
    name: "Horizon Weaver Initiate",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 24,
    abilityScoreOptions: ["DEX", "CON", "WIS"],
    originFeat: FEATS.PORTAL_JUMPER,
    grantedSkillProficiencies: [SKILL.ACROBATICS, SKILL.SURVIVAL],
    grantedToolProficiencies: [TOOL_PROFICIENCY.WEAVERS_TOOLS],
    equipment: [
      starterPackItem("srd-2024_shortbow", "Shortbow"),
      starterPackItem("srd-2024_arrows-20", "Arrows (20)"),
      starterPackItem("srd-2024_weavers-tools", "Weaver's Tools"),
      starterPackItem("srd-2024_map", "Map"),
      starterPackItem("srd-2024_quiver", "Quiver"),
      starterPackItem("srd-2024_rope", "Rope"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackCurrency(18, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-phantasmic-circus-trouper-au",
    name: "Phantasmic Circus Trouper",
    tags: [BACKGROUND_TYPES.PERFORMER],
    page: 24,
    abilityScoreOptions: ["DEX", "CON", "CHA"],
    originFeat: FEATS.ARCANE_ARTIST,
    grantedSkillProficiencies: [SKILL.DECEPTION, SKILL.PERFORMANCE],
    grantedToolProficiencies: [TOOL_PROFICIENCY.DISGUISE_KIT],
    equipment: [
      starterPackItem("srd-2024_disguise-kit", "Disguise Kit"),
      { type: "tool-choice", label: "Gaming Set (any)", options: gamingSetToolProficiencies },
      starterPackItem("srd-2024_costume", "Costume"),
      starterPackItem("srd-2024_mirror", "Mirror"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackCurrency(12, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-seer-apprentice-au",
    name: "Seer Apprentice",
    tags: [BACKGROUND_TYPES.SCHOLAR],
    page: 25,
    abilityScoreOptions: ["INT", "WIS", "CHA"],
    originFeat: FEATS.ARCANE_OMENS,
    grantedSkillProficiencies: [SKILL.HISTORY, SKILL.INSIGHT],
    grantedToolProficiencies: [TOOL_PROFICIENCY.NAVIGATORS_TOOLS],
    equipment: [
      starterPackItem("srd-2024_navigators-tools", "Navigator's Tools"),
      starterPackItem("srd-2024_candle", "Candle", 8),
      starterPackItem("srd-2024_ink", "Ink"),
      starterPackItem("srd-2024_ink-pen", "Ink Pen"),
      starterPackItem("srd-2024_parchment", "Parchment", 9),
      starterPackItem("srd-2024_pouch", "Pouch"),
      starterPackItem("srd-2024_tinderbox", "Tinderbox"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackCurrency(11, CURRENCY_TYPE.GP)
    ]
  }),
  auBackground({
    id: "background-ward-of-the-sheltering-hands-au",
    name: "Ward of the Sheltering Hands",
    tags: [BACKGROUND_TYPES.RELIGIOUS],
    page: 25,
    abilityScoreOptions: ["CON", "WIS", "CHA"],
    originFeat: FEATS.ARCANE_SAFEGUARD,
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.MEDICINE],
    grantedToolProficiencies: [TOOL_PROFICIENCY.COOKS_UTENSILS],
    equipment: [
      starterPackItem("srd-2024_cooks-utensils", "Cook's Utensils"),
      starterPackItem("srd-2024_blanket", "Blanket"),
      starterPackItem("srd-2024_healers-kit", "Healer's Kit"),
      starterPackItem("srd-2024_lamp", "Lamp"),
      starterPackItem("srd-2024_oil", "Oil", 3),
      starterPackItem("srd-2024_tinderbox", "Tinderbox"),
      starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
      starterPackItem("srd-2024_waterskin", "Waterskin"),
      starterPackCurrency(40, CURRENCY_TYPE.GP)
    ]
  })
];
