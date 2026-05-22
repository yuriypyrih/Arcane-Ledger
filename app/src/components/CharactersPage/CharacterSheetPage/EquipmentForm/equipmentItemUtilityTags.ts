import { getSpellEntryById } from "../../../../codex/spells";
import type { CharacterInventoryItem } from "../../../../types";
import {
  getInventoryItemStoredSpell,
  getInventoryItemUseState,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE,
  INVENTORY_STORED_SPELL_MODE_DEFAULT
} from "../../../../pages/CharactersPage/inventoryItems";

export function getInventoryItemChargesTagLabel(
  stack: CharacterInventoryItem | null | undefined
): string | null {
  const useState = getInventoryItemUseState(stack);

  return useState ? `Charges ${useState.remaining}/${useState.total}` : null;
}

function formatStoredSpellModeLabel(mode: string): string {
  switch (mode) {
    case INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES:
      return "consume-charges";
    case INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE:
      return "consume-charges, destructible";
    case INVENTORY_STORED_SPELL_MODE_DEFAULT:
    default:
      return "default";
  }
}

export function getInventoryItemStoredSpellRowTagLabel(
  stack: CharacterInventoryItem | null | undefined
): string | null {
  return getInventoryItemStoredSpell(stack) ? "Spell" : null;
}

export function getInventoryItemStoredSpellHeaderTagLabel(
  stack: CharacterInventoryItem | null | undefined
): string | null {
  const storedSpell = getInventoryItemStoredSpell(stack);

  if (!storedSpell) {
    return null;
  }

  const spell = getSpellEntryById(storedSpell.spellId);
  const spellName = spell?.name ?? "Unknown spell";

  return `Spell: ${spellName} | ${formatStoredSpellModeLabel(storedSpell.mode)}`;
}
