import { useCallback, useEffect, useRef } from "react";
import { useStore } from "react-redux";
import type { RootState } from "../store";

/** Invalidate pending work on logout, account changes, and coordinator unmount. */
export function useCharacterSyncSession() {
  const store = useStore<RootState>();
  const session = useRef({
    ownerId: null as string | null,
    authGeneration: -1,
    generation: 0,
    mounted: false
  });

  useEffect(() => {
    const currentSession = session.current;
    function updateSession() {
      const { status, user, sessionGeneration } = store.getState().auth;
      const ownerId = status === "authenticated" ? (user?.id ?? null) : null;
      if (
        currentSession.ownerId !== ownerId ||
        currentSession.authGeneration !== sessionGeneration
      ) {
        currentSession.ownerId = ownerId;
        currentSession.authGeneration = sessionGeneration;
        currentSession.generation += 1;
      }
    }

    currentSession.mounted = true;
    updateSession();
    // Subscribe synchronously so even logout/login batched into one React render invalidates work.
    const unsubscribe = store.subscribe(updateSession);
    return () => {
      unsubscribe();
      currentSession.mounted = false;
      currentSession.generation += 1;
    };
  }, [store]);

  return useCallback((ownerId: string) => {
    const generation = session.current.generation;
    return () =>
      session.current.mounted &&
      session.current.ownerId === ownerId &&
      session.current.generation === generation;
  }, []);
}
