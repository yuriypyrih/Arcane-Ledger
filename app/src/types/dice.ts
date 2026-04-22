export type RollMode = "normal" | "advantage" | "disadvantage";

export type DieTheme = "default" | "advantage" | "disadvantage";

export type NaturalOutcome = "natural20" | "natural1" | null;

export type RollResult = {
  formula: string;
  total: number;
  breakdown: string;
  modeApplied: RollMode;
  naturalOutcome: NaturalOutcome;
};

export type D20RollResult = {
  total: number;
  breakdown: string;
  modeApplied: RollMode;
  rawRolls: number[];
  naturalOutcome: NaturalOutcome;
};

export type DiceSides = 4 | 6 | 8 | 10 | 12 | 20;

export type DiceSelection = Record<DiceSides, number>;

export type RolledDie = {
  id: string;
  sides: DiceSides;
  value: number;
  counted?: boolean;
  theme?: DieTheme;
  naturalOutcome?: Exclude<NaturalOutcome, null>;
};

export type DicePoolRollResult = {
  dice: RolledDie[];
  total: number;
  breakdown: string;
};
