import { useEffect, useState } from "react";
import { fetchItemFilterOptions } from "../../api";
import type { CodexStatus, ItemFilterOptions } from "../../types";

export function useItemFilterOptions(enabled: boolean) {
  const [payload, setPayload] = useState<ItemFilterOptions | null>(null);
  const [status, setStatus] = useState<CodexStatus>(enabled ? "loading" : "ready");

  useEffect(() => {
    if (!enabled) {
      setPayload(null);
      setStatus("ready");
      return;
    }

    let active = true;
    setStatus("loading");

    async function loadItemFilterOptions() {
      try {
        const nextPayload = await fetchItemFilterOptions();

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

    void loadItemFilterOptions();

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    payload,
    status
  };
}
