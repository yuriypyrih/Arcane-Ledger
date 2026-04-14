import { createElement, type ReactNode } from "react";
import {
  DAMAGE_TYPE,
  DICE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type SpellDescriptionEntry,
  type WeaponDamage,
  type WeaponEntry,
  type WeaponType
} from "../../codex/entries";
import CurrencyInlineDisplay from "../../components/CurrencyInlineDisplay";
import type { ItemRecord, Open5eItemWeaponPropertyRecord } from "../../types";
import { formatEquipmentWeight, formatWeaponType } from "../../utils/codex";
import { normalizeItemDecimalString, parseItemCost } from "../../utils/items/cost";

type DetailCell = {
  label: string;
  value: ReactNode;
  note?: ReactNode;
};

export type AdaptedItemWeaponPreview = {
  type: WeaponType;
  damage: WeaponDamage | null;
  properties: WeaponEntry["properties"];
  mastery: WeaponEntry["mastery"] | null;
  is_magic_item: boolean;
  is_attunement_needed: boolean;
  typeLabel: string;
  damageLabel: string;
  propertiesLabel: string;
  masteryLabel: string;
};

export type AdaptedItemArmorPreview = {
  typeLabel: string;
  armorBaseLabel: string;
};

export type ItemDetailPresentation = {
  name: string;
  subtitleParts: string[];
  description: SpellDescriptionEntry[];
  stapleCells: DetailCell[];
  weapon: AdaptedItemWeaponPreview | null;
  weaponCells: DetailCell[];
  armor: AdaptedItemArmorPreview | null;
  armorCells: DetailCell[];
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

function normalizeItemDescriptionInlineMarkup(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\*\*_([\s\S]+?)_\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/__\*([\s\S]+?)\*__/g, "<strong><em>$1</em></strong>")
    .replace(/(?<!\*)\*\*(?!\*)([\s\S]+?)(?<!\*)\*\*(?!\*)/g, "<strong>$1</strong>")
    .replace(/(?<!_)__(?!_)([\s\S]+?)(?<!_)__(?!_)/g, "<strong>$1</strong>")
    .replace(/(?<![\w_])_(?!_)([\s\S]+?)(?<!_)_(?![\w_])/g, "<em>$1</em>")
    .replace(/(?<![\w*])\*(?!\*)([\s\S]+?)(?<!\*)\*(?![\w*])/g, "<em>$1</em>");
}

function formatDescription(value: string | null | undefined): SpellDescriptionEntry[] {
  if (!value) {
    return [];
  }

  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => normalizeItemDescriptionInlineMarkup(paragraph));
}

function formatWeight(value: string | null | undefined, unit: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const weight = Number(value);

  if (Number.isFinite(weight)) {
    return formatEquipmentWeight(weight);
  }

  const normalized = normalizeItemDecimalString(value);
  return unit ? `${normalized ?? value} ${unit}` : normalized ?? value;
}

function formatCost(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const parsedCost = parseItemCost(value);

  if (parsedCost) {
    return createElement(CurrencyInlineDisplay, {
      cost: parsedCost
    });
  }

  return normalizeItemDecimalString(value) ?? value;
}

function formatMagicAttunement(item: ItemRecord) {
  const magicLabel = item.is_magic_item ? "Yes" : "No";
  const attunementLabel = item.requires_attunement ? "Yes" : "No";

  return {
    value: `${magicLabel} / ${attunementLabel}`,
    note: item.attunement_detail?.trim() || null
  };
}

function formatWeaponPropertyLabel(entry: Open5eItemWeaponPropertyRecord) {
  const name = entry.property.name?.trim();

  if (!name) {
    return null;
  }

  return entry.detail ? `${name} (${entry.detail})` : name;
}

function formatArmorType(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[\s_-]+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function inferWeaponCombatType(item: ItemRecord): WEAPON_COMBAT_TYPE {
  const weapon = item.weapon;

  if (!weapon) {
    return WEAPON_COMBAT_TYPE.MELEE;
  }

  const propertyNames = weapon.properties.map((entry) => entry.property.name);

  if (propertyNames.includes("Ammunition") || rangedWeaponNames.has(weapon.name)) {
    return WEAPON_COMBAT_TYPE.RANGED;
  }

  return WEAPON_COMBAT_TYPE.MELEE;
}

function parseWeaponDamage(damageDice: string, damageTypeKey: string | undefined): WeaponDamage | null {
  const match = damageDice.trim().match(/^(\d+)d(4|6|8|10|12|20)$/i);

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

function buildWeaponPresentation(item: ItemRecord): AdaptedItemWeaponPreview | null {
  const weapon = item.weapon;

  if (!weapon) {
    return null;
  }

  const training = weapon.is_martial ? WEAPON_TRAINING.MARTIAL : WEAPON_TRAINING.SIMPLE;
  const type: WeaponType = {
    training,
    combat: inferWeaponCombatType(item)
  };
  const masteryEntries = weapon.properties.filter((entry) => entry.property.type === "Mastery");
  const propertyEntries = weapon.properties.filter((entry) => entry.property.type !== "Mastery");
  const properties = propertyEntries
    .map((entry) => weaponPropertyByName[entry.property.name])
    .filter((value): value is WEAPON_PROPERTY => value !== undefined);
  const mastery =
    masteryEntries
      .map((entry) => weaponMasteryByName[entry.property.name])
      .find((value): value is WEAPON_MASTERY => value !== undefined) ?? null;
  const damage = parseWeaponDamage(weapon.damage_dice, weapon.damage_type?.key);

  return {
    type,
    damage,
    properties,
    mastery,
    is_magic_item: Boolean(item.is_magic_item),
    is_attunement_needed: Boolean(item.requires_attunement),
    typeLabel: formatWeaponType(type),
    damageLabel: weapon.damage_type?.name
      ? `${weapon.damage_dice} ${weapon.damage_type.name}`
      : weapon.damage_dice,
    propertiesLabel:
      propertyEntries.map(formatWeaponPropertyLabel).filter((value): value is string => Boolean(value)).join(", ") ||
      "None",
    masteryLabel:
      masteryEntries.map(formatWeaponPropertyLabel).filter((value): value is string => Boolean(value)).join(", ") ||
      "None"
  };
}

function buildArmorPresentation(item: ItemRecord): AdaptedItemArmorPreview | null {
  const armor = item.armor;

  if (!armor) {
    return null;
  }

  return {
    typeLabel: formatArmorType(armor.category),
    armorBaseLabel: String(armor.ac_base)
  };
}

export function buildItemDetailPresentation(item: ItemRecord): ItemDetailPresentation {
  const sourceLabel = item.document?.display_name ?? item.document?.name ?? "Unknown source";
  const rarityLabel = item.rarity?.name ?? "No rarity";
  const magicAttunement = formatMagicAttunement(item);
  const weapon = buildWeaponPresentation(item);
  const armor = buildArmorPresentation(item);

  return {
    name: item.name ?? item.key ?? "Unknown Item",
    subtitleParts: [item.category?.name ?? "Item", rarityLabel, sourceLabel],
    description: formatDescription(item.desc),
    stapleCells: [
      { label: "Weight", value: formatWeight(item.weight, item.weight_unit) },
      { label: "Cost", value: formatCost(item.cost) },
      {
        label: "Magic / Attunement",
        value: magicAttunement.value,
        note: magicAttunement.note
      }
    ],
    weapon,
    weaponCells: weapon
      ? [
          { label: "Type", value: weapon.typeLabel },
          { label: "Damage", value: weapon.damageLabel },
          { label: "Properties", value: weapon.propertiesLabel },
          { label: "Mastery", value: weapon.masteryLabel }
        ]
      : [],
    armor,
    armorCells: armor
      ? [
          { label: "Type", value: armor.typeLabel },
          { label: "Armor Base", value: armor.armorBaseLabel }
        ]
      : []
  };
}
