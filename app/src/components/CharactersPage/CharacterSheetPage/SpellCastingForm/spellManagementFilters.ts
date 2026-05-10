import {
  ACTION_TYPE,
  DURATION,
  type MAGIC_SCHOOL,
  type SPELL_LIST_CLASS,
  type SpellEntry
} from "../../../../codex/entries";

export type SpellManagementSpecialFilter =
  | "ritual"
  | "action"
  | "bonus-action"
  | "reaction"
  | "concentration"
  | "healing"
  | "damage";

export type SpellManagementFilters = {
  query: string;
  magicSchool: MAGIC_SCHOOL | null;
  spellListClass: SPELL_LIST_CLASS | null;
  special: SpellManagementSpecialFilter | null;
};

export type SpellManagementFilterOptions = {
  magicSchools: MAGIC_SCHOOL[];
  spellListClasses: SPELL_LIST_CLASS[];
  specialFilters: SpellManagementSpecialFilter[];
};

const spellManagementSpecialFilters: SpellManagementSpecialFilter[] = [
  "ritual",
  "action",
  "bonus-action",
  "reaction",
  "concentration",
  "healing",
  "damage"
];

export const emptySpellManagementFilters: SpellManagementFilters = {
  query: "",
  magicSchool: null,
  spellListClass: null,
  special: null
};

export function getSpellManagementSpecialFilterLabel(
  filter: SpellManagementSpecialFilter
): string {
  switch (filter) {
    case "ritual":
      return "Ritual";
    case "action":
      return "Action";
    case "bonus-action":
      return "Bonus action";
    case "reaction":
      return "Reaction";
    case "concentration":
      return "Concentration";
    case "healing":
      return "Healing";
    case "damage":
      return "Damage";
  }
}

function matchesSpellManagementSpecialFilter(
  spell: SpellEntry,
  filter: SpellManagementSpecialFilter
): boolean {
  switch (filter) {
    case "ritual":
      return spell.ritual === true;
    case "action":
      return spell.castingTime.includes(ACTION_TYPE.ACTION);
    case "bonus-action":
      return spell.castingTime.includes(ACTION_TYPE.BONUS_ACTION);
    case "reaction":
      return spell.castingTime.includes(ACTION_TYPE.REACTION);
    case "concentration":
      return spell.duration.includes(DURATION.CONCENTRATION);
    case "healing":
      return spell.isHealingSpell === true;
    case "damage":
      return spell.isDamagingSpell === true;
  }
}

export function getSpellManagementFilterOptions(
  spells: SpellEntry[]
): SpellManagementFilterOptions {
  const magicSchools = new Set<MAGIC_SCHOOL>();
  const spellListClasses = new Set<SPELL_LIST_CLASS>();

  spells.forEach((spell) => {
    magicSchools.add(spell.magicSchool);
    spell.spellLists.forEach((spellListClass) => {
      spellListClasses.add(spellListClass);
    });
  });

  return {
    magicSchools: [...magicSchools].sort((left, right) => left.localeCompare(right)),
    spellListClasses: [...spellListClasses].sort((left, right) => left.localeCompare(right)),
    specialFilters: [...spellManagementSpecialFilters]
  };
}

export function filterSpellManagementSpells(
  spells: SpellEntry[],
  filters: SpellManagementFilters
): SpellEntry[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return spells.filter((spell) => {
    const matchesQuery =
      normalizedQuery.length === 0 || spell.name.toLowerCase().includes(normalizedQuery);
    const matchesSchool = filters.magicSchool === null || spell.magicSchool === filters.magicSchool;
    const matchesSpellList =
      filters.spellListClass === null || spell.spellLists.includes(filters.spellListClass);
    const matchesSpecial =
      filters.special === null || matchesSpellManagementSpecialFilter(spell, filters.special);

    return matchesQuery && matchesSchool && matchesSpellList && matchesSpecial;
  });
}

export function hasActiveSpellManagementFilters(filters: SpellManagementFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.magicSchool !== null ||
    filters.spellListClass !== null ||
    filters.special !== null
  );
}
