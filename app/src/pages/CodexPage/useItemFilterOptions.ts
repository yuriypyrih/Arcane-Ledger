import { useEffect, useMemo, useState } from "react";
import { fetchItemFilterOptions, isApiOfflineError } from "../../api";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import type { CodexStatus, ItemFilterOptions, ItemSpecialFilter } from "../../types";
import {
  createArtificerPlanScopeKey,
  getArtificerPlansFromScopeKey
} from "./artificerPlanScope";

export function useItemFilterOptions(
  enabled: boolean,
  options: {
    specialFilter?: ItemSpecialFilter;
    artificerPlan?: string;
    artificerPlans?: string[];
  } = {}
) {
  const { specialFilter, artificerPlan, artificerPlans } = options;
  const isOnline = useOnlineStatus();
  const [payload, setPayload] = useState<ItemFilterOptions | null>(null);
  const [status, setStatus] = useState<CodexStatus>(enabled ? "loading" : "ready");
  const artificerPlansKey = createArtificerPlanScopeKey(artificerPlans);
  const requestArtificerPlans = useMemo(
    () => getArtificerPlansFromScopeKey(artificerPlansKey),
    [artificerPlansKey]
  );

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
        const nextPayload = await fetchItemFilterOptions(
          { specialFilter, artificerPlan, artificerPlans: requestArtificerPlans },
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

    void loadItemFilterOptions();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [artificerPlan, enabled, isOnline, requestArtificerPlans, specialFilter]);

  return {
    payload,
    status
  };
}
