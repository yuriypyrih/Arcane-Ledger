import type { SpellDescriptionEntry, SpellDurationPart } from "../../codex/entries";
import { DAMAGE_TYPE, DURATION } from "../../codex/entries";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../../constants/inputLimits";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  isSkillName,
  type Character,
  type CharacterCustomTraitEffect,
  type CharacterStatusDuration,
  type CharacterStatusEntry,
  type CharacterStatusSpellTarget,
  type CharacterStatusValue,
  type SkillName
} from "../../types";
import { sanitizeUserInput } from "../../utils/userInputSanitization";
import { normalizeCharacterCustomTraitEffects } from "./customTraitEffects";
import { clampInteger } from "./shared";

const senseValues = new Set<SENSE>(Object.values(SENSE));
const effectValues = new Set<EFFECT_NAME>(Object.values(EFFECT_NAME));
const conditionValues = new Set<CONDITION_NAME>(Object.values(CONDITION_NAME));
const damageTypeValues = new Set<DAMAGE_TYPE>(Object.values(DAMAGE_TYPE));
const statusGroupValues = new Set<STATUS_ENTRY_GROUP>(Object.values(STATUS_ENTRY_GROUP));
const statusSourceTypeValues = new Set<STATUS_ENTRY_SOURCE_TYPE>(
  Object.values(STATUS_ENTRY_SOURCE_TYPE)
);
const exhaustionLevels = [1, 2, 3, 4, 5, 6] as const;

export function normalizeStatusDurationRoundTick(value: unknown): STATUS_DURATION_ROUND_TICK {
  return value === STATUS_DURATION_ROUND_TICK.ROUND_END
    ? STATUS_DURATION_ROUND_TICK.ROUND_END
    : STATUS_DURATION_ROUND_TICK.ROUND_START;
}

function createTenRoundEndSpellDuration(): CharacterStatusDuration {
  return {
    kind: STATUS_DURATION_KIND.ROUNDS,
    amount: 10,
    tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
  };
}

function createStatusEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `status-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeStatusEntryId(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeRuntimeOverrideKey(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeStatusNotes(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const notes = sanitizeUserInput(value, { multiline: true })
    .slice(0, DEFAULT_TEXTAREA_MAX_LENGTH)
    .trim();

  return notes.length > 0 ? notes : undefined;
}

function isConditionName(value: unknown): value is CONDITION_NAME {
  return typeof value === "string" && conditionValues.has(value as CONDITION_NAME);
}

export function normalizeExhaustionLevel(value: unknown): number | null {
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

export function isExhaustionStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "value"> | null | undefined
): boolean {
  return (
    entry?.group === STATUS_ENTRY_GROUP.CONDITIONS && entry.value === CONDITION_NAME.EXHAUSTION
  );
}

function isInvisibleStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "value"> | null | undefined
): boolean {
  return entry?.group === STATUS_ENTRY_GROUP.CONDITIONS && entry.value === CONDITION_NAME.INVISIBLE;
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
      amount: clampInteger(roundMatch[1], 1, 999, 1),
      tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
    };
  }

  const minuteMatch = normalizedLabel.match(/^(\d+)\s+minutes?$/);

  if (minuteMatch) {
    const amount = clampInteger(minuteMatch[1], 1, 999, 1);

    if (amount === 1) {
      return createTenRoundEndSpellDuration();
    }

    return {
      kind: STATUS_DURATION_KIND.MINUTES,
      amount
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
      kind: STATUS_DURATION_KIND.DAYS,
      amount: clampInteger(dayMatch[1], 1, 999, 1)
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

const spellDurationStatusSourceIdPrefix = "spell-duration-";
const customSpellEffectStatusSourceIdPrefix = "custom-spell-effect-";

type SpellStatusEntrySource = {
  id?: string;
  name: string;
  duration: SpellDurationPart[];
  description?: SpellDescriptionEntry[];
};

function getSpellDurationStatusSourceId(
  spell: Pick<SpellStatusEntrySource, "id">
): string | undefined {
  return spell.id ? `${spellDurationStatusSourceIdPrefix}${spell.id}` : undefined;
}

function getCustomSpellEffectStatusSourceId(
  spell: Pick<SpellStatusEntrySource, "id">
): string | undefined {
  return spell.id ? `${customSpellEffectStatusSourceIdPrefix}${spell.id}` : undefined;
}

function normalizeSpellDurationLabel(label: string): string {
  return label.trim().toLowerCase().replace(/^up to\s+/, "").replace(/\s+/g, " ");
}

function isInstantaneousSpellDurationLabel(label: string): boolean {
  return /^instantaneous(?:\s*\([^)]*\))?$/.test(normalizeSpellDurationLabel(label));
}

function getSpellDurationLabelCandidates(durationParts: SpellDurationPart[]): string[] {
  return durationParts
    .filter((part) => part !== DURATION.CONCENTRATION)
    .map((part) => String(part).trim())
    .filter((part) => part.length > 0)
    .flatMap((part) => part.split(/\s+or\s+|,/i))
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseOrdinarySpellDurationLabel(label: string): CharacterStatusDuration | null {
  const normalizedLabel = normalizeSpellDurationLabel(label);

  const roundMatch = normalizedLabel.match(/^(\d+)\s+rounds?$/);

  if (roundMatch) {
    return {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: clampInteger(roundMatch[1], 1, 999, 1),
      tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
    };
  }

  const minuteMatch = normalizedLabel.match(/^(\d+)\s+minutes?$/);

  if (minuteMatch) {
    const amount = clampInteger(minuteMatch[1], 1, 999, 1);

    if (amount === 1) {
      return createTenRoundEndSpellDuration();
    }

    return {
      kind: STATUS_DURATION_KIND.MINUTES,
      amount
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
      kind: STATUS_DURATION_KIND.DAYS,
      amount: clampInteger(dayMatch[1], 1, 999, 1)
    };
  }

  return null;
}

export function getSpellNonConcentrationDuration(
  durationParts: SpellDurationPart[]
): CharacterStatusDuration | null {
  if (durationParts.includes(DURATION.CONCENTRATION)) {
    return null;
  }

  const candidates = getSpellDurationLabelCandidates(durationParts);

  for (const candidate of candidates) {
    if (isInstantaneousSpellDurationLabel(candidate)) {
      continue;
    }

    const parsedDuration = parseOrdinarySpellDurationLabel(candidate);

    if (parsedDuration) {
      return parsedDuration;
    }
  }

  return candidates.some((candidate) => !isInstantaneousSpellDurationLabel(candidate))
    ? { kind: STATUS_DURATION_KIND.INFINITE }
    : null;
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

export function normalizeCharacterStatusDuration(
  value: unknown,
  fallback: CharacterStatusDuration = { kind: STATUS_DURATION_KIND.INFINITE }
): CharacterStatusDuration {
  return normalizeStatusDuration(value) ?? fallback;
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
    case STATUS_ENTRY_GROUP.COMPANIONS:
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

function normalizeSpellDescriptionEntry(value: unknown): SpellDescriptionEntry | null {
  if (typeof value === "string") {
    const text = value.trim();

    return text.length > 0 ? text : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<Extract<SpellDescriptionEntry, { type: "list" }>>;

  if (
    record.type !== "list" ||
    (record.style !== "bullet" && record.style !== "number") ||
    !Array.isArray(record.items)
  ) {
    return null;
  }

  const items = record.items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0
    ? {
        type: "list",
        style: record.style,
        items
      }
    : null;
}

function normalizeStatusDescriptionAdditions(value: unknown): SpellDescriptionEntry[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((section) =>
      Array.isArray(section)
        ? section
            .map((entry) => normalizeSpellDescriptionEntry(entry))
            .filter((entry): entry is SpellDescriptionEntry => entry !== null)
        : []
    )
    .filter((section) => section.length > 0);
}

function normalizeStatusSourceSpellSlotLevel(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const spellSlotLevel = Math.floor(value);

  return spellSlotLevel >= 1 && spellSlotLevel <= 9 ? spellSlotLevel : null;
}

function normalizeStatusSourceSpellTarget(value: unknown): CharacterStatusSpellTarget | null {
  return value === "self" || value === "other" ? value : null;
}

function normalizeStatusSourceSpellSkill(value: unknown): SkillName | null {
  return isSkillName(value) ? value : null;
}

function normalizeStatusEntry(value: unknown): CharacterStatusEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<CharacterStatusEntry>;
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
  const duration = normalizeStatusDuration(record.duration) ?? {
    kind: STATUS_DURATION_KIND.INFINITE
  };
  const descriptionAdditions = normalizeStatusDescriptionAdditions(record.descriptionAdditions);

  const runtimeOverride = record.runtimeOverride === true;

  return {
    id: normalizeStatusEntryId(record.id) ?? createStatusEntryId(),
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
    sourceSpellId:
      typeof record.sourceSpellId === "string" && record.sourceSpellId.trim().length > 0
        ? record.sourceSpellId.trim()
        : undefined,
    sourceSpellSlotLevel: normalizeStatusSourceSpellSlotLevel(record.sourceSpellSlotLevel),
    sourceSpellTarget: normalizeStatusSourceSpellTarget(record.sourceSpellTarget),
    sourceSpellSkill: normalizeStatusSourceSpellSkill(record.sourceSpellSkill),
    rangeFeet:
      typeof record.rangeFeet === "number" &&
      Number.isFinite(record.rangeFeet) &&
      record.rangeFeet > 0
        ? Math.floor(record.rangeFeet)
        : null,
    description:
      typeof record.description === "string" && record.description.trim().length > 0
        ? record.description.trim()
        : undefined,
    descriptionAdditions: descriptionAdditions.length > 0 ? descriptionAdditions : undefined,
    customEffects: Array.isArray(record.customEffects)
      ? normalizeCharacterCustomTraitEffects(record.customEffects)
      : undefined,
    notes: normalizeStatusNotes(record.notes),
    runtimeOverride: runtimeOverride ? true : undefined,
    runtimeOverrideKey: runtimeOverride
      ? normalizeRuntimeOverrideKey(record.runtimeOverrideKey)
      : undefined
  };
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
  if (!entry.duration || entry.duration.kind !== STATUS_DURATION_KIND.LINKED) {
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

export function pruneLinkedStatusEntries(entries: CharacterStatusEntry[]): CharacterStatusEntry[] {
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

export function normalizeCharacterStatusEntries(value: unknown): CharacterStatusEntry[] {
  const normalizedEntries = Array.isArray(value)
    ? value
        .map((entry) => normalizeStatusEntry(entry))
        .filter((entry): entry is CharacterStatusEntry => entry !== null)
    : [];
  return normalizedEntries;
}

export function createCharacterStatusEntry(options: {
  id?: string;
  group: STATUS_ENTRY_GROUP;
  value: CharacterStatusValue;
  conditionLevel?: number | null;
  disabled?: boolean;
  disabledReason?: string;
  source: string;
  sourceType?: STATUS_ENTRY_SOURCE_TYPE;
  duration?: CharacterStatusDuration;
  sourceId?: string;
  sourceSpellId?: string;
  sourceSpellSlotLevel?: number | null;
  sourceSpellTarget?: CharacterStatusSpellTarget | null;
  sourceSpellSkill?: SkillName | null;
  rangeFeet?: number | null;
  description?: string;
  descriptionAdditions?: SpellDescriptionEntry[][];
  customEffects?: CharacterCustomTraitEffect[];
  notes?: string;
  runtimeOverride?: boolean;
  runtimeOverrideKey?: string;
}): CharacterStatusEntry {
  const descriptionAdditions = normalizeStatusDescriptionAdditions(options.descriptionAdditions);
  const notes = normalizeStatusNotes(options.notes);
  const runtimeOverride = options.runtimeOverride === true;

  return {
    id: normalizeStatusEntryId(options.id) ?? createStatusEntryId(),
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
    sourceSpellId: options.sourceSpellId,
    sourceSpellSlotLevel: normalizeStatusSourceSpellSlotLevel(options.sourceSpellSlotLevel),
    sourceSpellTarget: normalizeStatusSourceSpellTarget(options.sourceSpellTarget),
    sourceSpellSkill: normalizeStatusSourceSpellSkill(options.sourceSpellSkill),
    rangeFeet: options.rangeFeet ?? null,
    description: options.description?.trim() || undefined,
    descriptionAdditions: descriptionAdditions.length > 0 ? descriptionAdditions : undefined,
    customEffects: Array.isArray(options.customEffects)
      ? normalizeCharacterCustomTraitEffects(options.customEffects)
      : undefined,
    notes,
    runtimeOverride: runtimeOverride ? true : undefined,
    runtimeOverrideKey: runtimeOverride
      ? normalizeRuntimeOverrideKey(options.runtimeOverrideKey)
      : undefined
  };
}

function getStatusEntryOverrideKey(
  entry: Pick<
    CharacterStatusEntry,
    | "conditionLevel"
    | "group"
    | "id"
    | "rangeFeet"
    | "sourceId"
    | "sourceSpellId"
    | "sourceSpellSkill"
    | "sourceSpellSlotLevel"
    | "sourceSpellTarget"
    | "sourceType"
    | "runtimeOverride"
    | "runtimeOverrideKey"
    | "value"
  >
): string {
  const runtimeOverrideKey =
    entry.runtimeOverride === true ? normalizeRuntimeOverrideKey(entry.runtimeOverrideKey) : null;

  if (runtimeOverrideKey) {
    return runtimeOverrideKey;
  }

  return JSON.stringify([
    entry.sourceType,
    normalizeStatusEntryId(entry.sourceId) ?? entry.id,
    entry.group,
    String(entry.value),
    isExhaustionStatusEntry(entry) ? (normalizeExhaustionLevel(entry.conditionLevel) ?? "") : "",
    entry.sourceSpellId ?? "",
    entry.sourceSpellSlotLevel ?? "",
    entry.sourceSpellTarget ?? "",
    entry.sourceSpellSkill ?? "",
    entry.rangeFeet ?? ""
  ]);
}

function setStatusEntryNotes(
  entry: CharacterStatusEntry,
  notes: string | undefined
): CharacterStatusEntry {
  if (notes) {
    return {
      ...entry,
      notes
    };
  }

  const { notes: _notes, ...entryWithoutNotes } = entry;
  return entryWithoutNotes;
}

export function resolveCharacterStatusEntries(
  manualEntries: unknown,
  derivedEntries: CharacterStatusEntry[] = []
): CharacterStatusEntry[] {
  const normalizedEntries = normalizeCharacterStatusEntries(manualEntries);
  const derivedEntryOverrideKeys = new Set(derivedEntries.map(getStatusEntryOverrideKey));
  const derivedEntryIds = new Set(derivedEntries.map((entry) => entry.id));
  const overrideEntries = normalizedEntries.filter(
    (entry) =>
      entry.runtimeOverride === true ||
      (entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
        typeof entry.sourceId === "string" &&
        entry.sourceId.length > 0)
  );
  const standaloneEntries = normalizedEntries.filter(
    (entry) =>
      entry.runtimeOverride !== true &&
      (entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL ||
        typeof entry.sourceId !== "string" ||
        entry.sourceId.length === 0)
  );
  const nonRuntimeOverrideEntries = overrideEntries.filter((entry) => entry.runtimeOverride !== true);
  const durationOverrideEntriesByKey = new Map<string, CharacterStatusEntry>();
  const noteOverrideEntriesByKey = new Map<string, CharacterStatusEntry>();
  const runtimeNoteOverridesById = new Map<string, CharacterStatusEntry>();
  const runtimeNoteOverridesByKey = new Map<string, CharacterStatusEntry>();

  nonRuntimeOverrideEntries.forEach((entry) => {
    const overrideKey = getStatusEntryOverrideKey(entry);

    durationOverrideEntriesByKey.set(overrideKey, entry);

    if (entry.notes) {
      noteOverrideEntriesByKey.set(overrideKey, entry);
    }
  });

  overrideEntries.forEach((entry) => {
    if (entry.runtimeOverride === true && entry.notes) {
      const overrideKey = getStatusEntryOverrideKey(entry);

      if (derivedEntryOverrideKeys.has(overrideKey)) {
        runtimeNoteOverridesByKey.set(overrideKey, entry);
      }

      if (derivedEntryIds.has(entry.id)) {
        runtimeNoteOverridesById.set(entry.id, entry);
      }
    }
  });

  const persistedFeatureEntries = nonRuntimeOverrideEntries.filter(
    (entry) => !derivedEntryOverrideKeys.has(getStatusEntryOverrideKey(entry))
  );

  return pruneLinkedStatusEntries([
    ...standaloneEntries,
    ...persistedFeatureEntries,
    ...derivedEntries.map((entry) => {
      const overrideKey = getStatusEntryOverrideKey(entry);
      const durationOverride = durationOverrideEntriesByKey.get(overrideKey);
      const noteOverride =
        runtimeNoteOverridesByKey.get(overrideKey) ??
        runtimeNoteOverridesById.get(entry.id) ??
        noteOverrideEntriesByKey.get(overrideKey);
      const entryWithDuration =
        durationOverride && entry.duration.kind !== STATUS_DURATION_KIND.LINKED
          ? {
              ...entry,
              duration: durationOverride.duration
            }
          : entry;

      return noteOverride?.notes
        ? {
            ...entryWithDuration,
            notes: noteOverride.notes
          }
        : entryWithDuration;
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

export function removeInvisibleConditionFromStatusEntries(value: unknown): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const nextEntries = entries.filter((entry) => !isInvisibleStatusEntry(entry));

  return nextEntries.length === entries.length ? entries : pruneLinkedStatusEntries(nextEntries);
}

export function removeInvisibleConditionFromCharacter(character: Character): Character {
  const entries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextEntries = entries.filter((entry) => !isInvisibleStatusEntry(entry));

  if (nextEntries.length === entries.length) {
    return character;
  }

  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(nextEntries)
  };
}

export function removeCharacterConditionsForImmunities(
  value: unknown,
  immunityEntries: ReadonlyArray<Pick<CharacterStatusEntry, "group" | "value">>
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const immuneConditions = getImmuneConditionSet([...entries, ...immunityEntries]);

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
            sourceId: nextEntry.sourceId,
            sourceSpellId: nextEntry.sourceSpellId,
            sourceSpellSlotLevel: normalizeStatusSourceSpellSlotLevel(
              nextEntry.sourceSpellSlotLevel
            ),
            sourceSpellTarget: normalizeStatusSourceSpellTarget(nextEntry.sourceSpellTarget),
            sourceSpellSkill: normalizeStatusSourceSpellSkill(nextEntry.sourceSpellSkill),
            rangeFeet: nextEntry.rangeFeet ?? null,
            description: nextEntry.description?.trim() || undefined,
            customEffects: Array.isArray(nextEntry.customEffects)
              ? normalizeCharacterCustomTraitEffects(nextEntry.customEffects)
              : undefined
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
  const storedEntry = entries.find(
    (entry) => entry.id === entryToUpdate.id && entry.runtimeOverride !== true
  );

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

  const entryOverrideKey = getStatusEntryOverrideKey(entryToUpdate);
  const existingDurationOverride = entries.find(
    (entry) =>
      entry.runtimeOverride !== true &&
      entry.sourceType === entryToUpdate.sourceType &&
      getStatusEntryOverrideKey(entry) === entryOverrideKey
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
      id: entryToUpdate.id,
      group: entryToUpdate.group,
      value: entryToUpdate.value,
      conditionLevel: entryToUpdate.conditionLevel,
      source: entryToUpdate.source,
      sourceType: entryToUpdate.sourceType,
      duration,
      sourceId: entryToUpdate.sourceId ?? entryToUpdate.id,
      sourceSpellId: entryToUpdate.sourceSpellId,
      sourceSpellSlotLevel: entryToUpdate.sourceSpellSlotLevel ?? null,
      sourceSpellTarget: entryToUpdate.sourceSpellTarget ?? null,
      sourceSpellSkill: entryToUpdate.sourceSpellSkill ?? null,
      rangeFeet: entryToUpdate.rangeFeet ?? null,
      notes: entryToUpdate.notes
    })
  ]);
}

export function updateCharacterStatusEntryNotes(
  value: unknown,
  entryToUpdate: CharacterStatusEntry,
  nextNotes: string
): CharacterStatusEntry[] {
  const notes = normalizeStatusNotes(nextNotes);
  const entries = normalizeCharacterStatusEntries(value);
  const entryOverrideKey = getStatusEntryOverrideKey(entryToUpdate);
  const isMatchingRuntimeOverride = (entry: CharacterStatusEntry) =>
    entry.runtimeOverride === true &&
    (entry.id === entryToUpdate.id || getStatusEntryOverrideKey(entry) === entryOverrideKey);
  const storedEntry = entries.find(
    (entry) => entry.id === entryToUpdate.id && entry.runtimeOverride !== true
  );

  if (storedEntry) {
    return entries.flatMap((entry) => {
      if (isMatchingRuntimeOverride(entry)) {
        return [];
      }

      return entry.id === storedEntry.id ? [setStatusEntryNotes(entry, notes)] : [entry];
    });
  }

  const runtimeOverride = entries.find(isMatchingRuntimeOverride);

  if (runtimeOverride) {
    if (!notes) {
      return entries.filter(
        (entry) => !(entry.runtimeOverride === true && entry.id === runtimeOverride.id)
      );
    }

    return entries.map((entry) =>
      entry.runtimeOverride === true && entry.id === runtimeOverride.id
        ? setStatusEntryNotes(entry, notes)
        : entry
    );
  }

  const persistedOverride = entries.find(
    (entry) =>
      entry.runtimeOverride !== true &&
      entry.sourceType === entryToUpdate.sourceType &&
      getStatusEntryOverrideKey(entry) === entryOverrideKey
  );

  if (persistedOverride) {
    return entries.flatMap((entry) => {
      if (isMatchingRuntimeOverride(entry)) {
        return [];
      }

      return entry.id === persistedOverride.id ? [setStatusEntryNotes(entry, notes)] : [entry];
    });
  }

  if (!notes) {
    return entries;
  }

  return [
    ...entries,
    createCharacterStatusEntry({
      id: `status-notes-${entryToUpdate.id}`,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: `Status notes override: ${entryToUpdate.id}`,
      source: entryToUpdate.source || "Status Notes",
      sourceType: entryToUpdate.sourceType,
      duration: { kind: STATUS_DURATION_KIND.INFINITE },
      sourceId: entryToUpdate.sourceId ?? entryToUpdate.id,
      sourceSpellId: entryToUpdate.sourceSpellId,
      sourceSpellSlotLevel: entryToUpdate.sourceSpellSlotLevel ?? null,
      sourceSpellTarget: entryToUpdate.sourceSpellTarget ?? null,
      sourceSpellSkill: entryToUpdate.sourceSpellSkill ?? null,
      rangeFeet: entryToUpdate.rangeFeet ?? null,
      runtimeOverride: true,
      runtimeOverrideKey: entryOverrideKey,
      notes
    })
  ];
}

export function applySpellConcentrationToStatusEntries(
  value: unknown,
  spell: { id?: string; name: string; duration: SpellDurationPart[] },
  options?: {
    sourceId?: string;
    sourceSpellSlotLevel?: number | null;
    sourceSpellTarget?: CharacterStatusSpellTarget | null;
    sourceSpellSkill?: SkillName | null;
  }
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
      duration: concentrationDuration,
      sourceId: options?.sourceId,
      sourceSpellId: spell.id,
      sourceSpellSlotLevel: options?.sourceSpellSlotLevel ?? null,
      sourceSpellTarget: options?.sourceSpellTarget ?? null,
      sourceSpellSkill: options?.sourceSpellSkill ?? null
    })
  ]);
}

function isGenericSpellDurationStatusEntry(
  entry: CharacterStatusEntry,
  spell: Pick<SpellStatusEntrySource, "id" | "name">
): boolean {
  const genericSourceId = getSpellDurationStatusSourceId(spell);

  if (genericSourceId) {
    return entry.sourceId === genericSourceId;
  }

  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.value === spell.name &&
    entry.source === spell.name &&
    entry.sourceSpellId === spell.id
  );
}

function hasSpecificSpellEffectStatusEntry(
  entries: CharacterStatusEntry[],
  spell: Pick<SpellStatusEntrySource, "id">,
  genericSourceId: string | undefined
): boolean {
  if (!spell.id) {
    return false;
  }

  return entries.some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceSpellId === spell.id &&
      entry.sourceId !== genericSourceId &&
      entry.value !== EFFECT_NAME.CONCENTRATION
  );
}

function getSpellStatusDescription(
  spell: Pick<SpellStatusEntrySource, "description">
): string | undefined {
  if (!Array.isArray(spell.description)) {
    return undefined;
  }

  const descriptionLines = spell.description
    .flatMap((entry) => (typeof entry === "string" ? [entry] : entry.items))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return descriptionLines.length > 0 ? descriptionLines.join("\n") : undefined;
}

export function applySpellDurationToStatusEntries(
  value: unknown,
  spell: SpellStatusEntrySource,
  options?: {
    sourceId?: string;
    sourceSpellSlotLevel?: number | null;
    sourceSpellTarget?: CharacterStatusSpellTarget | null;
    sourceSpellSkill?: SkillName | null;
  }
): CharacterStatusEntry[] {
  const concentrationDuration = getSpellConcentrationDuration(spell.duration);

  if (concentrationDuration) {
    return applySpellConcentrationToStatusEntries(value, spell, options);
  }

  const duration = getSpellNonConcentrationDuration(spell.duration);
  const entries = normalizeCharacterStatusEntries(value);
  const genericSourceId = getSpellDurationStatusSourceId(spell);

  if (!duration) {
    return entries;
  }

  const entriesWithoutGenericDuration = entries.filter(
    (entry) => !isGenericSpellDurationStatusEntry(entry, spell)
  );

  if (hasSpecificSpellEffectStatusEntry(entries, spell, genericSourceId)) {
    return pruneLinkedStatusEntries(entriesWithoutGenericDuration);
  }

  return ensureLinkedStatusDependencies([
    ...entriesWithoutGenericDuration,
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: spell.name,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration,
      sourceId: genericSourceId,
      sourceSpellId: spell.id,
      sourceSpellSlotLevel: options?.sourceSpellSlotLevel ?? null,
      sourceSpellTarget: options?.sourceSpellTarget ?? null,
      sourceSpellSkill: options?.sourceSpellSkill ?? null,
      description: getSpellStatusDescription(spell)
    })
  ]);
}

export function applyCustomSpellDurationToStatusEntries(
  value: unknown,
  spell: SpellStatusEntrySource,
  customEffects: CharacterCustomTraitEffect[] | undefined,
  options?: {
    sourceId?: string;
    sourceSpellSlotLevel?: number | null;
    sourceSpellTarget?: CharacterStatusSpellTarget | null;
    sourceSpellSkill?: SkillName | null;
  }
): CharacterStatusEntry[] {
  const normalizedCustomEffects = normalizeCharacterCustomTraitEffects(customEffects);

  if (normalizedCustomEffects.length === 0) {
    return applySpellDurationToStatusEntries(value, spell, options);
  }

  const customSourceId = getCustomSpellEffectStatusSourceId(spell);
  const createCustomEffectStatusEntry = (duration: CharacterStatusDuration) =>
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: spell.name,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration,
      sourceId: customSourceId,
      sourceSpellId: spell.id,
      sourceSpellSlotLevel: options?.sourceSpellSlotLevel ?? null,
      sourceSpellTarget: options?.sourceSpellTarget ?? null,
      sourceSpellSkill: options?.sourceSpellSkill ?? null,
      description: getSpellStatusDescription(spell),
      customEffects: normalizedCustomEffects
    });

  if (getSpellConcentrationDuration(spell.duration)) {
    const entriesWithConcentration = applySpellConcentrationToStatusEntries(value, spell, options);

    return ensureLinkedStatusDependencies([
      ...entriesWithConcentration.filter((entry) => entry.sourceId !== customSourceId),
      createCustomEffectStatusEntry({
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      })
    ]);
  }

  const duration = getSpellNonConcentrationDuration(spell.duration);
  const entries = normalizeCharacterStatusEntries(value);

  if (!duration) {
    return entries;
  }

  return ensureLinkedStatusDependencies([
    ...entries.filter(
      (entry) =>
        entry.sourceId !== customSourceId && !isGenericSpellDurationStatusEntry(entry, spell)
    ),
    createCustomEffectStatusEntry(duration)
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

export function getExhaustionLevel(value: unknown): number | null {
  const exhaustionEntry = getExhaustionStatusEntry(value);

  if (!exhaustionEntry) {
    return null;
  }

  return normalizeExhaustionLevel(exhaustionEntry.conditionLevel) ?? 1;
}

export function getExhaustionD20TestPenalty(value: unknown): number {
  return -2 * (getExhaustionLevel(value) ?? 0);
}

export function setCharacterExhaustionLevel(
  value: unknown,
  nextLevel: number | null
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
              conditionLevel: normalizeExhaustionLevel(nextLevel) ?? 1,
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
      conditionLevel: normalizeExhaustionLevel(nextLevel) ?? 1,
      source: "Manual",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: { kind: STATUS_DURATION_KIND.INFINITE }
    })
  ]);
}

export function advanceCharacterStatusEntries(
  value: unknown,
  tickOn: STATUS_DURATION_ROUND_TICK = STATUS_DURATION_ROUND_TICK.ROUND_START
): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).flatMap((entry) => {
      if (entry.duration.kind !== STATUS_DURATION_KIND.ROUNDS) {
        return [entry];
      }

      if (normalizeStatusDurationRoundTick(entry.duration.tickOn) !== tickOn) {
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
            amount: nextAmount,
            tickOn: normalizeStatusDurationRoundTick(entry.duration.tickOn)
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
        case STATUS_DURATION_KIND.LONG_REST:
          return true;
        case STATUS_DURATION_KIND.HOURS:
        case STATUS_DURATION_KIND.DAYS:
          return entry.duration.amount >= 1;
        case STATUS_DURATION_KIND.SHORT_REST:
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
          entry.duration.kind === STATUS_DURATION_KIND.LINKED ||
          entry.duration.kind === STATUS_DURATION_KIND.DAYS) &&
        (entry.group !== STATUS_ENTRY_GROUP.EFFECTS || entry.value !== EFFECT_NAME.CONCENTRATION)
    )
  );
}
