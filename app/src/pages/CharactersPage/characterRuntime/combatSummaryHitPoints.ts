import type { Character } from "../../../types";
import {
  hasActiveLifeAndDeathLedgerFeature,
  hasLifeAndDeathLedgerDescriptionAdditions
} from "../classFeatures/lifeAndDeathLedger";
import { getMagicTemporaryHitPointsFeatureForCharacter } from "../classFeatures/magicTemporaryHitPoints";
import { getDeathSaveStatusLabel } from "../deathSaves";
import { normalizeMagicTemporaryHitPoints, normalizeTemporaryHitPoints } from "../shared";
import { getEffectiveHitPointMaximumForCharacter } from "../traits";

export type CombatSummaryDeathSaveState = {
  successes: number;
  failures: number;
  resolution?: "instant-death";
};

export type CombatSummaryMaxHitPointsMode = "automatic" | "custom";

export type CharacterCombatSummaryHitPoints = {
  effectiveMaxHitPoints: number;
  normalizedCurrentHitPoints: number;
  temporaryHitPoints: number;
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsFeature: ReturnType<typeof getMagicTemporaryHitPointsFeatureForCharacter>;
  deathSaves: CombatSummaryDeathSaveState;
  statusLabel: string;
  temporaryHitPointsDescription: string;
  hasLedgerContent: boolean;
  isLedgerActive: boolean;
  maxHitPointsMode: CombatSummaryMaxHitPointsMode;
};

function clampNumber(value: unknown, minimum: number, maximum: number, fallback: number): number {
  const numericValue =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, numericValue));
}

export function normalizeCombatSummaryMaxHitPointsMode(
  value: Character["maxHitPointsMode"]
): CombatSummaryMaxHitPointsMode {
  return value === "automatic" ? "automatic" : "custom";
}

export function normalizeCombatSummaryDeathSaves(
  value: Character["deathSaves"]
): CombatSummaryDeathSaveState {
  const successes = Math.floor(clampNumber(value?.successes, 0, 3, 0));
  const failures = Math.floor(clampNumber(value?.failures, 0, 3, 0));

  return {
    successes,
    failures,
    ...(value?.resolution === "instant-death" && failures >= 3
      ? { resolution: "instant-death" as const }
      : {})
  };
}

export function createCombatSummaryHitPoints(
  character: Character
): CharacterCombatSummaryHitPoints {
  const effectiveMaxHitPoints = getEffectiveHitPointMaximumForCharacter(character);
  const normalizedCurrentHitPoints = clampNumber(
    character.currentHitPoints,
    0,
    effectiveMaxHitPoints,
    character.currentHitPoints
  );
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const magicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(
    character.magicTemporaryHitPoints
  );
  const magicTemporaryHitPointsFeature = getMagicTemporaryHitPointsFeatureForCharacter(character);
  const deathSaves = normalizeCombatSummaryDeathSaves(character.deathSaves);
  const statusLabel = getDeathSaveStatusLabel(
    normalizedCurrentHitPoints,
    effectiveMaxHitPoints,
    deathSaves
  );
  const hasLedgerContent = hasLifeAndDeathLedgerDescriptionAdditions(character);

  return {
    effectiveMaxHitPoints,
    normalizedCurrentHitPoints,
    temporaryHitPoints,
    magicTemporaryHitPoints,
    magicTemporaryHitPointsFeature,
    deathSaves,
    statusLabel,
    temporaryHitPointsDescription:
      "When taking damage the temporary hit points are consumed first. They do not stack and they vanish after resting at a camp.",
    hasLedgerContent,
    isLedgerActive: hasLedgerContent && hasActiveLifeAndDeathLedgerFeature(character),
    maxHitPointsMode: normalizeCombatSummaryMaxHitPointsMode(character.maxHitPointsMode)
  };
}
