import { useEffect, useState } from "react";
import { fetchItemList, isApiOfflineError } from "../../api";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import type {
  CodexStatus,
  ItemArmorType,
  ItemAttackType,
  ItemBrowserTab,
  ItemListItem,
  ItemOrdering,
  ItemProficiencyType,
  ItemSpecialFilter,
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
  specialFilter?: ItemSpecialFilter;
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
  ordering,
  specialFilter
}: UseItemEntriesOptions) {
  const isOnline = useOnlineStatus();
  const [payload, setPayload] = useState<PaginatedApiResponse<ItemListItem> | null>(null);
  const [status, setStatus] = useState<CodexStatus>(enabled ? "loading" : "ready");

  useEffect(() => {
    if (!enabled) {
      setPayload(null);
      setStatus("ready");
      return;
    }

    if (!isOnline) {
      setPayload(null);
      setStatus("server-unavailable");
      return;
    }

    let active = true;
    const abortController = new AbortController();
    setStatus("loading");

    async function loadItems() {
      try {
        const nextPayload = await fetchItemList(
          {
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
            ordering,
            specialFilter
          },
          { signal: abortController.signal }
        );

        if (!active) {
          return;
        }

        setPayload(nextPayload);
        setStatus("ready");
      } catch (error) {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      }
    }

    void loadItems();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [
    armorType,
    attackType,
    category,
    enabled,
    isOnline,
    limit,
    mastery,
    ordering,
    page,
    property,
    proficiencyType,
    rarity,
    search,
    specialFilter,
    source,
    tab
  ]);

  return {
    payload,
    status
  };
}
