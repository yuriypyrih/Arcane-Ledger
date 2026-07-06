import { useEffect, useState } from "react";
import { fetchMonsterList, isApiOfflineError } from "../../api";
import type { MonsterChallengeRatingBucket } from "../../constants/monsters";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import type { CodexStatus, MonsterListItem, MonsterOrdering, PaginatedApiResponse } from "../../types";

type UseMonsterEntriesOptions = {
  enabled: boolean;
  page: number;
  limit: number;
  search: string;
  type: string | null;
  types?: string[] | null;
  challengeRatingBucket?: MonsterChallengeRatingBucket | null;
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
  types,
  challengeRatingBucket,
  maxCr,
  source,
  ordering
}: UseMonsterEntriesOptions) {
  const isOnline = useOnlineStatus();
  const [payload, setPayload] = useState<PaginatedApiResponse<MonsterListItem> | null>(null);
  const [status, setStatus] = useState<CodexStatus>(enabled ? "loading" : "ready");
  const typesKey = types?.join("|") ?? "";

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

    async function loadMonsters() {
      try {
        const nextPayload = await fetchMonsterList(
          {
            page,
            limit,
            search: search.trim() || undefined,
            type: type ?? undefined,
            types: typesKey ? typesKey.split("|") : undefined,
            challengeRatingBucket: challengeRatingBucket ?? undefined,
            maxChallengeRating: maxCr ?? undefined,
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
      } catch (error) {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      }
    }

    void loadMonsters();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [
    challengeRatingBucket,
    enabled,
    isOnline,
    limit,
    maxCr,
    ordering,
    page,
    search,
    source,
    type,
    typesKey
  ]);

  return {
    payload,
    status
  };
}
