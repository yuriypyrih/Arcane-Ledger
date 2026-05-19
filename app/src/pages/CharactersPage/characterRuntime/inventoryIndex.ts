import type { CharacterInventoryItem } from "../../../types";
import {
  createHeldInventoryItemCopyReferences,
  createInventoryItemCopyReferences,
  getItemRecordKey,
  getItemRecordName,
  getInventoryItemAvailableQuantity,
  getInventoryItemOnHandQuantity,
  getInventoryItemQuantity,
  type InventoryItemCopyReference,
  type GroupedInventoryItem
} from "../inventoryItems";
import { getEffectiveInventoryItemRecord } from "../itemMods";
import { measureCharacterRuntime } from "./performance";

export type InventoryRuntimeIndex = {
  countsByKey: Record<string, number>;
  countsByStackId: Record<string, number>;
  groups: GroupedInventoryItem[];
  groupsByKey: Map<string, GroupedInventoryItem>;
  groupsByStackId: Map<string, GroupedInventoryItem>;
  firstCopyByKey: Map<string, CharacterInventoryItem>;
  firstCopyByStackId: Map<string, CharacterInventoryItem>;
  availableCopyByKey: Map<string, CharacterInventoryItem>;
  availableCopyByStackId: Map<string, CharacterInventoryItem>;
  heldCopiesByKey: Map<string, InventoryItemCopyReference[]>;
  heldCopiesByStackId: Map<string, InventoryItemCopyReference[]>;
  wornCopyByKey: Map<string, CharacterInventoryItem>;
  wornCopyByStackId: Map<string, CharacterInventoryItem>;
};

export function createInventoryRuntimeIndex(
  inventoryItems: CharacterInventoryItem[]
): InventoryRuntimeIndex {
  return measureCharacterRuntime("character-sheet:inventory-runtime", () =>
    createInventoryRuntimeIndexSnapshot(inventoryItems)
  );
}

function createInventoryRuntimeIndexSnapshot(
  inventoryItems: CharacterInventoryItem[]
): InventoryRuntimeIndex {
  const countsByKey: Record<string, number> = {};
  const countsByStackId: Record<string, number> = {};
  const groupsByKey = new Map<string, GroupedInventoryItem>();
  const groupsByStackId = new Map<string, GroupedInventoryItem>();
  const firstCopyByKey = new Map<string, CharacterInventoryItem>();
  const firstCopyByStackId = new Map<string, CharacterInventoryItem>();
  const availableCopyByKey = new Map<string, CharacterInventoryItem>();
  const availableCopyByStackId = new Map<string, CharacterInventoryItem>();
  const heldCopiesByKey = new Map<string, InventoryItemCopyReference[]>();
  const heldCopiesByStackId = new Map<string, InventoryItemCopyReference[]>();
  const wornCopyByKey = new Map<string, CharacterInventoryItem>();
  const wornCopyByStackId = new Map<string, CharacterInventoryItem>();
  const groups = inventoryItems
    .map((stack) => {
      const effectiveItem = getEffectiveInventoryItemRecord(stack);
      const key = getItemRecordKey(stack.item);
      const count = getInventoryItemQuantity(stack);
      const onHandCount = getInventoryItemOnHandQuantity(stack);
      const heldCopies = createHeldInventoryItemCopyReferences(stack);
      const group: GroupedInventoryItem = {
        key,
        itemKey: key,
        stackId: stack.id,
        name: getItemRecordName(effectiveItem),
        item: effectiveItem,
        stack,
        copies: createInventoryItemCopyReferences(stack),
        count,
        onHand: onHandCount > 0,
        onHandCount,
        worn: stack.worn
      };

      countsByKey[key] = (countsByKey[key] ?? 0) + count;
      countsByStackId[stack.id] = count;
      if (!groupsByKey.has(key)) {
        groupsByKey.set(key, group);
      }
      groupsByStackId.set(stack.id, group);
      if (!firstCopyByKey.has(key)) {
        firstCopyByKey.set(key, stack);
      }
      firstCopyByStackId.set(stack.id, stack);
      heldCopiesByKey.set(key, [...(heldCopiesByKey.get(key) ?? []), ...heldCopies]);
      heldCopiesByStackId.set(stack.id, heldCopies);

      if (getInventoryItemAvailableQuantity(stack) > 0) {
        if (!availableCopyByKey.has(key)) {
          availableCopyByKey.set(key, stack);
        }
        availableCopyByStackId.set(stack.id, stack);
      }

      if (stack.worn) {
        if (!wornCopyByKey.has(key)) {
          wornCopyByKey.set(key, stack);
        }
        wornCopyByStackId.set(stack.id, stack);
      }

      return group;
    })
    .filter((entry) => entry.key)
    .sort((left, right) => left.name.localeCompare(right.name));

  return {
    countsByKey,
    countsByStackId,
    groups,
    groupsByKey,
    groupsByStackId,
    firstCopyByKey,
    firstCopyByStackId,
    availableCopyByKey,
    availableCopyByStackId,
    heldCopiesByKey,
    heldCopiesByStackId,
    wornCopyByKey,
    wornCopyByStackId
  };
}
