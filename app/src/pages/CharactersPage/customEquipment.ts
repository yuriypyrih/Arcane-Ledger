import {
  ARMOR_TYPES,
  CURRENCY_TYPE,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  ITEM_TYPES,
  RARITY_TYPES,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type ArmorEntry,
  type EquipmentCost,
  type ItemEntry,
  type WeaponDamage,
  type WeaponDamageAmount,
  type WeaponEntry,
  type WeaponRange
} from "../../codex/entries";
import type {
  CharacterCustomArmor,
  CharacterCustomEquipment,
  CharacterCustomItem,
  CharacterCustomWeapon,
  CustomArmorType
} from "../../types";

export type ResolvedCustomWeaponEntry = WeaponEntry & {
  source: "custom";
  customEquipmentId: string;
  onHand: boolean;
};

export type ResolvedCustomArmorEntry = ArmorEntry & {
  source: "custom";
  customEquipmentId: string;
  rarity: RARITY_TYPES.CUSTOM;
  worn: boolean;
};

export type ResolvedCustomItemEntry = ItemEntry & {
  source: "custom";
  customEquipmentId: string;
  rarity: RARITY_TYPES.CUSTOM;
};

export type ResolvedCustomLoadoutEntry =
  | ResolvedCustomWeaponEntry
  | ResolvedCustomArmorEntry
  | ResolvedCustomItemEntry;

const currencyTypeValues = new Set<CURRENCY_TYPE>(Object.values(CURRENCY_TYPE));
const damageTypeValues = new Set<DAMAGE_TYPE>(Object.values(DAMAGE_TYPE));
const weaponTrainingValues = new Set<WEAPON_TRAINING>(Object.values(WEAPON_TRAINING));
const weaponCombatValues = new Set<WEAPON_COMBAT_TYPE>(Object.values(WEAPON_COMBAT_TYPE));
const weaponMasteryValues = new Set<WEAPON_MASTERY>(Object.values(WEAPON_MASTERY));
const weaponPropertyValues = new Set<WEAPON_PROPERTY>(Object.values(WEAPON_PROPERTY));
const diceValues = new Set<DICE>(Object.values(DICE));
const armorTypeValues = new Set<CustomArmorType>(["light", "medium", "heavy", "shield"]);

const defaultEquipmentCost: EquipmentCost = {
  amount: 0,
  currency: CURRENCY_TYPE.GP
};

const defaultWeaponDamage: WeaponDamage = [[DICE.D6, DAMAGE_TYPE.SLASHING]];

const armorTagsByType: Record<CustomArmorType, ArmorEntry["tags"]> = {
  light: [ARMOR_TYPES.LIGHT_ARMOR],
  medium: [ARMOR_TYPES.MEDIUM_ARMOR],
  heavy: [ARMOR_TYPES.HEAVY_ARMOR],
  shield: [ARMOR_TYPES.SHIELD]
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsedValue));
}

function normalizeWeight(value: unknown, fallback = 1): number | null {
  if (value === null) {
    return null;
  }

  const normalizedValue = clampNumber(value, 0, 999999, fallback);
  return Math.round(normalizedValue * 100) / 100;
}

function normalizeEquipmentCost(value: unknown, fallback: EquipmentCost): EquipmentCost {
  if (!isObjectRecord(value)) {
    return fallback;
  }

  const currency = currencyTypeValues.has(value.currency as CURRENCY_TYPE)
    ? (value.currency as CURRENCY_TYPE)
    : fallback.currency;

  return {
    amount: Math.floor(clampNumber(value.amount, 0, 999999999, fallback.amount)),
    currency
  };
}

function normalizeWeaponDamageAmount(value: unknown): WeaponDamageAmount | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return Math.floor(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  if (diceValues.has(normalizedValue as DICE)) {
    return normalizedValue as DICE;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return Math.floor(parsedValue);
}

function normalizeWeaponDamage(value: unknown, fallback: WeaponDamage): WeaponDamage {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalizedDamage = value
    .map((damageEntry) => {
      if (!Array.isArray(damageEntry) || damageEntry.length < 2) {
        return null;
      }

      const amount = normalizeWeaponDamageAmount(damageEntry[0]);
      const damageType = damageTypeValues.has(damageEntry[1] as DAMAGE_TYPE)
        ? (damageEntry[1] as DAMAGE_TYPE)
        : null;

      if (!amount || !damageType) {
        return null;
      }

      return [amount, damageType] as [WeaponDamageAmount, DAMAGE_TYPE];
    })
    .filter((damageEntry): damageEntry is [WeaponDamageAmount, DAMAGE_TYPE] => damageEntry !== null);

  return normalizedDamage.length > 0 ? normalizedDamage : fallback;
}

function normalizeWeaponRange(value: unknown): WeaponRange | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const normal = Math.floor(clampNumber(value.normal, 1, 9999, 0));
  const long = Math.floor(clampNumber(value.long, normal || 1, 9999, normal || 1));

  if (normal <= 0 || long <= 0) {
    return undefined;
  }

  const ammunition = normalizeText(value.ammunition);

  return ammunition
    ? {
        normal,
        long,
        ammunition
      }
    : {
        normal,
        long
      };
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

function normalizePropertyNotes(
  value: unknown
): CharacterCustomWeapon["propertyNotes"] | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const normalizedNotes: Partial<Record<WEAPON_PROPERTY, string>> = {};

  Object.entries(value).forEach(([property, note]) => {
    if (!weaponPropertyValues.has(property as WEAPON_PROPERTY)) {
      return;
    }

    const normalizedNote = normalizeText(note);

    if (!normalizedNote) {
      return;
    }

    normalizedNotes[property as WEAPON_PROPERTY] = normalizedNote;
  });

  return Object.keys(normalizedNotes).length > 0 ? normalizedNotes : undefined;
}

function normalizeCustomWeapon(
  value: Record<string, unknown>,
  fallbackId: string
): CharacterCustomWeapon | null {
  const name = normalizeText(value.name);

  if (!name) {
    return null;
  }

  const typeRecord = isObjectRecord(value.type) ? value.type : null;
  const training = typeRecord && weaponTrainingValues.has(typeRecord.training as WEAPON_TRAINING)
    ? (typeRecord.training as WEAPON_TRAINING)
    : WEAPON_TRAINING.SIMPLE;
  const combat = typeRecord && weaponCombatValues.has(typeRecord.combat as WEAPON_COMBAT_TYPE)
    ? (typeRecord.combat as WEAPON_COMBAT_TYPE)
    : WEAPON_COMBAT_TYPE.MELEE;
  const mastery = weaponMasteryValues.has(value.mastery as WEAPON_MASTERY)
    ? (value.mastery as WEAPON_MASTERY)
    : WEAPON_MASTERY.SAP;

  return {
    id: normalizeText(value.id, fallbackId),
    kind: "weapon",
    onHand: Boolean(value.onHand),
    name,
    description: normalizeText(value.description),
    type: {
      training,
      combat
    },
    damage: normalizeWeaponDamage(value.damage, defaultWeaponDamage),
    properties: normalizeWeaponProperties(value.properties),
    mastery,
    cost: normalizeEquipmentCost(value.cost, defaultEquipmentCost),
    weight: normalizeWeight(value.weight, 1),
    range: normalizeWeaponRange(value.range),
    versatileDamage: Array.isArray(value.versatileDamage)
      ? normalizeWeaponDamage(value.versatileDamage, [])
      : undefined,
    propertyNotes: normalizePropertyNotes(value.propertyNotes)
  };
}

function normalizeCustomArmor(
  value: Record<string, unknown>,
  fallbackId: string
): CharacterCustomArmor | null {
  const name = normalizeText(value.name);

  if (!name) {
    return null;
  }

  const armorType = armorTypeValues.has(value.armorType as CustomArmorType)
    ? (value.armorType as CustomArmorType)
    : "light";
  const maxDexModifier =
    value.maxDexModifier === null
      ? null
      : Math.floor(clampNumber(value.maxDexModifier, 0, 20, armorType === "heavy" ? 0 : 2));

  return {
    id: normalizeText(value.id, fallbackId),
    kind: "armor",
    worn: Boolean(value.worn),
    name,
    description: normalizeText(value.description),
    armorType,
    armorBase: Math.floor(
      clampNumber(value.armorBase, armorType === "shield" ? 0 : 1, 30, armorType === "shield" ? 0 : 11)
    ),
    maxDexModifier,
    shieldBonus: Math.floor(clampNumber(value.shieldBonus, 0, 10, armorType === "shield" ? 2 : 0)),
    cost: normalizeEquipmentCost(value.cost, defaultEquipmentCost),
    weight: normalizeWeight(value.weight, 1)
  };
}

function normalizeCustomItem(
  value: Record<string, unknown>,
  fallbackId: string
): CharacterCustomItem | null {
  const name = normalizeText(value.name);

  if (!name) {
    return null;
  }

  return {
    id: normalizeText(value.id, fallbackId),
    kind: "item",
    name,
    description: normalizeText(value.description),
    cost: normalizeEquipmentCost(value.cost, defaultEquipmentCost),
    weight: normalizeWeight(value.weight, 1)
  };
}

function normalizeCustomEquipmentEntry(
  value: unknown,
  index: number
): CharacterCustomEquipment | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const kind = normalizeText(value.kind);
  const fallbackId = `custom-${index}-${Date.now().toString(36)}`;

  if (kind === "weapon") {
    return normalizeCustomWeapon(value, fallbackId);
  }

  if (kind === "armor") {
    return normalizeCustomArmor(value, fallbackId);
  }

  if (kind === "item") {
    return normalizeCustomItem(value, fallbackId);
  }

  return null;
}

export function createCustomEquipmentId(): string {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeCustomEquipmentEntries(value: unknown): CharacterCustomEquipment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value
    .map((customEquipment, index) => normalizeCustomEquipmentEntry(customEquipment, index))
    .filter((customEquipment): customEquipment is CharacterCustomEquipment => {
      if (!customEquipment || seenIds.has(customEquipment.id)) {
        return false;
      }

      seenIds.add(customEquipment.id);
      return true;
    });
}

export function findCustomEquipmentById(
  customEquipment: CharacterCustomEquipment[],
  customEquipmentId: string
): CharacterCustomEquipment | undefined {
  return customEquipment.find((entry) => entry.id === customEquipmentId);
}

export function isResolvedCustomLoadoutEntry(
  entry: unknown
): entry is ResolvedCustomLoadoutEntry {
  return isObjectRecord(entry) && entry.source === "custom";
}

export function resolveCustomEquipmentToLoadoutEntry(
  customEquipment: CharacterCustomEquipment
): ResolvedCustomLoadoutEntry {
  const summary =
    customEquipment.description.trim() ||
    (customEquipment.kind === "weapon"
      ? "Custom weapon."
      : customEquipment.kind === "armor"
        ? "Custom armor."
        : "Custom item.");

  if (customEquipment.kind === "weapon") {
    return {
      id: `custom-weapon-${customEquipment.id}`,
      name: customEquipment.name,
      category: ENTRY_CATEGORIES.WEAPONS,
      summary,
      rarity: RARITY_TYPES.CUSTOM,
      type: customEquipment.type,
      damage: customEquipment.damage,
      properties: customEquipment.properties,
      mastery: customEquipment.mastery,
      weight: customEquipment.weight,
      cost: customEquipment.cost,
      range: customEquipment.range,
      versatileDamage: customEquipment.versatileDamage,
      propertyNotes: customEquipment.propertyNotes,
      onHand: customEquipment.onHand,
      source: "custom",
      customEquipmentId: customEquipment.id
    };
  }

  if (customEquipment.kind === "armor") {
    return {
      id: `custom-armor-${customEquipment.id}`,
      name: customEquipment.name,
      category: ENTRY_CATEGORIES.ARMOR,
      tags: armorTagsByType[customEquipment.armorType],
      summary,
      rarity: RARITY_TYPES.CUSTOM,
      worn: customEquipment.worn,
      armorBase: customEquipment.armorBase,
      shieldBonus: customEquipment.shieldBonus,
      weight: customEquipment.weight,
      cost: customEquipment.cost,
      source: "custom",
      customEquipmentId: customEquipment.id
    };
  }

  return {
    id: `custom-item-${customEquipment.id}`,
    name: customEquipment.name,
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    summary,
    rarity: RARITY_TYPES.CUSTOM,
    weight: customEquipment.weight,
    cost: customEquipment.cost,
    source: "custom",
    customEquipmentId: customEquipment.id
  };
}

export function getResolvedCustomLoadoutEntries(
  customEquipment: CharacterCustomEquipment[]
): ResolvedCustomLoadoutEntry[] {
  return customEquipment.map((entry) => resolveCustomEquipmentToLoadoutEntry(entry));
}
