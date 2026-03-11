import { useCallback, useState } from "react";
import { rollFormulaWithDice } from "../../../utils/dice";
import DiceRollerPopup from "./DiceRollerPopup";
import type { DiceRollerPopupState, DiceRollerRequest } from "./types";

function createPopupState(request: DiceRollerRequest, rollToken: number): DiceRollerPopupState {
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
      resultVisible: rollResult.dice.length === 0
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
      resultVisible: true
    };
  }
}

export function useDiceRollerPopup() {
  const [popupState, setPopupState] = useState<DiceRollerPopupState | null>(null);

  const openDiceRoller = useCallback((request: DiceRollerRequest) => {
    setPopupState((current) => createPopupState(request, (current?.rollToken ?? 0) + 1));
  }, []);

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
