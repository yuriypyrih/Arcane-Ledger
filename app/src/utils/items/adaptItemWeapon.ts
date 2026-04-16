import {
  DAMAGE_TYPE,
  DICE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type WeaponDamage,
  type WeaponType
} from "../../codex/entries";
import type { ItemRecord, Open5eItemWeaponPropertyRecord } from "../../types";

export type AdaptedItemWeaponRecord = {
  type: WeaponType;
  damage: WeaponDamage | null;
  damageLabel: string;
  properties: WEAPON_PROPERTY[];
  mastery: WEAPON_MASTERY | null;
  versatileDamage: WeaponDamage | null;
  handSlots: number;
  propertyLabels: string[];
  masteryLabels: string[];
};

const damageTypeByKey: Partial<Record<string, DAMAGE_TYPE>> = {
  acid: DAMAGE_TYPE.ACID,
  bludgeoning: DAMAGE_TYPE.BLUDGEONING,
  cold: DAMAGE_TYPE.COLD,
  fire: DAMAGE_TYPE.FIRE,
  force: DAMAGE_TYPE.FORCE,
  lightning: DAMAGE_TYPE.LIGHTNING,
  necrotic: DAMAGE_TYPE.NECROTIC,
  piercing: DAMAGE_TYPE.PIERCING,
  poison: DAMAGE_TYPE.POISON,
  psychic: DAMAGE_TYPE.PSYCHIC,
  radiant: DAMAGE_TYPE.RADIANT,
  slashing: DAMAGE_TYPE.SLASHING,
  thunder: DAMAGE_TYPE.THUNDER
};

const weaponPropertyByName: Partial<Record<string, WEAPON_PROPERTY>> = {
  Ammunition: WEAPON_PROPERTY.AMMUNITION,
  Finesse: WEAPON_PROPERTY.FINESSE,
  Heavy: WEAPON_PROPERTY.HEAVY,
  Light: WEAPON_PROPERTY.LIGHT,
  Loading: WEAPON_PROPERTY.LOADING,
  Range: WEAPON_PROPERTY.RANGE,
  Reach: WEAPON_PROPERTY.REACH,
  Thrown: WEAPON_PROPERTY.THROWN,
  "Two-Handed": WEAPON_PROPERTY.TWO_HANDED,
  Versatile: WEAPON_PROPERTY.VERSATILE
};

const weaponMasteryByName: Partial<Record<string, WEAPON_MASTERY>> = {
  Cleave: WEAPON_MASTERY.CLEAVE,
  Graze: WEAPON_MASTERY.GRAZE,
  Nick: WEAPON_MASTERY.NICK,
  Push: WEAPON_MASTERY.PUSH,
  Sap: WEAPON_MASTERY.SAP,
  Slow: WEAPON_MASTERY.SLOW,
  Topple: WEAPON_MASTERY.TOPPLE,
  Vex: WEAPON_MASTERY.VEX
};

const diceBySides: Record<string, DICE> = {
  "4": DICE.D4,
  "6": DICE.D6,
  "8": DICE.D8,
  "10": DICE.D10,
  "12": DICE.D12,
  "20": DICE.D20
};

const rangedWeaponNames = new Set([
  "Blowgun",
  "Dart",
  "Hand Crossbow",
  "Heavy Crossbow",
  "Light Crossbow",
  "Longbow",
  "Musket",
  "Pistol",
  "Shortbow",
  "Sling"
]);

export function parseItemWeaponDamage(
  damageDice: string | null | undefined,
  damageTypeKey: string | null | undefined
): WeaponDamage | null {
  const match = damageDice?.trim().match(/^(\d+)d(4|6|8|10|12|20)$/i);

  if (!match || !damageTypeKey) {
    return null;
  }

  const count = Number(match[1]);
  const die = diceBySides[match[2]];
  const damageType = damageTypeByKey[damageTypeKey];

  if (!count || !die || !damageType) {
    return null;
  }

  return Array.from({ length: count }, () => [die, damageType] as WeaponDamage[number]);
}

function formatItemWeaponPropertyLabel(entry: Open5eItemWeaponPropertyRecord) {
  const name = entry.property.name?.trim();

  if (!name) {
    return null;
  }

  return entry.detail ? `${name} (${entry.detail})` : name;
}

export function inferItemWeaponCombatType(item: ItemRecord): WEAPON_COMBAT_TYPE | null {
  const weapon = item.weapon;

  if (!weapon) {
    return null;
  }

  const propertyNames = weapon.properties.map((entry) => entry.property.name);

  if (propertyNames.includes("Ammunition") || rangedWeaponNames.has(weapon.name)) {
    return WEAPON_COMBAT_TYPE.RANGED;
  }

  return WEAPON_COMBAT_TYPE.MELEE;
}

function parseVersatileWeaponDamage(
  propertyEntries: Open5eItemWeaponPropertyRecord[],
  damageTypeKey: string | null | undefined
): WeaponDamage | null {
  const versatileEntry = propertyEntries.find((entry) => entry.property.name === "Versatile");
  const match = versatileEntry?.detail?.match(/(\d+)d(4|6|8|10|12|20)/i);

  if (!match) {
    return null;
  }

  return parseItemWeaponDamage(match[0], damageTypeKey);
}

export function adaptItemWeapon(item: ItemRecord): AdaptedItemWeaponRecord | null {
  const weapon = item.weapon;

  if (!weapon) {
    return null;
  }

  const propertyEntries = weapon.properties.filter((entry) => entry.property.type !== "Mastery");
  const masteryEntries = weapon.properties.filter((entry) => entry.property.type === "Mastery");
  const properties = propertyEntries
    .map((entry) => weaponPropertyByName[entry.property.name])
    .filter((value): value is WEAPON_PROPERTY => value !== undefined);

  return {
    type: {
      training: weapon.is_martial ? WEAPON_TRAINING.MARTIAL : WEAPON_TRAINING.SIMPLE,
      combat: inferItemWeaponCombatType(item) ?? WEAPON_COMBAT_TYPE.MELEE
    },
    damage: parseItemWeaponDamage(weapon.damage_dice, weapon.damage_type?.key),
    damageLabel: weapon.damage_type?.name
      ? `${weapon.damage_dice} ${weapon.damage_type.name}`
      : weapon.damage_dice,
    properties,
    mastery:
      masteryEntries
        .map((entry) => weaponMasteryByName[entry.property.name])
        .find((value): value is WEAPON_MASTERY => value !== undefined) ?? null,
    versatileDamage: parseVersatileWeaponDamage(propertyEntries, weapon.damage_type?.key),
    handSlots: properties.includes(WEAPON_PROPERTY.TWO_HANDED) ? 2 : 1,
    propertyLabels: propertyEntries
      .map(formatItemWeaponPropertyLabel)
      .filter((value): value is string => Boolean(value)),
    masteryLabels: masteryEntries
      .map(formatItemWeaponPropertyLabel)
      .filter((value): value is string => Boolean(value))
  };
}
