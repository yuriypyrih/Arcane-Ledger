import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  type CharacterCompanion,
  type CharacterStatusDuration
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
  createDefaultDeathSaveTrack,
  getDeathSaveStatusLabel,
  isDeathSaveTrackResolved,
  normalizeDeathSaveTrack
} from "./deathSaves";
import {
  normalizeCharacterStatusDuration,
  normalizeStatusDurationRoundTick
} from "./statusEntries";
import {
  MANUAL_TEMPORARY_HIT_POINTS_SOURCE,
  createTemporaryHitPointsAssignment,
  normalizeTemporaryHitPoints
} from "./shared";
import { CHARACTER_COMPANION_LIMIT } from "./characterLimits";

export { CHARACTER_COMPANION_LIMIT };

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

function createInstantDeathSaves() {
  return {
    successes: 0,
    failures: 3,
    resolution: "instant-death" as const
  };
}

function normalizeCharacterCompanion(value: unknown, index: number): CharacterCompanion | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeText(value.name);
  const type = normalizeText(value.type);

  if (!name) {
    return null;
  }

  const inheritedCreatureEntry = normalizeMonsterRecord(value.inheritedCreatureEntry);
  const primalBeastKind = getNormalizedPrimalBeastKind(value.primalBeastKind);
  const role = value.role === beastMasterCompanionRole ? beastMasterCompanionRole : undefined;
  const duration = normalizeCompanionDuration(value.duration);
  const deathSaves = normalizeDeathSaveTrack(value.deathSaves);
  const temporaryHitPointsAssignment = createTemporaryHitPointsAssignment(
    value.temporaryHitPoints,
    value.temporaryHitPointsSource
  );
  const baselineCompanion: CharacterCompanion = {
    id: normalizeText(value.id, `companion-${index}-${Date.now().toString(36)}`),
    name,
    description: normalizeText(value.description),
    type,
    source: normalizeText(value.source, "Manual"),
    separateInitiative: value.separateInitiative === true,
    maxHitPoints: 1,
    currentHitPoints: 1,
    ...temporaryHitPointsAssignment,
    deathSaves,
    duration,
    ...(role ? { role } : {}),
    ...(primalBeastKind ? { primalBeastKind } : {}),
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {}),
    ...(inheritedCreatureEntry && value.inheritedCreatureEntryModified === true
      ? { inheritedCreatureEntryModified: true }
      : {})
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

export function getCompanionStatusLabel(companion: CharacterCompanion): string {
  return getDeathSaveStatusLabel(
    companion.currentHitPoints,
    companion.maxHitPoints,
    normalizeDeathSaveTrack(companion.deathSaves)
  );
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
    })
    .slice(0, CHARACTER_COMPANION_LIMIT);
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
  const isInstantDeath = remainingDamage >= companion.currentHitPoints + companion.maxHitPoints;
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
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: isInstantDeath
      ? createInstantDeathSaves()
      : nextCurrentHitPoints > 0
        ? createDefaultDeathSaveTrack()
        : normalizeDeathSaveTrack(companion.deathSaves)
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
    currentHitPoints: nextCurrentHitPoints,
    deathSaves:
      nextCurrentHitPoints > 0
        ? createDefaultDeathSaveTrack()
        : normalizeDeathSaveTrack(companion.deathSaves)
  };
}

export function updateCharacterCompanionDeathSaves(
  companion: CharacterCompanion,
  track: "success" | "failure"
): CharacterCompanion {
  if (companion.currentHitPoints > 0) {
    return companion;
  }

  const deathSaves = normalizeDeathSaveTrack(companion.deathSaves);

  if (isDeathSaveTrackResolved(deathSaves)) {
    return companion;
  }

  if (track === "success") {
    const nextSuccesses = Math.min(3, deathSaves.successes + 1);

    if (nextSuccesses === deathSaves.successes) {
      return companion;
    }

    return {
      ...companion,
      deathSaves: {
        ...deathSaves,
        successes: nextSuccesses
      }
    };
  }

  const nextFailures = Math.min(3, deathSaves.failures + 1);

  if (nextFailures === deathSaves.failures) {
    return companion;
  }

  return {
    ...companion,
    deathSaves: {
      ...deathSaves,
      failures: nextFailures
    }
  };
}

export function resetCharacterCompanionDeathSaves(
  companion: CharacterCompanion
): CharacterCompanion {
  const deathSaves = normalizeDeathSaveTrack(companion.deathSaves);

  if (
    deathSaves.successes === 0 &&
    deathSaves.failures === 0 &&
    deathSaves.resolution !== "instant-death"
  ) {
    return companion;
  }

  return {
    ...companion,
    deathSaves: createDefaultDeathSaveTrack()
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
