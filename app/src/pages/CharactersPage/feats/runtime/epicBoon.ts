import {
  FEATS,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import {
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
  boonOfEnergyResistanceReactionEntryId,
  boonOfNightSpiritStatusSourceId
} from "./constants";
import {
  filterDescriptionEntries,
  isBoonOfEnergyResistanceEnergyRedirectionDescriptionEntry,
  isBoonOfFateImproveFateDescriptionEntry,
  isBoonOfNightSpiritDescriptionEntry,
  isBoonOfRecoveryRecoverVitalityDescriptionEntry
} from "./descriptionMatchers";
import type { FeatDerivedState } from "./types";

type FeatDescriptionGetter = (feat: FEATS) => SpellDescriptionEntry[];
type FeatDescriptionSliceGetter = (
  feat: FEATS,
  predicate: (entry: string) => boolean
) => SpellDescriptionEntry[];

export type EpicBoonFeatResourceState = {
  hasBoonOfFate: boolean;
  hasBoonOfRecovery: boolean;
  hasBoonOfSpellRecall: boolean;
  boonOfFateImproveFateRemaining: number;
  boonOfFateImproveFateTotal: number;
  boonOfRecoveryDiceRemaining: number;
  boonOfRecoveryDiceTotal: number;
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
  const boonOfRecoveryDiceTotal = featSet.has(FEATS.BOON_OF_RECOVERY) ? 10 : 0;
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

  return {
    hasBoonOfFate: featSet.has(FEATS.BOON_OF_FATE),
    hasBoonOfRecovery: featSet.has(FEATS.BOON_OF_RECOVERY),
    hasBoonOfSpellRecall: featSet.has(FEATS.BOON_OF_SPELL_RECALL),
    boonOfFateImproveFateRemaining:
      boonOfFateImproveFateTotal > 0 && !boonOfFateImproveFateExpended ? 1 : 0,
    boonOfFateImproveFateTotal,
    boonOfRecoveryDiceRemaining: Math.max(
      0,
      boonOfRecoveryDiceTotal - boonOfRecoveryDiceExpended
    ),
    boonOfRecoveryDiceTotal
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

    return [];
  });
}

export function getEpicBoonReactionEntries(
  normalizedFeats: CharacterFeatEntry[],
  getFeatDescription: FeatDescriptionGetter
): ReactionEntry[] {
  if (
    !normalizedFeats.some(
      (entry) => entry.feat === FEATS.BOON_OF_ENERGY_RESISTANCE && entry.boonOfEnergyResistance
    )
  ) {
    return [];
  }

  return [
    {
      id: boonOfEnergyResistanceReactionEntryId,
      reaction: REACTION.ENERGY_REDIRECTION,
      name: "Energy Redirection",
      sourceType: "feat",
      sourceLabel: "Boon of Energy Resistance",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_ENERGY_RESISTANCE),
        isBoonOfEnergyResistanceEnergyRedirectionDescriptionEntry
      )
    }
  ];
}

export function getEpicBoonFeatActionsForCharacter(
  derivedState: FeatDerivedState,
  getFeatDescriptionSlice: FeatDescriptionSliceGetter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (derivedState.hasBoonOfFate) {
    actions.push(
      createBoonOfFateImproveFateAction(
        derivedState.boonOfFateImproveFateRemaining,
        derivedState.boonOfFateImproveFateTotal,
        getFeatDescriptionSlice(FEATS.BOON_OF_FATE, isBoonOfFateImproveFateDescriptionEntry)
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
