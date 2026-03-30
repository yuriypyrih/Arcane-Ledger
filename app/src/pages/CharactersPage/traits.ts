import {
  barbarianFeatureMap,
  paladinFeatureMap,
  rogueFeatureMap,
  sorcererFeatureMap
} from "../../codex/classes";
import type { SpellDescriptionEntry, SpellDurationPart } from "../../codex/entries";
import { CLASS_FEATURE, DAMAGE_TYPE, DURATION } from "../../codex/entries";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_PRESET,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusDuration,
  type CharacterStatusEntry,
  type CharacterStatusValue,
  type ImmunityValue
} from "../../types";
import { formatCodexLabel } from "../../utils/codex";
import { getKeywordDescriptionLines } from "./keywordDescriptions";
import { clampInteger } from "./shared";

const senseValues = new Set<SENSE>(Object.values(SENSE));
const effectValues = new Set<EFFECT_NAME>(Object.values(EFFECT_NAME));
const conditionValues = new Set<CONDITION_NAME>(Object.values(CONDITION_NAME));
const damageTypeValues = new Set<DAMAGE_TYPE>(Object.values(DAMAGE_TYPE));
const statusGroupValues = new Set<STATUS_ENTRY_GROUP>(Object.values(STATUS_ENTRY_GROUP));
const statusSourceTypeValues = new Set<STATUS_ENTRY_SOURCE_TYPE>(
  Object.values(STATUS_ENTRY_SOURCE_TYPE)
);
const exhaustionConditionOptionPrefix = "EXHAUSTION_LEVEL_";
export const exhaustionLevels = [1, 2, 3, 4, 5, 6] as const;
export type ExhaustionLevel = (typeof exhaustionLevels)[number];
export type ExhaustionConditionOptionValue =
  `${typeof exhaustionConditionOptionPrefix}${ExhaustionLevel}`;
export type ConditionOptionValue = CONDITION_NAME | ExhaustionConditionOptionValue;
const exhaustionConditionOptionValues = exhaustionLevels.map(
  (level) => `${exhaustionConditionOptionPrefix}${level}` as ExhaustionConditionOptionValue
);
const exhaustionDescriptionEntries: SpellDescriptionEntry[] = [
  "Higher Exhaustion levels include all lower-level effects.",
  "<strong>Level 1.</strong> You have <link:Disadvantage>Disadvantage</link> on ability checks.",
  "<strong>Level 2.</strong> Your <link:Speed>Speed</link> is halved.",
  "<strong>Level 3.</strong> You have <link:Disadvantage>Disadvantage</link> on attack rolls and saving throws.",
  "<strong>Level 4.</strong> Your Hit Point maximum is halved.",
  "<strong>Level 5.</strong> Your <link:Speed>Speed</link> is reduced to 0.",
  "<strong>Level 6.</strong> You die. This death bypasses death saving throws."
];

export const statusGroupOrder: STATUS_ENTRY_GROUP[] = [
  STATUS_ENTRY_GROUP.EFFECTS,
  STATUS_ENTRY_GROUP.REACTIONS,
  STATUS_ENTRY_GROUP.SENSES,
  STATUS_ENTRY_GROUP.AURAS,
  STATUS_ENTRY_GROUP.RESISTANCES,
  STATUS_ENTRY_GROUP.VULNERABILITIES,
  STATUS_ENTRY_GROUP.IMMUNITIES,
  STATUS_ENTRY_GROUP.CONDITIONS
];

export const statusGroupTitles: Record<STATUS_ENTRY_GROUP, string> = {
  [STATUS_ENTRY_GROUP.EFFECTS]: "Features",
  [STATUS_ENTRY_GROUP.REACTIONS]: "Reactions",
  [STATUS_ENTRY_GROUP.SENSES]: "Senses",
  [STATUS_ENTRY_GROUP.AURAS]: "Auras",
  [STATUS_ENTRY_GROUP.RESISTANCES]: "Resistances",
  [STATUS_ENTRY_GROUP.VULNERABILITIES]: "Vulnerabilities",
  [STATUS_ENTRY_GROUP.IMMUNITIES]: "Immunities",
  [STATUS_ENTRY_GROUP.CONDITIONS]: "Conditions"
};

export const durationPresetOptions: Array<{
  value: STATUS_DURATION_PRESET;
  label: string;
}> = [
  { value: STATUS_DURATION_PRESET.INFINITE, label: "Infinity" },
  { value: STATUS_DURATION_PRESET.CONCENTRATION, label: "Concentration" },
  { value: STATUS_DURATION_PRESET.ONE_MINUTE, label: "1 minute" },
  { value: STATUS_DURATION_PRESET.TEN_MINUTES, label: "10 minutes" },
  { value: STATUS_DURATION_PRESET.ONE_HOUR, label: "1 hour" },
  { value: STATUS_DURATION_PRESET.TWO_HOURS, label: "2 hours" },
  { value: STATUS_DURATION_PRESET.EIGHT_HOURS, label: "8 hours" },
  { value: STATUS_DURATION_PRESET.TWELVE_HOURS, label: "12 hours" },
  { value: STATUS_DURATION_PRESET.TWENTY_FOUR_HOURS, label: "24 hours" },
  ...Array.from({ length: 20 }, (_, index) => ({
    value: roundCountToDurationPreset(index + 1),
    label: `${index + 1} round${index === 0 ? "" : "s"}`
  }))
];

function roundCountToDurationPreset(rounds: number): STATUS_DURATION_PRESET {
  return [
    STATUS_DURATION_PRESET.ONE_ROUND,
    STATUS_DURATION_PRESET.TWO_ROUNDS,
    STATUS_DURATION_PRESET.THREE_ROUNDS,
    STATUS_DURATION_PRESET.FOUR_ROUNDS,
    STATUS_DURATION_PRESET.FIVE_ROUNDS,
    STATUS_DURATION_PRESET.SIX_ROUNDS,
    STATUS_DURATION_PRESET.SEVEN_ROUNDS,
    STATUS_DURATION_PRESET.EIGHT_ROUNDS,
    STATUS_DURATION_PRESET.NINE_ROUNDS,
    STATUS_DURATION_PRESET.TEN_ROUNDS,
    STATUS_DURATION_PRESET.ELEVEN_ROUNDS,
    STATUS_DURATION_PRESET.TWELVE_ROUNDS,
    STATUS_DURATION_PRESET.THIRTEEN_ROUNDS,
    STATUS_DURATION_PRESET.FOURTEEN_ROUNDS,
    STATUS_DURATION_PRESET.FIFTEEN_ROUNDS,
    STATUS_DURATION_PRESET.SIXTEEN_ROUNDS,
    STATUS_DURATION_PRESET.SEVENTEEN_ROUNDS,
    STATUS_DURATION_PRESET.EIGHTEEN_ROUNDS,
    STATUS_DURATION_PRESET.NINETEEN_ROUNDS,
    STATUS_DURATION_PRESET.TWENTY_ROUNDS
  ][Math.max(0, Math.min(19, rounds - 1))];
}

function durationPresetToRoundCount(preset: STATUS_DURATION_PRESET): number | null {
  const mapping = new Map<STATUS_DURATION_PRESET, number>([
    [STATUS_DURATION_PRESET.ONE_ROUND, 1],
    [STATUS_DURATION_PRESET.TWO_ROUNDS, 2],
    [STATUS_DURATION_PRESET.THREE_ROUNDS, 3],
    [STATUS_DURATION_PRESET.FOUR_ROUNDS, 4],
    [STATUS_DURATION_PRESET.FIVE_ROUNDS, 5],
    [STATUS_DURATION_PRESET.SIX_ROUNDS, 6],
    [STATUS_DURATION_PRESET.SEVEN_ROUNDS, 7],
    [STATUS_DURATION_PRESET.EIGHT_ROUNDS, 8],
    [STATUS_DURATION_PRESET.NINE_ROUNDS, 9],
    [STATUS_DURATION_PRESET.TEN_ROUNDS, 10],
    [STATUS_DURATION_PRESET.ELEVEN_ROUNDS, 11],
    [STATUS_DURATION_PRESET.TWELVE_ROUNDS, 12],
    [STATUS_DURATION_PRESET.THIRTEEN_ROUNDS, 13],
    [STATUS_DURATION_PRESET.FOURTEEN_ROUNDS, 14],
    [STATUS_DURATION_PRESET.FIFTEEN_ROUNDS, 15],
    [STATUS_DURATION_PRESET.SIXTEEN_ROUNDS, 16],
    [STATUS_DURATION_PRESET.SEVENTEEN_ROUNDS, 17],
    [STATUS_DURATION_PRESET.EIGHTEEN_ROUNDS, 18],
    [STATUS_DURATION_PRESET.NINETEEN_ROUNDS, 19],
    [STATUS_DURATION_PRESET.TWENTY_ROUNDS, 20]
  ]);

  return mapping.get(preset) ?? null;
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

function normalizeExhaustionLevel(value: unknown): ExhaustionLevel | null {
  const normalizedValue = clampInteger(
    value,
    exhaustionLevels[0],
    exhaustionLevels[exhaustionLevels.length - 1] ?? 6,
    1
  );

  return exhaustionLevels.includes(normalizedValue as ExhaustionLevel)
    ? (normalizedValue as ExhaustionLevel)
    : null;
}

function getExhaustionLevelFromConditionOption(value: string): ExhaustionLevel | null {
  if (!value.startsWith(exhaustionConditionOptionPrefix)) {
    return null;
  }

  return normalizeExhaustionLevel(value.slice(exhaustionConditionOptionPrefix.length));
}

export function isExhaustionConditionOptionValue(
  value: string
): value is ExhaustionConditionOptionValue {
  return getExhaustionLevelFromConditionOption(value) !== null;
}

export function formatConditionOptionLabel(value: string): string {
  const exhaustionLevel = getExhaustionLevelFromConditionOption(value);

  if (exhaustionLevel !== null) {
    return `Exhaustion Level ${exhaustionLevel}`;
  }

  return value;
}

export function parseConditionOptionValue(value: string): {
  value: CONDITION_NAME;
  conditionLevel?: ExhaustionLevel;
} | null {
  const exhaustionLevel = getExhaustionLevelFromConditionOption(value);

  if (exhaustionLevel !== null) {
    return {
      value: CONDITION_NAME.EXHAUSTION,
      conditionLevel: exhaustionLevel
    };
  }

  return isConditionName(value)
    ? {
        value
      }
    : null;
}

export function isExhaustionStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "value"> | null | undefined
): boolean {
  return (
    entry?.group === STATUS_ENTRY_GROUP.CONDITIONS && entry.value === CONDITION_NAME.EXHAUSTION
  );
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

function parseSpellConcentrationDurationLabel(label: string): CharacterStatusDuration | null {
  const normalizedLabel = label
    .trim()
    .toLowerCase()
    .replace(/^up to\s+/, "");

  if (!normalizedLabel) {
    return {
      kind: STATUS_DURATION_KIND.INFINITE
    };
  }

  const roundMatch = normalizedLabel.match(/^(\d+)\s+rounds?$/);

  if (roundMatch) {
    return {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: clampInteger(roundMatch[1], 1, 999, 1)
    };
  }

  const minuteMatch = normalizedLabel.match(/^(\d+)\s+minutes?$/);

  if (minuteMatch) {
    return {
      kind: STATUS_DURATION_KIND.MINUTES,
      amount: clampInteger(minuteMatch[1], 1, 999, 1)
    };
  }

  const hourMatch = normalizedLabel.match(/^(\d+)\s+hours?$/);

  if (hourMatch) {
    return {
      kind: STATUS_DURATION_KIND.HOURS,
      amount: clampInteger(hourMatch[1], 1, 999, 1)
    };
  }

  const dayMatch = normalizedLabel.match(/^(\d+)\s+days?$/);

  if (dayMatch) {
    return {
      kind: STATUS_DURATION_KIND.HOURS,
      amount: clampInteger(dayMatch[1], 1, 999, 1) * 24
    };
  }

  return null;
}

export function getSpellConcentrationDuration(
  durationParts: SpellDurationPart[]
): CharacterStatusDuration | null {
  if (!durationParts.includes(DURATION.CONCENTRATION)) {
    return null;
  }

  const detailText = durationParts
    .filter((part) => part !== DURATION.CONCENTRATION)
    .map((part) => String(part).trim())
    .filter((part) => part.length > 0)
    .join(", ");

  return parseSpellConcentrationDurationLabel(detailText);
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
    case STATUS_DURATION_KIND.ROUNDS:
      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: clampInteger(record.amount, 1, 999, 1)
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
    amount: clampInteger(parsed, 1, 999, 1)
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

export function createStatusDurationFromPreset(
  preset: STATUS_DURATION_PRESET
): CharacterStatusDuration {
  switch (preset) {
    case STATUS_DURATION_PRESET.CONCENTRATION:
      return {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      };
    case STATUS_DURATION_PRESET.ONE_MINUTE:
      return { kind: STATUS_DURATION_KIND.MINUTES, amount: 1 };
    case STATUS_DURATION_PRESET.TEN_MINUTES:
      return { kind: STATUS_DURATION_KIND.MINUTES, amount: 10 };
    case STATUS_DURATION_PRESET.ONE_HOUR:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 1 };
    case STATUS_DURATION_PRESET.TWO_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 2 };
    case STATUS_DURATION_PRESET.EIGHT_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 8 };
    case STATUS_DURATION_PRESET.TWELVE_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 12 };
    case STATUS_DURATION_PRESET.TWENTY_FOUR_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 24 };
    case STATUS_DURATION_PRESET.INFINITE:
      return { kind: STATUS_DURATION_KIND.INFINITE };
    default: {
      const roundCount = durationPresetToRoundCount(preset);

      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: roundCount ?? 1
      };
    }
  }
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

export function resolveCharacterStatusEntries(
  manualEntries: unknown,
  derivedEntries: CharacterStatusEntry[] = []
): CharacterStatusEntry[] {
  const normalizedEntries = normalizeCharacterStatusEntries(manualEntries);
  const overrideEntries = normalizedEntries.filter(
    (entry) =>
      entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
      typeof entry.sourceId === "string" &&
      entry.sourceId.length > 0
  );
  const standaloneEntries = normalizedEntries.filter(
    (entry) =>
      entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL ||
      typeof entry.sourceId !== "string" ||
      entry.sourceId.length === 0
  );
  const overrideEntriesBySourceId = new Map<string, CharacterStatusEntry>();

  overrideEntries.forEach((entry) => {
    if (entry.sourceId) {
      overrideEntriesBySourceId.set(entry.sourceId, entry);
    }
  });

  return pruneLinkedStatusEntries([
    ...standaloneEntries,
    ...derivedEntries.map((entry) => {
      const durationOverride = overrideEntriesBySourceId.get(entry.sourceId ?? entry.id);

      return durationOverride && entry.duration.kind !== STATUS_DURATION_KIND.LINKED
        ? {
            ...entry,
            duration: durationOverride.duration
          }
        : entry;
    })
  ]);
}

export function removeCharacterStatusEntry(
  value: unknown,
  entryId: string
): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).filter((entry) => entry.id !== entryId)
  );
}

export function removeCharacterConditionsForImmunities(
  value: unknown,
  immunityEntries: ReadonlyArray<Pick<CharacterStatusEntry, "group" | "value">>
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const immuneConditions = getImmuneConditionSet([
    ...entries,
    ...immunityEntries
  ]);

  if (immuneConditions.size === 0) {
    return entries;
  }

  return pruneLinkedStatusEntries(
    entries.filter(
      (entry) =>
        !(
          entry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
          isConditionName(entry.value) &&
          immuneConditions.has(entry.value)
        )
    )
  );
}

export function upsertManualStatusEntry(
  value: unknown,
  nextEntry: Omit<CharacterStatusEntry, "id" | "sourceType"> & {
    sourceType?: STATUS_ENTRY_SOURCE_TYPE.MANUAL;
  }
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const existingEntry = entries.find(
    (entry) =>
      entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
      entry.group === nextEntry.group &&
      entry.value === nextEntry.value &&
      (entry.rangeFeet ?? null) === (nextEntry.rangeFeet ?? null)
  );

  if (!existingEntry) {
    return ensureLinkedStatusDependencies([
      ...entries,
      createCharacterStatusEntry({
        ...nextEntry,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
      })
    ]);
  }

  return ensureLinkedStatusDependencies(
    entries.map((entry) =>
      entry.id === existingEntry.id
        ? {
            ...entry,
            conditionLevel:
              nextEntry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
              nextEntry.value === CONDITION_NAME.EXHAUSTION
                ? (normalizeExhaustionLevel(nextEntry.conditionLevel) ?? 1)
                : null,
            source: nextEntry.source,
            duration: nextEntry.duration,
            rangeFeet: nextEntry.rangeFeet ?? null
          }
        : entry
    )
  );
}

export function updateCharacterStatusEntryDuration(
  value: unknown,
  entryToUpdate: CharacterStatusEntry,
  duration: CharacterStatusDuration
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const storedEntry = entries.find((entry) => entry.id === entryToUpdate.id);

  if (storedEntry) {
    return ensureLinkedStatusDependencies(
      entries.map((entry) =>
        entry.id === entryToUpdate.id
          ? {
              ...entry,
              duration
            }
          : entry
      )
    );
  }

  const existingDurationOverride = entries.find(
    (entry) =>
      entry.sourceId === (entryToUpdate.sourceId ?? entryToUpdate.id) &&
      entry.sourceType === entryToUpdate.sourceType &&
      entry.group === entryToUpdate.group
  );

  if (existingDurationOverride) {
    return ensureLinkedStatusDependencies(
      entries.map((entry) =>
        entry.id === existingDurationOverride.id
          ? {
              ...entry,
              duration
            }
          : entry
      )
    );
  }

  return ensureLinkedStatusDependencies([
    ...entries,
    createCharacterStatusEntry({
      group: entryToUpdate.group,
      value: entryToUpdate.value,
      conditionLevel: entryToUpdate.conditionLevel,
      source: entryToUpdate.source,
      sourceType: entryToUpdate.sourceType,
      duration,
      sourceId: entryToUpdate.sourceId ?? entryToUpdate.id,
      rangeFeet: entryToUpdate.rangeFeet ?? null
    })
  ]);
}

export function applySpellConcentrationToStatusEntries(
  value: unknown,
  spell: { name: string; duration: SpellDurationPart[] }
): CharacterStatusEntry[] {
  const concentrationDuration = getSpellConcentrationDuration(spell.duration);
  const entries = normalizeCharacterStatusEntries(value);

  if (!concentrationDuration) {
    return entries;
  }

  return ensureLinkedStatusDependencies([
    ...entries.filter(
      (entry) =>
        !(
          (entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
            entry.value === EFFECT_NAME.CONCENTRATION) ||
          isLinkedToConcentration(entry.duration)
        )
    ),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: EFFECT_NAME.CONCENTRATION,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: concentrationDuration
    })
  ]);
}

export function hasStatusCondition(value: unknown, condition: CONDITION_NAME): boolean {
  return normalizeCharacterStatusEntries(value).some(
    (entry) => entry.group === STATUS_ENTRY_GROUP.CONDITIONS && entry.value === condition
  );
}

export function getExhaustionStatusEntry(value: unknown): CharacterStatusEntry | null {
  return (
    normalizeCharacterStatusEntries(value).find((entry) => isExhaustionStatusEntry(entry)) ?? null
  );
}

export function getExhaustionLevel(value: unknown): ExhaustionLevel | null {
  const exhaustionEntry = getExhaustionStatusEntry(value);

  if (!exhaustionEntry) {
    return null;
  }

  return normalizeExhaustionLevel(exhaustionEntry.conditionLevel) ?? 1;
}

export function setCharacterExhaustionLevel(
  value: unknown,
  nextLevel: ExhaustionLevel | null
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const existingEntry = entries.find((entry) => isExhaustionStatusEntry(entry));

  if (nextLevel === null) {
    return ensureLinkedStatusDependencies(
      entries.filter((entry) => !isExhaustionStatusEntry(entry))
    );
  }

  if (existingEntry) {
    return ensureLinkedStatusDependencies(
      entries.map((entry) =>
        entry.id === existingEntry.id
          ? {
              ...entry,
              conditionLevel: nextLevel,
              duration: { kind: STATUS_DURATION_KIND.INFINITE }
            }
          : entry
      )
    );
  }

  return ensureLinkedStatusDependencies([
    ...entries,
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.CONDITIONS,
      value: CONDITION_NAME.EXHAUSTION,
      conditionLevel: nextLevel,
      source: "Manual",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: { kind: STATUS_DURATION_KIND.INFINITE }
    })
  ]);
}

export function hasExhaustionAbilityCheckDisadvantage(value: unknown): boolean {
  return (getExhaustionLevel(value) ?? 0) >= 1;
}

export function hasExhaustionAttackRollDisadvantage(value: unknown): boolean {
  return (getExhaustionLevel(value) ?? 0) >= 3;
}

export function hasExhaustionSavingThrowDisadvantage(value: unknown): boolean {
  return (getExhaustionLevel(value) ?? 0) >= 3;
}

export function getExhaustionSpeedAdjustment(
  baseSpeed: number,
  value: unknown
): {
  label: string;
  value: number;
} | null {
  const exhaustionLevel = getExhaustionLevel(value);

  if (exhaustionLevel === null || baseSpeed <= 0) {
    return null;
  }

  if (exhaustionLevel >= 5) {
    return {
      label: "Exhaustion",
      value: -baseSpeed
    };
  }

  if (exhaustionLevel >= 2) {
    return {
      label: "Exhaustion",
      value: Math.floor(baseSpeed / 2) - baseSpeed
    };
  }

  return null;
}

export function getEffectiveHitPointMaximumForCharacter(
  character: Pick<Character, "hitPoints" | "statusEntries">
): number {
  const baseHitPoints = Math.max(1, Math.floor(character.hitPoints));
  const exhaustionLevel = getExhaustionLevel(character.statusEntries);

  if (exhaustionLevel !== null && exhaustionLevel >= 4) {
    return Math.max(1, Math.floor(baseHitPoints / 2));
  }

  return baseHitPoints;
}

export function reconcileCharacterStatusConsequences(character: Character): Character {
  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter(character);
  const exhaustionLevel = getExhaustionLevel(character.statusEntries);
  const isDeadFromExhaustion = exhaustionLevel !== null && exhaustionLevel >= 6;
  const nextCurrentHitPoints = isDeadFromExhaustion
    ? 0
    : Math.max(0, Math.min(effectiveHitPointMaximum, character.currentHitPoints));
  const nextDeathSaves = isDeadFromExhaustion
    ? {
        successes: 0,
        failures: 3
      }
    : character.deathSaves;
  const deathSavesUnchanged = isDeadFromExhaustion
    ? character.deathSaves?.successes === 0 && character.deathSaves?.failures === 3
    : true;

  if (
    nextCurrentHitPoints === character.currentHitPoints &&
    (!isDeadFromExhaustion || deathSavesUnchanged)
  ) {
    return character;
  }

  return {
    ...character,
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: nextDeathSaves
  };
}

export function advanceCharacterStatusEntries(value: unknown): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).flatMap((entry) => {
      if (entry.duration.kind !== STATUS_DURATION_KIND.ROUNDS) {
        return [entry];
      }

      const nextAmount = entry.duration.amount - 1;

      if (nextAmount <= 0) {
        return [];
      }

      return [
        {
          ...entry,
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: nextAmount
          }
        }
      ];
    })
  );
}

export function applyShortRestToCharacterStatusEntries(value: unknown): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).filter((entry) => {
      switch (entry.duration.kind) {
        case STATUS_DURATION_KIND.INFINITE:
          return (
            entry.group !== STATUS_ENTRY_GROUP.EFFECTS || entry.value !== EFFECT_NAME.CONCENTRATION
          );
        case STATUS_DURATION_KIND.HOURS:
          return entry.duration.amount >= 1;
        case STATUS_DURATION_KIND.MINUTES:
        case STATUS_DURATION_KIND.ROUNDS:
        case STATUS_DURATION_KIND.CONCENTRATION:
          return false;
        case STATUS_DURATION_KIND.LINKED:
          return true;
        default:
          return true;
      }
    })
  );
}

export function applyLongRestToCharacterStatusEntries(value: unknown): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).filter(
      (entry) =>
        (entry.duration.kind === STATUS_DURATION_KIND.INFINITE ||
          entry.duration.kind === STATUS_DURATION_KIND.LINKED) &&
        (entry.group !== STATUS_ENTRY_GROUP.EFFECTS || entry.value !== EFFECT_NAME.CONCENTRATION)
    )
  );
}

export function getStatusEntryTitle(entry: CharacterStatusEntry): string {
  if (isExhaustionStatusEntry(entry)) {
    const exhaustionLevel = normalizeExhaustionLevel(entry.conditionLevel) ?? 1;

    return `Exhaustion ${exhaustionLevel}`;
  }

  return typeof entry.value === "string" ? entry.value : formatCodexLabel(String(entry.value));
}

export function getStatusEntryKeyword(entry: CharacterStatusEntry): string {
  if (isExhaustionStatusEntry(entry)) {
    return CONDITION_NAME.EXHAUSTION;
  }

  if (typeof entry.value === "string") {
    return entry.value;
  }

  return formatCodexLabel(String(entry.value));
}

export function getStatusEntryDescriptionEntries(
  entry: CharacterStatusEntry
): SpellDescriptionEntry[] {
  if (isExhaustionStatusEntry(entry)) {
    const exhaustionLevel = normalizeExhaustionLevel(entry.conditionLevel) ?? 1;

    return [
      `<strong>Current Level.</strong> Level ${exhaustionLevel}. Higher Exhaustion levels include all lower-level effects.`,
      ...exhaustionDescriptionEntries.slice(1)
    ];
  }

  if (entry.sourceId === "feature-paladin-aura-of-protection") {
    return (
      paladinFeatureMap[CLASS_FEATURE.AURA_OF_PROTECTION]?.description ?? [
        "An aura passively affects creatures or spaces around you."
      ]
    );
  }

  if (entry.sourceId === "feature-paladin-aura-of-courage") {
    return (
      paladinFeatureMap[CLASS_FEATURE.AURA_OF_COURAGE]?.description ?? [
        "An aura passively affects creatures or spaces around you."
      ]
    );
  }

  if (entry.sourceId === "feature-rogue-evasion") {
    return (
      rogueFeatureMap[CLASS_FEATURE.EVASION]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-rogue-elusive") {
    return (
      rogueFeatureMap[CLASS_FEATURE.ELUSIVE]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-barbarian-reckless-attack") {
    return (
      barbarianFeatureMap[CLASS_FEATURE.RECKLESS_ATTACK]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-sorcerer-innate-sorcery") {
    return (
      sorcererFeatureMap[CLASS_FEATURE.INNATE_SORCERY]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  const keywordDescriptionEntries = getKeywordDescriptionLines(getStatusEntryKeyword(entry));

  if (
    entry.group === STATUS_ENTRY_GROUP.SENSES ||
    entry.group === STATUS_ENTRY_GROUP.CONDITIONS ||
    entry.group === STATUS_ENTRY_GROUP.EFFECTS
  ) {
    return (
      keywordDescriptionEntries ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  const valueLabel = getStatusEntryTitle(entry);

  switch (entry.group) {
    case STATUS_ENTRY_GROUP.REACTIONS:
      return [
        `A spell, cantrip, or feature you can use as a Reaction. Using ${valueLabel} spends your Reaction for the round.`
      ];
    case STATUS_ENTRY_GROUP.RESISTANCES:
      return [
        `Resistance to ${valueLabel.toLowerCase()} damage. You usually take half damage from that type unless a rule says otherwise.`
      ];
    case STATUS_ENTRY_GROUP.VULNERABILITIES:
      return [
        `Vulnerability to ${valueLabel.toLowerCase()} damage. You usually take double damage from that type unless a rule says otherwise.`
      ];
    case STATUS_ENTRY_GROUP.IMMUNITIES:
      return [
        isConditionName(entry.value)
          ? `Immunity to the ${valueLabel} condition. Effects that would apply it have no effect on you unless a rule says otherwise.`
          : `Immunity to ${valueLabel.toLowerCase()} damage. You usually take no damage from that type unless a rule says otherwise.`
      ];
    case STATUS_ENTRY_GROUP.AURAS:
      return (
        keywordDescriptionEntries ?? ["An aura passively affects creatures or spaces around you."]
      );
    default:
      return (
        keywordDescriptionEntries ?? [
          "A current effect or trait that may change how your character plays."
        ]
      );
  }
}

export function getStatusEntryDescription(entry: CharacterStatusEntry): string {
  return getStatusEntryDescriptionEntries(entry)
    .map((descriptionEntry) =>
      typeof descriptionEntry === "string" ? descriptionEntry : descriptionEntry.items.join(" ")
    )
    .join(" ");
}

export function getStatusEntrySourceLabel(entry: CharacterStatusEntry): string {
  const sourceLabel = entry.rangeFeet ? `${entry.source} (${entry.rangeFeet} ft.)` : entry.source;

  if (entry.disabled && entry.disabledReason) {
    return `${sourceLabel} - ${entry.disabledReason}`;
  }

  if (entry.rangeFeet) {
    return `${entry.source} (${entry.rangeFeet} ft.)`;
  }

  return sourceLabel;
}

export function getStatusDurationLabel(duration: CharacterStatusDuration): string {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return "Infinite";
    case STATUS_DURATION_KIND.CONCENTRATION:
      return "Concentration";
    case STATUS_DURATION_KIND.LINKED:
      return formatLinkedStatusDurationLabel(duration);
    case STATUS_DURATION_KIND.MINUTES:
      return `${duration.amount} minute${duration.amount === 1 ? "" : "s"}`;
    case STATUS_DURATION_KIND.HOURS:
      return `${duration.amount} hour${duration.amount === 1 ? "" : "s"}`;
    case STATUS_DURATION_KIND.ROUNDS:
      return `${duration.amount} round${duration.amount === 1 ? "" : "s"}`;
    default:
      return "Infinite";
  }
}

export function getStatusDurationPreset(duration: CharacterStatusDuration): STATUS_DURATION_PRESET {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.CONCENTRATION:
      return STATUS_DURATION_PRESET.CONCENTRATION;
    case STATUS_DURATION_KIND.LINKED:
      return duration.linkedGroup === STATUS_ENTRY_GROUP.EFFECTS &&
        duration.linkedValue === EFFECT_NAME.CONCENTRATION
        ? STATUS_DURATION_PRESET.CONCENTRATION
        : STATUS_DURATION_PRESET.INFINITE;
    case STATUS_DURATION_KIND.MINUTES:
      switch (duration.amount) {
        case 1:
          return STATUS_DURATION_PRESET.ONE_MINUTE;
        case 10:
          return STATUS_DURATION_PRESET.TEN_MINUTES;
        default:
          return STATUS_DURATION_PRESET.INFINITE;
      }
    case STATUS_DURATION_KIND.HOURS:
      switch (duration.amount) {
        case 1:
          return STATUS_DURATION_PRESET.ONE_HOUR;
        case 2:
          return STATUS_DURATION_PRESET.TWO_HOURS;
        case 8:
          return STATUS_DURATION_PRESET.EIGHT_HOURS;
        case 12:
          return STATUS_DURATION_PRESET.TWELVE_HOURS;
        case 24:
          return STATUS_DURATION_PRESET.TWENTY_FOUR_HOURS;
        default:
          return STATUS_DURATION_PRESET.INFINITE;
      }
    case STATUS_DURATION_KIND.ROUNDS:
      return roundCountToDurationPreset(duration.amount);
    case STATUS_DURATION_KIND.INFINITE:
    default:
      return STATUS_DURATION_PRESET.INFINITE;
  }
}

export function getStatusDurationShortLabel(duration: CharacterStatusDuration): string | null {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return null;
    case STATUS_DURATION_KIND.CONCENTRATION:
      return "Conc.";
    case STATUS_DURATION_KIND.LINKED:
      return formatLinkedStatusDurationLabel(duration);
    case STATUS_DURATION_KIND.MINUTES:
      return `${duration.amount}m`;
    case STATUS_DURATION_KIND.HOURS:
      return `${duration.amount}h`;
    case STATUS_DURATION_KIND.ROUNDS:
      return String(duration.amount);
    default:
      return null;
  }
}

export function getStatusEntrySortRank(group: STATUS_ENTRY_GROUP): number {
  return statusGroupOrder.indexOf(group);
}

export function getSenseOptions(): SENSE[] {
  return [...Object.values(SENSE)];
}

export function getConditionOptions(): ConditionOptionValue[] {
  return [
    ...Object.values(CONDITION_NAME).filter((condition) => condition !== CONDITION_NAME.EXHAUSTION),
    ...exhaustionConditionOptionValues
  ];
}

export function getDamageTypeOptions(): DAMAGE_TYPE[] {
  return [...Object.values(DAMAGE_TYPE)];
}

export function getImmunityOptions(): ImmunityValue[] {
  return [...Object.values(DAMAGE_TYPE), ...Object.values(CONDITION_NAME)];
}

function formatLinkedStatusDurationLabel(
  duration: Extract<CharacterStatusDuration, { kind: STATUS_DURATION_KIND.LINKED }>
): string {
  return typeof duration.linkedValue === "string"
    ? duration.linkedValue
    : formatCodexLabel(String(duration.linkedValue));
}

function isLinkedToConcentration(duration: CharacterStatusDuration): boolean {
  return (
    duration.kind === STATUS_DURATION_KIND.LINKED &&
    duration.linkedGroup === STATUS_ENTRY_GROUP.EFFECTS &&
    duration.linkedValue === EFFECT_NAME.CONCENTRATION
  );
}

function isLinkedStatusEntrySatisfied(
  entry: CharacterStatusEntry,
  entries: CharacterStatusEntry[]
): boolean {
  if (entry.duration.kind !== STATUS_DURATION_KIND.LINKED) {
    return true;
  }

  const linkedDuration = entry.duration;

  return entries.some(
    (candidate) =>
      candidate.id !== entry.id &&
      candidate.group === linkedDuration.linkedGroup &&
      candidate.value === linkedDuration.linkedValue
  );
}

function getImmuneConditionSet(
  entries: ReadonlyArray<Pick<CharacterStatusEntry, "group" | "value">>
): Set<CONDITION_NAME> {
  return entries.reduce<Set<CONDITION_NAME>>((immuneConditions, entry) => {
    if (entry.group === STATUS_ENTRY_GROUP.IMMUNITIES && isConditionName(entry.value)) {
      immuneConditions.add(entry.value);
    }

    return immuneConditions;
  }, new Set<CONDITION_NAME>());
}

function removeConditionEntriesBlockedByImmunities(
  entries: CharacterStatusEntry[]
): CharacterStatusEntry[] {
  const immuneConditions = getImmuneConditionSet(entries);

  if (immuneConditions.size === 0) {
    return entries;
  }

  return entries.filter(
    (entry) =>
      !(
        entry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
        isConditionName(entry.value) &&
        immuneConditions.has(entry.value)
      )
  );
}

function pruneLinkedStatusEntries(entries: CharacterStatusEntry[]): CharacterStatusEntry[] {
  let currentEntries = entries;

  while (true) {
    const nextEntries = removeConditionEntriesBlockedByImmunities(
      currentEntries.filter((entry) => isLinkedStatusEntrySatisfied(entry, currentEntries))
    );

    if (nextEntries.length === currentEntries.length) {
      return nextEntries;
    }

    currentEntries = nextEntries;
  }
}

function ensureLinkedStatusDependencies(entries: CharacterStatusEntry[]): CharacterStatusEntry[] {
  let nextEntries = [...entries];
  const hasConcentrationLinkedEntry = nextEntries.some((entry) =>
    isLinkedToConcentration(entry.duration)
  );
  const hasConcentrationAnchor = nextEntries.some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS && entry.value === EFFECT_NAME.CONCENTRATION
  );

  if (hasConcentrationLinkedEntry && !hasConcentrationAnchor) {
    const concentrationSourceEntry = nextEntries.find((entry) =>
      isLinkedToConcentration(entry.duration)
    );

    nextEntries = [
      ...nextEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: EFFECT_NAME.CONCENTRATION,
        source: concentrationSourceEntry?.source ?? "Manual",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: { kind: STATUS_DURATION_KIND.INFINITE }
      })
    ];
  }

  return pruneLinkedStatusEntries(nextEntries);
}
