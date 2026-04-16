import { useEffect, useState } from "react";
import { fetchItemList } from "../../api";
import type {
  CodexStatus,
  ItemArmorType,
  ItemAttackType,
  ItemBrowserTab,
  ItemListItem,
  ItemOrdering,
  ItemProficiencyType,
  PaginatedApiResponse
} from "../../types";

type UseItemEntriesOptions = {
  enabled: boolean;
  page: number;
  limit: number;
  search: string;
  tab: ItemBrowserTab;
  category: string | null;
  attackType: ItemAttackType | null;
  proficiencyType: ItemProficiencyType | null;
  mastery: string | null;
  property: string | null;
  armorType: ItemArmorType | null;
  rarity: string | null;
  source: string | null;
  ordering: ItemOrdering;
};

export function useItemEntries({
  enabled,
  page,
  limit,
  search,
  tab,
  category,
  attackType,
  proficiencyType,
  mastery,
  property,
  armorType,
  rarity,
  source,
  ordering
}: UseItemEntriesOptions) {
  const [payload, setPayload] = useState<PaginatedApiResponse<ItemListItem> | null>(null);
  const [status, setStatus] = useState<CodexStatus>(enabled ? "loading" : "ready");

  useEffect(() => {
    if (!enabled) {
      setPayload(null);
      setStatus("ready");
      return;
    }

    let active = true;
    setStatus("loading");

    async function loadItems() {
      try {
        const nextPayload = await fetchItemList({
          page,
          limit,
          search: search.trim() || undefined,
          tab,
          category: category ?? undefined,
          attackType: attackType ?? undefined,
          proficiencyType: proficiencyType ?? undefined,
          mastery: mastery ?? undefined,
          property: property ?? undefined,
          armorType: armorType ?? undefined,
          rarity: rarity ?? undefined,
          source: source ?? undefined,
          ordering
        });

        if (!active) {
          return;
        }

        setPayload(nextPayload);
        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setStatus("error");
      }
    }

    void loadItems();

    return () => {
      active = false;
    };
  }, [
    armorType,
    attackType,
    category,
    enabled,
    limit,
    mastery,
    ordering,
    page,
    property,
    proficiencyType,
    rarity,
    search,
    source,
    tab
  ]);

  return {
    payload,
    status
  };
}
