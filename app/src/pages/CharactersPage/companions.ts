import type { CharacterCompanion } from "../../types";
import { normalizeMonsterRecord } from "../../utils/monsters";
import { isObjectRecord, normalizeText } from "../../utils/normalize";
import {
  beastMasterCompanionRole,
  getDefaultCompanionMaxHitPoints,
  getNormalizedPrimalBeastKind,
  normalizeCompanionHitPoints
} from "./beastMasterCompanions";

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
  const primalBeastKind = getNormalizedPrimalBeastKind(value.primalBeastKind);
  const role = value.role === beastMasterCompanionRole ? beastMasterCompanionRole : undefined;
  const baselineCompanion: CharacterCompanion = {
    id: normalizeText(value.id, `companion-${index}-${Date.now().toString(36)}`),
    name,
    description: normalizeText(value.description),
    type,
    ...(role ? { role } : {}),
    ...(primalBeastKind ? { primalBeastKind } : {}),
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {})
  };
  const defaultMaxHitPoints =
    role === beastMasterCompanionRole ? getDefaultCompanionMaxHitPoints(baselineCompanion) : null;
  const maxHitPoints =
    role === beastMasterCompanionRole
      ? Math.max(1, normalizeCompanionHitPoints(value.maxHitPoints, defaultMaxHitPoints) ?? 1)
      : undefined;
  const currentHitPoints =
    role === beastMasterCompanionRole
      ? Math.min(
          maxHitPoints ?? 1,
          normalizeCompanionHitPoints(
            value.currentHitPoints,
            maxHitPoints ?? defaultMaxHitPoints
          ) ??
            maxHitPoints ??
            1
        )
      : undefined;

  return {
    ...baselineCompanion,
    ...(role === beastMasterCompanionRole
      ? {
          appearance: normalizeText(value.appearance),
          maxHitPoints,
          currentHitPoints,
          isDead: value.isDead === true || currentHitPoints === 0
        }
      : {})
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
