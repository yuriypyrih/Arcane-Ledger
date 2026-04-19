import {
  DEFAULT_ITEM_BROWSER_TAB,
  type ItemArmorType,
  type ItemAttackType,
  type ItemBrowserTab,
  type ItemFilterOption,
  type ItemFilterOptions,
  type ItemProficiencyType
} from "../../types";

export const ITEM_BROWSER_TAB_OPTIONS: Array<{ value: ItemBrowserTab; label: string }> = [
  {
    value: "all",
    label: "All"
  },
  {
    value: "weapons",
    label: "Weapons"
  },
  {
    value: "armor",
    label: "Armor"
  },
  {
    value: "gear",
    label: "Gear"
  }
];

export type ItemBrowserScopedFilters = {
  tab: ItemBrowserTab;
  category: string | null;
  attackType: ItemAttackType | null;
  proficiencyType: ItemProficiencyType | null;
  mastery: string | null;
  property: string | null;
  armorType: ItemArmorType | null;
};

function getItemBrowserGroup(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
) {
  return filterOptions?.groups[tab] ?? null;
}

export function getItemBrowserCategoryOptions(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
): ItemFilterOption[] {
  return getItemBrowserGroup(filterOptions, tab)?.categories ?? [];
}

export function getItemBrowserAttackTypeOptions(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
): ItemFilterOption[] {
  return tab === "weapons" ? filterOptions?.groups.weapons.attackTypes ?? [] : [];
}

export function getItemBrowserProficiencyTypeOptions(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
): ItemFilterOption[] {
  return tab === "weapons" ? filterOptions?.groups.weapons.proficiencyTypes ?? [] : [];
}

export function getItemBrowserArmorTypeOptions(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
): ItemFilterOption[] {
  return tab === "armor" ? filterOptions?.groups.armor.armorTypes ?? [] : [];
}

export function getItemBrowserMasteryOptions(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
): ItemFilterOption[] {
  return tab === "weapons" ? filterOptions?.groups.weapons.masteries ?? [] : [];
}

export function getItemBrowserPropertyOptions(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
): ItemFilterOption[] {
  return tab === "weapons" ? filterOptions?.groups.weapons.properties ?? [] : [];
}

export function getItemBrowserTabCount(
  filterOptions: ItemFilterOptions | null | undefined,
  tab: ItemBrowserTab
) {
  return getItemBrowserGroup(filterOptions, tab)?.count ?? 0;
}

export function sanitizeItemBrowserScopedFilters(
  filters: ItemBrowserScopedFilters,
  filterOptions?: ItemFilterOptions | null
): ItemBrowserScopedFilters {
  const nextTab = filters.tab ?? DEFAULT_ITEM_BROWSER_TAB;
  const categoryOptions = getItemBrowserCategoryOptions(filterOptions, nextTab);
  const masteryOptions = getItemBrowserMasteryOptions(filterOptions, nextTab);
  const propertyOptions = getItemBrowserPropertyOptions(filterOptions, nextTab);
  const hasCategory =
    filters.category === null ||
    !filterOptions ||
    categoryOptions.some((option) => option.value === filters.category);
  const hasMastery =
    filters.mastery === null ||
    !filterOptions ||
    masteryOptions.some((option) => option.value === filters.mastery);
  const hasProperty =
    filters.property === null ||
    !filterOptions ||
    propertyOptions.some((option) => option.value === filters.property);

  return {
    tab: nextTab,
    category: nextTab === "all" ? null : hasCategory ? filters.category : null,
    attackType: nextTab === "weapons" ? filters.attackType : null,
    proficiencyType: nextTab === "weapons" ? filters.proficiencyType : null,
    mastery: nextTab === "weapons" && hasMastery ? filters.mastery : null,
    property: nextTab === "weapons" && hasProperty ? filters.property : null,
    armorType: nextTab === "armor" ? filters.armorType : null
  };
}
