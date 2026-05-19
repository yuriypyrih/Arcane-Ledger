import type { CharacterInventoryItem } from "../../../types";
import {
  createGroupedInventoryItem,
  createHeldInventoryItemCopyReferences,
  getItemRecordKey,
  getInventoryItemAvailableQuantity,
  getInventoryItemOnHandQuantity,
  getInventoryItemQuantity,
  type InventoryItemCopyReference,
  type GroupedInventoryItem
} from "../inventoryItems";
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
  heldCountsByKey: Record<string, number>;
  heldCountsByStackId: Record<string, number>;
  wornCopyByKey: Map<string, CharacterInventoryItem>;
  wornCopyByStackId: Map<string, CharacterInventoryItem>;
  getHeldCopiesByKey: (key: string) => InventoryItemCopyReference[];
  getHeldCopiesByStackId: (stackId: string) => InventoryItemCopyReference[];
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
  const heldCountsByKey: Record<string, number> = {};
  const heldCountsByStackId: Record<string, number> = {};
  const groupsByKey = new Map<string, GroupedInventoryItem>();
  const groupsByStackId = new Map<string, GroupedInventoryItem>();
  const firstCopyByKey = new Map<string, CharacterInventoryItem>();
  const firstCopyByStackId = new Map<string, CharacterInventoryItem>();
  const availableCopyByKey = new Map<string, CharacterInventoryItem>();
  const availableCopyByStackId = new Map<string, CharacterInventoryItem>();
  const heldStacksByKey = new Map<string, CharacterInventoryItem[]>();
  const heldStacksByStackId = new Map<string, CharacterInventoryItem>();
  const heldCopiesByKey = new Map<string, InventoryItemCopyReference[]>();
  const heldCopiesByStackId = new Map<string, InventoryItemCopyReference[]>();
  const wornCopyByKey = new Map<string, CharacterInventoryItem>();
  const wornCopyByStackId = new Map<string, CharacterInventoryItem>();
  const groups = inventoryItems
    .map((stack) => {
      const key = getItemRecordKey(stack.item);
      const count = getInventoryItemQuantity(stack);
      const onHandCount = getInventoryItemOnHandQuantity(stack);
      const group = createGroupedInventoryItem(stack);

      countsByKey[key] = (countsByKey[key] ?? 0) + count;
      countsByStackId[stack.id] = count;
      heldCountsByKey[key] = (heldCountsByKey[key] ?? 0) + onHandCount;
      heldCountsByStackId[stack.id] = onHandCount;
      if (!groupsByKey.has(key)) {
        groupsByKey.set(key, group);
      }
      groupsByStackId.set(stack.id, group);
      if (!firstCopyByKey.has(key)) {
        firstCopyByKey.set(key, stack);
      }
      firstCopyByStackId.set(stack.id, stack);

      if (onHandCount > 0) {
        heldStacksByKey.set(key, [...(heldStacksByKey.get(key) ?? []), stack]);
        heldStacksByStackId.set(stack.id, stack);
      }

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
  const getHeldCopiesByKey = (key: string): InventoryItemCopyReference[] => {
    const cachedCopies = heldCopiesByKey.get(key);

    if (cachedCopies) {
      return cachedCopies;
    }

    const copies = (heldStacksByKey.get(key) ?? []).flatMap(createHeldInventoryItemCopyReferences);
    heldCopiesByKey.set(key, copies);
    return copies;
  };
  const getHeldCopiesByStackId = (stackId: string): InventoryItemCopyReference[] => {
    const cachedCopies = heldCopiesByStackId.get(stackId);

    if (cachedCopies) {
      return cachedCopies;
    }

    const stack = heldStacksByStackId.get(stackId);
    const copies = stack ? createHeldInventoryItemCopyReferences(stack) : [];
    heldCopiesByStackId.set(stackId, copies);
    return copies;
  };

  return {
    countsByKey,
    countsByStackId,
    heldCountsByKey,
    heldCountsByStackId,
    groups,
    groupsByKey,
    groupsByStackId,
    firstCopyByKey,
    firstCopyByStackId,
    availableCopyByKey,
    availableCopyByStackId,
    wornCopyByKey,
    wornCopyByStackId,
    getHeldCopiesByKey,
    getHeldCopiesByStackId
  };
}
