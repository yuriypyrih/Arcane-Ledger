import { useEffect, useState } from "react";
import { fetchAdministrationUsers, isApiOfflineError } from "../../../api";
import { useOnlineStatus } from "../../../lib/useOnlineStatus";
import type { AdministrationUserListResponse, AdministrationUserOrdering } from "../../../types";

export type AdministrationUsersStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "server-unavailable";

type UseAdministrationUsersOptions = {
  enabled: boolean;
  ordering: AdministrationUserOrdering;
  page: number;
  refreshSignal: number;
  search: string;
};

export function useAdministrationUsers({
  enabled,
  ordering,
  page,
  refreshSignal,
  search
}: UseAdministrationUsersOptions) {
  const isOnline = useOnlineStatus();
  const [payload, setPayload] = useState<AdministrationUserListResponse | null>(null);
  const [status, setStatus] = useState<AdministrationUsersStatus>(enabled ? "loading" : "idle");

  useEffect(() => {
    if (!enabled) {
      setPayload(null);
      setStatus("idle");
      return;
    }

    if (!isOnline) {
      setPayload(null);
      setStatus("server-unavailable");
      return;
    }

    let active = true;
    const abortController = new AbortController();

    setPayload(null);
    setStatus("loading");

    void fetchAdministrationUsers(
      {
        ordering,
        page,
        search: search.trim() || undefined
      },
      {
        signal: abortController.signal,
        suppressFailureToast: true
      }
    )
      .then((nextPayload) => {
        if (active) {
          setPayload(nextPayload);
          setStatus("ready");
        }
      })
      .catch((error) => {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setPayload(null);
        setStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      });

    return () => {
      active = false;
      abortController.abort();
    };
  }, [enabled, isOnline, ordering, page, refreshSignal, search]);

  return {
    payload,
    status
  };
}
