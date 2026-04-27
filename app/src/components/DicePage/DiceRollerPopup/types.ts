import type { RollMode, RollResult, RolledDie } from "../../../types";
import type { DiceRollerBehaviorPreference } from "../../../storage/preferences";

export type DiceRollerRequestEntry = {
  label?: string;
  formula: string;
  formulaDisplay?: string;
  derivedResult?: {
    sourceEntryIndex: number;
    totalOffset: number;
    breakdownLabel?: string;
  };
};

export type DiceRollerResolvedRequestEntry = {
  label?: string;
  formula: string;
  formulaDisplay: string;
  derivedResult?: {
    sourceEntryIndex: number;
    totalOffset: number;
    breakdownLabel?: string;
  };
};

export type DiceRollerResolvedEntryResult = {
  label?: string;
  request: DiceRollerResolvedRequestEntry;
  result: RollResult;
  dice: RolledDie[];
};

export type DiceRollerResolvedRequest = {
  title: string;
  description?: string;
  mode: RollMode;
  entries: DiceRollerResolvedRequestEntry[];
  enableNextCriticalHitOnNatural20?: boolean;
  getFullManualToastText?: (resolvedResult: DiceRollerResolvedResult) => string;
};

export type DiceRollerRequestBase = {
  title: string;
  formula?: string;
  formulaDisplay?: string;
  description?: string;
  mode?: RollMode;
  entries?: DiceRollerRequestEntry[];
  enableNextCriticalHitOnNatural20?: boolean;
  getFullManualToastText?: (resolvedResult: DiceRollerResolvedResult) => string;
};

export type DiceRollerResolvedResult = {
  request: DiceRollerResolvedRequest;
  result: RollResult;
  results: DiceRollerResolvedEntryResult[];
  dice: RolledDie[];
  rollToken: number;
};

export type DiceRollerRequest = DiceRollerRequestBase & {
  onResolvedResult?: (resolvedResult: DiceRollerResolvedResult) => void;
};

export type DiceRollerPopupState = {
  request: DiceRollerResolvedRequest;
  onResolvedResult?: (resolvedResult: DiceRollerResolvedResult) => void;
  result: RollResult | null;
  results: DiceRollerResolvedEntryResult[];
  error: string;
  dice: RolledDie[];
  rollToken: number;
  resultVisible: boolean;
  behavior: DiceRollerBehaviorPreference;
  resolvedCallbackHandled: boolean;
};
