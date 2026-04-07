import {
  ARMOR_TYPES,
  ENTRY_CATEGORIES,
  ITEM_TYPES,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  type ArmorEntry,
  type BackgroundEntry,
  type ItemEntry,
  type SpeciesEntry,
  type WeaponEntry
} from "../../codex/entries";
import {
  getBackgroundEntries,
  getLoadoutEntries,
  getSpeciesEntries
} from "../../codex/selectors";
import type { ArmorType } from "./proficiencyClassData";
import type { WeaponType } from "./proficiencyWeaponLabels";

export type GearType = "adventuring" | "toolkit";
export type EquipmentCategory = "weapon" | "armor" | "gear";
export type LoadoutCodexEntry = WeaponEntry | ArmorEntry | ItemEntry;

export type WeaponEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "weapon";
  training: WeaponType;
  combatType: WEAPON_COMBAT_TYPE;
  properties: WEAPON_PROPERTY[];
  baseWeapon?: WEAPON_BASE;
};

export type ArmorEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "armor";
  type: ArmorType;
};

export type GearEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "gear";
  type: GearType;
};

export type EquipmentDefinition =
  | WeaponEquipmentDefinition
  | ArmorEquipmentDefinition
  | GearEquipmentDefinition;

function getArmorTypeFromTags(tags: ArmorEntry["tags"]): ArmorType | null {
  if (tags.includes(ARMOR_TYPES.LIGHT_ARMOR)) {
    return "light";
  }

  if (tags.includes(ARMOR_TYPES.MEDIUM_ARMOR)) {
    return "medium";
  }

  if (tags.includes(ARMOR_TYPES.HEAVY_ARMOR)) {
    return "heavy";
  }

  if (tags.includes(ARMOR_TYPES.SHIELD)) {
    return "shield";
  }

  return null;
}

function getGearTypeFromTags(tags: ItemEntry["tags"]): GearType {
  return tags.includes(ITEM_TYPES.TOOLKIT) ? "toolkit" : "adventuring";
}

function toEquipmentDefinition(entry: LoadoutCodexEntry): EquipmentDefinition | null {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return {
      entryId: entry.id,
      name: entry.name,
      category: "weapon",
      training: entry.type.training,
      combatType: entry.type.combat,
      properties: entry.properties,
      baseWeapon: entry.baseWeapon
    };
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    const type = getArmorTypeFromTags(entry.tags);

    if (!type) {
      return null;
    }

    return {
      entryId: entry.id,
      name: entry.name,
      category: "armor",
      type
    };
  }

  return {
    entryId: entry.id,
    name: entry.name,
    category: "gear",
    type: getGearTypeFromTags(entry.tags)
  };
}

const loadoutCodexEntries: LoadoutCodexEntry[] = getLoadoutEntries();

export const equipmentCatalog: EquipmentDefinition[] = loadoutCodexEntries
  .map((entry) => toEquipmentDefinition(entry))
  .filter((entry): entry is EquipmentDefinition => entry !== null)
  .sort((left, right) => left.name.localeCompare(right.name));

export const equipmentOptions = equipmentCatalog.map((item) => item.name);

const equipmentCatalogByName = new Map<string, EquipmentDefinition>(
  equipmentCatalog.map((item) => [item.name, item])
);

const loadoutCodexEntriesByName = new Map<string, LoadoutCodexEntry>(
  loadoutCodexEntries.map((entry) => [entry.name, entry])
);

const backgroundEntriesByName = new Map<string, BackgroundEntry>(
  getBackgroundEntries().map((entry) => [entry.name, entry])
);

const speciesEntriesByName = new Map<string, SpeciesEntry>(
  getSpeciesEntries().map((entry) => [entry.name, entry])
);

export const backgroundOptions = [...backgroundEntriesByName.keys()].sort((left, right) =>
  left.localeCompare(right)
);

export function getBackgroundEntryByName(backgroundName: string): BackgroundEntry | undefined {
  return backgroundEntriesByName.get(backgroundName);
}

export function getSpeciesEntryByName(species: string): SpeciesEntry | undefined {
  return speciesEntriesByName.get(species);
}

export function getEquipmentByName(name: string): EquipmentDefinition | undefined {
  return equipmentCatalogByName.get(name);
}

export function getLoadoutCodexEntryByName(name: string): LoadoutCodexEntry | undefined {
  return loadoutCodexEntriesByName.get(name);
}
