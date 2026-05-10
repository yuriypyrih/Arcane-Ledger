import { useEffect, useState } from "react";
import { fetchMonsterBySlug, isApiOfflineError } from "../../api";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import type { CodexStatus, MonsterRecord } from "../../types";
import {
  getCachedMonsterEntry,
  hasCachedMonsterEntry,
  primeMonsterEntryCache
} from "../../utils/monsters";

export function useMonsterEntry(slug: string | undefined) {
  const isOnline = useOnlineStatus();
  const [monster, setMonster] = useState<MonsterRecord | null>(() =>
    slug ? (getCachedMonsterEntry(slug) ?? null) : null
  );
  const [status, setStatus] = useState<CodexStatus>(() =>
    slug && !hasCachedMonsterEntry(slug) ? "loading" : "ready"
  );

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadMonster() {
      if (!slug) {
        setMonster(null);
        setStatus("ready");
        return;
      }

      const cachedMonster = getCachedMonsterEntry(slug);

      if (cachedMonster) {
        setMonster(cachedMonster);
        setStatus("ready");
        return;
      }

      if (!isOnline) {
        setMonster(null);
        setStatus("server-unavailable");
        return;
      }

      setStatus("loading");

      try {
        const payload = await fetchMonsterBySlug(slug, { signal: abortController.signal });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(payload);
        setMonster(payload);
        setStatus("ready");
      } catch (error) {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setMonster(null);
        setStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      }
    }

    void loadMonster();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [isOnline, slug]);

  return {
    monster,
    status
  };
}
