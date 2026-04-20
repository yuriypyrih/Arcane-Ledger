import type { RollMode, RollResult, RolledDie } from "../../../types";
import type { DiceRollerBehaviorPreference } from "../../../storage/preferences";

export type DiceRollerRequestBase = {
  title: string;
  formula: string;
  formulaDisplay?: string;
  description?: string;
  mode?: RollMode;
};

export type DiceRollerResolvedResult = {
  request: DiceRollerRequestBase;
  result: RollResult;
  dice: RolledDie[];
  rollToken: number;
};

export type DiceRollerRequest = DiceRollerRequestBase & {
  onResolvedResult?: (resolvedResult: DiceRollerResolvedResult) => void;
};

export type DiceRollerPopupState = {
  request: DiceRollerRequest;
  result: RollResult | null;
  error: string;
  dice: RolledDie[];
  rollToken: number;
  resultVisible: boolean;
  behavior: DiceRollerBehaviorPreference;
  resolvedCallbackHandled: boolean;
};
