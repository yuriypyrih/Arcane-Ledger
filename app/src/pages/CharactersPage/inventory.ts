import type { CharacterEquipmentItem } from "../../types";
import {
  canWeaponBePutOnHand,
  canWeaponCopiesBePutOnHand,
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  getHeldWeaponSlotCount,
  getWeaponHandSlots,
  hasVersatileHandBonus,
  isTwoHandedWeapon,
  type HeldWeaponDescriptor
} from "./handState";

export {
  canWeaponBePutOnHand,
  canWeaponCopiesBePutOnHand,
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  getHeldWeaponSlotCount,
  getWeaponHandSlots,
  hasVersatileHandBonus,
  isTwoHandedWeapon,
  type HeldWeaponDescriptor
};

export function createCharacterEquipmentItem(
  name: string,
  onHand = false,
  worn = false
): CharacterEquipmentItem {
  return {
    name,
    onHand,
    worn
  };
}

function normalizeEquipmentName(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isCharacterEquipmentItem(value: unknown): value is CharacterEquipmentItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<CharacterEquipmentItem>;
  return typeof record.name === "string";
}

export function normalizeCharacterEquipmentItems(
  selectedEquipment: Array<string | CharacterEquipmentItem>
): CharacterEquipmentItem[] {
  const equipmentByName = new Map<string, CharacterEquipmentItem>();

  selectedEquipment.forEach((item) => {
    const normalizedItem = typeof item === "string"
      ? createCharacterEquipmentItem(normalizeEquipmentName(item))
      : createCharacterEquipmentItem(
          normalizeEquipmentName(item.name),
          Boolean(item.onHand),
          Boolean(item.worn)
        );

    if (!normalizedItem.name) {
      return;
    }

    const existingItem = equipmentByName.get(normalizedItem.name);

    equipmentByName.set(normalizedItem.name, {
      name: normalizedItem.name,
      onHand: Boolean(existingItem?.onHand || normalizedItem.onHand),
      worn: Boolean(existingItem?.worn || normalizedItem.worn)
    });
  });

  return [...equipmentByName.values()];
}

export function getCharacterEquipmentNames(
  selectedEquipment: Array<string | CharacterEquipmentItem>
): string[] {
  return normalizeCharacterEquipmentItems(selectedEquipment).map((item) => item.name);
}

export function getCharacterEquipmentItem(
  equipment: CharacterEquipmentItem[],
  itemName: string
): CharacterEquipmentItem | undefined {
  return equipment.find((item) => item.name === itemName);
}
