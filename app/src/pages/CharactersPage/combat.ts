import type { CharacterCondition, CharacterRoundTracker } from "../../types";

export type RoundTrackerResource = "action" | "bonusAction";
export const INDEFINITE_CONDITION_ROUNDS = Number.POSITIVE_INFINITY;

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

export function normalizeCharacterConditions(value: unknown): CharacterCondition[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawCondition) => {
      if (!rawCondition || typeof rawCondition !== "object") {
        return null;
      }

      const conditionRecord = rawCondition as {
        name?: unknown;
        roundsRemaining?: unknown;
      };
      const name = typeof conditionRecord.name === "string" ? conditionRecord.name.trim() : "";

      if (!name) {
        return null;
      }

      const parsedRounds = Number(conditionRecord.roundsRemaining);

      if (parsedRounds === 0 || parsedRounds === INDEFINITE_CONDITION_ROUNDS) {
        return {
          name,
          roundsRemaining: INDEFINITE_CONDITION_ROUNDS
        };
      }

      if (!Number.isFinite(parsedRounds)) {
        return null;
      }

      return {
        name,
        roundsRemaining: Math.max(0, Math.min(999, Math.floor(parsedRounds)))
      };
    })
    .filter((condition): condition is CharacterCondition => condition !== null);
}

export function advanceCharacterConditions(value: unknown): CharacterCondition[] {
  return normalizeCharacterConditions(value).flatMap((condition) => {
    if (condition.roundsRemaining === INDEFINITE_CONDITION_ROUNDS) {
      return [condition];
    }

    const nextRoundsRemaining = condition.roundsRemaining - 1;

    if (nextRoundsRemaining <= 0) {
      return [];
    }

    return [
      {
        ...condition,
        roundsRemaining: nextRoundsRemaining
      }
    ];
  });
}
