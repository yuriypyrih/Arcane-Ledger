import type { CustomSpellRecord } from "../../api/customSpells";
import {
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS,
  TRACKER
} from "../../codex/entries/enums";
import type {
  SpellEntry,
  SpellDescriptionEntry
} from "../../codex/entries/types";
import {
  getClassSpellListClassesForCharacter,
  getPreparedSpellListClassesForCharacter
} from "../../codex/classes/subclassSpellcasting";
import type {
  Character,
  CharacterCustomSpellSnapshot
} from "../../types";
import { normalizeCharacterCustomTraitEffects } from "./customTraitEffects";
import {
  getCantripLimitForCharacter,
  getSpellLevel,
  isSpellcastingClass,
  usesFlexibleSpellcastingRulesForCharacter,
  usesPreparedSpellsForCharacter
} from "./spellcasting";
import { getSpellSlotTotalsForCharacter } from "./spellSlots";

export const CUSTOM_SPELL_ID_PREFIX = "custom-spell:";

type CharacterSpellRulesInput = Pick<
  Character,
  "classFeatureState" | "className" | "classRules" | "customClass" | "level" | "subclassId"
>;

const validMagicSchools = new Set(Object.values(MAGIC_SCHOOL));
const validSpellComponents = new Set(Object.values(SPELL_COMPONENT));
const validSpellLists = new Set(Object.values(SPELL_LIST_CLASS));

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map(normalizeString)
        .filter(Boolean)
        .filter((entry, index, entries) => entries.indexOf(entry) === index)
    : [];
}

function normalizeSpellDescription(value: unknown): SpellDescriptionEntry[] {
  return Array.isArray(value)
    ? value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    : [];
}

function normalizeSpellLevel(value: unknown): number {
  const spellLevel = Math.floor(Number(value));

  return Number.isFinite(spellLevel) ? Math.max(0, Math.min(9, spellLevel)) : 0;
}

function getHighestSlotLevel(slotTotals: number[]): number {
  for (let index = slotTotals.length - 1; index >= 0; index -= 1) {
    if ((slotTotals[index] ?? 0) > 0) {
      return index + 1;
    }
  }

  return 0;
}

function compareSpellsByLevelThenName(left: SpellEntry, right: SpellEntry) {
  const levelDifference = getSpellLevel(left) - getSpellLevel(right);

  if (levelDifference !== 0) {
    return levelDifference;
  }

  return left.name.localeCompare(right.name);
}

function hasMatchingSpellList(spell: Pick<SpellEntry, "spellLists">, spellLists: SPELL_LIST_CLASS[]) {
  return spell.spellLists.some((spellList) => spellLists.includes(spellList));
}

function normalizeCustomSpellEntry(value: unknown, customSpellId: string): SpellEntry | null {
  if (!isObjectRecord(value) || !customSpellId) {
    return null;
  }

  const name = normalizeString(value.name);

  if (!name) {
    return null;
  }

  const magicSchool = validMagicSchools.has(value.magicSchool as MAGIC_SCHOOL)
    ? (value.magicSchool as MAGIC_SCHOOL)
    : MAGIC_SCHOOL.EVOCATION;
  const components = normalizeStringArray(value.components).filter((component) =>
    validSpellComponents.has(component as SPELL_COMPONENT)
  ) as SPELL_COMPONENT[];
  const spellLists = normalizeStringArray(value.spellLists).filter((spellList) =>
    validSpellLists.has(spellList as SPELL_LIST_CLASS)
  ) as SPELL_LIST_CLASS[];

  return {
    id: createCustomSpellEntryId(customSpellId),
    name,
    category: ENTRY_CATEGORIES.SPELLS,
    source: {
      documentKey: "custom-spells",
      documentName: "Custom Spells",
      ruleset: "third-party"
    },
    magicSchool,
    castingTime: normalizeStringArray(value.castingTime),
    range: normalizeString(value.range) || "Self",
    components,
    materialSpecified: normalizeString(value.materialSpecified) || undefined,
    duration: normalizeStringArray(value.duration),
    description: normalizeSpellDescription(value.description),
    trackingState:
      value.trackingState === TRACKER.SEMI_TRACKED ? TRACKER.SEMI_TRACKED : TRACKER.NOT_TRACKED,
    damage: [],
    healing: [],
    spellLists,
    spellLevel: normalizeSpellLevel(value.spellLevel),
    ritual: Boolean(value.ritual)
  };
}

export function createCustomSpellEntryId(customSpellId: string) {
  return `${CUSTOM_SPELL_ID_PREFIX}${customSpellId}`;
}

export function getCustomSpellDocumentIdFromEntryId(spellId: string) {
  return spellId.startsWith(CUSTOM_SPELL_ID_PREFIX)
    ? spellId.slice(CUSTOM_SPELL_ID_PREFIX.length)
    : null;
}

export function isCustomSpellEntryId(spellId: string) {
  return getCustomSpellDocumentIdFromEntryId(spellId) !== null;
}

export function createCharacterCustomSpellSnapshotFromRecord(
  record: CustomSpellRecord,
  bakedAt = new Date().toISOString()
): CharacterCustomSpellSnapshot {
  return {
    bakedAt,
    customEffects: normalizeCharacterCustomTraitEffects(record.customEffects),
    customSpellId: record.id,
    sourceUpdatedAt: record.updatedAt,
    spell: {
      ...record.spell,
      id: createCustomSpellEntryId(record.id),
      damage: [],
      healing: []
    }
  };
}

export function normalizeCharacterCustomSpellSnapshots(
  value: unknown
): CharacterCustomSpellSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const snapshots: CharacterCustomSpellSnapshot[] = [];
  const seenSpellIds = new Set<string>();

  for (const entry of value) {
    if (!isObjectRecord(entry)) {
      continue;
    }

    const rawCustomSpellId =
      normalizeString(entry.customSpellId) ||
      getCustomSpellDocumentIdFromEntryId(normalizeString((entry.spell as Record<string, unknown>)?.id)) ||
      "";
    const spell = normalizeCustomSpellEntry(entry.spell, rawCustomSpellId);

    if (!spell || seenSpellIds.has(spell.id)) {
      continue;
    }

    seenSpellIds.add(spell.id);
    snapshots.push({
      bakedAt: normalizeString(entry.bakedAt) || null,
      customEffects: normalizeCharacterCustomTraitEffects(entry.customEffects),
      customSpellId: rawCustomSpellId,
      sourceUpdatedAt: normalizeString(entry.sourceUpdatedAt) || null,
      spell
    });
  }

  return snapshots;
}

export function getCharacterCustomSpellEntries(
  character: Pick<Character, "customSpellSnapshots">
): SpellEntry[] {
  return normalizeCharacterCustomSpellSnapshots(character.customSpellSnapshots)
    .map((snapshot) => snapshot.spell)
    .sort(compareSpellsByLevelThenName);
}

export function getCharacterCustomSpellSnapshotBySpellId(
  character: Pick<Character, "customSpellSnapshots">,
  spellId: string
) {
  return normalizeCharacterCustomSpellSnapshots(character.customSpellSnapshots).find(
    (snapshot) => snapshot.spell.id === spellId
  );
}

export function getCustomCantripSelectionOptionsForCharacter(
  customSpells: SpellEntry[],
  character: CharacterSpellRulesInput
): SpellEntry[] {
  if (
    usesFlexibleSpellcastingRulesForCharacter(
      character.className,
      character.level,
      character.subclassId,
      character.customClass,
      character.classRules
    )
  ) {
    return customSpells.filter((spell) => getSpellLevel(spell) === 0).sort(compareSpellsByLevelThenName);
  }

  const cantripLimit = getCantripLimitForCharacter(
    character.className,
    character.level,
    character.classFeatureState,
    character.subclassId,
    character.customClass,
    character.classRules
  );

  if (
    !isSpellcastingClass(
      character.className,
      character.level,
      character.subclassId,
      character.customClass,
      character.classRules
    ) ||
    cantripLimit === null ||
    cantripLimit <= 0
  ) {
    return [];
  }

  const spellLists = getClassSpellListClassesForCharacter(character.className, character.subclassId);

  return customSpells
    .filter((spell) => getSpellLevel(spell) === 0 && hasMatchingSpellList(spell, spellLists))
    .sort(compareSpellsByLevelThenName);
}

export function getCustomPreparedSpellSelectionOptionsForCharacter(
  customSpells: SpellEntry[],
  character: CharacterSpellRulesInput
): SpellEntry[] {
  if (
    usesFlexibleSpellcastingRulesForCharacter(
      character.className,
      character.level,
      character.subclassId,
      character.customClass,
      character.classRules
    )
  ) {
    return customSpells.filter((spell) => getSpellLevel(spell) > 0).sort(compareSpellsByLevelThenName);
  }

  if (
    !usesPreparedSpellsForCharacter(
      character.className,
      character.level,
      character.subclassId,
      character.customClass,
      character.classRules
    )
  ) {
    return [];
  }

  const highestSlotLevel = getHighestSlotLevel(
    getSpellSlotTotalsForCharacter(
      character.className,
      character.level,
      character.subclassId,
      character.customClass,
      character.classRules
    )
  );
  const spellLists = getPreparedSpellListClassesForCharacter(
    character.className,
    character.level,
    character.subclassId
  );

  return customSpells
    .filter((spell) => {
      const spellLevel = getSpellLevel(spell);

      return (
        spellLevel > 0 &&
        spellLevel <= highestSlotLevel &&
        hasMatchingSpellList(spell, spellLists)
      );
    })
    .sort(compareSpellsByLevelThenName);
}

export function pruneCharacterCustomSpellSnapshotsForSelectedIds(
  snapshots: CharacterCustomSpellSnapshot[],
  selectedSpellIds: Iterable<string>
) {
  const selectedSpellIdSet = new Set(selectedSpellIds);

  return snapshots.filter((snapshot) => selectedSpellIdSet.has(snapshot.spell.id));
}

export function mergeSpellEntriesById(...entryGroups: SpellEntry[][]): SpellEntry[] {
  const entriesById = new Map<string, SpellEntry>();

  entryGroups.flat().forEach((entry) => {
    if (!entriesById.has(entry.id)) {
      entriesById.set(entry.id, entry);
    }
  });

  return Array.from(entriesById.values());
}
