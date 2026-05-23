import { useEffect } from "react";
import { getCurrentUser } from "../api/auth";
import {
  setAuthLoading,
  setAuthenticatedUser,
  setGuestSession,
  useAppDispatch,
  useAppSelector
} from "../store";

function AuthSessionBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    if (status !== "unknown") {
      return undefined;
    }

    let cancelled = false;
    dispatch(setAuthLoading(true));

    void getCurrentUser({ suppressFailureToast: true })
      .then(({ user }) => {
        if (!cancelled) {
          dispatch(setAuthenticatedUser(user));
        }
      })
      .catch(() => {
        if (!cancelled) {
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
