import {
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type WeaponType
} from "../../codex/entries";

export type MonkWeaponCandidate = {
  type: WeaponType;
  properties: WEAPON_PROPERTY[];
};

export function isSimpleMeleeWeapon(weapon: MonkWeaponCandidate): boolean {
  return (
    weapon.type.training === WEAPON_TRAINING.SIMPLE &&
    weapon.type.combat === WEAPON_COMBAT_TYPE.MELEE
  );
}

export function isMartialMeleeLightWeapon(weapon: MonkWeaponCandidate): boolean {
  return (
    weapon.type.training === WEAPON_TRAINING.MARTIAL &&
    weapon.type.combat === WEAPON_COMBAT_TYPE.MELEE &&
    weapon.properties.includes(WEAPON_PROPERTY.LIGHT)
  );
}

export function isMartialMeleeWeaponWithoutHeavyOrTwoHandedProperty(
  weapon: MonkWeaponCandidate
): boolean {
  return (
    weapon.type.training === WEAPON_TRAINING.MARTIAL &&
    weapon.type.combat === WEAPON_COMBAT_TYPE.MELEE &&
    !weapon.properties.includes(WEAPON_PROPERTY.HEAVY) &&
    !weapon.properties.includes(WEAPON_PROPERTY.TWO_HANDED)
  );
}

export function isMonkWeapon(weapon: MonkWeaponCandidate): boolean {
  return isSimpleMeleeWeapon(weapon) || isMartialMeleeLightWeapon(weapon);
}
