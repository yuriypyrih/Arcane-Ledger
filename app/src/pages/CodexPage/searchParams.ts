import { ENTRY_CATEGORIES, SPELL_LIST_CLASS } from "../../codex/entries";
import { MONSTER_SOURCE_OPTIONS, MONSTER_TYPE_OPTIONS } from "../../constants/monsters";
import {
  DEFAULT_ITEM_BROWSER_TAB,
  type ItemArmorType,
  type ItemAttackType,
  type ItemBrowserTab,
  type ItemOrdering,
  type ItemProficiencyType,
  type MonsterOrdering
} from "../../types";
import type { CodexFilterCategory } from "../../utils/codex";

export const SPELLS_PER_PAGE = 20;
export const MONSTERS_PER_PAGE = 50;
export const ITEMS_PER_PAGE = 50;
export const SPELL_LEVEL_PARAM = "spellLevel";
export const SPELL_CLASS_PARAM = "spellClass";
export const MONSTER_TYPE_PARAM = "monsterType";
export const MONSTER_SOURCE_PARAM = "monsterSource";
export const MONSTER_ORDER_PARAM = "monsterOrder";
export const ITEM_CATEGORY_PARAM = "itemCategory";
export const ITEM_TAB_PARAM = "itemTab";
export const ITEM_ATTACK_TYPE_PARAM = "itemAttackType";
export const ITEM_PROFICIENCY_TYPE_PARAM = "itemProficiencyType";
export const ITEM_ARMOR_TYPE_PARAM = "itemArmorType";
export const ITEM_RARITY_PARAM = "itemRarity";
export const ITEM_SOURCE_PARAM = "itemSource";
export const ITEM_ORDER_PARAM = "itemOrder";
export const PAGE_PARAM = "page";
export const QUERY_PARAM = "q";

const MONSTER_ORDERINGS = new Set<string>([
  "name",
  "-name",
  "cr",
  "-cr",
  "challenge_rating",
  "-challenge_rating"
]);
const ITEM_ORDERINGS = new Set<string>([
  "name",
  "-name",
  "rarity",
  "-rarity",
  "weight",
  "-weight",
  "cost",
  "-cost"
]);
const ITEM_TABS = new Set<ItemBrowserTab>(["weapons", "armor", "gear"]);
const ITEM_ATTACK_TYPES = new Set<ItemAttackType>(["melee", "range"]);
const ITEM_PROFICIENCY_TYPES = new Set<ItemProficiencyType>(["simple", "martial"]);
const ITEM_ARMOR_TYPES = new Set<ItemArmorType>(["light", "medium", "heavy"]);

export type ParsedCodexSearchState = {
  category: CodexFilterCategory;
  query: string;
  spellLevelFilter: number | null;
  spellClassFilter: SPELL_LIST_CLASS | null;
  monsterTypeFilter: string | null;
  monsterSourceFilter: string | null;
  monsterOrdering: MonsterOrdering;
  itemTab: ItemBrowserTab;
  itemCategoryFilter: string | null;
  itemAttackTypeFilter: ItemAttackType | null;
  itemProficiencyTypeFilter: ItemProficiencyType | null;
  itemArmorTypeFilter: ItemArmorType | null;
  itemRarityFilter: string | null;
  itemSourceFilter: string | null;
  itemOrdering: ItemOrdering;
  currentPage: number;
};

function parseSpellLevelFilter(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > 9) {
    return null;
  }

  return parsedValue;
}

function parseSpellClassFilter(value: string | null): SPELL_LIST_CLASS | null {
  if (value === null) {
    return null;
  }

  return Object.values(SPELL_LIST_CLASS).includes(value as SPELL_LIST_CLASS)
    ? (value as SPELL_LIST_CLASS)
    : null;
}

function parsePageValue(value: string | null): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function parseMonsterOrdering(value: string | null): MonsterOrdering {
  if (!value || !MONSTER_ORDERINGS.has(value)) {
    return "name";
  }

  if (value === "challenge_rating") {
    return "cr";
  }

  if (value === "-challenge_rating") {
    return "-cr";
  }

  return value as MonsterOrdering;
}

function parseMonsterTypeFilter(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return MONSTER_TYPE_OPTIONS.includes(value as (typeof MONSTER_TYPE_OPTIONS)[number]) ? value : null;
}

function parseMonsterSourceFilter(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return MONSTER_SOURCE_OPTIONS.includes(value as (typeof MONSTER_SOURCE_OPTIONS)[number])
    ? value
    : null;
}

function parseItemOrdering(value: string | null): ItemOrdering {
  if (!value || !ITEM_ORDERINGS.has(value)) {
    return "name";
  }

  return value as ItemOrdering;
}

function parseEnumFilter<T extends string>(value: string | null, allowedValues: Set<T>): T | null {
  if (!value) {
    return null;
  }

  return allowedValues.has(value as T) ? (value as T) : null;
}

function parseOptionalFilter(value: string | null): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export function parseCodexSearchState(
  searchParams: URLSearchParams,
  categories: CodexFilterCategory[]
): ParsedCodexSearchState {
  const categoryParam = searchParams.get("category");
  const category = categories.includes(categoryParam as CodexFilterCategory)
    ? (categoryParam as CodexFilterCategory)
    : ENTRY_CATEGORIES.CLASSES;

  return {
    category,
    query: searchParams.get(QUERY_PARAM) ?? "",
    spellLevelFilter: parseSpellLevelFilter(searchParams.get(SPELL_LEVEL_PARAM)),
    spellClassFilter: parseSpellClassFilter(searchParams.get(SPELL_CLASS_PARAM)),
    monsterTypeFilter: parseMonsterTypeFilter(searchParams.get(MONSTER_TYPE_PARAM)),
    monsterSourceFilter: parseMonsterSourceFilter(searchParams.get(MONSTER_SOURCE_PARAM)),
    monsterOrdering: parseMonsterOrdering(searchParams.get(MONSTER_ORDER_PARAM)),
    itemTab:
      parseEnumFilter(searchParams.get(ITEM_TAB_PARAM), ITEM_TABS) ?? DEFAULT_ITEM_BROWSER_TAB,
    itemCategoryFilter: parseOptionalFilter(searchParams.get(ITEM_CATEGORY_PARAM)),
    itemAttackTypeFilter: parseEnumFilter(searchParams.get(ITEM_ATTACK_TYPE_PARAM), ITEM_ATTACK_TYPES),
    itemProficiencyTypeFilter: parseEnumFilter(
      searchParams.get(ITEM_PROFICIENCY_TYPE_PARAM),
      ITEM_PROFICIENCY_TYPES
    ),
    itemArmorTypeFilter: parseEnumFilter(searchParams.get(ITEM_ARMOR_TYPE_PARAM), ITEM_ARMOR_TYPES),
    itemRarityFilter: parseOptionalFilter(searchParams.get(ITEM_RARITY_PARAM)),
    itemSourceFilter: parseOptionalFilter(searchParams.get(ITEM_SOURCE_PARAM)),
    itemOrdering: parseItemOrdering(searchParams.get(ITEM_ORDER_PARAM)),
    currentPage: parsePageValue(searchParams.get(PAGE_PARAM))
  };
}

export function clearSpellSearchParams(searchParams: URLSearchParams): URLSearchParams {
  searchParams.delete(SPELL_LEVEL_PARAM);
  searchParams.delete(SPELL_CLASS_PARAM);
  return searchParams;
}

export function clearMonsterSearchParams(searchParams: URLSearchParams): URLSearchParams {
  searchParams.delete(MONSTER_TYPE_PARAM);
  searchParams.delete(MONSTER_SOURCE_PARAM);
  searchParams.delete(MONSTER_ORDER_PARAM);
  return searchParams;
}

export function clearItemSearchParams(searchParams: URLSearchParams): URLSearchParams {
  searchParams.delete(ITEM_TAB_PARAM);
  searchParams.delete(ITEM_CATEGORY_PARAM);
  searchParams.delete(ITEM_ATTACK_TYPE_PARAM);
  searchParams.delete(ITEM_PROFICIENCY_TYPE_PARAM);
  searchParams.delete(ITEM_ARMOR_TYPE_PARAM);
  searchParams.delete(ITEM_RARITY_PARAM);
  searchParams.delete(ITEM_SOURCE_PARAM);
  searchParams.delete(ITEM_ORDER_PARAM);
  return searchParams;
}

export function clearCategoryScopedSearchParams(
  searchParams: URLSearchParams,
  category: CodexFilterCategory
): URLSearchParams {
  if (category !== ENTRY_CATEGORIES.SPELLS) {
    clearSpellSearchParams(searchParams);
  }

  if (category !== ENTRY_CATEGORIES.MONSTERS) {
    clearMonsterSearchParams(searchParams);
  }

  if (category !== ENTRY_CATEGORIES.ITEMS) {
    clearItemSearchParams(searchParams);
  }

  return searchParams;
}

export function hasCategoryScopedSearchParams(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has(SPELL_LEVEL_PARAM) ||
    searchParams.has(SPELL_CLASS_PARAM) ||
    searchParams.has(MONSTER_TYPE_PARAM) ||
    searchParams.has(MONSTER_SOURCE_PARAM) ||
    searchParams.has(MONSTER_ORDER_PARAM) ||
    searchParams.has(ITEM_TAB_PARAM) ||
    searchParams.has(ITEM_CATEGORY_PARAM) ||
    searchParams.has(ITEM_ATTACK_TYPE_PARAM) ||
    searchParams.has(ITEM_PROFICIENCY_TYPE_PARAM) ||
    searchParams.has(ITEM_ARMOR_TYPE_PARAM) ||
    searchParams.has(ITEM_RARITY_PARAM) ||
    searchParams.has(ITEM_SOURCE_PARAM) ||
    searchParams.has(ITEM_ORDER_PARAM) ||
    searchParams.has(PAGE_PARAM)
  );
}

export function setSearchParamValue(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | null
): URLSearchParams {
  if (value === null || value === "") {
    searchParams.delete(key);
    return searchParams;
  }

  searchParams.set(key, String(value));
  return searchParams;
}

export function resetPageSearchParam(searchParams: URLSearchParams): URLSearchParams {
  searchParams.delete(PAGE_PARAM);
  return searchParams;
}

export function setPageSearchParam(
  searchParams: URLSearchParams,
  page: number
): URLSearchParams {
  if (page <= 1) {
    searchParams.delete(PAGE_PARAM);
    return searchParams;
  }

  searchParams.set(PAGE_PARAM, String(page));
  return searchParams;
}
