import { WEAPON_PROPERTY, type WeaponDamage, type WeaponEntry } from "../../codex/entries";
import type { CharacterEquipmentItem } from "../../types";

export type HeldWeaponDescriptor = {
  key: string;
  properties: WEAPON_PROPERTY[];
  versatileDamage?: WeaponDamage;
};

export function createHeldWeaponDescriptor(
  key: string,
  weapon: Pick<WeaponEntry, "properties" | "versatileDamage">
): HeldWeaponDescriptor {
  return {
    key,
    properties: weapon.properties,
    versatileDamage: weapon.versatileDamage
  };
}

export function createCharacterEquipmentItem(
  name: string,
  onHand = false
): CharacterEquipmentItem {
  return {
    name,
    onHand
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
      : createCharacterEquipmentItem(normalizeEquipmentName(item.name), Boolean(item.onHand));

    if (!normalizedItem.name) {
      return;
    }

    const existingItem = equipmentByName.get(normalizedItem.name);

    equipmentByName.set(normalizedItem.name, {
      name: normalizedItem.name,
      onHand: Boolean(existingItem?.onHand || normalizedItem.onHand)
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

export function isTwoHandedWeapon(weapon: Pick<WeaponEntry, "properties">): boolean {
  return weapon.properties.includes(WEAPON_PROPERTY.TWO_HANDED);
}

export function getWeaponHandSlots(weapon: Pick<WeaponEntry, "properties">): number {
  return isTwoHandedWeapon(weapon) ? 2 : 1;
}

export function getHeldWeaponSlotCount(heldWeapons: HeldWeaponDescriptor[]): number {
  return heldWeapons.reduce((totalSlots, weapon) => totalSlots + getWeaponHandSlots(weapon), 0);
}

export function canWeaponBePutOnHand(
  targetWeapon: HeldWeaponDescriptor,
  heldWeapons: HeldWeaponDescriptor[]
): boolean {
  const otherHeldWeapons = heldWeapons.filter((weapon) => weapon.key !== targetWeapon.key);

  if (isTwoHandedWeapon(targetWeapon)) {
    return otherHeldWeapons.length === 0;
  }

  if (otherHeldWeapons.some((weapon) => isTwoHandedWeapon(weapon))) {
    return false;
  }

  return getHeldWeaponSlotCount(otherHeldWeapons) + getWeaponHandSlots(targetWeapon) <= 2;
}

export function hasVersatileHandBonus(
  targetWeapon: HeldWeaponDescriptor,
  heldWeapons: HeldWeaponDescriptor[]
): boolean {
  return (
    heldWeapons.length === 1 &&
    heldWeapons[0]?.key === targetWeapon.key &&
    targetWeapon.properties.includes(WEAPON_PROPERTY.VERSATILE) &&
    Array.isArray(targetWeapon.versatileDamage) &&
    targetWeapon.versatileDamage.length > 0
  );
}
