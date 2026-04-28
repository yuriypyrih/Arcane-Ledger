import type { Character } from "../../../../types";

function areDraftValuesEqual<T>(left: T, right: T): boolean {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

export function createAddEquipmentDraftCharacter(character: Character): Character {
  return {
    ...character,
    currencies: { ...character.currencies },
    equipment: [...character.equipment],
    inventoryItems: [...character.inventoryItems],
    customEquipment: [...character.customEquipment]
  };
}

export function applyAddEquipmentDraftToCharacter(
  currentCharacter: Character,
  draftCharacter: Character
): Character {
  if (
    areDraftValuesEqual(currentCharacter.currencies, draftCharacter.currencies) &&
    areDraftValuesEqual(currentCharacter.equipment, draftCharacter.equipment) &&
    areDraftValuesEqual(currentCharacter.inventoryItems, draftCharacter.inventoryItems) &&
    areDraftValuesEqual(currentCharacter.customEquipment, draftCharacter.customEquipment)
  ) {
    return currentCharacter;
  }

  return {
    ...currentCharacter,
    currencies: draftCharacter.currencies,
    equipment: draftCharacter.equipment,
    inventoryItems: draftCharacter.inventoryItems,
    customEquipment: draftCharacter.customEquipment
  };
}
