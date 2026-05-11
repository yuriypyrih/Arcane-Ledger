import type { SpellEntry } from "../entries/types";
import { spellEntries0 } from "./spells0";
import { spellEntries1 } from "./spells1";
import { spellEntries2 } from "./spells2";
import { spellEntries3 } from "./spells3";
import { spellEntries4 } from "./spells4";
import { spellEntries5 } from "./spells5";
import { spellEntries6 } from "./spells6";
import { spellEntries7 } from "./spells7";
import { spellEntries8 } from "./spells8";
import { spellEntries9 } from "./spells9";
import { resolveSpellIdAlias, resolveSpellNameAlias, spellAliasEntries } from "./aliases";

export const spellEntries: SpellEntry[] = [
  ...spellEntries0,
  ...spellEntries1,
  ...spellEntries2,
  ...spellEntries3,
  ...spellEntries4,
  ...spellEntries5,
  ...spellEntries6,
  ...spellEntries7,
  ...spellEntries8,
  ...spellEntries9
];

function normalizeSpellLookupName(name: string): string {
  return name.trim().toLowerCase();
}

const spellEntriesById = new Map(spellEntries.map((entry) => [entry.id, entry]));
const spellEntriesByName = new Map<string, SpellEntry>();

spellEntries.forEach((entry) => {
  spellEntriesByName.set(normalizeSpellLookupName(entry.name), entry);

  entry.legacyIds?.forEach((legacyId) => {
    spellEntriesById.set(legacyId, entry);
  });
  entry.legacyNames?.forEach((legacyName) => {
    spellEntriesByName.set(normalizeSpellLookupName(legacyName), entry);
  });
});

spellAliasEntries.forEach((alias) => {
  const canonicalEntry = spellEntriesById.get(alias.canonicalId);

  if (!canonicalEntry) {
    return;
  }

  spellEntriesById.set(alias.legacyId, canonicalEntry);
  spellEntriesByName.set(normalizeSpellLookupName(alias.legacyName), canonicalEntry);
});

export function getSpellEntryById(id: string): SpellEntry | null {
  return spellEntriesById.get(resolveSpellIdAlias(id)) ?? spellEntriesById.get(id) ?? null;
}

export function getSpellEntryByName(name: string): SpellEntry | null {
  const canonicalName = resolveSpellNameAlias(name);

  return (
    spellEntriesByName.get(normalizeSpellLookupName(canonicalName)) ??
    spellEntriesByName.get(normalizeSpellLookupName(name)) ??
    null
  );
}

export * from "./aliases";
export * from "./spells0";
export * from "./spells1";
export * from "./spells2";
export * from "./spells3";
export * from "./spells4";
export * from "./spells5";
export * from "./spells6";
export * from "./spells7";
export * from "./spells8";
export * from "./spells9";
