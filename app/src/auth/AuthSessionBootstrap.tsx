import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { ApiRequestFailedError } from "../api/client";
import {
  setAuthLoading,
  setAuthenticatedUser,
  setGuestSession,
  useAppDispatch,
  useAppSelector
} from "../store";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  handleExpiredAuthSession,
  hasAuthSessionMarker,
  markAuthSessionActive
} from "./authSessionLifecycle";

function AuthSessionBootstrap() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((state) => state.auth.status);

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
    if (status !== "unknown") {
      return undefined;
    }

    let cancelled = false;
    dispatch(setAuthLoading(true));

    void getCurrentUser({ suppressFailureToast: true })
      .then(({ user }) => {
        if (!cancelled) {
          markAuthSessionActive();
          dispatch(setAuthenticatedUser(user));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          if (
            error instanceof ApiRequestFailedError &&
            error.code === "AUTH_REQUIRED" &&
            hasAuthSessionMarker()
          ) {
            handleExpiredAuthSession();
            return;
          }

          dispatch(setGuestSession());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, status]);

  return null;
}

export default AuthSessionBootstrap;
