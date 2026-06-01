import {
  CURRENCY_TYPE,
  type EquipmentCost,
  type WeaponDamage,
  type WeaponType
} from "../../codex/entries";
import type {
  Character,
  CharacterContainerContentItem,
  CharacterInventoryConjuredDuration,
  CharacterInventoryConjuredSource,
  CharacterInventoryFeatureTag,
  CharacterInventoryItem,
  CharacterInventoryStoredSpell,
  CharacterInventoryStoredSpellMode,
  CharacterReplicateMagicItemSlot,
  CharacterItemMods,
  CurrencyKey,
  ItemRecord
} from "../../types";
import { parseItemCost } from "../../utils/items/cost";
import { adaptItemWeapon, type AdaptedItemWeaponRecord } from "../../utils/items/adaptItemWeapon";
import type { HeldWeaponDescriptor } from "./inventory";
import {
  getEffectiveInventoryItemRecord,
  getItemModsCategory,
  normalizeCharacterItemMods
} from "./itemMods";
import {
  CONTAINER_OBJECT_LIMIT,
  INVENTORY_OBJECT_LIMIT,
  INVENTORY_REFILLABLE_LIMIT,
  INVENTORY_STACK_QUANTITY_LIMIT
} from "./inventoryLimits";
export {
  CONTAINER_OBJECT_LIMIT,
  INVENTORY_OBJECT_LIMIT,
  INVENTORY_REFILLABLE_LIMIT,
  INVENTORY_STACK_QUANTITY_LIMIT,
  ITEM_MOD_EFFECT_LIMIT
} from "./inventoryLimits";

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

export const BAG_OF_HOLDING_WEIGHT_LIMIT_LB = 500;

export type InventoryItemModsSaveResult = {
  inventoryItems: CharacterInventoryItem[];
  stackId: string | null;
};

export type InventoryItemSettingsSavePayload = {
  chargesTotal?: number | null;
  storedSpell?: CharacterInventoryStoredSpell;
  featureTags?: CharacterInventoryFeatureTag[];
  conjuredSource?: CharacterInventoryConjuredSource;
  conjuredDuration?: CharacterInventoryConjuredDuration;
  replicateMagicItemPlanKey?: string;
  replicateMagicItemSlot?: CharacterReplicateMagicItemSlot;
};

type InventoryFeatureTagLabelOptions = {
  excludeConjured?: boolean;
};

export type InventoryAddObjectTarget =
  | {
      kind: "root";
      item: ItemRecord;
      quantity?: number;
    }
  | {
      kind: "root-stack";
      stackId: string;
      quantity?: number;
    }
  | {
      kind: "new-root-stack";
      quantity?: number;
    }
  | {
      kind: "container-content";
      containerStackId: string;
      contentIndex: number;
      quantity?: number;
    };

export type ContainerContentMoveResult = {
  inventoryItems: CharacterInventoryItem[];
  stackId: string | null;
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
export const ITEM_CONTAINER_KEYS = [
  "srd-2024_backpack",
  "srd_backpack",
  "srd-2024_chest",
  "srd_chest",
  "srd-2024_bag-of-holding",
  "srd_bag-of-holding"
] as const;

const bagOfHoldingContainerKeys = new Set<string>([
  "srd-2024_bag-of-holding",
  "srd_bag-of-holding"
]);
const itemContainerKeySet = new Set<string>(ITEM_CONTAINER_KEYS);
const moddedItemKeyMarker = "-modded-";

export const INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE = "pact-of-the-blade";
export const INVENTORY_FEATURE_TAG_CONJURED = "conjured";
export const INVENTORY_CONJURED_SOURCE_MANUAL = "manual";
export const INVENTORY_CONJURED_SOURCE_EXPERIMENTAL_ELIXIR = "experimental-elixir";
export const INVENTORY_CONJURED_SOURCE_TINKERS_MAGIC = "tinkers-magic";
export const INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM = "replicate-magic-item";
export const INVENTORY_CONJURED_SOURCE_PACT_OF_THE_BLADE = "pact-of-the-blade";
export const INVENTORY_CONJURED_DURATION_DEATH = "death";
export const INVENTORY_CONJURED_DURATION_SHORT_REST = "short-rest";
export const INVENTORY_CONJURED_DURATION_LONG_REST = "long-rest";
export const INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_BASE = "base";
export const INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_ARMOR_REPLICATION = "armor-replication";
export const INVENTORY_STORED_SPELL_MODE_DEFAULT = "default";
export const INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES = "consume-charges";
export const INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE =
  "consume-charges-destructible";

const legacyInventoryFeatureTagReplicateMagicItem = "replicate-magic-item";

const inventoryFeatureTagLabels: Record<CharacterInventoryFeatureTag, string> = {
  [INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE]: "Pact of the Blade",
  [INVENTORY_FEATURE_TAG_CONJURED]: "Conjured"
};

const inventoryConjuredSourceLabels: Record<CharacterInventoryConjuredSource, string> = {
  [INVENTORY_CONJURED_SOURCE_MANUAL]: "Manual",
  [INVENTORY_CONJURED_SOURCE_EXPERIMENTAL_ELIXIR]: "Experimental Elixir",
  [INVENTORY_CONJURED_SOURCE_TINKERS_MAGIC]: "Tinker's Magic",
  [INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM]: "Replicate Magic Item",
  [INVENTORY_CONJURED_SOURCE_PACT_OF_THE_BLADE]: "Pact of the Blade"
};

const inventoryConjuredDurationLabels: Record<CharacterInventoryConjuredDuration, string> = {
  [INVENTORY_CONJURED_DURATION_DEATH]: "On Death",
  [INVENTORY_CONJURED_DURATION_SHORT_REST]: "Until Short Rest",
  [INVENTORY_CONJURED_DURATION_LONG_REST]: "Until Long Rest"
};

const inventoryFeatureTagOrder: CharacterInventoryFeatureTag[] = [
  INVENTORY_FEATURE_TAG_CONJURED,
  INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE
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

function normalizeStackNumber(
  value: unknown,
  fallback: number,
  min = 0,
  max?: number
): number {
  const parsedValue = Number(value);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : fallback;
  const normalizedValue = Math.max(min, Math.floor(safeValue));

  return max === undefined ? normalizedValue : Math.min(max, normalizedValue);
}

function normalizeInventoryStackQuantity(value: unknown, fallback: number, min = 0): number {
  return normalizeStackNumber(value, fallback, min, INVENTORY_STACK_QUANTITY_LIMIT);
}

function normalizeInventoryRefillableNumber(value: unknown, fallback: number, min = 0): number {
  return normalizeStackNumber(value, fallback, min, INVENTORY_REFILLABLE_LIMIT);
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

function hasLegacyReplicateMagicItemFeatureTag(value: unknown): boolean {
  return Array.isArray(value) && value.includes(legacyInventoryFeatureTagReplicateMagicItem);
}

function normalizeInventoryChargesTotal(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return normalizeInventoryRefillableNumber(value, 1, 1);
}

function normalizeInventoryStoredSpellMode(
  value: unknown
): CharacterInventoryStoredSpellMode | null {
  return value === INVENTORY_STORED_SPELL_MODE_DEFAULT ||
    value === INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES ||
    value === INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE
    ? value
    : null;
}

function normalizeInventoryStoredSpell(value: unknown): CharacterInventoryStoredSpell | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<CharacterInventoryStoredSpell>;
  const spellId = typeof record.spellId === "string" ? record.spellId.trim() : "";
  const mode = normalizeInventoryStoredSpellMode(record.mode);

  if (!spellId || !mode) {
    return undefined;
  }

  return {
    spellId,
    mode,
    chargeCost: normalizeInventoryRefillableNumber(record.chargeCost, 1, 1)
  };
}

function normalizeInventoryConjuredDuration(
  value: unknown
): CharacterInventoryConjuredDuration | undefined {
  return value === INVENTORY_CONJURED_DURATION_DEATH ||
    value === INVENTORY_CONJURED_DURATION_SHORT_REST ||
    value === INVENTORY_CONJURED_DURATION_LONG_REST
    ? value
    : undefined;
}

function normalizeInventoryConjuredSource(
  value: unknown
): CharacterInventoryConjuredSource | undefined {
  return value === INVENTORY_CONJURED_SOURCE_MANUAL ||
    value === INVENTORY_CONJURED_SOURCE_EXPERIMENTAL_ELIXIR ||
    value === INVENTORY_CONJURED_SOURCE_TINKERS_MAGIC ||
    value === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM ||
    value === INVENTORY_CONJURED_SOURCE_PACT_OF_THE_BLADE
    ? value
    : undefined;
}

function normalizeInventoryConjuredSourceForFeatureTags(
  value: unknown,
  featureTags: unknown
): CharacterInventoryConjuredSource | undefined {
  const normalizedFeatureTags = normalizeInventoryFeatureTags(featureTags);

  if (!normalizedFeatureTags?.includes(INVENTORY_FEATURE_TAG_CONJURED)) {
    return undefined;
  }

  return (
    normalizeInventoryConjuredSource(value) ??
    (hasLegacyReplicateMagicItemFeatureTag(featureTags)
      ? INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
      : undefined)
  );
}

function normalizeReplicateMagicItemPlanKey(value: unknown): string | undefined {
  const planKey = typeof value === "string" ? value.trim() : "";

  return planKey.length > 0 ? planKey : undefined;
}

function normalizeReplicateMagicItemSlot(value: unknown): CharacterReplicateMagicItemSlot {
  return value === INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_ARMOR_REPLICATION
    ? INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_ARMOR_REPLICATION
    : INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_BASE;
}

function hasInventoryItemExplicitSettings(
  entry: Pick<CharacterInventoryItem, "chargesTotal" | "storedSpell"> | null | undefined
): boolean {
  return (
    normalizeInventoryChargesTotal(entry?.chargesTotal) !== undefined ||
    normalizeInventoryStoredSpell(entry?.storedSpell) !== undefined
  );
}

export function isItemContainerRecord(item: ItemRecord | null | undefined): boolean {
  const key = getItemRecordKey(item);

  return itemContainerKeySet.has(key) || Array.isArray(item?.containerContents);
}

export function isInventoryContainerItem(
  entry: Pick<CharacterInventoryItem, "item"> | null | undefined
): boolean {
  return isItemContainerRecord(entry?.item);
}

export function isBagOfHoldingItemRecord(item: ItemRecord | null | undefined): boolean {
  return bagOfHoldingContainerKeys.has(getItemRecordKey(item));
}

export function isBagOfHoldingInventoryItem(
  entry: Pick<CharacterInventoryItem, "item"> | null | undefined
): boolean {
  return isBagOfHoldingItemRecord(entry?.item);
}

function getContainerContentStackKey(entry: CharacterContainerContentItem, index: number): string {
  const featureTags = normalizeInventoryFeatureTags(entry.featureTags);
  const chargesTotal = normalizeInventoryChargesTotal(entry.chargesTotal);
  const storedSpell = normalizeInventoryStoredSpell(entry.storedSpell);
  const isSimpleStack =
    !entry.attuned &&
    !entry.mods &&
    entry.usesRemaining === undefined &&
    chargesTotal === undefined &&
    storedSpell === undefined &&
    !entry.conjuredSource &&
    !entry.conjuredDuration &&
    (featureTags?.length ?? 0) === 0;

  return isSimpleStack ? `item:${getItemRecordKey(entry.item)}` : `unique:${index}`;
}

function normalizeContainerContentItem(
  entry: CharacterContainerContentItem
): CharacterContainerContentItem {
  const mods = normalizeCharacterItemMods(entry.mods);
  const chargesTotal = normalizeInventoryChargesTotal(entry.chargesTotal);
  const storedSpell = normalizeInventoryStoredSpell(entry.storedSpell);
  const hasExplicitSettings = chargesTotal !== undefined || storedSpell !== undefined;
  const quantity = hasExplicitSettings ? 1 : normalizeInventoryStackQuantity(entry.quantity, 1, 1);
  const effectiveItem = getEffectiveInventoryItemRecord({
    id: "container-content",
    item: entry.item,
    quantity,
    onHandQuantity: 0,
    worn: false,
    ...(mods ? { mods } : {})
  });
  let featureTags = normalizeInventoryFeatureTags(entry.featureTags);

  if (featureTags?.includes(INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE) && !effectiveItem.weapon) {
    featureTags = featureTags.filter((tag) => tag !== INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE);
    featureTags = featureTags.length > 0 ? featureTags : undefined;
  }

  const conjuredSource = normalizeInventoryConjuredSourceForFeatureTags(
    entry.conjuredSource,
    featureTags
  );
  const conjuredDuration = featureTags?.includes(INVENTORY_FEATURE_TAG_CONJURED)
    ? normalizeInventoryConjuredDuration(entry.conjuredDuration)
    : undefined;
  const replicateMagicItemPlanKey =
    conjuredSource === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
      ? normalizeReplicateMagicItemPlanKey(entry.replicateMagicItemPlanKey)
      : undefined;
  const replicateMagicItemSlot =
    conjuredSource === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
      ? normalizeReplicateMagicItemSlot(entry.replicateMagicItemSlot)
      : undefined;
  const normalizedEntry: CharacterContainerContentItem = {
    item: entry.item,
    quantity,
    featureTags,
    ...(chargesTotal !== undefined ? { chargesTotal } : {}),
    ...(storedSpell ? { storedSpell } : {}),
    ...(conjuredSource ? { conjuredSource } : {}),
    ...(conjuredDuration ? { conjuredDuration } : {}),
    ...(replicateMagicItemPlanKey ? { replicateMagicItemPlanKey } : {}),
    ...(replicateMagicItemSlot ? { replicateMagicItemSlot } : {}),
    ...(mods ? { mods } : {})
  };
  const useTotal = getInventoryItemUseTotalForValues(entry.item, quantity, chargesTotal);

  if (isInventoryItemAttunable(effectiveItem)) {
    normalizedEntry.attuned = Boolean(entry.attuned);
  }

  if (useTotal !== null) {
    normalizedEntry.usesRemaining = Math.min(
      useTotal,
      normalizeInventoryRefillableNumber(entry.usesRemaining, useTotal)
    );
  }

  return normalizedEntry;
}

function normalizeCharacterContainerContentItems(value: unknown): CharacterContainerContentItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const contentsByMergeKey = new Map<string, CharacterContainerContentItem>();

  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const record = entry as Partial<CharacterContainerContentItem> & {
      quantity?: unknown;
      attuned?: unknown;
      usesRemaining?: unknown;
      chargesTotal?: unknown;
      storedSpell?: unknown;
      featureTags?: unknown;
      conjuredSource?: unknown;
      conjuredDuration?: unknown;
      replicateMagicItemPlanKey?: unknown;
      replicateMagicItemSlot?: unknown;
      mods?: unknown;
    };
    const item = normalizeItemRecord(record.item);

    if (!item || isItemContainerRecord(item)) {
      return;
    }

    const featureTags = normalizeInventoryFeatureTags(record.featureTags);
    const contentItem = normalizeContainerContentItem({
      item,
      quantity: record.quantity !== undefined ? normalizeInventoryStackQuantity(record.quantity, 1, 1) : 1,
      attuned: normalizeBoolean(record.attuned),
      usesRemaining:
        record.usesRemaining !== undefined
          ? normalizeInventoryRefillableNumber(record.usesRemaining, 0)
          : undefined,
      chargesTotal: normalizeInventoryChargesTotal(record.chargesTotal),
      storedSpell: normalizeInventoryStoredSpell(record.storedSpell),
      featureTags,
      conjuredSource: normalizeInventoryConjuredSourceForFeatureTags(
        record.conjuredSource,
        record.featureTags
      ),
      conjuredDuration: normalizeInventoryConjuredDuration(record.conjuredDuration),
      replicateMagicItemPlanKey: normalizeReplicateMagicItemPlanKey(
        record.replicateMagicItemPlanKey
      ),
      replicateMagicItemSlot: normalizeReplicateMagicItemSlot(record.replicateMagicItemSlot),
      mods: normalizeCharacterItemMods(record.mods)
    });
    const mergeKey = getContainerContentStackKey(contentItem, index);
    const existingContent = contentsByMergeKey.get(mergeKey);

    if (!existingContent) {
      contentsByMergeKey.set(mergeKey, contentItem);
      return;
    }

    contentsByMergeKey.set(
      mergeKey,
      normalizeContainerContentItem({
        ...existingContent,
        quantity: existingContent.quantity + contentItem.quantity,
        usesRemaining: getMergedContainerContentUsesRemaining(existingContent, contentItem)
      })
    );
  });

  return [...contentsByMergeKey.values()].slice(0, CONTAINER_OBJECT_LIMIT);
}

function trimInventoryItemsToObjectLimit(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  const trimmedInventoryItems: CharacterInventoryItem[] = [];
  let objectCount = 0;

  for (const entry of inventoryItems) {
    if (objectCount >= INVENTORY_OBJECT_LIMIT) {
      break;
    }

    const remainingContentSlots = INVENTORY_OBJECT_LIMIT - objectCount - 1;

    if (remainingContentSlots < 0) {
      break;
    }

    if (!isInventoryContainerItem(entry)) {
      trimmedInventoryItems.push(entry);
      objectCount += 1;
      continue;
    }

    const containerContents = getInventoryContainerContents(entry).slice(
      0,
      Math.min(CONTAINER_OBJECT_LIMIT, remainingContentSlots)
    );

    trimmedInventoryItems.push({
      ...entry,
      containerContents
    });
    objectCount += 1 + containerContents.length;
  }

  return trimmedInventoryItems;
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
  const isContainer = isInventoryContainerItem(entry);
  const mods = normalizeCharacterItemMods(entry.mods);
  const chargesTotal = normalizeInventoryChargesTotal(entry.chargesTotal);
  const storedSpell = normalizeInventoryStoredSpell(entry.storedSpell);
  const hasExplicitSettings = chargesTotal !== undefined || storedSpell !== undefined;
  const isUniqueStack = isContainer || Boolean(mods) || hasExplicitSettings;
  const quantity = isUniqueStack ? 1 : normalizeInventoryStackQuantity(entry.quantity, 1, 1);
  const onHandQuantity = Math.min(
    quantity,
    normalizeInventoryStackQuantity(entry.onHandQuantity, 0)
  );
  const effectiveItem = getEffectiveInventoryItemRecord({ ...entry, mods });
  const item =
    mods && !mods.isCustom && !isContainer
      ? createModdedInventoryItemRecord(
          {
            ...entry.item,
            key: getUnmoddedInventoryItemKey(entry.item)
          },
          entry.id
        )
      : entry.item;
  let featureTags = normalizeInventoryFeatureTags(entry.featureTags);

  if (featureTags?.includes(INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE) && !effectiveItem.weapon) {
    featureTags = featureTags.filter((tag) => tag !== INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE);
    featureTags = featureTags.length > 0 ? featureTags : undefined;
  }

  const conjuredSource = normalizeInventoryConjuredSourceForFeatureTags(
    entry.conjuredSource,
    featureTags
  );
  const conjuredDuration = featureTags?.includes(INVENTORY_FEATURE_TAG_CONJURED)
    ? normalizeInventoryConjuredDuration(entry.conjuredDuration)
    : undefined;
  const replicateMagicItemPlanKey =
    conjuredSource === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
      ? normalizeReplicateMagicItemPlanKey(entry.replicateMagicItemPlanKey)
      : undefined;
  const replicateMagicItemSlot =
    conjuredSource === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
      ? normalizeReplicateMagicItemSlot(entry.replicateMagicItemSlot)
      : undefined;
  const containerContents = isContainer
    ? normalizeCharacterContainerContentItems(entry.containerContents)
    : undefined;
  const normalizedStack: CharacterInventoryItem = {
    id: entry.id,
    item,
    quantity,
    onHandQuantity,
    worn: Boolean(entry.worn),
    featureTags,
    ...(chargesTotal !== undefined ? { chargesTotal } : {}),
    ...(storedSpell ? { storedSpell } : {}),
    ...(conjuredSource ? { conjuredSource } : {}),
    ...(conjuredDuration ? { conjuredDuration } : {}),
    ...(replicateMagicItemPlanKey ? { replicateMagicItemPlanKey } : {}),
    ...(replicateMagicItemSlot ? { replicateMagicItemSlot } : {}),
    ...(mods ? { mods } : {}),
    ...(isContainer ? { containerContents: containerContents ?? [] } : {})
  };
  const useTotal = getInventoryItemUseTotalForValues(entry.item, quantity, chargesTotal);

  if (isInventoryItemAttunable(effectiveItem)) {
    normalizedStack.attuned = Boolean(entry.attuned);
  }

  if (useTotal !== null) {
    normalizedStack.usesRemaining = Math.min(
      useTotal,
      normalizeInventoryRefillableNumber(entry.usesRemaining, useTotal)
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

  for (
    let index = onHandQuantity;
    index < quantity && copyIndexes.length < requestedCount;
    index += 1
  ) {
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
    chargesTotal?: number | null;
    storedSpell?: CharacterInventoryStoredSpell;
    featureTags?: CharacterInventoryFeatureTag[];
    conjuredSource?: CharacterInventoryConjuredSource;
    conjuredDuration?: CharacterInventoryConjuredDuration;
    replicateMagicItemPlanKey?: string;
    replicateMagicItemSlot?: CharacterReplicateMagicItemSlot;
    mods?: CharacterItemMods;
    containerContents?: CharacterContainerContentItem[];
  }
): CharacterInventoryItem {
  const quantity = normalizeInventoryStackQuantity(options?.quantity, 1, 1);
  const onHandQuantity =
    options?.onHandQuantity !== undefined
      ? normalizeInventoryStackQuantity(options.onHandQuantity, 0)
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
    chargesTotal: options?.chargesTotal,
    storedSpell: options?.storedSpell,
    featureTags: options?.featureTags,
    conjuredSource: options?.conjuredSource,
    conjuredDuration: options?.conjuredDuration,
    replicateMagicItemPlanKey: options?.replicateMagicItemPlanKey,
    replicateMagicItemSlot: options?.replicateMagicItemSlot,
    mods: options?.mods,
    containerContents: options?.containerContents
  });
}

export function createCharacterContainerContentItem(
  item: ItemRecord,
  options?: {
    quantity?: number;
    attuned?: boolean;
    usesRemaining?: number;
    chargesTotal?: number | null;
    storedSpell?: CharacterInventoryStoredSpell;
    featureTags?: CharacterInventoryFeatureTag[];
    conjuredSource?: CharacterInventoryConjuredSource;
    conjuredDuration?: CharacterInventoryConjuredDuration;
    replicateMagicItemPlanKey?: string;
    replicateMagicItemSlot?: CharacterReplicateMagicItemSlot;
    mods?: CharacterItemMods;
  }
): CharacterContainerContentItem | null {
  if (!item.key || isItemContainerRecord(item)) {
    return null;
  }

  return normalizeContainerContentItem({
    item,
    quantity: normalizeInventoryStackQuantity(options?.quantity, 1, 1),
    attuned: Boolean(options?.attuned),
    usesRemaining: options?.usesRemaining,
    chargesTotal: options?.chargesTotal,
    storedSpell: options?.storedSpell,
    featureTags: options?.featureTags,
    conjuredSource: options?.conjuredSource,
    conjuredDuration: options?.conjuredDuration,
    replicateMagicItemPlanKey: options?.replicateMagicItemPlanKey,
    replicateMagicItemSlot: options?.replicateMagicItemSlot,
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
      chargesTotal?: unknown;
      storedSpell?: unknown;
      featureTags?: unknown;
      conjuredSource?: unknown;
      conjuredDuration?: unknown;
      replicateMagicItemPlanKey?: unknown;
      replicateMagicItemSlot?: unknown;
      mods?: unknown;
      containerContents?: unknown;
    };
    const item = normalizeItemRecord(record.item);

    if (!item) {
      return;
    }

    const key = getItemRecordKey(item);
    const isContainer = isItemContainerRecord(item);
    const mods = normalizeCharacterItemMods(record.mods);
    const chargesTotal = normalizeInventoryChargesTotal(record.chargesTotal);
    const storedSpell = normalizeInventoryStoredSpell(record.storedSpell);
    const isUniqueStack = isContainer || Boolean(mods) || chargesTotal !== undefined || storedSpell !== undefined;
    const quantity =
      record.quantity !== undefined ? normalizeInventoryStackQuantity(record.quantity, 1, 1) : 1;
    const onHandQuantity =
      record.onHandQuantity !== undefined
        ? normalizeInventoryStackQuantity(record.onHandQuantity, 0)
        : normalizeBoolean(record.onHand)
          ? 1
          : 0;
    const splitCount = isUniqueStack ? quantity : 1;
    const featureTags = normalizeInventoryFeatureTags(record.featureTags);
    const conjuredSource = normalizeInventoryConjuredSourceForFeatureTags(
      record.conjuredSource,
      record.featureTags
    );

    for (let copyIndex = 0; copyIndex < splitCount; copyIndex += 1) {
      const stack = createCharacterInventoryItem(item, {
        id: copyIndex === 0 && typeof record.id === "string" ? record.id : undefined,
        quantity: isUniqueStack ? 1 : quantity,
        onHandQuantity: isUniqueStack ? (copyIndex < onHandQuantity ? 1 : 0) : onHandQuantity,
        worn: !isUniqueStack || copyIndex === 0 ? normalizeBoolean(record.worn) : false,
        attuned: !isUniqueStack || copyIndex === 0 ? normalizeBoolean(record.attuned) : false,
        usesRemaining:
          record.usesRemaining !== undefined
            ? normalizeInventoryRefillableNumber(record.usesRemaining, 0)
            : undefined,
        chargesTotal,
        storedSpell,
        featureTags,
        conjuredSource,
        conjuredDuration: normalizeInventoryConjuredDuration(record.conjuredDuration),
        replicateMagicItemPlanKey: normalizeReplicateMagicItemPlanKey(
          record.replicateMagicItemPlanKey
        ),
        replicateMagicItemSlot: normalizeReplicateMagicItemSlot(record.replicateMagicItemSlot),
        mods,
        containerContents:
          isContainer && copyIndex === 0
            ? normalizeCharacterContainerContentItems(record.containerContents)
            : undefined
      });
      const stackHasFeatureTags = (stack.featureTags?.length ?? 0) > 0;
      const mergeKey = isUniqueStack
        ? `unique:${stack.id}:${index}:${copyIndex}`
        : stackHasFeatureTags
          ? `tagged:${stack.id}:${index}`
          : `item:${key}`;
      const existingStack = stacksByMergeKey.get(mergeKey);

      if (!existingStack) {
        stacksByMergeKey.set(mergeKey, stack);
        continue;
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
    }
  });

  return trimInventoryItemsToObjectLimit(
    [...stacksByMergeKey.values()].map(normalizeInventoryStack)
  );
}

export function getItemRecordKey(item: ItemRecord | null | undefined): string {
  return typeof item?.key === "string" ? item.key : "";
}

export function getItemRecordName(item: ItemRecord | null | undefined): string {
  return typeof item?.name === "string" ? item.name : "Unknown Item";
}

export function getInventoryItemQuantity(entry: CharacterInventoryItem): number {
  return normalizeInventoryStackQuantity(entry.quantity, 1, 1);
}

export function getInventoryItemOnHandQuantity(entry: CharacterInventoryItem): number {
  return Math.min(
    getInventoryItemQuantity(entry),
    normalizeInventoryStackQuantity(entry.onHandQuantity, 0)
  );
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

  return usesPerCopy ? Math.min(INVENTORY_REFILLABLE_LIMIT, usesPerCopy) : null;
}

export function getDefaultInventoryItemChargesTotal(
  item: ItemRecord | null | undefined
): number | null {
  return getInventoryItemUsesPerCopy(item);
}

export function getInventoryItemExplicitChargesTotal(
  entry: Pick<CharacterInventoryItem, "chargesTotal"> | null | undefined
): number | null | undefined {
  return normalizeInventoryChargesTotal(entry?.chargesTotal);
}

function getInventoryItemUseTotalForValues(
  item: ItemRecord | null | undefined,
  quantity: number,
  chargesTotal: number | null | undefined
): number | null {
  if (chargesTotal === null) {
    return null;
  }

  if (chargesTotal !== undefined) {
    return Math.min(INVENTORY_REFILLABLE_LIMIT, chargesTotal);
  }

  const usesPerCopy = getInventoryItemUsesPerCopy(item);

  return usesPerCopy === null
    ? null
    : Math.min(INVENTORY_REFILLABLE_LIMIT, quantity * usesPerCopy);
}

function getInventoryItemUseTotal(entry: CharacterInventoryItem): number | null {
  const chargesTotal = normalizeInventoryChargesTotal(entry.chargesTotal);

  return getInventoryItemUseTotalForValues(entry.item, getInventoryItemQuantity(entry), chargesTotal);
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
    remaining: Math.min(total, normalizeInventoryRefillableNumber(entry.usesRemaining, total)),
    total
  };
}

export function getInventoryItemStoredSpell(
  entry: Pick<CharacterInventoryItem, "storedSpell"> | null | undefined
): CharacterInventoryStoredSpell | null {
  return normalizeInventoryStoredSpell(entry?.storedSpell) ?? null;
}

function getContainerContentUseState(
  entry: CharacterContainerContentItem | null | undefined
): InventoryItemUseState | null {
  if (!entry) {
    return null;
  }

  const total = getInventoryItemUseTotalForValues(
    entry.item,
    getInventoryItemQuantity(entry as CharacterInventoryItem),
    normalizeInventoryChargesTotal(entry.chargesTotal)
  );

  if (total === null) {
    return null;
  }

  return {
    remaining: Math.min(total, normalizeInventoryRefillableNumber(entry.usesRemaining, total)),
    total
  };
}

function getMergedContainerContentUsesRemaining(
  firstStack: CharacterContainerContentItem,
  secondStack: CharacterContainerContentItem
): number | undefined {
  const firstUseState = getContainerContentUseState(firstStack);
  const secondUseState = getContainerContentUseState(secondStack);

  if (!firstUseState || !secondUseState) {
    return undefined;
  }

  return Math.min(
    firstUseState.total + secondUseState.total,
    firstUseState.remaining + secondUseState.remaining
  );
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

export function getInventoryContainerContents(
  entry: Pick<CharacterInventoryItem, "item" | "containerContents"> | null | undefined
): CharacterContainerContentItem[] {
  if (!entry || !isItemContainerRecord(entry.item)) {
    return [];
  }

  return normalizeCharacterContainerContentItems(entry.containerContents);
}

export function getInventoryContainerContentCount(
  entry: Pick<CharacterInventoryItem, "item" | "containerContents"> | null | undefined
): number {
  return getInventoryContainerContents(entry).reduce(
    (totalCount, content) => totalCount + normalizeInventoryStackQuantity(content.quantity, 0),
    0
  );
}

export function hasInventoryContainerContents(
  entry: Pick<CharacterInventoryItem, "item" | "containerContents"> | null | undefined
): boolean {
  return getInventoryContainerContentCount(entry) > 0;
}

export function getInventoryObjectCount(inventoryItems: CharacterInventoryItem[]): number {
  return inventoryItems.reduce(
    (count, entry) => count + 1 + getInventoryContainerContents(entry).length,
    0
  );
}

function getInventoryAddObjectDelta(
  inventoryItems: CharacterInventoryItem[],
  target: InventoryAddObjectTarget
): number {
  const quantity = normalizeInventoryStackQuantity(target.quantity, 1, 1);

  if (target.kind === "root-stack") {
    return findInventoryItemStackById(inventoryItems, target.stackId) ? 0 : 1;
  }

  if (target.kind === "new-root-stack") {
    return 1;
  }

  if (target.kind === "container-content") {
    const content = getInventoryContainerContentByIndex(
      inventoryItems,
      target.containerStackId,
      target.contentIndex
    );

    if (!content) {
      return 1;
    }

    return getContainerContentStackKey(content, target.contentIndex).startsWith("unique:") ? 1 : 0;
  }

  if (isItemContainerRecord(target.item)) {
    return quantity;
  }

  if (getDefaultInventoryItemChargesTotal(target.item) !== null) {
    return quantity;
  }

  const itemKey = getItemRecordKey(target.item);

  if (!itemKey) {
    return 1;
  }

  return findUntaggedInventoryItemStackByKey(inventoryItems, itemKey) ? 0 : 1;
}

export function canAddInventoryObject(
  inventoryItems: CharacterInventoryItem[],
  target: InventoryAddObjectTarget
): boolean {
  const isWithinObjectLimit =
    getInventoryObjectCount(inventoryItems) + getInventoryAddObjectDelta(inventoryItems, target) <=
    INVENTORY_OBJECT_LIMIT;

  if (!isWithinObjectLimit) {
    return false;
  }

  if (target.kind === "container-content") {
    return canAddOneContainerContentItemCopyByIndex(
      inventoryItems,
      target.containerStackId,
      target.contentIndex
    );
  }

  return true;
}

export function getInventoryContainerContentByIndex(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number
): CharacterContainerContentItem | null {
  const containerStack = findInventoryItemStackById(inventoryItems, containerStackId);

  if (!containerStack || !isInventoryContainerItem(containerStack)) {
    return null;
  }

  return getInventoryContainerContents(containerStack)[contentIndex] ?? null;
}

export function createInventoryItemFromContainerContent(
  containerStackId: string,
  content: CharacterContainerContentItem,
  index: number
): CharacterInventoryItem {
  return createCharacterInventoryItem(content.item, {
    id: `${containerStackId}:content:${index}`,
    quantity: content.quantity,
    attuned: content.attuned,
    usesRemaining: content.usesRemaining,
    chargesTotal: content.chargesTotal,
    storedSpell: content.storedSpell,
    featureTags: content.featureTags,
    conjuredSource: content.conjuredSource,
    conjuredDuration: content.conjuredDuration,
    replicateMagicItemPlanKey: content.replicateMagicItemPlanKey,
    replicateMagicItemSlot: content.replicateMagicItemSlot,
    mods: content.mods
  });
}

export function createInventoryItemsWithContainerContents(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  return inventoryItems.flatMap((entry) => [
    entry,
    ...getInventoryContainerContents(entry).map((content, index) =>
      createInventoryItemFromContainerContent(entry.id, content, index)
    )
  ]);
}

export function getInventoryAttunementCount(inventoryItems: CharacterInventoryItem[]): number {
  return createInventoryItemsWithContainerContents(inventoryItems).filter(
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
        !normalizeCharacterItemMods(entry.mods) &&
        !hasInventoryItemExplicitSettings(entry) &&
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

export function isReplicateMagicItemInventoryItem(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredSource"> | null | undefined
): boolean {
  return (
    getInventoryItemConjuredSource(entry) === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM ||
    (isConjuredInventoryItem(entry) && hasLegacyReplicateMagicItemFeatureTag(entry?.featureTags))
  );
}

export function getInventoryItemConjuredDuration(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredDuration"> | null | undefined
): CharacterInventoryConjuredDuration | undefined {
  if (!isConjuredInventoryItem(entry)) {
    return undefined;
  }

  return normalizeInventoryConjuredDuration(entry?.conjuredDuration);
}

export function getInventoryItemConjuredSource(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredSource"> | null | undefined
): CharacterInventoryConjuredSource | undefined {
  if (!isConjuredInventoryItem(entry)) {
    return undefined;
  }

  return normalizeInventoryConjuredSource(entry?.conjuredSource);
}

export function isLongRestConjuredInventoryItem(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredDuration"> | null | undefined
): boolean {
  return getInventoryItemConjuredDuration(entry) === INVENTORY_CONJURED_DURATION_LONG_REST;
}

export function isShortRestConjuredInventoryItem(
  entry: Pick<CharacterInventoryItem, "featureTags" | "conjuredDuration"> | null | undefined
): boolean {
  return getInventoryItemConjuredDuration(entry) === INVENTORY_CONJURED_DURATION_SHORT_REST;
}

export function getInventoryItemConjuredFeatureTagLabel(
  entry:
    | Pick<CharacterInventoryItem, "featureTags" | "conjuredSource" | "conjuredDuration">
    | null
    | undefined
): string | null {
  if (!isConjuredInventoryItem(entry)) {
    return null;
  }

  const source = getInventoryItemConjuredSource(entry);
  const duration = getInventoryItemConjuredDuration(entry);
  const detailParts = [
    source ? `from ${inventoryConjuredSourceLabels[source]}` : null,
    duration ? inventoryConjuredDurationLabels[duration] : null
  ].filter(Boolean);

  return detailParts.length > 0
    ? `Conjured: ${detailParts.join(" | ")}`
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
  entry:
    | Pick<CharacterInventoryItem, "featureTags" | "conjuredSource" | "conjuredDuration">
    | null
    | undefined,
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
  return createInventoryItemsWithContainerContents(inventoryItems).some(
    isLongRestConjuredInventoryItem
  );
}

export function hasShortRestConjuredInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): boolean {
  return createInventoryItemsWithContainerContents(inventoryItems).some(
    isShortRestConjuredInventoryItem
  );
}

export function removeConjuredInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  const nextInventoryItems = inventoryItems
    .filter((entry) => !isConjuredInventoryItem(entry))
    .map((entry) =>
      isInventoryContainerItem(entry)
        ? normalizeInventoryStack({
            ...entry,
            containerContents: getInventoryContainerContents(entry).filter(
              (content) => !isConjuredInventoryItem(content)
            )
          })
        : entry
    );

  return nextInventoryItems.length === inventoryItems.length &&
    nextInventoryItems.every((entry, index) => entry === inventoryItems[index])
    ? inventoryItems
    : nextInventoryItems;
}

export function removeLongRestConjuredInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  const nextInventoryItems = inventoryItems
    .filter((entry) => !isLongRestConjuredInventoryItem(entry))
    .map((entry) =>
      isInventoryContainerItem(entry)
        ? normalizeInventoryStack({
            ...entry,
            containerContents: getInventoryContainerContents(entry).filter(
              (content) => !isLongRestConjuredInventoryItem(content)
            )
          })
        : entry
    );

  return nextInventoryItems.length === inventoryItems.length &&
    nextInventoryItems.every((entry, index) => entry === inventoryItems[index])
    ? inventoryItems
    : nextInventoryItems;
}

export function removeShortRestConjuredInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  const nextInventoryItems = inventoryItems
    .filter((entry) => !isShortRestConjuredInventoryItem(entry))
    .map((entry) =>
      isInventoryContainerItem(entry)
        ? normalizeInventoryStack({
            ...entry,
            containerContents: getInventoryContainerContents(entry).filter(
              (content) => !isShortRestConjuredInventoryItem(content)
            )
          })
        : entry
    );

  return nextInventoryItems.length === inventoryItems.length &&
    nextInventoryItems.every((entry, index) => entry === inventoryItems[index])
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
    entry.id === resolvedStackId && getEffectiveInventoryItemRecord(entry).weapon
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
      featureTags: [INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE, INVENTORY_FEATURE_TAG_CONJURED],
      conjuredSource: INVENTORY_CONJURED_SOURCE_PACT_OF_THE_BLADE
    })
  ];
}

export function addConjuredInventoryItemCopies(
  inventoryItems: CharacterInventoryItem[],
  item: ItemRecord,
  quantity = 1,
  options?: {
    conjuredSource?: CharacterInventoryConjuredSource;
    conjuredDuration?: CharacterInventoryConjuredDuration;
  }
): CharacterInventoryItem[] {
  const normalizedQuantity = normalizeInventoryStackQuantity(quantity, 0);

  if (!item.key || normalizedQuantity === 0) {
    return inventoryItems;
  }

  const defaultChargesTotal = getDefaultInventoryItemChargesTotal(item);

  if (defaultChargesTotal !== null) {
    return [
      ...inventoryItems,
      ...Array.from({ length: normalizedQuantity }, () =>
        createCharacterInventoryItem(item, {
          quantity: 1,
          chargesTotal: defaultChargesTotal,
          featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
          conjuredSource: options?.conjuredSource,
          conjuredDuration: options?.conjuredDuration
        })
      )
    ];
  }

  return [
    ...inventoryItems,
    createCharacterInventoryItem(item, {
      quantity: normalizedQuantity,
      featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
      conjuredSource: options?.conjuredSource,
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

function getSavedInventoryItemFeatureTags(
  entry: CharacterInventoryItem,
  mods: CharacterItemMods
): CharacterInventoryFeatureTag[] | undefined {
  return getSavedInventoryFeatureTagsForMods(entry.featureTags, mods);
}

function getSavedInventoryFeatureTagsForMods(
  featureTags: CharacterInventoryFeatureTag[] | undefined,
  mods: CharacterItemMods
): CharacterInventoryFeatureTag[] | undefined {
  if (mods.baseCategory === "weapon") {
    return normalizeInventoryFeatureTags(featureTags);
  }

  const nextTags = (normalizeInventoryFeatureTags(featureTags) ?? []).filter(
    (tag) => tag !== INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE
  );

  return nextTags.length > 0 ? nextTags : undefined;
}

function getInventoryItemModsForSave(
  entry: CharacterInventoryItem,
  mods: CharacterItemMods
): CharacterItemMods {
  const currentCategory = getItemModsCategory(entry);
  const locksArchetype =
    isInventoryContainerItem(entry) ||
    isPactOfTheBladeInventoryItem(entry) ||
    isItemEquipmentPackRecord(entry.item) ||
    isItemEquipmentPackRecord(getEffectiveInventoryItemRecord(entry));

  if (!locksArchetype || mods.baseCategory === currentCategory) {
    return mods;
  }

  return normalizeCharacterItemMods({
    ...mods,
    baseCategory: currentCategory
  }) ?? mods;
}

function didInventoryItemBaseArchetypeChange(
  entry: CharacterInventoryItem,
  mods: CharacterItemMods
): boolean {
  return getItemModsCategory(entry) !== mods.baseCategory;
}

function getMovedInventoryItemUsesRemaining(entry: CharacterInventoryItem): number | undefined {
  const useState = getInventoryItemUseState(entry);
  const chargesTotal = normalizeInventoryChargesTotal(entry.chargesTotal);

  if (!useState) {
    return undefined;
  }

  if (chargesTotal !== undefined) {
    return useState.remaining;
  }

  const usesPerCopy = getInventoryItemUsesPerCopy(entry.item);

  if (usesPerCopy === null) {
    return undefined;
  }

  return Math.min(usesPerCopy, useState.remaining);
}

function createContainerContentItemFromInventoryStack(
  entry: CharacterInventoryItem
): CharacterContainerContentItem | null {
  return createCharacterContainerContentItem(entry.item, {
    quantity: 1,
    attuned: entry.attuned,
    usesRemaining: getMovedInventoryItemUsesRemaining(entry),
    chargesTotal: entry.chargesTotal,
    storedSpell: entry.storedSpell,
    featureTags: entry.featureTags,
    conjuredSource: entry.conjuredSource,
    conjuredDuration: entry.conjuredDuration,
    replicateMagicItemPlanKey: entry.replicateMagicItemPlanKey,
    replicateMagicItemSlot: entry.replicateMagicItemSlot,
    mods: entry.mods
  });
}

function getInventoryItemSettingsForSave(
  entry: CharacterInventoryItem,
  mods: CharacterItemMods,
  settings?: InventoryItemSettingsSavePayload
): InventoryItemSettingsSavePayload {
  const featureTags = settings
    ? getSavedInventoryFeatureTagsForMods(settings.featureTags, mods)
    : getSavedInventoryItemFeatureTags(entry, mods);
  const isConjured = featureTags?.includes(INVENTORY_FEATURE_TAG_CONJURED) === true;

  return {
    chargesTotal: settings ? settings.chargesTotal : entry.chargesTotal,
    storedSpell: settings ? settings.storedSpell : entry.storedSpell,
    featureTags,
    conjuredSource: isConjured ? (settings ? settings.conjuredSource : entry.conjuredSource) : undefined,
    conjuredDuration: isConjured
      ? (settings ? settings.conjuredDuration : entry.conjuredDuration)
      : undefined,
    replicateMagicItemPlanKey:
      isConjured && entry.conjuredSource === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
        ? entry.replicateMagicItemPlanKey
        : undefined,
    replicateMagicItemSlot:
      isConjured && entry.conjuredSource === INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
        ? entry.replicateMagicItemSlot
        : undefined
  };
}

function updateInventoryItemModsInPlace(
  entry: CharacterInventoryItem,
  item: ItemRecord,
  mods: CharacterItemMods,
  didChangeBaseArchetype: boolean,
  settings?: InventoryItemSettingsSavePayload
): CharacterInventoryItem {
  const savedSettings = getInventoryItemSettingsForSave(entry, mods, settings);

  return createCharacterInventoryItem(mods.isCustom ? item : entry.item, {
    id: entry.id,
    quantity: entry.quantity,
    onHandQuantity: didChangeBaseArchetype ? 0 : entry.onHandQuantity,
    worn: didChangeBaseArchetype ? false : entry.worn,
    attuned: mods.requiresAttunement ? entry.attuned : false,
    usesRemaining: entry.usesRemaining,
    chargesTotal: savedSettings.chargesTotal,
    storedSpell: savedSettings.storedSpell,
    featureTags: savedSettings.featureTags,
    conjuredSource: savedSettings.conjuredSource,
    conjuredDuration: savedSettings.conjuredDuration,
    replicateMagicItemPlanKey: savedSettings.replicateMagicItemPlanKey,
    replicateMagicItemSlot: savedSettings.replicateMagicItemSlot,
    mods,
    containerContents: entry.containerContents
  });
}

function transformInventoryItemCopyWithMods(
  entry: CharacterInventoryItem,
  item: ItemRecord,
  mods: CharacterItemMods,
  didChangeBaseArchetype: boolean,
  settings?: InventoryItemSettingsSavePayload
): CharacterInventoryItem[] {
  const moddedStackId = createInventoryItemId();
  const quantity = getInventoryItemQuantity(entry);
  const onHandQuantity = getInventoryItemOnHandQuantity(entry);
  const sourceOnHandReduction = onHandQuantity > 0 ? 1 : 0;
  const movedOnHandQuantity = didChangeBaseArchetype ? 0 : sourceOnHandReduction;
  const movedWorn = didChangeBaseArchetype ? false : entry.worn;
  const movedUsesRemaining = getMovedInventoryItemUsesRemaining(entry);
  const useState = getInventoryItemUseState(entry);
  const savedSettings = getInventoryItemSettingsForSave(entry, mods, settings);
  const moddedStack = createCharacterInventoryItem(
    createModdedInventoryItemRecord(item, moddedStackId),
    {
      id: moddedStackId,
      quantity: 1,
      onHandQuantity: movedOnHandQuantity,
      worn: movedWorn,
      attuned: entry.attuned,
      usesRemaining: movedUsesRemaining,
      chargesTotal: savedSettings.chargesTotal,
      storedSpell: savedSettings.storedSpell,
      featureTags: savedSettings.featureTags,
      conjuredSource: savedSettings.conjuredSource,
      conjuredDuration: savedSettings.conjuredDuration,
      replicateMagicItemPlanKey: savedSettings.replicateMagicItemPlanKey,
      replicateMagicItemSlot: savedSettings.replicateMagicItemSlot,
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
      onHandQuantity: Math.max(0, onHandQuantity - sourceOnHandReduction),
      worn: false,
      attuned: false,
      usesRemaining: useState
        ? Math.max(0, useState.remaining - (movedUsesRemaining ?? 0))
        : entry.usesRemaining,
      chargesTotal: entry.chargesTotal,
      storedSpell: entry.storedSpell,
      featureTags: getSourceFeatureTagsAfterModdedTransform(entry),
      conjuredSource: entry.conjuredSource,
      conjuredDuration: entry.conjuredDuration,
      replicateMagicItemPlanKey: entry.replicateMagicItemPlanKey,
      replicateMagicItemSlot: entry.replicateMagicItemSlot,
      mods: entry.mods
    }),
    moddedStack
  ];
}

export function saveInventoryItemModsById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  item: ItemRecord,
  mods: CharacterItemMods,
  settings?: InventoryItemSettingsSavePayload
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

  const modsForSave = getInventoryItemModsForSave(targetStack, normalizedMods);
  const didChangeBaseArchetype = didInventoryItemBaseArchetypeChange(targetStack, modsForSave);

  if (isInventoryContainerItem(targetStack) || targetStack.mods || modsForSave.isCustom) {
    return {
      inventoryItems: inventoryItems.map((entry) =>
        entry.id === targetStack.id
          ? updateInventoryItemModsInPlace(
              entry,
              item,
              modsForSave,
              didChangeBaseArchetype,
              settings
            )
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

    const transformedStacks = transformInventoryItemCopyWithMods(
      entry,
      entry.item,
      modsForSave,
      didChangeBaseArchetype,
      settings
    );
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

export function getContainerContentsWeightValue(
  contents: CharacterContainerContentItem[] | null | undefined
): number {
  return (contents ?? []).reduce((totalWeight, content) => {
    const contentStack = createCharacterInventoryItem(content.item, {
      quantity: content.quantity,
      attuned: content.attuned,
      usesRemaining: content.usesRemaining,
      chargesTotal: content.chargesTotal,
      storedSpell: content.storedSpell,
      featureTags: content.featureTags,
      conjuredSource: content.conjuredSource,
      conjuredDuration: content.conjuredDuration,
      replicateMagicItemPlanKey: content.replicateMagicItemPlanKey,
      replicateMagicItemSlot: content.replicateMagicItemSlot,
      mods: content.mods
    });
    const item = getEffectiveInventoryItemRecord(contentStack);

    return totalWeight + (getItemWeightValue(item) ?? 0) * getInventoryItemQuantity(contentStack);
  }, 0);
}

function getContainerContentCopyWeightValue(content: CharacterContainerContentItem): number {
  const contentStack = createCharacterInventoryItem(content.item, {
    quantity: 1,
    attuned: content.attuned,
    usesRemaining: content.usesRemaining,
    chargesTotal: content.chargesTotal,
    storedSpell: content.storedSpell,
    featureTags: content.featureTags,
    conjuredSource: content.conjuredSource,
    conjuredDuration: content.conjuredDuration,
    replicateMagicItemPlanKey: content.replicateMagicItemPlanKey,
    replicateMagicItemSlot: content.replicateMagicItemSlot,
    mods: content.mods
  });
  const item = getEffectiveInventoryItemRecord(contentStack);

  return getItemWeightValue(item) ?? 0;
}

export function getInventoryContainerContentsWeightLimit(
  entry: Pick<CharacterInventoryItem, "item"> | null | undefined
): number | null {
  return isBagOfHoldingInventoryItem(entry) ? BAG_OF_HOLDING_WEIGHT_LIMIT_LB : null;
}

export function getInventoryItemCopyWeightValue(entry: CharacterInventoryItem): number {
  const item = getEffectiveInventoryItemRecord(entry);
  const ownWeight = getItemWeightValue(item) ?? 0;

  if (isBagOfHoldingInventoryItem(entry)) {
    return ownWeight;
  }

  const contentsWeight = isInventoryContainerItem(entry)
    ? getContainerContentsWeightValue(getInventoryContainerContents(entry))
    : 0;

  return ownWeight + contentsWeight;
}

export function getInventoryItemTotalWeightValue(entry: CharacterInventoryItem): number {
  return getInventoryItemCopyWeightValue(entry) * getInventoryItemQuantity(entry);
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
  const normalizedQuantity = normalizeInventoryStackQuantity(quantity, 0);

  if (!item.key || normalizedQuantity === 0) {
    return inventoryItems;
  }

  if (isItemContainerRecord(item)) {
    return [
      ...inventoryItems,
      ...Array.from({ length: normalizedQuantity }, () =>
        createCharacterInventoryItem(item, {
          quantity: 1,
          containerContents: []
        })
      )
    ];
  }

  const defaultChargesTotal = getDefaultInventoryItemChargesTotal(item);

  if (defaultChargesTotal !== null) {
    return [
      ...inventoryItems,
      ...Array.from({ length: normalizedQuantity }, () =>
        createCharacterInventoryItem(item, {
          quantity: 1,
          chargesTotal: defaultChargesTotal
        })
      )
    ];
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
  if (hasInventoryItemExplicitSettings(entry)) {
    return entry;
  }

  const usesPerCopy = getInventoryItemUsesPerCopy(entry.item);
  const currentQuantity = getInventoryItemQuantity(entry);
  const nextQuantity = normalizeInventoryStackQuantity(currentQuantity + quantity, currentQuantity, 1);
  const useState = getInventoryItemUseState(entry);
  const addedQuantity = Math.max(0, nextQuantity - currentQuantity);

  return normalizeInventoryStack({
    ...entry,
    quantity: nextQuantity,
    usesRemaining:
      usesPerCopy === null || !useState
        ? entry.usesRemaining
        : Math.min(
            INVENTORY_REFILLABLE_LIMIT,
            nextQuantity * usesPerCopy,
            useState.remaining + addedQuantity * usesPerCopy
          )
  });
}

export function addContainerContentItemCopies(
  contents: CharacterContainerContentItem[],
  contentItem: CharacterContainerContentItem
): CharacterContainerContentItem[] {
  const normalizedContentItem = normalizeContainerContentItem(contentItem);
  const mergeKey = getContainerContentStackKey(normalizedContentItem, contents.length);

  if (mergeKey.startsWith("unique:")) {
    return [...contents, normalizedContentItem];
  }

  let didMerge = false;
  const nextContents = contents.map((entry, index) => {
    if (didMerge || getContainerContentStackKey(entry, index) !== mergeKey) {
      return entry;
    }

    didMerge = true;
    return normalizeContainerContentItem({
      ...entry,
      quantity: entry.quantity + normalizedContentItem.quantity,
      usesRemaining: getMergedContainerContentUsesRemaining(entry, normalizedContentItem)
    });
  });

  return didMerge ? nextContents : [...nextContents, normalizedContentItem];
}

export function addOneContainerContentItemCopyByIndex(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number
): CharacterInventoryItem[] {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);

  if (!containerStack || !isInventoryContainerItem(containerStack)) {
    return inventoryItems;
  }

  const containerContents = getInventoryContainerContents(containerStack);
  const contentItem = containerContents[contentIndex] ?? null;

  if (!contentItem) {
    return inventoryItems;
  }

  if (
    getAddOneContainerContentItemCopyBlockReason(
      inventoryItems,
      resolvedContainerStackId,
      contentIndex
    ) !== null
  ) {
    return inventoryItems;
  }

  if (getContainerContentStackKey(contentItem, contentIndex).startsWith("unique:")) {
    const nextContainerContents = [
      ...containerContents,
      normalizeContainerContentItem({
        ...contentItem,
        quantity: 1,
        usesRemaining: undefined
      })
    ];

    return inventoryItems.map((entry) =>
      entry.id === resolvedContainerStackId
        ? normalizeInventoryStack({
            ...entry,
            containerContents: nextContainerContents
          })
        : entry
    );
  }

  const useState = getContainerContentUseState(contentItem);
  const usesPerCopy = getInventoryItemUsesPerCopy(contentItem.item);
  const nextContainerContents = containerContents.map((entry, index) =>
    index === contentIndex
      ? normalizeContainerContentItem({
          ...entry,
          quantity: entry.quantity + 1,
          usesRemaining:
            useState && usesPerCopy !== null
              ? Math.min(useState.total + usesPerCopy, useState.remaining + usesPerCopy)
              : entry.usesRemaining
        })
      : entry
  );

  return inventoryItems.map((entry) =>
    entry.id === resolvedContainerStackId
      ? normalizeInventoryStack({
          ...entry,
          containerContents: nextContainerContents
        })
      : entry
  );
}

export function removeOneContainerContentItemByIndex(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number
): CharacterInventoryItem[] {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);

  if (!containerStack || !isInventoryContainerItem(containerStack)) {
    return inventoryItems;
  }

  const containerContents = getInventoryContainerContents(containerStack);
  const contentItem = containerContents[contentIndex] ?? null;

  if (!contentItem) {
    return inventoryItems;
  }

  const removedContentItem = normalizeContainerContentItem({
    ...contentItem,
    quantity: 1,
    usesRemaining:
      getContainerContentUseState(contentItem)?.remaining !== undefined
        ? Math.min(
            getInventoryItemUsesPerCopy(contentItem.item) ?? 0,
            getContainerContentUseState(contentItem)?.remaining ?? 0
          )
        : undefined
  });
  const removedUseState = getContainerContentUseState(removedContentItem);
  const currentUseState = getContainerContentUseState(contentItem);
  const nextContainerContents = containerContents.flatMap((entry, index) => {
    if (index !== contentIndex) {
      return [entry];
    }

    const nextQuantity = entry.quantity - 1;

    if (nextQuantity <= 0) {
      return [];
    }

    return [
      normalizeContainerContentItem({
        ...entry,
        quantity: nextQuantity,
        usesRemaining: currentUseState
          ? Math.max(0, currentUseState.remaining - (removedUseState?.remaining ?? 0))
          : entry.usesRemaining
      })
    ];
  });

  return inventoryItems.map((entry) =>
    entry.id === resolvedContainerStackId
      ? normalizeInventoryStack({
          ...entry,
          containerContents: nextContainerContents
        })
      : entry
  );
}

function addContainerContentItemToInventoryWithResult(
  inventoryItems: CharacterInventoryItem[],
  contentItem: CharacterContainerContentItem
): ContainerContentMoveResult {
  const normalizedContentItem = normalizeContainerContentItem(contentItem);
  const shouldCreateSeparateStack =
    normalizedContentItem.attuned ||
    normalizedContentItem.mods ||
    normalizedContentItem.usesRemaining !== undefined ||
    normalizeInventoryChargesTotal(normalizedContentItem.chargesTotal) !== undefined ||
    normalizeInventoryStoredSpell(normalizedContentItem.storedSpell) !== undefined ||
    (normalizedContentItem.featureTags?.length ?? 0) > 0;

  if (!shouldCreateSeparateStack) {
    const existingStack = normalizedContentItem.item.key
      ? findUntaggedInventoryItemStackByKey(inventoryItems, normalizedContentItem.item.key)
      : null;
    const newStack =
      existingStack ??
      createCharacterInventoryItem(normalizedContentItem.item, {
        quantity: 1
      });

    return {
      inventoryItems: existingStack
        ? addInventoryItemCopies(inventoryItems, normalizedContentItem.item, 1)
        : [...inventoryItems, newStack],
      stackId: newStack.id
    };
  }

  const newStack = createCharacterInventoryItem(normalizedContentItem.item, {
    quantity: 1,
    attuned: normalizedContentItem.attuned,
    usesRemaining: normalizedContentItem.usesRemaining,
    chargesTotal: normalizedContentItem.chargesTotal,
    storedSpell: normalizedContentItem.storedSpell,
    featureTags: normalizedContentItem.featureTags,
    conjuredSource: normalizedContentItem.conjuredSource,
    conjuredDuration: normalizedContentItem.conjuredDuration,
    replicateMagicItemPlanKey: normalizedContentItem.replicateMagicItemPlanKey,
    replicateMagicItemSlot: normalizedContentItem.replicateMagicItemSlot,
    mods: normalizedContentItem.mods
  });

  return {
    inventoryItems: [...inventoryItems, newStack],
    stackId: newStack.id
  };
}

export function addInventoryItemCopiesToStackById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  quantity = 1
): CharacterInventoryItem[] {
  const normalizedQuantity = normalizeInventoryStackQuantity(quantity, 0);
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);

  if (!resolvedStackId || normalizedQuantity === 0) {
    return inventoryItems;
  }

  return inventoryItems.map((entry) =>
    entry.id === resolvedStackId &&
    !isInventoryContainerItem(entry) &&
    !entry.mods &&
    !hasInventoryItemExplicitSettings(entry)
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
          attuned: isInventoryItemAttunable(getEffectiveInventoryItemRecord(entry))
            ? attuned
            : false
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
          attuned: isInventoryItemAttunable(getEffectiveInventoryItemRecord(entry))
            ? attuned
            : false
        })
      : entry
  );
}

export function useInventoryItemChargeByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string,
  amount = 1
): CharacterInventoryItem[] {
  const spendAmount = normalizeInventoryRefillableNumber(amount, 1, 1);
  let didSpend = false;

  return inventoryItems.map((entry) => {
    if (didSpend || getItemRecordKey(entry.item) !== itemKey) {
      return entry;
    }

    const useState = getInventoryItemUseState(entry);

    if (!useState || useState.remaining < spendAmount) {
      return entry;
    }

    didSpend = true;
    return normalizeInventoryStack({
      ...entry,
      usesRemaining: useState.remaining - spendAmount
    });
  });
}

export function useInventoryItemChargeById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  amount = 1
): CharacterInventoryItem[] {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);
  const spendAmount = normalizeInventoryRefillableNumber(amount, 1, 1);

  return inventoryItems.map((entry) => {
    if (entry.id !== resolvedStackId) {
      return entry;
    }

    const useState = getInventoryItemUseState(entry);

    if (!useState || useState.remaining < spendAmount) {
      return entry;
    }

    return normalizeInventoryStack({
      ...entry,
      usesRemaining: useState.remaining - spendAmount
    });
  });
}

export function resetInventoryItemChargeByKey(
  inventoryItems: CharacterInventoryItem[],
  itemKey: string,
  amount = 1
): CharacterInventoryItem[] {
  const resetAmount = normalizeInventoryRefillableNumber(amount, 1, 1);
  let didReset = false;

  return inventoryItems.map((entry) => {
    if (didReset || getItemRecordKey(entry.item) !== itemKey) {
      return entry;
    }

    const useState = getInventoryItemUseState(entry);

    if (!useState || useState.remaining >= useState.total) {
      return entry;
    }

    didReset = true;
    return normalizeInventoryStack({
      ...entry,
      usesRemaining: Math.min(useState.total, useState.remaining + resetAmount)
    });
  });
}

export function resetInventoryItemChargeById(
  inventoryItems: CharacterInventoryItem[],
  stackId: string,
  amount = 1
): CharacterInventoryItem[] {
  const resolvedStackId = getInventoryItemStackIdFromCopyId(stackId);
  const resetAmount = normalizeInventoryRefillableNumber(amount, 1, 1);

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
      usesRemaining: Math.min(useState.total, useState.remaining + resetAmount)
    });
  });
}

export function useContainerContentItemChargeByIndex(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number,
  amount = 1
): CharacterInventoryItem[] {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const spendAmount = normalizeInventoryRefillableNumber(amount, 1, 1);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);

  if (!containerStack || !isInventoryContainerItem(containerStack)) {
    return inventoryItems;
  }

  const containerContents = getInventoryContainerContents(containerStack);
  const contentItem = containerContents[contentIndex] ?? null;
  const useState = getContainerContentUseState(contentItem);

  if (!contentItem || !useState || useState.remaining < spendAmount) {
    return inventoryItems;
  }

  const nextContainerContents = containerContents.map((entry, index) =>
    index === contentIndex
      ? normalizeContainerContentItem({
          ...entry,
          usesRemaining: useState.remaining - spendAmount
        })
      : entry
  );

  return inventoryItems.map((entry) =>
    entry.id === resolvedContainerStackId
      ? normalizeInventoryStack({
          ...entry,
          containerContents: nextContainerContents
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

function removeOneInventoryItemCopyForContainerTransfer(
  entry: CharacterInventoryItem
): CharacterInventoryItem[] {
  const nextQuantity = getInventoryItemQuantity(entry) - 1;

  if (nextQuantity <= 0) {
    return [];
  }

  const movedUsesRemaining = getMovedInventoryItemUsesRemaining(entry);
  const useState = getInventoryItemUseState(entry);

  return [
    normalizeInventoryStack({
      ...entry,
      quantity: nextQuantity,
      onHandQuantity: Math.min(
        nextQuantity,
        Math.max(0, getInventoryItemOnHandQuantity(entry) - 1)
      ),
      worn: false,
      attuned: false,
      usesRemaining: useState
        ? Math.max(0, useState.remaining - (movedUsesRemaining ?? 0))
        : entry.usesRemaining
    })
  ];
}

export function moveOneInventoryItemCopyIntoContainerById(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  sourceStackId: string
): CharacterInventoryItem[] {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const resolvedSourceStackId = getInventoryItemStackIdFromCopyId(sourceStackId);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);
  const sourceStack = findInventoryItemStackById(inventoryItems, resolvedSourceStackId);
  const contentItem = sourceStack
    ? createContainerContentItemFromInventoryStack(sourceStack)
    : null;

  if (
    !containerStack ||
    !sourceStack ||
    !contentItem ||
    resolvedContainerStackId === resolvedSourceStackId ||
    !isInventoryContainerItem(containerStack) ||
    isInventoryContainerItem(sourceStack) ||
    getInventoryItemCopyIntoContainerBlockReason(
      inventoryItems,
      resolvedContainerStackId,
      resolvedSourceStackId
    ) !== null
  ) {
    return inventoryItems;
  }

  return inventoryItems.flatMap((entry) => {
    if (entry.id === resolvedSourceStackId) {
      return removeOneInventoryItemCopyForContainerTransfer(entry);
    }

    if (entry.id === resolvedContainerStackId) {
      return [
        normalizeInventoryStack({
          ...entry,
          containerContents: addContainerContentItemCopies(
            getInventoryContainerContents(entry),
            contentItem
          )
        })
      ];
    }

    return [entry];
  });
}

export function getInventoryItemCopyIntoContainerObjectDelta(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  sourceStackId: string
): number | null {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const resolvedSourceStackId = getInventoryItemStackIdFromCopyId(sourceStackId);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);
  const sourceStack = findInventoryItemStackById(inventoryItems, resolvedSourceStackId);
  const contentItem = sourceStack
    ? createContainerContentItemFromInventoryStack(sourceStack)
    : null;

  if (
    !containerStack ||
    !sourceStack ||
    !contentItem ||
    resolvedContainerStackId === resolvedSourceStackId ||
    !isInventoryContainerItem(containerStack) ||
    isInventoryContainerItem(sourceStack)
  ) {
    return null;
  }

  const currentContents = getInventoryContainerContents(containerStack);
  const nextContents = addContainerContentItemCopies(currentContents, contentItem);

  return nextContents.length - currentContents.length;
}

export type InventoryContainerAddBlockReason =
  | "invalid"
  | "container"
  | "object-limit"
  | "weight-limit";

function wouldContainerContentsExceedWeightLimit(
  containerStack: CharacterInventoryItem,
  addedCopyWeight: number
): boolean {
  const weightLimit = getInventoryContainerContentsWeightLimit(containerStack);

  if (weightLimit === null) {
    return false;
  }

  return (
    getContainerContentsWeightValue(getInventoryContainerContents(containerStack)) +
      addedCopyWeight >
    weightLimit
  );
}

export function getInventoryItemCopyIntoContainerBlockReason(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  sourceStackId: string,
  objectLimit = CONTAINER_OBJECT_LIMIT
): InventoryContainerAddBlockReason | null {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const resolvedSourceStackId = getInventoryItemStackIdFromCopyId(sourceStackId);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);
  const sourceStack = findInventoryItemStackById(inventoryItems, resolvedSourceStackId);
  const objectDelta = getInventoryItemCopyIntoContainerObjectDelta(
    inventoryItems,
    resolvedContainerStackId,
    resolvedSourceStackId
  );

  if (
    !containerStack ||
    !sourceStack ||
    resolvedContainerStackId === resolvedSourceStackId ||
    !isInventoryContainerItem(containerStack)
  ) {
    return "invalid";
  }

  if (isInventoryContainerItem(sourceStack)) {
    return "container";
  }

  if (objectDelta === null) {
    return "invalid";
  }

  if (getInventoryContainerContents(containerStack).length + objectDelta > objectLimit) {
    return "object-limit";
  }

  if (
    wouldContainerContentsExceedWeightLimit(
      containerStack,
      getInventoryItemCopyWeightValue(sourceStack)
    )
  ) {
    return "weight-limit";
  }

  return null;
}

export function canMoveOneInventoryItemCopyIntoContainer(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  sourceStackId: string,
  objectLimit = CONTAINER_OBJECT_LIMIT
): boolean {
  return (
    getInventoryItemCopyIntoContainerBlockReason(
      inventoryItems,
      containerStackId,
      sourceStackId,
      objectLimit
    ) === null
  );
}

export function getAddOneContainerContentItemCopyBlockReason(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number,
  objectLimit = CONTAINER_OBJECT_LIMIT
): InventoryContainerAddBlockReason | null {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);
  const containerContents = containerStack ? getInventoryContainerContents(containerStack) : [];
  const contentItem = containerContents[contentIndex] ?? null;

  if (!containerStack || !contentItem || !isInventoryContainerItem(containerStack)) {
    return "invalid";
  }

  const objectDelta = getContainerContentStackKey(contentItem, contentIndex).startsWith("unique:")
    ? 1
    : 0;

  if (containerContents.length + objectDelta > objectLimit) {
    return "object-limit";
  }

  if (
    wouldContainerContentsExceedWeightLimit(
      containerStack,
      getContainerContentCopyWeightValue(contentItem)
    )
  ) {
    return "weight-limit";
  }

  return null;
}

export function canAddOneContainerContentItemCopyByIndex(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number
): boolean {
  return (
    getAddOneContainerContentItemCopyBlockReason(inventoryItems, containerStackId, contentIndex) ===
    null
  );
}

export function moveOneContainerContentItemOutByIndexWithResult(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number
): ContainerContentMoveResult {
  const resolvedContainerStackId = getInventoryItemStackIdFromCopyId(containerStackId);
  const containerStack = findInventoryItemStackById(inventoryItems, resolvedContainerStackId);

  if (!containerStack || !isInventoryContainerItem(containerStack)) {
    return {
      inventoryItems,
      stackId: null
    };
  }

  const containerContents = getInventoryContainerContents(containerStack);
  const contentItem = containerContents[contentIndex] ?? null;

  if (!contentItem) {
    return {
      inventoryItems,
      stackId: null
    };
  }

  const movedContentItem = normalizeContainerContentItem({
    ...contentItem,
    quantity: 1,
    usesRemaining:
      getContainerContentUseState(contentItem)?.remaining !== undefined
        ? Math.min(
            getInventoryItemUsesPerCopy(contentItem.item) ?? 0,
            getContainerContentUseState(contentItem)?.remaining ?? 0
          )
        : undefined
  });
  const inventoryWithoutMovedContent = removeOneContainerContentItemByIndex(
    inventoryItems,
    resolvedContainerStackId,
    contentIndex
  );

  return addContainerContentItemToInventoryWithResult(
    inventoryWithoutMovedContent,
    movedContentItem
  );
}

export function moveOneContainerContentItemOutByIndex(
  inventoryItems: CharacterInventoryItem[],
  containerStackId: string,
  contentIndex: number
): CharacterInventoryItem[] {
  return moveOneContainerContentItemOutByIndexWithResult(
    inventoryItems,
    containerStackId,
    contentIndex
  ).inventoryItems;
}
