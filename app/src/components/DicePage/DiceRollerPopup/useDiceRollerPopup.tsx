import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDiceRollerBehaviorPreference,
  type DiceRollerBehaviorPreference
} from "../../../storage/preferences";
import {
  clearNextRollOverrides,
  setNextRollCriticalHitOverride,
  showToast,
  store,
  useAppDispatch
} from "../../../store";
import { formatRollResultTotal, rollFormulaWithDice } from "../../../utils/dice";
import type { RollMode, RollResult, RolledDie } from "../../../types";
import DiceRollerPopup from "./DiceRollerPopup";
import type {
  DiceRollerPopupState,
  DiceRollerRequest,
  DiceRollerResolvedEntryResult,
  DiceRollerResolvedRequest,
  DiceRollerResolvedResult
} from "./types";

function normalizeRequest(
  request: DiceRollerRequest,
  modeOverride?: RollMode | null
): DiceRollerResolvedRequest {
  const mode = modeOverride ?? request.mode ?? "normal";
  const entries =
    request.entries && request.entries.length > 0
      ? request.entries
      : request.formula
        ? [
            {
              formula: request.formula,
              formulaDisplay: request.formulaDisplay
            }
          ]
        : [];

  if (entries.length === 0) {
    throw new Error("No dice formula available for this roll.");
  }

  return {
    title: request.title,
    description: request.description,
    mode,
    enableNextCriticalHitOnNatural20: request.enableNextCriticalHitOnNatural20,
    getFullManualToastText: request.getFullManualToastText,
    entries: entries.map((entry) => ({
      label: entry.label,
      formula: entry.formula,
      formulaDisplay: entry.formulaDisplay ?? entry.formula,
      derivedResult: entry.derivedResult,
      minimumTotal: entry.minimumTotal,
      minimumLabel: entry.minimumLabel
    }))
  };
}

function prefixDiceIds(dice: RolledDie[], prefix: string): RolledDie[] {
  return dice.map((die, index) => ({
    ...die,
    id: `${prefix}-${index}-${die.id}`
  }));
}

function formatDerivedResultBreakdown(
  source: DiceRollerResolvedEntryResult,
  totalOffset: number,
  breakdownLabel?: string
): string {
  const label = breakdownLabel ?? source.label?.trim() ?? "Roll";
  const offsetText =
    totalOffset >= 0 ? `+ ${totalOffset}` : `- ${Math.abs(totalOffset)}`;

  return `${source.result.total} ${label} ${offsetText}`;
}

function createEntryResult(
  request: DiceRollerResolvedRequest,
  entryIndex: number,
  previousResults: DiceRollerResolvedEntryResult[]
): DiceRollerResolvedEntryResult {
  const entry = request.entries[entryIndex]!;
  const applyMinimumTotal = (result: RollResult): RollResult => {
    const minimumTotal = entry.minimumTotal;

    if (
      typeof minimumTotal !== "number" ||
      !Number.isFinite(minimumTotal) ||
      result.total >= minimumTotal
    ) {
      return result;
    }

    const minimumLabel = entry.minimumLabel?.trim() || `minimum ${minimumTotal}`;

    return {
      ...result,
      total: minimumTotal,
      breakdown: `${result.breakdown}; ${minimumLabel} -> ${minimumTotal}`
    };
  };

  if (entry.derivedResult) {
    const source = previousResults[entry.derivedResult.sourceEntryIndex];

    if (!source) {
      throw new Error("Derived dice result source is not available.");
    }

    return {
      label: entry.label,
      request: entry,
      result: applyMinimumTotal({
        formula: entry.formula,
        total: source.result.total + entry.derivedResult.totalOffset,
        breakdown: formatDerivedResultBreakdown(
          source,
          entry.derivedResult.totalOffset,
          entry.derivedResult.breakdownLabel
        ),
        modeApplied: "normal",
        naturalOutcome: null
      }),
      dice: []
    };
  }

  const { dice, ...result } = rollFormulaWithDice(entry.formula, request.mode);

  return {
    label: entry.label,
    request: entry,
    result: applyMinimumTotal(result),
    dice: prefixDiceIds(dice, `entry-${entryIndex}`)
  };
}

function createResolvedResult(state: DiceRollerPopupState): DiceRollerResolvedResult | null {
  if (!state.result || state.results.length === 0) {
    return null;
  }

  return {
    request: state.request,
    result: state.result,
    results: state.results,
    dice: state.dice,
    rollToken: state.rollToken
  };
}

function createDefaultToastText(resolvedResult: DiceRollerResolvedResult): string {
  if (resolvedResult.results.length <= 1) {
    return `Action Used: Rolled ${formatRollResultTotal(resolvedResult.result)}`;
  }

  const labels = resolvedResult.results.map((entry) => {
    const label = entry.label?.trim() || "Roll";
    return `${label} ${formatRollResultTotal(entry.result)}`;
  });

  return `Action Used: ${labels.join(" | ")}`;
}

function createPopupState(
  request: DiceRollerRequest,
  rollToken: number,
  behavior: DiceRollerBehaviorPreference,
  modeOverride?: RollMode | null
): DiceRollerPopupState {
  try {
    const normalizedRequest = normalizeRequest(request, modeOverride);
    const results = normalizedRequest.entries.reduce<DiceRollerResolvedEntryResult[]>(
      (resolvedResults, _, index) => [
        ...resolvedResults,
        createEntryResult(normalizedRequest, index, resolvedResults)
      ],
      []
    );
    const primaryResult = results[0]?.result ?? null;
    const dice = results.flatMap((entry) => entry.dice);

    return {
      request: normalizedRequest,
      onResolvedResult: request.onResolvedResult,
      result: primaryResult,
      results,
      error: "",
      dice,
      rollToken,
      resultVisible: dice.length === 0,
      behavior,
      resolvedCallbackHandled: false
    };
  } catch (rollError) {
    const fallbackRequest: DiceRollerResolvedRequest = {
      title: request.title,
      description: request.description,
      mode: modeOverride ?? request.mode ?? "normal",
      enableNextCriticalHitOnNatural20: request.enableNextCriticalHitOnNatural20,
      getFullManualToastText: request.getFullManualToastText,
      entries: []
    };

    return {
      request: fallbackRequest,
      onResolvedResult: request.onResolvedResult,
      result: null,
      results: [],
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
      const { nextRollCriticalHitOverride, nextRollModeOverride } = store.getState().diceRoller;
      const effectiveMode = nextRollModeOverride ?? request.mode ?? "normal";

      if (nextRollModeOverride !== null || nextRollCriticalHitOverride) {
        dispatch(clearNextRollOverrides());
      }

      const nextPopupState = createPopupState(request, rollToken, behavior, effectiveMode);

      if (behavior === "full_manual") {
        const resolvedResult = createResolvedResult(nextPopupState);

        if (resolvedResult) {
          dispatch(
            showToast({
              text:
                nextPopupState.request.getFullManualToastText?.(resolvedResult) ??
                createDefaultToastText(resolvedResult),
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
    if (
      !popupState ||
      popupState.behavior !== "full_auto" ||
      popupState.resolvedCallbackHandled ||
      !popupState.resultVisible ||
      !popupState.result ||
      popupState.error
    ) {
      return;
    }

    const resolvedResult = createResolvedResult(popupState);

    if (!resolvedResult) {
      return;
    }

    if (
      popupState.request.enableNextCriticalHitOnNatural20 &&
      resolvedResult.result.naturalOutcome === "natural20"
    ) {
      dispatch(setNextRollCriticalHitOverride());
    }

    popupState.onResolvedResult?.(resolvedResult);

    setPopupState((current) => {
      if (!current || current.rollToken !== popupState.rollToken) {
        return current;
      }

      return {
        ...current,
        resolvedCallbackHandled: true
      };
    });
  }, [dispatch, popupState]);

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
