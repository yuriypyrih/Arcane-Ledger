import type {
  EncounterCreatureWriteRecord,
  EncounterTemplateCreatureRecord
} from "../../api/encounterTemplates";
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
    ...creatureWithoutInheritedEntry
  } = creature;
  const {
    separateInitiative: _unusedSeparateInitiative,
    source: _unusedSource,
    ...baseCreature
  } = creatureWithoutInheritedEntry as typeof creatureWithoutInheritedEntry &
    Partial<Pick<CharacterCompanion, "separateInitiative" | "source">>;

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
      : {}),
    ...("imageUrl" in creature && creature.imageUrl ? { imageUrl: creature.imageUrl } : {}),
    ...("typeGroupId" in creature && creature.typeGroupId
      ? { typeGroupId: creature.typeGroupId }
      : {})
  };
}

/**
 * The companion-shaped editors know nothing about a creature's picture or creature type, so edits made
 * through them must carry those over from the stored creature or they would be wiped.
 */
export function preserveEncounterExtras(
  stored: EncounterTemplateCreatureRecord | undefined,
  edited: EncounterTemplateCreatureRecord
): EncounterTemplateCreatureRecord {
  return {
    ...edited,
    ...(stored?.imageUrl ? { imageUrl: stored.imageUrl } : {}),
    ...(stored?.typeGroupId ? { typeGroupId: stored.typeGroupId } : {})
  };
}

const NUMBER_SUFFIX = /\s+(\d+)$/;

function stripNumberSuffix(name: string) {
  return name.replace(NUMBER_SUFFIX, "").trim();
}

/**
 * Names a copy after the creature it was copied from: "Goblin" copied three times gives "Goblin 1",
 * "Goblin 2" and "Goblin 3". The number is one more than the highest already used in the encounter,
 * so copying "Goblin 2" never reuses a number.
 */
export function getNextCopyName(name: string, siblings: { name: string }[]) {
  const baseName = stripNumberSuffix(name);
  const used = siblings.map((sibling) => {
    if (sibling.name === baseName) {
      return 0;
    }

    const match = NUMBER_SUFFIX.exec(sibling.name);

    return match && stripNumberSuffix(sibling.name) === baseName ? Number(match[1]) : null;
  });
  const highest = Math.max(0, ...used.filter((value): value is number => value !== null));

  return `${baseName} ${highest + 1}`;
}

/**
 * A copy is a new member of the original's creature type: the server gives it the original's definition
 * (stat block, max HP, picture, description) and keeps the two linked from then on.
 */
export function duplicateEncounterCreature(
  creature: EncounterTemplateCreatureRecord,
  siblings: { name: string }[] = []
): EncounterCreatureWriteRecord {
  return {
    ...toEncounterCreatureRecord({
      ...creature,
      id: createCharacterCompanionId(),
      name: getNextCopyName(creature.name, siblings),
      typeGroupId: null
    }),
    copyOfCreatureId: creature.id
  };
}
