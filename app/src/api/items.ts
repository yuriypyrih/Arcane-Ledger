import { DEFAULT_ITEM_BROWSER_TAB } from "../types";
import type {
  ItemArmorType,
  ItemAttackType,
  ItemBatchLookupRecord,
  ItemBrowserTab,
  ItemPackContentsRecord,
  ItemFilterOptions,
  ItemListItem,
  ItemOrdering,
  ItemProficiencyType,
  ItemRecord,
  PaginatedApiResponse
} from "../types";
import { apiGet, apiPost } from "./client";

export type FetchItemListParams = {
  page?: number;
  limit?: number;
  search?: string;
  tab?: ItemBrowserTab;
  category?: string;
  attackType?: ItemAttackType;
  proficiencyType?: ItemProficiencyType;
  mastery?: string;
  property?: string;
  armorType?: ItemArmorType;
  rarity?: string;
  source?: string;
  ordering?: ItemOrdering;
};

export async function fetchItemList({
  page = 1,
  limit = 50,
  search,
  tab = DEFAULT_ITEM_BROWSER_TAB,
  category,
  attackType,
  proficiencyType,
  mastery,
  property,
  armorType,
  rarity,
  source,
  ordering = "name"
}: FetchItemListParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));
  searchParams.set("ordering", ordering);
  searchParams.set("tab", tab);

  if (search) {
    searchParams.set("search", search);
  }

  if (category) {
    searchParams.set("category", category);
  }

  if (attackType) {
    searchParams.set("attackType", attackType);
  }

  if (proficiencyType) {
    searchParams.set("proficiencyType", proficiencyType);
  }

  if (mastery) {
    searchParams.set("mastery", mastery);
  }

  if (property) {
    searchParams.set("property", property);
  }

  if (armorType) {
    searchParams.set("armorType", armorType);
  }

  if (rarity) {
    searchParams.set("rarity", rarity);
  }

  if (source) {
    searchParams.set("source", source);
  }

  return apiGet<PaginatedApiResponse<ItemListItem>>(`items?${searchParams.toString()}`);
}

export async function fetchItemByKey(key: string) {
  return apiGet<ItemRecord>(`items/${key}`);
}

export async function fetchItemsByKeys(keys: string[]) {
  return apiPost<ItemBatchLookupRecord>("items/batch", { keys });
}

export async function fetchItemPackContents(key: string) {
  return apiGet<ItemPackContentsRecord>(`items/${key}/pack-contents`);
}

export async function fetchItemFilterOptions() {
  return apiGet<ItemFilterOptions>("items/meta");
}
