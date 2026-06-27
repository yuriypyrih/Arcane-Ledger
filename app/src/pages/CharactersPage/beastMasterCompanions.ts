import type { Character, CharacterCompanion, MonsterRecord } from "../../types";
import { getMonsterHitPoints } from "../../utils/monsters";
import {
  getPrimalBeastTemplate,
  isPrimalBeastKind,
  PRIMAL_BEAST_MONSTER_TYPE
} from "./companionPrimalBeasts";

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

export function isPrimalBeastCompanion(companion: CharacterCompanion): boolean {
  return (
    isBeastMasterCompanion(companion) ||
    companion.type === PRIMAL_BEAST_MONSTER_TYPE ||
    Boolean(companion.primalBeastKind)
  );
}

export function getCompanionStatBlock(
  companion: CharacterCompanion,
  character?: Pick<Character, "abilities" | "level">
): MonsterRecord | null {
  return (
    getPrimalBeastTemplate(companion.primalBeastKind, character) ??
    companion.inheritedCreatureEntry ??
    null
  );
}

export function getDefaultCompanionMaxHitPoints(companion: CharacterCompanion): number | null {
  const statBlock = getCompanionStatBlock(companion);

  return statBlock ? getMonsterHitPoints(statBlock) : null;
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
  const hasDeadPrimalBeast = character.companions.some(
    (companion) => isPrimalBeastCompanion(companion) && companion.currentHitPoints <= 0
  );

  if (!hasDeadPrimalBeast) {
    return character;
  }

  return {
    ...character,
    companions: character.companions.map((currentCompanion) =>
      isPrimalBeastCompanion(currentCompanion) && currentCompanion.currentHitPoints <= 0
        ? {
            ...currentCompanion,
            currentHitPoints: 1
          }
        : currentCompanion
    )
  };
}

export function getNormalizedPrimalBeastKind(value: unknown) {
  return isPrimalBeastKind(value) ? value : undefined;
}
