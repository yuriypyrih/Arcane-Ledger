import { useCallback, useRef, useState } from "react";

export type CharacterFormPendingAction = "recommended" | "customize" | "proceed" | "submit";

function waitForNextPaint(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

export function useCharacterFormPendingAction() {
  const [pendingAction, setPendingAction] = useState<CharacterFormPendingAction | null>(null);
  const pendingActionRef = useRef<CharacterFormPendingAction | null>(null);

  const runPendingAction = useCallback(
    async <TResult,>(
      action: CharacterFormPendingAction,
      callback: () => TResult | Promise<TResult>
    ): Promise<TResult | undefined> => {
      if (pendingActionRef.current) {
        return undefined;
      }

      pendingActionRef.current = action;
      setPendingAction(action);

      try {
        await waitForNextPaint();
        return await callback();
      } finally {
        pendingActionRef.current = null;
        setPendingAction(null);
      }
    },
    []
  );

  return {
    hasPendingAction: pendingAction !== null,
    pendingAction,
    runPendingAction
  };
}
