import { WEAPON_PROPERTY, type WeaponDamage, type WeaponEntry } from "../../codex/entries";

export type HeldWeaponDescriptor = {
  key: string;
  properties: WEAPON_PROPERTY[];
  versatileDamage?: WeaponDamage;
  handSlots?: number;
};

export function createHeldWeaponDescriptor(
  key: string,
  weapon: Pick<WeaponEntry, "properties" | "versatileDamage">
): HeldWeaponDescriptor {
  return {
    key,
    properties: weapon.properties,
    versatileDamage: weapon.versatileDamage,
    handSlots: weapon.properties.includes(WEAPON_PROPERTY.TWO_HANDED) ? 2 : 1
  };
}

export function createHeldShieldDescriptor(key: string): HeldWeaponDescriptor {
  return {
    key,
    properties: [],
    handSlots: 1
  };
}

export function isTwoHandedWeapon(
  weapon: Pick<WeaponEntry, "properties"> | HeldWeaponDescriptor
): boolean {
  return getWeaponHandSlots(weapon) === 2;
}

export function getWeaponHandSlots(
  weapon: Pick<WeaponEntry, "properties"> | HeldWeaponDescriptor
): number {
  if ("handSlots" in weapon && typeof weapon.handSlots === "number") {
    return weapon.handSlots;
  }

  return weapon.properties.includes(WEAPON_PROPERTY.TWO_HANDED) ? 2 : 1;
}

export function getHeldWeaponSlotCount(heldWeapons: HeldWeaponDescriptor[]): number {
  return heldWeapons.reduce((totalSlots, weapon) => totalSlots + getWeaponHandSlots(weapon), 0);
}

function canHeldWeaponSetFit(heldWeapons: HeldWeaponDescriptor[]): boolean {
  return getHeldWeaponSlotCount(heldWeapons) <= 2;
}

export function canWeaponCopiesBePutOnHand(
  targetWeapons: HeldWeaponDescriptor[],
  heldWeapons: HeldWeaponDescriptor[]
): boolean {
  if (targetWeapons.length === 0) {
    return false;
  }

  const targetWeaponKeys = new Set(targetWeapons.map((weapon) => weapon.key));
  const otherHeldWeapons = heldWeapons.filter((weapon) => !targetWeaponKeys.has(weapon.key));

  return canHeldWeaponSetFit([...otherHeldWeapons, ...targetWeapons]);
}

export function canWeaponBePutOnHand(
  targetWeapon: HeldWeaponDescriptor,
  heldWeapons: HeldWeaponDescriptor[]
): boolean {
  return canWeaponCopiesBePutOnHand([targetWeapon], heldWeapons);
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
