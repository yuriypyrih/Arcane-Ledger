import { PROF_LEVEL, type WeaponProficiencyEntry } from "../../types";
import { getWeaponLevelFromEntries, getWeaponProficiencyForBaseWeapon } from "./proficiency";
import {
  resolveWeaponBaseReference,
  type WeaponBaseReference
} from "../../utils/items/resolveWeaponBaseReference";

export function hasActiveWeaponMastery(
  weaponProficiencies: WeaponProficiencyEntry[],
  reference: WeaponBaseReference | null | undefined
): boolean {
  const baseWeapon = resolveWeaponBaseReference(reference);

  if (!baseWeapon) {
    return false;
  }

  return (
    getWeaponLevelFromEntries(
      weaponProficiencies,
      getWeaponProficiencyForBaseWeapon(baseWeapon)
    ) !== PROF_LEVEL.NONE
  );
}
