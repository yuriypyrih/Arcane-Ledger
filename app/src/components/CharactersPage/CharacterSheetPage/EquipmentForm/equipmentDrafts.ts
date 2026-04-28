import type { Character } from "../../../../types";

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
  return {
    ...currentCharacter,
    currencies: draftCharacter.currencies,
    equipment: draftCharacter.equipment,
    inventoryItems: draftCharacter.inventoryItems,
    customEquipment: draftCharacter.customEquipment
  };
}
