import type { CharacterRoundTracker } from "../../types";

export type RoundTrackerResource = "action" | "bonusAction" | "reaction";

export function createDefaultRoundTracker(): CharacterRoundTracker {
  return {
    turnStarted: false,
    isInCombat: false,
    combatRound: 0,
    combatRoundAdvancePending: false,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true
  };
}

function normalizeCombatRound(value: unknown, isInCombat: boolean): number {
  if (!isInCombat) {
    return 0;
  }

  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : 1;
}

export function normalizeRoundTracker(value: unknown): CharacterRoundTracker {
  if (!value || typeof value !== "object") {
    return createDefaultRoundTracker();
  }

  const record = value as Partial<CharacterRoundTracker>;
  const isInCombat = typeof record.isInCombat === "boolean" ? record.isInCombat : false;

  return {
    turnStarted: typeof record.turnStarted === "boolean" ? record.turnStarted : false,
    isInCombat,
    combatRound: normalizeCombatRound(record.combatRound, isInCombat),
    combatRoundAdvancePending:
      isInCombat && typeof record.combatRoundAdvancePending === "boolean"
        ? record.combatRoundAdvancePending
        : false,
    actionAvailable:
      typeof record.actionAvailable === "boolean" ? record.actionAvailable : true,
    bonusActionAvailable:
      typeof record.bonusActionAvailable === "boolean" ? record.bonusActionAvailable : true,
    reactionAvailable:
      typeof record.reactionAvailable === "boolean" ? record.reactionAvailable : true
  };
}

export function isRoundTrackerResourceAvailable(
  value: unknown,
  resource: RoundTrackerResource
): boolean {
  const tracker = normalizeRoundTracker(value);

  switch (resource) {
    case "action":
      return tracker.actionAvailable;
    case "bonusAction":
      return tracker.bonusActionAvailable;
    case "reaction":
      return tracker.reactionAvailable;
    default:
      return false;
  }
}

export function startRoundTrackerTurn(value?: unknown): CharacterRoundTracker {
  const tracker = normalizeRoundTracker(value);
  const combatRound =
    tracker.isInCombat && tracker.combatRoundAdvancePending
      ? Math.max(1, tracker.combatRound) + 1
      : tracker.isInCombat
        ? Math.max(1, tracker.combatRound)
        : 0;

  return {
    ...tracker,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true,
    combatRound,
    combatRoundAdvancePending: false,
    turnStarted: true
  };
}

export function finishRoundTrackerTurn(value: unknown): CharacterRoundTracker {
  const tracker = normalizeRoundTracker(value);

  return {
    ...tracker,
    turnStarted: false,
    combatRound: tracker.isInCombat ? Math.max(1, tracker.combatRound) : 0,
    combatRoundAdvancePending: tracker.isInCombat
  };
}

export function setRoundTrackerCombatState(
  value: unknown,
  isInCombat: boolean
): CharacterRoundTracker {
  const tracker = normalizeRoundTracker(value);

  return {
    ...tracker,
    isInCombat,
    combatRound: isInCombat ? Math.max(1, tracker.combatRound) : 0,
    combatRoundAdvancePending: false
  };
}

export function setRoundTrackerResourceAvailability(
  value: unknown,
  resource: RoundTrackerResource,
  isAvailable: boolean
): CharacterRoundTracker {
  const tracker = normalizeRoundTracker(value);

  switch (resource) {
    case "action":
      return {
        ...tracker,
        actionAvailable: isAvailable
      };
    case "bonusAction":
      return {
        ...tracker,
        bonusActionAvailable: isAvailable
      };
    case "reaction":
      return {
        ...tracker,
        reactionAvailable: isAvailable
      };
    default:
      return tracker;
  }
}

export function consumeRoundTrackerResource(
  value: unknown,
  resource: RoundTrackerResource
): CharacterRoundTracker {
  return setRoundTrackerResourceAvailability(value, resource, false);
}
