import {
  ENTRY_CATEGORIES,
  type ArmorEntry,
  type ItemEntry,
  type WeaponEntry
} from "../../../../codex/entries";
import type { ItemRecord } from "../../../../types";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import type { ResolvedCustomLoadoutEntry } from "../../../../pages/CharactersPage/customEquipment";
import {
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  type HeldWeaponDescriptor
} from "../../../../pages/CharactersPage/inventory";
import { isShieldArmorEntry } from "../../../../pages/CharactersPage/armor";
import {
  isItemBodyArmorRecord,
  isItemShieldRecord,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import { formatCodexList } from "../../../../utils/codex";

export type LoadoutDrawerEntry = ArmorEntry | ItemEntry | WeaponEntry | ResolvedCustomLoadoutEntry;
export type EquipmentGroupKey = "weaponsAndStaff" | "armorAndShield" | "generalEquipment";

export type LoadoutGroupItem = {
  key: string;
  name: string;
  entry: LoadoutDrawerEntry;
  customEquipmentId?: string;
  featureManagedSource?: string;
  summaryText?: string;
  onHand: boolean;
  worn: boolean;
};

export type EquipmentGroup = {
  key: EquipmentGroupKey;
  title: string;
  description: string;
  items: LoadoutGroupItem[];
};

export type InventoryEquipmentGroup = Omit<EquipmentGroup, "items"> & {
  items: GroupedInventoryItem[];
};

export const equipmentGroupMeta: Array<Omit<EquipmentGroup, "items">> = [
  {
    key: "weaponsAndStaff",
    title: "Weapons & Staff",
    description: "Anything the user holds in their arm while fighting."
  },
  {
    key: "armorAndShield",
    title: "Armor and Shield",
    description: "Anything that contributes to Armor Class (AC)."
  },
  {
    key: "generalEquipment",
    title: "General Equipment",
    description: "Everything else."
  }
];

export function isHandEquippableEntry(entry: LoadoutDrawerEntry): boolean {
  return (
    entry.category === ENTRY_CATEGORIES.WEAPONS ||
    (entry.category === ENTRY_CATEGORIES.ARMOR && isShieldArmorEntry(entry))
  );
}

export function createHeldDescriptorForEntry(
  key: string,
  entry: LoadoutDrawerEntry
): HeldWeaponDescriptor | null {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return createHeldWeaponDescriptor(key, entry);
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR && isShieldArmorEntry(entry)) {
    return createHeldShieldDescriptor(key);
  }

  return null;
}

export function getArmorTypeSummary(entry: ArmorEntry): string {
  if (isShieldArmorEntry(entry)) {
    return "Shield";
  }

  return formatCodexList(entry.tags);
}

export function formatWeightValue(weight: number): string {
  if (Number.isInteger(weight)) {
    return `${weight}`;
  }

  return `${weight}`.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function normalizeCurrencyAmountInput(value: string, fallback: number): number {
  const numericOnly = value.replace(/[^\d]/g, "");

  if (numericOnly.length === 0) {
    return 0;
  }

  const withoutLeadingZeros = numericOnly.replace(/^0+(?=\d)/, "");
  return Math.floor(clampNumber(withoutLeadingZeros, 0, 999999999, fallback));
}

function getEquipmentGroupKeyForEntry(entry: LoadoutDrawerEntry): EquipmentGroupKey {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return "weaponsAndStaff";
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    return "armorAndShield";
  }

  return "generalEquipment";
}

function getEquipmentGroupKeyForInventoryItem(item: ItemRecord): EquipmentGroupKey {
  if (
    item.weapon ||
    item.category?.key === "staff" ||
    item.category?.key === "spellcasting-focus"
  ) {
    return "weaponsAndStaff";
  }

  if (isItemShieldRecord(item) || isItemBodyArmorRecord(item)) {
    return "armorAndShield";
  }

  return "generalEquipment";
}

export function groupEquipmentItems(items: LoadoutGroupItem[]): EquipmentGroup[] {
  const groupedItems: Record<EquipmentGroupKey, LoadoutGroupItem[]> = {
    weaponsAndStaff: [],
    armorAndShield: [],
    generalEquipment: []
  };

  items.forEach((item) => {
    groupedItems[getEquipmentGroupKeyForEntry(item.entry)].push(item);
  });

  return equipmentGroupMeta.map((group) => ({
    ...group,
    items: groupedItems[group.key]
  }));
}

export function groupInventoryEquipmentItems(
  items: GroupedInventoryItem[]
): InventoryEquipmentGroup[] {
  const groupedItems: Record<EquipmentGroupKey, GroupedInventoryItem[]> = {
    weaponsAndStaff: [],
    armorAndShield: [],
    generalEquipment: []
  };

  items.forEach((item) => {
    groupedItems[getEquipmentGroupKeyForInventoryItem(item.item)].push(item);
  });

  return equipmentGroupMeta.map((group) => ({
    ...group,
    items: groupedItems[group.key]
  }));
}

export function formatInventoryStackName(item: GroupedInventoryItem): string {
  return item.count > 1 ? `${item.count}x ${item.name}` : item.name;
}

export function formatOnHandLabel(onHandCount: number): string {
  return onHandCount > 1 ? `On Hand x${onHandCount}` : "On Hand";
}
