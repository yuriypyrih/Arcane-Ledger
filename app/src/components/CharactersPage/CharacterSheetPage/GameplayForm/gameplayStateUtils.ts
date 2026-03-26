import type { Character } from "../../../../types";
import type { HpDraft } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";

export type DeathSaveState = {
  successes: number;
  failures: number;
};

export type MaxHitPointsMode = "automatic" | "custom";

export function createHpDraft(character: Character): HpDraft {
  return {
    hitPoints: character.hitPoints,
    currentHitPoints: character.currentHitPoints
  };
}

export function normalizeMaxHitPointsMode(value: Character["maxHitPointsMode"]): MaxHitPointsMode {
  return value === "automatic" ? "automatic" : "custom";
}

export function createDefaultDeathSaves(): DeathSaveState {
  return {
    successes: 0,
    failures: 0
  };
}

export function normalizeDeathSaves(value: Character["deathSaves"]): DeathSaveState {
  return {
    successes: Math.floor(clampNumber(value?.successes, 0, 3, 0)),
    failures: Math.floor(clampNumber(value?.failures, 0, 3, 0))
  };
}

export function normalizeTemporaryHitPoints(value: unknown): number {
  return Math.floor(clampNumber(value, 0, 999, 0));
}
