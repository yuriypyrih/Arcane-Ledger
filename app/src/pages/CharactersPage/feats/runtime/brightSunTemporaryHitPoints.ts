import type { Character } from "../../../../types";
import { swapSystemTemporaryHitPointsAssignmentForCharacter } from "./bountifulHealth";
import {
  boonOfBrightSunDaylightPresenceTemporaryHitPoints,
  boonOfBrightSunDaylightPresenceTemporaryHitPointsSource,
  hasActiveBoonOfBrightSunDaylightPresenceStatus
} from "./brightSun";

export function applyBoonOfBrightSunDaylightPresenceTurnStartTemporaryHitPointsForCharacter(
  character: Character
): Character {
  if (!hasActiveBoonOfBrightSunDaylightPresenceStatus(character.statusEntries)) {
    return character;
  }

  const nextTemporaryHitPointsAssignment = swapSystemTemporaryHitPointsAssignmentForCharacter(
    character,
    boonOfBrightSunDaylightPresenceTemporaryHitPoints,
    boonOfBrightSunDaylightPresenceTemporaryHitPointsSource
  );

  if (
    nextTemporaryHitPointsAssignment.temporaryHitPoints === character.temporaryHitPoints &&
    nextTemporaryHitPointsAssignment.temporaryHitPointsSource ===
      character.temporaryHitPointsSource
  ) {
    return character;
  }

  return {
    ...character,
    ...nextTemporaryHitPointsAssignment
  };
}
