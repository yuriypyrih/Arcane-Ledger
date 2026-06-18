import type { CharacterStatusDuration } from "../../../../../../types";
import { STATUS_DURATION_KIND, STATUS_DURATION_ROUND_TICK } from "../../../../../../types";
import { normalizeStatusDurationRoundTick } from "../../../../../../pages/CharactersPage/traits";

export const manualStatusDurationTypeOptions = [
  { value: "INFINITE", label: "Infinite" },
  { value: "ROUNDS_START", label: "Rounds (Start)" },
  { value: "ROUNDS_END", label: "Rounds (End)" },
  { value: "MINUTES", label: "Minutes" },
  { value: "HOURS", label: "Hours" },
  { value: "DAYS", label: "Days" },
  { value: "SHORT_REST", label: "Short Rest" },
  { value: "LONG_REST", label: "Long Rest" }
] as const;

export type ManualStatusDurationType = (typeof manualStatusDurationTypeOptions)[number]["value"];

export const companionDurationTypeOptions = manualStatusDurationTypeOptions;

export type ManualStatusDurationDraft = {
  type: ManualStatusDurationType;
  value: number;
};

const minimumManualStatusDurationValue = 1;
const maximumManualStatusDurationValue = 30;

export const manualStatusDurationValueOptions = Array.from(
  { length: maximumManualStatusDurationValue },
  (_, index) => index + minimumManualStatusDurationValue
);

export const defaultManualStatusDurationDraft: ManualStatusDurationDraft = {
  type: "INFINITE",
  value: minimumManualStatusDurationValue
};

export function clampManualStatusDurationValue(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return minimumManualStatusDurationValue;
  }

  return Math.max(
    minimumManualStatusDurationValue,
    Math.min(maximumManualStatusDurationValue, Math.floor(parsed))
  );
}

export function isManualStatusDurationValueDisabled(type: ManualStatusDurationType): boolean {
  return type === "INFINITE" || type === "SHORT_REST" || type === "LONG_REST";
}

export function getManualStatusDurationDraft(
  duration: CharacterStatusDuration | null | undefined
): ManualStatusDurationDraft {
  if (!duration) {
    return defaultManualStatusDurationDraft;
  }

  switch (duration.kind) {
    case STATUS_DURATION_KIND.SHORT_REST:
      return {
        type: "SHORT_REST",
        value: minimumManualStatusDurationValue
      };
    case STATUS_DURATION_KIND.LONG_REST:
      return {
        type: "LONG_REST",
        value: minimumManualStatusDurationValue
      };
    case STATUS_DURATION_KIND.MINUTES:
      return {
        type: "MINUTES",
        value: clampManualStatusDurationValue(duration.amount)
      };
    case STATUS_DURATION_KIND.HOURS:
      return {
        type: "HOURS",
        value: clampManualStatusDurationValue(duration.amount)
      };
    case STATUS_DURATION_KIND.DAYS:
      return {
        type: "DAYS",
        value: clampManualStatusDurationValue(duration.amount)
      };
    case STATUS_DURATION_KIND.ROUNDS:
      return {
        type:
          normalizeStatusDurationRoundTick(duration.tickOn) === STATUS_DURATION_ROUND_TICK.ROUND_END
            ? "ROUNDS_END"
            : "ROUNDS_START",
        value: clampManualStatusDurationValue(duration.amount)
      };
    case STATUS_DURATION_KIND.INFINITE:
    case STATUS_DURATION_KIND.CONCENTRATION:
    case STATUS_DURATION_KIND.LINKED:
    default:
      return defaultManualStatusDurationDraft;
  }
}

export function createManualStatusDuration(
  type: ManualStatusDurationType,
  value: number
): CharacterStatusDuration {
  const amount = clampManualStatusDurationValue(value);

  switch (type) {
    case "ROUNDS_START":
      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
      };
    case "ROUNDS_END":
      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
      };
    case "MINUTES":
      return {
        kind: STATUS_DURATION_KIND.MINUTES,
        amount
      };
    case "HOURS":
      return {
        kind: STATUS_DURATION_KIND.HOURS,
        amount
      };
    case "DAYS":
      return {
        kind: STATUS_DURATION_KIND.DAYS,
        amount
      };
    case "SHORT_REST":
      return { kind: STATUS_DURATION_KIND.SHORT_REST };
    case "LONG_REST":
      return { kind: STATUS_DURATION_KIND.LONG_REST };
    case "INFINITE":
    default:
      return { kind: STATUS_DURATION_KIND.INFINITE };
  }
}
