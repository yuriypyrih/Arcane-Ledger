import type { DiceSelection } from "../../types";

export function createEmptySelection(): DiceSelection {
  return {
    4: 0,
    6: 0,
    8: 0,
    10: 0,
    12: 0,
    20: 0,
    100: 0
  };
}
