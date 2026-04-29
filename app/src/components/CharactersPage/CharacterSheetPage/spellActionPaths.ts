import type { SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../../pages/CharactersPage/actionEconomy";
import {
  createEconomyMultiContextForSpell,
  getEconomyTypeForSpell,
  getSharedEconomyMultiCountForCharacterAction
} from "../../../pages/CharactersPage/classFeatures/economyMulti";
import { canUsePaladinOathOfTheAncientsElderChampionBonusActionPathForSpell } from "../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheAncients";
import { canUseRogueArcaneTricksterMageHandLegerdemainBonusActionPathForSpell } from "../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueArcaneTrickster";
import { canUseWizardAbjurerSpellBreakerBonusActionPathForSpell } from "../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardAbjurer";
import type { RoundTrackerResource } from "../../../pages/CharactersPage/combat";
import { getEconomyShapeState } from "./GameplayForm/gameplayWidgetUtils";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

export type SpellActionPathState = {
  id: "primary" | "secondary";
  economyType: EconomyType;
  roundTrackerResource: RoundTrackerResource | null;
  shapeState: ReturnType<typeof getEconomyShapeState>;
};

function createSpellActionPathState(
  character: Character,
  roundTracker: RoundTrackerAvailability,
  id: SpellActionPathState["id"],
  economyType: EconomyType,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): SpellActionPathState {
  const sharedEconomyMultiCount =
    economyType === getEconomyTypeForSpell(spell)
      ? getSharedEconomyMultiCountForCharacterAction(
          character,
          createEconomyMultiContextForSpell(spell)
        )
      : getSharedEconomyMultiCountForCharacterAction(character, {
          economyType,
          actionCategory: ACTION_CATEGORY.MAGIC,
          spellLevel: spell.spellLevel
        });

  return {
    id,
    economyType,
    roundTrackerResource: getRoundTrackerResourceForEconomyType(economyType),
    shapeState: getEconomyShapeState(economyType, roundTracker, sharedEconomyMultiCount)
  };
}

export function getSpellActionPathStates(
  character: Character,
  spell: Pick<SpellEntry, "id" | "castingTime" | "spellLevel">,
  roundTracker: RoundTrackerAvailability
): SpellActionPathState[] {
  const primaryEconomyType = getEconomyTypeForSpell(spell);
  const actionPaths = [
    createSpellActionPathState(character, roundTracker, "primary", primaryEconomyType, spell)
  ];

  if (
    primaryEconomyType === ECONOMY_TYPE.ACTION &&
    (canUsePaladinOathOfTheAncientsElderChampionBonusActionPathForSpell(character, spell) ||
      canUseRogueArcaneTricksterMageHandLegerdemainBonusActionPathForSpell(character, spell) ||
      canUseWizardAbjurerSpellBreakerBonusActionPathForSpell(character, spell))
  ) {
    actionPaths.push(
      createSpellActionPathState(
        character,
        roundTracker,
        "secondary",
        ECONOMY_TYPE.BONUS_ACTION,
        spell
      )
    );
  }

  return actionPaths;
}

export function getSpellActionPathWarning(actionPaths: SpellActionPathState[]): string | null {
  if (actionPaths.length === 0) {
    return null;
  }

  const disabledReasons = actionPaths
    .map((path) => path.shapeState.disabledReason)
    .filter((reason): reason is string => reason !== null);

  if (actionPaths.some((path) => path.shapeState.isUsable)) {
    return actionPaths.length === 1 ? (disabledReasons[0] ?? null) : null;
  }

  return disabledReasons.length > 0 ? [...new Set(disabledReasons)].join(". ") : null;
}
