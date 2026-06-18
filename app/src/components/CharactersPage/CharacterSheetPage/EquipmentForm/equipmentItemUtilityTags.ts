import { getSpellEntryById } from "../../../../codex/spells";
import type { CharacterInventoryItem } from "../../../../types";
import {
  getInventoryItemChargesRecharge,
  getInventoryItemStoredSpell,
  getInventoryItemStoredSpellIds,
  getInventoryItemUseState,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE,
  INVENTORY_STORED_SPELL_MODE_DEFAULT
} from "../../../../pages/CharactersPage/inventoryItems";

export function getInventoryItemChargesTagLabel(
  stack: CharacterInventoryItem | null | undefined,
  options?: {
    includeRecharge?: boolean;
  }
): string | null {
  const useState = getInventoryItemUseState(stack);

  if (!useState) {
    return null;
  }

  const chargesRecharge = getInventoryItemChargesRecharge(stack);

  return options?.includeRecharge && chargesRecharge
    ? `charges ${useState.remaining}/${useState.total}, SR: ${chargesRecharge.shortRest} | LR: ${chargesRecharge.longRest}`
    : `Charges ${useState.remaining}/${useState.total}`;
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
  return getInventoryItemStoredSpellIds(stack).length > 0 ? "Spell" : null;
}

export function getInventoryItemStoredSpellHeaderTagLabel(
  stack: CharacterInventoryItem | null | undefined
): string | null {
  const storedSpell = getInventoryItemStoredSpell(stack);

  if (!storedSpell) {
    return null;
  }

  const storedSpellIds = getInventoryItemStoredSpellIds(stack);
  const spellName =
    storedSpellIds.length > 1
      ? "Multiple"
      : (getSpellEntryById(storedSpellIds[0])?.name ?? "Unknown spell");

  return `Spell Storing: ${spellName} | ${formatStoredSpellModeLabel(storedSpell.mode)}`;
}
