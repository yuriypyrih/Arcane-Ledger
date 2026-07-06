import {
  FEATS,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import {
  CONDITION_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterStatusEntry
} from "../../../../types";
import type { CharacterFeatEntry } from "../../../../types";
import type { FeatureActionCard, FeatureSpeedBonus } from "../../classFeatures/types";
import {
  createBoonOfFateImproveFateAction,
  createBoonOfRecoveryRecoverVitalityAction
} from "./actions";
import {
  createBoonOfBrightSunDaylightPresenceAction,
  getBoonOfBrightSunDaylightPresenceDescription
} from "./brightSun";
import {
  createBoonOfFluidFormsShapechangerAction,
  isBoonOfFluidFormsShapechangerDrawerDescriptionEntry
} from "./fluidForms";
import {
  boonOfEnergyResistanceReactionEntryId,
  boonOfNightSpiritStatusSourceId,
  boonOfSoulDrinkerSiphonLifeReactionEntryId,
  boonOfTerrorFearlessStatusSourceIdPrefix,
  boonOfTerrorFleeFoolsReactionEntryId
} from "./constants";
import {
  filterDescriptionEntries,
  isBoonOfBrightSunDaylightPresenceDescriptionEntry,
  isBoonOfEnergyResistanceEnergyRedirectionDescriptionEntry,
  isBoonOfFateImproveFateDescriptionEntry,
  isBoonOfNightSpiritDescriptionEntry,
  isBoonOfRecoveryRecoverVitalityDescriptionEntry,
  isBoonOfTerrorFearlessDescriptionEntry,
  isBoonOfTerrorFleeFoolsDescriptionEntry
} from "./descriptionMatchers";
import { isBoonOfSoulDrinkerSiphonLifeDescriptionEntry } from "./soulDrinker";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

type FeatDescriptionGetter = (feat: FEATS) => SpellDescriptionEntry[];
type FeatDescriptionSliceGetter = (
  feat: FEATS,
  predicate: (entry: string) => boolean
) => SpellDescriptionEntry[];

export type EpicBoonFeatResourceState = {
  hasBoonOfFate: boolean;
  hasBoonOfFluidForms: boolean;
  hasBoonOfRecovery: boolean;
  hasBoonOfSoulDrinker: boolean;
  hasBoonOfSpellRecall: boolean;
  hasBoonOfTerror: boolean;
  boonOfFateImproveFateRemaining: number;
  boonOfFateImproveFateTotal: number;
  boonOfFluidFormsShapechangerRemaining: number;
  boonOfFluidFormsShapechangerTotal: number;
  boonOfRecoveryDiceRemaining: number;
  boonOfRecoveryDiceTotal: number;
  boonOfRecoveryLastStandRemaining: number;
  boonOfRecoveryLastStandTotal: number;
  boonOfSoulDrinkerSiphonLifeRemaining: number;
  boonOfSoulDrinkerSiphonLifeTotal: number;
  boonOfTerrorFleeFoolsRemaining: number;
  boonOfTerrorFleeFoolsTotal: number;
};

export function getEpicBoonFeatResourceState(
  normalizedFeats: CharacterFeatEntry[],
  featSet: ReadonlySet<FEATS>
): EpicBoonFeatResourceState {
  const boonOfFateImproveFateTotal = featSet.has(FEATS.BOON_OF_FATE) ? 1 : 0;
  const boonOfFateImproveFateExpended = normalizedFeats.some(
    (entry) =>
      entry.feat === FEATS.BOON_OF_FATE && entry.boonOfFate?.improveFateExpended === true
  );
  const boonOfFluidFormsShapechangerTotal = featSet.has(FEATS.BOON_OF_FLUID_FORMS) ? 1 : 0;
  const boonOfFluidFormsShapechangerExpended = normalizedFeats.some(
    (entry) =>
      entry.feat === FEATS.BOON_OF_FLUID_FORMS &&
      entry.boonOfFluidForms?.shapechangerExpended === true
  );
  const boonOfRecoveryDiceTotal = featSet.has(FEATS.BOON_OF_RECOVERY) ? 10 : 0;
  const boonOfRecoveryLastStandTotal = featSet.has(FEATS.BOON_OF_RECOVERY) ? 1 : 0;
  const boonOfRecoveryDiceExpended = Math.max(
    0,
    Math.min(
      boonOfRecoveryDiceTotal,
      normalizedFeats.reduce(
        (total, entry) =>
          entry.feat === FEATS.BOON_OF_RECOVERY
            ? total + (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0)
            : total,
        0
      )
    )
  );
  const boonOfRecoveryLastStandExpended = normalizedFeats.some(
    (entry) =>
      entry.feat === FEATS.BOON_OF_RECOVERY &&
      entry.boonOfRecovery?.lastStandExpended === true
  );
  const boonOfTerrorFleeFoolsTotal = featSet.has(FEATS.BOON_OF_TERROR) ? 1 : 0;
  const boonOfTerrorFleeFoolsExpended = normalizedFeats.some(
    (entry) =>
      entry.feat === FEATS.BOON_OF_TERROR && entry.boonOfTerror?.fleeFoolsExpended === true
  );
  const boonOfSoulDrinkerSiphonLifeTotal = featSet.has(FEATS.BOON_OF_SOUL_DRINKER) ? 1 : 0;
  const boonOfSoulDrinkerSiphonLifeExpended = normalizedFeats.some(
    (entry) =>
      entry.feat === FEATS.BOON_OF_SOUL_DRINKER &&
      entry.boonOfSoulDrinker?.siphonLifeExpended === true
  );

  return {
    hasBoonOfFate: featSet.has(FEATS.BOON_OF_FATE),
    hasBoonOfFluidForms: featSet.has(FEATS.BOON_OF_FLUID_FORMS),
    hasBoonOfRecovery: featSet.has(FEATS.BOON_OF_RECOVERY),
    hasBoonOfSoulDrinker: featSet.has(FEATS.BOON_OF_SOUL_DRINKER),
    hasBoonOfSpellRecall: featSet.has(FEATS.BOON_OF_SPELL_RECALL),
    hasBoonOfTerror: featSet.has(FEATS.BOON_OF_TERROR),
    boonOfFateImproveFateRemaining:
      boonOfFateImproveFateTotal > 0 && !boonOfFateImproveFateExpended ? 1 : 0,
    boonOfFateImproveFateTotal,
    boonOfFluidFormsShapechangerRemaining:
      boonOfFluidFormsShapechangerTotal > 0 && !boonOfFluidFormsShapechangerExpended ? 1 : 0,
    boonOfFluidFormsShapechangerTotal,
    boonOfRecoveryDiceRemaining: Math.max(
      0,
      boonOfRecoveryDiceTotal - boonOfRecoveryDiceExpended
    ),
    boonOfRecoveryDiceTotal,
    boonOfRecoveryLastStandRemaining:
      boonOfRecoveryLastStandTotal > 0 && !boonOfRecoveryLastStandExpended ? 1 : 0,
    boonOfRecoveryLastStandTotal,
    boonOfSoulDrinkerSiphonLifeRemaining:
      boonOfSoulDrinkerSiphonLifeTotal > 0 && !boonOfSoulDrinkerSiphonLifeExpended ? 1 : 0,
    boonOfSoulDrinkerSiphonLifeTotal,
    boonOfTerrorFleeFoolsRemaining:
      boonOfTerrorFleeFoolsTotal > 0 && !boonOfTerrorFleeFoolsExpended ? 1 : 0,
    boonOfTerrorFleeFoolsTotal
  };
}

export function getEpicBoonFeatHitPointMaximumBonus(featSet: ReadonlySet<FEATS>): number {
  return featSet.has(FEATS.BOON_OF_FORTITUDE) ? 40 : 0;
}

export function getEpicBoonFeatSpeedBonuses(
  featSet: ReadonlySet<FEATS>
): FeatureSpeedBonus[] {
  if (!featSet.has(FEATS.BOON_OF_SPEED)) {
    return [];
  }

  return [
    {
      label: "Boon of Speed: Quickness",
      movementType: "walk",
      value: 30
    }
  ];
}

export function getEpicBoonDerivedStatusEntries(
  normalizedFeats: CharacterFeatEntry[],
  getFeatDescription: FeatDescriptionGetter
): CharacterStatusEntry[] {
  return normalizedFeats.flatMap((entry, index): CharacterStatusEntry[] => {
    if (entry.feat === FEATS.BOON_OF_THE_NIGHT_SPIRIT) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_THE_NIGHT_SPIRIT),
        isBoonOfNightSpiritDescriptionEntry
      );

      return [
        {
          id: `${boonOfNightSpiritStatusSourceId}-${entry.id}`,
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Night Spirit",
          source: "Boon of the Night Spirit",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
          duration: {
            kind: STATUS_DURATION_KIND.INFINITE
          },
          sourceId: boonOfNightSpiritStatusSourceId,
          description: description.join("\n")
        } satisfies CharacterStatusEntry
      ];
    }

    if (entry.feat === FEATS.BOON_OF_TRUESIGHT) {
      return [
        {
          id: `feat-boon-of-truesight-${index}`,
          group: STATUS_ENTRY_GROUP.SENSES,
          value: SENSE.TRUESIGHT,
          source: "Boon of Truesight",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
          duration: {
            kind: STATUS_DURATION_KIND.INFINITE
          },
          rangeFeet: 60
        } satisfies CharacterStatusEntry
      ];
    }

    if (entry.feat === FEATS.BOON_OF_TERROR) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_TERROR),
        isBoonOfTerrorFearlessDescriptionEntry
      );
      const sourceId = `${boonOfTerrorFearlessStatusSourceIdPrefix}${entry.id}`;

      return [
        {
          id: sourceId,
          group: STATUS_ENTRY_GROUP.IMMUNITIES,
          value: CONDITION_NAME.FRIGHTENED,
          source: "Boon of Terror",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
          duration: {
            kind: STATUS_DURATION_KIND.INFINITE
          },
          sourceId,
          description: description.join("\n")
        } satisfies CharacterStatusEntry
      ];
    }

    return [];
  });
}

export function getEpicBoonReactionEntries(
  normalizedFeats: CharacterFeatEntry[],
  getFeatDescription: FeatDescriptionGetter
): ReactionEntry[] {
  const reactions: ReactionEntry[] = [];

  if (
    normalizedFeats.some(
      (entry) => entry.feat === FEATS.BOON_OF_ENERGY_RESISTANCE && entry.boonOfEnergyResistance
    )
  ) {
    reactions.push({
      id: boonOfEnergyResistanceReactionEntryId,
      reaction: REACTION.ENERGY_REDIRECTION,
      name: "Energy Redirection",
      sourceType: "feat",
      sourceLabel: "Boon of Energy Resistance",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_ENERGY_RESISTANCE),
        isBoonOfEnergyResistanceEnergyRedirectionDescriptionEntry
      )
    });
  }

  if (normalizedFeats.some((entry) => entry.feat === FEATS.BOON_OF_TERROR)) {
    reactions.push({
      id: boonOfTerrorFleeFoolsReactionEntryId,
      reaction: REACTION.FLEE_FOOLS,
      name: "Flee, Fools!",
      sourceType: "feat",
      sourceLabel: "Boon of Terror",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_TERROR),
        isBoonOfTerrorFleeFoolsDescriptionEntry
      )
    });
  }

  if (normalizedFeats.some((entry) => entry.feat === FEATS.BOON_OF_SOUL_DRINKER)) {
    reactions.push({
      id: boonOfSoulDrinkerSiphonLifeReactionEntryId,
      reaction: REACTION.SIPHON_LIFE,
      name: "Siphon Life",
      sourceType: "feat",
      sourceLabel: "Boon of the Soul Drinker",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_SOUL_DRINKER),
        isBoonOfSoulDrinkerSiphonLifeDescriptionEntry
      )
    });
  }

  return reactions;
}

export function getEpicBoonFeatActionsForCharacter(
  character: FeatRuntimeCharacter,
  derivedState: FeatDerivedState,
  getFeatDescriptionSlice: FeatDescriptionSliceGetter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (derivedState.featSet.has(FEATS.BOON_OF_BRIGHT_SUN)) {
    actions.push(
      createBoonOfBrightSunDaylightPresenceAction(
        character,
        getBoonOfBrightSunDaylightPresenceDescription(
          getFeatDescriptionSlice(
            FEATS.BOON_OF_BRIGHT_SUN,
            isBoonOfBrightSunDaylightPresenceDescriptionEntry
          )
        )
      )
    );
  }

  if (derivedState.hasBoonOfFate) {
    actions.push(
      createBoonOfFateImproveFateAction(
        derivedState.boonOfFateImproveFateRemaining,
        derivedState.boonOfFateImproveFateTotal,
        getFeatDescriptionSlice(FEATS.BOON_OF_FATE, isBoonOfFateImproveFateDescriptionEntry)
      )
    );
  }

  if (derivedState.hasBoonOfFluidForms) {
    actions.push(
      createBoonOfFluidFormsShapechangerAction(
        derivedState.boonOfFluidFormsShapechangerRemaining,
        derivedState.boonOfFluidFormsShapechangerTotal,
        getFeatDescriptionSlice(
          FEATS.BOON_OF_FLUID_FORMS,
          isBoonOfFluidFormsShapechangerDrawerDescriptionEntry
        )
      )
    );
  }

  if (derivedState.hasBoonOfRecovery) {
    actions.push(
      createBoonOfRecoveryRecoverVitalityAction(
        derivedState.boonOfRecoveryDiceRemaining,
        derivedState.boonOfRecoveryDiceTotal,
        getFeatDescriptionSlice(
          FEATS.BOON_OF_RECOVERY,
          isBoonOfRecoveryRecoverVitalityDescriptionEntry
        )
      )
    );
  }

  return actions;
}
