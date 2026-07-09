import {
  STATUS_ENTRY_GROUP,
  type Character,
  type CharacterStatusEntry
} from "../../../types";
import type { WeaponAction } from "../gameplay";
import { normalizeCharacterStatusEntries } from "../statusEntries";
import { createEphemeralWeaponAction } from "./actions";
import { spellEphemeralWeaponDefinitions } from "./definitions";
import type { EphemeralWeaponDefinition } from "./types";

function getSpellActivationStatusEntry(
  statusEntries: CharacterStatusEntry[],
  definition: EphemeralWeaponDefinition
): CharacterStatusEntry | null {
  if (definition.activation.kind !== "spell-status") {
    return null;
  }

  const spellId = definition.activation.spellId;

  return (
    statusEntries.find(
      (entry) =>
        entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
        entry.sourceSpellId === spellId &&
        entry.disabled !== true
    ) ?? null
  );
}

export function getActiveSpellEphemeralWeaponActionsForCharacter(
  character: Character
): WeaponAction[] {
  const statusEntries = normalizeCharacterStatusEntries(character.statusEntries);

  return spellEphemeralWeaponDefinitions.flatMap((definition) => {
    const sourceStatusEntry = getSpellActivationStatusEntry(statusEntries, definition);

    if (!sourceStatusEntry) {
      return [];
    }

    const action = createEphemeralWeaponAction(character, definition, {
      sourceStatusEntry,
      sourceSpellSlotLevel: sourceStatusEntry.sourceSpellSlotLevel ?? null
    });

    return action ? [action] : [];
  });
}
