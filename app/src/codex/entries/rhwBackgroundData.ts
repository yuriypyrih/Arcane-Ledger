import { rhwFeatDefinitions } from "../../pages/CharactersPage/feats/definitions/rhw";
import { gamingSetToolProficiencies } from "../../pages/CharactersPage/proficiencyOptions";
import { TOOL_PROFICIENCY } from "../../types/proficiencies";
import { SKILL } from "../../types/skills";
import {
  starterPackArtisanTools,
  starterPackChoice,
  starterPackCurrency,
  starterPackItem,
  starterPackSelectedTool
} from "../classes/starterPack";
import {
  addBackgroundDescription,
  type BackgroundEntryWithoutDescription
} from "./backgroundDescriptions";
import { BACKGROUND_TYPES, CURRENCY_TYPE, ENTRY_CATEGORIES, FEATS, TRACKER } from "./enums";
import type { BackgroundEntry } from "./types";

// Ravenloft: The Horrors Within, pp. 26–27.
// Source: https://5e.tools/backgrounds.html (RHW entries).
// Creation choices are supported; the granted feats remain reference-only.
const darkGiftFeats = rhwFeatDefinitions
  .filter((definition) => definition.tags?.includes("dark-gift"))
  .map((definition) => definition.feat);
const goldAlternative = starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP));

type RhwBackgroundSeed = Omit<
  BackgroundEntryWithoutDescription,
  "category" | "source" | "summary" | "trackingState" | "trackingMessage"
>;

function createRhwBackgroundEntry(seed: RhwBackgroundSeed): BackgroundEntry {
  return addBackgroundDescription({
    ...seed,
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    source: "RHW",
    summary: "",
    trackingState: TRACKER.NOT_TRACKED,
    trackingMessage:
      "Character creation supports this background's choices, proficiencies, and equipment. Its granted feat's benefits are reference-only."
  });
}

export const rhwBackgroundEntries: BackgroundEntry[] = [
  createRhwBackgroundEntry({
    id: "background-haunted-one-rhw",
    name: "Haunted One",
    tags: [BACKGROUND_TYPES.RECLUSIVE],
    page: 26,
    abilityScoreOptions: ["CON", "WIS", "CHA"],
    originFeat: FEATS.SURVIVOR,
    originFeatOptions: [FEATS.SURVIVOR, ...darkGiftFeats],
    grantedSkillProficiencies: [SKILL.ARCANA, SKILL.SURVIVAL],
    grantedToolProficiencies: [],
    toolProficiencyChoices: gamingSetToolProficiencies,
    toolProficiencyChoiceLabel: "Gaming Set",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackSelectedTool("Gaming Set"),
          starterPackItem("srd-2024_crowbar", "Crowbar"),
          starterPackItem("srd-2024_holy-water", "Holy Water"),
          starterPackItem("srd-2024_mirror", "Mirror"),
          starterPackItem("srd-2024_oil", "Oil", 2),
          starterPackItem("srd-2024_signal-whistle", "Signal Whistle"),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackItem("srd-2024_torch", "Torch", 5),
          starterPackItem("srd-2024_waterskin", "Waterskin"),
          starterPackCurrency(14, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createRhwBackgroundEntry({
    id: "background-investigator-rhw",
    name: "Investigator",
    tags: [BACKGROUND_TYPES.SCHOLAR],
    page: 26,
    abilityScoreOptions: ["INT", "WIS", "CHA"],
    originFeat: FEATS.SHARP_EYE,
    originFeatOptions: [FEATS.SHARP_EYE, ...darkGiftFeats],
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.INVESTIGATION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.DISGUISE_KIT],
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_disguise-kit", "Disguise Kit"),
          starterPackItem("srd-2024_manacles", "Manacles"),
          starterPackItem("srd-2024_shovel", "Shovel"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackItem("srd-2024_vial", "Vial", 3),
          starterPackCurrency(16, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createRhwBackgroundEntry({
    id: "background-mist-wanderer-rhw",
    name: "Mist Wanderer",
    tags: [BACKGROUND_TYPES.WILDERNESS],
    page: 27,
    abilityScoreOptions: ["DEX", "CON", "WIS"],
    originFeat: FEATS.MIST_WALKER,
    originFeatOptions: darkGiftFeats,
    grantedSkillProficiencies: [SKILL.SURVIVAL, SKILL.STEALTH],
    grantedToolProficiencies: [],
    toolProficiencyChoices: starterPackArtisanTools,
    toolProficiencyChoiceLabel: "Artisan's Tools",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackSelectedTool("Artisan's Tools"),
          starterPackItem("srd-2024_lamp", "Lamp"),
          starterPackItem("srd-2024_oil", "Oil", 5),
          starterPackItem("srd-2024_pouch", "Pouch"),
          starterPackItem("srd-2024_rope", "Rope"),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(30, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createRhwBackgroundEntry({
    id: "background-spirit-medium-rhw",
    name: "Spirit Medium",
    tags: [BACKGROUND_TYPES.RELIGIOUS],
    page: 27,
    abilityScoreOptions: ["CON", "INT", "WIS"],
    originFeat: FEATS.GATHERED_WHISPERS,
    originFeatOptions: darkGiftFeats,
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.RELIGION],
    grantedToolProficiencies: [],
    toolProficiencyChoices: gamingSetToolProficiencies,
    toolProficiencyChoiceLabel: "Gaming Set",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
      recommendedStartingEquipmentIndex: 0,
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_dagger", "Dagger"),
          starterPackSelectedTool("Gaming Set"),
          starterPackItem("srd-2024_basket", "Basket"),
          starterPackItem("srd-2024_bell", "Bell"),
          starterPackItem("srd-2024_candle", "Candle", 8),
          starterPackItem("srd-2024_ink", "Ink"),
          starterPackItem("srd-2024_ink-pen", "Ink Pen"),
          starterPackItem("srd-2024_paper", "Paper", 5),
          starterPackItem("srd-2024_tinderbox", "Tinderbox"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(32, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  })
];
