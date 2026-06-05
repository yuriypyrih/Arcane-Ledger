import { TOOL_PROFICIENCY } from "../../types/proficiencies";
import { SKILL } from "../../types/skills";
import {
  starterPackArtisanTools,
  starterPackChoice,
  starterPackCurrency,
  starterPackItem,
  starterPackSelectedTool
} from "../classes/starterPack";
import { BACKGROUND_TYPES, CURRENCY_TYPE, ENTRY_CATEGORIES, FEATS } from "./enums";
import type { BackgroundEntry } from "./types";

type EfaBackgroundSeed = Omit<
  BackgroundEntry,
  "category" | "source" | "summary" | "starterPack"
> & {
  starterPack: Omit<BackgroundEntry["starterPack"], "recommendedStartingEquipmentIndex"> & {
    recommendedStartingEquipmentIndex?: number;
  };
};

const goldAlternative = starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP));

function createEfaBackgroundEntry(seed: EfaBackgroundSeed): BackgroundEntry {
  const { starterPack, ...entry } = seed;

  return {
    ...entry,
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    source: "EFA",
    starterPack: {
      recommendedStartingEquipmentIndex: 0,
      ...starterPack
    },
    summary: ""
  };
}

export const efaBackgroundEntries: BackgroundEntry[] = [
  createEfaBackgroundEntry({
    id: "background-archaeologist-efa",
    name: "Archaeologist",
    tags: [BACKGROUND_TYPES.SCHOLAR],
    page: 26,
    abilityScoreOptions: ["DEX", "INT", "WIS"],
    originFeat: FEATS.SKILLED,
    grantedSkillProficiencies: [SKILL.HISTORY, SKILL.SURVIVAL],
    grantedToolProficiencies: [TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_cartographers-tools", "Cartographer's Tools"),
          starterPackItem("srd-2024_lantern-bullseye", "Bullseye Lantern"),
          starterPackItem("srd-2024_map", "Map"),
          starterPackItem("srd-2024_case-map-or-scroll", "Map or Scroll Case"),
          starterPackItem("srd-2024_shovel", "Shovel"),
          starterPackItem("srd-2024_tent", "Tent"),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(17, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createEfaBackgroundEntry({
    id: "background-house-agent-efa",
    name: "House Agent",
    tags: [BACKGROUND_TYPES.NOBILITY],
    page: 26,
    abilityScoreOptions: ["STR", "INT", "CHA"],
    originFeat: FEATS.LUCKY,
    grantedSkillProficiencies: [SKILL.INVESTIGATION, SKILL.PERSUASION],
    grantedToolProficiencies: [],
    toolProficiencyChoices: starterPackArtisanTools,
    toolProficiencyChoiceLabel: "Artisan's Tools",
    starterPack: {
      recommendedToolProficiency: TOOL_PROFICIENCY.SMITHS_TOOLKIT,
      startingEquipment: [
        starterPackChoice(
          starterPackSelectedTool("Artisan's Tools"),
          starterPackItem("srd-2024_clothes-fine", "Fine Clothes"),
          starterPackCurrency(20, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  }),
  createEfaBackgroundEntry({
    id: "background-inquisitive-efa",
    name: "Inquisitive",
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    page: 33,
    abilityScoreOptions: ["CON", "INT", "CHA"],
    originFeat: FEATS.ALERT,
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.INVESTIGATION],
    grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
    starterPack: {
      startingEquipment: [
        starterPackChoice(
          starterPackItem("srd-2024_thieves-tools", "Thieves' Tools"),
          starterPackItem("srd-2024_lantern-bullseye", "Bullseye Lantern"),
          starterPackItem("srd-2024_crowbar", "Crowbar"),
          starterPackItem("srd-2024_oil", "Oil", 10),
          starterPackItem("srd-2024_clothes-travelers", "Traveler's Clothes"),
          starterPackCurrency(10, CURRENCY_TYPE.GP)
        ),
        goldAlternative
      ]
    }
  })
];
