import { ENTRY_CATEGORIES, WEAPON_PROPERTY } from "../../codex/entries";
import type { Character } from "../../types";
import { getResolvedCustomLoadoutEntries } from "./customEquipment";
import {
  createHeldDescriptorForInventoryItem,
  createHeldInventoryItemCopyReferences
} from "./inventoryItems";
import { getLoadoutCodexEntryByName } from "./proficiency";

type HeldWeaponPropertyCharacter = Partial<
  Pick<Character, "customEquipment" | "equipment" | "inventoryItems">
>;

export function characterHasHeldWeaponProperty(
  character: HeldWeaponPropertyCharacter,
  property: WEAPON_PROPERTY
): boolean {
  const hasCodexWeaponProperty = (character.equipment ?? []).some((item) => {
    if (!item.onHand) {
      return false;
    }

    const entry = getLoadoutCodexEntryByName(item.name);
    return entry?.category === ENTRY_CATEGORIES.WEAPONS && entry.properties.includes(property);
  });

  if (hasCodexWeaponProperty) {
    return true;
  }

  const hasInventoryWeaponProperty = (character.inventoryItems ?? [])
    .flatMap(createHeldInventoryItemCopyReferences)
    .some((copy) =>
      createHeldDescriptorForInventoryItem(`inventory-${copy.id}`, copy.item)?.properties.includes(
        property
      )
    );

  if (hasInventoryWeaponProperty) {
    return true;
  }

  return getResolvedCustomLoadoutEntries(character.customEquipment ?? []).some(
    (entry) =>
      entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand && entry.properties.includes(property)
  );
}

export function characterHasHeldFinesseWeapon(character: HeldWeaponPropertyCharacter): boolean {
  return characterHasHeldWeaponProperty(character, WEAPON_PROPERTY.FINESSE);
}
