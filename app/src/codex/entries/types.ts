import type {
  ACTION_TYPE,
  ABILITY_TYPES,
  ARMOR_TYPES,
  BACKGROUND_TYPES,
  CLASS_FEATURE,
  CURRENCY_TYPE,
  CLASS_TYPES,
  DAMAGE_TYPE,
  DICE,
  DICE_TYPES,
  DURATION,
  ELDRITCH_INVOCATION,
  REACTION,
  GENERAL_PROFICIENCIES,
  ITEM_TYPES,
  MAGIC_SCHOOL,
  MONSTER_TYPES,
  RARITY_TYPES,
  RULE_TYPES,
  SPECIES_TYPES,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS,
  TRACKER,
  WEAPON_BASE,
  TOOL_PROFICIENCIES,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING
} from "./enums";
import { ENTRY_CATEGORIES } from "./enums";
import type { ClassStarterPack } from "../classes/starterPack/type";
import type { SkillName } from "../../types/skills";

export type CodexCategory = ENTRY_CATEGORIES;

export const ENTRY_CATEGORY_VALUES: CodexCategory[] = Object.values(ENTRY_CATEGORIES);

type BaseCodexEntry<TCategory extends CodexCategory, TType extends string> = {
  id: string;
  name: string;
  category: TCategory;
  tags: TType[];
  summary: string;
};

type EntryWithRarity = {
  rarity: RARITY_TYPES;
};

export type WeaponDamageAmount = DICE | number;
export type WeaponDamageType = DAMAGE_TYPE | DAMAGE_TYPE[];
export type WeaponDamage = Array<[WeaponDamageAmount, WeaponDamageType]>;
export type SpellHealingAmount = WeaponDamageAmount | "spellcastingAbility";
export type SpellHealing = SpellHealingAmount[] | { label: string };
export type WeaponType = {
  combat: WEAPON_COMBAT_TYPE;
  training: WEAPON_TRAINING;
};
export type WeaponRange = {
  normal: number;
  long: number;
  ammunition?: string;
};
export type EquipmentCost = {
  amount: number;
  currency: CURRENCY_TYPE;
};
export type WeaponCost = EquipmentCost;
export type FeatureMapEntry = {
  description: string[];
  trackingState?: TRACKER;
};
export type KeywordTooltipEntry = {
  title: string;
  description: string[];
};
export type SpellDescriptionList = {
  type: "list";
  style: "bullet" | "number";
  items: string[];
};
export type SpellDescriptionEntry = string | SpellDescriptionList;
export type SpellCastingTimePart = ACTION_TYPE | string;
export type SpellDurationPart = DURATION | string;
export type DivinityValue = {
  amounts: WeaponDamageAmount[];
  damageTypes?: DAMAGE_TYPE[];
};
export type DivinityScalingEntry = {
  level: number;
  damage?: DivinityValue;
  healing?: DivinityValue;
};
export type EldritchInvocationPrerequisite =
  | {
      type: "warlock-level";
      minimumLevel: number;
    }
  | {
      type: "invocation";
      invocation: ELDRITCH_INVOCATION;
    };
export type EldritchInvocationSelection =
  | {
      kind: "warlock-cantrip";
      rule: "damaging" | "damaging-range-10" | "damaging-attack-roll";
    }
  | {
      kind: "origin-feat";
    };
export type FeatureClassObj = {
  level: number;
  classFeatures: CLASS_FEATURE[];
  cantrips?: number;
  preparedSpells?: number;
  spellSlots?: number[];
  featureOverrides?: Partial<Record<CLASS_FEATURE, FeatureMapEntry>>;
};
export type SubclassFeatureLevel = 3 | 6 | 7 | 9 | 10 | 11 | 13 | 14 | 15 | 17 | 18 | 20;
export type SubclassFeatureClassObj = Omit<FeatureClassObj, "level"> & {
  level: SubclassFeatureLevel;
};
export type SubclassEntry = {
  id: string;
  name: string;
  className: string;
  tagline?: string;
  summary: string;
  features: SubclassFeatureClassObj[];
  runtimeHookId?: string;
};

export type SpellEntry = {
  id: string;
  name: string;
  category: ENTRY_CATEGORIES.SPELLS;
  magicSchool: MAGIC_SCHOOL;
  castingTime: SpellCastingTimePart[];
  range: string;
  components: SPELL_COMPONENT[];
  duration: SpellDurationPart[];
  description: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  isHealingSpell?: boolean;
  isSavingThrowSpell?: boolean;
  savingThrowAbility?: ABILITY_TYPES | null;
  isAttackSpell?: boolean;
  isDamagingSpell?: boolean;
  damage: WeaponDamage;
  healing: SpellHealing;
  spellLists: SPELL_LIST_CLASS[];
  spellLevel: number;
  ritual?: boolean;
};
export type DivinityEntry = {
  id: string;
  name: string;
  sourceFeature: CLASS_FEATURE;
  castingTime: SpellCastingTimePart[];
  range: string;
  duration: string;
  description: SpellDescriptionEntry[];
  isHealingSpell?: boolean;
  damage?: DivinityValue;
  healing?: DivinityValue;
  scaling?: DivinityScalingEntry[];
};
export type ReactionEntry = {
  id: string;
  reaction: REACTION;
  name: string;
  sourceType: "feature" | "item";
  sourceFeature?: CLASS_FEATURE;
  sourceItemName?: string;
  sourceLabel: string;
  description: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
};
export type EldritchInvocationEntry = {
  id: ELDRITCH_INVOCATION;
  name: string;
  description: SpellDescriptionEntry[];
  prerequisites?: EldritchInvocationPrerequisite[];
  selection?: EldritchInvocationSelection;
  repeatable?: boolean;
};
export type WeaponEntry = Omit<BaseCodexEntry<ENTRY_CATEGORIES.WEAPONS, never>, "tags"> &
  EntryWithRarity & {
    baseWeapon?: WEAPON_BASE;
    type: WeaponType;
    damage: WeaponDamage;
    properties: WEAPON_PROPERTY[];
    mastery: WEAPON_MASTERY;
    weight: number | null;
    cost: EquipmentCost;
    range?: WeaponRange;
    versatileDamage?: WeaponDamage;
    propertyNotes?: Partial<Record<WEAPON_PROPERTY, string>>;
  };
export type ArmorEntry = BaseCodexEntry<ENTRY_CATEGORIES.ARMOR, ARMOR_TYPES> &
  EntryWithRarity & {
    armorBase: number;
    shieldBonus: number;
    weight: number | null;
    cost: EquipmentCost;
  };
export type ItemEntry = BaseCodexEntry<ENTRY_CATEGORIES.ITEMS, ITEM_TYPES> & {
  weight: number | null;
  cost: EquipmentCost;
};
export type BackgroundEntry = BaseCodexEntry<ENTRY_CATEGORIES.BACKGROUNDS, BACKGROUND_TYPES> & {
  grantedSkillProficiencies: SkillName[];
  grantedToolProficiencies: TOOL_PROFICIENCIES[];
};
export type SpeciesEntry = BaseCodexEntry<ENTRY_CATEGORIES.SPECIES, SPECIES_TYPES> & {
  speed: number;
  abilityBonuses: Partial<Record<ABILITY_TYPES, number>>;
  innateProficiencies: GENERAL_PROFICIENCIES[];
  grantedSkillProficiencies: SkillName[];
  grantedToolProficiencies: TOOL_PROFICIENCIES[];
};
export type ClassEntry = BaseCodexEntry<ENTRY_CATEGORIES.CLASSES, CLASS_TYPES> & {
  hitPointDie: DICE_TYPES;
  innateProficiencies: GENERAL_PROFICIENCIES[];
  features: FeatureClassObj[];
  starterPack?: ClassStarterPack | null;
};
export type RuleEntry = BaseCodexEntry<ENTRY_CATEGORIES.RULES, RULE_TYPES>;
export type MonsterEntry = BaseCodexEntry<ENTRY_CATEGORIES.MONSTERS, MONSTER_TYPES> &
  EntryWithRarity;

export type CodexEntry =
  | SpellEntry
  | WeaponEntry
  | ArmorEntry
  | ItemEntry
  | BackgroundEntry
  | SpeciesEntry
  | ClassEntry
  | RuleEntry
  | MonsterEntry;

export type CodexStatus = "loading" | "ready" | "error";
