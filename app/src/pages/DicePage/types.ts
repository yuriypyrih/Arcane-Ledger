import type { RolledDie } from "../../types";

export type RollRecord = {
  id: number;
  total: number;
  breakdown: string;
  dice: RolledDie[];
};

export type ResultPopup = {
  rollToken: number;
  total: number;
  breakdown: string;
};
