export type RollMode = "normal" | "advantage" | "disadvantage";

export type RollResult = {
  formula: string;
  total: number;
  breakdown: string;
  modeApplied: RollMode;
};

export type D20RollResult = {
  total: number;
  breakdown: string;
  modeApplied: RollMode;
  rawRolls: number[];
};

export type DiceSides = 4 | 6 | 8 | 10 | 12 | 20;

export type DiceSelection = Record<DiceSides, number>;

export type RolledDie = {
  id: string;
  sides: DiceSides;
  value: number;
};

export type DicePoolRollResult = {
  dice: RolledDie[];
  total: number;
  breakdown: string;
};
