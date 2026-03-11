import type { RollMode, RollResult, RolledDie } from "../../../types";

export type DiceRollerRequest = {
  title: string;
  formula: string;
  description?: string;
  mode?: RollMode;
};

export type DiceRollerPopupState = {
  request: DiceRollerRequest;
  result: RollResult | null;
  error: string;
  dice: RolledDie[];
  rollToken: number;
  resultVisible: boolean;
};
