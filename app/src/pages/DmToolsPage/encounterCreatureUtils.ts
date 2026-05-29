import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import type { CharacterCompanion } from "../../types";
import { createCharacterCompanionId } from "../CharactersPage/companions";

export function toEncounterCreatureRecord(
  creature: CharacterCompanion | EncounterTemplateCreatureRecord
): EncounterTemplateCreatureRecord {
  return {
    id: creature.id,
    name: creature.name,
    description: creature.description,
    type: creature.type,
    maxHitPoints: creature.maxHitPoints,
    currentHitPoints: creature.currentHitPoints,
    temporaryHitPoints: creature.temporaryHitPoints,
    duration: creature.duration,
    ...(creature.temporaryHitPointsSource
      ? { temporaryHitPointsSource: creature.temporaryHitPointsSource }
      : {}),
    ...(creature.deathSaves ? { deathSaves: creature.deathSaves } : {}),
    ...(creature.primalBeastKind ? { primalBeastKind: creature.primalBeastKind } : {}),
    ...(creature.inheritedCreatureEntry
      ? { inheritedCreatureEntry: creature.inheritedCreatureEntry }
      : {}),
    ...(creature.inheritedCreatureEntryModified
      ? { inheritedCreatureEntryModified: true }
      : {})
  };
}

export function duplicateEncounterCreature(creature: EncounterTemplateCreatureRecord) {
  return toEncounterCreatureRecord({
    ...creature,
    id: createCharacterCompanionId()
  });
}
