import { useEffect, useState } from "react";
import { fetchMonsterByKey, isApiOfflineError } from "../../api";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import type { CodexStatus, MonsterRecord } from "../../types";
import {
  getCachedMonsterEntry,
  hasCachedMonsterEntry,
  primeMonsterEntryCache
} from "../../utils/monsters";

export function useMonsterEntry(key: string | undefined) {
  const isOnline = useOnlineStatus();
  const [monster, setMonster] = useState<MonsterRecord | null>(() =>
    key ? (getCachedMonsterEntry(key) ?? null) : null
  );
  const [status, setStatus] = useState<CodexStatus>(() =>
    key && !hasCachedMonsterEntry(key) ? "loading" : "ready"
  );

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadMonster() {
      if (!key) {
        setMonster(null);
        setStatus("ready");
        return;
      }

      const cachedMonster = getCachedMonsterEntry(key);

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
        const payload = await fetchMonsterByKey(key, { signal: abortController.signal });

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
  }, [isOnline, key]);

  return {
    monster,
    status
  };
}
