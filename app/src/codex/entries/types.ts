import type {
  ABILITY_TYPES,
  ARMOR_TYPES,
  BACKGROUND_TYPES,
  CLASS_TYPES,
  DAMAGE_TYPES,
  DICE_TYPES,
  GENERAL_PROFICIENCIES,
  ITEM_TYPES,
  MONSTER_TYPES,
  RARITY_TYPES,
  RULE_TYPES,
  SPECIES_TYPES,
  SPELL_TYPES,
  TOOL_PROFICIENCIES,
  WEAPON_TYPES
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

export type SpellEntry = BaseCodexEntry<ENTRY_CATEGORIES.SPELLS, SPELL_TYPES> &
  EntryWithRarity &
  EntryWithDamage & {
    spellLevel?: number;
  };
export type WeaponEntry = BaseCodexEntry<ENTRY_CATEGORIES.WEAPONS, WEAPON_TYPES> &
  EntryWithRarity &
  EntryWithDamage;
export type ArmorEntry = BaseCodexEntry<ENTRY_CATEGORIES.ARMOR, ARMOR_TYPES> &
  EntryWithRarity & {
    armorBase: number;
    maxDexModifier: number | null;
    shieldBonus: number;
  };
export type ItemEntry = BaseCodexEntry<ENTRY_CATEGORIES.ITEMS, ITEM_TYPES>;
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
};
export type RuleEntry = BaseCodexEntry<ENTRY_CATEGORIES.RULES, RULE_TYPES>;
export type MonsterEntry = BaseCodexEntry<ENTRY_CATEGORIES.MONSTERS, MONSTER_TYPES> & EntryWithRarity;

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
