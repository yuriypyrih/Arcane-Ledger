import { useEffect, useState } from "react";
import { fetchMonsterList } from "../../api";
import type { CodexStatus, MonsterListItem, PaginatedApiResponse } from "../../types";

type UseMonsterEntriesOptions = {
  enabled: boolean;
  page: number;
  limit: number;
  search: string;
};

export function useMonsterEntries({ enabled, page, limit, search }: UseMonsterEntriesOptions) {
  const [payload, setPayload] = useState<PaginatedApiResponse<MonsterListItem> | null>(null);
  const [status, setStatus] = useState<CodexStatus>(enabled ? "loading" : "ready");

  useEffect(() => {
    if (!enabled) {
      setPayload(null);
      setStatus("ready");
      return;
    }

    let active = true;
    setStatus("loading");

    async function loadMonsters() {
      try {
        const nextPayload = await fetchMonsterList({
          page,
          limit,
          search: search.trim() || undefined
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

    void loadMonsters();

    return () => {
      active = false;
    };
  }, [enabled, limit, page, search]);

  return {
    payload,
    status
  };
}
