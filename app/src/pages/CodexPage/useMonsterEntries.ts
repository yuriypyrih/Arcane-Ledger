import { useEffect, useState } from "react";
import { fetchMonsterList } from "../../api";
import type { CodexStatus, MonsterListItem, MonsterOrdering, PaginatedApiResponse } from "../../types";

type UseMonsterEntriesOptions = {
  enabled: boolean;
  page: number;
  limit: number;
  search: string;
  type: string | null;
  maxCr?: number | null;
  source: string | null;
  ordering: MonsterOrdering;
};

export function useMonsterEntries({
  enabled,
  page,
  limit,
  search,
  type,
  maxCr,
  source,
  ordering
}: UseMonsterEntriesOptions) {
  const [payload, setPayload] = useState<PaginatedApiResponse<MonsterListItem> | null>(null);
  const [status, setStatus] = useState<CodexStatus>(enabled ? "loading" : "ready");

  useEffect(() => {
    if (!enabled) {
      setPayload(null);
      setStatus("ready");
      return;
    }

    let active = true;
    const abortController = new AbortController();
    setStatus("loading");

    async function loadMonsters() {
      try {
        const nextPayload = await fetchMonsterList(
          {
            page,
            limit,
            search: search.trim() || undefined,
            type: type ?? undefined,
            maxCr: maxCr ?? undefined,
            source: source ?? undefined,
            ordering
          },
          { signal: abortController.signal }
        );

        if (!active) {
          return;
        }

        setPayload(nextPayload);
        setStatus("ready");
      } catch {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setStatus("error");
      }
    }

    void loadMonsters();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [enabled, limit, maxCr, ordering, page, search, source, type]);

  return {
    payload,
    status
  };
}
