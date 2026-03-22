import {
  ABILITY_TYPES,
  BACKGROUND_TYPES,
  CURRENCY_TYPE,
  CLASS_TYPES,
  DICE_TYPES,
  ENTRY_CATEGORIES,
  GENERAL_PROFICIENCIES,
  ITEM_TYPES,
  MONSTER_TYPES,
  RARITY_TYPES,
  RULE_TYPES,
  SPECIES_TYPES,
  TOOL_PROFICIENCIES
} from "./enums";
import {
  bardFeatures,
  barbarianFeatures,
  clericFeatures,
  druidFeatures,
  fighterFeatures,
  monkFeatures,
  paladinFeatures,
  rangerFeatures,
  rogueFeatures,
  sorcererFeatures,
  warlockFeatures,
  wizardFeatures
} from "../classes";
import { spellEntries } from "../spells";
import type { CodexEntry } from "./types";
import { armorEntries } from "./armorData";
import { weaponEntries } from "./weaponData";

export const hardcodedCodexEntries: CodexEntry[] = [
  ...spellEntries,
  ...weaponEntries,
  ...armorEntries,
  {
    id: "item-thieves-toolkit",
    name: "Thieve's Toolkit",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.TOOLKIT],
    weight: 1,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    summary: "Compact lock and trap tools for stealthy infiltration jobs."
  },
  {
    id: "item-disarm-toolkit",
    name: "Disarm Toolkit",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.TOOLKIT],
    weight: 2,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    summary: "Specialized picks, probes, and mirrors made for disabling mechanisms safely."
  },
  {
    id: "item-rope-50ft",
    name: "Rope (50ft)",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 10,
    cost: { amount: 1, currency: CURRENCY_TYPE.GP },
    summary: "A durable 50-foot rope for climbing, anchoring, and traversal."
  },
  {
    id: "item-shovel",
    name: "Shovel",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 5,
    cost: { amount: 2, currency: CURRENCY_TYPE.GP },
    summary: "A field shovel useful for digging cover, graves, and hidden caches."
  },
  {
    id: "item-mining-pickaxe",
    name: "Mining Pickaxe",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 10,
    cost: { amount: 2, currency: CURRENCY_TYPE.GP },
    summary: "A heavy pickaxe suited for stonework, excavation, and forced entry."
  },
  {
    id: "item-disguise-kit",
    name: "Disguise Kit",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.TOOLKIT],
    weight: 3,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    summary: "Cosmetic and wardrobe tools for changing appearance and mannerisms."
  },
  {
    id: "item-torch",
    name: "Torch",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 1,
    cost: { amount: 1, currency: CURRENCY_TYPE.CP },
    summary: "A handheld light source that keeps dark paths visible and can ignite campfires."
  },
  {
    id: "item-bedroll",
    name: "Bedroll",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 7,
    cost: { amount: 1, currency: CURRENCY_TYPE.GP },
    summary: "A compact sleeping roll for resting in the wilderness or rough shelter."
  },
  {
    id: "item-rations-1-day",
    name: "Rations (1 day)",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 2,
    cost: { amount: 5, currency: CURRENCY_TYPE.SP },
    summary: "Preserved food supplies that cover one full day of travel and exertion."
  },
  {
    id: "background-acolyte",
    name: "Acolyte",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.RELIGIOUS],
    grantedSkillProficiencies: ["Insight", "Religion"],
    grantedToolProficiencies: [],
    summary:
      "You served a temple or sacred order, learning doctrine and ritual discipline.\nFaith, ceremony, and counsel shaped how you deal with conflict and hardship."
  },
  {
    id: "background-charlatan",
    name: "Charlatan",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    grantedSkillProficiencies: ["Deception", "Sleight of Hand"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.DISGUIDE_KIT],
    summary:
      "You survived by lies, false identities, and confidence games.\nReading people quickly and selling a believable story became second nature."
  },
  {
    id: "background-criminal-spy",
    name: "Criminal / Spy",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.UNDERWORLD],
    grantedSkillProficiencies: ["Stealth", "Deception"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    summary:
      "You worked in the shadows as a thief, smuggler, assassin, or informant.\nYou know covert routes, coded dealings, and how to disappear when pressure rises."
  },
  {
    id: "background-entertainer",
    name: "Entertainer",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.PERFORMER],
    grantedSkillProficiencies: ["Performance", "Acrobatics"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.DISGUIDE_KIT],
    summary:
      "You lived by performance, whether through music, drama, spectacle, or arena display.\nCrowd control, showmanship, and timing are part of your everyday instincts."
  },
  {
    id: "background-folk-hero",
    name: "Folk Hero",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.COMMONER],
    grantedSkillProficiencies: ["Animal Handling", "Survival"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.SMITHS_TOOLKIT],
    summary:
      "You were once an ordinary local who stood up when others could not.\nCommunities trust your grit, practical judgment, and willingness to shoulder risk."
  },
  {
    id: "background-guild-artisan-merchant",
    name: "Guild Artisan / Merchant",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.CRAFT],
    grantedSkillProficiencies: ["Persuasion", "Insight"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.SMITHS_TOOLKIT],
    summary:
      "You trained within trade systems built on craft, contracts, and reputation.\nYou understand negotiation, supply networks, and the cost of poor workmanship."
  },
  {
    id: "background-hermit",
    name: "Hermit",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.RECLUSIVE],
    grantedSkillProficiencies: ["Medicine", "Religion"],
    grantedToolProficiencies: [],
    summary:
      "You spent years in seclusion seeking insight, healing, or spiritual clarity.\nPatience, contemplation, and self-reliance define how you approach danger."
  },
  {
    id: "background-noble",
    name: "Noble",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.NOBILITY],
    grantedSkillProficiencies: ["History", "Persuasion"],
    grantedToolProficiencies: [],
    summary:
      "You were raised among titles, etiquette, and political obligations.\nYou navigate status and protocol with ease, even outside courtly circles."
  },
  {
    id: "background-outlander",
    name: "Outlander",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.WILDERNESS],
    grantedSkillProficiencies: ["Athletics", "Survival"],
    grantedToolProficiencies: [],
    summary:
      "You grew up far from cities, relying on instinct and endurance to survive.\nTracks, weather, and rough terrain are familiar ground rather than obstacles."
  },
  {
    id: "background-sage",
    name: "Sage",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.SCHOLAR],
    grantedSkillProficiencies: ["Arcana", "History"],
    grantedToolProficiencies: [],
    summary:
      "You devoted your life to study, archives, and disciplined research.\nQuestions drive you forward, and knowledge is your most trusted weapon."
  },
  {
    id: "background-sailor-pirate",
    name: "Sailor / Pirate",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.SEAFARING],
    grantedSkillProficiencies: ["Athletics", "Perception"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    summary:
      "You learned life at sea, from deck labor and storm discipline to boarding actions.\nYou are steady under pressure and skilled at reading movement and intent."
  },
  {
    id: "background-soldier",
    name: "Soldier",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.MILITARY],
    grantedSkillProficiencies: ["Athletics", "Intimidation"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.DISARM_KIT],
    summary:
      "You served in structured military ranks and field campaigns.\nDrill, tactics, and chain-of-command discipline still shape your decisions."
  },
  {
    id: "background-urchin",
    name: "Urchin",
    category: ENTRY_CATEGORIES.BACKGROUNDS,
    tags: [BACKGROUND_TYPES.URBAN_SURVIVAL],
    grantedSkillProficiencies: ["Sleight of Hand", "Stealth"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    summary:
      "You survived on city streets through caution, speed, and improvisation.\nYou notice hidden opportunities quickly and rarely waste resources."
  },
  {
    id: "species-elf",
    name: "Elf",
    category: ENTRY_CATEGORIES.SPECIES,
    tags: [SPECIES_TYPES.HUMANOID, SPECIES_TYPES.FEY_ANCESTRY, SPECIES_TYPES.ARCANE_AFFINITY],
    speed: 30,
    abilityBonuses: {
      [ABILITY_TYPES.DEX]: 2,
      [ABILITY_TYPES.INT]: 1
    },
    innateProficiencies: [],
    grantedSkillProficiencies: ["Perception"],
    grantedToolProficiencies: [],
    summary: "Graceful, long-lived people known for keen senses and innate magical talent."
  },
  {
    id: "class-artificer",
    name: "Artificer",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE, CLASS_TYPES.SUPPORT],
    primaryAbilityModifiers: [ABILITY_TYPES.INT],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    savingThrowProficiencies: [ABILITY_TYPES.CON, ABILITY_TYPES.INT],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    grantedSkillProficiencies: ["Arcana"],
    grantedToolProficiencies: [],
    features: [],

    summary:
      "A magical inventor who fuses engineering and spellwork into adaptable battlefield tools."
  },
  {
    id: "class-barbarian",
    name: "Barbarian",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL],
    primaryAbilityModifiers: [ABILITY_TYPES.STR, ABILITY_TYPES.CON],
    hitPointDie: DICE_TYPES.DICE_TYPE_D12,
    savingThrowProficiencies: [ABILITY_TYPES.STR, ABILITY_TYPES.CON],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    grantedSkillProficiencies: ["Athletics"],
    grantedToolProficiencies: [],
    features: barbarianFeatures,

    summary: "A relentless frontline warrior who channels primal rage into unstoppable offense."
  },
  {
    id: "class-bard",
    name: "Bard",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE, CLASS_TYPES.SUPPORT, CLASS_TYPES.SKILL_EXPERT],
    primaryAbilityModifiers: [ABILITY_TYPES.CHA],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    savingThrowProficiencies: [ABILITY_TYPES.DEX, ABILITY_TYPES.CHA],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR
    ],
    grantedSkillProficiencies: ["Performance"],
    grantedToolProficiencies: [],
    features: bardFeatures,

    summary: "A versatile performer whose magic and skill mastery strengthen every party role."
  },
  {
    id: "class-cleric",
    name: "Cleric",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.DIVINE, CLASS_TYPES.SUPPORT],
    primaryAbilityModifiers: [ABILITY_TYPES.WIS],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    savingThrowProficiencies: [ABILITY_TYPES.WIS, ABILITY_TYPES.CHA],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    grantedSkillProficiencies: ["Religion"],
    grantedToolProficiencies: [],
    features: clericFeatures,

    summary: "A divine champion who balances healing, protection, and holy offense."
  },
  {
    id: "class-druid",
    name: "Druid",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.PRIMAL, CLASS_TYPES.SUPPORT],
    primaryAbilityModifiers: [ABILITY_TYPES.WIS],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    savingThrowProficiencies: [ABILITY_TYPES.INT, ABILITY_TYPES.WIS],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    grantedSkillProficiencies: ["Nature"],
    grantedToolProficiencies: [],
    features: druidFeatures,

    summary: "A primal spellcaster who commands nature, shapeshifts, and controls the battlefield."
  },
  {
    id: "class-fighter",
    name: "Fighter",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL],
    primaryAbilityModifiers: [ABILITY_TYPES.STR, ABILITY_TYPES.DEX],
    hitPointDie: DICE_TYPES.DICE_TYPE_D10,
    savingThrowProficiencies: [ABILITY_TYPES.STR, ABILITY_TYPES.CON],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.HEAVY_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    grantedSkillProficiencies: ["Athletics"],
    grantedToolProficiencies: [],
    features: fighterFeatures,

    summary: "A tactical combat specialist with unmatched weapon and armor discipline."
  },
  {
    id: "class-monk",
    name: "Monk",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL],
    primaryAbilityModifiers: [ABILITY_TYPES.DEX, ABILITY_TYPES.WIS],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    savingThrowProficiencies: [ABILITY_TYPES.STR, ABILITY_TYPES.DEX],
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS],
    grantedSkillProficiencies: ["Acrobatics"],
    grantedToolProficiencies: [],
    features: monkFeatures,

    summary: "A disciplined martial artist who blends mobility, precision, and ki techniques."
  },
  {
    id: "class-paladin",
    name: "Paladin",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL, CLASS_TYPES.DIVINE, CLASS_TYPES.SUPPORT],
    primaryAbilityModifiers: [ABILITY_TYPES.STR, ABILITY_TYPES.CHA],
    hitPointDie: DICE_TYPES.DICE_TYPE_D10,
    savingThrowProficiencies: [ABILITY_TYPES.WIS, ABILITY_TYPES.CHA],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.HEAVY_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    grantedSkillProficiencies: ["Persuasion"],
    grantedToolProficiencies: [],
    features: paladinFeatures,

    summary: "A holy knight who combines durable frontline defense with radiant burst damage."
  },
  {
    id: "class-ranger",
    name: "Ranger",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL, CLASS_TYPES.PRIMAL],
    primaryAbilityModifiers: [ABILITY_TYPES.DEX, ABILITY_TYPES.WIS],
    hitPointDie: DICE_TYPES.DICE_TYPE_D10,
    savingThrowProficiencies: [ABILITY_TYPES.STR, ABILITY_TYPES.DEX],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    grantedSkillProficiencies: ["Survival"],
    grantedToolProficiencies: [],
    features: rangerFeatures,

    summary: "A wilderness hunter who excels at tracking foes and controlling range."
  },
  {
    id: "class-rogue",
    name: "Rogue",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.SKILL_EXPERT, CLASS_TYPES.MARTIAL],
    primaryAbilityModifiers: [ABILITY_TYPES.DEX],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    savingThrowProficiencies: [ABILITY_TYPES.DEX, ABILITY_TYPES.INT],
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR
    ],
    grantedSkillProficiencies: ["Stealth"],
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    features: rogueFeatures,

    summary: "A precision striker and expert operative built around stealth, timing, and utility."
  },
  {
    id: "class-sorcerer",
    name: "Sorcerer",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE],
    primaryAbilityModifiers: [ABILITY_TYPES.CHA],
    hitPointDie: DICE_TYPES.DICE_TYPE_D6,
    savingThrowProficiencies: [ABILITY_TYPES.CON, ABILITY_TYPES.CHA],
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS],
    grantedSkillProficiencies: ["Arcana"],
    grantedToolProficiencies: [],
    features: sorcererFeatures,

    summary: "An innate arcane caster whose bloodline power fuels explosive spell output."
  },
  {
    id: "class-warlock",
    name: "Warlock",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE],
    primaryAbilityModifiers: [ABILITY_TYPES.CHA],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    savingThrowProficiencies: [ABILITY_TYPES.WIS, ABILITY_TYPES.CHA],
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS, GENERAL_PROFICIENCIES.LIGHT_ARMOR],
    grantedSkillProficiencies: ["Deception"],
    grantedToolProficiencies: [],
    features: warlockFeatures,

    summary: "A pact-bound caster with focused spell slots and potent invocations."
  },
  {
    id: "class-wizard",
    name: "Wizard",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE],
    primaryAbilityModifiers: [ABILITY_TYPES.INT],
    hitPointDie: DICE_TYPES.DICE_TYPE_D6,
    savingThrowProficiencies: [ABILITY_TYPES.INT, ABILITY_TYPES.WIS],
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS],
    grantedSkillProficiencies: ["Arcana"],
    grantedToolProficiencies: [],
    features: wizardFeatures,

    summary:
      "A scholar of spellcraft who prepares flexible arcane solutions for almost any challenge."
  },
  {
    id: "rule-advantage",
    name: "Advantage",
    category: ENTRY_CATEGORIES.RULES,
    tags: [RULE_TYPES.CORE, RULE_TYPES.COMBAT],
    summary: "Roll two d20s and keep the higher result when conditions favor you."
  },
  {
    id: "monster-young-red-dragon",
    name: "Young Red Dragon",
    category: ENTRY_CATEGORIES.MONSTERS,
    tags: [MONSTER_TYPES.DRAGON, MONSTER_TYPES.BOSS],
    rarity: RARITY_TYPES.LEGENDARY,
    summary: "A proud and brutal predator with fiery breath and a hunger for treasure."
  }
];
