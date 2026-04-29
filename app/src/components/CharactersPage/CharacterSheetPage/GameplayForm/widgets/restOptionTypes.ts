import type { Character } from "../../../../../types";

export type RestType = "short" | "long";

export type RestOption = {
  id: string;
  label: string;
  detail?: string;
  charges?: {
    current: number;
    total: number;
  };
  defaultSelected?: boolean;
  disabled?: boolean;
  emphasis?: "default" | "feature";
  apply: (character: Character) => Character;
};
