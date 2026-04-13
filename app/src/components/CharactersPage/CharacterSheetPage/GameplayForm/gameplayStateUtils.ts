import type { Character, CharacterStatusEntry } from "../../../../types";
import {
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import {
  advanceFeatureStateForNewRound,
  removeFeatureStatusEntryForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  advanceCharacterStatusEntries,
  normalizeCharacterStatusEntries
} from "../../../../pages/CharactersPage/traits";
import type { HpDraft } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker,
  startRoundTrackerTurn,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import {
  createMagicTemporaryHitPointsAssignment,
  MANUAL_TEMPORARY_HIT_POINTS_SOURCE,
  gainMagicTemporaryHitPointsAssignment,
  normalizeMagicTemporaryHitPoints,
  normalizeMagicTemporaryHitPointsSource,
  createTemporaryHitPointsAssignment,
  normalizeTemporaryHitPoints,
  normalizeTemporaryHitPointsSource,
  swapTemporaryHitPoints,
  swapTemporaryHitPointsAssignment
} from "../../../../pages/CharactersPage/shared";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";

export type DeathSaveState = {
  successes: number;
  failures: number;
};

export type MaxHitPointsMode = "automatic" | "custom";

export function createHpDraft(character: Character): HpDraft {
  return {
    hitPoints: character.hitPoints,
    currentHitPoints: character.currentHitPoints
  };
}

export function normalizeMaxHitPointsMode(value: Character["maxHitPointsMode"]): MaxHitPointsMode {
  return value === "automatic" ? "automatic" : "custom";
}

export function createDefaultDeathSaves(): DeathSaveState {
  return {
    successes: 0,
    failures: 0
  };
}

export function normalizeDeathSaves(value: Character["deathSaves"]): DeathSaveState {
  return {
    successes: Math.floor(clampNumber(value?.successes, 0, 3, 0)),
    failures: Math.floor(clampNumber(value?.failures, 0, 3, 0))
  };
}

export {
  createMagicTemporaryHitPointsAssignment,
  MANUAL_TEMPORARY_HIT_POINTS_SOURCE,
  gainMagicTemporaryHitPointsAssignment,
  normalizeMagicTemporaryHitPoints,
  normalizeMagicTemporaryHitPointsSource,
  createTemporaryHitPointsAssignment,
  normalizeTemporaryHitPoints,
  normalizeTemporaryHitPointsSource,
  swapTemporaryHitPoints,
  swapTemporaryHitPointsAssignment
};

function getExpiredFeatureOverrideEntries(
  previousEntries: unknown,
  nextEntries: unknown
): CharacterStatusEntry[] {
  const nextOverrideIds = new Set(
    normalizeCharacterStatusEntries(nextEntries).map((entry) => entry.id)
  );

  return normalizeCharacterStatusEntries(previousEntries).filter(
    (entry) =>
      entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE &&
      typeof entry.sourceId === "string" &&
      entry.sourceId.length > 0 &&
      !nextOverrideIds.has(entry.id)
  );
}

function advanceTimedStatusesForTurnStart(character: Character): Character {
  const nextStatusEntries = advanceCharacterStatusEntries(
    character.statusEntries,
    STATUS_DURATION_ROUND_TICK.ROUND_START
  );
  const expiredFeatureOverrideEntries = getExpiredFeatureOverrideEntries(
    character.statusEntries,
    nextStatusEntries
  );
  let nextCharacter: Character = {
    ...character,
    statusEntries: nextStatusEntries
  };

  expiredFeatureOverrideEntries.forEach((entry) => {
    nextCharacter = removeFeatureStatusEntryForCharacter(nextCharacter, entry);
  });

  return nextCharacter;
}

export function startCharacterTurn(character: Character): Character {
  const nextCharacter = advanceFeatureStateForNewRound(
    advanceTimedStatusesForTurnStart(character)
  );

  return {
    ...nextCharacter,
    roundTracker: startRoundTrackerTurn()
  };
}

export function prepareCharacterForRoundTrackerResourceConsumption(
  character: Character,
  resource: RoundTrackerResource
): Character {
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const shouldAutoStartTurn =
    (resource === "action" || resource === "bonusAction") &&
    !roundTracker.turnStarted &&
    isRoundTrackerResourceAvailable(roundTracker, resource);

  return shouldAutoStartTurn ? startCharacterTurn(character) : character;
}

export function consumeRoundTrackerResourceForCharacter(
  character: Character,
  resource: RoundTrackerResource
): Character {
  const preparedCharacter = prepareCharacterForRoundTrackerResourceConsumption(
    character,
    resource
  );

  return {
    ...preparedCharacter,
    roundTracker: consumeRoundTrackerResource(preparedCharacter.roundTracker, resource)
  };
}
