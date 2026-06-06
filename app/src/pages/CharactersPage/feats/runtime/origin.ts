import { FEATS, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { CharacterFeatEntry } from "../../../../types";
import type { FeatureActionCard } from "../../classFeatures/types";
import {
  createCultOfDragonInitiateDragonsTerrorAction,
  createCultOfDragonInitiateInspiredByFearAction,
  createLuckyAction
} from "./actions";
import {
  isCultOfDragonInitiateDragonsTerrorDescriptionEntry,
  isCultOfDragonInitiateInspiredByFearDescriptionEntry
} from "./descriptionMatchers";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

type FeatDescriptionSliceGetter = (
  feat: FEATS,
  predicate: (entry: string) => boolean
) => SpellDescriptionEntry[];

export type OriginFeatResourceState = {
  hasCultOfDragonInitiate: boolean;
  hasLucky: boolean;
  luckyPointsRemaining: number;
  luckyPointsTotal: number;
  cultOfDragonInitiateInspiredByFearRemaining: number;
  cultOfDragonInitiateInspiredByFearTotal: number;
};

function getFeatProficiencyBonusForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function getLuckyPointsExpended(normalizedFeats: CharacterFeatEntry[], total: number): number {
  const luckyEntry = normalizedFeats.find((entry) => entry.feat === FEATS.LUCKY);
  const pointsExpended = luckyEntry?.lucky?.pointsExpended ?? 0;

  return Math.max(0, Math.min(total, Math.floor(pointsExpended)));
}

export function getOriginFeatResourceState(
  normalizedFeats: CharacterFeatEntry[],
  featSet: ReadonlySet<FEATS>,
  level: number
): OriginFeatResourceState {
  const luckyPointsTotal = featSet.has(FEATS.LUCKY)
    ? getFeatProficiencyBonusForLevel(level)
    : 0;
  const luckyPointsExpended = getLuckyPointsExpended(normalizedFeats, luckyPointsTotal);
  const cultOfDragonInitiateInspiredByFearTotal = featSet.has(
    FEATS.CULT_OF_THE_DRAGON_INITIATE
  )
    ? 1
    : 0;
  const cultOfDragonInitiateInspiredByFearExpended = normalizedFeats.some(
    (entry) =>
      entry.feat === FEATS.CULT_OF_THE_DRAGON_INITIATE &&
      entry.cultOfDragonInitiate?.inspiredByFearExpended === true
  );

  return {
    hasCultOfDragonInitiate: featSet.has(FEATS.CULT_OF_THE_DRAGON_INITIATE),
    hasLucky: featSet.has(FEATS.LUCKY),
    luckyPointsRemaining: Math.max(0, luckyPointsTotal - luckyPointsExpended),
    luckyPointsTotal,
    cultOfDragonInitiateInspiredByFearRemaining:
      cultOfDragonInitiateInspiredByFearTotal > 0 &&
      !cultOfDragonInitiateInspiredByFearExpended
        ? 1
        : 0,
    cultOfDragonInitiateInspiredByFearTotal
  };
}

export function getOriginFeatHitPointMaximumBonus(
  featSet: ReadonlySet<FEATS>,
  level: number
): number {
  return featSet.has(FEATS.TOUGH) ? level * 2 : 0;
}

export function getOriginFeatActionsForCharacter(
  character: FeatRuntimeCharacter,
  derivedState: FeatDerivedState,
  getFeatDescriptionSlice: FeatDescriptionSliceGetter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (derivedState.hasLucky) {
    actions.push(
      createLuckyAction(
        derivedState.luckyPointsRemaining,
        derivedState.luckyPointsTotal,
        getFeatDescriptionSlice(FEATS.LUCKY, () => true)
      )
    );
  }

  if (derivedState.hasCultOfDragonInitiate) {
    actions.push(
      createCultOfDragonInitiateDragonsTerrorAction(
        character,
        derivedState.normalizedFeats,
        getFeatDescriptionSlice(
          FEATS.CULT_OF_THE_DRAGON_INITIATE,
          isCultOfDragonInitiateDragonsTerrorDescriptionEntry
        )
      ),
      createCultOfDragonInitiateInspiredByFearAction(
        derivedState.cultOfDragonInitiateInspiredByFearRemaining,
        derivedState.cultOfDragonInitiateInspiredByFearTotal,
        getFeatDescriptionSlice(
          FEATS.CULT_OF_THE_DRAGON_INITIATE,
          isCultOfDragonInitiateInspiredByFearDescriptionEntry
        )
      )
    );
  }

  return actions;
}
