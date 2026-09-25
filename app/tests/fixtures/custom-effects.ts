import type { AbilityKey, CharacterCustomTraitEffect } from "../../src/types";
import { STATUS_ENTRY_GROUP } from "../../src/types";
import { createCharacterInventoryItem } from "../../src/pages/CharactersPage/inventoryItems";
import { createCharacterStatusEntry } from "../../src/pages/CharactersPage/statusEntries";

export function hardSet(ability: AbilityKey, value: number): CharacterCustomTraitEffect {
  return { type: "hardSetAbilityScore", ability, value };
}

export function effectStatus(name: string, effects: CharacterCustomTraitEffect[]) {
  return createCharacterStatusEntry({
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: name,
    source: "Test",
    customEffects: effects
  });
}

export function effectItem(name: string, effects: CharacterCustomTraitEffect[]) {
  return {
    ...createCharacterInventoryItem({ id: name, key: name, name }, { id: name }),
    mods: { baseCategory: "general" as const, effects }
  };
}
