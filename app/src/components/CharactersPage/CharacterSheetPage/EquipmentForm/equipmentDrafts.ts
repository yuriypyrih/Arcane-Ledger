import type { Character } from "../../../../types";

export type AddEquipmentDraftOperation = (currentCharacter: Character) => Character;

export function createAddEquipmentDraftCharacter(character: Character): Character {
  return {
    ...character,
    currencies: { ...character.currencies },
    equipment: [...character.equipment],
    inventoryItems: [...character.inventoryItems],
    customEquipment: [...character.customEquipment]
  };
}

export function applyAddEquipmentDraftOperations(
  currentCharacter: Character,
  operations: readonly AddEquipmentDraftOperation[]
): Character {
  return operations.reduce(
    (nextCharacter, operation) => operation(nextCharacter),
    currentCharacter
  );
}
