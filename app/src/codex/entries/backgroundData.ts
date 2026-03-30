import { SKILL } from "../../types/skills";
import {
  BACKGROUND_TYPES,
  ENTRY_CATEGORIES,
  TOOL_PROFICIENCIES
} from "./enums";
import type { BackgroundEntry } from "./types";

export const backgroundEntries: BackgroundEntry[] = [
  {
    id: "background-acolyte",
    name: "Acolyte",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.RELIGIOUS],
    grantedSkillProficiencies: [SKILL.INSIGHT, SKILL.RELIGION],
    grantedToolProficiencies: [],
    summary:
      "You served a temple or sacred order, learning doctrine and ritual discipline.\nFaith, ceremony, and counsel shaped how you deal with conflict and hardship."
  },
  {
    id: "background-charlatan",
    name: "Charlatan",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    grantedSkillProficiencies: [SKILL.DECEPTION, SKILL.SLEIGHT_OF_HAND],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.DISGUIDE_KIT],
    summary:
      "You survived by lies, false identities, and confidence games.\nReading people quickly and selling a believable story became second nature."
  },
  {
    id: "background-criminal-spy",
    name: "Criminal / Spy",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    grantedSkillProficiencies: [SKILL.STEALTH, SKILL.DECEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    summary:
      "You worked in the shadows as a thief, smuggler, assassin, or informant.\nYou know covert routes, coded dealings, and how to disappear when pressure rises."
  },
  {
    id: "background-entertainer",
    name: "Entertainer",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.PERFORMER],
    grantedSkillProficiencies: [SKILL.PERFORMANCE, SKILL.ACROBATICS],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.DISGUIDE_KIT],
    summary:
      "You lived by performance, whether through music, drama, spectacle, or arena display.\nCrowd control, showmanship, and timing are part of your everyday instincts."
  },
  {
    id: "background-folk-hero",
    name: "Folk Hero",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.COMMONER],
    grantedSkillProficiencies: [SKILL.ANIMAL_HANDLING, SKILL.SURVIVAL],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.SMITHS_TOOLKIT],
    summary:
      "You were once an ordinary local who stood up when others could not.\nCommunities trust your grit, practical judgment, and willingness to shoulder risk."
  },
  {
    id: "background-guild-artisan-merchant",
    name: "Guild Artisan / Merchant",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.CRAFT],
    grantedSkillProficiencies: [SKILL.PERSUASION, SKILL.INSIGHT],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.SMITHS_TOOLKIT],
    summary:
      "You trained within trade systems built on craft, contracts, and reputation.\nYou understand negotiation, supply networks, and the cost of poor workmanship."
  },
  {
    id: "background-hermit",
    name: "Hermit",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.RECLUSIVE],
    grantedSkillProficiencies: [SKILL.MEDICINE, SKILL.RELIGION],
    grantedToolProficiencies: [],
    summary:
      "You spent years in seclusion seeking insight, healing, or spiritual clarity.\nPatience, contemplation, and self-reliance define how you approach danger."
  },
  {
    id: "background-noble",
    name: "Noble",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.NOBILITY],
    grantedSkillProficiencies: [SKILL.HISTORY, SKILL.PERSUASION],
    grantedToolProficiencies: [],
    summary:
      "You were raised among titles, etiquette, and political obligations.\nYou navigate status and protocol with ease, even outside courtly circles."
  },
  {
    id: "background-outlander",
    name: "Outlander",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.WILDERNESS],
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.SURVIVAL],
    grantedToolProficiencies: [],
    summary:
      "You grew up far from cities, relying on instinct and endurance to survive.\nTracks, weather, and rough terrain are familiar ground rather than obstacles."
  },
  {
    id: "background-sage",
    name: "Sage",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.SCHOLAR],
    grantedSkillProficiencies: [SKILL.ARCANA, SKILL.HISTORY],
    grantedToolProficiencies: [],
    summary:
      "You devoted your life to study, archives, and disciplined research.\nQuestions drive you forward, and knowledge is your most trusted weapon."
  },
  {
    id: "background-sailor-pirate",
    name: "Sailor / Pirate",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.SEAFARING],
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.PERCEPTION],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    summary:
      "You learned life at sea, from deck labor and storm discipline to boarding actions.\nYou are steady under pressure and skilled at reading movement and intent."
  },
  {
    id: "background-soldier",
    name: "Soldier",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.MILITARY],
    grantedSkillProficiencies: [SKILL.ATHLETICS, SKILL.INTIMIDATION],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.DISARM_KIT],
    summary:
      "You served in structured military ranks and field campaigns.\nDrill, tactics, and chain-of-command discipline still shape your decisions."
  },
  {
    id: "background-urchin",
    name: "Urchin",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.URBAN_SURVIVAL],
    grantedSkillProficiencies: [SKILL.SLEIGHT_OF_HAND, SKILL.STEALTH],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    summary:
      "You survived on city streets through caution, speed, and improvisation.\nYou notice hidden opportunities quickly and rarely waste resources."
  }
];
