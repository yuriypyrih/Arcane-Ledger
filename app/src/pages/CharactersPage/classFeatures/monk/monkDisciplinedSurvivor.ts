import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { expendMonkFocusPoint, getMonkFocusPointsRemaining, hasMonkFeature } from "./monk";

const disciplinedSurvivorFocusCost = 1;

type MonkDisciplinedSurvivorCharacter = Pick<Character, "className" | "level" | "classFeatureState">;

export type MonkDisciplinedSurvivorOptionState = {
  focusPointCost: number;
  disabled: boolean;
  disabledReason?: string;
};

export function getMonkDisciplinedSurvivorOptionState(
  character: MonkDisciplinedSurvivorCharacter
): MonkDisciplinedSurvivorOptionState | null {
  if (!hasMonkFeature(character, CLASS_FEATURE.DISCIPLINED_SURVIVOR)) {
    return null;
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const disabledReason =
    focusPointsRemaining < disciplinedSurvivorFocusCost ? "No Focus Points remaining." : undefined;

  return {
    focusPointCost: disciplinedSurvivorFocusCost,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function consumeMonkDisciplinedSurvivor(character: Character): Character {
  const optionState = getMonkDisciplinedSurvivorOptionState(character);

  if (!optionState || optionState.disabled) {
    return character;
  }

  return expendMonkFocusPoint(character);
}
