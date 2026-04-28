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
import { measureCharacterRuntime } from "./performance";

export type InventoryRuntimeIndex = {
  countsByKey: Record<string, number>;
  groups: GroupedInventoryItem[];
  groupsByKey: Map<string, GroupedInventoryItem>;
  firstCopyByKey: Map<string, CharacterInventoryItem>;
  availableCopyByKey: Map<string, CharacterInventoryItem>;
  heldCopiesByKey: Map<string, InventoryItemCopyReference[]>;
  wornCopyByKey: Map<string, CharacterInventoryItem>;
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
  const groupsByKey = new Map<string, GroupedInventoryItem>();
  const firstCopyByKey = new Map<string, CharacterInventoryItem>();
  const availableCopyByKey = new Map<string, CharacterInventoryItem>();
  const heldCopiesByKey = new Map<string, InventoryItemCopyReference[]>();
  const wornCopyByKey = new Map<string, CharacterInventoryItem>();
  const groups = inventoryItems
    .map((stack) => {
      const key = getItemRecordKey(stack.item);
      const count = getInventoryItemQuantity(stack);
      const onHandCount = getInventoryItemOnHandQuantity(stack);
      const heldCopies = createHeldInventoryItemCopyReferences(stack);
      const group: GroupedInventoryItem = {
        key,
        name: getItemRecordName(stack.item),
        item: stack.item,
        stack,
        copies: createInventoryItemCopyReferences(stack),
        count,
        onHand: onHandCount > 0,
        onHandCount,
        worn: stack.worn
      };

      countsByKey[key] = count;
      groupsByKey.set(key, group);
      firstCopyByKey.set(key, stack);
      heldCopiesByKey.set(key, heldCopies);

      if (getInventoryItemAvailableQuantity(stack) > 0) {
        availableCopyByKey.set(key, stack);
      }

      if (stack.worn) {
        wornCopyByKey.set(key, stack);
      }

      return group;
    })
    .filter((entry) => entry.key)
    .sort((left, right) => left.name.localeCompare(right.name));

  return {
    countsByKey,
    groups,
    groupsByKey,
    firstCopyByKey,
    availableCopyByKey,
    heldCopiesByKey,
    wornCopyByKey
  };
}
