import { createCommonActionDefinition } from "../commonActionDefinition";
export {
  createCommonActionDefinition,
  getFeatureActionDrawerPrimaryLabel
} from "../commonActionDefinition";
import { ENTRY_CATEGORIES } from "../../../codex/entries/enums";
import type { Character } from "../../../types";

import { normalizeRoundTracker } from "../combat";
import { getCombatActionsForCharacter, type GameplayActionDefinition } from "../combatActions";
import { getCommonActionCards } from "../commonActions";
import { transformCommonActionForCharacter, type FeatureActionCard } from "../classFeatures";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomWeaponEntry
} from "../customEquipment";
import { transformSpeciesCommonActionForCharacter } from "../species";
import { getExpeditiousRetreatCommonActionForCharacter } from "./spellImplementations";

export type CharacterCombatSummaryActions = {
  roundTracker: ReturnType<typeof normalizeRoundTracker>;
  combatActions: GameplayActionDefinition[];
  commonActionCards: FeatureActionCard[];
  commonActions: GameplayActionDefinition[];
  selectableActions: GameplayActionDefinition[];
  customWeaponEntriesById: Map<string, ResolvedCustomWeaponEntry>;
};

export function createCombatSummaryActions(character: Character): CharacterCombatSummaryActions {
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const combatActions = getCombatActionsForCharacter(character);
  const commonActionCards = getCommonActionCards().map((action) =>
    getExpeditiousRetreatCommonActionForCharacter(
      character,
      transformSpeciesCommonActionForCharacter(
        character,
        transformCommonActionForCharacter(character, action)
      )
    )
  );
  const commonActions = commonActionCards.map((action) => createCommonActionDefinition(action));
  const selectableActions = [...combatActions, ...commonActions];
  const customWeaponEntriesById = new Map(
    getResolvedCustomLoadoutEntries(character.customEquipment)
      .filter(
        (entry): entry is ResolvedCustomWeaponEntry => entry.category === ENTRY_CATEGORIES.WEAPONS
      )
      .map((entry) => [entry.customEquipmentId, entry])
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
