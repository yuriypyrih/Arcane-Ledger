import { useEffect, useRef } from "react";
import { listMyPartyMemberships } from "../../api/partyGroups";
import {
  setPartyMemberships,
  setPartyMembershipsError,
  setPartyMembershipsLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";

export function usePartyMemberships() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const membershipsOwnerId = useAppSelector((state) => state.dmTools.membershipsOwnerId);
  const requestedOwnerIdRef = useRef<string | null>(null);

  useEffect(() => {
    let didCancel = false;

    if (authStatus !== "authenticated" || !authUserId) {
      requestedOwnerIdRef.current = null;
      dispatch(setPartyMemberships({ memberships: [], ownerId: null }));
      return () => {
        didCancel = true;
      };
    }

    if (membershipsOwnerId === authUserId || requestedOwnerIdRef.current === authUserId) {
      return () => {
        didCancel = true;
      };
    }

    requestedOwnerIdRef.current = authUserId;
    dispatch(setPartyMembershipsLoading());

    void listMyPartyMemberships({ suppressFailureToast: true })
      .then(({ memberships }) => {
        if (!didCancel) {
          dispatch(setPartyMemberships({ memberships, ownerId: authUserId }));
        }
      })
      .catch((error) => {
        if (!didCancel) {
          dispatch(
            setPartyMembershipsError(
              getDmToolsApiErrorMessage(error, "Unable to load party memberships.")
            )
          );
          requestedOwnerIdRef.current = null;
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authStatus, authUserId, dispatch, membershipsOwnerId]);
}
