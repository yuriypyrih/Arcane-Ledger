import { useMemo } from "react";
import type { Character } from "../../../../../../types";
import { getCharacterRuntime } from "../../../../../../pages/CharactersPage/characterRuntime/characterRuntime";

export function useActionsWidgetActions(character: Character) {
  return useMemo(() => getCharacterRuntime(character).combatSummary.actions, [character]);
}
