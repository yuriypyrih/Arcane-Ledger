import { useEffect } from "react";
import { getUserPreferences, saveUserPreferences } from "../api/auth";
import { ApiOfflineError, isApiAbortError } from "../api/client";
import { captureAppError } from "../lib/sentry";
import {
  configureRemotePreferencesSave,
  replaceLocalPreferences
} from "../storage/preferences";
import { useAppSelector } from "../store";

function shouldIgnorePreferencesSyncError(error: unknown) {
  return error instanceof ApiOfflineError || isApiAbortError(error);
}

function capturePreferencesSyncError(error: unknown, action: string) {
  if (shouldIgnorePreferencesSyncError(error)) {
    return;
  }

  captureAppError(error, {
    area: "preferences-sync",
    action,
    level: "warning"
  });
}

function PreferencesSyncBootstrap() {
  const { status, user } = useAppSelector((state) => state.auth);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      configureRemotePreferencesSave(null);
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    configureRemotePreferencesSave(
      async (preferences) => {
        await saveUserPreferences(preferences, { suppressFailureToast: true });
      },
      (error) => capturePreferencesSyncError(error, "save")
    );

    void getUserPreferences({
      signal: abortController.signal,
      suppressFailureToast: true
    })
      .then(({ preferences }) => {
        if (!cancelled) {
          replaceLocalPreferences(preferences);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          capturePreferencesSyncError(error, "fetch");
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
      configureRemotePreferencesSave(null);
    };
  }, [status, userId]);

  return null;
}

export default PreferencesSyncBootstrap;
