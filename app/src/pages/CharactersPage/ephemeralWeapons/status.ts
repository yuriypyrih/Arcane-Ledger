import {
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterStatusEntry
} from "../../../types";
import { createCharacterStatusEntry } from "../statusEntries";
import type { EphemeralWeaponStatusEntryOptions } from "./types";

export function createEphemeralWeaponStatusEntry({
  definition,
  duration,
  source,
  sourceId,
  description,
  descriptionAdditions
}: EphemeralWeaponStatusEntryOptions): CharacterStatusEntry {
  return createCharacterStatusEntry({
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: definition.name,
    source: source ?? definition.sourceLabel,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
    duration,
    sourceId: sourceId ?? definition.id,
    description,
    descriptionAdditions
  });
}
