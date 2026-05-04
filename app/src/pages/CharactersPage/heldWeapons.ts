import {
  ARMOR_TYPES,
  ENTRY_CATEGORIES,
  WEAPON_BASE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING
} from "../../codex/entries";
import type { Character } from "../../types";
import { resolveWeaponBaseReference } from "../../utils/items/resolveWeaponBaseReference";
import { getResolvedCustomLoadoutEntries } from "./customEquipment";
import {
  createHeldDescriptorForInventoryItem,
  createHeldInventoryItemCopyReferences,
  getAdaptedItemWeapon,
  getInventoryItemOnHandQuantity,
  isItemShieldRecord
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
      copy.onHand &&
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

export function characterHasHeldShield(character: HeldWeaponPropertyCharacter): boolean {
  const hasCodexShield = (character.equipment ?? []).some((item) => {
    if (!item.onHand) {
      return false;
    }

    const entry = getLoadoutCodexEntryByName(item.name);

    return entry?.category === ENTRY_CATEGORIES.ARMOR && entry.tags.includes(ARMOR_TYPES.SHIELD);
  });

  if (hasCodexShield) {
    return true;
  }

  const hasInventoryShield = (character.inventoryItems ?? []).some(
    (item) => getInventoryItemOnHandQuantity(item) > 0 && isItemShieldRecord(item.item)
  );

  if (hasInventoryShield) {
    return true;
  }

  return getResolvedCustomLoadoutEntries(character.customEquipment ?? []).some(
    (entry) =>
      entry.category === ENTRY_CATEGORIES.ARMOR &&
      entry.tags.includes(ARMOR_TYPES.SHIELD) &&
      entry.worn
  );
}

function isInterceptionWeapon(
  weapon: {
    type?: {
      training?: WEAPON_TRAINING | null;
    } | null;
  } | null
): boolean {
  return (
    weapon?.type?.training === WEAPON_TRAINING.SIMPLE ||
    weapon?.type?.training === WEAPON_TRAINING.MARTIAL
  );
}

export function characterHasHeldInterceptionEquipment(
  character: HeldWeaponPropertyCharacter
): boolean {
  if (characterHasHeldShield(character)) {
    return true;
  }

  const hasCodexWeapon = (character.equipment ?? []).some((item) => {
    if (!item.onHand) {
      return false;
    }

    const entry = getLoadoutCodexEntryByName(item.name);

    return entry?.category === ENTRY_CATEGORIES.WEAPONS && isInterceptionWeapon(entry);
  });

  if (hasCodexWeapon) {
    return true;
  }

  const hasInventoryWeapon = (character.inventoryItems ?? [])
    .flatMap(createHeldInventoryItemCopyReferences)
    .some((copy) => copy.onHand && isInterceptionWeapon(getAdaptedItemWeapon(copy.item)));

  if (hasInventoryWeapon) {
    return true;
  }

  return getResolvedCustomLoadoutEntries(character.customEquipment ?? []).some(
    (entry) => entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand && isInterceptionWeapon(entry)
  );
}

function isPolearmMasterWeapon(
  weapon: {
    baseWeapon?: WEAPON_BASE | null;
    properties?: WEAPON_PROPERTY[];
  } | null
): boolean {
  if (!weapon) {
    return false;
  }

  if (weapon.baseWeapon === WEAPON_BASE.QUARTERSTAFF || weapon.baseWeapon === WEAPON_BASE.SPEAR) {
    return true;
  }

  const properties = weapon.properties ?? [];

  return (
    properties.includes(WEAPON_PROPERTY.HEAVY) && properties.includes(WEAPON_PROPERTY.REACH)
  );
}

export function characterHasHeldPolearmMasterWeapon(
  character: HeldWeaponPropertyCharacter
): boolean {
  const hasCodexPolearm = (character.equipment ?? []).some((item) => {
    if (!item.onHand) {
      return false;
    }

    const entry = getLoadoutCodexEntryByName(item.name);

    return entry?.category === ENTRY_CATEGORIES.WEAPONS && isPolearmMasterWeapon(entry);
  });

  if (hasCodexPolearm) {
    return true;
  }

  const hasInventoryPolearm = (character.inventoryItems ?? [])
    .flatMap(createHeldInventoryItemCopyReferences)
    .some((copy) => {
      const adaptedWeapon = getAdaptedItemWeapon(copy.item);

      if (!copy.onHand || !adaptedWeapon) {
        return false;
      }

      return isPolearmMasterWeapon({
        baseWeapon: resolveWeaponBaseReference({
          name: copy.item.weapon?.name ?? copy.item.name,
          key: copy.item.key
        }),
        properties: adaptedWeapon.properties
      });
    });

  if (hasInventoryPolearm) {
    return true;
  }

  return getResolvedCustomLoadoutEntries(character.customEquipment ?? []).some(
    (entry) =>
      entry.category === ENTRY_CATEGORIES.WEAPONS &&
      entry.onHand &&
      isPolearmMasterWeapon(entry)
  );
}
