import type { SpellDescriptionEntry, SpellDurationPart } from "../../codex/entries";
import { DAMAGE_TYPE, DURATION } from "../../codex/entries";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterCustomTraitEffect,
  type CharacterStatusDuration,
  type CharacterStatusEntry,
  type CharacterStatusValue
} from "../../types";
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

function createStatusEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `status-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
    sourceSpellId:
      typeof record.sourceSpellId === "string" && record.sourceSpellId.trim().length > 0
        ? record.sourceSpellId.trim()
        : undefined,
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
  rangeFeet?: number | null;
  description?: string;
  descriptionAdditions?: SpellDescriptionEntry[][];
  customEffects?: CharacterCustomTraitEffect[];
}): CharacterStatusEntry {
  const descriptionAdditions = normalizeStatusDescriptionAdditions(options.descriptionAdditions);

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
    sourceSpellId: options.sourceSpellId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description?.trim() || undefined,
    descriptionAdditions: descriptionAdditions.length > 0 ? descriptionAdditions : undefined,
    customEffects: Array.isArray(options.customEffects)
      ? normalizeCharacterCustomTraitEffects(options.customEffects)
      : undefined
  };
}

export function resolveCharacterStatusEntries(
  manualEntries: unknown,
  derivedEntries: CharacterStatusEntry[] = []
): CharacterStatusEntry[] {
  const normalizedEntries = normalizeCharacterStatusEntries(manualEntries);
  const derivedEntrySourceIds = new Set(
    derivedEntries
      .map((entry) => entry.sourceId)
      .filter((sourceId): sourceId is string => typeof sourceId === "string" && sourceId.length > 0)
  );
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

  const persistedFeatureEntries = overrideEntries.filter(
    (entry) => entry.sourceId && !derivedEntrySourceIds.has(entry.sourceId)
  );

  return pruneLinkedStatusEntries([
    ...standaloneEntries,
    ...persistedFeatureEntries,
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
  spell: { id?: string; name: string; duration: SpellDurationPart[] },
  options?: {
    sourceId?: string;
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
      sourceSpellId: spell.id
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
