import {
  CURRENCY_TYPE,
  type EquipmentCost,
  type WeaponDamage,
  type WeaponType
} from "../../codex/entries";
import type {
  Character,
  CharacterInventoryConjuredDuration,
  CharacterInventoryFeatureTag,
  CharacterInventoryItem,
  CharacterItemMods,
  CurrencyKey,
  ItemRecord
} from "../../types";
import { parseItemCost } from "../../utils/items/cost";
import {
  adaptItemWeapon,
  type AdaptedItemWeaponRecord
} from "../../utils/items/adaptItemWeapon";
import type { HeldWeaponDescriptor } from "./inventory";
import {
  getEffectiveInventoryItemRecord,
  normalizeCharacterItemMods
} from "./itemMods";

export type InventoryItemCopyReference = {
  id: string;
  stackId: string;
  copyIndex: number;
  item: ItemRecord;
  onHand: boolean;
  worn: boolean;
  featureTags?: CharacterInventoryFeatureTag[];
};

export type GroupedInventoryItem = {
  key: string;
  itemKey: string;
  stackId: string;
  name: string;
  item: ItemRecord;
  stack: CharacterInventoryItem;
  copies: InventoryItemCopyReference[];
  count: number;
  onHand: boolean;
  onHandCount: number;
  worn: boolean;
};

export type InventoryItemUseState = {
  remaining: number;
  total: number;
};

type InventoryTransactionCost = EquipmentCost & {
  currencyKey: CurrencyKey;
};

type InventoryTransactionCostOptions = {
  multiplier?: number;
  rounding?: "ceil" | "floor" | "round";
};

export type InventoryItemModsSaveResult = {
  inventoryItems: CharacterInventoryItem[];
  stackId: string | null;
};

type InventoryFeatureTagLabelOptions = {
  excludeConjured?: boolean;
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

const inventoryItemUsesPerCopyByKey: Record<string, number> = {
  "srd_healers-kit": 10,
  "srd-2024_healers-kit": 10
};
const moddedItemKeyMarker = "-modded-";

export const INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE = "pact-of-the-blade";
export const INVENTORY_FEATURE_TAG_CONJURED = "conjured";
export const INVENTORY_CONJURED_DURATION_LONG_REST = "long-rest";

const inventoryFeatureTagLabels: Record<CharacterInventoryFeatureTag, string> = {
  [INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE]: "Pact of the Blade",
  [INVENTORY_FEATURE_TAG_CONJURED]: "Conjured"
};

const inventoryFeatureTagOrder: CharacterInventoryFeatureTag[] = [
  INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE,
  INVENTORY_FEATURE_TAG_CONJURED
];

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

function createModdedInventoryItemKey(item: ItemRecord, stackId: string): string {
  const baseKey = getItemRecordKey(item) || item.id || "item";
  return `${baseKey}${moddedItemKeyMarker}${stackId}`;
}

function getUnmoddedInventoryItemKey(item: ItemRecord | null | undefined): string {
  const key = getItemRecordKey(item);
  const markerIndex = key.indexOf(moddedItemKeyMarker);

  return markerIndex > 0 ? key.slice(0, markerIndex) : key;
}

function createModdedInventoryItemRecord(item: ItemRecord, stackId: string): ItemRecord {
  const key = createModdedInventoryItemKey(item, stackId);

  return {
    ...item,
    id: key,
    key
  };
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

function normalizeInventoryFeatureTags(value: unknown): CharacterInventoryFeatureTag[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const tagSet = new Set<CharacterInventoryFeatureTag>();

  value.forEach((entry) => {
    if (
      entry === INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE ||
      entry === INVENTORY_FEATURE_TAG_CONJURED
    ) {
      tagSet.add(entry);
    }
  });

  const normalizedTags = inventoryFeatureTagOrder.filter((tag) => tagSet.has(tag));

  return normalizedTags.length > 0 ? normalizedTags : undefined;
}

function normalizeInventoryConjuredDuration(
  value: unknown
): CharacterInventoryConjuredDuration | undefined {
  return value === INVENTORY_CONJURED_DURATION_LONG_REST
    ? INVENTORY_CONJURED_DURATION_LONG_REST
    : undefined;
}

function addInventoryItemFeatureTag(
  entry: CharacterInventoryItem,
  tag: CharacterInventoryFeatureTag
): CharacterInventoryItem {
  const tagSet = new Set(normalizeInventoryFeatureTags(entry.featureTags) ?? []);
  tagSet.add(tag);

  return normalizeInventoryStack({
    ...entry,
    featureTags: inventoryFeatureTagOrder.filter((currentTag) => tagSet.has(currentTag))
  });
}

function normalizeInventoryStack(entry: CharacterInventoryItem): CharacterInventoryItem {
  const quantity = Math.max(1, Math.floor(entry.quantity));
  const onHandQuantity = Math.min(quantity, Math.max(0, Math.floor(entry.onHandQuantity)));
  const mods = normalizeCharacterItemMods(entry.mods);
  const effectiveItem = getEffectiveInventoryItemRecord({ ...entry, mods });
  const featureTags = normalizeInventoryFeatureTags(entry.featureTags);
  const conjuredDuration = featureTags?.includes(INVENTORY_FEATURE_TAG_CONJURED)
    ? normalizeInventoryConjuredDuration(entry.conjuredDuration)
    : undefined;
  const normalizedStack: CharacterInventoryItem = {
    id: entry.id,
    item: entry.item,
    quantity,
    onHandQuantity,
    worn: Boolean(entry.worn),
    featureTags,
    ...(conjuredDuration ? { conjuredDuration } : {}),
    ...(mods ? { mods } : {})
  };
  const usesPerCopy = getInventoryItemUsesPerCopy(entry.item);

  if (isInventoryItemAttunable(effectiveItem)) {
    normalizedStack.attuned = Boolean(entry.attuned);
  }

  if (usesPerCopy !== null) {
    const total = quantity * usesPerCopy;
    normalizedStack.usesRemaining = Math.min(
      total,
      normalizeStackNumber(entry.usesRemaining, total)
    );
  }

  return normalizedStack;
}

function createInventoryCopyId(stackId: string, copyIndex: number): string {
  return `${stackId}:${copyIndex}`;
}

export function getInventoryItemStackIdFromCopyId(copyId: string): string {
  return copyId.split(":")[0] ?? copyId;
}

function createInventoryItemCopyReference(
  entry: CharacterInventoryItem,
  copyIndex: number,
  options?: {
    item?: ItemRecord;
    onHandQuantity?: number;
  }
): InventoryItemCopyReference {
  const onHandQuantity = options?.onHandQuantity ?? getInventoryItemOnHandQuantity(entry);

  return {
    id: createInventoryCopyId(entry.id, copyIndex),
    stackId: entry.id,
    copyIndex,
    item: options?.item ?? getEffectiveInventoryItemRecord(entry),
    onHand: copyIndex < onHandQuantity,
    worn: entry.worn && copyIndex === 0,
    featureTags: normalizeInventoryFeatureTags(entry.featureTags)
  };
}

export function createInventoryItemCopyReferences(
  entry: CharacterInventoryItem
): InventoryItemCopyReference[] {
  const quantity = getInventoryItemQuantity(entry);
  const onHandQuantity = getInventoryItemOnHandQuantity(entry);
  const item = getEffectiveInventoryItemRecord(entry);

  return Array.from({ length: quantity }, (_, index) =>
    createInventoryItemCopyReference(entry, index, {
      item,
      onHandQuantity
    })
  );
}

export function createHeldInventoryItemCopyReferences(
  entry: CharacterInventoryItem
): InventoryItemCopyReference[] {
  const onHandQuantity = getInventoryItemOnHandQuantity(entry);
  const item = getEffectiveInventoryItemRecord(entry);

  return Array.from({ length: onHandQuantity }, (_, index) =>
    createInventoryItemCopyReference(entry, index, {
      item,
      onHandQuantity
    })
  );
}

export function createPreferredInventoryItemCopyReferences(
  entry: CharacterInventoryItem,
  count: number
): InventoryItemCopyReference[] {
  const requestedCount = Math.max(0, Math.floor(count));
  const quantity = getInventoryItemQuantity(entry);
  const onHandQuantity = getInventoryItemOnHandQuantity(entry);
  const item = getEffectiveInventoryItemRecord(entry);
  const copyIndexes: number[] = [];

  for (let index = 0; index < onHandQuantity && copyIndexes.length < requestedCount; index += 1) {
    copyIndexes.push(index);
  }

  for (let index = onHandQuantity; index < quantity && copyIndexes.length < requestedCount; index += 1) {
    copyIndexes.push(index);
  }

  return copyIndexes.map((copyIndex) =>
    createInventoryItemCopyReference(entry, copyIndex, {
      item,
      onHandQuantity
    })
  );
}

export function createCharacterInventoryItem(
  item: ItemRecord,
  options?: {
    id?: string;
    quantity?: number;
    onHandQuantity?: number;
    onHand?: boolean;
    worn?: boolean;
    attuned?: boolean;
    usesRemaining?: number;
    featureTags?: CharacterInventoryFeatureTag[];
    conjuredDuration?: CharacterInventoryConjuredDuration;
    mods?: CharacterItemMods;
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
    worn: Boolean(options?.worn),
    attuned: Boolean(options?.attuned),
    usesRemaining: options?.usesRemaining,
    featureTags: options?.featureTags,
    conjuredDuration: options?.conjuredDuration,
    mods: options?.mods
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

  const stacksByMergeKey = new Map<string, CharacterInventoryItem>();

  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const record = entry as Partial<CharacterInventoryItem> & {
      onHand?: unknown;
      quantity?: unknown;
      onHandQuantity?: unknown;
      attuned?: unknown;
      usesRemaining?: unknown;
      featureTags?: unknown;
      conjuredDuration?: unknown;
      mods?: unknown;
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
      worn: normalizeBoolean(record.worn),
      attuned: normalizeBoolean(record.attuned),
      usesRemaining:
        record.usesRemaining !== undefined
          ? normalizeStackNumber(record.usesRemaining, 0)
          : undefined,
      featureTags: normalizeInventoryFeatureTags(record.featureTags),
      conjuredDuration: normalizeInventoryConjuredDuration(record.conjuredDuration),
      mods: normalizeCharacterItemMods(record.mods)
    });
    const stackHasFeatureTags = (stack.featureTags?.length ?? 0) > 0;
    const mergeKey = stackHasFeatureTags ? `tagged:${stack.id}:${index}` : `item:${key}`;
    const existingStack = stacksByMergeKey.get(mergeKey);

    if (!existingStack) {
      stacksByMergeKey.set(mergeKey, stack);
      return;
    }

    stacksByMergeKey.set(
      mergeKey,
      normalizeInventoryStack({
        ...existingStack,
        quantity: existingStack.quantity + stack.quantity,
        onHandQuantity: existingStack.onHandQuantity + stack.onHandQuantity,
        worn: existingStack.worn || stack.worn,
        attuned: existingStack.attuned || stack.attuned,
        usesRemaining: getMergedInventoryStackUsesRemaining(existingStack, stack),
        mods: existingStack.mods ?? stack.mods
      })
    );
  });

  return [...stacksByMergeKey.values()].map(normalizeInventoryStack);
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

export function isInventoryItemAttunable(item: ItemRecord | null | undefined): boolean {
  return item?.requires_attunement === true;
}

function getInventoryItemUsesPerCopy(item: ItemRecord | null | undefined): number | null {
  const key = getItemRecordKey(item);
  const usesPerCopy =
    inventoryItemUsesPerCopyByKey[key] ??
    inventoryItemUsesPerCopyByKey[getUnmoddedInventoryItemKey(item)];

  return usesPerCopy ? usesPerCopy : null;
}

function getInventoryItemUseTotal(entry: CharacterInventoryItem): number | null {
  const usesPerCopy = getInventoryItemUsesPerCopy(entry.item);

  return usesPerCopy === null ? null : getInventoryItemQuantity(entry) * usesPerCopy;
}

export function getInventoryItemUseState(
  entry: CharacterInventoryItem | null | undefined
): InventoryItemUseState | null {
  if (!entry) {
    return null;
  }

  const total = getInventoryItemUseTotal(entry);

  if (total === null) {
    return null;
  }

  return {
    remaining: Math.min(total, normalizeStackNumber(entry.usesRemaining, total)),
    total
  };
}

function getMergedInventoryStackUsesRemaining(
  firstStack: CharacterInventoryItem,
  secondStack: CharacterInventoryItem
): number | undefined {
  const firstUseState = getInventoryItemUseState(firstStack);
  const secondUseState = getInventoryItemUseState(secondStack);

  if (!firstUseState || !secondUseState) {
    return undefined;
  }

  return Math.min(
    firstUseState.total + secondUseState.total,
    firstUseState.remaining + secondUseState.remaining
  );
}

export function getInventoryAttunementCount(inventoryItems: CharacterInventoryItem[]): number {
  return inventoryItems.filter(
    (entry) => entry.attuned && isInventoryItemAttunable(getEffectiveInventoryItemRecord(entry))
  ).length;
}

export function findInventoryItemStackByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem | null {
  return inventoryItems.find((entry) => getItemRecordKey(entry.item) === itemKey) ?? null;
}

function findUntaggedInventoryItemStackByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem | null {
  return (
    inventoryItems.find(
      (entry) =>
        getItemRecordKey(entry.item) === itemKey &&
        (normalizeInventoryFeatureTags(entry.featureTags)?.length ?? 0) === 0
    ) ?? null
  );
}

export function findInventoryItemStackById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): CharacterInventoryItem | null {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  return inventoryItems.find((entry) => entry.id === resolvedStackId) ?? null;
}

export function hasInventoryItemFeatureTag(
  entry: Pick<CharacterInventoryItem, "featureTags"> | null | undefined,
  tag: CharacterInventoryFeatureTag
): boolean {
  return Boolean(normalizeInventoryFeatureTags(entry?.featureTags)?.includes(tag));
}

export function isPactOfTheBladeInventoryItem(
  entry: Pick<CharacterInventoryItem, "featureTags"> | null | undefined
): boolean {
  return hasInventoryItemFeatureTag(entry, INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE);
}

export function isConjuredInventoryItem(
  entry: Pick<CharacterInventoryItem, "featureTags"> | null | undefined
): boolean {
  return hasInventoryItemFeatureTag(entry, INVENTORY_FEATURE_TAG_CONJURED);
}

export function getInventoryItemConjuredDuration(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredDuration"> | null | undefined
): CharacterInventoryConjuredDuration | undefined {
  if (!isConjuredInventoryItem(entry)) {
    return undefined;
  }

  return normalizeInventoryConjuredDuration(entry?.conjuredDuration);
}

export function isLongRestConjuredInventoryItem(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredDuration"> | null | undefined
): boolean {
  return getInventoryItemConjuredDuration(entry) === INVENTORY_CONJURED_DURATION_LONG_REST;
}

export function getInventoryItemConjuredFeatureTagLabel(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredDuration"> | null | undefined
): string | null {
  if (!isConjuredInventoryItem(entry)) {
    return null;
  }

  return isLongRestConjuredInventoryItem(entry)
    ? "Conjured: Until Long Rest"
    : inventoryFeatureTagLabels[INVENTORY_FEATURE_TAG_CONJURED];
}

export function getInventoryItemConjuredRowTagLabel(
  entry: Pick<CharacterInventoryItem, "featureTags"> | null | undefined
): string | null {
  return isConjuredInventoryItem(entry)
    ? inventoryFeatureTagLabels[INVENTORY_FEATURE_TAG_CONJURED]
    : null;
}

export function getInventoryItemFeatureTagLabels(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredDuration"> | null | undefined,
  options?: InventoryFeatureTagLabelOptions
): string[] {
  return (normalizeInventoryFeatureTags(entry?.featureTags) ?? []).flatMap((tag) => {
    if (tag === INVENTORY_FEATURE_TAG_CONJURED) {
      if (options?.excludeConjured) {
        return [];
      }

      const conjuredLabel = getInventoryItemConjuredFeatureTagLabel(entry);
      return conjuredLabel ? [conjuredLabel] : [];
    }

    return [inventoryFeatureTagLabels[tag]];
  });
}

export function hasLongRestConjuredInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): boolean {
  return inventoryItems.some(isLongRestConjuredInventoryItem);
}

export function removeConjuredInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  const nextInventoryItems = inventoryItems.filter((entry) => !isConjuredInventoryItem(entry));

  return nextInventoryItems.length === inventoryItems.length
    ? inventoryItems
    : nextInventoryItems;
}

export function removeLongRestConjuredInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  const nextInventoryItems = inventoryItems.filter(
    (entry) => !isLongRestConjuredInventoryItem(entry)
  );

  return nextInventoryItems.length === inventoryItems.length
    ? inventoryItems
    : nextInventoryItems;
}

export function removeConjuredInventoryItemsForCharacterDeath(character: Character): Character {
  const nextInventoryItems = removeConjuredInventoryItems(character.inventoryItems);

  return nextInventoryItems === character.inventoryItems
    ? character
    : {
        ...character,
        inventoryItems: nextInventoryItems
      };
}

function removeInventoryItemFeatureTag(
  entry: CharacterInventoryItem,
  tag: CharacterInventoryFeatureTag
): CharacterInventoryItem {
  const nextTags = (normalizeInventoryFeatureTags(entry.featureTags) ?? []).filter(
    (currentTag) => currentTag !== tag
  );

  return normalizeInventoryStack({
    ...entry,
    featureTags: nextTags
  });
}

export function clearPactOfTheBladeInventoryTags(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  return inventoryItems.flatMap((entry) => {
    if (!isPactOfTheBladeInventoryItem(entry)) {
      return [entry];
    }

    if (isConjuredInventoryItem(entry)) {
      return [];
    }

    return [removeInventoryItemFeatureTag(entry, INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE)];
  });
}

export function setPactOfTheBladeInventoryItemById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): CharacterInventoryItem[] {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);
  const clearedInventoryItems = clearPactOfTheBladeInventoryTags(inventoryItems);

  return clearedInventoryItems.map((entry) =>
    entry.id === resolvedStackId
      ? addInventoryItemFeatureTag(entry, INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE)
      : entry
  );
}

export function addConjuredPactOfTheBladeInventoryItem(
  inventoryItems: CharacterInventoryItem[],
  item: ItemRecord
): CharacterInventoryItem[] {
  return [
    ...clearPactOfTheBladeInventoryTags(inventoryItems),
    createCharacterInventoryItem(item, {
      quantity: 1,
      featureTags: [INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE, INVENTORY_FEATURE_TAG_CONJURED]
    })
  ];
}

export function addConjuredInventoryItemCopies(
  inventoryItems: CharacterInventoryItem[],
  item: ItemRecord,
  quantity = 1,
  options?: {
    conjuredDuration?: CharacterInventoryConjuredDuration;
  }
): CharacterInventoryItem[] {
  const normalizedQuantity = normalizeStackNumber(quantity, 0);

  if (!item.key || normalizedQuantity === 0) {
    return inventoryItems;
  }

  return [
    ...inventoryItems,
    createCharacterInventoryItem(item, {
      quantity: normalizedQuantity,
      featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
      conjuredDuration: options?.conjuredDuration
    })
  ];
}

export function isNonCustomModdedInventoryItem(
  entry: Pick<CharacterInventoryItem, "mods"> | null | undefined
): boolean {
  const mods = normalizeCharacterItemMods(entry?.mods);
  return Boolean(mods && !mods.isCustom);
}

function getSourceFeatureTagsAfterModdedTransform(
  entry: CharacterInventoryItem
): CharacterInventoryFeatureTag[] | undefined {
  const nextTags = (normalizeInventoryFeatureTags(entry.featureTags) ?? []).filter(
    (tag) => tag !== INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE
  );

  return nextTags.length > 0 ? nextTags : undefined;
}

function getMovedInventoryItemUsesRemaining(entry: CharacterInventoryItem): number | undefined {
  const usesPerCopy = getInventoryItemUsesPerCopy(entry.item);
  const useState = getInventoryItemUseState(entry);

  if (usesPerCopy === null || !useState) {
    return undefined;
  }

  return Math.min(usesPerCopy, useState.remaining);
}

function updateInventoryItemModsInPlace(
  entry: CharacterInventoryItem,
  item: ItemRecord,
  mods: CharacterItemMods
): CharacterInventoryItem {
  return createCharacterInventoryItem(mods.isCustom ? item : entry.item, {
    id: entry.id,
    quantity: entry.quantity,
    onHandQuantity: entry.onHandQuantity,
    worn: entry.worn,
    attuned: mods.requiresAttunement ? entry.attuned : false,
    usesRemaining: entry.usesRemaining,
    featureTags: entry.featureTags,
    conjuredDuration: entry.conjuredDuration,
    mods
  });
}

function transformInventoryItemCopyWithMods(
  entry: CharacterInventoryItem,
  item: ItemRecord,
  mods: CharacterItemMods
): CharacterInventoryItem[] {
  const moddedStackId = createInventoryItemId();
  const quantity = getInventoryItemQuantity(entry);
  const onHandQuantity = getInventoryItemOnHandQuantity(entry);
  const movedOnHandQuantity = onHandQuantity > 0 ? 1 : 0;
  const movedWorn = entry.worn;
  const movedUsesRemaining = getMovedInventoryItemUsesRemaining(entry);
  const useState = getInventoryItemUseState(entry);
  const moddedStack = createCharacterInventoryItem(
    createModdedInventoryItemRecord(item, moddedStackId),
    {
      id: moddedStackId,
      quantity: 1,
      onHandQuantity: movedOnHandQuantity,
      worn: movedWorn,
      attuned: entry.attuned,
      usesRemaining: movedUsesRemaining,
      featureTags: entry.featureTags,
      conjuredDuration: entry.conjuredDuration,
      mods
    }
  );
  const nextSourceQuantity = quantity - 1;

  if (nextSourceQuantity <= 0) {
    return [moddedStack];
  }

  return [
    createCharacterInventoryItem(entry.item, {
      id: entry.id,
      quantity: nextSourceQuantity,
      onHandQuantity: Math.max(0, onHandQuantity - movedOnHandQuantity),
      worn: false,
      attuned: false,
      usesRemaining: useState
        ? Math.max(0, useState.remaining - (movedUsesRemaining ?? 0))
        : entry.usesRemaining,
      featureTags: getSourceFeatureTagsAfterModdedTransform(entry),
      conjuredDuration: entry.conjuredDuration,
      mods: entry.mods
    }),
    moddedStack
  ];
}

export function saveInventoryItemModsById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  item: ItemRecord,
  mods: CharacterItemMods
): InventoryItemModsSaveResult {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);
  const targetStack = findInventoryItemStackById(inventoryItems, resolvedStackId);
  const normalizedMods = normalizeCharacterItemMods(mods);

  if (!targetStack || !normalizedMods) {
    return {
      inventoryItems,
      stackId: targetStack?.id ?? null
    };
  }

  if (targetStack.mods || normalizedMods.isCustom) {
    return {
      inventoryItems: inventoryItems.map((entry) =>
        entry.id === targetStack.id
          ? updateInventoryItemModsInPlace(entry, item, normalizedMods)
          : entry
      ),
      stackId: targetStack.id
    };
  }

  let transformedStackId: string | null = null;
  const nextInventoryItems = inventoryItems.flatMap((entry) => {
    if (entry.id !== targetStack.id) {
      return [entry];
    }

    const transformedStacks = transformInventoryItemCopyWithMods(entry, entry.item, normalizedMods);
    transformedStackId = transformedStacks[transformedStacks.length - 1]?.id ?? null;
    return transformedStacks;
  });

  return {
    inventoryItems: nextInventoryItems,
    stackId: transformedStackId
  };
}

export function findOwnedInventoryItemRecord(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): ItemRecord | null {
  const stack = findInventoryItemStackByKey(inventoryItems, itemKey);

  return stack ? getEffectiveInventoryItemRecord(stack) : null;
}

export function getInventoryItemCountsByKey(
  inventoryItems: CharacterInventoryItem[]
): Record<string, number> {
  return inventoryItems.reduce<Record<string, number>>((counts, entry) => {
    const key = getItemRecordKey(entry.item);

    if (!key) {
      return counts;
    }

    counts[key] = (counts[key] ?? 0) + getInventoryItemQuantity(entry);
    return counts;
  }, {});
}

export function createGroupedInventoryItem(stack: CharacterInventoryItem): GroupedInventoryItem {
  const count = getInventoryItemQuantity(stack);
  const onHandCount = getInventoryItemOnHandQuantity(stack);
  const effectiveItem = getEffectiveInventoryItemRecord(stack);
  let copyReferences: InventoryItemCopyReference[] | null = null;

  return {
    key: getItemRecordKey(effectiveItem),
    itemKey: getItemRecordKey(stack.item),
    stackId: stack.id,
    name: getItemRecordName(effectiveItem),
    item: effectiveItem,
    stack,
    get copies() {
      if (!copyReferences) {
        copyReferences = createInventoryItemCopyReferences(stack);
      }

      return copyReferences;
    },
    count,
    onHand: onHandCount > 0,
    onHandCount,
    worn: Boolean(stack.worn)
  };
}

export function groupCharacterInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): GroupedInventoryItem[] {
  return inventoryItems
    .map(createGroupedInventoryItem)
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

  const existingStack = findUntaggedInventoryItemStackByKey(inventoryItems, item.key);

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
      ? addInventoryItemQuantityToStack(entry, normalizedQuantity)
      : entry
  );
}

function addInventoryItemQuantityToStack(
  entry: CharacterInventoryItem,
  quantity: number
): CharacterInventoryItem {
  const usesPerCopy = getInventoryItemUsesPerCopy(entry.item);
  const nextQuantity = getInventoryItemQuantity(entry) + quantity;
  const useState = getInventoryItemUseState(entry);

  return normalizeInventoryStack({
    ...entry,
    quantity: nextQuantity,
    usesRemaining:
      usesPerCopy === null || !useState
        ? entry.usesRemaining
        : Math.min(nextQuantity * usesPerCopy, useState.remaining + quantity * usesPerCopy)
  });
}

export function addInventoryItemCopiesToStackById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  quantity = 1
): CharacterInventoryItem[] {
  const normalizedQuantity = normalizeStackNumber(quantity, 0);
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  if (!resolvedStackId || normalizedQuantity === 0) {
    return inventoryItems;
  }

  return inventoryItems.map((entry) =>
    entry.id === resolvedStackId
      ? addInventoryItemQuantityToStack(entry, normalizedQuantity)
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

export function setInventoryItemOnHandQuantityById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  onHandQuantity: number
): CharacterInventoryItem[] {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  return inventoryItems.map((entry) =>
    entry.id === resolvedStackId
      ? normalizeInventoryStack({
          ...entry,
          onHandQuantity
        })
      : entry
  );
}

export function setInventoryItemAttunedByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string,
  attuned: boolean
): CharacterInventoryItem[] {
  return inventoryItems.map((entry) =>
    getItemRecordKey(entry.item) === itemKey
      ? normalizeInventoryStack({
          ...entry,
          attuned: isInventoryItemAttunable(getEffectiveInventoryItemRecord(entry)) ? attuned : false
        })
      : entry
  );
}

export function setInventoryItemAttunedById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  attuned: boolean
): CharacterInventoryItem[] {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  return inventoryItems.map((entry) =>
    entry.id === resolvedStackId
      ? normalizeInventoryStack({
          ...entry,
          attuned: isInventoryItemAttunable(getEffectiveInventoryItemRecord(entry)) ? attuned : false
        })
      : entry
  );
}

export function useInventoryItemChargeByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem[] {
  return inventoryItems.map((entry) => {
    if (getItemRecordKey(entry.item) !== itemKey) {
      return entry;
    }

    const useState = getInventoryItemUseState(entry);

    if (!useState || useState.remaining <= 0) {
      return entry;
    }

    return normalizeInventoryStack({
      ...entry,
      usesRemaining: useState.remaining - 1
    });
  });
}

export function useInventoryItemChargeById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): CharacterInventoryItem[] {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  return inventoryItems.map((entry) => {
    if (entry.id !== resolvedStackId) {
      return entry;
    }

    const useState = getInventoryItemUseState(entry);

    if (!useState || useState.remaining <= 0) {
      return entry;
    }

    return normalizeInventoryStack({
      ...entry,
      usesRemaining: useState.remaining - 1
    });
  });
}

export function resetInventoryItemChargeByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string
): CharacterInventoryItem[] {
  return inventoryItems.map((entry) => {
    if (getItemRecordKey(entry.item) !== itemKey) {
      return entry;
    }

    const useState = getInventoryItemUseState(entry);

    if (!useState || useState.remaining >= useState.total) {
      return entry;
    }

    return normalizeInventoryStack({
      ...entry,
      usesRemaining: useState.remaining + 1
    });
  });
}

export function resetInventoryItemChargeById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): CharacterInventoryItem[] {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  return inventoryItems.map((entry) => {
    if (entry.id !== resolvedStackId) {
      return entry;
    }

    const useState = getInventoryItemUseState(entry);

    if (!useState || useState.remaining >= useState.total) {
      return entry;
    }

    return normalizeInventoryStack({
      ...entry,
      usesRemaining: useState.remaining + 1
    });
  });
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

export function findFirstInventoryCopyById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): InventoryItemCopyReference | null {
  const stack = findInventoryItemStackById(inventoryItems, stackId);

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

export function findHeldInventoryCopiesById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): InventoryItemCopyReference[] {
  const stack = findInventoryItemStackById(inventoryItems, stackId);

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

export function findAvailableInventoryCopyById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): InventoryItemCopyReference | null {
  const stack = findInventoryItemStackById(inventoryItems, stackId);

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

export function getPreferredInventoryCopiesById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  count: number
): InventoryItemCopyReference[] {
  const stack = findInventoryItemStackById(inventoryItems, stackId);

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

export function findWornInventoryCopyById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): InventoryItemCopyReference | null {
  const stack = findInventoryItemStackById(inventoryItems, stackId);

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

export function removeOneInventoryItemCopyById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string
): CharacterInventoryItem[] {
  const targetStack = findInventoryItemStackById(inventoryItems, stackId);

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
