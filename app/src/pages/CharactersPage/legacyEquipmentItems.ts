import {
  ARMOR_TYPES,
  DAMAGE_TYPE,
  ENTRY_CATEGORIES,
  ITEM_TYPES,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  CURRENCY_TYPE,
  type ArmorEntry,
  type ItemEntry,
  type WeaponDamage,
  type WeaponEntry
} from "../../codex/entries";
import type {
  CharacterCustomEquipment,
  CharacterEquipmentItem,
  CharacterInventoryItem,
  CharacterItemMods,
  CustomArmorType,
  ItemDetailReference,
  ItemDetailWeaponPropertyRecord,
  ItemRecord
} from "../../types";
import { formatCodexLabel, formatWeaponDamageFormula } from "../../utils/codex";
import { createCharacterInventoryItem } from "./inventoryItems";
import { createCustomItemRecordFromMods } from "./itemMods";
import { getLoadoutCodexEntryByName } from "./proficiency";

type LegacyLoadoutEntry = WeaponEntry | ArmorEntry | ItemEntry;

const localDocument = {
  key: "local",
  name: "Local",
  display_name: "Local"
};

function createReference(key: string, name: string): ItemDetailReference {
  return {
    key,
    name
  };
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatEquipmentCostAsItemCost(cost: LegacyLoadoutEntry["cost"]): string {
  const copperMultiplier: Record<CURRENCY_TYPE, number> = {
    [CURRENCY_TYPE.CP]: 1,
    [CURRENCY_TYPE.SP]: 10,
    [CURRENCY_TYPE.EP]: 50,
    [CURRENCY_TYPE.GP]: 100,
    [CURRENCY_TYPE.PP]: 1000
  };
  const goldValue = (cost.amount * copperMultiplier[cost.currency]) / 100;

  return Number.isInteger(goldValue)
    ? String(goldValue)
    : goldValue.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function getFirstDamageType(damage: WeaponDamage): DAMAGE_TYPE {
  const firstType = damage[0]?.[1];
  return Array.isArray(firstType) ? (firstType[0] ?? DAMAGE_TYPE.SLASHING) : firstType;
}

function createWeaponPropertyRecord(
  property: WEAPON_PROPERTY,
  detail: string | null = null
): ItemDetailWeaponPropertyRecord {
  return {
    detail,
    property: {
      name: formatCodexLabel(property),
      type: null
    }
  };
}

function createWeaponMasteryRecord(mastery: WEAPON_MASTERY): ItemDetailWeaponPropertyRecord {
  return {
    detail: null,
    property: {
      name: formatCodexLabel(mastery),
      type: "Mastery"
    }
  };
}

function getWeaponPropertyDetail(property: WEAPON_PROPERTY, entry: WeaponEntry): string | null {
  if (property === WEAPON_PROPERTY.RANGE && entry.range) {
    return `${entry.range.normal}/${entry.range.long}`;
  }

  if (property === WEAPON_PROPERTY.AMMUNITION && entry.range?.ammunition) {
    return entry.range.ammunition;
  }

  if (property === WEAPON_PROPERTY.VERSATILE && entry.versatileDamage?.length) {
    return formatWeaponDamageFormula(entry.versatileDamage);
  }

  return null;
}

function getArmorType(entry: ArmorEntry): CustomArmorType {
  if (entry.tags.includes(ARMOR_TYPES.SHIELD)) {
    return "shield";
  }

  if (entry.tags.includes(ARMOR_TYPES.HEAVY_ARMOR)) {
    return "heavy";
  }

  if (entry.tags.includes(ARMOR_TYPES.MEDIUM_ARMOR)) {
    return "medium";
  }

  return "light";
}

function getItemCategory(entry: LegacyLoadoutEntry): ItemDetailReference {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return createReference("weapon", "Weapon");
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    return entry.tags.includes(ARMOR_TYPES.SHIELD)
      ? createReference("shield", "Shield")
      : createReference("armor", "Armor");
  }

  return entry.tags.includes(ITEM_TYPES.TOOLKIT)
    ? createReference("tool", "Tool")
    : createReference("adventuring-gear", "Adventuring Gear");
}

export function createItemRecordFromLoadoutEntry(entry: LegacyLoadoutEntry): ItemRecord {
  const id = `local-${entry.id}`;
  const item: ItemRecord = {
    id,
    key: id,
    name: entry.name,
    desc: entry.summary,
    category: getItemCategory(entry),
    rarity:
      "rarity" in entry
        ? createReference(String(entry.rarity).toLowerCase(), formatCodexLabel(entry.rarity))
        : createReference("common", "Common"),
    is_magic_item: false,
    weapon: null,
    armor: null,
    weight: entry.weight === null ? "" : String(entry.weight),
    weight_unit: "lb.",
    cost: formatEquipmentCostAsItemCost(entry.cost),
    requires_attunement: false,
    attunement_detail: null,
    document: localDocument
  };

  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    const damageType = getFirstDamageType(entry.damage);

    item.weapon = {
      name: entry.name,
      damage_dice: formatWeaponDamageFormula(entry.damage),
      damage_type: createReference(String(damageType).toLowerCase(), formatCodexLabel(damageType)),
      is_martial: entry.type.training === "MARTIAL",
      properties: [
        ...entry.properties.map((property) =>
          createWeaponPropertyRecord(property, getWeaponPropertyDetail(property, entry))
        ),
        createWeaponMasteryRecord(entry.mastery)
      ]
    };
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    const armorType = getArmorType(entry);

    item.armor = {
      category: armorType === "shield" ? "Shield" : formatCodexLabel(armorType),
      ac_base: armorType === "shield" ? 0 : entry.armorBase,
      ac_display: armorType === "shield" ? `+${entry.shieldBonus}` : String(entry.armorBase),
      ac_add_dexmod: armorType === "light" || armorType === "medium",
      ac_cap_dexmod: armorType === "medium" ? 2 : armorType === "heavy" ? 0 : null,
      grants_stealth_disadvantage: false,
      strength_score_required: null
    };
  }

  return item;
}

function createCustomItemMods(entry: CharacterCustomEquipment): CharacterItemMods {
  const baseFields = {
    isCustom: true,
    name: entry.name,
    description: entry.description,
    cost: entry.cost,
    weight: entry.weight
  };

  if (entry.kind === "weapon") {
    return {
      ...baseFields,
      baseCategory: "weapon",
      weapon: {
        baseWeapon: entry.baseWeapon,
        training: entry.type.training,
        combat: entry.type.combat,
        damage: entry.damage,
        properties: entry.properties,
        mastery: entry.mastery,
        range: entry.range,
        versatileDamage: entry.versatileDamage
      }
    };
  }

  if (entry.kind === "armor") {
    return {
      ...baseFields,
      baseCategory: "armor",
      armor: {
        armorType: entry.armorType,
        armorClass: entry.armorType === "shield" ? entry.shieldBonus : entry.armorBase
      }
    };
  }

  return {
    ...baseFields,
    baseCategory: "general"
  };
}

function createCustomInventoryItem(entry: CharacterCustomEquipment): CharacterInventoryItem {
  const mods = createCustomItemMods(entry);
  const item = createCustomItemRecordFromMods(`custom-item-${normalizeKey(entry.id)}`, mods);

  return createCharacterInventoryItem(item, {
    quantity: 1,
    onHand: entry.kind === "weapon" ? entry.onHand : false,
    worn: entry.kind === "armor" && entry.armorType !== "shield" ? entry.worn : false,
    mods
  });
}

export function convertLegacyEquipmentToInventoryItems(
  equipment: CharacterEquipmentItem[],
  customEquipment: CharacterCustomEquipment[]
): CharacterInventoryItem[] {
  return [
    ...equipment.flatMap((entry) => {
      const loadoutEntry = getLoadoutCodexEntryByName(entry.name);

      if (!loadoutEntry) {
        return [];
      }

      return [
        createCharacterInventoryItem(createItemRecordFromLoadoutEntry(loadoutEntry), {
          quantity: 1,
          onHand: entry.onHand,
          worn: loadoutEntry.category === ENTRY_CATEGORIES.ARMOR ? entry.worn : false
        })
      ];
    }),
    ...customEquipment.map(createCustomInventoryItem)
  ];
}
