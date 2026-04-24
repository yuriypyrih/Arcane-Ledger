import type {
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING
} from "../../codex/entries";
import type { WeaponProficiencyEntry } from "../../types";
import {
  resolveWeaponBaseReference,
  type WeaponBaseReference
} from "../../utils/items/resolveWeaponBaseReference";
import { getAppliedWeaponProficiency } from "./proficiency";

type WeaponProficiencyReference = WeaponBaseReference & {
  training: WEAPON_TRAINING;
  combatType?: WEAPON_COMBAT_TYPE | null;
  properties?: WEAPON_PROPERTY[] | null;
};

export function hasAppliedWeaponProficiency(
  weaponProficiencies: WeaponProficiencyEntry[],
  reference: WeaponProficiencyReference | null | undefined
): boolean {
  if (!reference) {
    return false;
  }

  return Boolean(
    getAppliedWeaponProficiency(weaponProficiencies, reference.training, {
      baseWeapon: resolveWeaponBaseReference(reference) ?? undefined,
      combatType: reference.combatType ?? undefined,
      properties: reference.properties ?? undefined
    })
  );
}
