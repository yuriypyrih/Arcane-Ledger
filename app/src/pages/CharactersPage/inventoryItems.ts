import {
  CURRENCY_TYPE,
  DAMAGE_TYPE,
  DICE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type EquipmentCost,
  type WeaponDamage,
  type WeaponType
} from "../../codex/entries";
import type { CharacterInventoryItem, CurrencyKey, ItemRecord } from "../../types";
import { parseItemCost } from "../../utils/items/cost";
import type { HeldWeaponDescriptor } from "./inventory";

export type GroupedInventoryItem = {
  key: string;
  name: string;
  item: ItemRecord;
  copies: CharacterInventoryItem[];
  count: number;
  onHand: boolean;
  worn: boolean;
};

type InventoryTransactionCost = EquipmentCost & {
  currencyKey: CurrencyKey;
};

const damageTypeByKey: Partial<Record<string, DAMAGE_TYPE>> = {
  acid: DAMAGE_TYPE.ACID,
  bludgeoning: DAMAGE_TYPE.BLUDGEONING,
  cold: DAMAGE_TYPE.COLD,
  fire: DAMAGE_TYPE.FIRE,
  force: DAMAGE_TYPE.FORCE,
  lightning: DAMAGE_TYPE.LIGHTNING,
  necrotic: DAMAGE_TYPE.NECROTIC,
  piercing: DAMAGE_TYPE.PIERCING,
  poison: DAMAGE_TYPE.POISON,
  psychic: DAMAGE_TYPE.PSYCHIC,
  radiant: DAMAGE_TYPE.RADIANT,
  slashing: DAMAGE_TYPE.SLASHING,
  thunder: DAMAGE_TYPE.THUNDER
};

const weaponPropertyByName: Partial<Record<string, WEAPON_PROPERTY>> = {
  Ammunition: WEAPON_PROPERTY.AMMUNITION,
  Finesse: WEAPON_PROPERTY.FINESSE,
  Heavy: WEAPON_PROPERTY.HEAVY,
  Light: WEAPON_PROPERTY.LIGHT,
  Loading: WEAPON_PROPERTY.LOADING,
  Range: WEAPON_PROPERTY.RANGE,
  Reach: WEAPON_PROPERTY.REACH,
  Thrown: WEAPON_PROPERTY.THROWN,
  "Two-Handed": WEAPON_PROPERTY.TWO_HANDED,
  Versatile: WEAPON_PROPERTY.VERSATILE
};

const diceBySides: Record<string, DICE> = {
  "4": DICE.D4,
  "6": DICE.D6,
  "8": DICE.D8,
  "10": DICE.D10,
  "12": DICE.D12,
  "20": DICE.D20
};

const currencyKeyByType: Record<CURRENCY_TYPE, CurrencyKey> = {
  [CURRENCY_TYPE.CP]: "copper",
  [CURRENCY_TYPE.SP]: "silver",
  [CURRENCY_TYPE.EP]: "electrum",
  [CURRENCY_TYPE.GP]: "gold",
  [CURRENCY_TYPE.PP]: "platinum"
};

const rangedWeaponNames = new Set([
  "Blowgun",
  "Dart",
  "Hand Crossbow",
  "Heavy Crossbow",
  "Light Crossbow",
  "Longbow",
  "Musket",
  "Pistol",
  "Shortbow",
  "Sling"
]);

function createInventoryItemId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `inventory-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeItemRecord(value: unknown): ItemRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as ItemRecord;
  const key = typeof record.key === "string" ? record.key.trim() : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";

  if (!key || !name) {
    return null;
  }

  return {
    ...record,
    key,
    name
  };
}

function getItemCopyRemovalRank(item: CharacterInventoryItem): number {
  if (!item.onHand && !item.worn) {
    return 0;
  }

  if (item.onHand || item.worn) {
    return 1;
  }

  return 2;
}

export function createCharacterInventoryItem(
  item: ItemRecord,
  options?: {
    id?: string;
    onHand?: boolean;
    worn?: boolean;
  }
): CharacterInventoryItem {
  return {
    id: options?.id?.trim() || createInventoryItemId(),
    item,
    onHand: Boolean(options?.onHand),
    worn: Boolean(options?.worn)
  };
}

export function isCharacterInventoryItem(value: unknown): value is CharacterInventoryItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<CharacterInventoryItem>;
  return typeof record.id === "string" && normalizeItemRecord(record.item) !== null;
}

export function normalizeCharacterInventoryItems(value: unknown): CharacterInventoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<CharacterInventoryItem[]>((items, entry) => {
    if (!entry || typeof entry !== "object") {
      return items;
    }

    const record = entry as Partial<CharacterInventoryItem>;
    const item = normalizeItemRecord(record.item);

    if (!item) {
      return items;
    }

    return [
      ...items,
      createCharacterInventoryItem(item, {
        id: typeof record.id === "string" ? record.id : undefined,
        onHand: normalizeBoolean(record.onHand),
        worn: normalizeBoolean(record.worn)
      })
    ];
  }, []);
}

export function getItemRecordKey(item: ItemRecord | null | undefined): string {
  return typeof item?.key === "string" ? item.key : "";
}

export function getItemRecordName(item: ItemRecord | null | undefined): string {
  return typeof item?.name === "string" ? item.name : "Unknown Item";
}

export function findOwnedInventoryItemRecord(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): ItemRecord | null {
  return inventoryItems.find((entry) => getItemRecordKey(entry.item) === itemKey)?.item ?? null;
}

export function getInventoryItemCountsByKey(
  inventoryItems: CharacterInventoryItem[]
): Record<string, number> {
  return inventoryItems.reduce<Record<string, number>>((counts, entry) => {
    const key = getItemRecordKey(entry.item);

    if (!key) {
      return counts;
    }

    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

export function groupCharacterInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): GroupedInventoryItem[] {
  const grouped = new Map<string, CharacterInventoryItem[]>();

  inventoryItems.forEach((entry) => {
    const key = getItemRecordKey(entry.item);

    if (!key) {
      return;
    }

    const existingEntries = grouped.get(key) ?? [];
    existingEntries.push(entry);
    grouped.set(key, existingEntries);
  });

  return [...grouped.entries()]
    .map(([key, copies]) => ({
      key,
      name: getItemRecordName(copies[0]?.item),
      item: copies[0]!.item,
      copies,
      count: copies.length,
      onHand: copies.some((copy) => copy.onHand),
      worn: copies.some((copy) => copy.worn)
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function isItemShieldRecord(item: ItemRecord): boolean {
  return item.category?.key === "shield";
}

export function isItemBodyArmorRecord(item: ItemRecord): boolean {
  return Boolean(item.armor) && !isItemShieldRecord(item);
}

export function isItemStaffRecord(item: ItemRecord): boolean {
  return item.category?.key === "staff";
}

export function isItemSpellcastingFocusRecord(item: ItemRecord): boolean {
  return item.category?.key === "spellcasting-focus";
}

export function isItemEquipmentPackRecord(item: ItemRecord): boolean {
  return item.category?.key === "equipment-pack";
}

export function isExtractableEquipmentPackRecord(item: ItemRecord): boolean {
  return (
    isItemEquipmentPackRecord(item) &&
    typeof item.desc === "string" &&
    /contains the following items:/i.test(item.desc)
  );
}

export function isItemHandEquippableRecord(item: ItemRecord): boolean {
  return Boolean(
    item.weapon ||
      isItemShieldRecord(item) ||
      isItemStaffRecord(item) ||
      isItemSpellcastingFocusRecord(item)
  );
}

export function getItemWeightValue(item: Pick<ItemRecord, "weight">): number | null {
  if (typeof item.weight !== "string" || item.weight.trim().length === 0) {
    return null;
  }

  const numericWeight = Number(item.weight);
  return Number.isFinite(numericWeight) ? numericWeight : null;
}

export function getItemArmorType(item: ItemRecord): "light" | "medium" | "heavy" | null {
  const armorCategory = item.armor?.category?.toLowerCase() ?? "";

  if (armorCategory.includes("light")) {
    return "light";
  }

  if (armorCategory.includes("medium")) {
    return "medium";
  }

  if (armorCategory.includes("heavy")) {
    return "heavy";
  }

  return null;
}

export function getItemWeaponProperties(item: ItemRecord): WEAPON_PROPERTY[] {
  if (!item.weapon) {
    return [];
  }

  return item.weapon.properties
    .map((entry) => weaponPropertyByName[entry.property.name])
    .filter((value): value is WEAPON_PROPERTY => value !== undefined);
}

export function inferItemWeaponCombatType(item: ItemRecord): WEAPON_COMBAT_TYPE | null {
  const weapon = item.weapon;

  if (!weapon) {
    return null;
  }

  const propertyNames = weapon.properties.map((entry) => entry.property.name);

  if (propertyNames.includes("Ammunition") || rangedWeaponNames.has(weapon.name)) {
    return WEAPON_COMBAT_TYPE.RANGED;
  }

  return WEAPON_COMBAT_TYPE.MELEE;
}

export function getItemWeaponType(item: ItemRecord): WeaponType | null {
  if (!item.weapon) {
    return null;
  }

  return {
    training: item.weapon.is_martial ? WEAPON_TRAINING.MARTIAL : WEAPON_TRAINING.SIMPLE,
    combat: inferItemWeaponCombatType(item) ?? WEAPON_COMBAT_TYPE.MELEE
  };
}

export function getItemWeaponDamage(item: ItemRecord): WeaponDamage | null {
  const damageDice = item.weapon?.damage_dice?.trim();
  const damageTypeKey = item.weapon?.damage_type?.key;
  const match = damageDice?.match(/^(\d+)d(4|6|8|10|12|20)$/i);

  if (!match || !damageTypeKey) {
    return null;
  }

  const count = Number(match[1]);
  const die = diceBySides[match[2]];
  const damageType = damageTypeByKey[damageTypeKey];

  if (!count || !die || !damageType) {
    return null;
  }

  return Array.from({ length: count }, () => [die, damageType] as WeaponDamage[number]);
}

export function createHeldDescriptorForInventoryItem(
  key: string,
  item: ItemRecord
): HeldWeaponDescriptor | null {
  if (item.weapon) {
    const properties = getItemWeaponProperties(item);
    return {
      key,
      properties,
      handSlots: properties.includes(WEAPON_PROPERTY.TWO_HANDED) ? 2 : 1
    };
  }

  if (isItemShieldRecord(item) || isItemStaffRecord(item) || isItemSpellcastingFocusRecord(item)) {
    return {
      key,
      properties: [],
      handSlots: 1
    };
  }

  return null;
}

export function getItemTransactionCost(
  item: Pick<ItemRecord, "cost">
): InventoryTransactionCost | null {
  const resolvedCurrency = parseItemCost(item.cost);

  if (!resolvedCurrency) {
    return null;
  }

  return {
    amount: resolvedCurrency.amount,
    currency: resolvedCurrency.currency,
    currencyKey: currencyKeyByType[resolvedCurrency.currency]
  };
}

export function addInventoryItemCopies(
  inventoryItems: CharacterInventoryItem[],
  item: ItemRecord,
  quantity = 1
): CharacterInventoryItem[] {
  const normalizedQuantity = Math.max(0, Math.floor(quantity));

  if (!item.key || normalizedQuantity === 0) {
    return inventoryItems;
  }

  return [
    ...inventoryItems,
    ...Array.from({ length: normalizedQuantity }, () => createCharacterInventoryItem(item))
  ];
}

export function findFirstInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem | null {
  return inventoryItems.find((entry) => getItemRecordKey(entry.item) === itemKey) ?? null;
}

export function findHeldInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem | null {
  return inventoryItems.find(
    (entry) => getItemRecordKey(entry.item) === itemKey && entry.onHand
  ) ?? null;
}

export function findWornInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem | null {
  return inventoryItems.find(
    (entry) => getItemRecordKey(entry.item) === itemKey && entry.worn
  ) ?? null;
}

export function removeOneInventoryItemCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem[] {
  const targetCopy =
    [...inventoryItems]
      .filter((entry) => getItemRecordKey(entry.item) === itemKey)
      .sort((left, right) => getItemCopyRemovalRank(left) - getItemCopyRemovalRank(right))[0] ??
    null;

  if (!targetCopy) {
    return inventoryItems;
  }

  return inventoryItems.filter((entry) => entry.id !== targetCopy.id);
}
