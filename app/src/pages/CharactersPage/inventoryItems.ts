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

export type InventoryItemCopyReference = {
  id: string;
  stackId: string;
  copyIndex: number;
  item: ItemRecord;
  onHand: boolean;
  worn: boolean;
};

export type GroupedInventoryItem = {
  key: string;
  name: string;
  item: ItemRecord;
  stack: CharacterInventoryItem;
  copies: InventoryItemCopyReference[];
  count: number;
  onHand: boolean;
  onHandCount: number;
  worn: boolean;
};

type InventoryTransactionCost = EquipmentCost & {
  currencyKey: CurrencyKey;
};

type InventoryTransactionCostOptions = {
  multiplier?: number;
  rounding?: "ceil" | "floor" | "round";
};

const currencyKeyByType: Record<CURRENCY_TYPE, CurrencyKey> = {
  [CURRENCY_TYPE.CP]: "copper",
  [CURRENCY_TYPE.SP]: "silver",
  [CURRENCY_TYPE.EP]: "electrum",
  [CURRENCY_TYPE.GP]: "gold",
  [CURRENCY_TYPE.PP]: "platinum"
};

const currencyCopperValueByType: Record<CURRENCY_TYPE, number> = {
  [CURRENCY_TYPE.CP]: 1,
  [CURRENCY_TYPE.SP]: 10,
  [CURRENCY_TYPE.EP]: 50,
  [CURRENCY_TYPE.GP]: 100,
  [CURRENCY_TYPE.PP]: 1000
};

function getCopperValue(cost: EquipmentCost): number {
  return cost.amount * currencyCopperValueByType[cost.currency];
}

function normalizeCopperValueToCost(copperValue: number): EquipmentCost {
  const normalizedCopperValue = Math.max(0, Math.floor(copperValue));

  if (normalizedCopperValue >= 1000 && normalizedCopperValue % 1000 === 0) {
    return {
      amount: normalizedCopperValue / 1000,
      currency: CURRENCY_TYPE.PP
    };
  }

  if (normalizedCopperValue >= 100 && normalizedCopperValue % 100 === 0) {
    return {
      amount: normalizedCopperValue / 100,
      currency: CURRENCY_TYPE.GP
    };
  }

  if (normalizedCopperValue >= 50 && normalizedCopperValue % 50 === 0) {
    return {
      amount: normalizedCopperValue / 50,
      currency: CURRENCY_TYPE.EP
    };
  }

  if (normalizedCopperValue >= 10 && normalizedCopperValue % 10 === 0) {
    return {
      amount: normalizedCopperValue / 10,
      currency: CURRENCY_TYPE.SP
    };
  }

  return {
    amount: normalizedCopperValue,
    currency: CURRENCY_TYPE.CP
  };
}

function applyTransactionMultiplier(
  copperValue: number,
  options?: InventoryTransactionCostOptions
) {
  const multiplier = options?.multiplier ?? 1;
  const scaledValue = copperValue * multiplier;

  if (!Number.isFinite(scaledValue) || scaledValue <= 0) {
    return 0;
  }

  if (options?.rounding === "ceil") {
    return Math.ceil(scaledValue);
  }

  if (options?.rounding === "floor") {
    return Math.floor(scaledValue);
  }

  return Math.round(scaledValue);
}

function createInventoryItemId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `inventory-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeStackNumber(value: unknown, fallback: number, min = 0): number {
  const parsedValue = Number(value);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : fallback;

  return Math.max(min, Math.floor(safeValue));
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

function normalizeInventoryStack(entry: CharacterInventoryItem): CharacterInventoryItem {
  const quantity = Math.max(1, Math.floor(entry.quantity));

  return {
    ...entry,
    quantity,
    onHandQuantity: Math.min(quantity, Math.max(0, Math.floor(entry.onHandQuantity))),
    worn: Boolean(entry.worn)
  };
}

function createInventoryCopyId(stackId: string, copyIndex: number): string {
  return `${stackId}:${copyIndex}`;
}

export function getInventoryItemStackIdFromCopyId(copyId: string): string {
  return copyId.split(":")[0] ?? copyId;
}

export function createInventoryItemCopyReferences(
  entry: CharacterInventoryItem
): InventoryItemCopyReference[] {
  const quantity = getInventoryItemQuantity(entry);
  const onHandQuantity = getInventoryItemOnHandQuantity(entry);

  return Array.from({ length: quantity }, (_, index) => ({
    id: createInventoryCopyId(entry.id, index),
    stackId: entry.id,
    copyIndex: index,
    item: entry.item,
    onHand: index < onHandQuantity,
    worn: entry.worn && index === 0
  }));
}

export function createHeldInventoryItemCopyReferences(
  entry: CharacterInventoryItem
): InventoryItemCopyReference[] {
  return createInventoryItemCopyReferences(entry).filter((copy) => copy.onHand);
}

export function createPreferredInventoryItemCopyReferences(
  entry: CharacterInventoryItem,
  count: number
): InventoryItemCopyReference[] {
  return createInventoryItemCopyReferences(entry)
    .sort((left, right) => Number(right.onHand) - Number(left.onHand))
    .slice(0, Math.max(0, Math.floor(count)));
}

export function createCharacterInventoryItem(
  item: ItemRecord,
  options?: {
    id?: string;
    quantity?: number;
    onHandQuantity?: number;
    onHand?: boolean;
    worn?: boolean;
  }
): CharacterInventoryItem {
  const quantity = normalizeStackNumber(options?.quantity, 1, 1);
  const onHandQuantity =
    options?.onHandQuantity !== undefined
      ? normalizeStackNumber(options.onHandQuantity, 0)
      : options?.onHand
        ? 1
        : 0;

  return normalizeInventoryStack({
    id: options?.id?.trim() || createInventoryItemId(),
    item,
    quantity,
    onHandQuantity,
    worn: Boolean(options?.worn)
  });
}

export function isCharacterInventoryItem(value: unknown): value is CharacterInventoryItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<CharacterInventoryItem>;
  return (
    typeof record.id === "string" &&
    normalizeItemRecord(record.item) !== null &&
    getInventoryItemQuantity(record as CharacterInventoryItem) > 0
  );
}

export function normalizeCharacterInventoryItems(value: unknown): CharacterInventoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const stacksByKey = new Map<string, CharacterInventoryItem>();

  value.forEach((entry) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const record = entry as Partial<CharacterInventoryItem> & {
      onHand?: unknown;
      quantity?: unknown;
      onHandQuantity?: unknown;
    };
    const item = normalizeItemRecord(record.item);

    if (!item) {
      return;
    }

    const key = getItemRecordKey(item);
    const quantity =
      record.quantity !== undefined ? normalizeStackNumber(record.quantity, 1, 1) : 1;
    const onHandQuantity =
      record.onHandQuantity !== undefined
        ? normalizeStackNumber(record.onHandQuantity, 0)
        : normalizeBoolean(record.onHand)
          ? 1
          : 0;
    const stack = createCharacterInventoryItem(item, {
      id: typeof record.id === "string" ? record.id : undefined,
      quantity,
      onHandQuantity,
      worn: normalizeBoolean(record.worn)
    });
    const existingStack = stacksByKey.get(key);

    if (!existingStack) {
      stacksByKey.set(key, stack);
      return;
    }

    stacksByKey.set(
      key,
      normalizeInventoryStack({
        ...existingStack,
        quantity: existingStack.quantity + stack.quantity,
        onHandQuantity: existingStack.onHandQuantity + stack.onHandQuantity,
        worn: existingStack.worn || stack.worn
      })
    );
  });

  return [...stacksByKey.values()].map(normalizeInventoryStack);
}

export function getItemRecordKey(item: ItemRecord | null | undefined): string {
  return typeof item?.key === "string" ? item.key : "";
}

export function getItemRecordName(item: ItemRecord | null | undefined): string {
  return typeof item?.name === "string" ? item.name : "Unknown Item";
}

export function getInventoryItemQuantity(entry: CharacterInventoryItem): number {
  return normalizeStackNumber(entry.quantity, 1, 1);
}

export function getInventoryItemOnHandQuantity(entry: CharacterInventoryItem): number {
  return Math.min(getInventoryItemQuantity(entry), normalizeStackNumber(entry.onHandQuantity, 0));
}

export function getInventoryItemAvailableQuantity(entry: CharacterInventoryItem): number {
  return Math.max(0, getInventoryItemQuantity(entry) - getInventoryItemOnHandQuantity(entry));
}

export function isInventoryItemOnHand(entry: CharacterInventoryItem): boolean {
  return getInventoryItemOnHandQuantity(entry) > 0;
}

export function findInventoryItemStackByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem | null {
  return inventoryItems.find((entry) => getItemRecordKey(entry.item) === itemKey) ?? null;
}

export function findInventoryItemStackById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): CharacterInventoryItem | null {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  return inventoryItems.find((entry) => entry.id === resolvedStackId) ?? null;
}

export function findOwnedInventoryItemRecord(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): ItemRecord | null {
  return findInventoryItemStackByKey(inventoryItems, itemKey)?.item ?? null;
}

export function getInventoryItemCountsByKey(
  inventoryItems: CharacterInventoryItem[]
): Record<string, number> {
  return inventoryItems.reduce<Record<string, number>>((counts, entry) => {
    const key = getItemRecordKey(entry.item);

    if (!key) {
      return counts;
    }

    counts[key] = getInventoryItemQuantity(entry);
    return counts;
  }, {});
}

export function groupCharacterInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): GroupedInventoryItem[] {
  return inventoryItems
    .map((stack) => {
      const count = getInventoryItemQuantity(stack);
      const onHandCount = getInventoryItemOnHandQuantity(stack);

      return {
        key: getItemRecordKey(stack.item),
        name: getItemRecordName(stack.item),
        item: stack.item,
        stack,
        copies: createInventoryItemCopyReferences(stack),
        count,
        onHand: onHandCount > 0,
        onHandCount,
        worn: Boolean(stack.worn)
      };
    })
    .filter((entry) => entry.key)
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
  item: Pick<ItemRecord, "cost">,
  options?: InventoryTransactionCostOptions
): InventoryTransactionCost | null {
  const resolvedCurrency = parseItemCost(item.cost);

  if (!resolvedCurrency) {
    return null;
  }

  const transactionCost = normalizeCopperValueToCost(
    applyTransactionMultiplier(getCopperValue(resolvedCurrency), options)
  );

  return {
    amount: transactionCost.amount,
    currency: transactionCost.currency,
    currencyKey: currencyKeyByType[transactionCost.currency]
  };
}

export function addInventoryItemCopies(
  inventoryItems: CharacterInventoryItem[],
  item: ItemRecord,
  quantity = 1
): CharacterInventoryItem[] {
  const normalizedQuantity = normalizeStackNumber(quantity, 0);

  if (!item.key || normalizedQuantity === 0) {
    return inventoryItems;
  }

  const existingStack = findInventoryItemStackByKey(inventoryItems, item.key);

  if (!existingStack) {
    return [
      ...inventoryItems,
      createCharacterInventoryItem(item, {
        quantity: normalizedQuantity
      })
    ];
  }

  return inventoryItems.map((entry) =>
    entry.id === existingStack.id
      ? normalizeInventoryStack({
          ...entry,
          quantity: getInventoryItemQuantity(entry) + normalizedQuantity
        })
      : entry
  );
}

export function setInventoryItemOnHandQuantityByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string,
  onHandQuantity: number
): CharacterInventoryItem[] {
  return inventoryItems.map((entry) =>
    getItemRecordKey(entry.item) === itemKey
      ? normalizeInventoryStack({
          ...entry,
          onHandQuantity
        })
      : entry
  );
}

export function setInventoryItemWornStateById(
  inventoryItems: CharacterInventoryItem[],
  inventoryItemId: string,
  worn: boolean
): CharacterInventoryItem[] {
  const stackId = getInventoryItemStackIdFromCopyId(inventoryItemId);

  return inventoryItems.map((entry) => ({
    ...entry,
    worn: entry.id === stackId ? worn : false
  }));
}

export function clearInventoryItemOnHandQuantities(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  return inventoryItems.map((entry) => ({
    ...entry,
    onHandQuantity: 0
  }));
}

export function findFirstInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): InventoryItemCopyReference | null {
  const stack = findInventoryItemStackByKey(inventoryItems, itemKey);

  return stack ? (createInventoryItemCopyReferences(stack)[0] ?? null) : null;
}

export function findHeldInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): InventoryItemCopyReference | null {
  return findHeldInventoryCopiesByKey(inventoryItems, itemKey)[0] ?? null;
}

export function findHeldInventoryCopiesByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): InventoryItemCopyReference[] {
  const stack = findInventoryItemStackByKey(inventoryItems, itemKey);

  return stack ? createHeldInventoryItemCopyReferences(stack) : [];
}

export function findAvailableInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): InventoryItemCopyReference | null {
  const stack = findInventoryItemStackByKey(inventoryItems, itemKey);

  if (!stack || getInventoryItemAvailableQuantity(stack) <= 0) {
    return null;
  }

  return createInventoryItemCopyReferences(stack).find((copy) => !copy.onHand) ?? null;
}

export function getPreferredInventoryCopiesByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string,
  count: number
): InventoryItemCopyReference[] {
  const stack = findInventoryItemStackByKey(inventoryItems, itemKey);

  return stack ? createPreferredInventoryItemCopyReferences(stack, count) : [];
}

export function findWornInventoryCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): InventoryItemCopyReference | null {
  const stack = findInventoryItemStackByKey(inventoryItems, itemKey);

  if (!stack?.worn) {
    return null;
  }

  return createInventoryItemCopyReferences(stack)[0] ?? null;
}

export function removeOneInventoryItemCopyByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem[] {
  const targetStack = findInventoryItemStackByKey(inventoryItems, itemKey);

  if (!targetStack) {
    return inventoryItems;
  }

  const nextQuantity = getInventoryItemQuantity(targetStack) - 1;

  if (nextQuantity <= 0) {
    return inventoryItems.filter((entry) => entry.id !== targetStack.id);
  }

  return inventoryItems.map((entry) =>
    entry.id === targetStack.id
      ? normalizeInventoryStack({
          ...entry,
          quantity: nextQuantity,
          onHandQuantity: Math.min(getInventoryItemOnHandQuantity(entry), nextQuantity),
          worn: entry.worn && nextQuantity > 0
        })
      : entry
  );
}
