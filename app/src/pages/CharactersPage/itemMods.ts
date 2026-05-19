import {
  CURRENCY_TYPE,
  DAMAGE_TYPE,
  DICE,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type EquipmentCost,
  type WeaponDamage,
  type WeaponDamageAmount,
  type WeaponRange
} from "../../codex/entries";
import type {
  AbilityKey,
  CharacterInventoryItem,
  CharacterItemArmorMods,
  CharacterItemModCategory,
  CharacterItemMods,
  CharacterItemWeaponMods,
  CharacterModEffect,
  CustomArmorType,
  ItemDetailReference,
  ItemDetailWeaponPropertyRecord,
  ItemRecord
} from "../../types";
import { formatCodexLabel, formatWeaponDamageFormula } from "../../utils/codex";
import { parseItemCost } from "../../utils/items/cost";
import { clampInteger, clampNumber } from "../../utils/numbers";
import { isObjectRecord, normalizeText } from "../../utils/normalize";
import { normalizeCharacterCustomTraitEffects } from "./customTraitEffects";

export type EffectiveItemRecord = ItemRecord & {
  itemModsBaseCategory?: CharacterItemModCategory;
  itemModsIsCustom?: boolean;
  itemModsWeapon?: CharacterItemWeaponMods;
  itemModsArmor?: CharacterItemArmorMods;
};

export type CharacterItemModEffectSource = {
  label: string;
  effects: CharacterModEffect[];
};

const currencyValues = new Set<CURRENCY_TYPE>(Object.values(CURRENCY_TYPE));
const damageTypeValues = new Set<DAMAGE_TYPE>(Object.values(DAMAGE_TYPE));
const diceValues = new Set<DICE>(Object.values(DICE));
const weaponBaseValues = new Set<WEAPON_BASE>(Object.values(WEAPON_BASE));
const weaponCombatValues = new Set<WEAPON_COMBAT_TYPE>(Object.values(WEAPON_COMBAT_TYPE));
const weaponMasteryValues = new Set<WEAPON_MASTERY>(Object.values(WEAPON_MASTERY));
const weaponPropertyValues = new Set<WEAPON_PROPERTY>(Object.values(WEAPON_PROPERTY));
const weaponTrainingValues = new Set<WEAPON_TRAINING>(Object.values(WEAPON_TRAINING));
const abilityKeyValues = new Set<AbilityKey>(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);
const armorTypeValues = new Set<CustomArmorType>(["light", "medium", "heavy", "shield"]);
const itemModCategoryValues = new Set<CharacterItemModCategory>(["weapon", "armor", "general"]);

const customDocument = {
  key: "custom",
  name: "Custom",
  display_name: "Custom"
};

const customRarity = {
  key: "custom",
  name: "Custom"
};

const defaultCost: EquipmentCost = {
  amount: 0,
  currency: CURRENCY_TYPE.GP
};

const defaultWeaponDamage: WeaponDamage = [[DICE.D6, [DAMAGE_TYPE.SLASHING]]];

function createReference(key: string, name: string): ItemDetailReference {
  return {
    key,
    name
  };
}

function normalizeWeight(value: unknown, fallback = 1): number | null {
  if (value === null) {
    return null;
  }

  return Math.round(clampNumber(value, 0, 999999, fallback) * 100) / 100;
}

function normalizeEquipmentCost(value: unknown, fallback: EquipmentCost = defaultCost): EquipmentCost {
  if (!isObjectRecord(value)) {
    return fallback;
  }

  const currency = currencyValues.has(value.currency as CURRENCY_TYPE)
    ? (value.currency as CURRENCY_TYPE)
    : fallback.currency;

  return {
    amount: clampInteger(value.amount, 0, 999999999, fallback.amount),
    currency
  };
}

function normalizeWeaponDamageAmount(value: unknown): WeaponDamageAmount | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
  }

  const normalizedValue = normalizeText(value).toUpperCase();

  if (diceValues.has(normalizedValue as DICE)) {
    return normalizedValue as DICE;
  }

  if (abilityKeyValues.has(normalizedValue as AbilityKey)) {
    return normalizedValue as AbilityKey;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : null;
}

function normalizeWeaponDamage(value: unknown, fallback: WeaponDamage): WeaponDamage {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const entries = value
    .map((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) {
        return null;
      }

      const amount = normalizeWeaponDamageAmount(entry[0]);
      const rawType = entry[1];
      const damageTypes = Array.isArray(rawType)
        ? rawType.filter(
            (damageType): damageType is DAMAGE_TYPE =>
              typeof damageType === "string" && damageTypeValues.has(damageType as DAMAGE_TYPE)
          )
        : damageTypeValues.has(rawType as DAMAGE_TYPE)
          ? [rawType as DAMAGE_TYPE]
          : [];

      return amount && damageTypes.length > 0 ? ([amount, damageTypes] as WeaponDamage[number]) : null;
    })
    .filter((entry): entry is WeaponDamage[number] => entry !== null);

  return entries.length > 0 ? entries : fallback;
}

function normalizeWeaponProperties(value: unknown): WEAPON_PROPERTY[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value)].filter(
    (property): property is WEAPON_PROPERTY =>
      typeof property === "string" && weaponPropertyValues.has(property as WEAPON_PROPERTY)
  );
}

function normalizeWeaponRange(value: unknown): WeaponRange | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const normal = clampInteger(value.normal, 1, 9999, 20);
  const long = clampInteger(value.long, normal, 9999, Math.max(normal, 60));
  const ammunition = normalizeText(value.ammunition);

  return {
    normal,
    long,
    ...(ammunition ? { ammunition } : {})
  };
}

function normalizeWeaponMods(value: unknown): CharacterItemWeaponMods | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const weapon: CharacterItemWeaponMods = {
    baseWeapon: weaponBaseValues.has(value.baseWeapon as WEAPON_BASE)
      ? (value.baseWeapon as WEAPON_BASE)
      : undefined,
    training: weaponTrainingValues.has(value.training as WEAPON_TRAINING)
      ? (value.training as WEAPON_TRAINING)
      : undefined,
    combat: weaponCombatValues.has(value.combat as WEAPON_COMBAT_TYPE)
      ? (value.combat as WEAPON_COMBAT_TYPE)
      : undefined,
    damage: normalizeWeaponDamage(value.damage, defaultWeaponDamage),
    properties: normalizeWeaponProperties(value.properties),
    mastery: weaponMasteryValues.has(value.mastery as WEAPON_MASTERY)
      ? (value.mastery as WEAPON_MASTERY)
      : undefined,
    range: normalizeWeaponRange(value.range),
    versatileDamage: Array.isArray(value.versatileDamage)
      ? normalizeWeaponDamage(value.versatileDamage, [])
      : undefined
  };

  return weapon;
}

function normalizeArmorMods(value: unknown): CharacterItemArmorMods | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const armorType = armorTypeValues.has(value.armorType as CustomArmorType)
    ? (value.armorType as CustomArmorType)
    : undefined;

  return {
    armorType,
    armorClass: clampInteger(value.armorClass, 0, 30, armorType === "shield" ? 2 : 11)
  };
}

export function normalizeCharacterItemMods(value: unknown): CharacterItemMods | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const baseCategory = itemModCategoryValues.has(value.baseCategory as CharacterItemModCategory)
    ? (value.baseCategory as CharacterItemModCategory)
    : null;

  if (!baseCategory) {
    return undefined;
  }

  const mods: CharacterItemMods = {
    baseCategory,
    isCustom: value.isCustom === true,
    isMagicItem: value.isMagicItem === true,
    requiresAttunement: value.requiresAttunement === true,
    name: normalizeText(value.name) || undefined,
    description: normalizeText(value.description),
    cost: normalizeEquipmentCost(value.cost),
    weight: normalizeWeight(value.weight, 1),
    effects: normalizeCharacterCustomTraitEffects(value.effects)
  };

  if (baseCategory === "weapon") {
    mods.weapon = normalizeWeaponMods(value.weapon) ?? {
      damage: defaultWeaponDamage,
      properties: []
    };
  }

  if (baseCategory === "armor") {
    mods.armor = normalizeArmorMods(value.armor) ?? {
      armorType: "light",
      armorClass: 11
    };
  }

  return mods;
}

export function hasCharacterItemMods(mods: CharacterItemMods | null | undefined): boolean {
  if (!mods) {
    return false;
  }

  return Boolean(
    mods.isCustom ||
      mods.isMagicItem ||
      mods.requiresAttunement ||
      mods.name ||
      mods.description ||
      mods.cost ||
      mods.weight !== undefined ||
      mods.weapon ||
      mods.armor ||
      (mods.effects?.length ?? 0) > 0
  );
}

export function inferItemModCategory(item: ItemRecord): CharacterItemModCategory {
  if (item.weapon) {
    return "weapon";
  }

  if (item.armor || item.category?.key === "shield") {
    return "armor";
  }

  return "general";
}

export function getItemModsCategory(
  stackOrItem: CharacterInventoryItem | ItemRecord | null | undefined
): CharacterItemModCategory {
  if (!stackOrItem) {
    return "general";
  }

  if ("item" in stackOrItem) {
    return stackOrItem.mods?.baseCategory ?? inferItemModCategory(stackOrItem.item);
  }

  return inferItemModCategory(stackOrItem);
}

function getCostFromItem(item: ItemRecord): EquipmentCost {
  return parseItemCost(item.cost) ?? defaultCost;
}

function formatCostAsItemCost(cost: EquipmentCost): string {
  const copperMultiplier: Record<CURRENCY_TYPE, number> = {
    [CURRENCY_TYPE.CP]: 1,
    [CURRENCY_TYPE.SP]: 10,
    [CURRENCY_TYPE.EP]: 50,
    [CURRENCY_TYPE.GP]: 100,
    [CURRENCY_TYPE.PP]: 1000
  };
  const goldValue = (cost.amount * copperMultiplier[cost.currency]) / 100;

  return Number.isInteger(goldValue)
    ? String(goldValue)
    : goldValue.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatWeightAsItemWeight(weight: number | null | undefined): string {
  if (weight === null || weight === undefined) {
    return "";
  }

  return Number.isInteger(weight)
    ? String(weight)
    : String(weight).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function getFirstDamageType(damage: WeaponDamage | undefined): DAMAGE_TYPE {
  const firstType = damage?.[0]?.[1];

  if (Array.isArray(firstType)) {
    return firstType[0] ?? DAMAGE_TYPE.SLASHING;
  }

  return firstType ?? DAMAGE_TYPE.SLASHING;
}

function createWeaponPropertyRecord(
  property: WEAPON_PROPERTY,
  detail: string | null = null
): ItemDetailWeaponPropertyRecord {
  return {
    detail,
    property: {
      name: formatCodexLabel(property),
      type: null
    }
  };
}

function createWeaponMasteryRecord(mastery: WEAPON_MASTERY): ItemDetailWeaponPropertyRecord {
  return {
    detail: null,
    property: {
      name: formatCodexLabel(mastery),
      type: "Mastery"
    }
  };
}

function getWeaponPropertyDetail(property: WEAPON_PROPERTY, weapon: CharacterItemWeaponMods): string | null {
  if (property === WEAPON_PROPERTY.RANGE && weapon.range) {
    return `${weapon.range.normal}/${weapon.range.long}`;
  }

  if (property === WEAPON_PROPERTY.AMMUNITION && weapon.range?.ammunition) {
    return weapon.range.ammunition;
  }

  if (property === WEAPON_PROPERTY.VERSATILE && weapon.versatileDamage?.length) {
    return formatWeaponDamageFormula(weapon.versatileDamage);
  }

  return null;
}

function createWeaponRecord(item: ItemRecord, weapon: CharacterItemWeaponMods) {
  const damage = weapon.damage?.length ? weapon.damage : defaultWeaponDamage;
  const damageType = getFirstDamageType(damage);
  const properties = weapon.properties ?? [];

  return {
    name: item.name ?? "Weapon",
    damage_dice: formatWeaponDamageFormula(damage),
    damage_type: createReference(String(damageType).toLowerCase(), formatCodexLabel(damageType)),
    is_martial: weapon.training === WEAPON_TRAINING.MARTIAL,
    properties: [
      ...properties.map((property) =>
        createWeaponPropertyRecord(property, getWeaponPropertyDetail(property, weapon))
      ),
      ...(weapon.mastery ? [createWeaponMasteryRecord(weapon.mastery)] : [])
    ]
  };
}

function createArmorRecord(armor: CharacterItemArmorMods) {
  const armorType = armor.armorType ?? "light";
  const armorClass = clampInteger(armor.armorClass, 0, 30, armorType === "shield" ? 2 : 11);

  return {
    category: armorType === "shield" ? "Shield" : formatCodexLabel(armorType),
    ac_base: armorType === "shield" ? 0 : armorClass,
    ac_display: armorType === "shield" ? `+${armorClass}` : String(armorClass),
    ac_add_dexmod: armorType === "light" || armorType === "medium",
    ac_cap_dexmod: armorType === "medium" ? 2 : armorType === "heavy" ? 0 : null,
    grants_stealth_disadvantage: false,
    strength_score_required: null
  };
}

function getCategoryReference(category: CharacterItemModCategory, armor?: CharacterItemArmorMods | null) {
  if (category === "weapon") {
    return createReference("weapon", "Weapon");
  }

  if (category === "armor") {
    const armorType = armor?.armorType ?? "light";
    return armorType === "shield"
      ? createReference("shield", "Shield")
      : createReference("armor", "Armor");
  }

  return createReference("adventuring-gear", "Adventuring Gear");
}

export function createCustomItemRecordFromMods(id: string, mods: CharacterItemMods): ItemRecord {
  const baseCategory = mods.baseCategory;
  const name = mods.name?.trim() || "Custom Item";
  const description = mods.description?.trim() || "";
  const weight = mods.weight === undefined ? 1 : mods.weight;
  const cost = mods.cost ?? defaultCost;
  const weapon = baseCategory === "weapon"
    ? (mods.weapon ?? { damage: defaultWeaponDamage, properties: [] })
    : undefined;
  const armor = baseCategory === "armor"
    ? (mods.armor ?? { armorType: "light" as const, armorClass: 11 })
    : undefined;

  const item: ItemRecord = {
    id,
    key: id,
    name,
    desc: description,
    category: getCategoryReference(baseCategory, armor),
    rarity: customRarity,
    is_magic_item: mods.isMagicItem === true,
    weapon: null,
    armor: null,
    weight: formatWeightAsItemWeight(weight),
    weight_unit: "lb.",
    cost: formatCostAsItemCost(cost),
    requires_attunement: mods.requiresAttunement === true,
    attunement_detail: null,
    document: customDocument
  };

  if (weapon) {
    item.weapon = createWeaponRecord(item, weapon);
  }

  if (armor) {
    item.armor = createArmorRecord(armor);
  }

  return item;
}

export function getEffectiveInventoryItemRecord(stack: CharacterInventoryItem): EffectiveItemRecord {
  const mods = stack.mods;

  if (!mods) {
    return stack.item as EffectiveItemRecord;
  }

  const baseCategory = mods.baseCategory;
  const item: EffectiveItemRecord = {
    ...stack.item,
    name: mods.name ?? stack.item.name,
    desc: mods.description ?? stack.item.desc,
    cost: mods.cost ? formatCostAsItemCost(mods.cost) : stack.item.cost,
    weight: mods.weight !== undefined ? formatWeightAsItemWeight(mods.weight) : stack.item.weight,
    weight_unit: stack.item.weight_unit ?? "lb.",
    category: getCategoryReference(baseCategory, mods.armor),
    is_magic_item: mods.isMagicItem ?? stack.item.is_magic_item,
    requires_attunement: mods.requiresAttunement ?? stack.item.requires_attunement,
    itemModsBaseCategory: baseCategory,
    itemModsIsCustom: mods.isCustom,
    itemModsWeapon: mods.weapon,
    itemModsArmor: mods.armor
  };

  if (baseCategory === "weapon" && mods.weapon) {
    item.weapon = createWeaponRecord(item, mods.weapon);
    item.armor = null;
  }

  if (baseCategory === "armor" && mods.armor) {
    item.armor = createArmorRecord(mods.armor);
    item.weapon = null;
  }

  if (baseCategory === "general") {
    item.weapon = null;
    item.armor = null;
  }

  return item;
}

export function getItemShieldBonus(item: ItemRecord): number {
  const armor = (item as EffectiveItemRecord).itemModsArmor;

  if ((item as EffectiveItemRecord).itemModsBaseCategory === "armor" && armor?.armorType === "shield") {
    return clampInteger(armor.armorClass, 0, 30, 2);
  }

  return 2;
}

export function getItemBaseCost(item: ItemRecord): EquipmentCost {
  return getCostFromItem(item);
}

function getStackQuantity(stack: CharacterInventoryItem): number {
  const quantity = Number(stack.quantity);
  return Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
}

function getStackOnHandQuantity(stack: CharacterInventoryItem): number {
  const quantity = getStackQuantity(stack);
  const onHandQuantity = Number(stack.onHandQuantity);
  const normalizedOnHandQuantity = Number.isFinite(onHandQuantity)
    ? Math.max(0, Math.floor(onHandQuantity))
    : 0;

  return Math.min(quantity, normalizedOnHandQuantity);
}

function areItemModEffectsActive(stack: CharacterInventoryItem): boolean {
  const mods = stack.mods;

  if (!mods || getStackQuantity(stack) <= 0) {
    return false;
  }

  if (mods.baseCategory === "weapon") {
    return getStackOnHandQuantity(stack) > 0;
  }

  if (mods.baseCategory === "armor") {
    return mods.armor?.armorType === "shield" ? getStackOnHandQuantity(stack) > 0 : stack.worn;
  }

  return true;
}

export function getActiveItemModEffectSources(
  inventoryItems: CharacterInventoryItem[] | undefined
): CharacterItemModEffectSource[] {
  return (inventoryItems ?? []).flatMap((stack) => {
    const effects = normalizeCharacterCustomTraitEffects(stack.mods?.effects);

    if (effects.length === 0 || !areItemModEffectsActive(stack)) {
      return [];
    }

    const item = getEffectiveInventoryItemRecord(stack);

    return [
      {
        label: item.name?.trim() || stack.item.name?.trim() || "Item MODS",
        effects
      }
    ];
  });
}
