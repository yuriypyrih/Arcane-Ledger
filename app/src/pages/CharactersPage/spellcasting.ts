import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  SPELL_TYPES,
  hardcodedCodexEntries,
  type ClassEntry,
  type FeatureClassObj,
  type SpellEntry
} from "../../codex/entries";
import type { Character } from "../../types";

const spellSlotLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function createSpellSlotRow(...slots: number[]): number[] {
  return spellSlotLevels.map((_, index) => Math.max(0, Math.floor(slots[index] ?? 0)));
}

const emptySpellSlotRow = createSpellSlotRow();

const codexSpellEntries = hardcodedCodexEntries
  .filter((entry): entry is SpellEntry => entry.category === ENTRY_CATEGORIES.SPELLS)
  .sort((left, right) => {
    const leftLevel = getSpellLevel(left);
    const rightLevel = getSpellLevel(right);

    if (leftLevel !== rightLevel) {
      return leftLevel - rightLevel;
    }

    return left.name.localeCompare(right.name);
  });

const codexClassEntries = hardcodedCodexEntries.filter(
  (entry): entry is ClassEntry => entry.category === ENTRY_CATEGORIES.CLASSES
);

type SpellcastingFeatureClassObj = FeatureClassObj & {
  preparedSpells?: number;
  spellSlots?: number[];
};

const spellcastingClassFeatures = new Set<CLASS_FEATURE>([
  CLASS_FEATURE.SPELLCASTING,
  CLASS_FEATURE.PACT_MAGIC
]);

function clampCharacterLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function sanitizeSpellLevel(value: unknown): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 1;
  }

  return Math.max(0, Math.min(9, Math.floor(numericValue)));
}

function dedupeSpellIds(spellIds: string[]): string[] {
  return [...new Set(spellIds)];
}

function getClassEntry(className: string): ClassEntry | undefined {
  return codexClassEntries.find((entry) => entry.name === className);
}

function getClassFeatureRowsUpToLevel(
  className: string,
  level: number
): SpellcastingFeatureClassObj[] {
  const normalizedLevel = clampCharacterLevel(level);
  const classEntry = getClassEntry(className);

  if (!classEntry) {
    return [];
  }

  return classEntry.features
    .filter(
      (featureRow): featureRow is SpellcastingFeatureClassObj => featureRow.level <= normalizedLevel
    )
    .sort((left, right) => left.level - right.level);
}

function getClassFeatureRowForLevel(
  className: string,
  level: number
): SpellcastingFeatureClassObj | undefined {
  const featureRows = getClassFeatureRowsUpToLevel(className, level);

  return featureRows[featureRows.length - 1];
}

function getHighestSlotLevel(slotTotals: number[]): number {
  for (let index = slotTotals.length - 1; index >= 0; index -= 1) {
    if (slotTotals[index] > 0) {
      return index + 1;
    }
  }

  return 0;
}

function getAvailableSpellEntriesForCharacter(className: string, level: number): SpellEntry[] {
  if (!isSpellcastingClass(className, level)) {
    return [];
  }

  const slotTotals = getSpellSlotTotalsForCharacter(className, level);
  const highestSlotLevel = getHighestSlotLevel(slotTotals);

  return codexSpellEntries.filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel === 0 || spellLevel <= highestSlotLevel;
  });
}

export function isSpellcastingClass(className: string, level = 20): boolean {
  return getClassFeatureRowsUpToLevel(className, level).some((featureRow) =>
    featureRow.classFeatures.some((classFeature) => spellcastingClassFeatures.has(classFeature))
  );
}

export function getSpellLevel(spell: Pick<SpellEntry, "spellLevel" | "tags">): number {
  if (spell.tags.includes(SPELL_TYPES.CANTRIP)) {
    return 0;
  }

  if (spell.spellLevel === undefined) {
    return 1;
  }

  return sanitizeSpellLevel(spell.spellLevel);
}

export function getSpellSlotTotalsForCharacter(className: string, level: number): number[] {
  const featureRow = getClassFeatureRowForLevel(className, level);

  if (!Array.isArray(featureRow?.spellSlots)) {
    return [...emptySpellSlotRow];
  }

  return createSpellSlotRow(...featureRow.spellSlots);
}

export function normalizeSpellSlotsExpended(
  spellSlotsExpended: unknown,
  spellSlotTotals: number[]
): number[] {
  const rawValues = Array.isArray(spellSlotsExpended) ? spellSlotsExpended : [];

  return spellSlotLevels.map((_, index) => {
    const parsedValue = Number(rawValues[index]);
    const safeValue = Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;

    return Math.min(spellSlotTotals[index] ?? 0, safeValue);
  });
}

export function getAllSpellEntries(): SpellEntry[] {
  return [...codexSpellEntries];
}

export function getPreparedSpellLimitForCharacter(className: string, level: number): number | null {
  const preparedSpells = getClassFeatureRowForLevel(className, level)?.preparedSpells;

  return typeof preparedSpells === "number" ? Math.max(0, Math.floor(preparedSpells)) : null;
}

export function usesPreparedSpellsForCharacter(className: string, level: number): boolean {
  return getPreparedSpellLimitForCharacter(className, level) !== null;
}

export function getSpellPreparationOptionsForCharacter(
  className: string,
  level: number
): SpellEntry[] {
  return getAvailableSpellEntriesForCharacter(className, level).filter(
    (spell) => getSpellLevel(spell) > 0
  );
}

export function getPreparedSpellsForCharacter(
  character: Pick<Character, "className" | "level" | "preparedSpellIds">
): SpellEntry[] {
  if (!isSpellcastingClass(character.className, character.level)) {
    return [];
  }

  const availableSpells = getAvailableSpellEntriesForCharacter(
    character.className,
    character.level
  );
  const availableById = new Map(availableSpells.map((spell) => [spell.id, spell]));
  const cantrips = availableSpells.filter((spell) => getSpellLevel(spell) === 0);
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    character.className,
    character.level
  );

  if (!usesPreparedSpellsForCharacter(character.className, character.level)) {
    return availableSpells;
  }

  const preparedSpellIds = Array.isArray(character.preparedSpellIds)
    ? dedupeSpellIds(
        character.preparedSpellIds.filter((value): value is string => typeof value === "string")
      )
    : [];

  const resolvedPreparedSpells = preparedSpellIds
    .map((spellId) => availableById.get(spellId))
    .filter((spell): spell is SpellEntry => spell !== undefined && getSpellLevel(spell) > 0)
    .slice(0, preparedSpellLimit ?? Number.POSITIVE_INFINITY);

  return [...cantrips, ...resolvedPreparedSpells];
}
