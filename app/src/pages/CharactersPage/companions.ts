import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterCompanion,
  type CharacterStatusDuration,
  type CharacterStatusEntry
} from "../../types";
import { normalizeMonsterRecord } from "../../utils/monsters";
import { isObjectRecord, normalizeText } from "../../utils/normalize";
import {
  beastMasterCompanionRole,
  getDefaultCompanionMaxHitPoints,
  getNormalizedPrimalBeastKind,
  normalizeCompanionHitPoints
} from "./beastMasterCompanions";
import {
  normalizeCharacterStatusDuration,
  normalizeStatusDurationRoundTick
} from "./statusEntries";
import {
  MANUAL_TEMPORARY_HIT_POINTS_SOURCE,
  createTemporaryHitPointsAssignment,
  normalizeTemporaryHitPoints
} from "./shared";

export const companionStatusEntrySourceIdPrefix = "companion-status-";

const defaultCompanionDuration: CharacterStatusDuration = {
  kind: STATUS_DURATION_KIND.INFINITE
};

function normalizeCompanionDuration(value: unknown): CharacterStatusDuration {
  const duration = normalizeCharacterStatusDuration(value, defaultCompanionDuration);

  if (
    duration.kind !== STATUS_DURATION_KIND.ROUNDS ||
    !isObjectRecord(value) ||
    value.tickOn === STATUS_DURATION_ROUND_TICK.ROUND_START ||
    value.tickOn === STATUS_DURATION_ROUND_TICK.ROUND_END
  ) {
    return duration;
  }

  return {
    ...duration,
    tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
  };
}

function getCompanionStatusEntryId(companionId: string): string {
  return `${companionStatusEntrySourceIdPrefix}${companionId}`;
}

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
  const duration = normalizeCompanionDuration(value.duration);
  const temporaryHitPointsAssignment = createTemporaryHitPointsAssignment(
    value.temporaryHitPoints,
    value.temporaryHitPointsSource
  );
  const baselineCompanion: CharacterCompanion = {
    id: normalizeText(value.id, `companion-${index}-${Date.now().toString(36)}`),
    name,
    description: normalizeText(value.description),
    type,
    maxHitPoints: 1,
    currentHitPoints: 1,
    ...temporaryHitPointsAssignment,
    duration,
    ...(role ? { role } : {}),
    ...(primalBeastKind ? { primalBeastKind } : {}),
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {})
  };
  const defaultMaxHitPoints = getDefaultCompanionMaxHitPoints(baselineCompanion);
  const maxHitPoints = Math.max(
    1,
    normalizeCompanionHitPoints(value.maxHitPoints, defaultMaxHitPoints) ?? 1
  );
  const currentHitPoints = Math.min(
    maxHitPoints,
    normalizeCompanionHitPoints(value.currentHitPoints, maxHitPoints ?? defaultMaxHitPoints) ??
      maxHitPoints
  );

  return {
    ...baselineCompanion,
    maxHitPoints,
    currentHitPoints
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

export function applyDamageToCharacterCompanion(
  companion: CharacterCompanion,
  amount: number
): CharacterCompanion {
  const normalizedAmount = normalizeCompanionHitPoints(amount, 0) ?? 0;

  if (normalizedAmount === 0) {
    return companion;
  }

  const currentTemporaryHitPoints = normalizeTemporaryHitPoints(companion.temporaryHitPoints);
  const absorbedByTemporaryHitPoints = Math.min(normalizedAmount, currentTemporaryHitPoints);
  const nextTemporaryHitPoints = currentTemporaryHitPoints - absorbedByTemporaryHitPoints;
  const remainingDamage = normalizedAmount - absorbedByTemporaryHitPoints;
  const nextCurrentHitPoints = Math.max(
    0,
    Math.min(companion.maxHitPoints, companion.currentHitPoints - remainingDamage)
  );

  if (
    nextTemporaryHitPoints === currentTemporaryHitPoints &&
    nextCurrentHitPoints === companion.currentHitPoints
  ) {
    return companion;
  }

  return {
    ...companion,
    ...createTemporaryHitPointsAssignment(
      nextTemporaryHitPoints,
      nextTemporaryHitPoints > 0 ? companion.temporaryHitPointsSource : undefined
    ),
    currentHitPoints: nextCurrentHitPoints
  };
}

export function applyHealingToCharacterCompanion(
  companion: CharacterCompanion,
  amount: number
): CharacterCompanion {
  const normalizedAmount = normalizeCompanionHitPoints(amount, 0) ?? 0;

  if (normalizedAmount === 0) {
    return companion;
  }

  const nextCurrentHitPoints = Math.max(
    0,
    Math.min(companion.maxHitPoints, companion.currentHitPoints + normalizedAmount)
  );

  if (nextCurrentHitPoints === companion.currentHitPoints) {
    return companion;
  }

  return {
    ...companion,
    currentHitPoints: nextCurrentHitPoints
  };
}

export function assignManualTemporaryHitPointsToCharacterCompanion(
  companion: CharacterCompanion,
  value: number
): CharacterCompanion {
  const nextTemporaryHitPoints = normalizeTemporaryHitPoints(value);
  const nextTemporaryHitPointsAssignment = createTemporaryHitPointsAssignment(
    nextTemporaryHitPoints,
    nextTemporaryHitPoints > 0 ? MANUAL_TEMPORARY_HIT_POINTS_SOURCE : undefined
  );

  if (
    nextTemporaryHitPointsAssignment.temporaryHitPoints === companion.temporaryHitPoints &&
    nextTemporaryHitPointsAssignment.temporaryHitPointsSource === companion.temporaryHitPointsSource
  ) {
    return companion;
  }

  return {
    ...companion,
    ...nextTemporaryHitPointsAssignment
  };
}

function shouldKeepCompanionAfterRestDuration(
  duration: CharacterStatusDuration,
  restType: "short" | "long"
): boolean {
  if (restType === "short") {
    switch (duration.kind) {
      case STATUS_DURATION_KIND.INFINITE:
      case STATUS_DURATION_KIND.LONG_REST:
      case STATUS_DURATION_KIND.HOURS:
      case STATUS_DURATION_KIND.DAYS:
      case STATUS_DURATION_KIND.LINKED:
        return true;
      case STATUS_DURATION_KIND.SHORT_REST:
      case STATUS_DURATION_KIND.MINUTES:
      case STATUS_DURATION_KIND.ROUNDS:
      case STATUS_DURATION_KIND.CONCENTRATION:
        return false;
      default:
        return true;
    }
  }

  return (
    duration.kind === STATUS_DURATION_KIND.INFINITE ||
    duration.kind === STATUS_DURATION_KIND.LINKED ||
    duration.kind === STATUS_DURATION_KIND.DAYS
  );
}

export function advanceCharacterCompanionDurations(
  value: unknown,
  tickOn: STATUS_DURATION_ROUND_TICK = STATUS_DURATION_ROUND_TICK.ROUND_START
): CharacterCompanion[] {
  return normalizeCharacterCompanions(value).flatMap((companion) => {
    if (companion.duration.kind !== STATUS_DURATION_KIND.ROUNDS) {
      return [companion];
    }

    if (normalizeStatusDurationRoundTick(companion.duration.tickOn) !== tickOn) {
      return [companion];
    }

    const nextAmount = companion.duration.amount - 1;

    if (nextAmount <= 0) {
      return [];
    }

    return [
      {
        ...companion,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: nextAmount,
          tickOn: normalizeStatusDurationRoundTick(companion.duration.tickOn)
        }
      }
    ];
  });
}

export function applyShortRestToCharacterCompanions(value: unknown): CharacterCompanion[] {
  return normalizeCharacterCompanions(value).filter((companion) =>
    shouldKeepCompanionAfterRestDuration(companion.duration, "short")
  );
}

export function applyLongRestToCharacterCompanions(value: unknown): CharacterCompanion[] {
  return normalizeCharacterCompanions(value).filter((companion) =>
    shouldKeepCompanionAfterRestDuration(companion.duration, "long")
  );
}

export function hasFiniteCompanionDuration(companions: readonly CharacterCompanion[]): boolean {
  return companions.some((companion) => companion.duration.kind !== STATUS_DURATION_KIND.INFINITE);
}

export function getCompanionIdFromStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "sourceId"> | null | undefined
): string | null {
  if (
    entry?.group !== STATUS_ENTRY_GROUP.COMPANIONS ||
    !entry.sourceId?.startsWith(companionStatusEntrySourceIdPrefix)
  ) {
    return null;
  }

  return entry.sourceId.slice(companionStatusEntrySourceIdPrefix.length) || null;
}

export function getCompanionStatusEntriesForCharacter(
  character: Pick<Character, "companions">
): CharacterStatusEntry[] {
  return normalizeCharacterCompanions(character.companions)
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((companion) => ({
      id: getCompanionStatusEntryId(companion.id),
      group: STATUS_ENTRY_GROUP.COMPANIONS,
      value: companion.name,
      source: "Companion",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: companion.duration,
      sourceId: getCompanionStatusEntryId(companion.id),
      rangeFeet: null,
      description: companion.description.trim() || undefined
    }));
}
