import type { SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import {
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../../pages/CharactersPage/actionEconomy";
import {
  createEconomyMultiContextForSpell,
  getEconomyTypeForSpell,
  resolveEconomyPaymentForCharacterAction
} from "../../../pages/CharactersPage/classFeatures/economyMulti";
import type { FeatureActionCardUsage } from "../../../pages/CharactersPage/classFeatures";
import { canUsePaladinOathOfTheAncientsElderChampionBonusActionPathForSpell } from "../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheAncients";
import { canUseRogueArcaneTricksterMageHandLegerdemainBonusActionPathForSpell } from "../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueArcaneTrickster";
import { canUseWizardAbjurerSpellBreakerBonusActionPathForSpell } from "../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardAbjurer";
import {
  hasMysticArtsFlurrySpellPath,
  mysticArtsFlurrySpellPathId
} from "../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheMysticArts";
import { getFeatSpellActionPathContributionsForCharacter } from "../../../pages/CharactersPage/feats/runtime";
import { getSpeciesSpellActionPathContributionsForCharacter } from "../../../pages/CharactersPage/species";
import type { RoundTrackerResource } from "../../../pages/CharactersPage/combat";
import type {
  SpellImplementationCastSource,
  SpellImplementationOptionValues
} from "../../../pages/CharactersPage/characterRuntime/spellImplementations";
import { getEconomyShapeState } from "./GameplayForm/gameplayWidgetUtils";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

export type SpellActionPathState = {
  id: string;
  economyType: EconomyType;
  roundTrackerResource: RoundTrackerResource | null;
  shapeState: ReturnType<typeof getEconomyShapeState>;
  actionLabel?: string;
  disabledReason?: string | null;
  usage?: FeatureActionCardUsage;
  spellImplementationCastSource?: SpellImplementationCastSource;
  forcedSpellImplementationOptions?: SpellImplementationOptionValues;
  spellCastEffectIds?: string[];
};

function createSpellActionPathState(
  character: Character,
  roundTracker: RoundTrackerAvailability,
  id: SpellActionPathState["id"],
  economyType: EconomyType,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): SpellActionPathState {
  const resolution = resolveEconomyPaymentForCharacterAction(
    character,
    createEconomyMultiContextForSpell(spell, { id, economyType })
  );
  return {
    id,
    economyType,
    roundTrackerResource: getRoundTrackerResourceForEconomyType(economyType),
    shapeState: {
      ...getEconomyShapeState(economyType, roundTracker, resolution.multiCount),
      isAvailable: resolution.isAvailable,
      isUsable: resolution.payment !== null
    }
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

  if (hasMysticArtsFlurrySpellPath(character, spell)) {
    const path = createSpellActionPathState(
      character,
      roundTracker,
      mysticArtsFlurrySpellPathId,
      ECONOMY_TYPE.BONUS_ACTION,
      spell
    );
    path.shapeState.disabledReason = path.shapeState.isUsable
      ? null
      : "Requires two remaining Flurry of Blows Unarmed Strikes.";
    actionPaths.push(path);
  }

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

  [
    ...getFeatSpellActionPathContributionsForCharacter(character, spell),
    ...getSpeciesSpellActionPathContributionsForCharacter(character, spell)
  ].forEach((contribution) => {
    if (primaryEconomyType !== ECONOMY_TYPE.ACTION) {
      return;
    }

    const pathContext = {
      character,
      spell
    };

    actionPaths.push({
      ...createSpellActionPathState(
        character,
        roundTracker,
        contribution.id,
        contribution.economyType,
        spell
      ),
      actionLabel: contribution.actionLabel,
      disabledReason: contribution.getDisabledReason?.(pathContext) ?? null,
      usage: contribution.getUsage?.(pathContext),
      spellImplementationCastSource: contribution.spellImplementationCastSource,
      forcedSpellImplementationOptions: contribution.forcedSpellImplementationOptions,
      spellCastEffectIds: contribution.spellCastEffectIds
    });
  });

  return actionPaths;
}

export function getSpellActionPathWarning(actionPaths: SpellActionPathState[]): string | null {
  if (actionPaths.length === 0) {
    return null;
  }

  const disabledReasons = actionPaths
    .map((path) => path.disabledReason ?? path.shapeState.disabledReason)
    .filter((reason): reason is string => reason !== null);

  if (actionPaths.some((path) => path.shapeState.isUsable)) {
    return actionPaths.length === 1 ? (disabledReasons[0] ?? null) : null;
  }

  return disabledReasons.length > 0 ? [...new Set(disabledReasons)].join(". ") : null;
}
