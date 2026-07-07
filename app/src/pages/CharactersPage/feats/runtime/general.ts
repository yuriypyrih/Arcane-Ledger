import {
  FEATS,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import type { CharacterFeatEntry } from "../../../../types";
import type { FeatureActionCard, FeatureSpeedBonus } from "../../classFeatures/types";
import { getProficiencyBonus } from "../../gameplay";
import {
  createDurableSpeedyRecoveryAction,
  createFairyTricksterFlusteringStrikeAction,
  createTelekineticShoveAction
} from "./actions";
import {
  defensiveDuelistParryReactionEntryId,
  polearmMasterReactiveStrikeReactionEntryId,
  shieldMasterReactionEntryId,
  warCasterReactiveSpellReactionEntryId
} from "./constants";
import {
  filterDescriptionEntries,
  isDefensiveDuelistParryDescriptionEntry,
  isDurableSpeedyRecoveryDescriptionEntry,
  isFairyTricksterFlusteringStrikeDescriptionEntry,
  isPolearmMasterReactiveStrikeDescriptionEntry,
  isShieldMasterInterposeShieldDescriptionEntry,
  isTelekineticShoveDescriptionEntry,
  isWarCasterReactiveSpellDescriptionEntry
} from "./descriptionMatchers";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

type FeatDescriptionGetter = (feat: FEATS) => SpellDescriptionEntry[];
type FeatDescriptionSliceGetter = (
  feat: FEATS,
  predicate: (entry: string) => boolean
) => SpellDescriptionEntry[];

export type GeneralFeatResourceState = {
  hasFairyTrickster: boolean;
  hasMageSlayer: boolean;
  hasRitualCaster: boolean;
  hasTelepathic: boolean;
  fairyTricksterFlusteringStrikeRemaining: number;
  fairyTricksterFlusteringStrikeTotal: number;
  mageSlayerGuardedMindRemaining: number;
  mageSlayerGuardedMindTotal: number;
  ritualCasterQuickRitualRemaining: number;
  ritualCasterQuickRitualTotal: number;
  telepathicDetectThoughtsRemaining: number;
  telepathicDetectThoughtsTotal: number;
};

export function getGeneralFeatResourceState(
  normalizedFeats: CharacterFeatEntry[],
  featSet: ReadonlySet<FEATS>,
  level: number,
  telepathicDetectThoughtsFreeCastEntries: FeatDerivedState["telepathicDetectThoughtsFreeCastEntries"]
): GeneralFeatResourceState {
  const fairyTricksterFlusteringStrikeTotal = featSet.has(FEATS.FAIRY_TRICKSTER)
    ? getProficiencyBonus(level)
    : 0;
  const fairyTricksterFlusteringStrikeExpended = Math.max(
    0,
    Math.min(
      fairyTricksterFlusteringStrikeTotal,
      normalizedFeats.reduce(
        (total, entry) =>
          entry.feat === FEATS.FAIRY_TRICKSTER
            ? total + (entry.fairyTrickster?.flusteringStrikeExpended ?? 0)
            : total,
        0
      )
    )
  );
  const mageSlayerGuardedMindTotal = featSet.has(FEATS.MAGE_SLAYER) ? 1 : 0;
  const mageSlayerGuardedMindExpended = normalizedFeats.some(
    (entry) => entry.feat === FEATS.MAGE_SLAYER && entry.mageSlayer?.guardedMindExpended === true
  );
  const ritualCasterEntries = normalizedFeats.filter(
    (entry) => entry.feat === FEATS.RITUAL_CASTER && entry.ritualCaster
  );
  const ritualCasterQuickRitualTotal = ritualCasterEntries.length;
  const ritualCasterQuickRitualExpended = ritualCasterEntries.filter(
    (entry) => entry.ritualCaster?.quickRitualExpended === true
  ).length;
  const telepathicDetectThoughtsTotal = telepathicDetectThoughtsFreeCastEntries.length;
  const telepathicDetectThoughtsExpended = telepathicDetectThoughtsFreeCastEntries.filter(
    (entry) => entry.expended
  ).length;

  return {
    hasFairyTrickster: featSet.has(FEATS.FAIRY_TRICKSTER),
    hasMageSlayer: featSet.has(FEATS.MAGE_SLAYER),
    hasRitualCaster: featSet.has(FEATS.RITUAL_CASTER),
    hasTelepathic: featSet.has(FEATS.TELEPATHIC),
    fairyTricksterFlusteringStrikeRemaining: Math.max(
      0,
      fairyTricksterFlusteringStrikeTotal - fairyTricksterFlusteringStrikeExpended
    ),
    fairyTricksterFlusteringStrikeTotal,
    mageSlayerGuardedMindRemaining:
      mageSlayerGuardedMindTotal > 0 && !mageSlayerGuardedMindExpended ? 1 : 0,
    mageSlayerGuardedMindTotal,
    ritualCasterQuickRitualRemaining: Math.max(
      0,
      ritualCasterQuickRitualTotal - ritualCasterQuickRitualExpended
    ),
    ritualCasterQuickRitualTotal,
    telepathicDetectThoughtsRemaining: Math.max(
      0,
      telepathicDetectThoughtsTotal - telepathicDetectThoughtsExpended
    ),
    telepathicDetectThoughtsTotal
  };
}

export function getGeneralFeatSpeedBonuses(
  featSet: ReadonlySet<FEATS>
): FeatureSpeedBonus[] {
  const speedBonuses: FeatureSpeedBonus[] = [];

  if (featSet.has(FEATS.ATHLETE)) {
    speedBonuses.push({
      label: "Athlete",
      movementType: "climb",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

  if (featSet.has(FEATS.SPEEDY)) {
    speedBonuses.push({
      label: "Speedy: Speed Increase",
      movementType: "walk",
      value: 10
    });
  }

  return speedBonuses;
}

export function getGeneralFeatReactionEntries(
  featSet: ReadonlySet<FEATS>,
  getFeatDescription: FeatDescriptionGetter
): ReactionEntry[] {
  const reactionEntries: ReactionEntry[] = [];

  if (featSet.has(FEATS.DEFENSIVE_DUELIST)) {
    reactionEntries.push({
      id: defensiveDuelistParryReactionEntryId,
      reaction: REACTION.PARRY,
      name: "Parry",
      sourceType: "feat",
      sourceLabel: "Defensive Duelist",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.DEFENSIVE_DUELIST),
        isDefensiveDuelistParryDescriptionEntry
      )
    });
  }

  if (featSet.has(FEATS.POLEARM_MASTER)) {
    reactionEntries.push({
      id: polearmMasterReactiveStrikeReactionEntryId,
      reaction: REACTION.REACTIVE_STRIKE,
      name: "Reactive Strike",
      sourceType: "feat",
      sourceLabel: "Polearm Master",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.POLEARM_MASTER),
        isPolearmMasterReactiveStrikeDescriptionEntry
      )
    });
  }

  if (featSet.has(FEATS.SHIELD_MASTER)) {
    reactionEntries.push({
      id: shieldMasterReactionEntryId,
      reaction: REACTION.SHIELD_MASTER,
      name: "Shield Master",
      sourceType: "feat",
      sourceLabel: "Shield Master",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.SHIELD_MASTER),
        isShieldMasterInterposeShieldDescriptionEntry
      )
    });
  }

  if (featSet.has(FEATS.WAR_CASTER)) {
    reactionEntries.push({
      id: warCasterReactiveSpellReactionEntryId,
      reaction: REACTION.REACTIVE_SPELL,
      name: "Reactive Spell",
      sourceType: "feat",
      sourceLabel: "War Caster",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.WAR_CASTER),
        isWarCasterReactiveSpellDescriptionEntry
      )
    });
  }

  return reactionEntries;
}

export function getGeneralFeatActionsForCharacter(
  character: FeatRuntimeCharacter,
  derivedState: FeatDerivedState,
  getFeatDescriptionSlice: FeatDescriptionSliceGetter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];
  const telekineticEntry = derivedState.normalizedFeats.find(
    (entry) => entry.feat === FEATS.TELEKINETIC && entry.telekinetic
  );
  const fairyTricksterEntry = derivedState.normalizedFeats.find(
    (entry) => entry.feat === FEATS.FAIRY_TRICKSTER
  );

  if (telekineticEntry?.telekinetic) {
    actions.push(
      createTelekineticShoveAction(
        character,
        telekineticEntry.telekinetic.ability,
        derivedState.normalizedFeats,
        getFeatDescriptionSlice(FEATS.TELEKINETIC, isTelekineticShoveDescriptionEntry)
      )
    );
  }

  if (derivedState.hasFairyTrickster) {
    actions.push(
      createFairyTricksterFlusteringStrikeAction(
        character,
        fairyTricksterEntry?.epicBoonAbilityChoice?.ability ?? "DEX",
        derivedState.normalizedFeats,
        derivedState.fairyTricksterFlusteringStrikeRemaining,
        derivedState.fairyTricksterFlusteringStrikeTotal,
        getFeatDescriptionSlice(
          FEATS.FAIRY_TRICKSTER,
          isFairyTricksterFlusteringStrikeDescriptionEntry
        )
      )
    );
  }

  if (derivedState.featSet.has(FEATS.DURABLE)) {
    actions.push(
      createDurableSpeedyRecoveryAction(
        character,
        getFeatDescriptionSlice(FEATS.DURABLE, isDurableSpeedyRecoveryDescriptionEntry)
      )
    );
  }

  return actions;
}
