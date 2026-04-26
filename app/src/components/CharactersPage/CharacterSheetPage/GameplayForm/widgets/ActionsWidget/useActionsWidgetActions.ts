import { useMemo } from "react";
import type { Character } from "../../../../../../types";
import {
  getCombatActionsForCharacter,
  type GameplayActionDefinition
} from "../../../../../../pages/CharactersPage/combatActions";
import { normalizeRoundTracker } from "../../../../../../pages/CharactersPage/combat";
import { getCommonActionCards } from "../../../../../../pages/CharactersPage/commonActions";
import { transformCommonActionForCharacter } from "../../../../../../pages/CharactersPage/classFeatures";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomWeaponEntry
} from "../../../../../../pages/CharactersPage/customEquipment";
import { ENTRY_CATEGORIES } from "../../../../../../codex/entries";
import { createCommonActionDefinition } from "./actionHelpers";

export function useActionsWidgetActions(character: Character) {
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const combatActions = useMemo(() => getCombatActionsForCharacter(character), [character]);
  const commonActionCards = useMemo(
    () => getCommonActionCards().map((action) => transformCommonActionForCharacter(character, action)),
    [character]
  );
  const commonActions = useMemo(
    () => commonActionCards.map((action) => createCommonActionDefinition(action)),
    [commonActionCards]
  );
  const selectableActions = useMemo<GameplayActionDefinition[]>(
    () => [...combatActions, ...commonActions],
    [combatActions, commonActions]
  );
  const customWeaponEntriesById = useMemo(
    () =>
      new Map(
        getResolvedCustomLoadoutEntries(character.customEquipment)
          .filter(
            (entry): entry is ResolvedCustomWeaponEntry =>
              entry.category === ENTRY_CATEGORIES.WEAPONS
          )
          .map((entry) => [entry.customEquipmentId, entry])
      ),
    [character.customEquipment]
  );

  return {
    roundTracker,
    combatActions,
    commonActionCards,
    commonActions,
    selectableActions,
    customWeaponEntriesById
  };
}
