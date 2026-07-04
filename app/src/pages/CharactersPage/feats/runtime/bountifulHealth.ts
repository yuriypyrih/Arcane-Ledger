import type { Character } from "../../../../types";
import {
  normalizeTemporaryHitPoints,
  swapTemporaryHitPointsAssignment,
  type TemporaryHitPointsAssignment
} from "../../shared";
import { FEATS } from "../../../../codex/entries";
import { hasFeatForCharacter } from "./state";
import type { FeatRuntimeCharacter } from "./types";

export const boonOfBountifulHealthTemporaryHitPointsBonus = 5;

type TemporaryHitPointsGrantCharacter = Pick<
  Character,
  "temporaryHitPoints" | "temporaryHitPointsSource"
> &
  FeatRuntimeCharacter;

export function hasBoonOfBountifulHealthForCharacter(
  character: FeatRuntimeCharacter
): boolean {
  return hasFeatForCharacter(character, FEATS.BOON_OF_BOUNTIFUL_HEALTH);
}

export function applyBoonOfBountifulHealthTemporaryHitPointsBonus(
  character: FeatRuntimeCharacter,
  grantedValue: unknown
): number {
  const normalizedGrantedValue = normalizeTemporaryHitPoints(grantedValue);

  if (normalizedGrantedValue <= 0 || !hasBoonOfBountifulHealthForCharacter(character)) {
    return normalizedGrantedValue;
  }

  return normalizeTemporaryHitPoints(
    normalizedGrantedValue + boonOfBountifulHealthTemporaryHitPointsBonus
  );
}

export function swapSystemTemporaryHitPointsAssignmentForCharacter(
  character: TemporaryHitPointsGrantCharacter,
  grantedValue: unknown,
  grantedSource?: unknown
): TemporaryHitPointsAssignment {
  return swapTemporaryHitPointsAssignment(
    character.temporaryHitPoints,
    character.temporaryHitPointsSource,
    applyBoonOfBountifulHealthTemporaryHitPointsBonus(character, grantedValue),
    grantedSource
  );
}
