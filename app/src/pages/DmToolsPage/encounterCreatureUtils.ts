import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import type { CharacterCompanion } from "../../types";
import { normalizeMonsterRecord } from "../../utils/monsters";
import { createCharacterCompanionId } from "../CharactersPage/companions";

export function normalizeEncounterCreatureRecord(
  creature: CharacterCompanion | EncounterTemplateCreatureRecord
): EncounterTemplateCreatureRecord {
  const inheritedCreatureEntry = normalizeMonsterRecord(creature.inheritedCreatureEntry);
  const {
    inheritedCreatureEntry: _unusedInheritedCreatureEntry,
    inheritedCreatureEntryModified: _unusedInheritedCreatureEntryModified,
    ...baseCreature
  } = creature;

  return {
    ...baseCreature,
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {}),
    ...(inheritedCreatureEntry && creature.inheritedCreatureEntryModified === true
      ? { inheritedCreatureEntryModified: true }
      : {})
  };
}

export function toEncounterCreatureRecord(
  creature: CharacterCompanion | EncounterTemplateCreatureRecord
): EncounterTemplateCreatureRecord {
  const normalizedCreature = normalizeEncounterCreatureRecord(creature);

  return {
    id: normalizedCreature.id,
    name: normalizedCreature.name,
    description: normalizedCreature.description,
    type: normalizedCreature.type,
    maxHitPoints: normalizedCreature.maxHitPoints,
    currentHitPoints: normalizedCreature.currentHitPoints,
    temporaryHitPoints: normalizedCreature.temporaryHitPoints,
    duration: normalizedCreature.duration,
    ...(normalizedCreature.temporaryHitPointsSource
      ? { temporaryHitPointsSource: normalizedCreature.temporaryHitPointsSource }
      : {}),
    ...(normalizedCreature.deathSaves ? { deathSaves: normalizedCreature.deathSaves } : {}),
    ...(normalizedCreature.primalBeastKind
      ? { primalBeastKind: normalizedCreature.primalBeastKind }
      : {}),
    ...(normalizedCreature.inheritedCreatureEntry
      ? { inheritedCreatureEntry: normalizedCreature.inheritedCreatureEntry }
      : {}),
    ...(normalizedCreature.inheritedCreatureEntryModified
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
