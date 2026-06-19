import { ENTRY_CATEGORIES } from "../../../codex/entries";
import type { Character } from "../../../types";
import { resolveActionCardTheme } from "../actionCardTheme";
import { normalizeRoundTracker } from "../combat";
import {
  getCombatActionsForCharacter,
  type GameplayActionDefinition
} from "../combatActions";
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

export function getFeatureActionDrawerPrimaryLabel(
  action: Pick<FeatureActionCard, "name">
): string {
  const normalizedName = action.name.trim();

  return normalizedName ? `Use ${normalizedName}` : "Use";
}

export function createCommonActionDefinition(action: FeatureActionCard): GameplayActionDefinition {
  const preparedAction: FeatureActionCard = {
    ...action,
    cardTheme: resolveActionCardTheme(action)
  };

  return {
    kind: "feature",
    key: preparedAction.key,
    name: preparedAction.name,
    cardTheme: preparedAction.cardTheme,
    economyType: preparedAction.economyType,
    actionCategory: preparedAction.actionCategory,
    economyMultiCount: preparedAction.economyMultiCount,
    disabled: preparedAction.disabled,
    disabledReason: preparedAction.disabledReason,
    action: preparedAction,
    execute: {
      kind: "activate"
    },
    drawer: {
      kind: "confirm",
      eyebrow: "Common Action",
      description: preparedAction.description ?? [],
      descriptionAdditions: preparedAction.descriptionAdditions ?? [],
      helperText: preparedAction.drawer?.helperText,
      helperTextTone: preparedAction.drawer?.helperTextTone,
      blockedReason: preparedAction.drawer?.blockedReason,
      facts: preparedAction.drawer?.facts ?? preparedAction.facts ?? [],
      factsSectionTitle: preparedAction.drawer?.factsSectionTitle,
      headerTags: preparedAction.drawer?.headerTags ?? preparedAction.headerTags ?? [],
      confirmLabel:
        preparedAction.drawer?.confirmLabel ?? getFeatureActionDrawerPrimaryLabel(preparedAction)
    }
  };
}

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
        (entry): entry is ResolvedCustomWeaponEntry =>
          entry.category === ENTRY_CATEGORIES.WEAPONS
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
