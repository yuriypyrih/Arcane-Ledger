import type {
  AbilityKey,
  ArmorProficiencyEntry,
  CharacterClassFeatureState,
  CharacterDraft,
  CharacterEquipmentItem,
  CharacterProficiencyCollections,
  LanguageProficiency,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../types";
import {
  ARMOR_PROFICIENCY,
  CUSTOM_LANGUAGE_PREFIX,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "../../types";
import { exoticLanguageEntries, languageEntries, standardLanguageEntries } from "../../types";
import {
  ARMOR_TYPES,
  ENTRY_CATEGORIES,
  ITEM_TYPES,
  RARITY_TYPES,
  TOOL_PROFICIENCIES as LEGACY_TOOL_PROFICIENCIES,
  WEAPON_BASE,
  WEAPON_TRAINING,
  hardcodedCodexEntries,
  type ArmorEntry,
  type BackgroundEntry,
  type ClassEntry,
  type ItemEntry,
  type SpeciesEntry,
  type WeaponEntry
} from "../../codex/entries";
import { ALL_SKILLS } from "../../types";
import {
  createCharacterEquipmentItem,
  getCharacterEquipmentNames,
  normalizeCharacterEquipmentItems
} from "./inventory";
import {
  getFeatureSkillProficiencyEntriesForCharacter,
  getFeatureArmorProficiencyEntriesForCharacter,
  getFeatureLanguageProficiencyEntriesForCharacter,
  getFeatureWeaponProficiencyEntriesForCharacter
} from "./classFeatures";
import { formatCodexLabel } from "../../utils/codex";

export const skillsOptions = ALL_SKILLS;
export type GrantedProficiencyKind =
  | "skill"
  | "savingThrow"
  | "weapon"
  | "armor"
  | "tool"
  | "language";
export type ToolProficiency = TOOL_PROFICIENCY;
export type LanguageOption = LanguageProficiency;

export type GrantedProficiency = {
  kind: GrantedProficiencyKind;
  name: string;
  sources: string[];
};

export type GrantedSkillProficiency = {
  skill: SkillName;
  sources: string[];
};

export type ResolvedSkillProficiencies = {
  granted: GrantedSkillProficiency[];
  manual: SkillName[];
  all: SkillName[];
};

export type WeaponType = WEAPON_TRAINING;
export type ArmorType = "light" | "medium" | "heavy" | "shield";
export type GearType = "adventuring" | "toolkit";
export type EquipmentCategory = "weapon" | "armor" | "gear";
export type LoadoutCodexEntry = WeaponEntry | ArmorEntry | ItemEntry;

export type WeaponEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "weapon";
  training: WeaponType;
  baseWeapon?: WEAPON_BASE;
};

export type ArmorEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "armor";
  type: ArmorType;
};

export type GearEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "gear";
  type: GearType;
};

export type EquipmentDefinition =
  | WeaponEquipmentDefinition
  | ArmorEquipmentDefinition
  | GearEquipmentDefinition;

export type EquipmentProficiencyLabels = {
  weapons: string[];
  armor: string[];
};

export type ClassProficiencyProfile = {
  weaponProficiencies: WeaponType[];
  armorProficiencies: ArmorType[];
  skillProficiencyOptions: SkillName[];
  skillProficiencyCount: number;
  grantedToolProficiencies?: ToolProficiency[];
  toolProficiencyChoices?: ToolProficiency[];
  toolProficiencyChoiceCount?: number;
};

type ProficiencyEntry =
  | SkillProficiencyEntry
  | SavingThrowProficiencyEntry
  | WeaponProficiencyEntry
  | ArmorProficiencyEntry
  | ToolProficiencyEntry
  | LanguageProficiencyEntry;

export type ProficiencyDisplayEntry<
  TProficiency extends ProficiencyEntry["proficiency"] = ProficiencyEntry["proficiency"]
> = {
  proficiency: TProficiency;
  proficiencyLevel: PROF_LEVEL;
  sourceLabels: string[];
  locked?: boolean;
};

export type ResolvedProficiencyEntry<
  TProficiency extends ProficiencyEntry["proficiency"] = ProficiencyEntry["proficiency"]
> = {
  proficiency: TProficiency;
  proficiencyLevel: PROF_LEVEL;
  sourceLabels: string[];
  locked: boolean;
  overridePolicy: PROFICIENCY_OVERRIDE_POLICY;
};

type NormalizeCharacterProficienciesOptions = {
  className: string;
  level: number;
  species: string;
  background: string;
  classFeatureState?: CharacterClassFeatureState;
  skillProficiencies?: unknown;
  savingThrowProficiencies?: unknown;
  weaponProficiencies?: unknown;
  armorProficiencies?: unknown;
  toolProficiencies?: unknown;
  languageProficiencies?: unknown;
  legacySkills?: string[];
  legacySkillExpertise?: string[];
  legacySavingThrowProficiencies?: string[];
  legacyToolProficiencies?: string[];
};

function isLoadoutCodexEntry(entry: unknown): entry is LoadoutCodexEntry {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "category" in entry &&
    (entry.category === ENTRY_CATEGORIES.WEAPONS ||
      entry.category === ENTRY_CATEGORIES.ARMOR ||
      entry.category === ENTRY_CATEGORIES.ITEMS)
  );
}

function getArmorTypeFromTags(tags: ArmorEntry["tags"]): ArmorType | null {
  if (tags.includes(ARMOR_TYPES.LIGHT_ARMOR)) {
    return "light";
  }

  if (tags.includes(ARMOR_TYPES.MEDIUM_ARMOR)) {
    return "medium";
  }

  if (tags.includes(ARMOR_TYPES.HEAVY_ARMOR)) {
    return "heavy";
  }

  if (tags.includes(ARMOR_TYPES.SHIELD)) {
    return "shield";
  }

  return null;
}

function getGearTypeFromTags(tags: ItemEntry["tags"]): GearType {
  return tags.includes(ITEM_TYPES.TOOLKIT) ? "toolkit" : "adventuring";
}

function toEquipmentDefinition(entry: LoadoutCodexEntry): EquipmentDefinition | null {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return {
      entryId: entry.id,
      name: entry.name,
      category: "weapon",
      training: entry.type.training,
      baseWeapon: entry.baseWeapon
    };
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    const type = getArmorTypeFromTags(entry.tags);

    if (!type) {
      return null;
    }

    return {
      entryId: entry.id,
      name: entry.name,
      category: "armor",
      type
    };
  }

  return {
    entryId: entry.id,
    name: entry.name,
    category: "gear",
    type: getGearTypeFromTags(entry.tags)
  };
}

const loadoutCodexEntries: LoadoutCodexEntry[] = hardcodedCodexEntries.filter((entry) =>
  isLoadoutCodexEntry(entry)
);

export const equipmentCatalog: EquipmentDefinition[] = loadoutCodexEntries
  .map((entry) => toEquipmentDefinition(entry))
  .filter((entry): entry is EquipmentDefinition => entry !== null)
  .sort((left, right) => left.name.localeCompare(right.name));

export const equipmentOptions = equipmentCatalog.map((item) => item.name);

export const classOptions = [
  "Artificer",
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard"
] as const;

export type ClassName = (typeof classOptions)[number];

export const classProficiencyProfiles: Record<ClassName, ClassProficiencyProfile> = {
  Artificer: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Arcana",
      "History",
      "Investigation",
      "Medicine",
      "Nature",
      "Perception",
      "Sleight of Hand"
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.THIEVES_TOOLKIT,
      TOOL_PROFICIENCY.SMITHS_TOOLKIT,
      TOOL_PROFICIENCY.DISGUISE_KIT,
      TOOL_PROFICIENCY.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Barbarian: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Animal Handling",
      "Athletics",
      "Intimidation",
      "Nature",
      "Perception",
      "Survival"
    ],
    skillProficiencyCount: 2
  },
  Bard: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      "Acrobatics",
      "Animal Handling",
      "Arcana",
      "Athletics",
      "Deception",
      "History",
      "Insight",
      "Intimidation",
      "Investigation",
      "Medicine",
      "Nature",
      "Perception",
      "Performance",
      "Persuasion",
      "Religion",
      "Sleight of Hand",
      "Stealth",
      "Survival"
    ],
    skillProficiencyCount: 3,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.DISGUISE_KIT,
      TOOL_PROFICIENCY.THIEVES_TOOLKIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Cleric: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
    skillProficiencyCount: 2
  },
  Druid: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Arcana",
      "Animal Handling",
      "Insight",
      "Medicine",
      "Nature",
      "Perception",
      "Religion",
      "Survival"
    ],
    skillProficiencyCount: 2
  },
  Fighter: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "heavy", "shield"],
    skillProficiencyOptions: [
      "Acrobatics",
      "Animal Handling",
      "Athletics",
      "History",
      "Insight",
      "Intimidation",
      "Perception",
      "Survival"
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.SMITHS_TOOLKIT,
      TOOL_PROFICIENCY.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Monk: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: [
      "Acrobatics",
      "Athletics",
      "History",
      "Insight",
      "Religion",
      "Stealth"
    ],
    skillProficiencyCount: 2
  },
  Paladin: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "heavy", "shield"],
    skillProficiencyOptions: [
      "Athletics",
      "Insight",
      "Intimidation",
      "Medicine",
      "Persuasion",
      "Religion"
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [TOOL_PROFICIENCY.SMITHS_TOOLKIT],
    toolProficiencyChoiceCount: 1
  },
  Ranger: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Animal Handling",
      "Athletics",
      "Insight",
      "Investigation",
      "Nature",
      "Perception",
      "Stealth",
      "Survival"
    ],
    skillProficiencyCount: 3,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.DISARM_KIT,
      TOOL_PROFICIENCY.THIEVES_TOOLKIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Rogue: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      "Acrobatics",
      "Athletics",
      "Deception",
      "Insight",
      "Intimidation",
      "Investigation",
      "Perception",
      "Performance",
      "Persuasion",
      "Sleight of Hand",
      "Stealth"
    ],
    skillProficiencyCount: 4,
    grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.DISGUISE_KIT,
      TOOL_PROFICIENCY.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Sorcerer: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: [
      "Arcana",
      "Deception",
      "Insight",
      "Intimidation",
      "Persuasion",
      "Religion"
    ],
    skillProficiencyCount: 2
  },
  Warlock: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      "Arcana",
      "Deception",
      "History",
      "Intimidation",
      "Investigation",
      "Nature",
      "Religion"
    ],
    skillProficiencyCount: 2
  },
  Wizard: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: [
      "Arcana",
      "History",
      "Insight",
      "Investigation",
      "Medicine",
      "Religion"
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [TOOL_PROFICIENCY.DISGUISE_KIT],
    toolProficiencyChoiceCount: 1
  }
};

const classOptionSet = new Set<string>(classOptions);
const skillOptionSet = new Set<string>(skillsOptions);
const sourceStrMetadataSeparator = "::";
const proficiencyLevelRank: Record<PROF_LEVEL, number> = {
  [PROF_LEVEL.NONE]: 0,
  [PROF_LEVEL.PROFICIENT]: 1,
  [PROF_LEVEL.EXPERT]: 2
};
const proficiencyOverridePolicyRank: Record<PROFICIENCY_OVERRIDE_POLICY, number> = {
  [PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE]: 0,
  [PROFICIENCY_OVERRIDE_POLICY.LOCKED]: 1
};

const skillProficiencyBySkillName = new Map<SkillName, SKILL_PROFICIENCY>([
  ["Acrobatics", SKILL_PROFICIENCY.ACROBATICS],
  ["Animal Handling", SKILL_PROFICIENCY.ANIMAL_HANDLING],
  ["Arcana", SKILL_PROFICIENCY.ARCANA],
  ["Athletics", SKILL_PROFICIENCY.ATHLETICS],
  ["Deception", SKILL_PROFICIENCY.DECEPTION],
  ["History", SKILL_PROFICIENCY.HISTORY],
  ["Insight", SKILL_PROFICIENCY.INSIGHT],
  ["Intimidation", SKILL_PROFICIENCY.INTIMIDATION],
  ["Investigation", SKILL_PROFICIENCY.INVESTIGATION],
  ["Medicine", SKILL_PROFICIENCY.MEDICINE],
  ["Nature", SKILL_PROFICIENCY.NATURE],
  ["Perception", SKILL_PROFICIENCY.PERCEPTION],
  ["Performance", SKILL_PROFICIENCY.PERFORMANCE],
  ["Persuasion", SKILL_PROFICIENCY.PERSUASION],
  ["Religion", SKILL_PROFICIENCY.RELIGION],
  ["Sleight of Hand", SKILL_PROFICIENCY.SLEIGHT_OF_HAND],
  ["Stealth", SKILL_PROFICIENCY.STEALTH],
  ["Survival", SKILL_PROFICIENCY.SURVIVAL]
]);

const skillNameByProficiency: Record<SKILL_PROFICIENCY, SkillName> = {
  [SKILL_PROFICIENCY.ACROBATICS]: "Acrobatics",
  [SKILL_PROFICIENCY.ANIMAL_HANDLING]: "Animal Handling",
  [SKILL_PROFICIENCY.ARCANA]: "Arcana",
  [SKILL_PROFICIENCY.ATHLETICS]: "Athletics",
  [SKILL_PROFICIENCY.DECEPTION]: "Deception",
  [SKILL_PROFICIENCY.HISTORY]: "History",
  [SKILL_PROFICIENCY.INSIGHT]: "Insight",
  [SKILL_PROFICIENCY.INTIMIDATION]: "Intimidation",
  [SKILL_PROFICIENCY.INVESTIGATION]: "Investigation",
  [SKILL_PROFICIENCY.MEDICINE]: "Medicine",
  [SKILL_PROFICIENCY.NATURE]: "Nature",
  [SKILL_PROFICIENCY.PERCEPTION]: "Perception",
  [SKILL_PROFICIENCY.PERFORMANCE]: "Performance",
  [SKILL_PROFICIENCY.PERSUASION]: "Persuasion",
  [SKILL_PROFICIENCY.RELIGION]: "Religion",
  [SKILL_PROFICIENCY.SLEIGHT_OF_HAND]: "Sleight of Hand",
  [SKILL_PROFICIENCY.STEALTH]: "Stealth",
  [SKILL_PROFICIENCY.SURVIVAL]: "Survival"
};

const savingThrowProficiencyByAbilityKey: Record<AbilityKey, SAVING_THROW_PROFICIENCY> = {
  STR: SAVING_THROW_PROFICIENCY.STR,
  DEX: SAVING_THROW_PROFICIENCY.DEX,
  CON: SAVING_THROW_PROFICIENCY.CON,
  INT: SAVING_THROW_PROFICIENCY.INT,
  WIS: SAVING_THROW_PROFICIENCY.WIS,
  CHA: SAVING_THROW_PROFICIENCY.CHA
};

const abilityKeyBySavingThrowProficiency: Record<SAVING_THROW_PROFICIENCY, AbilityKey> = {
  [SAVING_THROW_PROFICIENCY.STR]: "STR",
  [SAVING_THROW_PROFICIENCY.DEX]: "DEX",
  [SAVING_THROW_PROFICIENCY.CON]: "CON",
  [SAVING_THROW_PROFICIENCY.INT]: "INT",
  [SAVING_THROW_PROFICIENCY.WIS]: "WIS",
  [SAVING_THROW_PROFICIENCY.CHA]: "CHA"
};

const weaponProficiencyByTraining: Record<WeaponType, WEAPON_PROFICIENCY> = {
  [WEAPON_TRAINING.SIMPLE]: WEAPON_PROFICIENCY.SIMPLE,
  [WEAPON_TRAINING.MARTIAL]: WEAPON_PROFICIENCY.MARTIAL
};

const weaponProficiencyByBaseWeapon: Record<WEAPON_BASE, WEAPON_PROFICIENCY> = {
  [WEAPON_BASE.CLUB]: WEAPON_PROFICIENCY.CLUB,
  [WEAPON_BASE.DAGGER]: WEAPON_PROFICIENCY.DAGGER,
  [WEAPON_BASE.GREATCLUB]: WEAPON_PROFICIENCY.GREATCLUB,
  [WEAPON_BASE.HANDAXE]: WEAPON_PROFICIENCY.HANDAXE,
  [WEAPON_BASE.JAVELIN]: WEAPON_PROFICIENCY.JAVELIN,
  [WEAPON_BASE.LIGHT_HAMMER]: WEAPON_PROFICIENCY.LIGHT_HAMMER,
  [WEAPON_BASE.MACE]: WEAPON_PROFICIENCY.MACE,
  [WEAPON_BASE.QUARTERSTAFF]: WEAPON_PROFICIENCY.QUARTERSTAFF,
  [WEAPON_BASE.SICKLE]: WEAPON_PROFICIENCY.SICKLE,
  [WEAPON_BASE.SPEAR]: WEAPON_PROFICIENCY.SPEAR,
  [WEAPON_BASE.DART]: WEAPON_PROFICIENCY.DART,
  [WEAPON_BASE.LIGHT_CROSSBOW]: WEAPON_PROFICIENCY.LIGHT_CROSSBOW,
  [WEAPON_BASE.SHORTBOW]: WEAPON_PROFICIENCY.SHORTBOW,
  [WEAPON_BASE.SLING]: WEAPON_PROFICIENCY.SLING,
  [WEAPON_BASE.BATTLEAXE]: WEAPON_PROFICIENCY.BATTLEAXE,
  [WEAPON_BASE.FLAIL]: WEAPON_PROFICIENCY.FLAIL,
  [WEAPON_BASE.GLAIVE]: WEAPON_PROFICIENCY.GLAIVE,
  [WEAPON_BASE.GREATAXE]: WEAPON_PROFICIENCY.GREATAXE,
  [WEAPON_BASE.GREATSWORD]: WEAPON_PROFICIENCY.GREATSWORD,
  [WEAPON_BASE.HALBERD]: WEAPON_PROFICIENCY.HALBERD,
  [WEAPON_BASE.LANCE]: WEAPON_PROFICIENCY.LANCE,
  [WEAPON_BASE.LONGSWORD]: WEAPON_PROFICIENCY.LONGSWORD,
  [WEAPON_BASE.MAUL]: WEAPON_PROFICIENCY.MAUL,
  [WEAPON_BASE.MORNINGSTAR]: WEAPON_PROFICIENCY.MORNINGSTAR,
  [WEAPON_BASE.PIKE]: WEAPON_PROFICIENCY.PIKE,
  [WEAPON_BASE.RAPIER]: WEAPON_PROFICIENCY.RAPIER,
  [WEAPON_BASE.SCIMITAR]: WEAPON_PROFICIENCY.SCIMITAR,
  [WEAPON_BASE.SHORTSWORD]: WEAPON_PROFICIENCY.SHORTSWORD,
  [WEAPON_BASE.TRIDENT]: WEAPON_PROFICIENCY.TRIDENT,
  [WEAPON_BASE.WARHAMMER]: WEAPON_PROFICIENCY.WARHAMMER,
  [WEAPON_BASE.WAR_PICK]: WEAPON_PROFICIENCY.WAR_PICK,
  [WEAPON_BASE.WHIP]: WEAPON_PROFICIENCY.WHIP,
  [WEAPON_BASE.BLOWGUN]: WEAPON_PROFICIENCY.BLOWGUN,
  [WEAPON_BASE.HAND_CROSSBOW]: WEAPON_PROFICIENCY.HAND_CROSSBOW,
  [WEAPON_BASE.HEAVY_CROSSBOW]: WEAPON_PROFICIENCY.HEAVY_CROSSBOW,
  [WEAPON_BASE.LONGBOW]: WEAPON_PROFICIENCY.LONGBOW,
  [WEAPON_BASE.MUSKET]: WEAPON_PROFICIENCY.MUSKET,
  [WEAPON_BASE.PISTOL]: WEAPON_PROFICIENCY.PISTOL
};

const armorProficiencyByType: Record<ArmorType, ARMOR_PROFICIENCY> = {
  light: ARMOR_PROFICIENCY.LIGHT,
  medium: ARMOR_PROFICIENCY.MEDIUM,
  heavy: ARMOR_PROFICIENCY.HEAVY,
  shield: ARMOR_PROFICIENCY.SHIELD
};

const toolProficiencyByLegacyType: Record<LEGACY_TOOL_PROFICIENCIES, TOOL_PROFICIENCY> = {
  [LEGACY_TOOL_PROFICIENCIES.THIEVES_TOOLKIT]: TOOL_PROFICIENCY.THIEVES_TOOLKIT,
  [LEGACY_TOOL_PROFICIENCIES.SMITHS_TOOLKIT]: TOOL_PROFICIENCY.SMITHS_TOOLKIT,
  [LEGACY_TOOL_PROFICIENCIES.DISGUIDE_KIT]: TOOL_PROFICIENCY.DISGUISE_KIT,
  [LEGACY_TOOL_PROFICIENCIES.DISARM_KIT]: TOOL_PROFICIENCY.DISARM_KIT
};

const skillProficiencySet = new Set<string>(Object.values(SKILL_PROFICIENCY));
const savingThrowProficiencySet = new Set<string>(Object.values(SAVING_THROW_PROFICIENCY));
const weaponProficiencySet = new Set<string>(Object.values(WEAPON_PROFICIENCY));
const armorProficiencySet = new Set<string>(Object.values(ARMOR_PROFICIENCY));
const toolProficiencySet = new Set<string>(Object.values(TOOL_PROFICIENCY));
const proficiencySourceSet = new Set<string>(Object.values(PROFICIENCY_SOURCE));
const profLevelSet = new Set<string>(Object.values(PROF_LEVEL));
const proficiencyOverridePolicySet = new Set<string>(
  Object.values(PROFICIENCY_OVERRIDE_POLICY)
);

const weaponProficiencyLabelsByType: Record<WeaponType, string> = {
  [WEAPON_TRAINING.SIMPLE]: "Simple weapons",
  [WEAPON_TRAINING.MARTIAL]: "Martial weapons"
};
const commonWeaponEntriesByBaseWeapon = new Map<WEAPON_BASE, WeaponEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is WeaponEntry =>
        entry.category === ENTRY_CATEGORIES.WEAPONS &&
        entry.rarity === RARITY_TYPES.COMMON &&
        typeof entry.baseWeapon === "string"
    )
    .map((entry) => [entry.baseWeapon as WEAPON_BASE, entry])
);
const weaponProficiencyLabelsByBaseWeapon = new Map<WEAPON_BASE, string>(
  [...commonWeaponEntriesByBaseWeapon.entries()].map(([baseWeapon, entry]) => [baseWeapon, entry.name])
);

const weaponSpecificProficiencyOptions = Object.values(WEAPON_BASE)
  .map((baseWeapon) => weaponProficiencyByBaseWeapon[baseWeapon])
  .sort((left, right) => getWeaponProficiencyLabel(left).localeCompare(getWeaponProficiencyLabel(right)));

const armorProficiencyLabelsByType: Record<ArmorType, string> = {
  light: "Light armor",
  medium: "Medium armor",
  heavy: "Heavy armor",
  shield: "Shield"
};

const armorProficiencyLabels: Record<ARMOR_PROFICIENCY, string> = {
  [ARMOR_PROFICIENCY.LIGHT]: "Light armor",
  [ARMOR_PROFICIENCY.MEDIUM]: "Medium armor",
  [ARMOR_PROFICIENCY.HEAVY]: "Heavy armor",
  [ARMOR_PROFICIENCY.SHIELD]: "Shield"
};

const toolProficiencyLabels: Record<TOOL_PROFICIENCY, string> = {
  [TOOL_PROFICIENCY.THIEVES_TOOLKIT]: "Thieves' Toolkit",
  [TOOL_PROFICIENCY.SMITHS_TOOLKIT]: "Smith's Toolkit",
  [TOOL_PROFICIENCY.DISGUISE_KIT]: "Disguise Kit",
  [TOOL_PROFICIENCY.DISARM_KIT]: "Disarm Kit"
};

const savingThrowProficiencyLabels: Record<SAVING_THROW_PROFICIENCY, string> = {
  [SAVING_THROW_PROFICIENCY.STR]: "STR Saving Throw",
  [SAVING_THROW_PROFICIENCY.DEX]: "DEX Saving Throw",
  [SAVING_THROW_PROFICIENCY.CON]: "CON Saving Throw",
  [SAVING_THROW_PROFICIENCY.INT]: "INT Saving Throw",
  [SAVING_THROW_PROFICIENCY.WIS]: "WIS Saving Throw",
  [SAVING_THROW_PROFICIENCY.CHA]: "CHA Saving Throw"
};

const languageProficiencyLabels: Record<LANGUAGE_PROFICIENCY, string> = {
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

export const skillProficiencyOptions = Object.values(SKILL_PROFICIENCY) as SKILL_PROFICIENCY[];
export const savingThrowProficiencyOptions = Object.values(
  SAVING_THROW_PROFICIENCY
) as SAVING_THROW_PROFICIENCY[];
export const weaponProficiencyOptions: WEAPON_PROFICIENCY[] = [
  WEAPON_PROFICIENCY.SIMPLE,
  WEAPON_PROFICIENCY.MARTIAL,
  ...weaponSpecificProficiencyOptions
];
export const armorProficiencyOptions = Object.values(ARMOR_PROFICIENCY) as ARMOR_PROFICIENCY[];
export const toolProficiencyOptions = Object.values(TOOL_PROFICIENCY) as ToolProficiency[];
export const languageProficiencyOptions: LANGUAGE_PROFICIENCY[] = [
  ...standardLanguageEntries.map((entry) => entry.proficiency),
  ...exoticLanguageEntries.map((entry) => entry.proficiency)
];

const equipmentCatalogByName = new Map<string, EquipmentDefinition>(
  equipmentCatalog.map((item) => [item.name, item])
);

const loadoutCodexEntriesByName = new Map<string, LoadoutCodexEntry>(
  loadoutCodexEntries.map((entry) => [entry.name, entry])
);

const backgroundCodexEntriesByName = new Map<string, BackgroundEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is BackgroundEntry => entry.category === ENTRY_CATEGORIES.BACKGROUNDS
    )
    .map((entry) => [entry.name, entry])
);

const speciesCodexEntriesByName = new Map<string, SpeciesEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is SpeciesEntry => entry.category === ENTRY_CATEGORIES.SPECIES)
    .map((entry) => [entry.name, entry])
);

const classCodexEntriesByName = new Map<string, ClassEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is ClassEntry => entry.category === ENTRY_CATEGORIES.CLASSES)
    .map((entry) => [entry.name, entry])
);

export const backgroundOptions = [...backgroundCodexEntriesByName.keys()].sort((left, right) =>
  left.localeCompare(right)
);

const backgroundOptionSet = new Set(backgroundOptions);

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function isSkillProficiency(value: string): value is SKILL_PROFICIENCY {
  return skillProficiencySet.has(value);
}

function isSavingThrowProficiency(value: string): value is SAVING_THROW_PROFICIENCY {
  return savingThrowProficiencySet.has(value);
}

function isWeaponProficiency(value: string): value is WEAPON_PROFICIENCY {
  return weaponProficiencySet.has(value);
}

function isArmorProficiency(value: string): value is ARMOR_PROFICIENCY {
  return armorProficiencySet.has(value);
}

function isToolProficiency(value: string): value is TOOL_PROFICIENCY {
  return toolProficiencySet.has(value);
}

export function isCustomLanguageProficiency(
  value: string
): value is `${typeof CUSTOM_LANGUAGE_PREFIX}${string}` {
  return value.startsWith(CUSTOM_LANGUAGE_PREFIX) && value.slice(CUSTOM_LANGUAGE_PREFIX.length).trim().length > 0;
}

function isBuiltInLanguageProficiency(value: string): value is LANGUAGE_PROFICIENCY {
  return builtInLanguageProficiencySet.has(value as LANGUAGE_PROFICIENCY);
}

export function isLanguageProficiency(value: string): value is LanguageProficiency {
  return isBuiltInLanguageProficiency(value) || isCustomLanguageProficiency(value);
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

function isProficiencySource(value: string): value is PROFICIENCY_SOURCE {
  return proficiencySourceSet.has(value);
}

function isProfLevel(value: string): value is PROF_LEVEL {
  return profLevelSet.has(value);
}

function isProficiencyOverridePolicy(
  value: string
): value is PROFICIENCY_OVERRIDE_POLICY {
  return proficiencyOverridePolicySet.has(value);
}

function normalizeOverridePolicy(
  value: PROFICIENCY_OVERRIDE_POLICY | undefined
): PROFICIENCY_OVERRIDE_POLICY {
  return value === PROFICIENCY_OVERRIDE_POLICY.LOCKED
    ? PROFICIENCY_OVERRIDE_POLICY.LOCKED
    : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE;
}

function compareProficiencyLevels(left: PROF_LEVEL, right: PROF_LEVEL): number {
  return proficiencyLevelRank[left] - proficiencyLevelRank[right];
}

export function getSkillProficiencyForName(skill: string): SKILL_PROFICIENCY | null {
  if (!skillOptionSet.has(skill)) {
    return null;
  }

  return skillProficiencyBySkillName.get(skill as SkillName) ?? null;
}

function getLegacyToolProficiency(value: string): TOOL_PROFICIENCY | null {
  if (!Object.values(LEGACY_TOOL_PROFICIENCIES).includes(value as LEGACY_TOOL_PROFICIENCIES)) {
    return null;
  }

  return toolProficiencyByLegacyType[value as LEGACY_TOOL_PROFICIENCIES];
}

function getSourceLabel(source: PROFICIENCY_SOURCE, sourceStr?: string): string {
  const normalizedSourceStr = sourceStr?.trim();
  if (normalizedSourceStr && normalizedSourceStr.length > 0) {
    const [label] = normalizedSourceStr.split(sourceStrMetadataSeparator);
    return label;
  }

  return source;
}

export function createFeatProficiencySourceStr(sourceLabel: string, sourceKey: string): string {
  return `${sourceLabel.trim()}${sourceStrMetadataSeparator}${sourceKey.trim()}`;
}

export function createFeatureProficiencySourceStr(
  sourceLabel: string,
  sourceKey: string
): string {
  return `${sourceLabel.trim()}${sourceStrMetadataSeparator}${sourceKey.trim()}`;
}

function createSkillEntry(
  proficiency: SKILL_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): SkillProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

function createSavingThrowEntry(
  proficiency: SAVING_THROW_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): SavingThrowProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

function createWeaponEntry(
  proficiency: WEAPON_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): WeaponProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

function createArmorEntry(
  proficiency: ARMOR_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): ArmorProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

function createToolEntry(
  proficiency: TOOL_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): ToolProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

export function addFeatGrantedSkillEntries(
  entries: SkillProficiencyEntry[],
  skills: SkillName[],
  featLabel: string,
  featEntryId: string
): SkillProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const manualProficiencies = new Set(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.MANUAL &&
          hasPositiveProficiencyLevel(entry.proficiencyLevel)
      )
      .map((entry) => entry.proficiency)
  );

  return mergeProficiencyEntries([
    ...entries,
    ...skills
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((proficiency): proficiency is SKILL_PROFICIENCY => proficiency !== null)
      .filter((proficiency) => !manualProficiencies.has(proficiency))
      .map((proficiency) =>
        createSkillEntry(
          proficiency,
          PROFICIENCY_SOURCE.FEAT,
          sourceStr,
          PROF_LEVEL.PROFICIENT
        )
      )
  ]);
}

export function removeFeatGrantedSkillEntries(
  entries: SkillProficiencyEntry[],
  skills: SkillName[],
  featLabel: string,
  featEntryId: string
): SkillProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const proficienciesToRemove = new Set(
    skills
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((proficiency): proficiency is SKILL_PROFICIENCY => proficiency !== null)
  );

  return mergeProficiencyEntries(
    entries.filter(
      (entry) =>
        !(
          entry.source === PROFICIENCY_SOURCE.FEAT &&
          entry.sourceStr === sourceStr &&
          proficienciesToRemove.has(entry.proficiency)
        )
    )
  );
}

export function addFeatGrantedToolEntries(
  entries: ToolProficiencyEntry[],
  tools: ToolProficiency[],
  featLabel: string,
  featEntryId: string
): ToolProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const manualProficiencies = new Set(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.MANUAL &&
          hasPositiveProficiencyLevel(entry.proficiencyLevel)
      )
      .map((entry) => entry.proficiency)
  );

  return mergeProficiencyEntries([
    ...entries,
    ...tools
      .filter((tool) => !manualProficiencies.has(tool))
      .map((tool) =>
      createToolEntry(tool, PROFICIENCY_SOURCE.FEAT, sourceStr, PROF_LEVEL.PROFICIENT)
      )
  ]);
}

export function removeFeatGrantedToolEntries(
  entries: ToolProficiencyEntry[],
  tools: ToolProficiency[],
  featLabel: string,
  featEntryId: string
): ToolProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const toolsToRemove = new Set<ToolProficiency>(tools);

  return mergeProficiencyEntries(
    entries.filter(
      (entry) =>
        !(
          entry.source === PROFICIENCY_SOURCE.FEAT &&
          entry.sourceStr === sourceStr &&
          toolsToRemove.has(entry.proficiency)
        )
    )
  );
}

function createLanguageEntry(
  proficiency: LanguageProficiency,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE,
  customDescription?: string
): LanguageProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy),
    customDescription:
      typeof customDescription === "string" && customDescription.trim().length > 0
        ? customDescription.trim()
        : undefined
  };
}

function createEntryIdentityKey(entry: ProficiencyEntry): string {
  return `${entry.proficiency}:${entry.source}:${entry.sourceStr ?? ""}`;
}

function mergeProficiencyEntries<T extends ProficiencyEntry>(entries: T[]): T[] {
  const entriesByKey = new Map<string, T>();

  entries.forEach((entry) => {
    const key = createEntryIdentityKey(entry);
    const existingEntry = entriesByKey.get(key);
    const normalizedEntry = {
      ...entry,
      overridePolicy: normalizeOverridePolicy(entry.overridePolicy)
    } as T;

    if (
      !existingEntry ||
      compareProficiencyLevels(existingEntry.proficiencyLevel, normalizedEntry.proficiencyLevel) < 0 ||
      (
        compareProficiencyLevels(existingEntry.proficiencyLevel, normalizedEntry.proficiencyLevel) === 0 &&
        proficiencyOverridePolicyRank[normalizeOverridePolicy(existingEntry.overridePolicy)] <
          proficiencyOverridePolicyRank[normalizeOverridePolicy(normalizedEntry.overridePolicy)]
      )
    ) {
      entriesByKey.set(key, normalizedEntry);
    }
  });

  return [...entriesByKey.values()].sort((left, right) => {
    const labelComparison = getProficiencyLabel(left.proficiency).localeCompare(
      getProficiencyLabel(right.proficiency)
    );

    if (labelComparison !== 0) {
      return labelComparison;
    }

    return getSourceLabel(left.source, left.sourceStr).localeCompare(
      getSourceLabel(right.source, right.sourceStr)
    );
  });
}

function hasPositiveProficiencyLevel(level: PROF_LEVEL): boolean {
  return proficiencyLevelRank[level] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT];
}

function getStoredManualOverrideEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): TEntry | null {
  return entries.reduce<TEntry | null>((highestEntry, entry) => {
    if (
      entry.proficiency !== proficiency ||
      entry.source !== PROFICIENCY_SOURCE.MANUAL
    ) {
      return highestEntry;
    }

    if (
      !highestEntry ||
      compareProficiencyLevels(highestEntry.proficiencyLevel, entry.proficiencyLevel) < 0
    ) {
      return entry;
    }

    return highestEntry;
  }, null);
}

function hasNonManualPositiveEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): boolean {
  return entries.some(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      hasPositiveProficiencyLevel(entry.proficiencyLevel)
  );
}

function getHighestEntryLevel<TEntry extends ProficiencyEntry>(entries: TEntry[]): PROF_LEVEL {
  return entries.reduce<PROF_LEVEL>(
    (highestLevel, entry) =>
      compareProficiencyLevels(highestLevel, entry.proficiencyLevel) >= 0
        ? highestLevel
        : entry.proficiencyLevel,
    PROF_LEVEL.NONE
  );
}

function getNonManualPositiveEntries<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): TEntry[] {
  return entries.filter(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      hasPositiveProficiencyLevel(entry.proficiencyLevel)
  );
}

function hasLockedNonManualPositiveEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): boolean {
  return getNonManualPositiveEntries(entries, proficiency).some(
    (entry) => normalizeOverridePolicy(entry.overridePolicy) === PROFICIENCY_OVERRIDE_POLICY.LOCKED
  );
}

function getResolvedProficiencyEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): ResolvedProficiencyEntry<TEntry["proficiency"]> {
  const manualOverride = getStoredManualOverrideEntry(entries, proficiency);
  const automaticEntries = getNonManualPositiveEntries(entries, proficiency);
  const lockedAutomaticEntries = automaticEntries.filter(
    (entry) => normalizeOverridePolicy(entry.overridePolicy) === PROFICIENCY_OVERRIDE_POLICY.LOCKED
  );

  if (lockedAutomaticEntries.length > 0) {
    return {
      proficiency,
      proficiencyLevel: getHighestEntryLevel(automaticEntries),
      sourceLabels: dedupe(
        automaticEntries.map((entry) => getSourceLabel(entry.source, entry.sourceStr))
      ),
      locked: true,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    };
  }

  if (manualOverride) {
    return {
      proficiency,
      proficiencyLevel: manualOverride.proficiencyLevel,
      sourceLabels:
        manualOverride.proficiencyLevel === PROF_LEVEL.NONE
          ? []
          : [getSourceLabel(manualOverride.source, manualOverride.sourceStr)],
      locked: false,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
    };
  }

  if (automaticEntries.length === 0) {
    return {
      proficiency,
      proficiencyLevel: PROF_LEVEL.NONE,
      sourceLabels: [],
      locked: false,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
    };
  }

  return {
    proficiency,
    proficiencyLevel: getHighestEntryLevel(automaticEntries),
    sourceLabels: dedupe(automaticEntries.map((entry) => getSourceLabel(entry.source, entry.sourceStr))),
    locked: false,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
  };
}

function getDisplayProficiencyEntries<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  options: readonly TEntry["proficiency"][]
): ProficiencyDisplayEntry<TEntry["proficiency"]>[] {
  return options
    .reduce<ProficiencyDisplayEntry<TEntry["proficiency"]>[]>((displayEntries, proficiency) => {
      const resolvedEntry = getResolvedProficiencyEntry(entries, proficiency);

      if (resolvedEntry.proficiencyLevel === PROF_LEVEL.NONE) {
        return displayEntries;
      }

      displayEntries.push({
        proficiency,
        proficiencyLevel: resolvedEntry.proficiencyLevel,
        sourceLabels: resolvedEntry.sourceLabels,
        locked: resolvedEntry.locked
      });

      return displayEntries;
    }, [])
    .sort((left, right) =>
      getProficiencyLabel(left.proficiency).localeCompare(getProficiencyLabel(right.proficiency))
    );
}

type ProficiencyEntryFactory<TEntry extends ProficiencyEntry> = (
  proficiency: TEntry["proficiency"],
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL
) => TEntry;

function upsertManualEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"],
  proficiencyLevel: PROF_LEVEL,
  createEntry: ProficiencyEntryFactory<TEntry>
): TEntry[] {
  const nextEntries = entries.filter(
    (entry) =>
      !(entry.source === PROFICIENCY_SOURCE.MANUAL && entry.proficiency === proficiency)
  );

  if (proficiencyLevel === PROF_LEVEL.NONE && !hasNonManualPositiveEntry(entries, proficiency)) {
    return mergeProficiencyEntries(nextEntries);
  }

  return mergeProficiencyEntries([
    ...nextEntries,
    createEntry(proficiency, PROFICIENCY_SOURCE.MANUAL, undefined, proficiencyLevel)
  ]);
}

function normalizeProficiencyEntries<T extends ProficiencyEntry>(
  value: unknown,
  isValidProficiency: (value: string) => value is T["proficiency"]
): T[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return mergeProficiencyEntries(
    value
      .map((rawEntry) => {
        if (!rawEntry || typeof rawEntry !== "object") {
          return null;
        }

        const entry = rawEntry as Partial<T>;

        if (
          typeof entry.proficiency !== "string" ||
          !isValidProficiency(entry.proficiency) ||
          typeof entry.source !== "string" ||
          !isProficiencySource(entry.source)
        ) {
          return null;
        }

        const proficiencyLevel =
          typeof entry.proficiencyLevel === "string" && isProfLevel(entry.proficiencyLevel)
            ? entry.proficiencyLevel
            : PROF_LEVEL.PROFICIENT;

        return {
          source: entry.source,
          sourceStr:
            typeof entry.sourceStr === "string" && entry.sourceStr.trim().length > 0
              ? entry.sourceStr.trim()
              : undefined,
          proficiency: entry.proficiency,
          proficiencyLevel,
          overridePolicy:
            typeof entry.overridePolicy === "string" &&
            isProficiencyOverridePolicy(entry.overridePolicy)
              ? entry.overridePolicy
              : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
        } as T;
      })
      .filter((entry): entry is T => entry !== null)
  );
}

function isAutomaticSource(source: PROFICIENCY_SOURCE): boolean {
  return (
    source === PROFICIENCY_SOURCE.CLASS ||
    source === PROFICIENCY_SOURCE.SPECIES ||
    source === PROFICIENCY_SOURCE.BACKGROUND
  );
}

function stripAutomaticEntries<T extends ProficiencyEntry>(entries: T[]): T[] {
  return entries.filter((entry) => !isAutomaticSource(entry.source));
}

export function getProficiencyLabel(
  proficiency:
    | SKILL_PROFICIENCY
    | SAVING_THROW_PROFICIENCY
    | WEAPON_PROFICIENCY
    | ARMOR_PROFICIENCY
    | TOOL_PROFICIENCY
    | LanguageProficiency
): string {
  if (proficiency in skillNameByProficiency) {
    return skillNameByProficiency[proficiency as SKILL_PROFICIENCY];
  }

  if (proficiency in savingThrowProficiencyLabels) {
    return savingThrowProficiencyLabels[proficiency as SAVING_THROW_PROFICIENCY];
  }

  if (weaponProficiencySet.has(proficiency as string)) {
    return getWeaponProficiencyLabel(proficiency as WEAPON_PROFICIENCY);
  }

  if (proficiency in armorProficiencyLabels) {
    return armorProficiencyLabels[proficiency as ARMOR_PROFICIENCY];
  }

  if (proficiency in toolProficiencyLabels) {
    return toolProficiencyLabels[proficiency as TOOL_PROFICIENCY];
  }

  if (isCustomLanguageProficiency(proficiency)) {
    return getCustomLanguageNameFromProficiency(proficiency) ?? "Custom language";
  }

  return languageProficiencyLabels[proficiency as LANGUAGE_PROFICIENCY];
}

export function getProficiencyKeyword(
  proficiency:
    | SKILL_PROFICIENCY
    | SAVING_THROW_PROFICIENCY
    | WEAPON_PROFICIENCY
    | ARMOR_PROFICIENCY
    | TOOL_PROFICIENCY
    | LanguageProficiency
): string {
  return getProficiencyLabel(proficiency);
}

export function getProficiencySourceLabel(entry: Pick<ProficiencyEntry, "source" | "sourceStr">): string {
  return getSourceLabel(entry.source, entry.sourceStr);
}

export function getToolProficiencyLabel(toolProficiency: ToolProficiency): string {
  return toolProficiencyLabels[toolProficiency];
}

export function getSkillNameFromProficiency(proficiency: SKILL_PROFICIENCY): SkillName {
  return skillNameByProficiency[proficiency];
}

export function getSavingThrowAbilityKey(
  proficiency: SAVING_THROW_PROFICIENCY
): AbilityKey {
  return abilityKeyBySavingThrowProficiency[proficiency];
}

export function getSavingThrowProficiencyForAbilityKey(
  ability: AbilityKey
): SAVING_THROW_PROFICIENCY {
  return savingThrowProficiencyByAbilityKey[ability];
}

export function getWeaponProficiencyForTraining(
  training: WeaponType
): WEAPON_PROFICIENCY {
  return weaponProficiencyByTraining[training];
}

export function getWeaponProficiencyForBaseWeapon(
  baseWeapon: WEAPON_BASE
): WEAPON_PROFICIENCY {
  return weaponProficiencyByBaseWeapon[baseWeapon];
}

export function isWeaponMasteryProficiency(proficiency: WEAPON_PROFICIENCY): boolean {
  return proficiency !== WEAPON_PROFICIENCY.SIMPLE && proficiency !== WEAPON_PROFICIENCY.MARTIAL;
}

export function getWeaponProficiencyLabel(proficiency: WEAPON_PROFICIENCY): string {
  if (proficiency === WEAPON_PROFICIENCY.SIMPLE) {
    return weaponProficiencyLabelsByType[WEAPON_TRAINING.SIMPLE];
  }

  if (proficiency === WEAPON_PROFICIENCY.MARTIAL) {
    return weaponProficiencyLabelsByType[WEAPON_TRAINING.MARTIAL];
  }

  return (
    weaponProficiencyLabelsByBaseWeapon.get(
      proficiency as unknown as WEAPON_BASE
    ) ??
    proficiency.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

export function getWeaponProficiencyTypeLabel(
  proficiency: WEAPON_PROFICIENCY
): string | null {
  if (!isWeaponMasteryProficiency(proficiency)) {
    return null;
  }

  const weaponEntry = commonWeaponEntriesByBaseWeapon.get(
    proficiency as unknown as WEAPON_BASE
  );

  return weaponEntry
    ? `${formatCodexLabel(weaponEntry.type.training)} ${formatCodexLabel(weaponEntry.type.combat)}`
    : null;
}

export function getArmorProficiencyForType(type: ArmorType): ARMOR_PROFICIENCY {
  return armorProficiencyByType[type];
}

export function isClassName(value: string): value is ClassName {
  return classOptionSet.has(value);
}

export function isBackgroundName(value: string): boolean {
  return backgroundOptionSet.has(value);
}

export function getBackgroundEntryByName(backgroundName: string): BackgroundEntry | undefined {
  return backgroundCodexEntriesByName.get(backgroundName);
}

export function getClassProficiencyProfile(className: string): ClassProficiencyProfile | null {
  if (!isClassName(className)) {
    return null;
  }

  return classProficiencyProfiles[className];
}

export function getSkillProficiencyOptionsForClass(className: string): SkillName[] {
  const profile = getClassProficiencyProfile(className);
  return profile ? [...profile.skillProficiencyOptions] : [];
}

export function getSkillSelectionLimitForClass(className: string): number {
  const profile = getClassProficiencyProfile(className);
  return profile ? profile.skillProficiencyCount : 0;
}

export function getToolProficiencyChoicesForClass(
  className: string
): { choices: ToolProficiency[]; count: number } {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return { choices: [], count: 0 };
  }

  return {
    choices: profile.toolProficiencyChoices ?? [],
    count: profile.toolProficiencyChoiceCount ?? 0
  };
}

export function getEquipmentProficiencyLabelsForClass(
  className: string
): EquipmentProficiencyLabels {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return {
      weapons: [],
      armor: []
    };
  }

  return {
    weapons: profile.weaponProficiencies.map((type) => weaponProficiencyLabelsByType[type]),
    armor: profile.armorProficiencies.map((type) => armorProficiencyLabelsByType[type])
  };
}

function isProficientWithEquipmentType(
  profile: ClassProficiencyProfile,
  equipment: EquipmentDefinition
): boolean {
  if (equipment.category === "gear") {
    return true;
  }

  if (equipment.category === "weapon") {
    return profile.weaponProficiencies.includes(equipment.training);
  }

  return profile.armorProficiencies.includes(equipment.type);
}

export function getEquipmentByName(name: string): EquipmentDefinition | undefined {
  return equipmentCatalogByName.get(name);
}

export function getLoadoutCodexEntryByName(name: string): LoadoutCodexEntry | undefined {
  return loadoutCodexEntriesByName.get(name);
}

export function getAvailableEquipmentForClass(className: string): EquipmentDefinition[] {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return equipmentCatalog.filter((item) => item.category === "gear");
  }

  return equipmentCatalog.filter((item) => isProficientWithEquipmentType(profile, item));
}

export function getAvailableEquipmentNamesForClass(className: string): string[] {
  return getAvailableEquipmentForClass(className).map((item) => item.name);
}

export function normalizeToolProficiencySelections(selectedToolProficiencies: string[]): ToolProficiency[] {
  return dedupe(
    selectedToolProficiencies
      .map((toolProficiency) => getLegacyToolProficiency(toolProficiency) ?? toolProficiency)
      .filter((toolProficiency): toolProficiency is ToolProficiency =>
        typeof toolProficiency === "string" && isToolProficiency(toolProficiency)
      )
  );
}

function normalizeSkillName(value: string): SkillName | null {
  return skillOptionSet.has(value) ? (value as SkillName) : null;
}

function getBackgroundGrantedSkillProficiencies(background: string): SkillName[] {
  const entry = backgroundCodexEntriesByName.get(background);

  if (!entry) {
    return [];
  }

  return entry.grantedSkillProficiencies
    .map((skill) => normalizeSkillName(skill))
    .filter((skill): skill is SkillName => skill !== null);
}

function getBackgroundGrantedToolProficiencies(background: string): ToolProficiency[] {
  const entry = backgroundCodexEntriesByName.get(background);

  if (!entry) {
    return [];
  }

  return entry.grantedToolProficiencies
    .map((toolProficiency) => toolProficiencyByLegacyType[toolProficiency])
    .filter((toolProficiency): toolProficiency is ToolProficiency => toolProficiency !== undefined);
}

function getSpeciesGrantedSkillProficiencies(species: string): SkillName[] {
  const entry = speciesCodexEntriesByName.get(species);

  if (!entry) {
    return [];
  }

  return entry.grantedSkillProficiencies
    .map((skill) => normalizeSkillName(skill))
    .filter((skill): skill is SkillName => skill !== null);
}

function getSpeciesGrantedToolProficiencies(species: string): ToolProficiency[] {
  const entry = speciesCodexEntriesByName.get(species);

  if (!entry) {
    return [];
  }

  return entry.grantedToolProficiencies
    .map((toolProficiency) => toolProficiencyByLegacyType[toolProficiency])
    .filter((toolProficiency): toolProficiency is ToolProficiency => toolProficiency !== undefined);
}

function getClassGrantedSkillProficiencies(className: string): SkillName[] {
  const entry = classCodexEntriesByName.get(className);

  if (!entry) {
    return [];
  }

  return entry.grantedSkillProficiencies
    .map((skill) => normalizeSkillName(skill))
    .filter((skill): skill is SkillName => skill !== null);
}

function getClassGrantedToolProficiencies(className: string): ToolProficiency[] {
  const entry = classCodexEntriesByName.get(className);
  const profile = getClassProficiencyProfile(className);
  const codexToolProficiencies =
    entry?.grantedToolProficiencies
      .map((toolProficiency) => toolProficiencyByLegacyType[toolProficiency])
      .filter((toolProficiency): toolProficiency is ToolProficiency => toolProficiency !== undefined) ?? [];

  return mergeProficiencyEntries(
    [...dedupe([...(profile?.grantedToolProficiencies ?? []), ...codexToolProficiencies])].map(
      (toolProficiency) =>
        createToolEntry(toolProficiency, PROFICIENCY_SOURCE.CLASS, className, PROF_LEVEL.PROFICIENT)
    )
  ).map((entry) => entry.proficiency);
}

function getAutomaticSkillEntries(
  className: string,
  species: string,
  background = ""
): SkillProficiencyEntry[] {
  const classSourceLabel = className.trim() || undefined;
  const speciesSourceLabel = species.trim() || undefined;
  const backgroundSourceLabel = background.trim() || undefined;

  return mergeProficiencyEntries([
    ...getClassGrantedSkillProficiencies(className)
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
      .map((skill) =>
        createSkillEntry(skill, PROFICIENCY_SOURCE.CLASS, classSourceLabel, PROF_LEVEL.PROFICIENT)
      ),
    ...getSpeciesGrantedSkillProficiencies(species)
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
      .map((skill) =>
        createSkillEntry(
          skill,
          PROFICIENCY_SOURCE.SPECIES,
          speciesSourceLabel,
          PROF_LEVEL.PROFICIENT
        )
      ),
    ...getBackgroundGrantedSkillProficiencies(background)
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
      .map((skill) =>
        createSkillEntry(
          skill,
          PROFICIENCY_SOURCE.BACKGROUND,
          backgroundSourceLabel,
          PROF_LEVEL.PROFICIENT
        )
      )
  ]);
}

function getAutomaticSavingThrowEntries(className: string): SavingThrowProficiencyEntry[] {
  const classEntry = classCodexEntriesByName.get(className);
  const sourceStr = className.trim() || undefined;

  if (!classEntry) {
    return [];
  }

  return mergeProficiencyEntries(
    classEntry.savingThrowProficiencies
      .map((savingThrow) => savingThrowProficiencyByAbilityKey[savingThrow as AbilityKey])
      .filter((savingThrow): savingThrow is SAVING_THROW_PROFICIENCY => savingThrow !== undefined)
      .map((savingThrow) =>
        createSavingThrowEntry(
          savingThrow,
          PROFICIENCY_SOURCE.CLASS,
          sourceStr,
          PROF_LEVEL.PROFICIENT
        )
      )
  );
}

function getAutomaticWeaponEntries(className: string): WeaponProficiencyEntry[] {
  const profile = getClassProficiencyProfile(className);
  const sourceStr = className.trim() || undefined;

  if (!profile) {
    return [];
  }

  return mergeProficiencyEntries(
    profile.weaponProficiencies.map((training) =>
      createWeaponEntry(
        weaponProficiencyByTraining[training],
        PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        PROF_LEVEL.PROFICIENT
      )
    )
  );
}

function getAutomaticArmorEntries(className: string): ArmorProficiencyEntry[] {
  const profile = getClassProficiencyProfile(className);
  const sourceStr = className.trim() || undefined;

  if (!profile) {
    return [];
  }

  return mergeProficiencyEntries(
    profile.armorProficiencies.map((armorType) =>
      createArmorEntry(
        armorProficiencyByType[armorType],
        PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        PROF_LEVEL.PROFICIENT
      )
    )
  );
}

function getAutomaticToolEntries(
  className: string,
  species: string,
  background = ""
): ToolProficiencyEntry[] {
  const classSourceLabel = className.trim() || undefined;
  const speciesSourceLabel = species.trim() || undefined;
  const backgroundSourceLabel = background.trim() || undefined;

  return mergeProficiencyEntries([
    ...getClassGrantedToolProficiencies(className).map((toolProficiency) =>
      createToolEntry(
        toolProficiency,
        PROFICIENCY_SOURCE.CLASS,
        classSourceLabel,
        PROF_LEVEL.PROFICIENT
      )
    ),
    ...getSpeciesGrantedToolProficiencies(species).map((toolProficiency) =>
      createToolEntry(
        toolProficiency,
        PROFICIENCY_SOURCE.SPECIES,
        speciesSourceLabel,
        PROF_LEVEL.PROFICIENT
      )
    ),
    ...getBackgroundGrantedToolProficiencies(background).map((toolProficiency) =>
      createToolEntry(
        toolProficiency,
        PROFICIENCY_SOURCE.BACKGROUND,
        backgroundSourceLabel,
        PROF_LEVEL.PROFICIENT
      )
    )
  ]);
}

export function getAutomaticProficiencyCollectionsForCharacter(
  className: string,
  species: string,
  background = "",
  options?: {
    level?: number;
    classFeatureState?: CharacterClassFeatureState;
  }
): CharacterProficiencyCollections {
  const featureCharacter = {
    className,
    level: options?.level ?? 1,
    classFeatureState: options?.classFeatureState
  };

  return {
    skillProficiencies: mergeProficiencyEntries([
      ...getAutomaticSkillEntries(className, species, background),
      ...getFeatureSkillProficiencyEntriesForCharacter(featureCharacter)
    ]),
    savingThrowProficiencies: getAutomaticSavingThrowEntries(className),
    weaponProficiencies: mergeProficiencyEntries([
      ...getAutomaticWeaponEntries(className),
      ...getFeatureWeaponProficiencyEntriesForCharacter(featureCharacter)
    ]),
    armorProficiencies: mergeProficiencyEntries([
      ...getAutomaticArmorEntries(className),
      ...getFeatureArmorProficiencyEntriesForCharacter(featureCharacter)
    ]),
    toolProficiencies: getAutomaticToolEntries(className, species, background),
    languageProficiencies: mergeProficiencyEntries(
      getFeatureLanguageProficiencyEntriesForCharacter(featureCharacter)
    )
  };
}

function buildGrantedEntriesFromCollections(
  collections: CharacterProficiencyCollections
): GrantedProficiency[] {
  const grantedByKey = new Map<
    string,
    { kind: GrantedProficiencyKind; name: string; sources: Set<string> }
  >();

  const allEntries: Array<readonly [GrantedProficiencyKind, ProficiencyEntry]> = [
    ...collections.skillProficiencies.map((entry) => ["skill", entry] as const),
    ...collections.savingThrowProficiencies.map((entry) => ["savingThrow", entry] as const),
    ...collections.weaponProficiencies.map((entry) => ["weapon", entry] as const),
    ...collections.armorProficiencies.map((entry) => ["armor", entry] as const),
    ...collections.toolProficiencies.map((entry) => ["tool", entry] as const),
    ...collections.languageProficiencies.map((entry) => ["language", entry] as const)
  ];

  allEntries.forEach(([kind, entry]) => {
    const name = getProficiencyLabel(entry.proficiency);
    const key = `${kind}:${name}`;
    const grantedEntry = grantedByKey.get(key) ?? {
      kind,
      name,
      sources: new Set<string>()
    };

    grantedEntry.sources.add(getSourceLabel(entry.source, entry.sourceStr));
    grantedByKey.set(key, grantedEntry);
  });

  return [...grantedByKey.values()].map((entry) => ({
    kind: entry.kind,
    name: entry.name,
    sources: [...entry.sources]
  }));
}

export function getGrantedProficienciesForCharacter(
  className: string,
  species: string,
  background = ""
): GrantedProficiency[] {
  return buildGrantedEntriesFromCollections(
    getAutomaticProficiencyCollectionsForCharacter(className, species, background)
  );
}

export function getGrantedSkillProficienciesForCharacter(
  className: string,
  species: string,
  background = ""
): GrantedSkillProficiency[] {
  const grantedBySkill = new Map<SkillName, Set<string>>();

  getAutomaticSkillEntries(className, species, background).forEach((entry) => {
    const skill = skillNameByProficiency[entry.proficiency];
    const sources = grantedBySkill.get(skill) ?? new Set<string>();
    sources.add(getSourceLabel(entry.source, entry.sourceStr));
    grantedBySkill.set(skill, sources);
  });

  return [...grantedBySkill.entries()].map(([skill, sources]) => ({
    skill,
    sources: [...sources]
  }));
}

export function normalizeSkillSelectionsForClass(
  className: string,
  selectedSkills: string[],
  species = "",
  background = ""
): SkillName[] {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return [];
  }

  const allowedSkillSet = new Set<string>(profile.skillProficiencyOptions);
  const grantedSkillSet = new Set<string>(
    getGrantedSkillProficienciesForCharacter(className, species, background).map(
      (entry) => entry.skill
    )
  );

  return dedupe(selectedSkills)
    .filter((skill): skill is SkillName => allowedSkillSet.has(skill))
    .filter((skill) => !grantedSkillSet.has(skill))
    .slice(0, profile.skillProficiencyCount);
}

export function normalizeManualSkillSelections(selectedSkills: string[]): SkillName[] {
  return dedupe(selectedSkills).filter((skill): skill is SkillName => skillOptionSet.has(skill));
}

export function normalizeSkillExpertiseSelections(
  proficientSkills: string[],
  selectedSkillExpertise: string[]
): SkillName[] {
  const proficientSkillSet = new Set<string>(normalizeManualSkillSelections(proficientSkills));

  return dedupe(selectedSkillExpertise)
    .filter((skill): skill is SkillName => skillOptionSet.has(skill))
    .filter((skill) => proficientSkillSet.has(skill));
}

export function normalizeSkillExpertiseSelectionsForCharacter(
  className: string,
  species: string,
  background: string,
  selectedSkills: string[],
  selectedSkillExpertise: string[]
): SkillName[] {
  const grantedSkillSet = new Set<string>(
    getGrantedSkillProficienciesForCharacter(className, species, background).map(
      (entry) => entry.skill
    )
  );
  const manualSkillSet = new Set<string>(normalizeManualSkillSelections(selectedSkills));
  const proficientSkills = [...new Set([...grantedSkillSet, ...manualSkillSet])];

  return normalizeSkillExpertiseSelections(proficientSkills, selectedSkillExpertise);
}

function normalizeLegacySavingThrowSelections(values: string[]): AbilityKey[] {
  const validAbilityKeys = new Set<AbilityKey>(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);

  return dedupe(
    values.filter(
      (ability): ability is AbilityKey =>
        typeof ability === "string" && validAbilityKeys.has(ability as AbilityKey)
    )
  );
}

function normalizeLegacyManualSkillEntries(
  selectedSkills: string[],
  selectedSkillExpertise: string[]
): SkillProficiencyEntry[] {
  const normalizedManualSkills = normalizeManualSkillSelections(selectedSkills);
  const manualSkillSet = new Set<SKILL_PROFICIENCY>(
    normalizedManualSkills
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
  );
  const expertSkillSet = new Set<SKILL_PROFICIENCY>(
    selectedSkillExpertise
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
  );

  return mergeProficiencyEntries([
    ...[...manualSkillSet].map((skill) =>
      createSkillEntry(skill, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.PROFICIENT)
    ),
    ...[...expertSkillSet].map((skill) =>
      createSkillEntry(skill, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.EXPERT)
    )
  ]);
}

function normalizeLegacyManualToolEntries(selectedToolProficiencies: string[]): ToolProficiencyEntry[] {
  return mergeProficiencyEntries(
    normalizeToolProficiencySelections(selectedToolProficiencies).map((toolProficiency) =>
      createToolEntry(toolProficiency, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.PROFICIENT)
    )
  );
}

function normalizeLegacyManualSavingThrowEntries(
  className: string,
  selectedSavingThrows: string[]
): SavingThrowProficiencyEntry[] {
  const automaticSavingThrowSet = new Set<SAVING_THROW_PROFICIENCY>(
    getAutomaticSavingThrowEntries(className).map((entry) => entry.proficiency)
  );

  return mergeProficiencyEntries(
    normalizeLegacySavingThrowSelections(selectedSavingThrows)
      .map((ability) => savingThrowProficiencyByAbilityKey[ability])
      .filter((savingThrow): savingThrow is SAVING_THROW_PROFICIENCY => savingThrow !== undefined)
      .filter((savingThrow) => !automaticSavingThrowSet.has(savingThrow))
      .map((savingThrow) =>
        createSavingThrowEntry(
          savingThrow,
          PROFICIENCY_SOURCE.MANUAL,
          undefined,
          PROF_LEVEL.PROFICIENT
        )
      )
  );
}

function normalizeSkillProficiencyEntries(value: unknown): SkillProficiencyEntry[] {
  return normalizeProficiencyEntries<SkillProficiencyEntry>(value, isSkillProficiency);
}

function normalizeSavingThrowProficiencyEntries(value: unknown): SavingThrowProficiencyEntry[] {
  return normalizeProficiencyEntries<SavingThrowProficiencyEntry>(value, isSavingThrowProficiency);
}

function normalizeWeaponProficiencyEntries(value: unknown): WeaponProficiencyEntry[] {
  return normalizeProficiencyEntries<WeaponProficiencyEntry>(value, isWeaponProficiency);
}

function normalizeArmorProficiencyEntries(value: unknown): ArmorProficiencyEntry[] {
  return normalizeProficiencyEntries<ArmorProficiencyEntry>(value, isArmorProficiency);
}

function normalizeToolProficiencyEntries(value: unknown): ToolProficiencyEntry[] {
  return normalizeProficiencyEntries<ToolProficiencyEntry>(value, isToolProficiency);
}

function normalizeLanguageProficiencyEntries(value: unknown): LanguageProficiencyEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return mergeProficiencyEntries(
    value
      .map((rawEntry) => {
        if (!rawEntry || typeof rawEntry !== "object") {
          return null;
        }

        const entry = rawEntry as Partial<LanguageProficiencyEntry>;

        if (
          typeof entry.proficiency !== "string" ||
          !isLanguageProficiency(entry.proficiency) ||
          typeof entry.source !== "string" ||
          !isProficiencySource(entry.source)
        ) {
          return null;
        }

        const proficiencyLevel =
          typeof entry.proficiencyLevel === "string" && isProfLevel(entry.proficiencyLevel)
            ? entry.proficiencyLevel
            : PROF_LEVEL.PROFICIENT;

        return createLanguageEntry(
          entry.proficiency,
          entry.source,
          typeof entry.sourceStr === "string" ? entry.sourceStr : undefined,
          proficiencyLevel,
          typeof entry.overridePolicy === "string" &&
            isProficiencyOverridePolicy(entry.overridePolicy)
            ? entry.overridePolicy
            : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE,
          typeof entry.customDescription === "string" ? entry.customDescription : undefined
        );
      })
      .filter((entry): entry is LanguageProficiencyEntry => entry !== null)
  );
}

export function normalizeCharacterProficiencies(
  options: NormalizeCharacterProficienciesOptions
): CharacterProficiencyCollections {
  const automaticCollections = getAutomaticProficiencyCollectionsForCharacter(
    options.className,
    options.species,
    options.background,
    {
      level: options.level,
      classFeatureState: options.classFeatureState
    }
  );

  const normalizedSkillEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizeSkillProficiencyEntries(options.skillProficiencies)),
    ...normalizeLegacyManualSkillEntries(
      options.legacySkills ?? [],
      options.legacySkillExpertise ?? []
    ),
    ...automaticCollections.skillProficiencies
  ]);

  const normalizedSavingThrowEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(
      normalizeSavingThrowProficiencyEntries(options.savingThrowProficiencies)
    ),
    ...normalizeLegacyManualSavingThrowEntries(
      options.className,
      options.legacySavingThrowProficiencies ?? []
    ),
    ...automaticCollections.savingThrowProficiencies
  ]);

  const normalizedWeaponEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizeWeaponProficiencyEntries(options.weaponProficiencies)),
    ...automaticCollections.weaponProficiencies
  ]);

  const normalizedArmorEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizeArmorProficiencyEntries(options.armorProficiencies)),
    ...automaticCollections.armorProficiencies
  ]);

  const normalizedToolEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizeToolProficiencyEntries(options.toolProficiencies)),
    ...normalizeLegacyManualToolEntries(options.legacyToolProficiencies ?? []),
    ...automaticCollections.toolProficiencies
  ]);

  const normalizedLanguageEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizeLanguageProficiencyEntries(options.languageProficiencies)),
    ...automaticCollections.languageProficiencies
  ]);

  return {
    skillProficiencies: normalizedSkillEntries,
    savingThrowProficiencies: normalizedSavingThrowEntries,
    weaponProficiencies: normalizedWeaponEntries,
    armorProficiencies: normalizedArmorEntries,
    toolProficiencies: normalizedToolEntries,
    languageProficiencies: normalizedLanguageEntries
  };
}

export function getManualSkillSelectionsFromEntries(entries: SkillProficiencyEntry[]): SkillName[] {
  return mergeProficiencyEntries(entries)
    .filter(
      (entry) =>
        entry.source === PROFICIENCY_SOURCE.MANUAL &&
        proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
    )
    .map((entry) => skillNameByProficiency[entry.proficiency]);
}

export function getManualSkillExpertiseSelectionsFromEntries(
  entries: SkillProficiencyEntry[]
): SkillName[] {
  return mergeProficiencyEntries(entries)
    .filter(
      (entry) =>
        entry.source === PROFICIENCY_SOURCE.MANUAL && entry.proficiencyLevel === PROF_LEVEL.EXPERT
    )
    .map((entry) => skillNameByProficiency[entry.proficiency]);
}

export function getManualToolSelectionsFromEntries(entries: ToolProficiencyEntry[]): ToolProficiency[] {
  return mergeProficiencyEntries(entries)
    .filter(
      (entry) =>
        entry.source === PROFICIENCY_SOURCE.MANUAL &&
        proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
    )
    .map((entry) => entry.proficiency);
}

export function getSavingThrowSelectionsFromEntries(
  entries: SavingThrowProficiencyEntry[]
): AbilityKey[] {
  return dedupe(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.MANUAL &&
          proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
      )
      .map((entry) => abilityKeyBySavingThrowProficiency[entry.proficiency])
  );
}

export function getSkillLevelFromEntries(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getResolvedSkillProficiencyEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): ResolvedProficiencyEntry<SKILL_PROFICIENCY> {
  return getResolvedProficiencyEntry(entries, proficiency);
}

export function getSavingThrowLevelFromEntries(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getWeaponLevelFromEntries(
  entries: WeaponProficiencyEntry[],
  proficiency: WEAPON_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getAppliedWeaponProficiency(
  entries: WeaponProficiencyEntry[],
  training: WeaponType,
  baseWeapon?: WEAPON_BASE
): { proficiency: WEAPON_PROFICIENCY; label: string; level: PROF_LEVEL } | null {
  const specificProficiency = baseWeapon
    ? getWeaponProficiencyForBaseWeapon(baseWeapon)
    : null;
  const specificLevel = specificProficiency
    ? getWeaponLevelFromEntries(entries, specificProficiency)
    : PROF_LEVEL.NONE;

  if (specificProficiency && specificLevel !== PROF_LEVEL.NONE) {
    return {
      proficiency: specificProficiency,
      label: getWeaponProficiencyLabel(specificProficiency),
      level: specificLevel
    };
  }

  const broadProficiency = getWeaponProficiencyForTraining(training);
  const broadLevel = getWeaponLevelFromEntries(entries, broadProficiency);

  if (broadLevel === PROF_LEVEL.NONE) {
    return null;
  }

  return {
    proficiency: broadProficiency,
    label: getWeaponProficiencyLabel(broadProficiency),
    level: broadLevel
  };
}

export function getArmorLevelFromEntries(
  entries: ArmorProficiencyEntry[],
  proficiency: ARMOR_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getToolLevelFromEntries(
  entries: ToolProficiencyEntry[],
  proficiency: TOOL_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getLanguageLevelFromEntries(
  entries: LanguageProficiencyEntry[],
  proficiency: LanguageProficiency
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function hasLockedSkillEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function hasLockedWeaponEntry(
  entries: WeaponProficiencyEntry[],
  proficiency: WEAPON_PROFICIENCY
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function hasNonManualSkillEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): boolean {
  return entries.some(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
  );
}

export function hasNonManualSavingThrowEntry(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY
): boolean {
  return entries.some(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
  );
}

export function upsertManualSkillEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): SkillProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createSkillEntry);
}

export function setManualWeaponEntry(
  entries: WeaponProficiencyEntry[],
  proficiency: WEAPON_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): WeaponProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createWeaponEntry);
}

export function setManualArmorEntry(
  entries: ArmorProficiencyEntry[],
  proficiency: ARMOR_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): ArmorProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createArmorEntry);
}

export function setManualToolEntry(
  entries: ToolProficiencyEntry[],
  proficiency: TOOL_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): ToolProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createToolEntry);
}

export function setManualSavingThrowEntry(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): SavingThrowProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createSavingThrowEntry);
}

export function setManualLanguageEntry(
  entries: LanguageProficiencyEntry[],
  proficiency: LanguageProficiency,
  proficiencyLevel: PROF_LEVEL
): LanguageProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createLanguageEntry);
}

export function addManualCustomLanguageEntry(
  entries: LanguageProficiencyEntry[],
  name: string,
  description?: string
): LanguageProficiencyEntry[] {
  const builtInMatch = languageEntries.find(
    (entry) => entry.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

  if (builtInMatch) {
    return setManualLanguageEntry(entries, builtInMatch.proficiency, PROF_LEVEL.PROFICIENT);
  }

  const proficiency = createCustomLanguageProficiency(name);

  if (!proficiency) {
    return mergeProficiencyEntries(entries);
  }

  const nextEntries = entries.filter(
    (entry) => !(entry.source === PROFICIENCY_SOURCE.MANUAL && entry.proficiency === proficiency)
  );

  return mergeProficiencyEntries([
    ...nextEntries,
    createLanguageEntry(
      proficiency,
      PROFICIENCY_SOURCE.MANUAL,
      undefined,
      PROF_LEVEL.PROFICIENT,
      PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE,
      description
    )
  ]);
}

export function toggleManualToolEntry(
  entries: ToolProficiencyEntry[],
  proficiency: TOOL_PROFICIENCY
): ToolProficiencyEntry[] {
  return setManualToolEntry(
    entries,
    proficiency,
    getToolLevelFromEntries(entries, proficiency) === PROF_LEVEL.NONE
      ? PROF_LEVEL.PROFICIENT
      : PROF_LEVEL.NONE
  );
}

export function toggleManualSavingThrowEntry(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY
): SavingThrowProficiencyEntry[] {
  return setManualSavingThrowEntry(
    entries,
    proficiency,
    getSavingThrowLevelFromEntries(entries, proficiency) === PROF_LEVEL.NONE
      ? PROF_LEVEL.PROFICIENT
      : PROF_LEVEL.NONE
  );
}

export function getDisplaySkillLevels(
  entries: SkillProficiencyEntry[]
): { proficient: SkillName[]; expert: SkillName[] } {
  const proficient: SkillName[] = [];
  const expert: SkillName[] = [];

  Object.values(SKILL_PROFICIENCY).forEach((skillProficiency) => {
    const skillLevel = getSkillLevelFromEntries(entries, skillProficiency);

    if (proficiencyLevelRank[skillLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]) {
      proficient.push(skillNameByProficiency[skillProficiency]);
    }

    if (skillLevel === PROF_LEVEL.EXPERT) {
      expert.push(skillNameByProficiency[skillProficiency]);
    }
  });

  return {
    proficient,
    expert
  };
}

export function getDisplaySkillProficiencyEntries(
  entries: SkillProficiencyEntry[]
): ProficiencyDisplayEntry<SKILL_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, skillProficiencyOptions);
}

export function getDisplaySavingThrowProficiencyEntries(
  entries: SavingThrowProficiencyEntry[]
): ProficiencyDisplayEntry<SAVING_THROW_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, savingThrowProficiencyOptions);
}

export function getDisplayWeaponProficiencyEntries(
  entries: WeaponProficiencyEntry[]
): ProficiencyDisplayEntry<WEAPON_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, weaponProficiencyOptions);
}

export function getDisplayArmorProficiencyEntries(
  entries: ArmorProficiencyEntry[]
): ProficiencyDisplayEntry<ARMOR_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, armorProficiencyOptions);
}

export function getDisplayToolProficiencyEntries(
  entries: ToolProficiencyEntry[]
): ProficiencyDisplayEntry<TOOL_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, toolProficiencyOptions);
}

export function getDisplayLanguageProficiencyEntries(
  entries: LanguageProficiencyEntry[]
): ProficiencyDisplayEntry<LanguageProficiency>[] {
  const customLanguageOptions = dedupe(
    mergeProficiencyEntries(entries)
      .filter(
        (entry) =>
          entry.proficiencyLevel !== PROF_LEVEL.NONE && isCustomLanguageProficiency(entry.proficiency)
      )
      .map((entry) => entry.proficiency)
  );

  return getDisplayProficiencyEntries(entries, [
    ...languageProficiencyOptions,
    ...customLanguageOptions
  ]);
}

export function normalizeEquipmentSelectionsForClass(
  className: string,
  selectedEquipment: string[]
): string[] {
  const allowedEquipmentSet = new Set<string>(getAvailableEquipmentNamesForClass(className));

  return dedupe(selectedEquipment).filter((item) => allowedEquipmentSet.has(item));
}

export function normalizeEquipmentSelections(selectedEquipment: string[]): string[] {
  const allowedEquipmentSet = new Set<string>(equipmentOptions);

  return dedupe(selectedEquipment).filter((item) => allowedEquipmentSet.has(item));
}

export function normalizeCharacterEquipmentSelectionsForClass(
  className: string,
  selectedEquipment: Array<string | CharacterEquipmentItem>
): CharacterEquipmentItem[] {
  const allowedEquipmentSet = new Set<string>(getAvailableEquipmentNamesForClass(className));

  return normalizeCharacterEquipmentItems(selectedEquipment)
    .filter((item) => allowedEquipmentSet.has(item.name))
    .map((item) => {
      const equipmentDefinition = getEquipmentByName(item.name);

      return createCharacterEquipmentItem(
        item.name,
        equipmentDefinition?.category === "weapon" ||
          (equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield")
          ? item.onHand || item.worn
          : false,
        equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield"
          ? item.worn
          : false
      );
    });
}

export function normalizeCharacterEquipmentSelections(
  selectedEquipment: Array<string | CharacterEquipmentItem>
): CharacterEquipmentItem[] {
  return normalizeCharacterEquipmentItems(selectedEquipment)
    .filter((item) => equipmentCatalogByName.has(item.name))
    .map((item) => {
      const equipmentDefinition = getEquipmentByName(item.name);

      return createCharacterEquipmentItem(
        item.name,
        equipmentDefinition?.category === "weapon" ||
          (equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield")
          ? item.onHand || item.worn
          : false,
        equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield"
          ? item.worn
          : false
      );
    });
}

export function normalizeSelectionsForClass(
  className: string,
  selectedSkills: string[],
  selectedEquipment: string[],
  species = "",
  background = ""
): Pick<CharacterDraft, "skills" | "equipment"> {
  return {
    skills: normalizeSkillSelectionsForClass(className, selectedSkills, species, background),
    equipment: normalizeEquipmentSelectionsForClass(
      className,
      getCharacterEquipmentNames(selectedEquipment)
    )
  };
}

export function resolveSkillProficienciesForCharacter(
  className: string,
  species: string,
  background: string,
  selectedSkills: string[]
): ResolvedSkillProficiencies {
  const granted = getGrantedSkillProficienciesForCharacter(className, species, background);
  const manual = normalizeSkillSelectionsForClass(className, selectedSkills, species, background);
  const all = dedupe([...granted.map((entry) => entry.skill), ...manual]).filter(
    (skill): skill is SkillName => skillOptionSet.has(skill)
  );

  return {
    granted,
    manual,
    all
  };
}
