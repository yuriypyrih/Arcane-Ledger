import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDiceRollerBehaviorPreference,
  type DiceRollerBehaviorPreference
} from "../../../storage/preferences";
import { showToast, useAppDispatch } from "../../../store";
import { rollFormulaWithDice } from "../../../utils/dice";
import DiceRollerPopup from "./DiceRollerPopup";
import type { DiceRollerPopupState, DiceRollerRequest, DiceRollerResolvedResult } from "./types";

function createResolvedResult(state: DiceRollerPopupState): DiceRollerResolvedResult | null {
  if (!state.result) {
    return null;
  }

  const { onResolvedResult: _onResolvedResult, ...request } = state.request;

  return {
    request,
    result: state.result,
    dice: state.dice,
    rollToken: state.rollToken
  };
}

function createPopupState(
  request: DiceRollerRequest,
  rollToken: number,
  behavior: DiceRollerBehaviorPreference
): DiceRollerPopupState {
  const mode = request.mode ?? "normal";

  try {
    const rollResult = rollFormulaWithDice(request.formula, mode);

    return {
      request: {
        ...request,
        mode
      },
      result: rollResult,
      error: "",
      dice: rollResult.dice,
      rollToken,
      resultVisible: rollResult.dice.length === 0,
      behavior,
      resolvedCallbackHandled: false
    };
  } catch (rollError) {
    return {
      request: {
        ...request,
        mode
      },
      result: null,
      error: rollError instanceof Error ? rollError.message : "Failed to roll dice.",
      dice: [],
      rollToken,
      resultVisible: true,
      behavior,
      resolvedCallbackHandled: false
    };
  }
}

export function useDiceRollerPopup() {
  const dispatch = useAppDispatch();
  const [popupState, setPopupState] = useState<DiceRollerPopupState | null>(null);
  const nextRollTokenRef = useRef(0);

  const openDiceRoller = useCallback(
    (request: DiceRollerRequest) => {
      nextRollTokenRef.current += 1;
      const rollToken = nextRollTokenRef.current;
      const behavior = getDiceRollerBehaviorPreference();
      const nextPopupState = createPopupState(request, rollToken, behavior);

      if (behavior === "full_manual") {
        if (nextPopupState.result) {
          dispatch(
            showToast({
              text: `Action Used: Rolled ${nextPopupState.result.total}`,
              type: "success",
              position: "top-middle",
              effect: "default"
            })
          );
        } else {
          dispatch(
            showToast({
              text: nextPopupState.error || "Failed to roll dice.",
              type: "error",
              position: "top-middle",
              effect: "default"
            })
          );
        }

        setPopupState(null);
        return;
      }

      setPopupState(nextPopupState);
    },
    [dispatch]
  );

  const closeDiceRoller = useCallback(() => {
    setPopupState(null);
  }, []);

  const revealDiceResult = useCallback((completedToken: number) => {
    setPopupState((current) => {
      if (!current || current.rollToken !== completedToken || current.resultVisible) {
        return current;
      }

      return {
        ...current,
        resultVisible: true
      };
    });
  }, []);

  useEffect(() => {
    if (!popupState) {
      return;
    }

    if (
      popupState.behavior !== "full_auto" ||
      popupState.resolvedCallbackHandled ||
      !popupState.resultVisible ||
      !popupState.result ||
      popupState.error ||
      !popupState.request.onResolvedResult
    ) {
      return;
    }

    const resolvedResult = createResolvedResult(popupState);

    if (!resolvedResult) {
      return;
    }

    popupState.request.onResolvedResult(resolvedResult);

    setPopupState((current) => {
      if (!current || current.rollToken !== popupState.rollToken) {
        return current;
      }

      return {
        ...current,
        resolvedCallbackHandled: true
      };
    });
  }, [popupState]);

  return {
    popupState,
    openDiceRoller,
    closeDiceRoller,
    diceRollerPopup: (
      <DiceRollerPopup
        state={popupState}
        onClose={closeDiceRoller}
        onRollComplete={revealDiceResult}
      />
    )
  };
}
