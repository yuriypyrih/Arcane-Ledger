import type { CharacterRoundTracker } from "../../types";

export type RoundTrackerResource = "action" | "bonusAction";

export function createDefaultRoundTracker(): CharacterRoundTracker {
  return {
    actionAvailable: true,
    bonusActionAvailable: true
  };
}

export function normalizeRoundTracker(value: unknown): CharacterRoundTracker {
  if (!value || typeof value !== "object") {
    return createDefaultRoundTracker();
  }

  const record = value as Partial<CharacterRoundTracker>;

  return {
    actionAvailable:
      typeof record.actionAvailable === "boolean" ? record.actionAvailable : true,
    bonusActionAvailable:
      typeof record.bonusActionAvailable === "boolean" ? record.bonusActionAvailable : true
  };
}

export function consumeRoundTrackerResource(
  value: unknown,
  resource: RoundTrackerResource
): CharacterRoundTracker {
  const tracker = normalizeRoundTracker(value);

  if (resource === "action") {
    return {
      ...tracker,
      actionAvailable: false
    };
  }

  return {
    ...tracker,
    bonusActionAvailable: false
  };
}
