import {
  CURRENCY_TYPE,
  type EquipmentCost,
  type WeaponDamage,
  type WeaponType
} from "../../codex/entries";
import type { CharacterInventoryItem, CurrencyKey, ItemRecord } from "../../types";
import { parseItemCost } from "../../utils/items/cost";
import {
  adaptItemWeapon,
  type AdaptedItemWeaponRecord
} from "../../utils/items/adaptItemWeapon";
import type { HeldWeaponDescriptor } from "./inventory";

export type GroupedInventoryItem = {
  key: string;
  name: string;
  item: ItemRecord;
  copies: CharacterInventoryItem[];
  count: number;
  onHand: boolean;
  onHandCount: number;
  worn: boolean;
};

type InventoryTransactionCost = EquipmentCost & {
  currencyKey: CurrencyKey;
};

const currencyKeyByType: Record<CURRENCY_TYPE, CurrencyKey> = {
  [CURRENCY_TYPE.CP]: "copper",
  [CURRENCY_TYPE.SP]: "silver",
  [CURRENCY_TYPE.EP]: "electrum",
  [CURRENCY_TYPE.GP]: "gold",
  [CURRENCY_TYPE.PP]: "platinum"
};

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
      onHandCount: copies.filter((copy) => copy.onHand).length,
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

export function getAdaptedItemWeapon(item: ItemRecord): AdaptedItemWeaponRecord | null {
  return adaptItemWeapon(item);
}

export function getItemWeaponProperties(item: ItemRecord) {
  return getAdaptedItemWeapon(item)?.properties ?? [];
}

export function getItemWeaponType(item: ItemRecord): WeaponType | null {
  return getAdaptedItemWeapon(item)?.type ?? null;
}

export function getItemWeaponDamage(item: ItemRecord): WeaponDamage | null {
  return getAdaptedItemWeapon(item)?.damage ?? null;
}

export function createHeldDescriptorForInventoryItem(
  key: string,
  item: ItemRecord
): HeldWeaponDescriptor | null {
  const adaptedWeapon = getAdaptedItemWeapon(item);

  if (adaptedWeapon) {
    return {
      key,
      properties: adaptedWeapon.properties,
      versatileDamage: adaptedWeapon.versatileDamage ?? undefined,
      handSlots: adaptedWeapon.handSlots
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
  return findHeldInventoryCopiesByKey(inventoryItems, itemKey)[0] ?? null;
}

export function findHeldInventoryCopiesByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem[] {
  return inventoryItems.filter((entry) => getItemRecordKey(entry.item) === itemKey && entry.onHand);
}

export function findAvailableInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem | null {
  return inventoryItems.find(
    (entry) => getItemRecordKey(entry.item) === itemKey && !entry.onHand
  ) ?? null;
}

export function getPreferredInventoryCopiesByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string,
  count: number
): CharacterInventoryItem[] {
  return [...inventoryItems]
    .filter((entry) => getItemRecordKey(entry.item) === itemKey)
    .sort((left, right) => Number(right.onHand) - Number(left.onHand))
    .slice(0, Math.max(0, count));
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
