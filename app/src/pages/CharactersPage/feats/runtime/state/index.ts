import { getProficiencyBonus } from "../../../proficiencyBonus";
import { getProficiencyNormalizationLimit } from "../../../statOverrides";
import { applyFeatContribution } from "../contributions";
import {
  magicInitiateFreeCastContributionId,
  feyTouchedFreeCastContributionId,
  shadowTouchedFreeCastContributionId,
  telepathicDetectThoughtsFreeCastContributionId,
  boonOfRevelryIrresistibleDanceFreeCastContributionId
} from "../contributions/spellGrants";
import { getCharacterLevel } from "../../../multiclassState";
import { type SpellDescriptionEntry } from "../../../../../codex/entries";
import { FEATS, WEAPON_COMBAT_TYPE } from "../../../../../codex/entries/enums";

import type { AbilityKey, CharacterFeatEntry } from "../../../../../types";
import { ECONOMY_TYPE } from "../../../actionEconomy";
import { createChargesCardUsage } from "../../../classFeatures/cardUsage";
import {
  compileFeatureContributions,
  collectFeatureFreeCastEntries,
  getFeatureDescriptionAdditions,
  getFeatureFreeCastEntriesById,
  type CompiledFeatureContributionState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { normalizeCharacterFeats } from "../..";
import { getFeatDefinition, getFeatLabel } from "../../catalog";
import {
  getEpicBoonDerivedStatusEntries,
  getEpicBoonFeatActionsForCharacter,
  getEpicBoonFeatHitPointMaximumBonus,
  getEpicBoonFeatResourceState,
  getEpicBoonFeatSpeedBonuses,
  getEpicBoonReactionEntries
} from "../epicBoon";
import {
  getFightingStyleDerivedStatusEntries,
  getFightingStyleReactionEntries,
  hasDefenseFightingStyle
} from "../fightingStyle";
import { getBoonOfFuriousStormResistanceStatusEntries } from "../furiousStorm";
import { getBoonOfSoulDrinkerResistanceStatusEntries } from "../soulDrinker";
import {
  getGeneralFeatReactionEntries,
  getGeneralFeatResourceState,
  getGeneralFeatActionsForCharacter,
  getGeneralFeatSpeedBonuses
} from "../general";
import {
  getOriginFeatActionsForCharacter,
  getOriginFeatHitPointMaximumBonus,
  getOriginFeatReactionEntries,
  getOriginFeatResourceState
} from "../origin";
import {
  spellfireSparkSacredFlameSpellId,
  spellfireSparkSpellfireFlameResourceId,
  spellfireSparkSpellfireFlameSpellActionPathId,
  spellfireSparkSpellfireFlameSpellCastEffectId
} from "../constants";
import { getFeatCantripEntries } from "../spells";
import { transformFeatSpellEntryForEntries } from "../spellTransforms";
import { filterDescriptionEntries } from "../descriptionMatchers";
import { getFeatDescriptionContributions } from "../descriptionContributions";
import { getDragonscarredResistanceStatusEntries } from "../dragonscarred";
import type { FeatDerivedState, FeatRuntimeCharacter } from "../types";

const featDerivedStateCache = new WeakMap<object, Map<string, FeatDerivedState>>();

function normalizeFeatRuntimeLevel(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.floor(parsed)));
}

function getCachedFeatDerivedState(feats: unknown, cacheKey: string): FeatDerivedState | undefined {
  if (!Array.isArray(feats)) {
    return undefined;
  }

  return featDerivedStateCache.get(feats)?.get(cacheKey);
}

function setCachedFeatDerivedState(feats: unknown, cacheKey: string, state: FeatDerivedState) {
  if (!Array.isArray(feats)) {
    return;
  }

  const cachedByLevel = featDerivedStateCache.get(feats) ?? new Map<string, FeatDerivedState>();

  cachedByLevel.set(cacheKey, state);
  featDerivedStateCache.set(feats, cachedByLevel);
}

export function getFeatDescriptionSlice(
  feat: FEATS,
  predicate: (entry: string) => boolean
): SpellDescriptionEntry[] {
  return filterDescriptionEntries(getFeatDefinition(feat)?.description ?? [], predicate);
}

function createFeatContributionSource(
  entry: CharacterFeatEntry,
  index: number
): FeatureContributionSpec<FeatDerivedState>["source"] {
  return {
    type: "feat",
    id: entry.feat,
    entryId: entry.id,
    label: getFeatLabel(entry.feat),
    order: entry.takenAtLevel + index / 100
  };
}

function createFeatContribution(
  entry: CharacterFeatEntry,
  index: number
): FeatureContributionSpec<FeatDerivedState> {
  return {
    source: createFeatContributionSource(entry, index),
    resources: [],
    actions: [],
    actionFactories: [],
    reactions: [],
    statuses: [],
    descriptionAdditions: [],
    abilityScoreBonuses: [],
    speedBonuses: [],
    spellGrants: [],
    spellTransforms: [],
    spellActionPaths: [],
    spellCastEffects: []
  };
}

function projectFeatSpellcastingAbilityMap(
  compiledState: CompiledFeatureContributionState<FeatDerivedState>,
  predicate: (sourceId: string) => boolean
): Map<string, AbilityKey> {
  const abilityBySpellId = new Map<string, AbilityKey>();

  compiledState.spellcastingAbilityEntries.forEach((entry) => {
    if (predicate(entry.sourceId)) {
      abilityBySpellId.set(entry.spellId, entry.ability);
    }
  });

  return abilityBySpellId;
}

function projectFeatFreeCastEntries(
  compiledState: Pick<CompiledFeatureContributionState<FeatDerivedState>, "freeCastEntries">,
  id: string
): FeatDerivedState["magicInitiateFreeCastEntries"] {
  return getFeatureFreeCastEntriesById(compiledState, id).map((entry) => ({
    featEntryId: entry.entryId ?? entry.sourceId ?? "",
    spellId: entry.spellId,
    expended: entry.expended === true || entry.usesRemaining === 0
  }));
}

function createFeatDerivedState(
  feats: unknown,
  level: number,
  proficiencyBonus: number,
  normalizationLimit?: number
): FeatDerivedState {
  const normalizedFeats = normalizeCharacterFeats(feats, level, normalizationLimit);
  const featsByFeat = new Map<FEATS, CharacterFeatEntry[]>();
  const featSet = new Set<FEATS>();
  const contributions: FeatureContributionSpec<FeatDerivedState>[] = [];
  const featDefinitionCache = new Map<FEATS, SpellDescriptionEntry[]>();
  const getFeatDescription = (feat: FEATS) => {
    const cachedDescription = featDefinitionCache.get(feat);

    if (cachedDescription) {
      return cachedDescription;
    }

    const description = getFeatDefinition(feat)?.description ?? [];
    featDefinitionCache.set(feat, description);
    return description;
  };
  normalizedFeats.forEach((entry, index) => {
    const contribution = createFeatContribution(entry, index);

    const descriptionAdditions = contribution.descriptionAdditions!;

    contributions.push(contribution);
    featSet.add(entry.feat);
    featsByFeat.set(entry.feat, [...(featsByFeat.get(entry.feat) ?? []), entry]);
    descriptionAdditions.push(...getFeatDescriptionContributions(entry.feat));

    const featCantripEntries = getFeatCantripEntries(entry);

    featCantripEntries.forEach((cantrip) => {
      contribution.spellGrants!.push({
        kind: "granted-cantrip",
        spell: cantrip
      });
    });

    applyFeatContribution({
      entry,
      index,
      level,
      proficiencyBonus,
      contribution,
      featCantripEntries,
      getFeatDescription
    });
  });

  const telepathicDetectThoughtsFreeCastEntries = projectFeatFreeCastEntries(
    { freeCastEntries: collectFeatureFreeCastEntries(contributions) },
    telepathicDetectThoughtsFreeCastContributionId
  );
  const originResourceState = getOriginFeatResourceState(
    normalizedFeats,
    featSet,
    proficiencyBonus
  );
  const generalResourceState = getGeneralFeatResourceState(
    normalizedFeats,
    featSet,
    proficiencyBonus,
    telepathicDetectThoughtsFreeCastEntries
  );
  const epicBoonResourceState = getEpicBoonFeatResourceState(normalizedFeats, featSet);
  const hitPointMaximumBonus =
    getOriginFeatHitPointMaximumBonus(featSet, level) +
    getEpicBoonFeatHitPointMaximumBonus(featSet);
  const runtimeContribution: FeatureContributionSpec<FeatDerivedState> = {
    source: {
      type: "feat",
      id: "feat-runtime-aggregates",
      label: "Feat Runtime"
    },
    resources: [
      {
        id: "feat-lucky-points",
        label: "Lucky Points",
        remaining: originResourceState.luckyPointsRemaining,
        total: originResourceState.luckyPointsTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-cult-of-the-dragon-initiate-inspired-by-fear",
        label: "Inspired by Fear",
        remaining: originResourceState.cultOfDragonInitiateInspiredByFearRemaining,
        total: originResourceState.cultOfDragonInitiateInspiredByFearTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-purple-dragon-rook-rallying-cry",
        label: "Rallying Cry",
        remaining: originResourceState.purpleDragonRookRallyingCryRemaining,
        total: originResourceState.purpleDragonRookRallyingCryTotal,
        recovery: "longRest" as const
      },
      {
        id: spellfireSparkSpellfireFlameResourceId,
        label: "Spellfire Flame",
        remaining: originResourceState.spellfireSparkSpellfireFlameRemaining,
        total: originResourceState.spellfireSparkSpellfireFlameTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-fairy-trickster-flustering-strike",
        label: "Flustering Strike",
        remaining: generalResourceState.fairyTricksterFlusteringStrikeRemaining,
        total: generalResourceState.fairyTricksterFlusteringStrikeTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-enclave-magic-two-hearts-one-mind",
        label: "Two Hearts, One Mind",
        remaining: generalResourceState.enclaveMagicTwoHeartsOneMindRemaining,
        total: generalResourceState.enclaveMagicTwoHeartsOneMindTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-genie-magic-wish-magic",
        label: "Wish Magic",
        remaining: generalResourceState.genieMagicWishMagicRemaining,
        total: generalResourceState.genieMagicWishMagicTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-lordly-resolve-standard-bearer",
        label: "Standard Bearer",
        remaining: generalResourceState.lordlyResolveStandardBearerRemaining,
        total: generalResourceState.lordlyResolveStandardBearerTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-mythal-touched-mythal-ward",
        label: "Mythal Ward",
        remaining: generalResourceState.mythalTouchedMythalWardRemaining,
        total: generalResourceState.mythalTouchedMythalWardTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-purple-dragon-commandant-encourage-ally",
        label: "Encourage Ally",
        remaining: generalResourceState.purpleDragonCommandantEncourageAllyRemaining,
        total: generalResourceState.purpleDragonCommandantEncourageAllyTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-boon-of-fate-improve-fate",
        label: "Improve Fate",
        remaining: epicBoonResourceState.boonOfFateImproveFateRemaining,
        total: epicBoonResourceState.boonOfFateImproveFateTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-boon-of-fluid-forms-shapechanger",
        label: "Shapechanger",
        remaining: epicBoonResourceState.boonOfFluidFormsShapechangerRemaining,
        total: epicBoonResourceState.boonOfFluidFormsShapechangerTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-boon-of-recovery-dice",
        label: "Recover Vitality Dice",
        remaining: epicBoonResourceState.boonOfRecoveryDiceRemaining,
        total: epicBoonResourceState.boonOfRecoveryDiceTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-boon-of-recovery-last-stand",
        label: "Last Stand",
        remaining: epicBoonResourceState.boonOfRecoveryLastStandRemaining,
        total: epicBoonResourceState.boonOfRecoveryLastStandTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-boon-of-terror-flee-fools",
        label: "Flee, Fools!",
        remaining: epicBoonResourceState.boonOfTerrorFleeFoolsRemaining,
        total: epicBoonResourceState.boonOfTerrorFleeFoolsTotal,
        recovery: "shortRest" as const
      },
      {
        id: "feat-boon-of-soul-drinker-siphon-life",
        label: "Siphon Life",
        remaining: epicBoonResourceState.boonOfSoulDrinkerSiphonLifeRemaining,
        total: epicBoonResourceState.boonOfSoulDrinkerSiphonLifeTotal,
        recovery: "shortRest" as const
      },
      {
        id: "feat-mage-slayer-guarded-mind",
        label: "Guarded Mind",
        remaining: generalResourceState.mageSlayerGuardedMindRemaining,
        total: generalResourceState.mageSlayerGuardedMindTotal,
        recovery: "shortRest" as const
      },
      {
        id: "feat-ritual-caster-quick-ritual",
        label: "Quick Ritual",
        remaining: generalResourceState.ritualCasterQuickRitualRemaining,
        total: generalResourceState.ritualCasterQuickRitualTotal,
        recovery: "longRest" as const
      },
      {
        id: "feat-telepathic-detect-thoughts",
        label: "Detect Thoughts",
        remaining: generalResourceState.telepathicDetectThoughtsRemaining,
        total: generalResourceState.telepathicDetectThoughtsTotal,
        recovery: "longRest" as const
      }
    ].filter((resource) => resource.total > 0),
    actionFactories: [
      (character, derivedState) =>
        getOriginFeatActionsForCharacter(character, derivedState, getFeatDescriptionSlice),
      (character, derivedState) =>
        getGeneralFeatActionsForCharacter(character, derivedState, getFeatDescriptionSlice),
      (character, derivedState) =>
        getEpicBoonFeatActionsForCharacter(character, derivedState, getFeatDescriptionSlice)
    ],
    reactions: [
      ...getOriginFeatReactionEntries(featSet, getFeatDescriptionSlice),
      ...getGeneralFeatReactionEntries(featSet, getFeatDescription),
      ...getFightingStyleReactionEntries(featSet, getFeatDescription),
      ...getEpicBoonReactionEntries(normalizedFeats, getFeatDescription)
    ],
    statuses: [
      ...getFightingStyleDerivedStatusEntries(normalizedFeats),
      ...getDragonscarredResistanceStatusEntries(normalizedFeats, getFeatDescription),
      ...getBoonOfFuriousStormResistanceStatusEntries(normalizedFeats, getFeatDescription),
      ...getBoonOfSoulDrinkerResistanceStatusEntries(normalizedFeats, getFeatDescription),
      ...getEpicBoonDerivedStatusEntries(normalizedFeats, getFeatDescription)
    ],
    speedBonuses: [...getGeneralFeatSpeedBonuses(featSet), ...getEpicBoonFeatSpeedBonuses(featSet)],
    hitPointMaximumBonus,
    spellTransforms: [
      {
        id: "feat-spell-transforms",
        transform: (spell) =>
          transformFeatSpellEntryForEntries(normalizedFeats, spell, getFeatDescriptionSlice)
      }
    ],
    commonActionTransforms: [
      {
        id: "feat-common-action-description-additions",
        transform: (character, action) => {
          const descriptionAdditions = getFeatureDescriptionAdditions(
            collectFeatDerivedState(character),
            "commonAction",
            {
              targetKey: action.key
            }
          );

          return descriptionAdditions.length > 0
            ? {
                ...action,
                descriptionAdditions: [
                  ...(action.descriptionAdditions ?? []),
                  ...descriptionAdditions
                ]
              }
            : action;
        }
      }
    ],
    weaponActionTransforms: [
      {
        id: "feat-archery-weapon-action-transform",
        transform: (character, action) => {
          const weaponAction = action as {
            attackKind?: string;
            combatType?: WEAPON_COMBAT_TYPE | null;
            attackBonusEntries?: Array<{
              label: string;
              value: number;
            }>;
          };

          if (
            !collectFeatDerivedState(character).featSet.has(FEATS.ARCHERY) ||
            weaponAction.attackKind !== "weapon" ||
            weaponAction.combatType !== WEAPON_COMBAT_TYPE.RANGED
          ) {
            return action;
          }

          return {
            ...(action as object),
            attackBonusEntries: [
              ...(weaponAction.attackBonusEntries ?? []),
              {
                label: getFeatLabel(FEATS.ARCHERY),
                value: 2
              }
            ]
          } as typeof action;
        }
      }
    ],
    spellActionPaths:
      originResourceState.hasSpellfireSpark &&
      originResourceState.spellfireSparkSpellfireFlameTotal > 0
        ? [
            {
              id: spellfireSparkSpellfireFlameSpellActionPathId,
              spellId: spellfireSparkSacredFlameSpellId,
              economyType: ECONOMY_TYPE.BONUS_ACTION,
              actionLabel: "Spellfire Flame",
              getDisabledReason: ({ character, spell }) => {
                const spellfireState = collectFeatDerivedState(character);

                if (spell.id !== spellfireSparkSacredFlameSpellId) {
                  return null;
                }

                return spellfireState.spellfireSparkSpellfireFlameRemaining <= 0
                  ? "Spellfire Flame has no charges remaining."
                  : null;
              },
              getUsage: ({ character }) => {
                const spellfireState = collectFeatDerivedState(character);

                return createChargesCardUsage(
                  spellfireState.spellfireSparkSpellfireFlameRemaining,
                  spellfireState.spellfireSparkSpellfireFlameTotal
                );
              },
              spellCastEffectIds: [spellfireSparkSpellfireFlameSpellCastEffectId]
            }
          ]
        : [],
    spellCastEffects:
      originResourceState.hasSpellfireSpark &&
      originResourceState.spellfireSparkSpellfireFlameTotal > 0
        ? [
            {
              id: spellfireSparkSpellfireFlameSpellCastEffectId
            }
          ]
        : []
  };

  contributions.push(runtimeContribution);
  const compiledContributionState = compileFeatureContributions(contributions);
  const magicInitiateSpellcastingAbilityBySpellId = projectFeatSpellcastingAbilityMap(
    compiledContributionState,
    (sourceId) => sourceId !== FEATS.SPELLFIRE_SPARK
  );
  const spellfireSparkSpellcastingAbilityBySpellId = projectFeatSpellcastingAbilityMap(
    compiledContributionState,
    (sourceId) => sourceId === FEATS.SPELLFIRE_SPARK
  );
  const magicInitiateFreeCastEntries = projectFeatFreeCastEntries(
    compiledContributionState,
    magicInitiateFreeCastContributionId
  );
  const feyTouchedFreeCastEntries = projectFeatFreeCastEntries(
    compiledContributionState,
    feyTouchedFreeCastContributionId
  );
  const shadowTouchedFreeCastEntries = projectFeatFreeCastEntries(
    compiledContributionState,
    shadowTouchedFreeCastContributionId
  );
  const finalTelepathicDetectThoughtsFreeCastEntries = projectFeatFreeCastEntries(
    compiledContributionState,
    telepathicDetectThoughtsFreeCastContributionId
  );
  const boonOfRevelryIrresistibleDanceFreeCastEntries = projectFeatFreeCastEntries(
    compiledContributionState,
    boonOfRevelryIrresistibleDanceFreeCastContributionId
  );

  return {
    contributions: compiledContributionState.contributions,
    resources: compiledContributionState.resources,
    normalizedFeats,
    featsByFeat,
    featSet,
    grantedCantripEntries: compiledContributionState.grantedCantripEntries,
    alwaysPreparedCantripEntries: compiledContributionState.alwaysPreparedCantripEntries,
    alwaysPreparedSpellEntries: compiledContributionState.alwaysPreparedSpellEntries,
    alwaysPreparedSpellSourceMap: compiledContributionState.alwaysPreparedSpellSourceMap,
    spellcastingAbilityEntries: compiledContributionState.spellcastingAbilityEntries,
    spellcastingAbilityBySpellId: compiledContributionState.spellcastingAbilityBySpellId,
    freeCastEntries: compiledContributionState.freeCastEntries,
    descriptionAdditions: compiledContributionState.descriptionAdditions,
    magicInitiateSpellcastingAbilityBySpellId,
    spellfireSparkSpellcastingAbilityBySpellId,
    magicInitiateFreeCastEntries,
    feyTouchedFreeCastEntries,
    shadowTouchedFreeCastEntries,
    telepathicDetectThoughtsFreeCastEntries: finalTelepathicDetectThoughtsFreeCastEntries,
    boonOfRevelryIrresistibleDanceFreeCastEntries,
    abilityScoreBonuses: compiledContributionState.abilityScoreBonuses,
    speedBonuses: compiledContributionState.speedBonuses,
    hitPointMaximumBonus: compiledContributionState.hitPointMaximumBonus,
    derivedStatusEntries: compiledContributionState.statuses,
    actions: compiledContributionState.actions,
    actionFactories: compiledContributionState.actionFactories,
    reactionEntries: compiledContributionState.reactions,
    spellTransforms: compiledContributionState.spellTransforms,
    commonActionTransforms: compiledContributionState.commonActionTransforms,
    weaponActionTransforms: compiledContributionState.weaponActionTransforms,
    itemDescriptionTransforms: compiledContributionState.itemDescriptionTransforms,
    spellActionPaths: compiledContributionState.spellActionPaths,
    spellCastEffects: compiledContributionState.spellCastEffects,
    hasCrafterDiscount: featSet.has(FEATS.CRAFTER),
    hasCultOfDragonInitiate: originResourceState.hasCultOfDragonInitiate,
    hasDefenseFightingStyle: hasDefenseFightingStyle(featSet),
    hasEnclaveMagic: generalResourceState.hasEnclaveMagic,
    hasFairyTrickster: generalResourceState.hasFairyTrickster,
    hasGenieMagic: generalResourceState.hasGenieMagic,
    hasHealer: featSet.has(FEATS.HEALER),
    hasFeyTouched: featSet.has(FEATS.FEY_TOUCHED),
    hasBoonOfFate: epicBoonResourceState.hasBoonOfFate,
    hasBoonOfFluidForms: epicBoonResourceState.hasBoonOfFluidForms,
    hasBoonOfRecovery: epicBoonResourceState.hasBoonOfRecovery,
    hasBoonOfSoulDrinker: epicBoonResourceState.hasBoonOfSoulDrinker,
    hasBoonOfSpellRecall: epicBoonResourceState.hasBoonOfSpellRecall,
    hasBoonOfTerror: epicBoonResourceState.hasBoonOfTerror,
    hasLucky: originResourceState.hasLucky,
    hasLordlyResolve: generalResourceState.hasLordlyResolve,
    hasMageSlayer: generalResourceState.hasMageSlayer,
    hasMagicInitiate: featSet.has(FEATS.MAGIC_INITIATE),
    hasMythalTouched: generalResourceState.hasMythalTouched,
    hasPurpleDragonCommandant: generalResourceState.hasPurpleDragonCommandant,
    hasPurpleDragonRook: originResourceState.hasPurpleDragonRook,
    hasRitualCaster: generalResourceState.hasRitualCaster,
    hasShadowTouched: featSet.has(FEATS.SHADOW_TOUCHED),
    hasSpellfireSpark: originResourceState.hasSpellfireSpark,
    hasTelepathic: generalResourceState.hasTelepathic,
    luckyPointsRemaining: originResourceState.luckyPointsRemaining,
    luckyPointsTotal: originResourceState.luckyPointsTotal,
    cultOfDragonInitiateInspiredByFearRemaining:
      originResourceState.cultOfDragonInitiateInspiredByFearRemaining,
    cultOfDragonInitiateInspiredByFearTotal:
      originResourceState.cultOfDragonInitiateInspiredByFearTotal,
    purpleDragonRookRallyingCryRemaining: originResourceState.purpleDragonRookRallyingCryRemaining,
    purpleDragonRookRallyingCryTotal: originResourceState.purpleDragonRookRallyingCryTotal,
    spellfireSparkSpellfireFlameRemaining:
      originResourceState.spellfireSparkSpellfireFlameRemaining,
    spellfireSparkSpellfireFlameTotal: originResourceState.spellfireSparkSpellfireFlameTotal,
    fairyTricksterFlusteringStrikeRemaining:
      generalResourceState.fairyTricksterFlusteringStrikeRemaining,
    fairyTricksterFlusteringStrikeTotal: generalResourceState.fairyTricksterFlusteringStrikeTotal,
    enclaveMagicTwoHeartsOneMindRemaining:
      generalResourceState.enclaveMagicTwoHeartsOneMindRemaining,
    enclaveMagicTwoHeartsOneMindTotal: generalResourceState.enclaveMagicTwoHeartsOneMindTotal,
    genieMagicWishMagicRemaining: generalResourceState.genieMagicWishMagicRemaining,
    genieMagicWishMagicTotal: generalResourceState.genieMagicWishMagicTotal,
    lordlyResolveStandardBearerRemaining: generalResourceState.lordlyResolveStandardBearerRemaining,
    lordlyResolveStandardBearerTotal: generalResourceState.lordlyResolveStandardBearerTotal,
    boonOfFateImproveFateRemaining: epicBoonResourceState.boonOfFateImproveFateRemaining,
    boonOfFateImproveFateTotal: epicBoonResourceState.boonOfFateImproveFateTotal,
    boonOfFluidFormsShapechangerRemaining:
      epicBoonResourceState.boonOfFluidFormsShapechangerRemaining,
    boonOfFluidFormsShapechangerTotal: epicBoonResourceState.boonOfFluidFormsShapechangerTotal,
    boonOfRecoveryDiceRemaining: epicBoonResourceState.boonOfRecoveryDiceRemaining,
    boonOfRecoveryDiceTotal: epicBoonResourceState.boonOfRecoveryDiceTotal,
    boonOfRecoveryLastStandRemaining: epicBoonResourceState.boonOfRecoveryLastStandRemaining,
    boonOfRecoveryLastStandTotal: epicBoonResourceState.boonOfRecoveryLastStandTotal,
    boonOfSoulDrinkerSiphonLifeRemaining:
      epicBoonResourceState.boonOfSoulDrinkerSiphonLifeRemaining,
    boonOfSoulDrinkerSiphonLifeTotal: epicBoonResourceState.boonOfSoulDrinkerSiphonLifeTotal,
    boonOfTerrorFleeFoolsRemaining: epicBoonResourceState.boonOfTerrorFleeFoolsRemaining,
    boonOfTerrorFleeFoolsTotal: epicBoonResourceState.boonOfTerrorFleeFoolsTotal,
    mageSlayerGuardedMindRemaining: generalResourceState.mageSlayerGuardedMindRemaining,
    mageSlayerGuardedMindTotal: generalResourceState.mageSlayerGuardedMindTotal,
    mythalTouchedMythalWardRemaining: generalResourceState.mythalTouchedMythalWardRemaining,
    mythalTouchedMythalWardTotal: generalResourceState.mythalTouchedMythalWardTotal,
    purpleDragonCommandantEncourageAllyRemaining:
      generalResourceState.purpleDragonCommandantEncourageAllyRemaining,
    purpleDragonCommandantEncourageAllyTotal:
      generalResourceState.purpleDragonCommandantEncourageAllyTotal,
    ritualCasterQuickRitualRemaining: generalResourceState.ritualCasterQuickRitualRemaining,
    ritualCasterQuickRitualTotal: generalResourceState.ritualCasterQuickRitualTotal,
    telepathicDetectThoughtsRemaining: generalResourceState.telepathicDetectThoughtsRemaining,
    telepathicDetectThoughtsTotal: generalResourceState.telepathicDetectThoughtsTotal
  };
}

export function collectFeatDerivedState(character: FeatRuntimeCharacter): FeatDerivedState {
  const level = normalizeFeatRuntimeLevel(getCharacterLevel(character));
  const proficiencyBonus = getProficiencyBonus(character);
  const normalizationLimit = getProficiencyNormalizationLimit(character);
  const cacheKey = `${level}:${proficiencyBonus}:${normalizationLimit ?? "default"}`;
  const cachedState = getCachedFeatDerivedState(character.feats, cacheKey);

  if (cachedState) {
    return cachedState;
  }

  const state = createFeatDerivedState(
    character.feats,
    level,
    proficiencyBonus,
    normalizationLimit
  );

  setCachedFeatDerivedState(character.feats, cacheKey, state);
  return state;
}

export function getNormalizedFeatsForCharacter(character: FeatRuntimeCharacter) {
  return collectFeatDerivedState(character).normalizedFeats;
}

export function hasFeatForCharacter(character: FeatRuntimeCharacter, feat: FEATS): boolean {
  return collectFeatDerivedState(character).featSet.has(feat);
}
