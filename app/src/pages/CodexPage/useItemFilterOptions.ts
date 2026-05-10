import { useEffect, useState } from "react";
import { fetchItemFilterOptions, isApiOfflineError } from "../../api";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import type { CodexStatus, ItemFilterOptions } from "../../types";

export function useItemFilterOptions(enabled: boolean) {
  const isOnline = useOnlineStatus();
  const [payload, setPayload] = useState<ItemFilterOptions | null>(null);
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

    async function loadItemFilterOptions() {
      try {
        const nextPayload = await fetchItemFilterOptions({ signal: abortController.signal });

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

    void loadItemFilterOptions();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [enabled, isOnline]);

  return {
    payload,
    status
  };
}
