import type { Character, CharacterCompanion, MonsterRecord } from "../../types";
import { getPrimalBeastTemplate, isPrimalBeastKind } from "./companionPrimalBeasts";

export const beastMasterCompanionRole = "beast-master" as const;
export const beastMasterSubclassId = "ranger-beast-master";

export function isBeastMasterCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === beastMasterSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function isBeastMasterCompanion(
  companion: Pick<CharacterCompanion, "role">
): companion is CharacterCompanion & { role: typeof beastMasterCompanionRole } {
  return companion.role === beastMasterCompanionRole;
}

export function getBeastMasterCompanion(
  character: Partial<Pick<Character, "companions">>
): CharacterCompanion | null {
  return character.companions?.find(isBeastMasterCompanion) ?? null;
}

export function getCompanionStatBlock(companion: CharacterCompanion): MonsterRecord | null {
  return (
    getPrimalBeastTemplate(companion.primalBeastKind) ?? companion.inheritedCreatureEntry ?? null
  );
}

export function getDefaultCompanionMaxHitPoints(companion: CharacterCompanion): number | null {
  return getCompanionStatBlock(companion)?.hit_points ?? null;
}

export function normalizeCompanionHitPoints(
  value: unknown,
  fallback: number | null
): number | undefined {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback === null ? undefined : Math.max(0, Math.floor(fallback));
  }

  return Math.max(0, Math.floor(parsedValue));
}

export function reviveBeastMasterCompanion(character: Character): Character {
  const companion = getBeastMasterCompanion(character);

  if (!companion || companion.isDead !== true) {
    return character;
  }

  const maxHitPoints = Math.max(
    1,
    companion.maxHitPoints ?? getDefaultCompanionMaxHitPoints(companion) ?? 1
  );

  return {
    ...character,
    companions: character.companions.map((currentCompanion) =>
      currentCompanion.id === companion.id
        ? {
            ...currentCompanion,
            isDead: false,
            maxHitPoints,
            currentHitPoints: maxHitPoints
          }
        : currentCompanion
    )
  };
}

export function getNormalizedPrimalBeastKind(value: unknown) {
  return isPrimalBeastKind(value) ? value : undefined;
}
