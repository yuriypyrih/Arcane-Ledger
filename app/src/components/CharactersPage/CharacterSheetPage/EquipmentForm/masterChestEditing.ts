import type { CharacterInventoryItem, ItemRecord } from "../../../../types";
import {
  addInventoryItemCopies,
  canAddInventoryObject,
  createCharacterInventoryItemFromTemplate,
  findInventoryItemStackById,
  findInventoryItemStackByKey,
  getInventoryItemQuantity,
  getInventoryObjectCount,
  getItemRecordKey,
  hasInventoryContainerContents,
  INVENTORY_OBJECT_LIMIT,
  isInventoryContainerItem,
  removeOneInventoryItemCopyById,
  removeOneInventoryItemCopyByKey,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import { getEffectiveInventoryItemRecord } from "../../../../pages/CharactersPage/itemMods";

export type MasterChestBrowserSelectionOptions = {
  initialInventoryItem?: CharacterInventoryItem;
  initialItem?: ItemRecord;
};

export type MasterChestItemInspection =
  | {
      source: "browser";
      itemKey: string;
      initialInventoryItem?: CharacterInventoryItem | null;
      initialItem: ItemRecord | null;
    }
  | {
      source: "chest";
      itemKey: string;
      stackId: string;
      initialInventoryItem: CharacterInventoryItem;
      initialItem: ItemRecord | null;
    };

export type MasterChestRemovalAction = "remove" | "sell";

export type PendingMasterChestItemRemoval = {
  action: MasterChestRemovalAction;
  inspection: MasterChestItemInspection;
  item: ItemRecord;
};

export function createMasterChestBrowserInspection(
  item: { key: string },
  options?: MasterChestBrowserSelectionOptions
): MasterChestItemInspection {
  return {
    source: "browser",
    itemKey: item.key,
    initialInventoryItem: options?.initialInventoryItem ?? null,
    initialItem: options?.initialItem ?? null
  };
}

export function createMasterChestStackInspection(
  item: GroupedInventoryItem
): MasterChestItemInspection {
  return {
    source: "chest",
    itemKey: item.item.key || item.key || item.itemKey,
    stackId: item.stackId,
    initialInventoryItem: item.stack,
    initialItem: item.item
  };
}

export function getMasterChestInspectionItemKey(
  inspection: MasterChestItemInspection | null
): string | undefined {
  return inspection?.itemKey || inspection?.initialItem?.key;
}

export function getMasterChestInspectionInitialItem(
  inspection: MasterChestItemInspection | null
): ItemRecord | null {
  return inspection?.initialItem ?? inspection?.initialInventoryItem?.item ?? null;
}

export function getMasterChestInspectionDisplayStack(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection | null
): CharacterInventoryItem | null {
  if (!inspection) {
    return null;
  }

  if (inspection.source === "chest") {
    return (
      findInventoryItemStackById(inventoryItems, inspection.stackId) ??
      inspection.initialInventoryItem
    );
  }

  return inspection.initialInventoryItem ?? null;
}

export function getMasterChestInspectionOwnedStack(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection | null
): CharacterInventoryItem | null {
  if (!inspection) {
    return null;
  }

  if (inspection.source === "chest") {
    return findInventoryItemStackById(inventoryItems, inspection.stackId);
  }

  return findInventoryItemStackByKey(inventoryItems, inspection.itemKey);
}

export function getMasterChestInspectionItemCount(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection | null
): number {
  const ownedStack = getMasterChestInspectionOwnedStack(inventoryItems, inspection);

  return ownedStack ? getInventoryItemQuantity(ownedStack) : 0;
}

function shouldCreateItemFromTemplate(
  template: CharacterInventoryItem | null,
  item: ItemRecord
): template is CharacterInventoryItem {
  if (!template) {
    return false;
  }

  return (
    getItemRecordKey(template.item) !== getItemRecordKey(item) ||
    Boolean(
      template.attuned ||
        template.chargesRecharge ||
        template.chargesTotal !== undefined ||
        template.conjuredDuration ||
        template.conjuredSource ||
        template.customTag ||
        template.featureTags?.length ||
        template.mods ||
        template.replicateMagicItemPlanKey ||
        template.replicateMagicItemSlot ||
        template.spellcastingFocusSources?.length ||
        template.storedSpell ||
        template.usesRemaining !== undefined ||
        template.worn
    )
  );
}

export function canAddMasterChestInspectionItem(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection | null,
  item: ItemRecord | null
): boolean {
  if (!inspection || !item?.key) {
    return false;
  }

  const displayStack = getMasterChestInspectionDisplayStack(inventoryItems, inspection);

  return canAddInventoryObject(
    inventoryItems,
    shouldCreateItemFromTemplate(displayStack, item)
      ? { kind: "new-root-stack" }
      : { kind: "root", item }
  );
}

export function addMasterChestInspectionItem(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection,
  item: ItemRecord
): CharacterInventoryItem[] {
  if (!canAddMasterChestInspectionItem(inventoryItems, inspection, item)) {
    return inventoryItems;
  }

  const displayStack = getMasterChestInspectionDisplayStack(inventoryItems, inspection);

  return shouldCreateItemFromTemplate(displayStack, item)
    ? [...inventoryItems, createCharacterInventoryItemFromTemplate(displayStack)]
    : addInventoryItemCopies(inventoryItems, item);
}

export function removeMasterChestInspectionItem(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection
): CharacterInventoryItem[] {
  if (inspection.source === "chest") {
    return removeOneInventoryItemCopyById(inventoryItems, inspection.stackId);
  }

  return removeOneInventoryItemCopyByKey(inventoryItems, inspection.itemKey);
}

export function masterChestInspectionHasContainerContents(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection | null
): boolean {
  const ownedStack = getMasterChestInspectionOwnedStack(inventoryItems, inspection);

  return Boolean(
    ownedStack && isInventoryContainerItem(ownedStack) && hasInventoryContainerContents(ownedStack)
  );
}

export function getMasterChestInspectionEffectiveItem(
  inventoryItems: CharacterInventoryItem[],
  inspection: MasterChestItemInspection | null
): ItemRecord | null {
  const displayStack = getMasterChestInspectionDisplayStack(inventoryItems, inspection);

  return displayStack ? getEffectiveInventoryItemRecord(displayStack) : null;
}

export function getMasterChestObjectLimitMessage(inventoryItems: CharacterInventoryItem[]): string {
  return `Master chest limit reached. The chest has ${Math.max(
    getInventoryObjectCount(inventoryItems),
    INVENTORY_OBJECT_LIMIT
  )} inventory objects. Remove or sell items before adding more.`;
}
