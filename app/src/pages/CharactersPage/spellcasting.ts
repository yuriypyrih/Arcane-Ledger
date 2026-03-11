import {
  ENTRY_CATEGORIES,
  SPELL_TYPES,
  hardcodedCodexEntries,
  type SpellEntry
} from "../../codex/entries";
import type { Character } from "../../types";

export type SpellcastingProgression = "none" | "full" | "half" | "pact";

const spellSlotLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const spellcastingProgressionByClass: Record<string, SpellcastingProgression> = {
  Artificer: "half",
  Barbarian: "none",
  Bard: "full",
  Cleric: "full",
  Druid: "full",
  Fighter: "none",
  Monk: "none",
  Paladin: "half",
  Ranger: "half",
  Rogue: "none",
  Sorcerer: "full",
  Warlock: "pact",
  Wizard: "full"
};

function createSpellSlotRow(...slots: number[]): number[] {
  return spellSlotLevels.map((_, index) => Math.max(0, Math.floor(slots[index] ?? 0)));
}

const emptySpellSlotRow = createSpellSlotRow();

const fullCasterSpellSlotsByLevel: number[][] = [
  emptySpellSlotRow,
  createSpellSlotRow(2),
  createSpellSlotRow(3),
  createSpellSlotRow(4, 2),
  createSpellSlotRow(4, 3),
  createSpellSlotRow(4, 3, 2),
  createSpellSlotRow(4, 3, 3),
  createSpellSlotRow(4, 3, 3, 1),
  createSpellSlotRow(4, 3, 3, 2),
  createSpellSlotRow(4, 3, 3, 3, 1),
  createSpellSlotRow(4, 3, 3, 3, 2),
  createSpellSlotRow(4, 3, 3, 3, 2, 1),
  createSpellSlotRow(4, 3, 3, 3, 2, 1),
  createSpellSlotRow(4, 3, 3, 3, 2, 1, 1),
  createSpellSlotRow(4, 3, 3, 3, 2, 1, 1),
  createSpellSlotRow(4, 3, 3, 3, 2, 1, 1, 1),
  createSpellSlotRow(4, 3, 3, 3, 2, 1, 1, 1),
  createSpellSlotRow(4, 3, 3, 3, 2, 1, 1, 1, 1),
  createSpellSlotRow(4, 3, 3, 3, 3, 1, 1, 1, 1),
  createSpellSlotRow(4, 3, 3, 3, 3, 2, 1, 1, 1),
  createSpellSlotRow(4, 3, 3, 3, 3, 2, 2, 1, 1)
];

const halfCasterSpellSlotsByLevel: number[][] = [
  emptySpellSlotRow,
  createSpellSlotRow(2),
  createSpellSlotRow(2),
  createSpellSlotRow(3),
  createSpellSlotRow(3),
  createSpellSlotRow(4, 2),
  createSpellSlotRow(4, 2),
  createSpellSlotRow(4, 3),
  createSpellSlotRow(4, 3),
  createSpellSlotRow(4, 3, 2),
  createSpellSlotRow(4, 3, 2),
  createSpellSlotRow(4, 3, 3),
  createSpellSlotRow(4, 3, 3),
  createSpellSlotRow(4, 3, 3, 1),
  createSpellSlotRow(4, 3, 3, 1),
  createSpellSlotRow(4, 3, 3, 2),
  createSpellSlotRow(4, 3, 3, 2),
  createSpellSlotRow(4, 3, 3, 3, 1),
  createSpellSlotRow(4, 3, 3, 3, 1),
  createSpellSlotRow(4, 3, 3, 3, 2),
  createSpellSlotRow(4, 3, 3, 3, 2)
];

const pactCasterSpellSlotsByLevel: number[][] = [
  emptySpellSlotRow,
  createSpellSlotRow(1),
  createSpellSlotRow(2),
  createSpellSlotRow(0, 2),
  createSpellSlotRow(0, 2),
  createSpellSlotRow(0, 0, 2),
  createSpellSlotRow(0, 0, 2),
  createSpellSlotRow(0, 0, 0, 2),
  createSpellSlotRow(0, 0, 0, 2),
  createSpellSlotRow(0, 0, 0, 0, 2),
  createSpellSlotRow(0, 0, 0, 0, 2),
  createSpellSlotRow(0, 0, 0, 0, 3),
  createSpellSlotRow(0, 0, 0, 0, 3),
  createSpellSlotRow(0, 0, 0, 0, 3),
  createSpellSlotRow(0, 0, 0, 0, 3),
  createSpellSlotRow(0, 0, 0, 0, 3),
  createSpellSlotRow(0, 0, 0, 0, 3),
  createSpellSlotRow(0, 0, 0, 0, 4),
  createSpellSlotRow(0, 0, 0, 0, 4),
  createSpellSlotRow(0, 0, 0, 0, 4),
  createSpellSlotRow(0, 0, 0, 0, 4)
];

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

function clampCharacterLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function getSpellSlotTableForClass(className: string): number[][] {
  const progression = getSpellcastingProgressionForClass(className);

  if (progression === "full") {
    return fullCasterSpellSlotsByLevel;
  }

  if (progression === "half") {
    return halfCasterSpellSlotsByLevel;
  }

  if (progression === "pact") {
    return pactCasterSpellSlotsByLevel;
  }

  return [emptySpellSlotRow];
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

function getHighestSlotLevel(slotTotals: number[]): number {
  for (let index = slotTotals.length - 1; index >= 0; index -= 1) {
    if (slotTotals[index] > 0) {
      return index + 1;
    }
  }

  return 0;
}

export function getSpellcastingProgressionForClass(className: string): SpellcastingProgression {
  return spellcastingProgressionByClass[className] ?? "none";
}

export function isSpellcastingClass(className: string): boolean {
  return getSpellcastingProgressionForClass(className) !== "none";
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
  const slotTable = getSpellSlotTableForClass(className);
  const normalizedLevel = clampCharacterLevel(level);
  const row = slotTable[normalizedLevel] ?? emptySpellSlotRow;

  return [...row];
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

export function getKnownSpellsForCharacter(
  character: Pick<Character, "className" | "level" | "knownSpellIds">
): SpellEntry[] {
  if (!isSpellcastingClass(character.className)) {
    return [];
  }

  const slotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const highestSlotLevel = getHighestSlotLevel(slotTotals);
  const availableSpells = codexSpellEntries.filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel === 0 || spellLevel <= highestSlotLevel;
  });

  const knownSpellIds = Array.isArray(character.knownSpellIds)
    ? dedupeSpellIds(character.knownSpellIds.filter((value): value is string => typeof value === "string"))
    : [];

  if (knownSpellIds.length === 0) {
    return availableSpells;
  }

  const availableById = new Map(availableSpells.map((spell) => [spell.id, spell]));

  const resolvedKnownSpells = knownSpellIds
    .map((spellId) => availableById.get(spellId))
    .filter((spell): spell is SpellEntry => spell !== undefined);

  return resolvedKnownSpells.length > 0 ? resolvedKnownSpells : availableSpells;
}
