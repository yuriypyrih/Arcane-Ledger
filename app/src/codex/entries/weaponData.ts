import {
  CURRENCY_TYPE,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  RARITY_TYPES,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING
} from "./enums";
import type { WeaponDamage, WeaponEntry } from "./types";
import { psychicBladeWeaponName, psychicBladeWeaponSummary } from "./featureWeapons";

type WeaponSeed = Omit<WeaponEntry, "id" | "category" | "rarity" | "summary"> & {
  rarity?: RARITY_TYPES;
  summary?: string;
};

const weaponBaseByName: Record<string, WEAPON_BASE> = {
  Club: WEAPON_BASE.CLUB,
  Dagger: WEAPON_BASE.DAGGER,
  Greatclub: WEAPON_BASE.GREATCLUB,
  Handaxe: WEAPON_BASE.HANDAXE,
  Javelin: WEAPON_BASE.JAVELIN,
  "Light Hammer": WEAPON_BASE.LIGHT_HAMMER,
  Mace: WEAPON_BASE.MACE,
  Quarterstaff: WEAPON_BASE.QUARTERSTAFF,
  Sickle: WEAPON_BASE.SICKLE,
  Spear: WEAPON_BASE.SPEAR,
  Dart: WEAPON_BASE.DART,
  "Light Crossbow": WEAPON_BASE.LIGHT_CROSSBOW,
  Shortbow: WEAPON_BASE.SHORTBOW,
  Sling: WEAPON_BASE.SLING,
  Battleaxe: WEAPON_BASE.BATTLEAXE,
  Flail: WEAPON_BASE.FLAIL,
  Glaive: WEAPON_BASE.GLAIVE,
  Greataxe: WEAPON_BASE.GREATAXE,
  Greatsword: WEAPON_BASE.GREATSWORD,
  Halberd: WEAPON_BASE.HALBERD,
  Lance: WEAPON_BASE.LANCE,
  Longsword: WEAPON_BASE.LONGSWORD,
  Maul: WEAPON_BASE.MAUL,
  Morningstar: WEAPON_BASE.MORNINGSTAR,
  Pike: WEAPON_BASE.PIKE,
  Rapier: WEAPON_BASE.RAPIER,
  Scimitar: WEAPON_BASE.SCIMITAR,
  Shortsword: WEAPON_BASE.SHORTSWORD,
  Trident: WEAPON_BASE.TRIDENT,
  Warhammer: WEAPON_BASE.WARHAMMER,
  "War Pick": WEAPON_BASE.WAR_PICK,
  Whip: WEAPON_BASE.WHIP,
  Blowgun: WEAPON_BASE.BLOWGUN,
  "Hand Crossbow": WEAPON_BASE.HAND_CROSSBOW,
  "Heavy Crossbow": WEAPON_BASE.HEAVY_CROSSBOW,
  Longbow: WEAPON_BASE.LONGBOW,
  Musket: WEAPON_BASE.MUSKET,
  Pistol: WEAPON_BASE.PISTOL
};

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatPropertyLabel(property: WEAPON_PROPERTY): string {
  if (property === WEAPON_PROPERTY.TWO_HANDED) {
    return "Two-Handed";
  }

  return formatLabel(property).toLowerCase();
}

function formatSentenceList(values: string[]): string {
  if (values.length === 0) {
    return "no special";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function createWeaponSummary(weapon: WeaponSeed): string {
  const typeLabel = `${weapon.type.training.toLowerCase()} ${weapon.type.combat.toLowerCase()} weapon`;
  const propertyLabels = weapon.properties
    .filter((property) => property !== WEAPON_PROPERTY.RANGE)
    .map((property) => formatPropertyLabel(property));

  if (propertyLabels.length === 0) {
    return `A ${typeLabel} with ${weapon.mastery.toLowerCase()} mastery and no special properties.`;
  }

  return `A ${typeLabel} with ${formatSentenceList(propertyLabels)} properties and ${weapon.mastery.toLowerCase()} mastery.`;
}

function createWeaponId(name: string): string {
  return `weapon-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function createWeaponEntry(weapon: WeaponSeed): WeaponEntry {
  const { rarity = RARITY_TYPES.COMMON, summary, ...weaponDefinition } = weapon;

  return {
    id: createWeaponId(weaponDefinition.name),
    category: ENTRY_CATEGORIES.WEAPONS,
    baseWeapon: weaponDefinition.baseWeapon ?? weaponBaseByName[weaponDefinition.name],
    rarity,
    summary: summary?.trim() ? summary : createWeaponSummary(weaponDefinition),
    ...weaponDefinition
  };
}

const bludgeoning = (amount: WeaponDamage[number][0]): WeaponDamage => [
  [amount, DAMAGE_TYPE.BLUDGEONING]
];
const piercing = (amount: WeaponDamage[number][0]): WeaponDamage => [
  [amount, DAMAGE_TYPE.PIERCING]
];
const slashing = (amount: WeaponDamage[number][0]): WeaponDamage => [
  [amount, DAMAGE_TYPE.SLASHING]
];

export const weaponEntries: WeaponEntry[] = [
  createWeaponEntry({
    name: psychicBladeWeaponName,
    summary: psychicBladeWeaponSummary,
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: [[DICE.D6, DAMAGE_TYPE.PSYCHIC]],
    properties: [WEAPON_PROPERTY.FINESSE, WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE],
    mastery: WEAPON_MASTERY.VEX,
    weight: 0,
    cost: { amount: 0, currency: CURRENCY_TYPE.GP },
    range: { normal: 60, long: 120 }
  }),
  createWeaponEntry({
    name: "Club",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: bludgeoning(DICE.D4),
    properties: [WEAPON_PROPERTY.LIGHT],
    mastery: WEAPON_MASTERY.SLOW,
    weight: 2,
    cost: { amount: 1, currency: CURRENCY_TYPE.SP }
  }),
  createWeaponEntry({
    name: "Dagger",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: piercing(DICE.D4),
    properties: [
      WEAPON_PROPERTY.FINESSE,
      WEAPON_PROPERTY.LIGHT,
      WEAPON_PROPERTY.THROWN,
      WEAPON_PROPERTY.RANGE
    ],
    mastery: WEAPON_MASTERY.NICK,
    weight: 1,
    cost: { amount: 2, currency: CURRENCY_TYPE.GP },
    range: { normal: 20, long: 60 }
  }),
  createWeaponEntry({
    name: "Greatclub",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: bludgeoning(DICE.D8),
    properties: [WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.PUSH,
    weight: 10,
    cost: { amount: 2, currency: CURRENCY_TYPE.SP }
  }),
  createWeaponEntry({
    name: "Handaxe",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: slashing(DICE.D6),
    properties: [WEAPON_PROPERTY.LIGHT, WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE],
    mastery: WEAPON_MASTERY.VEX,
    weight: 2,
    cost: { amount: 5, currency: CURRENCY_TYPE.GP },
    range: { normal: 20, long: 60 }
  }),
  createWeaponEntry({
    name: "Javelin",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: piercing(DICE.D6),
    properties: [WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE],
    mastery: WEAPON_MASTERY.SLOW,
    weight: 2,
    cost: { amount: 5, currency: CURRENCY_TYPE.SP },
    range: { normal: 30, long: 120 }
  }),
  createWeaponEntry({
    name: "Light Hammer",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: bludgeoning(DICE.D4),
    properties: [WEAPON_PROPERTY.LIGHT, WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE],
    mastery: WEAPON_MASTERY.NICK,
    weight: 2,
    cost: { amount: 2, currency: CURRENCY_TYPE.GP },
    range: { normal: 20, long: 60 }
  }),
  createWeaponEntry({
    name: "Mace",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: bludgeoning(DICE.D6),
    properties: [],
    mastery: WEAPON_MASTERY.SAP,
    weight: 4,
    cost: { amount: 5, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Quarterstaff",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: bludgeoning(DICE.D6),
    properties: [WEAPON_PROPERTY.VERSATILE],
    mastery: WEAPON_MASTERY.TOPPLE,
    weight: 4,
    cost: { amount: 2, currency: CURRENCY_TYPE.SP },
    versatileDamage: bludgeoning(DICE.D8)
  }),
  createWeaponEntry({
    name: "Sickle",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: slashing(DICE.D4),
    properties: [WEAPON_PROPERTY.LIGHT],
    mastery: WEAPON_MASTERY.NICK,
    weight: 2,
    cost: { amount: 1, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Spear",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.SIMPLE },
    damage: piercing(DICE.D6),
    properties: [WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE, WEAPON_PROPERTY.VERSATILE],
    mastery: WEAPON_MASTERY.SAP,
    weight: 3,
    cost: { amount: 1, currency: CURRENCY_TYPE.GP },
    range: { normal: 20, long: 60 },
    versatileDamage: piercing(DICE.D8)
  }),
  createWeaponEntry({
    name: "Dart",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.SIMPLE },
    damage: piercing(DICE.D4),
    properties: [WEAPON_PROPERTY.FINESSE, WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE],
    mastery: WEAPON_MASTERY.VEX,
    weight: 0.25,
    cost: { amount: 5, currency: CURRENCY_TYPE.CP },
    range: { normal: 20, long: 60 }
  }),
  createWeaponEntry({
    name: "Light Crossbow",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.SIMPLE },
    damage: piercing(DICE.D8),
    properties: [
      WEAPON_PROPERTY.AMMUNITION,
      WEAPON_PROPERTY.RANGE,
      WEAPON_PROPERTY.LOADING,
      WEAPON_PROPERTY.TWO_HANDED
    ],
    mastery: WEAPON_MASTERY.SLOW,
    weight: 5,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    range: { normal: 80, long: 320, ammunition: "Bolt" }
  }),
  createWeaponEntry({
    name: "Shortbow",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.SIMPLE },
    damage: piercing(DICE.D6),
    properties: [WEAPON_PROPERTY.AMMUNITION, WEAPON_PROPERTY.RANGE, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.VEX,
    weight: 2,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    range: { normal: 80, long: 320, ammunition: "Arrow" }
  }),
  createWeaponEntry({
    name: "Sling",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.SIMPLE },
    damage: bludgeoning(DICE.D4),
    properties: [WEAPON_PROPERTY.AMMUNITION, WEAPON_PROPERTY.RANGE],
    mastery: WEAPON_MASTERY.SLOW,
    weight: null,
    cost: { amount: 1, currency: CURRENCY_TYPE.SP },
    range: { normal: 30, long: 120, ammunition: "Bullet" }
  }),
  createWeaponEntry({
    name: "Battleaxe",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: slashing(DICE.D8),
    properties: [WEAPON_PROPERTY.VERSATILE],
    mastery: WEAPON_MASTERY.TOPPLE,
    weight: 4,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP },
    versatileDamage: slashing(DICE.D10)
  }),
  createWeaponEntry({
    name: "Flail",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: bludgeoning(DICE.D8),
    properties: [],
    mastery: WEAPON_MASTERY.SAP,
    weight: 2,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Glaive",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: slashing(DICE.D10),
    properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.REACH, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.GRAZE,
    weight: 6,
    cost: { amount: 20, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Greataxe",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: slashing(DICE.D12),
    properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.CLEAVE,
    weight: 7,
    cost: { amount: 30, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Greatsword",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: [
      [DICE.D6, DAMAGE_TYPE.SLASHING],
      [DICE.D6, DAMAGE_TYPE.SLASHING]
    ],
    properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.GRAZE,
    weight: 6,
    cost: { amount: 50, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Halberd",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: slashing(DICE.D10),
    properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.REACH, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.CLEAVE,
    weight: 6,
    cost: { amount: 20, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Lance",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D10),
    properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.REACH, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.TOPPLE,
    weight: 6,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP },
    propertyNotes: { [WEAPON_PROPERTY.TWO_HANDED]: "unless mounted" }
  }),
  createWeaponEntry({
    name: "Longsword",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: slashing(DICE.D8),
    properties: [WEAPON_PROPERTY.VERSATILE],
    mastery: WEAPON_MASTERY.SAP,
    weight: 3,
    cost: { amount: 15, currency: CURRENCY_TYPE.GP },
    versatileDamage: slashing(DICE.D10)
  }),
  createWeaponEntry({
    name: "Maul",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: [
      [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
      [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
    ],
    properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.TOPPLE,
    weight: 10,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Morningstar",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D8),
    properties: [],
    mastery: WEAPON_MASTERY.SAP,
    weight: 4,
    cost: { amount: 15, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Pike",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D10),
    properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.REACH, WEAPON_PROPERTY.TWO_HANDED],
    mastery: WEAPON_MASTERY.PUSH,
    weight: 18,
    cost: { amount: 5, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Rapier",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D8),
    properties: [WEAPON_PROPERTY.FINESSE],
    mastery: WEAPON_MASTERY.VEX,
    weight: 2,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Scimitar",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: slashing(DICE.D6),
    properties: [WEAPON_PROPERTY.FINESSE, WEAPON_PROPERTY.LIGHT],
    mastery: WEAPON_MASTERY.NICK,
    weight: 3,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Shortsword",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D6),
    properties: [WEAPON_PROPERTY.FINESSE, WEAPON_PROPERTY.LIGHT],
    mastery: WEAPON_MASTERY.VEX,
    weight: 2,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Trident",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D8),
    properties: [WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE, WEAPON_PROPERTY.VERSATILE],
    mastery: WEAPON_MASTERY.TOPPLE,
    weight: 4,
    cost: { amount: 5, currency: CURRENCY_TYPE.GP },
    range: { normal: 20, long: 60 },
    versatileDamage: piercing(DICE.D10)
  }),
  createWeaponEntry({
    name: "Warhammer",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: bludgeoning(DICE.D8),
    properties: [WEAPON_PROPERTY.VERSATILE],
    mastery: WEAPON_MASTERY.PUSH,
    weight: 5,
    cost: { amount: 15, currency: CURRENCY_TYPE.GP },
    versatileDamage: bludgeoning(DICE.D10)
  }),
  createWeaponEntry({
    name: "War Pick",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D8),
    properties: [WEAPON_PROPERTY.VERSATILE],
    mastery: WEAPON_MASTERY.SAP,
    weight: 2,
    cost: { amount: 5, currency: CURRENCY_TYPE.GP },
    versatileDamage: piercing(DICE.D10)
  }),
  createWeaponEntry({
    name: "Whip",
    type: { combat: WEAPON_COMBAT_TYPE.MELEE, training: WEAPON_TRAINING.MARTIAL },
    damage: slashing(DICE.D4),
    properties: [WEAPON_PROPERTY.FINESSE, WEAPON_PROPERTY.REACH],
    mastery: WEAPON_MASTERY.SLOW,
    weight: 3,
    cost: { amount: 2, currency: CURRENCY_TYPE.GP }
  }),
  createWeaponEntry({
    name: "Blowgun",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.MARTIAL },
    damage: [[1, DAMAGE_TYPE.PIERCING]],
    properties: [WEAPON_PROPERTY.AMMUNITION, WEAPON_PROPERTY.RANGE, WEAPON_PROPERTY.LOADING],
    mastery: WEAPON_MASTERY.VEX,
    weight: 1,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP },
    range: { normal: 25, long: 100, ammunition: "Needle" }
  }),
  createWeaponEntry({
    name: "Hand Crossbow",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D6),
    properties: [
      WEAPON_PROPERTY.AMMUNITION,
      WEAPON_PROPERTY.RANGE,
      WEAPON_PROPERTY.LIGHT,
      WEAPON_PROPERTY.LOADING
    ],
    mastery: WEAPON_MASTERY.VEX,
    weight: 3,
    cost: { amount: 75, currency: CURRENCY_TYPE.GP },
    range: { normal: 30, long: 120, ammunition: "Bolt" }
  }),
  createWeaponEntry({
    name: "Heavy Crossbow",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D10),
    properties: [
      WEAPON_PROPERTY.AMMUNITION,
      WEAPON_PROPERTY.RANGE,
      WEAPON_PROPERTY.HEAVY,
      WEAPON_PROPERTY.LOADING,
      WEAPON_PROPERTY.TWO_HANDED
    ],
    mastery: WEAPON_MASTERY.PUSH,
    weight: 18,
    cost: { amount: 50, currency: CURRENCY_TYPE.GP },
    range: { normal: 100, long: 400, ammunition: "Bolt" }
  }),
  createWeaponEntry({
    name: "Longbow",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D8),
    properties: [
      WEAPON_PROPERTY.AMMUNITION,
      WEAPON_PROPERTY.RANGE,
      WEAPON_PROPERTY.HEAVY,
      WEAPON_PROPERTY.TWO_HANDED
    ],
    mastery: WEAPON_MASTERY.SLOW,
    weight: 2,
    cost: { amount: 50, currency: CURRENCY_TYPE.GP },
    range: { normal: 150, long: 600, ammunition: "Arrow" }
  }),
  createWeaponEntry({
    name: "Musket",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D12),
    properties: [
      WEAPON_PROPERTY.AMMUNITION,
      WEAPON_PROPERTY.RANGE,
      WEAPON_PROPERTY.LOADING,
      WEAPON_PROPERTY.TWO_HANDED
    ],
    mastery: WEAPON_MASTERY.SLOW,
    weight: 10,
    cost: { amount: 500, currency: CURRENCY_TYPE.GP },
    range: { normal: 40, long: 120, ammunition: "Bullet" }
  }),
  createWeaponEntry({
    name: "Pistol",
    type: { combat: WEAPON_COMBAT_TYPE.RANGED, training: WEAPON_TRAINING.MARTIAL },
    damage: piercing(DICE.D10),
    properties: [WEAPON_PROPERTY.AMMUNITION, WEAPON_PROPERTY.RANGE, WEAPON_PROPERTY.LOADING],
    mastery: WEAPON_MASTERY.VEX,
    weight: 3,
    cost: { amount: 250, currency: CURRENCY_TYPE.GP },
    range: { normal: 30, long: 90, ammunition: "Bullet" }
  })
];
