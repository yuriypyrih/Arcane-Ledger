import type { Character } from "../../types";

export function clearCharacterHandOccupants(character: Character): Character {
  return {
    ...character,
    equipment: character.equipment.map((entry) => ({
      ...entry,
      onHand: false
    })),
    inventoryItems: character.inventoryItems.map((entry) => ({
      ...entry,
      onHandQuantity: 0
    })),
    customEquipment: character.customEquipment.map((entry) =>
      entry.kind === "weapon"
        ? {
            ...entry,
            onHand: false
          }
        : entry
    )
  };
}
