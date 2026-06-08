import type { Character } from "../../../types";
import { collectActiveClassFeatureState } from "../classFeatures/modules";
import {
  createHeldDescriptorForInventoryItem,
  createHeldInventoryItemCopyReferences,
  getInventoryItemTotalWeightValue,
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
const defaultInventoryAttunementLimit = 3;
const rogueThiefSubclassId = "rogue-thief";

export function getInventoryAttunementLimit(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  const classFeatureLimit =
    collectActiveClassFeatureState(character).getInventoryAttunementLimit?.(
      defaultInventoryAttunementLimit
    );

  if (typeof classFeatureLimit === "number" && Number.isFinite(classFeatureLimit)) {
    return classFeatureLimit;
  }

  if (
    character.className === "Rogue" &&
    character.subclassId === rogueThiefSubclassId &&
    character.level >= 13
  ) {
    return 4;
  }

  return defaultInventoryAttunementLimit;
}

function createEquipmentRuntime(character: Character): EquipmentRuntime {
  const inventoryIndex = createInventoryRuntimeIndex(character.inventoryItems);
  let heldInventoryCopies: InventoryItemCopyReference[] | null = null;
  let heldInventoryDescriptors: HeldWeaponDescriptor[] | null = null;
  const inventoryWeight = Math.round(
    inventoryIndex.groups.reduce(
      (totalWeight, item) => totalWeight + getInventoryItemTotalWeightValue(item.stack),
      0
    ) * 100
  ) / 100;

  return {
    inventoryIndex,
    get heldInventoryCopies() {
      if (!heldInventoryCopies) {
        heldInventoryCopies = character.inventoryItems.flatMap(createHeldInventoryItemCopyReferences);
      }

      return heldInventoryCopies;
    },
    get heldInventoryDescriptors() {
      if (!heldInventoryDescriptors) {
        const copies =
          heldInventoryCopies ??
          character.inventoryItems.flatMap(createHeldInventoryItemCopyReferences);
        heldInventoryCopies = copies;
        heldInventoryDescriptors = copies
          .map((copy) => createHeldDescriptorForInventoryItem(`inventory-${copy.id}`, copy.item))
          .filter((descriptor): descriptor is HeldWeaponDescriptor => descriptor !== null);
      }

      return heldInventoryDescriptors;
    },
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
