import { DAMAGE_TYPE } from "../../codex/entries/enums";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterStatusDuration,
  type CharacterStatusEntry,
  type CharacterStatusValue
} from "../../types/traits";
import { clampInteger } from "../../utils/numbers";

const senseValues = new Set<SENSE>(Object.values(SENSE));
const effectValues = new Set<EFFECT_NAME>(Object.values(EFFECT_NAME));
const conditionValues = new Set<CONDITION_NAME>(Object.values(CONDITION_NAME));
const damageTypeValues = new Set<DAMAGE_TYPE>(Object.values(DAMAGE_TYPE));
const statusGroupValues = new Set<STATUS_ENTRY_GROUP>(Object.values(STATUS_ENTRY_GROUP));
const statusSourceTypeValues = new Set<STATUS_ENTRY_SOURCE_TYPE>(
  Object.values(STATUS_ENTRY_SOURCE_TYPE)
);
const exhaustionLevels = [1, 2, 3, 4, 5, 6] as const;

function normalizeStatusDurationRoundTick(value: unknown): STATUS_DURATION_ROUND_TICK {
  return value === STATUS_DURATION_ROUND_TICK.ROUND_END
    ? STATUS_DURATION_ROUND_TICK.ROUND_END
    : STATUS_DURATION_ROUND_TICK.ROUND_START;
}

function createStatusEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `status-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isConditionName(value: unknown): value is CONDITION_NAME {
  return typeof value === "string" && conditionValues.has(value as CONDITION_NAME);
}

function normalizeExhaustionLevel(value: unknown): number | null {
  const normalizedValue = clampInteger(
    value,
    exhaustionLevels[0],
    exhaustionLevels[exhaustionLevels.length - 1] ?? 6,
    1
  );

  return exhaustionLevels.includes(normalizedValue as (typeof exhaustionLevels)[number])
    ? normalizedValue
    : null;
}

function isSense(value: unknown): value is SENSE {
  return typeof value === "string" && senseValues.has(value as SENSE);
}

function isEffectName(value: unknown): value is EFFECT_NAME {
  return typeof value === "string" && effectValues.has(value as EFFECT_NAME);
}

function isDamageType(value: unknown): value is DAMAGE_TYPE {
  return typeof value === "string" && damageTypeValues.has(value as DAMAGE_TYPE);
}

function normalizeStatusDuration(value: unknown): CharacterStatusDuration | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<CharacterStatusDuration>;

  switch (record.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return { kind: STATUS_DURATION_KIND.INFINITE };
    case STATUS_DURATION_KIND.CONCENTRATION:
      return {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      };
    case STATUS_DURATION_KIND.LINKED: {
      const rawLinkedGroup = statusGroupValues.has(record.linkedGroup as STATUS_ENTRY_GROUP)
        ? (record.linkedGroup as STATUS_ENTRY_GROUP)
        : null;
      const linkedGroup =
        rawLinkedGroup === STATUS_ENTRY_GROUP.CONDITIONS &&
        record.linkedValue === EFFECT_NAME.CONCENTRATION
          ? STATUS_ENTRY_GROUP.EFFECTS
          : rawLinkedGroup;

      if (!linkedGroup) {
        return null;
      }

      const linkedValue = normalizeStatusValue(linkedGroup, record.linkedValue);

      if (!linkedValue) {
        return null;
      }

      return {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup,
        linkedValue
      };
    }
    case STATUS_DURATION_KIND.SHORT_REST:
      return { kind: STATUS_DURATION_KIND.SHORT_REST };
    case STATUS_DURATION_KIND.LONG_REST:
      return { kind: STATUS_DURATION_KIND.LONG_REST };
    case STATUS_DURATION_KIND.MINUTES:
      return Number.isFinite(record.amount)
        ? {
            kind: STATUS_DURATION_KIND.MINUTES,
            amount: clampInteger(record.amount, 1, 999, 1)
          }
        : null;
    case STATUS_DURATION_KIND.HOURS:
      return Number.isFinite(record.amount)
        ? {
            kind: STATUS_DURATION_KIND.HOURS,
            amount: clampInteger(record.amount, 1, 999, 1)
          }
        : null;
    case STATUS_DURATION_KIND.DAYS:
      return Number.isFinite(record.amount)
        ? {
            kind: STATUS_DURATION_KIND.DAYS,
            amount: clampInteger(record.amount, 1, 999, 1)
          }
        : null;
    case STATUS_DURATION_KIND.ROUNDS:
      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: clampInteger(record.amount, 1, 999, 1),
        tickOn: normalizeStatusDurationRoundTick(record.tickOn)
      };
    default:
      return null;
  }
}

function normalizeLegacyDuration(roundsRemaining: unknown): CharacterStatusDuration | null {
  const parsed = Number(roundsRemaining);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed === Number.POSITIVE_INFINITY || parsed === 0) {
    return {
      kind: STATUS_DURATION_KIND.INFINITE
    };
  }

  return {
    kind: STATUS_DURATION_KIND.ROUNDS,
    amount: clampInteger(parsed, 1, 999, 1),
    tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
  };
}

function normalizeStatusValue(
  group: STATUS_ENTRY_GROUP,
  value: unknown
): CharacterStatusValue | null {
  if (group === STATUS_ENTRY_GROUP.AURAS) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  }

  switch (group) {
    case STATUS_ENTRY_GROUP.EFFECTS:
      return isEffectName(value)
        ? value
        : typeof value === "string" && value.trim().length > 0
          ? value.trim()
          : null;
    case STATUS_ENTRY_GROUP.REACTIONS:
      return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
    case STATUS_ENTRY_GROUP.SENSES:
      return isSense(value) ? value : null;
    case STATUS_ENTRY_GROUP.RESISTANCES:
    case STATUS_ENTRY_GROUP.VULNERABILITIES:
      return isDamageType(value) ? value : null;
    case STATUS_ENTRY_GROUP.IMMUNITIES:
      return isDamageType(value) || isConditionName(value) ? value : null;
    case STATUS_ENTRY_GROUP.CONDITIONS:
      return isConditionName(value) ? value : null;
    default:
      return null;
  }
}

function normalizeStatusEntry(value: unknown): CharacterStatusEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<CharacterStatusEntry> & {
    roundsRemaining?: unknown;
  };
  const rawGroup = statusGroupValues.has(record.group as STATUS_ENTRY_GROUP)
    ? (record.group as STATUS_ENTRY_GROUP)
    : null;
  const group =
    rawGroup === STATUS_ENTRY_GROUP.CONDITIONS && record.value === EFFECT_NAME.CONCENTRATION
      ? STATUS_ENTRY_GROUP.EFFECTS
      : rawGroup;

  if (!group) {
    return null;
  }

  const normalizedValue = normalizeStatusValue(group, record.value);

  if (!normalizedValue) {
    return null;
  }

  const source =
    typeof record.source === "string" && record.source.trim().length > 0
      ? record.source.trim()
      : "Manual";
  const sourceType = statusSourceTypeValues.has(record.sourceType as STATUS_ENTRY_SOURCE_TYPE)
    ? (record.sourceType as STATUS_ENTRY_SOURCE_TYPE)
    : STATUS_ENTRY_SOURCE_TYPE.MANUAL;
  const duration = normalizeStatusDuration(record.duration) ??
    normalizeLegacyDuration(record.roundsRemaining) ?? {
      kind: STATUS_DURATION_KIND.INFINITE
    };

  return {
    id:
      typeof record.id === "string" && record.id.trim().length > 0
        ? record.id
        : createStatusEntryId(),
    group,
    value: normalizedValue,
    conditionLevel:
      group === STATUS_ENTRY_GROUP.CONDITIONS && normalizedValue === CONDITION_NAME.EXHAUSTION
        ? (normalizeExhaustionLevel(record.conditionLevel) ?? 1)
        : null,
    disabled: record.disabled === true,
    disabledReason:
      typeof record.disabledReason === "string" && record.disabledReason.trim().length > 0
        ? record.disabledReason.trim()
        : undefined,
    source,
    sourceType,
    duration,
    sourceId:
      typeof record.sourceId === "string" && record.sourceId.trim().length > 0
        ? record.sourceId
        : undefined,
    rangeFeet:
      typeof record.rangeFeet === "number" &&
      Number.isFinite(record.rangeFeet) &&
      record.rangeFeet > 0
        ? Math.floor(record.rangeFeet)
        : null
  };
}

function normalizeLegacyConditionEntry(value: unknown, index: number): CharacterStatusEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as {
    name?: unknown;
    roundsRemaining?: unknown;
  };

  if (!isConditionName(record.name)) {
    return null;
  }

  const duration = normalizeLegacyDuration(record.roundsRemaining);

  if (!duration) {
    return null;
  }

  return {
    id: `legacy-condition-${index}-${record.name.toLowerCase().replace(/\s+/g, "-")}`,
    group: STATUS_ENTRY_GROUP.CONDITIONS,
    value: record.name,
    source: "Manual",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration,
    rangeFeet: null
  };
}

export function normalizeCharacterStatusEntries(
  value: unknown,
  legacyConditions?: unknown
): CharacterStatusEntry[] {
  const normalizedEntries = Array.isArray(value)
    ? value
        .map((entry) => normalizeStatusEntry(entry))
        .filter((entry): entry is CharacterStatusEntry => entry !== null)
    : [];

  const migratedLegacyConditions = Array.isArray(legacyConditions)
    ? legacyConditions
        .map((entry, index) => normalizeLegacyConditionEntry(entry, index))
        .filter((entry): entry is CharacterStatusEntry => entry !== null)
    : [];

  if (normalizedEntries.length > 0) {
    return normalizedEntries;
  }

  return migratedLegacyConditions;
}

export function createCharacterStatusEntry(options: {
  group: STATUS_ENTRY_GROUP;
  value: CharacterStatusValue;
  conditionLevel?: number | null;
  disabled?: boolean;
  disabledReason?: string;
  source: string;
  sourceType?: STATUS_ENTRY_SOURCE_TYPE;
  duration?: CharacterStatusDuration;
  sourceId?: string;
  rangeFeet?: number | null;
}): CharacterStatusEntry {
  return {
    id: createStatusEntryId(),
    group: options.group,
    value: options.value,
    conditionLevel:
      options.group === STATUS_ENTRY_GROUP.CONDITIONS && options.value === CONDITION_NAME.EXHAUSTION
        ? (normalizeExhaustionLevel(options.conditionLevel) ?? 1)
        : null,
    disabled: options.disabled === true,
    disabledReason:
      typeof options.disabledReason === "string" && options.disabledReason.trim().length > 0
        ? options.disabledReason.trim()
        : undefined,
    source: options.source.trim() || "Manual",
    sourceType: options.sourceType ?? STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration: options.duration ?? {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null
  };
}
