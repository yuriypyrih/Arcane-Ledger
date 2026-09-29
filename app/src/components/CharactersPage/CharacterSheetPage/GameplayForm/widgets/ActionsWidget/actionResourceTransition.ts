import type { Character } from "../../../../../../types";
import {
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../../../../../pages/CharactersPage/actionEconomy";
import { consumeRoundTrackerResourceForCharacter } from "../../gameplayStateUtils";
import type { ActionsWidgetSubmissionContext } from "./types";
/** Failed activation is a no-op, including any provisional action-economy preparation. */
export function applyActionResourceTransition(
  character: Character,
  economyType: EconomyType,
  prepare: ActionsWidgetSubmissionContext["prepareCharacterForResourceConsumption"],
  activate: (prepared: Character) => Character
): Character {
  const resource = getRoundTrackerResourceForEconomyType(economyType);
  const prepared = prepare(character, resource);
  const next = activate(prepared);
  if (next === prepared) return character;
  return resource ? consumeRoundTrackerResourceForCharacter(next, resource) : next;
}
