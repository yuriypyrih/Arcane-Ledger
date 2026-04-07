import type { CharacterCompanion } from "../../types";
import { normalizeMonsterRecord } from "../../utils/monsters";
import { isObjectRecord, normalizeText } from "../../utils/normalize";

function normalizeCharacterCompanion(value: unknown, index: number): CharacterCompanion | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeText(value.name);
  const type = normalizeText(value.type);

  if (!name || !type) {
    return null;
  }

  const inheritedCreatureEntry = normalizeMonsterRecord(value.inheritedCreatureEntry);

  return {
    id: normalizeText(value.id, `companion-${index}-${Date.now().toString(36)}`),
    name,
    description: normalizeText(value.description),
    type,
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {})
  };
}

export function createCharacterCompanionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `companion-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeCharacterCompanions(value: unknown): CharacterCompanion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value
    .map((companion, index) => normalizeCharacterCompanion(companion, index))
    .filter((companion): companion is CharacterCompanion => {
      if (!companion || seenIds.has(companion.id)) {
        return false;
      }

      seenIds.add(companion.id);
      return true;
    });
}
