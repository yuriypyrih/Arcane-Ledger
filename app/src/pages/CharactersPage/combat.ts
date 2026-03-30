import type { CharacterRoundTracker } from "../../types";

export type RoundTrackerResource = "action" | "bonusAction" | "reaction";

export function createDefaultRoundTracker(): CharacterRoundTracker {
  return {
    turnStarted: false,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true
  };
}

export function normalizeRoundTracker(value: unknown): CharacterRoundTracker {
  if (!value || typeof value !== "object") {
    return createDefaultRoundTracker();
  }

  const record = value as Partial<CharacterRoundTracker>;

  return {
    turnStarted: typeof record.turnStarted === "boolean" ? record.turnStarted : false,
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

export function startRoundTrackerTurn(): CharacterRoundTracker {
  return {
    ...createDefaultRoundTracker(),
    turnStarted: true
  };
}

export function finishRoundTrackerTurn(value: unknown): CharacterRoundTracker {
  const tracker = normalizeRoundTracker(value);

  return {
    ...tracker,
    turnStarted: false
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
