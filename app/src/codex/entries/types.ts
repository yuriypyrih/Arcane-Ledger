import type {
  ABILITY_TYPES,
  ARMOR_TYPES,
  BACKGROUND_TYPES,
  ClassFeature,
  CURRENCY_TYPE,
  CLASS_TYPES,
  DAMAGE_TYPE,
  DAMAGE_TYPES,
  DICE,
  DICE_TYPES,
  GENERAL_PROFICIENCIES,
  ITEM_TYPES,
  MONSTER_TYPES,
  RARITY_TYPES,
  RULE_TYPES,
  SPECIES_TYPES,
  SPELL_TYPES,
  TOOL_PROFICIENCIES,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING
} from "./enums";
import { ENTRY_CATEGORIES } from "./enums";

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

type EntryWithDamage = {
  damage: DICE_TYPES[];
  damageType: DAMAGE_TYPES | null;
};

export type WeaponDamageAmount = DICE | number;
export type WeaponDamage = Array<[WeaponDamageAmount, DAMAGE_TYPE]>;
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
  isTracked: boolean;
};
export type KeywordTooltipEntry = {
  title: string;
  description: string[];
};
export type FeatureClassObj = {
  level: number;
  classFeatures: ClassFeature[];
  featureOverrides?: Partial<Record<ClassFeature, FeatureMapEntry>>;
};
export type SpellSlotProgression = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];
export type BarbarianFeatureClassObj = FeatureClassObj & {
  rages: number;
  rageDamage: number;
  weaponMastery: number;
};
export type BardFeatureClassObj = FeatureClassObj & {
  bardicDie: DICE;
  cantrips: number;
  preparedSpells: number;
  spellSlots: SpellSlotProgression;
};

export type SpellEntry = BaseCodexEntry<ENTRY_CATEGORIES.SPELLS, SPELL_TYPES> &
  EntryWithRarity &
  EntryWithDamage & {
    spellLevel?: number;
  };
export type WeaponEntry = Omit<BaseCodexEntry<ENTRY_CATEGORIES.WEAPONS, never>, "tags"> &
  EntryWithRarity & {
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
    maxDexModifier: number | null;
    shieldBonus: number;
    weight: number | null;
    cost: EquipmentCost;
  };
export type ItemEntry = BaseCodexEntry<ENTRY_CATEGORIES.ITEMS, ITEM_TYPES> & {
  weight: number | null;
  cost: EquipmentCost;
};
export type BackgroundEntry = BaseCodexEntry<ENTRY_CATEGORIES.BACKGROUNDS, BACKGROUND_TYPES> & {
  grantedSkillProficiencies: string[];
  grantedToolProficiencies: TOOL_PROFICIENCIES[];
};
export type SpeciesEntry = BaseCodexEntry<ENTRY_CATEGORIES.SPECIES, SPECIES_TYPES> & {
  speed: number;
  abilityBonuses: Partial<Record<ABILITY_TYPES, number>>;
  innateProficiencies: GENERAL_PROFICIENCIES[];
  grantedSkillProficiencies: string[];
  grantedToolProficiencies: TOOL_PROFICIENCIES[];
};
export type ClassEntry = BaseCodexEntry<ENTRY_CATEGORIES.CLASSES, CLASS_TYPES> & {
  primaryAbilityModifiers: ABILITY_TYPES[];
  hitPointDie: DICE_TYPES;
  savingThrowProficiencies: ABILITY_TYPES[];
  innateProficiencies: GENERAL_PROFICIENCIES[];
  grantedSkillProficiencies: string[];
  grantedToolProficiencies: TOOL_PROFICIENCIES[];
  features: FeatureClassObj[];
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
