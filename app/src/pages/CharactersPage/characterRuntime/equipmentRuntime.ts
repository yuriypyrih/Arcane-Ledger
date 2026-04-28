import type { Character } from "../../../types";
import {
  createHeldDescriptorForInventoryItem,
  createHeldInventoryItemCopyReferences,
  getItemWeightValue,
  type InventoryItemCopyReference
} from "../inventoryItems";
import type { HeldWeaponDescriptor } from "../inventory";
import { createInventoryRuntimeIndex, type InventoryRuntimeIndex } from "./inventoryIndex";
import { measureCharacterRuntime } from "./performance";

export type EquipmentRuntime = {
  inventoryIndex: InventoryRuntimeIndex;
  heldInventoryCopies: InventoryItemCopyReference[];
  heldInventoryDescriptors: HeldWeaponDescriptor[];
  inventoryWeight: number;
};

const equipmentRuntimeByCharacter = new WeakMap<Character, EquipmentRuntime>();

function createEquipmentRuntime(character: Character): EquipmentRuntime {
  const inventoryIndex = createInventoryRuntimeIndex(character.inventoryItems);
  const heldInventoryCopies = character.inventoryItems.flatMap(createHeldInventoryItemCopyReferences);
  const heldInventoryDescriptors = heldInventoryCopies
    .map((copy) => createHeldDescriptorForInventoryItem(`inventory-${copy.id}`, copy.item))
    .filter((descriptor): descriptor is HeldWeaponDescriptor => descriptor !== null);
  const inventoryWeight = Math.round(
    inventoryIndex.groups.reduce(
      (totalWeight, item) => totalWeight + (getItemWeightValue(item.item) ?? 0) * item.count,
      0
    ) * 100
  ) / 100;

  return {
    inventoryIndex,
    heldInventoryCopies,
    heldInventoryDescriptors,
    inventoryWeight
  };
}

export function getEquipmentRuntimeForCharacter(character: Character): EquipmentRuntime {
  const cachedRuntime = equipmentRuntimeByCharacter.get(character);

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = measureCharacterRuntime("character-sheet:equipment-runtime", () =>
    createEquipmentRuntime(character)
  );

  equipmentRuntimeByCharacter.set(character, runtime);
  return runtime;
}
