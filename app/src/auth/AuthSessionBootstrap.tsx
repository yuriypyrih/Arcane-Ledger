import { useEffect } from "react";
import { useStore } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { ApiRequestFailedError } from "../api/client";
import {
  setAuthLoading,
  setAuthenticatedUser,
  setGuestSession,
  restoreOfflineAuthUser,
  type RootState
} from "../store";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  handleExpiredAuthSession,
  hasAuthSessionMarker,
  markAuthSessionActive
} from "./authSessionLifecycle";
import { isLocallySignedOut, readRememberedAuthUser } from "./authSessionStorage";

const sessionCheckTimeoutMs = 10000;
const sessionRetryMs = 30000;

function AuthSessionBootstrap() {
  const store = useStore<RootState>();
  const navigate = useNavigate();

  useEffect(() => {
    function handleSessionExpired() {
      navigate("/login", { replace: true });
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [navigate]);

  useEffect(() => {
    const { dispatch } = store;
    if (store.getState().auth.status === "unknown") {
      const rememberedUser = readRememberedAuthUser();
      if (rememberedUser) {
        dispatch(restoreOfflineAuthUser(rememberedUser));
      } else if (isLocallySignedOut() || !navigator.onLine) {
        dispatch(setGuestSession());
      }
    }

    let needsCheck = !isLocallySignedOut();
    let pending: AbortController | null = null;
    let timeout: number | undefined;
    let previousAuth = store.getState().auth;

    function cancelCheck() {
      pending?.abort();
      pending = null;
      window.clearTimeout(timeout);
    }

    // Invalidate synchronously, including logout/login batched into a single render.
    const unsubscribe = store.subscribe(() => {
      const auth = store.getState().auth;
      if (
        auth.status !== previousAuth.status ||
        auth.user !== previousAuth.user ||
        auth.sessionVerified !== previousAuth.sessionVerified
      ) {
        cancelCheck();
        needsCheck =
          auth.status === "unknown" || (auth.status === "authenticated" && !auth.sessionVerified);
      }
      previousAuth = auth;
    });

    async function checkSession() {
      if (!needsCheck || pending || !navigator.onLine || isLocallySignedOut()) return;

      const controller = new AbortController();
      pending = controller;
      dispatch(setAuthLoading(true));
      timeout = window.setTimeout(() => controller.abort(), sessionCheckTimeoutMs);

      try {
        const { user } = await getCurrentUser({
          signal: controller.signal,
          suppressFailureToast: true,
          // Check for stale results before an auth rejection can clear a newer session.
          handleAuthSessionFailure: false
        });
        if (pending === controller) {
          markAuthSessionActive();
          dispatch(setAuthenticatedUser(user));
          needsCheck = false;
        }
      } catch (error) {
        if (pending !== controller) return;
        if (
          error instanceof ApiRequestFailedError &&
          (error.code === "AUTH_REQUIRED" ||
            error.code === "AUTH_SESSION_EXPIRED" ||
            error.code === "AUTH_SESSION_INVALID")
        ) {
          if (hasAuthSessionMarker() || store.getState().auth.user) {
            handleExpiredAuthSession();
          } else {
            dispatch(setGuestSession());
          }
          needsCheck = false;
        } else {
          // Offline, unreachable servers, timeouts and temporary failures do not log out.
          const auth = store.getState().auth;
          if (auth.status === "authenticated" && auth.user && auth.sessionVerified) {
            dispatch(restoreOfflineAuthUser(auth.user));
          } else if (auth.status === "unknown") {
            dispatch(setGuestSession());
          }
          dispatch(setAuthLoading(false));
          needsCheck = true;
        }
      } finally {
        if (pending === controller) {
          pending = null;
          window.clearTimeout(timeout);
        }
      }
    }

    function handleOnline() {
      if (store.getState().auth.status === "authenticated") needsCheck = true;
      void checkSession();
    }

    function handleVisible() {
      if (document.visibilityState === "visible") void checkSession();
    }

    void checkSession();
    // Some signal failures never change navigator.onLine or emit an online event.
    const retryTimer = window.setInterval(handleVisible, sessionRetryMs);
    window.addEventListener("online", handleOnline);
    window.addEventListener("focus", handleVisible);
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      unsubscribe();
      cancelCheck();
      window.clearInterval(retryTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("focus", handleVisible);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [store]);

  return null;
}

export default AuthSessionBootstrap;
